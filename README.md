# TPA Operations Performance Dashboard

> **Portfolio Demonstration** | Created by William Namayi for TPA Operations Sr. Performance Analyst Role at Zurich Insurance

![Dashboard Preview](https://img.shields.io/badge/Status-Live%20Demo-success) ![Tech Stack](https://img.shields.io/badge/Tech-HTML%20%7C%20CSS%20%7C%20JavaScript-blue) ![Data Points](https://img.shields.io/badge/Data%20Points-5000%2B%20Claims-orange)

---

## 🎯 Overview

This interactive dashboard demonstrates my capabilities in **data governance**, **performance analytics**, and **benefit realization tracking**—the three core competencies for the TPA Operations Sr. Performance Analyst role.

The dashboard provides comprehensive oversight of Third-Party Administrator (TPA) operations, including:
- Real-time performance monitoring across 5 major TPAs
- Claims data quality and governance tracking
- Strategic initiative ROI analysis
- Predictive insights and trend analysis

---

## ✨ Key Features

### 1. **Executive Overview**
- **5 KPI Cards** with real-time metrics and trend indicators
- Claims volume tracking with month-over-month comparisons
- Portfolio composition analysis
- High-risk claim identification (claims pending >90 days)

### 2. **Performance Analytics**
- **TPA Performance Comparison**: Side-by-side metrics across providers
- **Reserve Accuracy Analysis**: Scatter plot showing estimate vs. actual
- **Detailed Performance Table**: Sortable table with 8 key metrics per TPA
- Interactive filtering by TPA, claim type, and date range

### 3. **Strategic Initiatives & Benefit Realization**
- **4 Active Programs** tracked:
  - Nurse Triage Program
  - Telemedicine Initiative
  - Complex Case Units
  - AI Fraud Detection
- ROI calculations with target vs. actual performance
- Utilization trends over time
- Progress indicators for each initiative

### 4. **Data Governance & Quality**
- **Claims Mart** data integrity monitoring
- Orphaned transaction tracking
- Data lag analysis (average days)
- Reconciliation variance metrics
- **Quality Heatmap**: Monthly data quality scores by TPA (12-month view)

---

## 📊 Technical Approach

### Data Model
The dashboard uses **synthetically generated data** that mirrors real TPA operations:

- **5,000+ Claims Records** across 5 TPAs (Sedgwick, Gallagher Bassett, Crawford, ESIS, Broadspire)
- **4 Claim Types**: Workers Comp, General Liability, Auto Liability, Property
- **12 Months** of historical performance data
- **4 Strategic Initiatives** with monthly tracking since launch

### Architecture
```
TPA_Dashboard/
├── index.html           # Main dashboard structure
├── styles.css           # Premium design system
├── data-generator.js    # Realistic data generation
├── charts.js            # Chart.js visualizations
└── dashboard.js         # Application logic & interactivity
```

### Technology Stack
- **HTML5** - Semantic, accessible markup
- **Vanilla CSS** - Custom design system with glassmorphism effects
- **JavaScript (ES6+)** - Modern, performant logic
- **Chart.js 4.4** - Professional data visualizations
- **No build process** - Runs directly in browser

---

## 🚀 How to Run

### Option 1: Local Browser
1. Navigate to the dashboard directory:
   ```bash
   cd "TPA Role Prep/TPA_Dashboard"
   ```

2. Open `index.html` in your browser:
   ```bash
   open index.html  # macOS
   # or simply double-click the file
   ```

### Option 2: Local Server (Recommended)
```bash
cd "TPA Role Prep/TPA_Dashboard"
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

---

## 💡 Methodology & Insights

### Data Governance Philosophy
My approach mirrors how I manage Treasury data flows at Liberty Mutual:

1. **Own the Pipe**: Track data from source (TPA systems) through transformation to reporting
2. **Build Validation Gates**: Automated checks prevent bad data from reaching stakeholders
3. **Provide Lineage**: Every metric traces back to its source for auditability

### Performance Analytics Framework
The dashboard applies the same analytical rigor I use for vendor management:

- **Comparative Analysis**: Identify top/bottom performers across standardized metrics
- **Trend Detection**: Spot deterioration before it becomes critical
- **Root Cause Visibility**: Drill from summary metrics to transaction-level detail

### Benefit Realization Tracking
Strategic initiatives are monitored using the framework I built for Liberty Mutual projects:

1. **Define Success Upfront**: Target utilization, cost savings, ROI
2. **Track Systematically**: Monthly checkpoints vs. baseline
3. **Course-Correct Early**: Flag underperformance when there's time to intervene

---

## 📈 Key Metrics Demonstrated

| Competency | Dashboard Feature | Real-World Application |
|-----------|------------------|----------------------|
| **Data Governance** | Claims Mart quality heatmap | Ensuring TPA data integrity for accurate reporting |
| **Performance Analytics** | TPA comparison charts | Identifying underperforming vendors for contract review |
| **Benefit Realization** | Initiative ROI tracker | Proving telemedicine program delivers promised savings |
| **Operational Excellence** | Pending claims alerts | Proactive risk management for claims >90 days |

---

## 🎨 Design Philosophy

**Goal**: Create a dashboard that William Schwartz would actually want to use daily.

**Principles**:
- **Clarity**: Most important metrics visible at a glance
- **Context**: Every number includes trend direction and comparison
- **Action**: Highlight issues that need intervention (e.g., pending claims >90 days)
- **Aesthetics**: Modern, professional design that reflects operational maturity

**Color Scheme**:
- Primary Blue (#4A90E2): Performance metrics
- Success Green (#4A9D6E): Positive trends, targets met
- Warning Orange (#E2A24A): Metrics needing attention
- Danger Red (#E25A4A): Critical issues

---

## 🔮 Future Enhancements

If this were a production tool, I would add:

1. **Real-Time Alerts**: Email/Slack notifications for SLA breaches
2. **Drill-Down Capability**: Click any TPA to see claim-level detail
3. **Predictive Analytics**: ML models for reserve adequacy
4. **Custom Report Builder**: Stakeholder-specific views
5. **API Integration**: Live connections to TPA Claims Administration Systems
6. **Mobile Responsive**: Full functionality on tablets/phones

---

## 📝 Data Dictionary

### Claims Data
- **Claim ID**: Unique identifier (CLM-XXXXXX)
- **TPA**: Third-party administrator handling the claim
- **Claim Type**: WC, GL, Auto, Property
- **Status**: Open, Closed, Pending Investigation, In Litigation
- **Days Open**: Calendar days since report date
- **Incurred Amount**: Total cost (paid + reserves)
- **Reserve Accuracy**: Initial reserve vs. final settlement (closed claims only)

### Performance Metrics
- **Closing Ratio**: % of claims closed vs. total claims
- **Avg Days to Close**: Mean time from report to closure
- **Reserve Accuracy**: Avg % variance between initial reserve and final cost
- **Litigation Rate**: % of claims entering litigation
- **Data Quality Score**: Composite metric (0-1 scale)

### Governance Metrics
- **Orphaned Transactions**: Claims with missing/invalid data linkages
- **Data Lag**: Avg days between claim activity and system update
- **Reconciliation Variance**: % difference between TPA and internal records

---

## 🤝 Contact & Feedback

**Created by**: William Namayi  
**Purpose**: Portfolio demonstration for TPA Operations Sr. Performance Analyst role  
**Date**: January 2026

This dashboard represents how I would approach TPA performance monitoring at Zurich—applying the same governance frameworks, analytical discipline, and benefit realization tracking I've developed managing $400M+ in operational programs at Liberty Mutual.

---

## 📄 License

This is a portfolio demonstration project. All data is synthetically generated for illustration purposes.
