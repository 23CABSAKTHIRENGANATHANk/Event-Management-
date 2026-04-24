/**
 * EMS - Dashboard Charts (Chart.js wrapper)
 */

const Charts = {
    defaults() {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.07)';
        Chart.defaults.font.family = 'Inter';
    },

    /**
     * Bar chart for event participation by department
     */
    renderDepartmentChart(canvasId, deptData) {
        this.defaults();
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        const labels = deptData.map(d => d.department_name);
        const values = deptData.map(d => parseInt(d.event_count));
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Events',
                    data: values,
                    backgroundColor: [
                        'rgba(79,142,247,0.7)',
                        'rgba(168,85,247,0.7)',
                        'rgba(34,197,94,0.7)',
                        'rgba(249,115,22,0.7)',
                        'rgba(6,182,212,0.7)',
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#0f1525', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                }
            }
        });
    },

    /**
     * Line chart for registration trend
     */
    renderTrendChart(canvasId, trendData) {
        this.defaults();
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.map(d => d.month),
                datasets: [{
                    label: 'Registrations',
                    data: trendData.map(d => parseInt(d.count)),
                    borderColor: '#4f8ef7',
                    backgroundColor: 'rgba(79,142,247,0.10)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4f8ef7',
                    pointRadius: 5,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#0f1525', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                }
            }
        });
    },

    /**
     * Doughnut chart for event status breakdown
     */
    renderStatusChart(canvasId, data) {
        this.defaults();
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.label),
                datasets: [{
                    data: data.map(d => d.value),
                    backgroundColor: ['rgba(79,142,247,0.8)', 'rgba(34,197,94,0.8)', 'rgba(249,115,22,0.8)', 'rgba(239,68,68,0.8)'],
                    borderWidth: 0,
                    hoverOffset: 4,
                }]
            },
            options: {
                responsive: true,
                cutout: '72%',
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
                    tooltip: { backgroundColor: '#0f1525', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
                }
            }
        });
    }
};

window.Charts = Charts;
