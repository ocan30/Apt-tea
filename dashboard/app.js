/* ===========================================================
 * Apt Tea Dashboard - frontend logic
 * Connects to the local backend (server.js) which wraps the
 * Circle Developer-Controlled Wallets SDK.
 * ===========================================================
 */

// ---------- Config ----------
const DEFAULT_API = 'http://localhost:3000';
const LS_API_KEY = 'aptTea.apiBase';
const LS_THEME = 'aptTea.theme';

let API_BASE = localStorage.getItem(LS_API_KEY) || DEFAULT_API;

// ---------- Theme ----------
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeIcon.innerHTML = theme === 'dark' ? '&#9728;' : '&#9790;';
    localStorage.setItem(LS_THEME, theme);
}
themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem(LS_THEME) || 'light');

// ---------- Sidebar / Nav ----------
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const pageTitle = document.getElementById('pageTitle');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.dataset.page;
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        pages.forEach(p => p.classList.toggle('active', p.dataset.page === target));
        pageTitle.textContent = item.querySelector('.nav-text').textContent;
        sidebar.classList.remove('open');
        if (target === 'wallets') loadWallets();
        if (target === 'transfer') populateWalletSelect();
    });
});

// ---------- API helpers ----------
async function api(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(body?.error?.message || `HTTP ${res.status}`);
    }
    return body;
}

// ---------- Health ----------
async function checkHealth() {
    const statusEl = document.getElementById('backendStatus');
    const healthStatus = document.getElementById('healthStatus');
    const healthChain = document.getElementById('healthChain');
    const healthAccount = document.getElementById('healthAccount');
    const chainBadge = document.getElementById('chainBadge');
    try {
        const h = await api('/api/health');
        statusEl.textContent = 'online';
        statusEl.style.color = '#10b981';
        healthStatus.textContent = 'online';
        healthStatus.style.color = '#10b981';
        healthChain.textContent = h.blockchain;
        healthAccount.textContent = h.accountType;
        chainBadge.textContent = h.blockchain;
    } catch (err) {
        statusEl.textContent = 'offline';
        statusEl.style.color = '#ef4444';
        healthStatus.textContent = 'offline';
        healthStatus.style.color = '#ef4444';
        healthChain.textContent = '—';
        healthAccount.textContent = '—';
    }
}

// ---------- Wallet Sets + Wallets ----------
async function loadWallets() {
    const setsTbody = document.getElementById('walletSetsTable');
    const walletsTbody = document.getElementById('walletsTable');

    try {
        const sets = await api('/api/wallet-sets');
        const list = sets.walletSets || [];
        document.getElementById('walletSetCount').textContent = list.length;

        if (!list.length) {
            setsTbody.innerHTML = '<tr><td colspan="4" class="empty">No wallet sets yet.</td></tr>';
        } else {
            setsTbody.innerHTML = list.map(s => `
                <tr>
                    <td><strong>${escapeHtml(s.name || 'Unnamed')}</strong></td>
                    <td><code>${shortId(s.id)}</code></td>
                    <td>${fmtDate(s.createDate)}</td>
                    <td><button class="btn btn-ghost" onclick="createWalletInSet('${s.id}')">+ Wallet</button></td>
                </tr>
            `).join('');
        }

        const wallets = await api('/api/wallets');
        const wlist = wallets.wallets || [];
        document.getElementById('walletCount').textContent = wlist.length;

        if (!wlist.length) {
            walletsTbody.innerHTML = '<tr><td colspan="5" class="empty">No wallets yet.</td></tr>';
        } else {
            walletsTbody.innerHTML = wlist.map(w => `
                <tr>
                    <td><code title="${w.address}">${shortAddr(w.address)}</code></td>
                    <td>${w.blockchain}</td>
                    <td>${w.accountType}</td>
                    <td><span class="balance" data-wallet-id="${w.id}">—</span></td>
                    <td>
                        <button class="btn btn-ghost" onclick="refreshBalance('${w.id}')">Balance</button>
                        <button class="btn btn-ghost" onclick="openFaucet('${w.address}')">Faucet</button>
                    </td>
                </tr>
            `).join('');
            // load balances lazily
            wlist.forEach(w => refreshBalance(w.id));
        }
    } catch (err) {
        setsTbody.innerHTML = `<tr><td colspan="4" class="empty error">${escapeHtml(err.message)}</td></tr>`;
    }
}

window.createWalletInSet = async (walletSetId) => {
    try {
        await api('/api/wallets', {
            method: 'POST',
            body: JSON.stringify({ walletSetId, count: 1 }),
        });
        await loadWallets();
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

window.refreshBalance = async (walletId) => {
    const el = document.querySelector(`[data-wallet-id="${walletId}"]`);
    if (el) el.textContent = '...';
    try {
        const res = await api(`/api/wallets/${walletId}/balance`);
        const tokens = res.tokenBalances || [];
        const usdc = tokens.find(t => (t.token?.symbol || '').toUpperCase() === 'USDC');
        if (usdc) {
            if (el) el.textContent = `${fmtAmount(usdc.amount)} USDC`;
        } else if (tokens.length) {
            const t = tokens[0];
            if (el) el.textContent = `${fmtAmount(t.amount)} ${t.token?.symbol || ''}`;
        } else {
            if (el) el.textContent = '0.00';
        }
        updateTotalUsdc();
    } catch (err) {
        if (el) el.textContent = 'err';
    }
};

async function updateTotalUsdc() {
    // sum all wallet USDC balances shown in DOM
    const spans = document.querySelectorAll('[data-wallet-id]');
    let total = 0;
    spans.forEach(s => {
        const m = s.textContent.match(/([\d.]+)\s*USDC/);
        if (m) total += parseFloat(m[1]);
    });
    document.getElementById('totalUsdc').textContent = total.toFixed(2);
}

window.openFaucet = async (address) => {
    try {
        const res = await api('/api/faucet', {
            method: 'POST',
            body: JSON.stringify({ address }),
        });
        window.open(res.faucetUrl, '_blank', 'noopener');
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

// ---------- Create Wallet Set / Wallet buttons ----------
document.getElementById('btnCreateSet').addEventListener('click', async () => {
    const name = prompt('Wallet Set name:', 'Apt Tea Set') || 'Apt Tea Set';
    try {
        await api('/api/wallet-sets', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
        await loadWallets();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

document.getElementById('btnCreateWallet').addEventListener('click', async () => {
    try {
        const sets = await api('/api/wallet-sets');
        const list = sets.walletSets || [];
        if (!list.length) {
            alert('Create a wallet set first.');
            return;
        }
        const walletSetId = list[0].id;
        await api('/api/wallets', {
            method: 'POST',
            body: JSON.stringify({ walletSetId, count: 1 }),
        });
        await loadWallets();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// ---------- Transfer ----------
async function populateWalletSelect() {
    const sel = document.getElementById('transferWallet');
    sel.innerHTML = '<option>Loading...</option>';
    try {
        const res = await api('/api/wallets');
        const list = res.wallets || [];
        if (!list.length) {
            sel.innerHTML = '<option disabled>No wallets. Create one first.</option>';
            return;
        }
        sel.innerHTML = list.map(w =>
            `<option value="${w.id}">${shortAddr(w.address)} — ${w.blockchain}</option>`
        ).join('');
    } catch (err) {
        sel.innerHTML = `<option disabled>${err.message}</option>`;
    }
}

document.getElementById('btnSend').addEventListener('click', async () => {
    const walletId = document.getElementById('transferWallet').value;
    const destinationAddress = document.getElementById('transferDest').value.trim();
    const amount = document.getElementById('transferAmount').value;
    const tokenAddress = document.getElementById('transferTokenAddr').value.trim() || undefined;
    const out = document.getElementById('transferResult');

    if (!walletId || !destinationAddress || !amount) {
        out.textContent = 'Please fill all required fields.';
        out.className = 'result error';
        return;
    }

    out.className = 'result';
    out.textContent = 'Sending...';
    try {
        const res = await api('/api/transfers', {
            method: 'POST',
            body: JSON.stringify({ walletId, destinationAddress, amount, tokenAddress }),
        });
        out.innerHTML = `Submitted. Transaction ID: <code>${res.id}</code><br>State: <strong>${res.state}</strong><br><small>Use the Transactions page to poll status.</small>`;
        out.className = 'result success';
    } catch (err) {
        out.textContent = 'Error: ' + err.message;
        out.className = 'result error';
    }
});

// ---------- Transaction lookup ----------
document.getElementById('btnCheckTx').addEventListener('click', async () => {
    const id = document.getElementById('txId').value.trim();
    const out = document.getElementById('txResult');
    if (!id) { out.textContent = 'Enter a transaction ID.'; out.className = 'result error'; return; }
    out.className = 'result';
    out.textContent = 'Checking...';
    try {
        const res = await api(`/api/transactions/${id}`);
        const t = res.transaction || res;
        out.innerHTML = `
            State: <strong>${t.state}</strong><br>
            Tx Hash: <code>${t.txHash || 'pending'}</code><br>
            Amount: ${(t.amounts || []).join(', ')}<br>
            Created: ${fmtDate(t.createDate)}
        `;
        out.className = 'result success';
    } catch (err) {
        out.textContent = 'Error: ' + err.message;
        out.className = 'result error';
    }
});

// ---------- Settings ----------
const apiBaseInput = document.getElementById('apiBase');
apiBaseInput.value = API_BASE;
document.getElementById('btnSaveApi').addEventListener('click', () => {
    const v = apiBaseInput.value.trim();
    if (v) {
        API_BASE = v;
        localStorage.setItem(LS_API_KEY, v);
        checkHealth();
        alert('Saved. Using: ' + v);
    }
});

// ---------- Utils ----------
function shortAddr(a) { return a ? a.slice(0, 6) + '...' + a.slice(-4) : '—'; }
function shortId(a) { return a ? a.slice(0, 8) + '...' : '—'; }
function fmtDate(s) { try { return new Date(s).toLocaleString(); } catch { return s || '—'; } }
function fmtAmount(a) { const n = parseFloat(a || 0); return isNaN(n) ? '0.00' : n.toFixed(2); }
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    loadWallets();
});
