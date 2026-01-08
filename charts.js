/**
 * TPA Dashboard Charts
 * Chart.js configurations and rendering functions
 */

// Chart.js default configuration
Chart.defaults.color = '#A8B2C1';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.display = true;
Chart.defaults.plugins.legend.position = 'bottom';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(26, 31, 46, 0.95)';
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
Chart.defaults.plugins.tooltip.bodyColor = '#A8B2C1';

// TPA Color Scheme
const TPA_COLORS = {
    'SEDG': '#2E5C8A',
    'GBAS': '#4A7C59',
    'CRAW': '#8B5A3C',
    'ESIS': '#6B4C7C',
    'BRDP': '#A67C52'
};

const CHART_COLORS = {
    primary: '#4A90E2',
    secondary: '#4A7C59',
    accent: '#E2A24A',
    danger: '#E25A4A',
    success: '#4A9D6E',
    warning: '#E2A24A',
    gradient1: ['#4A90E2', '#2E5C8A'],
    gradient2: ['#4A7C59', '#2D5C3C'],
    gradient3: ['#E2A24A', '#C17E2E']
};

// Store chart instances for updates
const chartInstances = {};

/**
 * Create gradient for Chart.js
 */
function createGradient(ctx, area, colors) {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, colors[1] || colors[0]);
    gradient.addColorStop(1, colors[0]);
    return gradient;
}

/**
 * 1. Claims Volume Trend Chart (Line Chart)
 */
function renderClaimsVolumeChart(data) {
    const ctx = document.getElementById('claimsVolumeChart');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstances.claimsVolume) {
        chartInstances.claimsVolume.destroy();
    }

    // Aggregate data by month and status
    const monthlyData = {};

    data.claims.forEach(claim => {
        const monthKey = claim.reportDate.substring(0, 7); // YYYY-MM
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { Open: 0, Closed: 0, Pending: 0, Litigation: 0 };
        }

        if (claim.status === 'Closed') monthlyData[monthKey].Closed++;
        else if (claim.status === 'In Litigation') monthlyData[monthKey].Litigation++;
        else if (claim.status === 'Pending Investigation') monthlyData[monthKey].Pending++;
        else monthlyData[monthKey].Open++;
    });

    const months = Object.keys(monthlyData).sort().slice(-12); // Last 12 months
    const labels = months.map(m => {
        const date = new Date(m + '-01');
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });

    chartInstances.claimsVolume = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Closed',
                    data: months.map(m => monthlyData[m].Closed),
                    borderColor: CHART_COLORS.success,
                    backgroundColor: CHART_COLORS.success + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Open',
                    data: months.map(m => monthlyData[m].Open),
                    borderColor: CHART_COLORS.primary,
                    backgroundColor: CHART_COLORS.primary + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Pending',
                    data: months.map(m => monthlyData[m].Pending),
                    borderColor: CHART_COLORS.warning,
                    backgroundColor: CHART_COLORS.warning + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'In Litigation',
                    data: months.map(m => monthlyData[m].Litigation),
                    borderColor: CHART_COLORS.danger,
                    backgroundColor: CHART_COLORS.danger + '20',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        precision: 0
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                }
            }
        }
    });
}

/**
 * 2. Portfolio Composition Chart (Doughnut Chart)
 */
function renderPortfolioCompositionChart(data) {
    const ctx = document.getElementById('portfolioCompositionChart');
    if (!ctx) return;

    if (chartInstances.portfolioComposition) {
        chartInstances.portfolioComposition.destroy();
    }

    // Count claims by type
    const claimTypeCounts = {};
    data.claims.forEach(claim => {
        claimTypeCounts[claim.claimType] = (claimTypeCounts[claim.claimType] || 0) + 1;
    });

    const labels = Object.keys(claimTypeCounts);
    const values = Object.values(claimTypeCounts);
    const colors = ['#4A90E2', '#4A7C59', '#E2A24A', '#8B5A3C'];

    chartInstances.portfolioComposition = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 0,
                hoverOffset: 10
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
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 3. TPA Performance Comparison Chart (Horizontal Bar)
 */
function renderTPAComparisonChart(data) {
    const ctx = document.getElementById('tpaComparisonChart');
    if (!ctx) return;

    if (chartInstances.tpaComparison) {
        chartInstances.tpaComparison.destroy();
    }

    // Calculate average metrics per TPA
    const tpaMetrics = {};

    data.performance.forEach(perf => {
        if (!tpaMetrics[perf.tpaName]) {
            tpaMetrics[perf.tpaName] = {
                closingRatio: [],
                avgDaysToClose: [],
                reserveAccuracy: [],
                tpaId: perf.tpaId
            };
        }
        tpaMetrics[perf.tpaName].closingRatio.push(perf.closingRatio);
        tpaMetrics[perf.tpaName].avgDaysToClose.push(perf.avgDaysToClose);
        tpaMetrics[perf.tpaName].reserveAccuracy.push(perf.reserveAccuracy);
    });

    const tpaLabels = Object.keys(tpaMetrics);
    const closingRatios = tpaLabels.map(tpa => {
        const arr = tpaMetrics[tpa].closingRatio;
        return (arr.reduce((a, b) => a + b, 0) / arr.length * 100).toFixed(1);
    });

    const colors = tpaLabels.map(tpa => TPA_COLORS[tpaMetrics[tpa].tpaId] || '#4A90E2');

    chartInstances.tpaComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tpaLabels,
            datasets: [{
                label: 'Closing Ratio (%)',
                data: closingRatios,
                backgroundColor: colors,
                borderRadius: 8,
                barThickness: 40
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Closing Ratio: ${context.parsed.x.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 4. Reserve Accuracy Chart (Scatter Plot)
 */
function renderReserveAccuracyChart(data) {
    const ctx = document.getElementById('reserveAccuracyChart');
    if (!ctx) return;

    if (chartInstances.reserveAccuracy) {
        chartInstances.reserveAccuracy.destroy();
    }

    // Get closed claims with reserve accuracy
    const closedClaims = data.claims.filter(c => c.status === 'Closed' && c.reserveAccuracy);

    // Sample for performance (take every 5th claim)
    const sampledClaims = closedClaims.filter((_, idx) => idx % 5 === 0);

    const scatterData = sampledClaims.map(claim => ({
        x: claim.incurredAmount,
        y: (claim.reserveAccuracy * 100).toFixed(1)
    }));

    chartInstances.reserveAccuracy = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Reserve Accuracy',
                data: scatterData,
                backgroundColor: 'rgba(74, 144, 226, 0.6)',
                borderColor: '#4A90E2',
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Target (100%)',
                data: [{ x: 0, y: 100 }, { x: Math.max(...scatterData.map(d => d.x)), y: 100 }],
                type: 'line',
                borderColor: '#4A9D6E',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Incurred Amount ($)',
                        color: '#A8B2C1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return '$' + (value / 1000).toFixed(0) + 'K';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Reserve Accuracy (%)',
                        color: '#A8B2C1'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    min: 60,
                    max: 140
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Amount: $${context.parsed.x.toLocaleString()}, Accuracy: ${context.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 5. Savings Chart (Grouped Bar)
 */
function renderSavingsChart(data) {
    const ctx = document.getElementById('savingsChart');
    if (!ctx) return;

    if (chartInstances.savings) {
        chartInstances.savings.destroy();
    }

    // Aggregate total savings by initiative
    const initiativeSavings = {};

    data.initiativePerformance.forEach(perf => {
        if (!initiativeSavings[perf.initiativeName]) {
            initiativeSavings[perf.initiativeName] = { target: 0, actual: 0 };
        }
        initiativeSavings[perf.initiativeName].target += perf.targetSavings;
        initiativeSavings[perf.initiativeName].actual += perf.totalSavings;
    });

    const labels = Object.keys(initiativeSavings);
    const targetData = labels.map(name => (initiativeSavings[name].target / 1000).toFixed(0));
    const actualData = labels.map(name => (initiativeSavings[name].actual / 1000).toFixed(0));

    chartInstances.savings = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Target Savings',
                    data: targetData,
                    backgroundColor: 'rgba(168, 178, 193, 0.3)',
                    borderColor: '#A8B2C1',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Actual Savings',
                    data: actualData,
                    backgroundColor: '#4A90E2',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return '$' + value + 'K';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': $' + parseFloat(context.parsed.y).toLocaleString() + 'K';
                        }
                    }
                }
            }
        }
    });
}

/**
 * 6. Utilization Trends Chart (Line Chart)
 */
function renderUtilizationChart(data) {
    const ctx = document.getElementById('utilizationChart');
    if (!ctx) return;

    if (chartInstances.utilization) {
        chartInstances.utilization.destroy();
    }

    // Get unique initiatives
    const initiatives = [...new Set(data.initiativePerformance.map(p => p.initiativeName))];

    // Get all unique months (sorted)
    const allMonths = [...new Set(data.initiativePerformance.map(p => p.monthName))];
    const uniqueMonths = allMonths.filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => {
        const dateA = new Date(a.split(' ').reverse().join(' '));
        const dateB = new Date(b.split(' ').reverse().join(' '));
        return dateA - dateB;
    });

    const colors = ['#4A90E2', '#4A7C59', '#E2A24A', '#6B4C7C'];

    const datasets = initiatives.map((initName, idx) => {
        const initData = data.initiativePerformance.filter(p => p.initiativeName === initName);

        // Sort by date
        initData.sort((a, b) => {
            const dateA = new Date(a.year, a.month - 1);
            const dateB = new Date(b.year, b.month - 1);
            return dateA - dateB;
        });

        return {
            label: initName,
            data: initData.map(p => (p.actualUtilization * 100).toFixed(1)),
            borderColor: colors[idx % colors.length],
            backgroundColor: colors[idx % colors.length] + '20',
            tension: 0.4,
            fill: false,
            pointRadius: 3,
            pointHoverRadius: 5
        };
    });

    chartInstances.utilization = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datasets[0]?.data.map((_, idx) => {
                const perf = data.initiativePerformance.find(p =>
                    p.initiativeName === initiatives[0]
                );
                // Get the month labels from the first initiative's data
                const initData = data.initiativePerformance
                    .filter(p => p.initiativeName === initiatives[0])
                    .sort((a, b) => new Date(a.year, a.month - 1) - new Date(b.year, b.month - 1));
                return initData[idx]?.monthName || '';
            }) || [],
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * 7. Mini Trend Charts for Data Governance
 */
function renderMiniTrendChart(canvasId, data, color) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(() => ''),
            datasets: [{
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { display: false },
                x: { display: false }
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderClaimsVolumeChart,
        renderPortfolioCompositionChart,
        renderTPAComparisonChart,
        renderReserveAccuracyChart,
        renderSavingsChart,
        renderUtilizationChart,
        renderMiniTrendChart,
        chartInstances
    };
}
