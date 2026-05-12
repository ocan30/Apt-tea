// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const html = document.documentElement;

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    themeIcon.innerHTML = theme === 'dark' ? '&#9728;' : '&#9790;';
    localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

// ===== Sidebar Toggle (Mobile) =====
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// ===== Navigation =====
const navItems = document.querySelectorAll('.nav-item');
const pageTitle = document.getElementById('pageTitle');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        pageTitle.textContent = item.querySelector('.nav-text').textContent;
        sidebar.classList.remove('open');
    });
});

// ===== Bar Chart (Revenue) =====
function renderBarChart() {
    const svg = document.getElementById('revenueChart');
    const data = [
        { label: 'Mon', value: 4200 },
        { label: 'Tue', value: 5800 },
        { label: 'Wed', value: 3600 },
        { label: 'Thu', value: 7200 },
        { label: 'Fri', value: 6100 },
        { label: 'Sat', value: 8400 },
        { label: 'Sun', value: 5500 }
    ];

    const maxValue = Math.max(...data.map(d => d.value));
    const chartWidth = 600;
    const chartHeight = 180;
    const barWidth = 50;
    const gap = (chartWidth - data.length * barWidth) / (data.length + 1);
    const padding = 20;

    let svgContent = '';

    // Grid lines
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight - padding * 2) * (i / 4);
        svgContent += `<line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="4"/>`;
    }

    // Bars
    data.forEach((d, i) => {
        const x = gap + i * (barWidth + gap);
        const barHeight = ((d.value / maxValue) * (chartHeight - padding * 2));
        const y = chartHeight - padding - barHeight;

        svgContent += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="6" ry="6" fill="var(--accent)" opacity="0.85">
                <animate attributeName="height" from="0" to="${barHeight}" dur="0.6s" fill="freeze"/>
                <animate attributeName="y" from="${chartHeight - padding}" to="${y}" dur="0.6s" fill="freeze"/>
            </rect>
            <text x="${x + barWidth / 2}" y="${chartHeight - 2}" text-anchor="middle" font-size="11" fill="var(--text-secondary)">${d.label}</text>
            <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="10" fill="var(--text-secondary)">$${(d.value / 1000).toFixed(1)}k</text>
        `;
    });

    svg.innerHTML = svgContent;
}

// ===== Donut Chart (Categories) =====
function renderDonutChart() {
    const svg = document.getElementById('categoryChart');
    const legend = document.getElementById('donutLegend');

    const data = [
        { label: 'Green Tea', value: 35, color: '#10b981' },
        { label: 'Black Tea', value: 25, color: '#3b82f6' },
        { label: 'Herbal Tea', value: 20, color: '#f59e0b' },
        { label: 'Oolong', value: 12, color: '#8b5cf6' },
        { label: 'White Tea', value: 8, color: '#ec4899' }
    ];

    const total = data.reduce((sum, d) => sum + d.value, 0);
    const cx = 100, cy = 100, r = 70, innerR = 45;
    let startAngle = -90;
    let svgContent = '';

    data.forEach(d => {
        const angle = (d.value / total) * 360;
        const endAngle = startAngle + angle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);

        const ix1 = cx + innerR * Math.cos(endRad);
        const iy1 = cy + innerR * Math.sin(endRad);
        const ix2 = cx + innerR * Math.cos(startRad);
        const iy2 = cy + innerR * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

        svgContent += `<path d="${path}" fill="${d.color}" opacity="0.9">
            <animate attributeName="opacity" from="0" to="0.9" dur="0.5s" fill="freeze"/>
        </path>`;

        startAngle = endAngle;
    });

    // Center text
    svgContent += `<text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text-primary)">${total}%</text>`;
    svgContent += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" fill="var(--text-secondary)">Total Sales</text>`;

    svg.innerHTML = svgContent;

    // Legend
    legend.innerHTML = data.map(d => `
        <div class="legend-item">
            <span class="legend-dot" style="background-color: ${d.color}"></span>
            <span>${d.label} (${d.value}%)</span>
        </div>
    `).join('');
}

// ===== Orders Table =====
function renderOrdersTable() {
    const tbody = document.getElementById('ordersTable');

    const orders = [
        { id: '#ORD-7821', customer: 'Sarah Johnson', product: 'Premium Green Tea Set', amount: '$124.00', status: 'completed', date: '2026-05-12' },
        { id: '#ORD-7820', customer: 'Mike Chen', product: 'Oolong Collection', amount: '$89.50', status: 'shipped', date: '2026-05-11' },
        { id: '#ORD-7819', customer: 'Emma Wilson', product: 'Herbal Blend Box', amount: '$56.00', status: 'pending', date: '2026-05-11' },
        { id: '#ORD-7818', customer: 'James Brown', product: 'Black Tea Sampler', amount: '$72.00', status: 'completed', date: '2026-05-10' },
        { id: '#ORD-7817', customer: 'Lisa Davis', product: 'White Tea Premium', amount: '$145.00', status: 'cancelled', date: '2026-05-10' },
        { id: '#ORD-7816', customer: 'David Kim', product: 'Matcha Starter Kit', amount: '$98.00', status: 'shipped', date: '2026-05-09' },
    ];

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td><strong>${order.amount}</strong></td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>${order.date}</td>
        </tr>
    `).join('');
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    renderBarChart();
    renderDonutChart();
    renderOrdersTable();
});
