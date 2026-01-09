/**
 * TPA Dashboard Data Generator
 * Generates realistic TPA operational data for portfolio demonstration
 */

// Configuration
const CONFIG = {
    tpas: [
        { id: 'SEDG', name: 'Sedgwick', system: 'ViaOne', color: '#2E5C8A' },
        { id: 'GBAS', name: 'Gallagher Bassett', system: 'Luminos', color: '#4A7C59' },
        { id: 'CRAW', name: 'Crawford & Company', system: 'IntelliRisk', color: '#8B5A3C' },
        { id: 'ESIS', name: 'ESIS', system: 'ClaimIQ', color: '#6B4C7C' },
        { id: 'BRDP', name: 'Broadspire', system: 'Origami', color: '#A67C52' }
    ],
    claimTypes: ['Workers Comp', 'General Liability', 'Auto Liability', 'Property'],
    statuses: ['Open', 'Closed', 'Pending Investigation', 'In Litigation'],
    numClaims: 5000,
    monthsOfHistory: 12
};

// Utility Functions
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function weightedRandom(weights) {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) return i;
    }
    return weights.length - 1;
}

function normalDistribution(mean, stdDev) {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
}

// Generate Claims Data
function generateClaims() {
    const claims = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - CONFIG.monthsOfHistory);

    for (let i = 0; i < CONFIG.numClaims; i++) {
        const tpa = CONFIG.tpas[randomInt(0, CONFIG.tpas.length - 1)];
        const claimType = CONFIG.claimTypes[randomInt(0, CONFIG.claimTypes.length - 1)];
        const reportDate = randomDate(startDate, endDate);

        // Status distribution: 60% Closed, 25% Open, 10% Pending, 5% Litigation
        const statusIndex = weightedRandom([60, 25, 10, 5]);
        const status = CONFIG.statuses[statusIndex];

        const isClosed = status === 'Closed';
        const daysOpen = isClosed
            ? randomInt(30, 365)
            : Math.floor((endDate - reportDate) / (1000 * 60 * 60 * 24));

        const closeDate = isClosed
            ? new Date(reportDate.getTime() + daysOpen * 24 * 60 * 60 * 1000)
            : null;

        // Financial amounts based on claim type
        let incurredAmount;
        switch (claimType) {
            case 'Workers Comp':
                incurredAmount = randomFloat(5000, 150000);
                break;
            case 'General Liability':
                incurredAmount = randomFloat(10000, 500000);
                break;
            case 'Auto Liability':
                incurredAmount = randomFloat(8000, 200000);
                break;
            case 'Property':
                incurredAmount = randomFloat(3000, 100000);
                break;
        }

        const paidAmount = isClosed
            ? incurredAmount * randomFloat(0.85, 1.0)
            : incurredAmount * randomFloat(0.3, 0.7);

        const reserveAmount = isClosed ? 0 : incurredAmount - paidAmount;

        // Reserve accuracy (how close initial reserve was to final)
        const reserveAccuracy = isClosed
            ? randomFloat(0.75, 1.25) // 75% to 125% of actual
            : null;

        // Data quality flags
        const hasDataIssue = Math.random() < 0.08; // 8% have some issue
        const dataQualityIssues = [];

        if (hasDataIssue) {
            const issues = [
                'Missing adjuster assignment',
                'Orphaned transaction',
                'Reserve not updated (>30 days)',
                'Missing documentation',
                'Incorrect claim type coding'
            ];
            dataQualityIssues.push(issues[randomInt(0, issues.length - 1)]);
        }

        claims.push({
            claimId: `CLM-${String(i + 10000).padStart(6, '0')}`,
            tpaId: tpa.id,
            tpaName: tpa.name,
            claimType,
            status,
            reportDate: reportDate.toISOString().split('T')[0],
            closeDate: closeDate ? closeDate.toISOString().split('T')[0] : null,
            daysOpen,
            incurredAmount: Math.round(incurredAmount),
            paidAmount: Math.round(paidAmount),
            reserveAmount: Math.round(reserveAmount),
            reserveAccuracy,
            inLitigation: status === 'In Litigation',
            dataQualityIssues,
            hasDataIssue
        });
    }

    return claims;
}

// Generate Monthly Performance Metrics
function generatePerformanceMetrics(claims) {
    const metrics = [];
    const months = [];

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            monthName: date.toLocaleString('default', { month: 'short', year: 'numeric' })
        });
    }

    CONFIG.tpas.forEach(tpa => {
        // Each TPA has baseline performance with some variation
        const baseClosingRatio = randomFloat(0.65, 0.85);
        const baseDaysToClose = randomFloat(45, 120);
        const baseReserveAccuracy = randomFloat(0.85, 0.95);
        const baseLitigationRate = randomFloat(0.03, 0.12);
        const baseDataQuality = randomFloat(0.88, 0.96);

        months.forEach(month => {
            // Add monthly variation
            const closingRatio = Math.max(0.5, Math.min(1.0,
                baseClosingRatio + normalDistribution(0, 0.05)));
            const avgDaysToClose = Math.max(30,
                baseDaysToClose + normalDistribution(0, 10));
            const reserveAccuracy = Math.max(0.7, Math.min(1.0,
                baseReserveAccuracy + normalDistribution(0, 0.03)));
            const litigationRate = Math.max(0, Math.min(0.2,
                baseLitigationRate + normalDistribution(0, 0.02)));
            const dataQualityScore = Math.max(0.7, Math.min(1.0,
                baseDataQuality + normalDistribution(0, 0.03)));

            // Calculate claim volumes for this month/TPA
            const monthStart = new Date(month.year, month.month - 1, 1);
            const monthEnd = new Date(month.year, month.month, 0);

            const monthClaims = claims.filter(c => {
                const reportDate = new Date(c.reportDate);
                return c.tpaId === tpa.id &&
                    reportDate >= monthStart &&
                    reportDate <= monthEnd;
            });

            metrics.push({
                tpaId: tpa.id,
                tpaName: tpa.name,
                year: month.year,
                month: month.month,
                monthName: month.monthName,
                claimVolume: monthClaims.length,
                closingRatio: parseFloat(closingRatio.toFixed(3)),
                avgDaysToClose: Math.round(avgDaysToClose),
                reserveAccuracy: parseFloat(reserveAccuracy.toFixed(3)),
                litigationRate: parseFloat(litigationRate.toFixed(3)),
                dataQualityScore: parseFloat(dataQualityScore.toFixed(3))
            });
        });
    });

    return metrics;
}

// Generate Strategic Initiatives Data
function generateStrategicInitiatives() {
    const initiatives = [
        {
            id: 'INIT-001',
            name: 'Nurse Triage Program',
            description: 'Early intervention nurse triage for workers comp claims',
            launchDate: '2025-03-01',
            targetUtilization: 0.25, // 25% of eligible claims
            targetSavingsPerClaim: 3500,
            status: 'Active'
        },
        {
            id: 'INIT-002',
            name: 'Telemedicine Initiative',
            description: 'Virtual medical consultations for minor injuries',
            launchDate: '2025-05-15',
            targetUtilization: 0.20,
            targetSavingsPerClaim: 2200,
            status: 'Active'
        },
        {
            id: 'INIT-003',
            name: 'Complex Case Units',
            description: 'Specialized handling for high-severity claims',
            launchDate: '2025-08-01',
            targetUtilization: 0.08,
            targetSavingsPerClaim: 8500,
            status: 'Active'
        },
        {
            id: 'INIT-004',
            name: 'AI Fraud Detection',
            description: 'Machine learning model for fraud pattern detection',
            launchDate: '2025-10-01',
            targetUtilization: 1.0, // Applies to all claims
            targetSavingsPerClaim: 450,
            status: 'Pilot'
        }
    ];

    // Generate monthly performance for each initiative
    const initiativePerformance = [];

    initiatives.forEach(init => {
        const launchDate = new Date(init.launchDate);
        const currentDate = new Date();

        // Generate metrics for each month since launch
        let monthsSinceLaunch = 0;
        const initDate = new Date(launchDate);

        while (initDate <= currentDate) {
            monthsSinceLaunch++;

            // Utilization ramps up over time (sigmoid curve)
            const rampUpFactor = 1 / (1 + Math.exp(-(monthsSinceLaunch - 3) / 1.5));
            const actualUtilization = init.targetUtilization * rampUpFactor * randomFloat(0.85, 1.05);

            // Savings per claim varies around target
            const actualSavingsPerClaim = init.targetSavingsPerClaim * randomFloat(0.9, 1.15);

            // Calculate eligible claims (varies by initiative type)
            let eligibleClaims;
            if (init.name === 'Nurse Triage Program') {
                eligibleClaims = randomInt(180, 220); // Workers comp claims per month
            } else if (init.name === 'Telemedicine Initiative') {
                eligibleClaims = randomInt(150, 190);
            } else if (init.name === 'Complex Case Units') {
                eligibleClaims = randomInt(40, 60);
            } else {
                eligibleClaims = randomInt(400, 450); // All claims
            }

            const claimsUtilized = Math.round(eligibleClaims * actualUtilization);
            const totalSavings = claimsUtilized * actualSavingsPerClaim;
            const targetSavings = eligibleClaims * init.targetUtilization * init.targetSavingsPerClaim;

            initiativePerformance.push({
                initiativeId: init.id,
                initiativeName: init.name,
                year: initDate.getFullYear(),
                month: initDate.getMonth() + 1,
                monthName: initDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
                eligibleClaims,
                claimsUtilized,
                actualUtilization: parseFloat(actualUtilization.toFixed(3)),
                targetUtilization: init.targetUtilization,
                actualSavingsPerClaim: Math.round(actualSavingsPerClaim),
                targetSavingsPerClaim: init.targetSavingsPerClaim,
                totalSavings: Math.round(totalSavings),
                targetSavings: Math.round(targetSavings),
                roi: parseFloat(((totalSavings / targetSavings) * 100).toFixed(1))
            });

            initDate.setMonth(initDate.getMonth() + 1);
        }
    });

    return {
        initiatives,
        performance: initiativePerformance
    };
}

// Generate Data Governance Metrics
function generateDataGovernanceMetrics() {
    const metrics = [];
    const months = [];

    // Last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push({
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            monthName: date.toLocaleString('default', { month: 'short', year: 'numeric' })
        });
    }

    CONFIG.tpas.forEach(tpa => {
        // Baseline metrics with trend improvement over time
        const baseOrphanedRate = randomFloat(0.05, 0.12);
        const baseDataLag = randomFloat(1.5, 4.5); // days
        const baseReconciliationVariance = randomFloat(0.02, 0.08);

        months.forEach((month, idx) => {
            // Improve over time (trend down for bad metrics)
            const improvementFactor = Math.max(0.5, 1 - (idx * 0.04));

            const orphanedTransactionRate = Math.max(0.02,
                baseOrphanedRate * improvementFactor + normalDistribution(0, 0.01));
            const avgDataLagDays = Math.max(0.5,
                baseDataLag * improvementFactor + normalDistribution(0, 0.3));
            const reconciliationVariance = Math.max(0.005,
                baseReconciliationVariance * improvementFactor + normalDistribution(0, 0.01));

            // Composite score (higher is better)
            const dataQualityScore = 1 - (
                (orphanedTransactionRate * 0.4) +
                (Math.min(avgDataLagDays / 10, 1) * 0.3) +
                (reconciliationVariance * 0.3)
            );

            metrics.push({
                tpaId: tpa.id,
                tpaName: tpa.name,
                system: tpa.system,
                year: month.year,
                month: month.month,
                monthName: month.monthName,
                orphanedTransactionRate: parseFloat(orphanedTransactionRate.toFixed(4)),
                avgDataLagDays: parseFloat(avgDataLagDays.toFixed(2)),
                reconciliationVariance: parseFloat(reconciliationVariance.toFixed(4)),
                dataQualityScore: parseFloat(Math.max(0, Math.min(1, dataQualityScore)).toFixed(3)),
                totalTransactions: randomInt(8000, 12000),
                errorCount: Math.round(randomInt(8000, 12000) * orphanedTransactionRate)
            });
        });
    });

    return metrics;
}

// Main data generation function
function generateAllData() {
    console.log('Generating TPA dashboard data...');

    const claims = generateClaims();
    console.log(`✓ Generated ${claims.length} claims`);

    const performanceMetrics = generatePerformanceMetrics(claims);
    console.log(`✓ Generated ${performanceMetrics.length} performance records`);

    const { initiatives, performance: initiativePerformance } = generateStrategicInitiatives();
    console.log(`✓ Generated ${initiatives.length} strategic initiatives`);
    console.log(`✓ Generated ${initiativePerformance.length} initiative performance records`);

    const governanceMetrics = generateDataGovernanceMetrics();
    console.log(`✓ Generated ${governanceMetrics.length} data governance records`);

    return {
        metadata: {
            generatedAt: new Date().toISOString(),
            tpas: CONFIG.tpas,
            claimTypes: CONFIG.claimTypes,
            statuses: CONFIG.statuses,
            timeRange: {
                start: new Date(Date.now() - CONFIG.monthsOfHistory * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end: new Date().toISOString().split('T')[0]
            }
        },
        claims,
        performance: performanceMetrics,
        initiatives,
        initiativePerformance,
        governance: governanceMetrics
    };
}

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateAllData, CONFIG };
}
