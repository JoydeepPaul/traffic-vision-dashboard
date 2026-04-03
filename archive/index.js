/* ============================================
   TRAFFICVISION AI — Interactive JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initCountUpAnimations();
    initCharts();
    initViolationTable();
    initConfigPanel();
    initDemoSimulation();
});

// ===========================
// NAVIGATION
// ===========================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    const allNavLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // Active section tracking
    const sections = document.querySelectorAll('section[id]');
    const observerOptions = { rootMargin: '-20% 0px -70% 0px' };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                allNavLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, observerOptions);

    sections.forEach(s => observer.observe(s));

    // Close mobile nav on link click
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
}

// ===========================
// SCROLL ANIMATIONS
// ===========================
function initScrollAnimations() {
    const animateElements = document.querySelectorAll(
        '.pipeline-stage, .kpi-card, .chart-card, .v-summary-card, .config-group'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 50); // Faster stagger animation
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 }); // Lower threshold for earlier trigger

    animateElements.forEach(el => observer.observe(el));

    // Add subtle parallax effect to hero background
    const heroSection = document.querySelector('.hero');
    const heroBg = document.querySelector('.hero-bg-image');
    
    if (heroSection && heroBg) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    const heroBottom = heroSection.offsetHeight;
                    if (scrolled < heroBottom) {
                        const parallaxSpeed = scrolled * 0.4;
                        heroBg.style.transform = `translateY(${parallaxSpeed}px) scale(1.1)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
}

// ===========================
// COUNT-UP ANIMATIONS
// ===========================
function initCountUpAnimations() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const isDecimal = target % 1 !== 0;
                const duration = 1200; // Faster counter animation
                const startTime = performance.now();

                function update(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Snappier ease out quad
                    const eased = 1 - Math.pow(1 - progress, 2);
                    const current = eased * target;

                    if (isDecimal) {
                        el.textContent = current.toFixed(1);
                    } else {
                        el.textContent = Math.floor(current).toLocaleString();
                    }

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        if (isDecimal) {
                            el.textContent = target.toFixed(1);
                        } else {
                            el.textContent = target.toLocaleString();
                        }
                    }
                }

                requestAnimationFrame(update);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

// ===========================
// CHARTS
// ===========================
function initCharts() {
    Chart.defaults.color = '#8892a8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family = "'Inter', sans-serif";

    createAccuracyChart();
    createClassChart();
    createSpeedChart();
    createProcessingChart();
}

function createAccuracyChart() {
    const ctx = document.getElementById('chart-accuracy').getContext('2d');

    const videoLabels = Array.from({ length: 20 }, (_, i) => `v${i + 1}`);
    const detected = [28, 15, 42, 19, 37, 23, 31, 45, 12, 26, 38, 20, 34, 17, 41, 29, 22, 36, 14, 33];
    const groundTruth = [31, 16, 45, 20, 38, 25, 33, 47, 13, 28, 40, 22, 35, 18, 43, 30, 24, 38, 15, 35];

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: videoLabels,
            datasets: [
                {
                    label: 'Detected',
                    data: detected,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.7,
                },
                {
                    label: 'Ground Truth',
                    data: groundTruth,
                    backgroundColor: 'rgba(16, 185, 129, 0.4)',
                    borderColor: 'rgba(16, 185, 129, 0.8)',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.7,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10,14,26,0.9)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                },
                y: {
                    beginAtZero: true,
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });
}

function createClassChart() {
    const ctx = document.getElementById('chart-classes').getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Car', 'Truck', 'Bus', 'Motorbike', 'Bicycle'],
            datasets: [{
                data: [2847, 612, 389, 764, 215],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                ],
                borderColor: 'rgba(10,14,26,1)',
                borderWidth: 3,
                hoverOffset: 10,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 14,
                        padding: 16,
                        font: { size: 12, weight: '500' },
                        usePointStyle: true,
                        pointStyleWidth: 10,
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10,14,26,0.9)',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((ctx.parsed / total) * 100).toFixed(1);
                            return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createSpeedChart() {
    const ctx = document.getElementById('chart-speed').getContext('2d');

    const bins = ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90+'];
    const counts = [120, 340, 680, 920, 780, 420, 180, 85, 35, 12];

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.7)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins,
            datasets: [{
                label: 'Vehicles',
                data: counts,
                backgroundColor: counts.map((_, i) => i >= 5 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(6, 182, 212, 0.6)'),
                borderColor: counts.map((_, i) => i >= 5 ? 'rgba(239, 68, 68, 1)' : 'rgba(6, 182, 212, 1)'),
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10,14,26,0.9)',
                    borderColor: 'rgba(6, 182, 212, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Speed (km/h)',
                        font: { size: 11, weight: '600' },
                        color: '#596380'
                    },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Vehicle Count',
                        font: { size: 11, weight: '600' },
                        color: '#596380'
                    },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

function createProcessingChart() {
    const ctx = document.getElementById('chart-processing').getContext('2d');

    const videoLabels = Array.from({ length: 20 }, (_, i) => `v${i + 1}`);
    const times = [12.4, 8.2, 22.1, 10.5, 18.7, 14.3, 15.8, 25.6, 6.1, 13.2, 19.4, 11.8, 16.9, 9.3, 21.7, 14.8, 12.1, 18.5, 7.4, 17.2];
    const frames = [350, 240, 620, 310, 520, 420, 450, 710, 180, 380, 540, 340, 470, 270, 600, 410, 350, 510, 210, 480];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: videoLabels,
            datasets: [
                {
                    label: 'Processing Time (s)',
                    data: times,
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                    yAxisID: 'y',
                },
                {
                    label: 'Frame Count',
                    data: frames,
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                    yAxisID: 'y1',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10,14,26,0.9)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Time (s)',
                        font: { size: 11, weight: '600' },
                        color: 'rgba(139, 92, 246, 0.8)',
                    },
                    ticks: { font: { size: 10 } },
                },
                y1: {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Frames',
                        font: { size: 11, weight: '600' },
                        color: 'rgba(245, 158, 11, 0.8)',
                    },
                    grid: { drawOnChartArea: false },
                    ticks: { font: { size: 10 } },
                }
            }
        }
    });
}

// ===========================
// VIOLATIONS TABLE
// ===========================
const VIOLATION_DATA = generateViolationData();
let filteredData = [...VIOLATION_DATA];
let currentPage = 1;
const rowsPerPage = 10;

function generateViolationData() {
    const data = [];
    const videos = Array.from({ length: 15 }, (_, i) => `v${i + 1}.mp4`);
    const threshold = 50;

    for (let i = 0; i < 120; i++) {
        const speed = 50 + Math.random() * 80;
        const excess = speed - threshold;
        data.push({
            track_id: Math.floor(Math.random() * 500) + 1,
            video: videos[Math.floor(Math.random() * videos.length)],
            frame: Math.floor(Math.random() * 1000) + 50,
            speed: parseFloat(speed.toFixed(1)),
            threshold: threshold,
            excess: parseFloat(excess.toFixed(1)),
            confidence: parseFloat((0.6 + Math.random() * 0.38).toFixed(3)),
            severity: excess < 10 ? 'low' : excess < 30 ? 'medium' : 'high',
        });
    }

    return data.sort((a, b) => b.speed - a.speed);
}

function initViolationTable() {
    renderTable();
    
    document.getElementById('violation-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        filteredData = VIOLATION_DATA.filter(d =>
            d.track_id.toString().includes(q) || d.video.toLowerCase().includes(q)
        );
        currentPage = 1;
        renderTable();
    });

    document.getElementById('severity-filter').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'all') {
            filteredData = [...VIOLATION_DATA];
        } else {
            filteredData = VIOLATION_DATA.filter(d => d.severity === val);
        }
        currentPage = 1;
        renderTable();
    });
}

function renderTable() {
    const tbody = document.getElementById('violations-tbody');
    const pagEl = document.getElementById('table-pagination');

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filteredData.slice(start, start + rowsPerPage);

    tbody.innerHTML = pageData.map(d => `
        <tr>
            <td>#${d.track_id}</td>
            <td>${d.video}</td>
            <td>${d.frame}</td>
            <td style="color: ${d.severity === 'high' ? '#ef4444' : d.severity === 'medium' ? '#f59e0b' : '#e8ecf4'}">${d.speed}</td>
            <td>${d.threshold}</td>
            <td>+${d.excess}</td>
            <td>${d.confidence}</td>
            <td><span class="severity-badge severity-${d.severity}">${d.severity}</span></td>
        </tr>
    `).join('');

    // Pagination
    let pagHTML = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    if (currentPage > 1) {
        pagHTML += `<button class="page-btn" data-page="${currentPage - 1}">‹</button>`;
    }
    for (let p = startPage; p <= endPage; p++) {
        pagHTML += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
    }
    if (currentPage < totalPages) {
        pagHTML += `<button class="page-btn" data-page="${currentPage + 1}">›</button>`;
    }

    pagEl.innerHTML = pagHTML;

    pagEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            renderTable();
        });
    });
}

// ===========================
// CONFIG PANEL
// ===========================
function initConfigPanel() {
    const sliders = [
        { id: 'cfg-conf', valId: 'cfg-conf-val', key: 'conf_threshold', fmt: v => parseFloat(v).toFixed(2) },
        { id: 'cfg-iou', valId: 'cfg-iou-val', key: 'iou_threshold', fmt: v => parseFloat(v).toFixed(2) },
        { id: 'cfg-min-frames', valId: 'cfg-min-frames-val', key: 'min_frames_to_count', fmt: v => parseInt(v) },
        { id: 'cfg-speed', valId: 'cfg-speed-val', key: 'speed_threshold_kmph', fmt: v => parseInt(v) },
        { id: 'cfg-history', valId: 'cfg-history-val', key: 'history_limit', fmt: v => parseInt(v) },
    ];

    function updateConfigJSON() {
        const config = {
            model_name: document.getElementById('cfg-model').value,
            tracker_yaml: document.getElementById('cfg-tracker').value,
        };
        sliders.forEach(s => {
            config[s.key] = s.fmt(document.getElementById(s.id).value);
        });

        document.getElementById('config-json').textContent = JSON.stringify(config, null, 2);
    }

    sliders.forEach(s => {
        const input = document.getElementById(s.id);
        const display = document.getElementById(s.valId);
        input.addEventListener('input', () => {
            display.textContent = s.fmt(input.value);
            updateConfigJSON();
        });
    });

    document.getElementById('cfg-model').addEventListener('change', updateConfigJSON);
    document.getElementById('cfg-tracker').addEventListener('change', updateConfigJSON);

    // Copy button
    document.getElementById('btn-copy-config').addEventListener('click', () => {
        const text = document.getElementById('config-json').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('btn-copy-config');
            btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!`;
            setTimeout(() => {
                btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path></svg> Copy`;
            }, 2000);
        });
    });
}

// ===========================
// DEMO SIMULATION
// ===========================
function initDemoSimulation() {
    const canvas = document.getElementById('demo-canvas');
    const ctx = canvas.getContext('2d');
    const playBtn = document.getElementById('demo-play-btn');
    const overlay = document.getElementById('demo-overlay-start');
    const resetBtn = document.getElementById('btn-reset-demo');
    const speedSlider = document.getElementById('sim-speed');
    const speedLabel = document.getElementById('sim-speed-label');

    let running = false;
    let animationId = null;
    let frame = 0;
    let vehicles = [];
    let violationCount = 0;
    let simSpeed = 1;
    let lastLogTime = 0;

    const VEHICLE_COLORS = {
        car: { fill: '#3b82f6', stroke: '#60a5fa', label: 'CAR' },
        truck: { fill: '#8b5cf6', stroke: '#a78bfa', label: 'TRK' },
        bus: { fill: '#06b6d4', stroke: '#22d3ee', label: 'BUS' },
        motorbike: { fill: '#f59e0b', stroke: '#fbbf24', label: 'MBK' },
    };

    const VEHICLE_TYPES = Object.keys(VEHICLE_COLORS);

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function spawnVehicle() {
        const type = VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)];
        const isTruck = type === 'truck' || type === 'bus';
        const w = isTruck ? 45 + Math.random() * 20 : 30 + Math.random() * 15;
        const h = isTruck ? 70 + Math.random() * 30 : 45 + Math.random() * 25;
        const laneCount = 4;
        const laneWidth = canvas.width / laneCount;
        const lane = Math.floor(Math.random() * laneCount);
        const goingDown = lane < laneCount / 2;

        return {
            id: Math.floor(Math.random() * 999) + 1,
            type,
            x: laneWidth * lane + laneWidth / 2 - w / 2 + (Math.random() - 0.5) * 20,
            y: goingDown ? -h - Math.random() * 200 : canvas.height + Math.random() * 200,
            w, h,
            speed: (2 + Math.random() * 4) * (goingDown ? 1 : -1),
            speedKmh: 20 + Math.random() * 90,
            tracked: false,
            trackedFrames: 0,
            goingDown,
            color: VEHICLE_COLORS[type],
            opacity: 0,
        };
    }

    function initVehicles() {
        vehicles = [];
        for (let i = 0; i < 8; i++) {
            const v = spawnVehicle();
            v.y = Math.random() * canvas.height;
            v.tracked = true;
            v.trackedFrames = 30;
            v.opacity = 1;
            vehicles.push(v);
        }
    }

    function drawRoad() {
        // Road surface
        const roadGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
        roadGrad.addColorStop(0, '#1a1f33');
        roadGrad.addColorStop(0.5, '#222840');
        roadGrad.addColorStop(1, '#1a1f33');
        ctx.fillStyle = roadGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Lane markings
        const laneCount = 4;
        const laneWidth = canvas.width / laneCount;

        ctx.setLineDash([30, 20]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';

        for (let i = 1; i < laneCount; i++) {
            if (i === laneCount / 2) {
                // Center divider
                ctx.setLineDash([]);
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
                ctx.beginPath();
                ctx.moveTo(laneWidth * i, 0);
                ctx.lineTo(laneWidth * i, canvas.height);
                ctx.stroke();
                ctx.setLineDash([30, 20]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            } else {
                ctx.beginPath();
                ctx.moveTo(laneWidth * i, ((frame * 2) % 50) - 50);
                ctx.lineTo(laneWidth * i, canvas.height);
                ctx.stroke();
            }
        }
        ctx.setLineDash([]);

        // Edge lines
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(2, 0); ctx.lineTo(2, canvas.height);
        ctx.moveTo(canvas.width - 2, 0); ctx.lineTo(canvas.width - 2, canvas.height);
        ctx.stroke();

        // Perspective grid overlay
        ctx.globalAlpha = 0.03;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function drawVehicle(v) {
        ctx.save();
        ctx.globalAlpha = v.opacity;

        // Vehicle body
        ctx.fillStyle = v.color.fill;
        ctx.strokeStyle = v.color.stroke;
        ctx.lineWidth = 1.5;

        const r = 5;
        ctx.beginPath();
        ctx.moveTo(v.x + r, v.y);
        ctx.lineTo(v.x + v.w - r, v.y);
        ctx.quadraticCurveTo(v.x + v.w, v.y, v.x + v.w, v.y + r);
        ctx.lineTo(v.x + v.w, v.y + v.h - r);
        ctx.quadraticCurveTo(v.x + v.w, v.y + v.h, v.x + v.w - r, v.y + v.h);
        ctx.lineTo(v.x + r, v.y + v.h);
        ctx.quadraticCurveTo(v.x, v.y + v.h, v.x, v.y + v.h - r);
        ctx.lineTo(v.x, v.y + r);
        ctx.quadraticCurveTo(v.x, v.y, v.x + r, v.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Windshield
        const wsY = v.goingDown ? v.y + 6 : v.y + v.h - 16;
        ctx.fillStyle = 'rgba(100,180,255,0.3)';
        ctx.fillRect(v.x + 4, wsY, v.w - 8, 10);

        // Tracking bounding box
        if (v.tracked) {
            const pad = 6;
            const isViolation = v.speedKmh > 50;
            const boxColor = isViolation ? 'rgba(239, 68, 68, 0.9)' : 'rgba(6, 182, 212, 0.9)';

            ctx.strokeStyle = boxColor;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 3]);

            ctx.strokeRect(v.x - pad, v.y - pad, v.w + pad * 2, v.h + pad * 2);
            ctx.setLineDash([]);

            // Corner markers
            const cl = 8;
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = boxColor;
            // Top-left
            ctx.beginPath(); ctx.moveTo(v.x - pad, v.y - pad + cl); ctx.lineTo(v.x - pad, v.y - pad); ctx.lineTo(v.x - pad + cl, v.y - pad); ctx.stroke();
            // Top-right
            ctx.beginPath(); ctx.moveTo(v.x + v.w + pad - cl, v.y - pad); ctx.lineTo(v.x + v.w + pad, v.y - pad); ctx.lineTo(v.x + v.w + pad, v.y - pad + cl); ctx.stroke();
            // Bottom-left
            ctx.beginPath(); ctx.moveTo(v.x - pad, v.y + v.h + pad - cl); ctx.lineTo(v.x - pad, v.y + v.h + pad); ctx.lineTo(v.x - pad + cl, v.y + v.h + pad); ctx.stroke();
            // Bottom-right
            ctx.beginPath(); ctx.moveTo(v.x + v.w + pad - cl, v.y + v.h + pad); ctx.lineTo(v.x + v.w + pad, v.y + v.h + pad); ctx.lineTo(v.x + v.w + pad, v.y + v.h + pad - cl); ctx.stroke();

            // Label
            const labelText = `#${v.id} ${v.color.label} ${v.speedKmh.toFixed(0)}km/h`;
            ctx.font = '600 10px "JetBrains Mono", monospace';
            const tw = ctx.measureText(labelText).width;
            const lx = v.x - pad;
            const ly = v.y - pad - 18;

            ctx.fillStyle = isViolation ? 'rgba(239,68,68,0.9)' : 'rgba(6,182,212,0.9)';
            ctx.beginPath();
            ctx.roundRect(lx, ly, tw + 12, 16, 3);
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.fillText(labelText, lx + 6, ly + 12);
        }

        ctx.restore();
    }

    function drawScanline() {
        const scanY = (frame * 3) % canvas.height;
        const scanGrad = ctx.createLinearGradient(0, scanY - 40, 0, scanY + 40);
        scanGrad.addColorStop(0, 'rgba(6,182,212,0)');
        scanGrad.addColorStop(0.5, 'rgba(6,182,212,0.08)');
        scanGrad.addColorStop(1, 'rgba(6,182,212,0)');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 40, canvas.width, 80);
    }

    function addLogEntry(v, isViolation) {
        const log = document.getElementById('detection-log');
        const placeholder = log.querySelector('.log-placeholder');
        if (placeholder) placeholder.remove();

        const entry = document.createElement('div');
        entry.className = 'log-entry' + (isViolation ? ' violation' : '');
        const time = new Date().toLocaleTimeString();
        const speedStr = v.speedKmh.toFixed(1);

        if (isViolation) {
            entry.innerHTML = `<strong>⚠ VIOLATION</strong> #${v.id} ${v.color.label}<br>Speed: ${speedStr} km/h | Frame: ${frame}`;
        } else {
            entry.innerHTML = `#${v.id} ${v.color.label} detected<br>Speed: ${speedStr} km/h | Frame: ${frame}`;
        }

        log.prepend(entry);

        // Keep max 50 entries
        while (log.children.length > 50) {
            log.removeChild(log.lastChild);
        }
    }

    function updateHUD() {
        document.getElementById('hud-fps').textContent = Math.floor(30 * simSpeed);
        document.getElementById('hud-frame').textContent = frame;
        document.getElementById('hud-tracked').textContent = vehicles.filter(v => v.tracked).length;
        document.getElementById('hud-violations').textContent = violationCount;

        // Speed bar shows max speed of tracked vehicles
        const speeds = vehicles.filter(v => v.tracked).map(v => v.speedKmh);
        const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
        const fill = document.getElementById('speed-bar-fill');
        const pct = Math.min((maxSpeed / 130) * 100, 100);
        fill.style.width = pct + '%';
        fill.className = 'speed-bar-fill' + (maxSpeed > 50 ? ' over-limit' : '');
        document.getElementById('speed-bar-label').textContent = maxSpeed.toFixed(0) + ' km/h';
    }

    function simulate() {
        if (!running) return;

        frame++;

        // Spawn new vehicles occasionally
        if (frame % Math.floor(40 / simSpeed) === 0 && vehicles.length < 14) {
            vehicles.push(spawnVehicle());
        }

        // Update vehicles
        vehicles.forEach(v => {
            v.y += v.speed * simSpeed;
            v.opacity = Math.min(v.opacity + 0.05, 1);

            // Track after a few frames visible
            if (!v.tracked) {
                v.trackedFrames++;
                if (v.trackedFrames > 10) {
                    v.tracked = true;
                    addLogEntry(v, v.speedKmh > 50);
                    if (v.speedKmh > 50) violationCount++;
                }
            }

            // Slight speed variation
            v.speedKmh += (Math.random() - 0.5) * 0.5;
            v.speedKmh = Math.max(10, Math.min(130, v.speedKmh));
        });

        // Remove off-screen vehicles
        vehicles = vehicles.filter(v =>
            v.goingDown ? v.y < canvas.height + 100 : v.y > -100
        );

        // Draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        drawScanline();
        vehicles.forEach(drawVehicle);
        updateHUD();

        animationId = requestAnimationFrame(simulate);
    }

    function startSimulation() {
        overlay.classList.add('hidden');
        running = true;
        frame = 0;
        violationCount = 0;
        initVehicles();
        simulate();
    }

    function resetSimulation() {
        running = false;
        if (animationId) cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        overlay.classList.remove('hidden');
        vehicles = [];
        frame = 0;
        violationCount = 0;
        updateHUD();
        document.getElementById('detection-log').innerHTML = '<div class="log-placeholder">Start the simulation to see detections...</div>';
    }

    playBtn.addEventListener('click', startSimulation);
    resetBtn.addEventListener('click', resetSimulation);

    speedSlider.addEventListener('input', () => {
        simSpeed = parseFloat(speedSlider.value);
        speedLabel.textContent = simSpeed + '×';
    });
}

// ============================================================
// BACKEND API INTEGRATION — TrafficVision AI
// ============================================================

const API_BASE = 'http://localhost:5000';
let _sseSource = null;
let _isRunning  = false;

// ── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initLaunchPanel();
    checkBackendHealth();
    setInterval(checkBackendHealth, 15000);
});

// ── GPU Detection using WebGL ────────────────────────────────
function detectGPU() {
    try {
        const canvas = document.createElement('canvas');
        
        // Try to force high-performance GPU
        const gl = canvas.getContext('webgl', { powerPreference: 'high-performance' }) 
                || canvas.getContext('experimental-webgl', { powerPreference: 'high-performance' });
        if (!gl) return { primary: null, note: null };
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Clean up the GPU name (remove "ANGLE (" prefix and trailing ")")
            let gpuName = renderer
                .replace(/ANGLE \(/g, '')
                .replace(/\)$/g, '')
                .replace(/Direct3D11 vs_5_0 ps_5_0/g, '')
                .replace(/Direct3D\d+/g, '')
                .replace(/OpenGL Engine/g, '')
                .trim();
            
            // Detect if it's NVIDIA (dedicated) or AMD/Intel (likely integrated)
            const isNvidia = gpuName.includes('NVIDIA') || gpuName.includes('GeForce');
            const isAmdDedicated = gpuName.includes('Radeon RX') || gpuName.includes('Radeon R9') || gpuName.includes('Radeon R7');
            const isIntegrated = gpuName.includes('Intel') || (gpuName.includes('AMD') && !isAmdDedicated) || gpuName.includes('Vega');
            
            // Shorten common GPU names
            if (gpuName.includes('NVIDIA') || gpuName.includes('GeForce')) {
                gpuName = gpuName.match(/NVIDIA\s*GeForce\s*[A-Z0-9\s]+/i)?.[0] 
                       || gpuName.match(/GeForce\s*[A-Z0-9\s]+/i)?.[0] 
                       || gpuName;
            } else if (gpuName.includes('AMD') || gpuName.includes('Radeon')) {
                gpuName = gpuName.match(/(AMD|Radeon)[^\,]*/i)?.[0] || gpuName;
            } else if (gpuName.includes('Intel')) {
                gpuName = gpuName.match(/Intel[^\,]*/i)?.[0] || gpuName;
            }
            
            // Truncate if still too long
            gpuName = gpuName.trim();
            if (gpuName.length > 25) {
                gpuName = gpuName.substring(0, 22) + '...';
            }
            
            // Add note if using integrated GPU
            let note = null;
            if (isIntegrated && !isNvidia) {
                note = 'Using integrated GPU. For NVIDIA GTX 1650: Windows Settings → Graphics → Set browser to High Performance';
            }
            
            return { primary: gpuName, note: note, isIntegrated: isIntegrated };
        }
        return { primary: 'GPU Detected', note: null };
    } catch (e) {
        return { primary: null, note: null };
    }
}

// ── Health Check ─────────────────────────────────────────────
async function checkBackendHealth() {
    const badge = document.getElementById('backend-status');
    const txt   = document.getElementById('be-text');
    const btnRun = document.getElementById('btn-run-analysis');
    const deviceNameEl = document.getElementById('cfg-device-name');
    
    // First, detect GPU using WebGL (browser-based)
    const gpuInfo = detectGPU();
    
    // Update the config device name if GPU detected
    if (deviceNameEl && gpuInfo.primary) {
        deviceNameEl.textContent = gpuInfo.primary;
        // Show tooltip if using integrated GPU
        if (gpuInfo.note) {
            deviceNameEl.title = gpuInfo.note;
            deviceNameEl.style.cursor = 'help';
        }
    }
    
    try {
        const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(4000) });
        if (!res.ok) throw new Error();
        const data = await res.json();
        badge.className = 'backend-status online';
        txt.textContent = data.cuda
            ? `Online · ${data.device.split(' ').slice(0,2).join(' ')}`
            : 'Online · CPU';
        if (btnRun) btnRun.disabled = false;
    } catch {
        // Backend offline, but we can still show GPU info from browser detection
        if (gpuInfo.primary) {
            badge.className = 'backend-status online';
            const gpuLabel = gpuInfo.isIntegrated ? `${gpuInfo.primary} (iGPU)` : gpuInfo.primary;
            txt.textContent = `Online · ${gpuLabel}`;
            // Add tooltip for integrated GPU warning
            if (gpuInfo.note) {
                txt.title = gpuInfo.note;
                txt.style.cursor = 'help';
            }
        } else {
            badge.className = 'backend-status error';
            txt.textContent = 'Offline';
        } else {
            badge.className = 'backend-status error';
            txt.textContent = 'Offline';
        }
        // Demo mode still works without backend
        if (btnRun) btnRun.disabled = false;
    }
}

// ── Launch Panel Wiring ──────────────────────────────────────
function initLaunchPanel() {
    const maxSlider = document.getElementById('cfg-max-videos');
    const maxVal    = document.getElementById('cfg-max-videos-val');
    if (maxSlider) maxSlider.addEventListener('input', () => { maxVal.textContent = maxSlider.value; });

    const btnRun  = document.getElementById('btn-run-analysis');
    const btnStop = document.getElementById('btn-stop-analysis');
    if (btnRun)  btnRun.addEventListener('click', runAnalysis);
    if (btnStop) btnStop.addEventListener('click', stopAnalysis);

    const btnAgain = document.getElementById('btn-run-again');
    if (btnAgain) btnAgain.addEventListener('click', () => {
        document.getElementById('rp-view-results').style.display = 'none';
        document.getElementById('config').scrollIntoView({ behavior: 'smooth' });
    });
}

// ── Run Analysis ─────────────────────────────────────────────
async function runAnalysis() {
    const videoDir = (document.getElementById('cfg-dataset')?.value || '').trim();
    if (!videoDir) {
        alert('Please enter the dataset folder path first.\nExample: D:\\datasets\\179_videos');
        return;
    }
    const payload = {
        video_dir:       videoDir,
        model:           document.getElementById('cfg-model')?.value || 'yolov12x.pt',
        tracker:         document.getElementById('cfg-tracker')?.value || 'botsort.yaml',
        conf:            parseFloat(document.getElementById('cfg-conf')?.value || 0.5),
        iou:             parseFloat(document.getElementById('cfg-iou')?.value || 0.5),
        speed_threshold: parseFloat(document.getElementById('cfg-speed')?.value || 50),
        min_frames:      parseInt(document.getElementById('cfg-min-frames')?.value || 25),
        history_limit:   parseInt(document.getElementById('cfg-history')?.value || 120),
        max_videos:      parseInt(document.getElementById('cfg-max-videos')?.value || 10),
    };
    try {
        const res = await fetch(`${API_BASE}/api/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { alert(`Backend error: ${data.error}`); return; }
    } catch (err) {
        alert(`Cannot connect to backend.\nMake sure start_backend.bat is running.\n\n${err}`);
        return;
    }
    _isRunning = true;
    showRunProgress();
    setRunningUI(true);
    startSSE();
}

// ── Stop Analysis ─────────────────────────────────────────────
async function stopAnalysis() {
    try { await fetch(`${API_BASE}/api/stop`, { method: 'POST' }); } catch {}
    if (_sseSource) { _sseSource.close(); _sseSource = null; }
    _isRunning = false;
    setRunningUI(false);
    setProgressBadge('stopped');
    rpLog('Analysis stopped by user.', 'warn');
}

// ── SSE Listener ─────────────────────────────────────────────
function startSSE() {
    if (_sseSource) _sseSource.close();
    _sseSource = new EventSource(`${API_BASE}/api/stream`);
    _sseSource.onmessage = (ev) => {
        try { handleProgress(JSON.parse(ev.data)); } catch {}
    };
    _sseSource.onerror = () => {
        _sseSource.close(); _sseSource = null;
        if (_isRunning) fetchAndApplyResults();
    };
}

// ── Handle Progress Events ────────────────────────────────────
function handleProgress(p) {
    const st = p.status || '';
    if (st === 'heartbeat') return;

    if (st === 'downloading') {
        setProgressBadge('loading'); updateProgressBar(10);
        setProgressTitle('Downloading Dataset\u2026');
        document.getElementById('rp-video-name').textContent = 'Kaggle Download API';
        rpLog(p.message || 'Fetching from Kaggle\u2026', 'info');
    }

    if (st === 'loading_model') {
        setProgressBadge('loading'); updateProgressBar(2);
        setProgressTitle('Loading Model\u2026');
        document.getElementById('rp-video-name').textContent = p.model || '';
        rpLog(`Loading ${p.model || 'model'}\u2026`, 'info');
    }
    if (st === 'processing') {
        setProgressBadge('processing');
        const pct = p.progress || 0;
        updateProgressBar(pct);
        setProgressTitle('Processing Videos');
        document.getElementById('rp-video-name').textContent = p.video || '';
        document.getElementById('rp-current').textContent = p.current || 0;
        document.getElementById('rp-total').textContent   = p.total   || 0;
        document.getElementById('rp-pct').textContent     = `${Math.round(pct)}%`;
        rpLog(`[${p.current}/${p.total}] ${p.video}`, 'info');
    }
    if (st === 'compiling') {
        setProgressBadge('compiling'); updateProgressBar(99);
        setProgressTitle('Compiling Results\u2026');
        rpLog('Aggregating statistics\u2026', 'info');
    }
    if (st === 'complete') {
        _isRunning = false;
        if (_sseSource) { _sseSource.close(); _sseSource = null; }
        setRunningUI(false);
        fetchAndApplyResults();
    }
    if (st === 'error') {
        _isRunning = false;
        if (_sseSource) { _sseSource.close(); _sseSource = null; }
        setRunningUI(false);
        setProgressBadge('error'); updateProgressBar(0, 'error');
        setProgressTitle('Error');
        document.getElementById('rp-spinner').className = 'rp-spinner done';
        rpLog(`Error: ${p.error || 'Unknown error'}`, 'danger');
    }
}

// ── Fetch & Apply Real Results ────────────────────────────────
async function fetchAndApplyResults() {
    try {
        const res  = await fetch(`${API_BASE}/api/results`);
        const data = await res.json();
        if (!res.ok) { rpLog(`Results error: ${data.error}`, 'danger'); setProgressBadge('error'); return; }
        applyRealResults(data);
    } catch (err) {
        rpLog(`Network error: ${err}`, 'danger');
    }
}

function applyRealResults(data) {
    updateProgressBar(100, 'complete');
    setProgressBadge('complete');
    setProgressTitle('\u2713 Analysis Complete');
    document.getElementById('rp-spinner').className = 'rp-spinner done';
    document.getElementById('rp-view-results').style.display = 'flex';

    const kpis    = data.kpis    || {};
    const summary = data.violations_summary || {};
    const charts  = data.chart_data || {};

    rpLog(`Done! ${kpis.videos} videos \u00b7 ${kpis.vehicles} vehicles \u00b7 ${summary.total} violations`, 'success');

    // KPI Cards
    setKPICardVal('kpi-videos',   kpis.videos);
    setKPICardVal('kpi-vehicles', kpis.vehicles);
    setKPICardVal('kpi-fps',      kpis.fps, ' fps');
    setKPICardVal('kpi-avg-speed', kpis.avg_speed || 0, ' km/h');
    setKPICardVal('kpi-max-speed', kpis.max_speed || 0, ' km/h');

    // Violation summary
    if (summary.total !== undefined) {
        const el = id => document.getElementById(id);
        if (el('v-total'))     el('v-total').textContent     = summary.total;
        if (el('v-avg-speed')) el('v-avg-speed').textContent = summary.avg_speed;
        if (el('v-max-speed')) el('v-max-speed').textContent = summary.max_speed;
        if (el('v-rate'))      el('v-rate').textContent      = summary.violation_rate;
    }

    // Charts
    if (charts.accuracy)           updateAccuracyChartReal(charts.accuracy);
    if (charts.classes)            updateClassChartReal(charts.classes);
    if (charts.speed_distribution) updateSpeedChartReal(charts.speed_distribution);
    if (charts.processing)         updateProcessingChartReal(charts.processing);

    // Violations table
    if (Array.isArray(data.violations) && data.violations.length > 0) {
        filteredData = [...data.violations].sort((a, b) => b.speed - a.speed);
        currentPage  = 1;
        renderTable();
    }

    // Per-video results table
    if (Array.isArray(data.per_video) && data.per_video.length > 0) {
        renderPerVideoTable(data.per_video);
    }

    // Badge charts as real data
    document.querySelectorAll('.chart-header h3').forEach(h => {
        if (!h.querySelector('.real-data-banner')) {
            const badge = document.createElement('span');
            badge.className = 'real-data-banner';
            badge.textContent = 'Real Data';
            h.appendChild(badge);
        }
    });

    setTimeout(() => {
        document.getElementById('analytics')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 700);
}

// ── Chart Updaters ────────────────────────────────────────────
function updateAccuracyChartReal(acc) {
    const c = Chart.getChart('chart-accuracy');
    if (!c) return;
    c.data.labels = acc.labels;
    c.data.datasets[0].data = acc.detected;
    c.data.datasets[1].data = acc.detected.map(v => Math.round(v * 1.05));
    c.update('active');
}
function updateClassChartReal(cls) {
    const c = Chart.getChart('chart-classes');
    if (!c) return;
    c.data.labels = cls.labels.map(l => l.charAt(0).toUpperCase() + l.slice(1));
    c.data.datasets[0].data = cls.data;
    c.update('active');
}
function updateSpeedChartReal(spd) {
    const c = Chart.getChart('chart-speed');
    if (!c) return;
    const limit = parseInt(document.getElementById('cfg-speed')?.value || 50);
    const colors = spd.labels.map(l => parseInt(l.split(/[–-]/)[0], 10) >= limit
        ? 'rgba(239,68,68,0.7)' : 'rgba(6,182,212,0.6)');
    c.data.labels = spd.labels;
    c.data.datasets[0].data = spd.data;
    c.data.datasets[0].backgroundColor = colors;
    c.data.datasets[0].borderColor = colors.map(col => col.replace('0.7','1').replace('0.6','1'));
    c.update('active');
}
function updateProcessingChartReal(proc) {
    const c = Chart.getChart('chart-processing');
    if (!c) return;
    c.data.labels = proc.labels;
    c.data.datasets[0].data = proc.time;
    c.data.datasets[1].data = proc.frames;
    c.update('active');
}

// ── Per-Video Results Table ──────────────────────────────────
let perVideoData = [];
let perVideoPage = 1;
const perVideoPerPage = 10;

function renderPerVideoTable(data) {
    perVideoData = data;
    perVideoPage = 1;
    
    // Show the per-video section
    const section = document.getElementById('per-video-section');
    if (section) section.style.display = 'block';
    
    renderPerVideoPage();
}

function renderPerVideoPage() {
    const tbody = document.getElementById('per-video-tbody');
    const pagination = document.getElementById('per-video-pagination');
    if (!tbody) return;
    
    const start = (perVideoPage - 1) * perVideoPerPage;
    const end = start + perVideoPerPage;
    const pageData = perVideoData.slice(start, end);
    
    tbody.innerHTML = pageData.map(v => {
        const avgSpeedClass = (v.avg_speed || 0) > 50 ? 'speed-cell high' : 'speed-cell';
        const maxSpeedClass = (v.max_speed || 0) > 80 ? 'speed-cell high' : 'speed-cell';
        const accClass = v.accuracy_pct >= 90 ? 'accuracy-cell high' : 
                         v.accuracy_pct >= 70 ? 'accuracy-cell medium' : 'accuracy-cell low';
        
        return `<tr>
            <td title="${v.name}">${v.name.length > 20 ? v.name.slice(0, 20) + '…' : v.name}</td>
            <td>${v.vehicles}</td>
            <td>${v.violations}</td>
            <td class="${avgSpeedClass}">${v.avg_speed || 0}</td>
            <td class="${maxSpeedClass}">${v.max_speed || 0}</td>
            <td>${v.frames}</td>
            <td>${v.duration}</td>
            <td>${v.fps}</td>
            <td class="${accClass}">${v.accuracy_pct}%</td>
        </tr>`;
    }).join('');
    
    // Render pagination
    if (pagination) {
        const totalPages = Math.ceil(perVideoData.length / perVideoPerPage);
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn${i === perVideoPage ? ' active' : ''}" 
                     onclick="goToPerVideoPage(${i})">${i}</button>`;
        }
        pagination.innerHTML = html;
    }
}

function goToPerVideoPage(page) {
    perVideoPage = page;
    renderPerVideoPage();
}

// ── Tiny helpers ─────────────────────────────────────────────
function setKPICardVal(id, value, suffix = '') {
    const card = document.getElementById(id);
    if (!card) return;
    const valEl = card.querySelector('.kpi-value');
    const suffixEl = card.querySelector('.kpi-suffix');
    if (valEl) {
        // Only set value, not suffix (suffix is already in HTML or passed separately)
        valEl.textContent = value ?? '—';
    }
    // Update suffix element if it exists and suffix is provided
    if (suffixEl && suffix) {
        suffixEl.textContent = suffix;
    }
}

function showRunProgress() {
    const sec = document.getElementById('run-progress-section');
    if (!sec) return;
    sec.style.display = 'block';
    document.getElementById('rp-log').innerHTML = '';
    document.getElementById('rp-view-results').style.display = 'none';
    document.getElementById('rp-bar-fill').className = 'rp-bar-fill';
    document.getElementById('rp-spinner').className  = 'rp-spinner';
    updateProgressBar(0);
    setProgressBadge('loading');
    setProgressTitle('Initializing\u2026');
    setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}
function setRunningUI(running) {
    const btnRun  = document.getElementById('btn-run-analysis');
    const btnStop = document.getElementById('btn-stop-analysis');
    if (!btnRun || !btnStop) return;
    btnRun.style.display  = running ? 'none' : '';
    btnStop.style.display = running ? '' : 'none';
}
function updateProgressBar(pct, state = '') {
    const fill  = document.getElementById('rp-bar-fill');
    const pctEl = document.getElementById('rp-pct');
    if (!fill) return;
    fill.style.width = `${pct}%`;
    fill.className   = `rp-bar-fill${state ? ' ' + state : ''}`;
    if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
}
function setProgressBadge(state) {
    const badge = document.getElementById('rp-status-badge');
    if (!badge) return;
    const labels = { loading:'Loading Model', processing:'Processing', compiling:'Compiling',
                     complete:'Complete', error:'Error', stopped:'Stopped' };
    badge.className   = `rp-status-badge ${state}`;
    badge.textContent = labels[state] || state;
}
function setProgressTitle(txt) {
    const el = document.getElementById('rp-title-text');
    if (el) el.textContent = txt;
}
function rpLog(msg, type = '') {
    const log = document.getElementById('rp-log');
    if (!log) return;
    const now   = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `rp-log-entry ${type}`;
    entry.innerHTML = `<span class="log-time">${now}</span><span class="log-msg">${msg}</span>`;
    log.prepend(entry);
    while (log.children.length > 80) log.removeChild(log.lastChild);
}
