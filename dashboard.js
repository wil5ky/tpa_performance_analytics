/**
 * TPA Dashboard Main Application
 * Handles data loading, filtering, KPI calculations, and UI updates
 */

// Global state
let dashboardData = null;
let filteredData = null;
let filters = {
    tpas: [],
    claimType: 'all',
    dateRange: 90
};

/**
 * Initialize Dashboard
 */
async function initializeDashboard() {
    try {
        console.log('Initializing TPA Dashboard...');

        // Generate data
        dashboardData = generateAllData();
        filteredData = dashboardData;

        console.log('Data loaded:', {
            claims: dashboardData.claims.length,
            tpas: dashboardData.metadata.tpas.length,
            initiatives: dashboardData.initiatives.length
        });

        // Initialize filters
        initializeFilters();

        // Render all components
        renderDashboard();

        // Hide loading overlay
        setTimeout(() => {
            document.getElementById('loadingOverlay').classList.add('hidden');
        }, 800);

        console.log('Dashboard initialized successfully');

    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Error loading dashboard. Please refresh the page.');
    }
}

/**
 * Initialize filter dropdowns
 */
function initializeFilters() {
    // Update last updated date
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Populate TPA filter
    const tpaFilter = document.getElementById('tpaFilter');
    dashboardData.metadata.tpas.forEach(tpa => {
        const option = document.createElement('option');
        option.value = tpa.id;
        option.textContent = tpa.name;
        tpaFilter.appendChild(option);
    });

    // Event listeners
    document.getElementById('tpaFilter').addEventListener('change', handleFilterChange);
    document.getElementById('claimTypeFilter').addEventListener('change', handleFilterChange);
    document.getElementById('dateRangeFilter').addEventListener('change', handleFilterChange);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    document.getElementById('exportData').addEventListener('click', exportReport);
    document.getElementById('exportTable')?.addEventListener('click', exportTable);

    // Initialize page navigation
    initializePageNavigation();
}

/**
 * Initialize page navigation system
 */
function initializePageNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link[data-page]');
    const pages = document.querySelectorAll('.dashboard-page[data-page]');

    // Mobile menu elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');

    // Function to navigate to a page
    function navigateToPage(targetPage) {
        // Update desktop nav links
        navLinks.forEach(l => l.classList.remove('active'));
        navLinks.forEach(l => {
            if (l.dataset.page === targetPage) l.classList.add('active');
        });

        // Update mobile nav links
        mobileNavLinks.forEach(l => l.classList.remove('active'));
        mobileNavLinks.forEach(l => {
            if (l.dataset.page === targetPage) l.classList.add('active');
        });

        // Show target page, hide others
        pages.forEach(page => {
            if (page.dataset.page === targetPage) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // Scroll to top of main content
        document.querySelector('.dashboard-main').scrollIntoView({ behavior: 'smooth' });
    }

    // Desktop nav click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navigateToPage(e.target.dataset.page);
        });
    });

    // Mobile nav click handlers
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navigateToPage(e.target.dataset.page);
            closeMobileMenu();
        });
    });

    // Mobile menu toggle functions
    function openMobileMenu() {
        if (mobileNavOverlay) {
            mobileNavOverlay.style.display = 'flex';
            setTimeout(() => {
                mobileNavOverlay.classList.add('active');
            }, 10);
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.remove('active');
            setTimeout(() => {
                mobileNavOverlay.style.display = 'none';
            }, 250);
            document.body.style.overflow = '';
        }
    }

    // Mobile menu button click
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    // Mobile close button click
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileMenu);
    }

    // Close on overlay background click
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', (e) => {
            if (e.target === mobileNavOverlay) {
                closeMobileMenu();
            }
        });
    }
}

/**
 * Handle filter changes
 */
function handleFilterChange() {
    const tpaFilter = document.getElementById('tpaFilter');
    const selectedTpas = Array.from(tpaFilter.selectedOptions)
        .map(opt => opt.value)
        .filter(val => val !== 'all');

    filters.tpas = selectedTpas;
    filters.claimType = document.getElementById('claimTypeFilter').value;
    filters.dateRange = parseInt(document.getElementById('dateRangeFilter').value);

    applyFilters();
    renderDashboard();
}

/**
 * Reset filters
 */
function resetFilters() {
    document.getElementById('tpaFilter').value = 'all';
    document.getElementById('claimTypeFilter').value = 'all';
    document.getElementById('dateRangeFilter').value = '90';

    filters = { tpas: [], claimType: 'all', dateRange: 90 };
    filteredData = dashboardData;
    renderDashboard();
}

/**
 * Apply filters to data
 */
function applyFilters() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.dateRange);

    // Filter claims
    let claims = dashboardData.claims.filter(claim => {
        const reportDate = new Date(claim.reportDate);
        const dateMatch = reportDate >= cutoffDate;
        const tpaMatch = filters.tpas.length === 0 || filters.tpas.includes(claim.tpaId);
        const typeMatch = filters.claimType === 'all' || claim.claimType === filters.claimType;

        return dateMatch && tpaMatch && typeMatch;
    });

    filteredData = {
        ...dashboardData,
        claims
    };
}

/**
 * Main render function
 */
function renderDashboard() {
    renderKPIs();
    renderCharts();
    renderTPATable();
    renderInitiatives();
    renderDataGovernance();
}

/**
 * Render KPI Cards
 */
function renderKPIs() {
    const claims = filteredData.claims;

    // Total claims
    const totalClaims = claims.length;
    document.getElementById('kpiTotalClaims').textContent = totalClaims.toLocaleString();

    // Calculate month-over-month change
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const lastMonthClaims = claims.filter(c => {
        const d = new Date(c.reportDate);
        return d >= lastMonth && d < now;
    }).length;

    const prevMonthClaims = claims.filter(c => {
        const d = new Date(c.reportDate);
        return d >= twoMonthsAgo && d < lastMonth;
    }).length;

    const claimsChange = prevMonthClaims > 0
        ? ((lastMonthClaims - prevMonthClaims) / prevMonthClaims * 100).toFixed(1)
        : 0;

    const changeElem = document.getElementById('kpiClaimsChange');
    changeElem.textContent = `${Math.abs(claimsChange)}% vs last month`;
    changeElem.className = 'kpi-change ' + (claimsChange >= 0 ? 'positive' : 'negative');

    // Average closing ratio
    const closedClaims = claims.filter(c => c.status === 'Closed').length;
    const closingRatio = totalClaims > 0 ? (closedClaims / totalClaims * 100).toFixed(1) : 0;
    document.getElementById('kpiClosingRatio').textContent = closingRatio + '%';

    const closingChangeElem = document.getElementById('kpiClosingChange');
    closingChangeElem.textContent = '+2.3% vs last month';
    closingChangeElem.className = 'kpi-change positive';

    // Total savings from initiatives
    const totalSavings = dashboardData.initiativePerformance.reduce((sum, p) => sum + p.totalSavings, 0);
    document.getElementById('kpiSavings').textContent = '$' + (totalSavings / 1000000).toFixed(2) + 'M';

    const savingsChangeElem = document.getElementById('kpiSavingsChange');
    savingsChangeElem.textContent = '+15% YTD';
    savingsChangeElem.className = 'kpi-change positive';

    // Data quality score
    const latestGovMetrics = dashboardData.governance
        .sort((a, b) => b.year - a.year || b.month - a.month)
        .slice(0, dashboardData.metadata.tpas.length);

    const avgDataQuality = latestGovMetrics.reduce((sum, m) => sum + m.dataQualityScore, 0) / latestGovMetrics.length;
    document.getElementById('kpiDataQuality').textContent = (avgDataQuality * 100).toFixed(1) + '%';

    const qualityChangeElem = document.getElementById('kpiDataQualityChange');
    qualityChangeElem.textContent = '+3.2% improvement';
    qualityChangeElem.className = 'kpi-change positive';

    // Claims pending > 90 days
    const pendingClaims = claims.filter(c => c.status !== 'Closed' && c.daysOpen > 90).length;
    document.getElementById('kpiPendingClaims').textContent = pendingClaims;
    document.getElementById('kpiPendingSubtext').textContent =
        pendingClaims > 50 ? 'Requires attention' : 'Within target';
}

/**
 * Render all charts
 */
function renderCharts() {
    renderClaimsVolumeChart(filteredData);
    renderPortfolioCompositionChart(filteredData);
    renderTPAComparisonChart(filteredData);
    renderReserveAccuracyChart(filteredData);
    renderSavingsChart(dashboardData); // Use full dataset for initiatives
    renderUtilizationChart(dashboardData);
}

/**
 * Render TPA Performance Table
 */
function renderTPATable() {
    const tbody = document.getElementById('tpaPerformanceBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Calculate metrics per TPA
    const tpaData = {};

    dashboardData.metadata.tpas.forEach(tpa => {
        const tpaClaims = filteredData.claims.filter(c => c.tpaId === tpa.id);
        const tpaPerf = dashboardData.performance.filter(p => p.tpaId === tpa.id);
        const tpaGov = dashboardData.governance.filter(g => g.tpaId === tpa.id);

        const closedClaims = tpaClaims.filter(c => c.status === 'Closed').length;
        const closingRatio = tpaClaims.length > 0 ? (closedClaims / tpaClaims.length) : 0;

        // Average metrics
        const avgDaysToClose = tpaPerf.reduce((sum, p) => sum + p.avgDaysToClose, 0) / tpaPerf.length;
        const avgReserveAcc = tpaPerf.reduce((sum, p) => sum + p.reserveAccuracy, 0) / tpaPerf.length;
        const avgLitigationRate = tpaPerf.reduce((sum, p) => sum + p.litigationRate, 0) / tpaPerf.length;
        const avgDataQuality = tpaGov.reduce((sum, g) => sum + g.dataQualityScore, 0) / tpaGov.length;

        tpaData[tpa.id] = {
            name: tpa.name,
            system: tpa.system,
            volume: tpaClaims.length,
            closingRatio,
            avgDaysToClose,
            reserveAccuracy: avgReserveAcc,
            litigationRate: avgLitigationRate,
            dataQuality: avgDataQuality
        };
    });

    // Render rows
    Object.values(tpaData).forEach(tpa => {
        const row = document.createElement('tr');

        row.innerHTML = `
      <td><strong>${tpa.name}</strong></td>
      <td>${tpa.system}</td>
      <td>${tpa.volume.toLocaleString()}</td>
      <td><span class="${tpa.closingRatio > 0.75 ? 'text-success' : 'text-warning'}">${(tpa.closingRatio * 100).toFixed(1)}%</span></td>
      <td>${Math.round(tpa.avgDaysToClose)} days</td>
      <td><span class="${tpa.reserveAccuracy > 0.90 ? 'text-success' : 'text-warning'}">${(tpa.reserveAccuracy * 100).toFixed(1)}%</span></td>
      <td><span class="${tpa.litigationRate < 0.08 ? 'text-success' : 'text-danger'}">${(tpa.litigationRate * 100).toFixed(1)}%</span></td>
      <td><span class="${tpa.dataQuality > 0.90 ? 'text-success' : 'text-warning'}">${(tpa.dataQuality * 100).toFixed(1)}%</span></td>
    `;

        tbody.appendChild(row);
    });
}

/**
 * Render Strategic Initiatives
 */
function renderInitiatives() {
    const grid = document.getElementById('initiativesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    dashboardData.initiatives.forEach(init => {
        const initPerf = dashboardData.initiativePerformance.filter(p => p.initiativeId === init.id);

        // Calculate totals
        const totalSavings = initPerf.reduce((sum, p) => sum + p.totalSavings, 0);
        const totalTarget = initPerf.reduce((sum, p) => sum + p.targetSavings, 0);
        const avgUtilization = initPerf.reduce((sum, p) => sum + p.actualUtilization, 0) / initPerf.length;
        const roi = totalTarget > 0 ? (totalSavings / totalTarget * 100) : 0;

        const card = document.createElement('div');
        card.className = 'initiative-card';

        card.innerHTML = `
      <div class="initiative-header">
        <h3 class="initiative-title">${init.name}</h3>
        <span class="initiative-status-badge ${init.status.toLowerCase()}">${init.status}</span>
      </div>
      <p class="initiative-description">${init.description}</p>
      <div class="initiative-metrics">
        <div class="metric-row">
          <span class="metric-label">Launch Date</span>
          <span class="metric-value">${new Date(init.launchDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Utilization Rate</span>
          <span class="metric-value">${(avgUtilization * 100).toFixed(1)}%</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Total Savings</span>
          <span class="metric-value text-success">$${(totalSavings / 1000).toFixed(0)}K</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">ROI vs Target</span>
          <span class="metric-value ${roi >= 100 ? 'text-success' : 'text-warning'}">${roi.toFixed(0)}%</span>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.min(roi, 100)}%"></div>
      </div>
    `;

        grid.appendChild(card);
    });
}

/**
 * Render Data Governance Section
 */
function renderDataGovernance() {
    // Get latest 12 months of governance data
    const sortedGov = dashboardData.governance
        .sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));

    const latest = sortedGov.slice(-dashboardData.metadata.tpas.length);
    const historical = sortedGov.slice(-60); // Last 5 months * 12 TPAs... adjust as needed

    // Calculate average metrics
    const avgOrphaned = latest.reduce((sum, g) => sum + g.orphanedTransactionRate, 0) / latest.length;
    const avgDataLag = latest.reduce((sum, g) => sum + g.avgDataLagDays, 0) / latest.length;
    const avgReconcVar = latest.reduce((sum, g) => sum + g.reconciliationVariance, 0) / latest.length;

    document.getElementById('govOrphanedRate').textContent = (avgOrphaned * 100).toFixed(2) + '%';
    document.getElementById('govDataLag').textContent = avgDataLag.toFixed(1) + ' days';
    document.getElementById('govReconcVar').textContent = (avgReconcVar * 100).toFixed(2) + '%';

    // Trends
    document.getElementById('govOrphanedTrend').textContent = '↓ 15% improvement';
    document.getElementById('govOrphanedTrend').className = 'metric-trend text-success';

    document.getElementById('govDataLagTrend').textContent = '↓ 22% improvement';
    document.getElementById('govDataLagTrend').className = 'metric-trend text-success';

    document.getElementById('govReconcTrend').textContent = '↓ 18% improvement';
    document.getElementById('govReconcTrend').className = 'metric-trend text-success';

    // Render mini trend charts
    const last12Months = sortedGov.slice(-12 * dashboardData.metadata.tpas.length);

    // Group by month and average
    const monthlyAvg = {};
    last12Months.forEach(g => {
        const key = `${g.year}-${String(g.month).padStart(2, '0')}`;
        if (!monthlyAvg[key]) {
            monthlyAvg[key] = { orphaned: [], dataLag: [], reconcVar: [] };
        }
        monthlyAvg[key].orphaned.push(g.orphanedTransactionRate);
        monthlyAvg[key].dataLag.push(g.avgDataLagDays);
        monthlyAvg[key].reconcVar.push(g.reconciliationVariance);
    });

    const months = Object.keys(monthlyAvg).sort().slice(-12);

    const orphanedData = months.map(m => {
        const arr = monthlyAvg[m].orphaned;
        return (arr.reduce((a, b) => a + b, 0) / arr.length * 100);
    });

    const dataLagData = months.map(m => {
        const arr = monthlyAvg[m].dataLag;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    });

    const reconcVarData = months.map(m => {
        const arr = monthlyAvg[m].reconcVar;
        return (arr.reduce((a, b) => a + b, 0) / arr.length * 100);
    });

    renderMiniTrendChart('orphanedTrendChart', orphanedData, '#E25A4A');
    renderMiniTrendChart('dataLagTrendChart', dataLagData, '#E2A24A');
    renderMiniTrendChart('reconcVarTrendChart', reconcVarData, '#4A90E2');

    // Render quality heatmap
    renderQualityHeatmap(sortedGov);
}

/**
 * Render Quality Heatmap
 */
function renderQualityHeatmap(govData) {
    const heatmap = document.getElementById('qualityHeatmap');
    if (!heatmap) return;

    heatmap.innerHTML = '';

    // Get last 12 months
    const months = [...new Set(govData.map(g => `${g.year}-${String(g.month).padStart(2, '0')}`))].sort().slice(-12);
    const monthLabels = months.map(m => {
        const [year, month] = m.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'short' });
    });

    // Header row
    const headerRow = document.createElement('div');
    headerRow.className = 'heatmap-row';
    headerRow.innerHTML = '<div class="heatmap-label">TPA</div>' +
        monthLabels.map(m => `<div class="heatmap-label" style="font-size: 0.65rem; text-align: center;">${m}</div>`).join('');
    heatmap.appendChild(headerRow);

    // TPA rows
    dashboardData.metadata.tpas.forEach(tpa => {
        const row = document.createElement('div');
        row.className = 'heatmap-row';

        let rowHTML = `<div class="heatmap-label">${tpa.name}</div>`;

        months.forEach(monthKey => {
            const [year, month] = monthKey.split('-');
            const metric = govData.find(g =>
                g.tpaId === tpa.id &&
                g.year === parseInt(year) &&
                g.month === parseInt(month)
            );

            if (metric) {
                const score = metric.dataQualityScore;
                const color = getHeatmapColor(score);
                const displayScore = (score * 100).toFixed(0);

                rowHTML += `<div class="heatmap-cell" style="background: ${color};" title="${tpa.name} - ${monthKey}: ${displayScore}%">
          ${displayScore}
        </div>`;
            } else {
                rowHTML += `<div class="heatmap-cell" style="background: rgba(255,255,255,0.05);">-</div>`;
            }
        });

        row.innerHTML = rowHTML;
        heatmap.appendChild(row);
    });
}

/**
 * Get heatmap color based on score (Zurich palette)
 */
function getHeatmapColor(score) {
    // Green for good, red for poor (Zurich palette)
    if (score >= 0.92) return 'rgba(46, 139, 87, 0.8)'; // Excellent - green
    if (score >= 0.88) return 'rgba(46, 139, 87, 0.5)'; // Good - light green
    if (score >= 0.85) return 'rgba(74, 125, 184, 0.5)'; // Fair - blue
    if (score >= 0.80) return 'rgba(74, 125, 184, 0.7)'; // Needs attention - darker blue
    return 'rgba(214, 69, 53, 0.7)'; // Poor - red
}

/**
 * Export report to CSV
 */
function exportReport() {
    alert('Export functionality would generate a comprehensive CSV report with all metrics.');
    console.log('Export requested for:', filteredData);
}

/**
 * Export table to CSV
 */
function exportTable() {
    alert('Table export would download TPA performance summary as CSV.');
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', initializeDashboard);
