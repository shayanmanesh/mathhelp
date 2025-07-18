// A/B Testing Dashboard for Educational Experiments
// Visual management and real-time analysis of experiments

class ABTestingDashboard {
  constructor(config = {}) {
    this.config = {
      framework: config.framework || window.educationalAB,
      containerId: config.containerId || 'ab-testing-dashboard',
      updateInterval: config.updateInterval || 30000, // 30 seconds
      chartLibrary: config.chartLibrary || 'chart.js',
      theme: config.theme || 'light'
    };
    
    this.charts = new Map();
    this.activeView = 'overview';
    this.selectedExperiment = null;
    this.updateTimer = null;
    
    this.init();
  }

  init() {
    this.createDashboardStructure();
    this.loadChartLibrary();
    this.renderDashboard();
    this.setupEventListeners();
    this.startAutoUpdate();
  }

  // ============================================
  // DASHBOARD STRUCTURE
  // ============================================

  createDashboardStructure() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.error('Dashboard container not found');
      return;
    }
    
    container.innerHTML = `
      <div class="ab-dashboard ${this.config.theme}">
        <!-- Header -->
        <div class="dashboard-header">
          <h1>A/B Testing Dashboard</h1>
          <div class="header-controls">
            <button class="btn-refresh" onclick="abDashboard.refresh()">
              <span class="icon">🔄</span> Refresh
            </button>
            <button class="btn-new-experiment" onclick="abDashboard.showNewExperimentModal()">
              <span class="icon">➕</span> New Experiment
            </button>
            <div class="view-switcher">
              <button class="view-btn active" data-view="overview">Overview</button>
              <button class="view-btn" data-view="experiments">Experiments</button>
              <button class="view-btn" data-view="metrics">Metrics</button>
              <button class="view-btn" data-view="reports">Reports</button>
            </div>
          </div>
        </div>
        
        <!-- Main Content -->
        <div class="dashboard-content">
          <!-- Overview View -->
          <div class="view-panel active" id="view-overview">
            <div class="summary-cards">
              <div class="summary-card">
                <h3>Active Experiments</h3>
                <div class="metric-value" id="active-experiments-count">0</div>
                <div class="metric-change positive">↑ 2 this week</div>
              </div>
              
              <div class="summary-card">
                <h3>Total Participants</h3>
                <div class="metric-value" id="total-participants">0</div>
                <div class="metric-subtitle">Across all experiments</div>
              </div>
              
              <div class="summary-card">
                <h3>Significant Results</h3>
                <div class="metric-value" id="significant-results">0</div>
                <div class="metric-subtitle">Ready for decision</div>
              </div>
              
              <div class="summary-card">
                <h3>Average Improvement</h3>
                <div class="metric-value" id="avg-improvement">0%</div>
                <div class="metric-subtitle">Winning variants</div>
              </div>
            </div>
            
            <div class="dashboard-grid">
              <div class="panel experiment-status">
                <h2>Experiment Status</h2>
                <canvas id="experiment-status-chart"></canvas>
              </div>
              
              <div class="panel top-experiments">
                <h2>Top Performing Experiments</h2>
                <div id="top-experiments-list"></div>
              </div>
              
              <div class="panel recent-activity">
                <h2>Recent Activity</h2>
                <div id="activity-feed"></div>
              </div>
              
              <div class="panel learning-impact">
                <h2>Learning Impact</h2>
                <canvas id="learning-impact-chart"></canvas>
              </div>
            </div>
          </div>
          
          <!-- Experiments View -->
          <div class="view-panel" id="view-experiments">
            <div class="experiments-toolbar">
              <div class="search-box">
                <input type="text" placeholder="Search experiments..." id="experiment-search">
              </div>
              <div class="filters">
                <select id="status-filter">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
                <select id="type-filter">
                  <option value="all">All Types</option>
                  <option value="ab">A/B Test</option>
                  <option value="multivariate">Multivariate</option>
                  <option value="factorial">Factorial</option>
                  <option value="sequential">Sequential</option>
                </select>
              </div>
            </div>
            
            <div class="experiments-table-container">
              <table class="experiments-table">
                <thead>
                  <tr>
                    <th>Experiment</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Participants</th>
                    <th>Duration</th>
                    <th>Primary Metric</th>
                    <th>Best Variant</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="experiments-tbody">
                  <!-- Dynamically populated -->
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Metrics View -->
          <div class="view-panel" id="view-metrics">
            <div class="metrics-overview">
              <h2>Key Performance Metrics</h2>
              <div class="metrics-grid" id="metrics-grid">
                <!-- Dynamically populated -->
              </div>
            </div>
            
            <div class="metric-details-panel">
              <h2>Metric Deep Dive</h2>
              <select id="metric-selector">
                <option value="">Select a metric...</option>
              </select>
              <div class="metric-visualization">
                <canvas id="metric-trend-chart"></canvas>
              </div>
              <div class="metric-statistics" id="metric-statistics">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>
          
          <!-- Reports View -->
          <div class="view-panel" id="view-reports">
            <div class="reports-header">
              <h2>Experiment Reports</h2>
              <button class="btn-export" onclick="abDashboard.exportReport()">
                <span class="icon">📊</span> Export Report
              </button>
            </div>
            
            <div class="report-filters">
              <input type="date" id="report-start-date" placeholder="Start Date">
              <input type="date" id="report-end-date" placeholder="End Date">
              <button onclick="abDashboard.generateReport()">Generate Report</button>
            </div>
            
            <div class="report-content" id="report-content">
              <!-- Dynamically generated report -->
            </div>
          </div>
        </div>
        
        <!-- Experiment Detail Modal -->
        <div class="modal" id="experiment-detail-modal">
          <div class="modal-content large">
            <div class="modal-header">
              <h2 id="experiment-detail-title">Experiment Details</h2>
              <button class="modal-close" onclick="abDashboard.closeModal('experiment-detail-modal')">×</button>
            </div>
            <div class="modal-body">
              <div class="experiment-detail-tabs">
                <button class="tab-btn active" data-tab="overview">Overview</button>
                <button class="tab-btn" data-tab="variants">Variants</button>
                <button class="tab-btn" data-tab="metrics">Metrics</button>
                <button class="tab-btn" data-tab="participants">Participants</button>
                <button class="tab-btn" data-tab="timeline">Timeline</button>
              </div>
              
              <div class="tab-content active" id="tab-overview">
                <div class="experiment-summary" id="experiment-summary">
                  <!-- Dynamically populated -->
                </div>
              </div>
              
              <div class="tab-content" id="tab-variants">
                <div class="variants-comparison">
                  <canvas id="variants-performance-chart"></canvas>
                </div>
                <div class="variants-table" id="variants-table">
                  <!-- Dynamically populated -->
                </div>
              </div>
              
              <div class="tab-content" id="tab-metrics">
                <div class="metrics-analysis" id="metrics-analysis">
                  <!-- Dynamically populated -->
                </div>
              </div>
              
              <div class="tab-content" id="tab-participants">
                <div class="participants-breakdown">
                  <canvas id="participants-chart"></canvas>
                </div>
                <div class="participants-stats" id="participants-stats">
                  <!-- Dynamically populated -->
                </div>
              </div>
              
              <div class="tab-content" id="tab-timeline">
                <div class="experiment-timeline" id="experiment-timeline">
                  <!-- Dynamically populated -->
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button class="btn-secondary" onclick="abDashboard.pauseExperiment()">Pause</button>
              <button class="btn-primary" onclick="abDashboard.concludeExperiment()">Conclude</button>
            </div>
          </div>
        </div>
        
        <!-- New Experiment Modal -->
        <div class="modal" id="new-experiment-modal">
          <div class="modal-content">
            <div class="modal-header">
              <h2>Create New Experiment</h2>
              <button class="modal-close" onclick="abDashboard.closeModal('new-experiment-modal')">×</button>
            </div>
            <div class="modal-body">
              <form id="new-experiment-form">
                <div class="form-group">
                  <label for="exp-name">Experiment Name</label>
                  <input type="text" id="exp-name" required>
                </div>
                
                <div class="form-group">
                  <label for="exp-type">Type</label>
                  <select id="exp-type" required>
                    <option value="ab">A/B Test</option>
                    <option value="multivariate">Multivariate</option>
                    <option value="factorial">Factorial</option>
                    <option value="sequential">Sequential</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="exp-clustering">Clustering Level</label>
                  <select id="exp-clustering">
                    <option value="individual">Individual</option>
                    <option value="classroom">Classroom</option>
                    <option value="school">School</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label>Variants</label>
                  <div id="variants-container">
                    <div class="variant-input">
                      <input type="text" placeholder="Control" value="Control" disabled>
                      <input type="number" placeholder="Weight" value="50" min="0" max="100">
                    </div>
                    <div class="variant-input">
                      <input type="text" placeholder="Variant name">
                      <input type="number" placeholder="Weight" value="50" min="0" max="100">
                    </div>
                  </div>
                  <button type="button" onclick="abDashboard.addVariant()">+ Add Variant</button>
                </div>
                
                <div class="form-group">
                  <label>Primary Metrics</label>
                  <div class="checkbox-group">
                    <label><input type="checkbox" value="engagement_time"> Engagement Time</label>
                    <label><input type="checkbox" value="problems_solved"> Problems Solved</label>
                    <label><input type="checkbox" value="learning_gain"> Learning Gain</label>
                    <label><input type="checkbox" value="return_rate"> Return Rate</label>
                    <label><input type="checkbox" value="signup_rate"> Signup Rate</label>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" onclick="abDashboard.closeModal('new-experiment-modal')">Cancel</button>
              <button class="btn-primary" onclick="abDashboard.createExperiment()">Create Experiment</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.injectStyles();
  }

  injectStyles() {
    if (document.getElementById('ab-dashboard-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'ab-dashboard-styles';
    styles.textContent = `
      .ab-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #333;
        background: #f5f5f5;
        min-height: 100vh;
      }
      
      .ab-dashboard.dark {
        background: #1a1a1a;
        color: #e0e0e0;
      }
      
      .dashboard-header {
        background: white;
        border-bottom: 1px solid #e0e0e0;
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .dark .dashboard-header {
        background: #2a2a2a;
        border-color: #444;
      }
      
      .header-controls {
        display: flex;
        gap: 15px;
        align-items: center;
      }
      
      .view-switcher {
        display: flex;
        gap: 5px;
        background: #f0f0f0;
        padding: 5px;
        border-radius: 6px;
      }
      
      .dark .view-switcher {
        background: #333;
      }
      
      .view-btn {
        padding: 8px 16px;
        background: none;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .view-btn.active {
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .dark .view-btn.active {
        background: #444;
      }
      
      .dashboard-content {
        padding: 20px;
      }
      
      .view-panel {
        display: none;
      }
      
      .view-panel.active {
        display: block;
      }
      
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .summary-card {
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      
      .dark .summary-card {
        background: #2a2a2a;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      .summary-card h3 {
        font-size: 14px;
        color: #666;
        margin: 0 0 10px 0;
        font-weight: normal;
      }
      
      .dark .summary-card h3 {
        color: #999;
      }
      
      .metric-value {
        font-size: 32px;
        font-weight: 600;
        color: #2c3e50;
        margin: 10px 0;
      }
      
      .dark .metric-value {
        color: #3498db;
      }
      
      .metric-change {
        font-size: 14px;
        color: #666;
      }
      
      .metric-change.positive {
        color: #27ae60;
      }
      
      .metric-change.negative {
        color: #e74c3c;
      }
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
      }
      
      .panel {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      
      .dark .panel {
        background: #2a2a2a;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      
      .panel h2 {
        font-size: 18px;
        margin: 0 0 20px 0;
        color: #2c3e50;
      }
      
      .dark .panel h2 {
        color: #e0e0e0;
      }
      
      /* Experiments Table */
      .experiments-table {
        width: 100%;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      
      .dark .experiments-table {
        background: #2a2a2a;
      }
      
      .experiments-table th {
        background: #f8f9fa;
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: #666;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .dark .experiments-table th {
        background: #333;
        color: #999;
        border-color: #444;
      }
      
      .experiments-table td {
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .dark .experiments-table td {
        border-color: #333;
      }
      
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .status-badge.active {
        background: #d4edda;
        color: #155724;
      }
      
      .status-badge.completed {
        background: #cce5ff;
        color: #004085;
      }
      
      .status-badge.paused {
        background: #fff3cd;
        color: #856404;
      }
      
      /* Modals */
      .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        align-items: center;
        justify-content: center;
      }
      
      .modal.active {
        display: flex;
      }
      
      .modal-content {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow: auto;
      }
      
      .dark .modal-content {
        background: #2a2a2a;
      }
      
      .modal-content.large {
        max-width: 900px;
      }
      
      .modal-header {
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .dark .modal-header {
        border-color: #444;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }
      
      .modal-body {
        padding: 20px;
      }
      
      .modal-footer {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
      
      .dark .modal-footer {
        border-color: #444;
      }
      
      /* Form Styles */
      .form-group {
        margin-bottom: 20px;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .form-group input,
      .form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }
      
      .dark .form-group input,
      .dark .form-group select {
        background: #333;
        border-color: #555;
        color: #e0e0e0;
      }
      
      /* Buttons */
      .btn-primary,
      .btn-secondary {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .btn-primary {
        background: #3498db;
        color: white;
      }
      
      .btn-primary:hover {
        background: #2980b9;
      }
      
      .btn-secondary {
        background: #95a5a6;
        color: white;
      }
      
      .btn-secondary:hover {
        background: #7f8c8d;
      }
      
      /* Charts Container */
      canvas {
        max-height: 300px;
      }
      
      /* Activity Feed */
      .activity-item {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: start;
        gap: 12px;
      }
      
      .dark .activity-item {
        border-color: #333;
      }
      
      .activity-icon {
        width: 32px;
        height: 32px;
        background: #f0f0f0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .dark .activity-icon {
        background: #333;
      }
      
      .activity-content {
        flex: 1;
      }
      
      .activity-title {
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .activity-time {
        font-size: 12px;
        color: #999;
      }
      
      /* Experiment Timeline */
      .timeline-item {
        position: relative;
        padding-left: 40px;
        padding-bottom: 30px;
      }
      
      .timeline-item::before {
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e0e0e0;
      }
      
      .dark .timeline-item::before {
        background: #444;
      }
      
      .timeline-marker {
        position: absolute;
        left: 10px;
        top: 5px;
        width: 12px;
        height: 12px;
        background: #3498db;
        border-radius: 50%;
      }
      
      .timeline-content {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 6px;
      }
      
      .dark .timeline-content {
        background: #333;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          gap: 15px;
        }
        
        .header-controls {
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .dashboard-grid {
          grid-template-columns: 1fr;
        }
        
        .summary-cards {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // ============================================
  // DASHBOARD RENDERING
  // ============================================

  renderDashboard() {
    this.updateOverview();
    this.updateExperimentsTable();
    this.updateMetricsGrid();
  }

  updateOverview() {
    // Update summary cards
    const framework = this.config.framework;
    let activeCount = 0;
    let totalParticipants = 0;
    let significantResults = 0;
    let improvements = [];
    
    framework.experiments.forEach((experiment, id) => {
      if (experiment.status === 'active') {
        activeCount++;
      }
      
      totalParticipants += framework.getParticipantCount(id);
      
      const analysis = framework.analyzeExperiment(id);
      if (analysis) {
        Object.values(analysis.metrics).forEach(metric => {
          Object.values(metric.variants).forEach(variant => {
            if (variant.significance?.significant && variant.improvement > 0) {
              significantResults++;
              improvements.push(variant.improvement);
            }
          });
        });
      }
    });
    
    document.getElementById('active-experiments-count').textContent = activeCount;
    document.getElementById('total-participants').textContent = this.formatNumber(totalParticipants);
    document.getElementById('significant-results').textContent = significantResults;
    
    const avgImprovement = improvements.length > 0 ? 
      improvements.reduce((a, b) => a + b, 0) / improvements.length : 0;
    document.getElementById('avg-improvement').textContent = `${avgImprovement.toFixed(1)}%`;
    
    // Update charts
    this.renderExperimentStatusChart();
    this.renderLearningImpactChart();
    this.updateTopExperiments();
    this.updateActivityFeed();
  }

  renderExperimentStatusChart() {
    const ctx = document.getElementById('experiment-status-chart');
    if (!ctx) return;
    
    const statusCounts = { active: 0, completed: 0, paused: 0 };
    
    this.config.framework.experiments.forEach(experiment => {
      statusCounts[experiment.status] = (statusCounts[experiment.status] || 0) + 1;
    });
    
    if (this.charts.has('experiment-status')) {
      this.charts.get('experiment-status').destroy();
    }
    
    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Completed', 'Paused'],
        datasets: [{
          data: [statusCounts.active, statusCounts.completed, statusCounts.paused],
          backgroundColor: ['#27ae60', '#3498db', '#f39c12']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
    
    this.charts.set('experiment-status', chart);
  }

  renderLearningImpactChart() {
    const ctx = document.getElementById('learning-impact-chart');
    if (!ctx) return;
    
    // Simulated data - in real implementation, aggregate from experiments
    const learningMetrics = {
      'Week 1': { gain: 15, mastery: 65 },
      'Week 2': { gain: 22, mastery: 71 },
      'Week 3': { gain: 28, mastery: 76 },
      'Week 4': { gain: 31, mastery: 80 }
    };
    
    if (this.charts.has('learning-impact')) {
      this.charts.get('learning-impact').destroy();
    }
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(learningMetrics),
        datasets: [
          {
            label: 'Learning Gain (%)',
            data: Object.values(learningMetrics).map(d => d.gain),
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4
          },
          {
            label: 'Concept Mastery (%)',
            data: Object.values(learningMetrics).map(d => d.mastery),
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
    
    this.charts.set('learning-impact', chart);
  }

  updateTopExperiments() {
    const container = document.getElementById('top-experiments-list');
    if (!container) return;
    
    const experiments = [];
    
    this.config.framework.experiments.forEach((experiment, id) => {
      const analysis = this.config.framework.analyzeExperiment(id);
      if (analysis && analysis.winner) {
        experiments.push({
          id,
          name: experiment.name,
          improvement: analysis.winner.improvement,
          metric: analysis.winner.metric,
          confidence: analysis.winner.confidence
        });
      }
    });
    
    // Sort by improvement
    experiments.sort((a, b) => b.improvement - a.improvement);
    
    container.innerHTML = experiments.slice(0, 5).map(exp => `
      <div class="top-experiment-item">
        <div class="experiment-info">
          <div class="experiment-name">${exp.name}</div>
          <div class="experiment-metric">${this.formatMetricName(exp.metric)}</div>
        </div>
        <div class="experiment-improvement">
          <div class="improvement-value">+${exp.improvement.toFixed(1)}%</div>
          <div class="confidence-value">${(exp.confidence * 100).toFixed(0)}% conf.</div>
        </div>
      </div>
    `).join('');
  }

  updateActivityFeed() {
    const container = document.getElementById('activity-feed');
    if (!container) return;
    
    // Simulated activity - in real implementation, fetch from event log
    const activities = [
      {
        icon: '🚀',
        title: 'New experiment launched',
        description: 'Adaptive Difficulty Testing is now active',
        time: '2 hours ago'
      },
      {
        icon: '📊',
        title: 'Significant result detected',
        description: 'Gamification Elements shows 23% improvement in engagement',
        time: '5 hours ago'
      },
      {
        icon: '✅',
        title: 'Experiment concluded',
        description: 'Onboarding Flow Optimization completed with clear winner',
        time: '1 day ago'
      },
      {
        icon: '👥',
        title: 'Milestone reached',
        description: '10,000 participants enrolled across all experiments',
        time: '2 days ago'
      }
    ];
    
    container.innerHTML = activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  }

  updateExperimentsTable() {
    const tbody = document.getElementById('experiments-tbody');
    if (!tbody) return;
    
    const rows = [];
    
    this.config.framework.experiments.forEach((experiment, id) => {
      const analysis = this.config.framework.analyzeExperiment(id);
      const participants = this.config.framework.getParticipantCount(id);
      const duration = Math.floor((Date.now() - experiment.startDate) / (1000 * 60 * 60 * 24));
      
      let bestVariant = 'Control';
      let improvement = 0;
      
      if (analysis && analysis.winner) {
        bestVariant = analysis.winner.variant;
        improvement = analysis.winner.improvement;
      }
      
      rows.push(`
        <tr>
          <td>
            <div class="experiment-name-cell">
              <strong>${experiment.name}</strong>
              <div class="experiment-id">${id}</div>
            </div>
          </td>
          <td>${this.formatExperimentType(experiment.type)}</td>
          <td><span class="status-badge ${experiment.status}">${experiment.status}</span></td>
          <td>${this.formatNumber(participants)}</td>
          <td>${duration} days</td>
          <td>${this.formatMetricName(experiment.metrics[0])}</td>
          <td>
            ${bestVariant}
            ${improvement > 0 ? `<span class="improvement-badge">+${improvement.toFixed(1)}%</span>` : ''}
          </td>
          <td>
            <button class="action-btn" onclick="abDashboard.viewExperiment('${id}')">View</button>
            <button class="action-btn" onclick="abDashboard.analyzeExperiment('${id}')">Analyze</button>
          </td>
        </tr>
      `);
    });
    
    tbody.innerHTML = rows.join('');
  }

  updateMetricsGrid() {
    const container = document.getElementById('metrics-grid');
    if (!container) return;
    
    const metrics = [];
    
    this.config.framework.metrics.forEach((metric, name) => {
      const totalEvents = Array.from(metric.data.values())
        .reduce((sum, data) => sum + data.count, 0);
      
      metrics.push({
        name,
        config: metric,
        totalEvents
      });
    });
    
    container.innerHTML = metrics.map(metric => `
      <div class="metric-card">
        <h3>${this.formatMetricName(metric.name)}</h3>
        <div class="metric-stats">
          <div class="stat-item">
            <span class="stat-label">Type:</span>
            <span class="stat-value">${metric.config.type}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Events:</span>
            <span class="stat-value">${this.formatNumber(metric.totalEvents)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Last Updated:</span>
            <span class="stat-value">${this.formatTime(metric.config.lastUpdated)}</span>
          </div>
        </div>
        <button class="metric-analyze-btn" onclick="abDashboard.analyzeMetric('${metric.name}')">
          Analyze
        </button>
      </div>
    `).join('');
  }

  // ============================================
  // EXPERIMENT MANAGEMENT
  // ============================================

  viewExperiment(experimentId) {
    this.selectedExperiment = experimentId;
    const experiment = this.config.framework.experiments.get(experimentId);
    const analysis = this.config.framework.analyzeExperiment(experimentId);
    
    // Update modal title
    document.getElementById('experiment-detail-title').textContent = experiment.name;
    
    // Update overview tab
    this.updateExperimentOverview(experiment, analysis);
    
    // Update variants tab
    this.updateVariantsAnalysis(experiment, analysis);
    
    // Update metrics tab
    this.updateMetricsAnalysis(experiment, analysis);
    
    // Update participants tab
    this.updateParticipantsBreakdown(experiment, analysis);
    
    // Update timeline
    this.updateExperimentTimeline(experiment);
    
    // Show modal
    this.showModal('experiment-detail-modal');
  }

  updateExperimentOverview(experiment, analysis) {
    const container = document.getElementById('experiment-summary');
    
    const recommendations = analysis ? analysis.recommendations : [];
    const hasSignificantResults = recommendations.some(r => r.type === 'significant_result');
    
    container.innerHTML = `
      <div class="overview-grid">
        <div class="overview-section">
          <h3>Experiment Details</h3>
          <dl>
            <dt>Type:</dt>
            <dd>${this.formatExperimentType(experiment.type)}</dd>
            
            <dt>Status:</dt>
            <dd><span class="status-badge ${experiment.status}">${experiment.status}</span></dd>
            
            <dt>Clustering:</dt>
            <dd>${experiment.clustering}</dd>
            
            <dt>Start Date:</dt>
            <dd>${new Date(experiment.startDate).toLocaleDateString()}</dd>
            
            <dt>Duration:</dt>
            <dd>${analysis ? analysis.duration_days : 0} days</dd>
            
            <dt>Participants:</dt>
            <dd>${analysis ? this.formatNumber(analysis.total_participants) : 0}</dd>
          </dl>
        </div>
        
        <div class="overview-section">
          <h3>Current Results</h3>
          ${hasSignificantResults ? `
            <div class="significant-results">
              ${recommendations
                .filter(r => r.type === 'significant_result')
                .map(r => `
                  <div class="result-item">
                    <strong>${r.variant}</strong> shows 
                    <span class="improvement">${r.improvement.toFixed(1)}%</span> 
                    improvement in ${this.formatMetricName(r.metric)}
                  </div>
                `).join('')}
            </div>
          ` : `
            <p class="no-results">No significant results yet. Continue gathering data.</p>
          `}
        </div>
        
        <div class="overview-section">
          <h3>Recommendations</h3>
          <div class="recommendations-list">
            ${recommendations.map(r => `
              <div class="recommendation ${r.severity}">
                <span class="rec-icon">${this.getRecommendationIcon(r.severity)}</span>
                ${r.message}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  updateVariantsAnalysis(experiment, analysis) {
    // Render variants performance chart
    this.renderVariantsChart(experiment, analysis);
    
    // Update variants table
    const container = document.getElementById('variants-table');
    
    const variantsData = [];
    experiment.variants.forEach(variant => {
      const participants = analysis ? 
        analysis.variants[variant.id]?.participants || 0 : 0;
      
      const metrics = {};
      if (analysis && analysis.metrics) {
        Object.entries(analysis.metrics).forEach(([metricName, metricData]) => {
          const variantData = metricData.variants[variant.id];
          if (variantData) {
            metrics[metricName] = {
              value: variantData.value,
              improvement: variantData.improvement,
              significant: variantData.significance?.significant
            };
          }
        });
      }
      
      variantsData.push({
        variant,
        participants,
        metrics
      });
    });
    
    container.innerHTML = `
      <table class="variants-comparison-table">
        <thead>
          <tr>
            <th>Variant</th>
            <th>Participants</th>
            <th>Weight</th>
            ${experiment.metrics.map(m => 
              `<th>${this.formatMetricName(m)}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
          ${variantsData.map(data => `
            <tr class="${data.variant.id === 'control' ? 'control-row' : ''}">
              <td><strong>${data.variant.name}</strong></td>
              <td>${this.formatNumber(data.participants)}</td>
              <td>${(data.variant.weight * 100).toFixed(0)}%</td>
              ${experiment.metrics.map(metricName => {
                const metric = data.metrics[metricName];
                if (!metric) return '<td>-</td>';
                
                return `
                  <td>
                    ${this.formatMetricValue(metric.value, metricName)}
                    ${metric.improvement !== undefined && data.variant.id !== 'control' ? `
                      <div class="improvement ${metric.improvement > 0 ? 'positive' : 'negative'} 
                                  ${metric.significant ? 'significant' : ''}">
                        ${metric.improvement > 0 ? '+' : ''}${metric.improvement.toFixed(1)}%
                        ${metric.significant ? '✓' : ''}
                      </div>
                    ` : ''}
                  </td>
                `;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderVariantsChart(experiment, analysis) {
    const ctx = document.getElementById('variants-performance-chart');
    if (!ctx) return;
    
    if (this.charts.has('variants-performance')) {
      this.charts.get('variants-performance').destroy();
    }
    
    const primaryMetric = experiment.metrics[0];
    const labels = experiment.variants.map(v => v.name);
    const data = [];
    
    experiment.variants.forEach(variant => {
      if (analysis && analysis.metrics[primaryMetric]) {
        const variantData = analysis.metrics[primaryMetric].variants[variant.id];
        data.push(variantData ? variantData.value : 0);
      } else {
        data.push(0);
      }
    });
    
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: this.formatMetricName(primaryMetric),
          data,
          backgroundColor: labels.map(l => 
            l === 'Control' ? '#95a5a6' : '#3498db'
          )
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
    
    this.charts.set('variants-performance', chart);
  }

  // ============================================
  // UTILITIES
  // ============================================

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  }

  formatMetricName(name) {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  formatExperimentType(type) {
    const types = {
      'ab': 'A/B Test',
      'multivariate': 'Multivariate',
      'factorial': 'Factorial',
      'sequential': 'Sequential'
    };
    return types[type] || type;
  }

  formatMetricValue(value, metricName) {
    if (metricName.includes('rate') || metricName.includes('conversion')) {
      return (value * 100).toFixed(1) + '%';
    } else if (metricName.includes('time')) {
      return value.toFixed(0) + 's';
    } else {
      return value.toFixed(2);
    }
  }

  formatTime(timestamp) {
    if (!timestamp) return 'Never';
    
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  getRecommendationIcon(severity) {
    const icons = {
      'error': '❌',
      'warning': '⚠️',
      'success': '✅',
      'info': 'ℹ️'
    };
    return icons[severity] || '•';
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  setupEventListeners() {
    // View switcher
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });
    
    // Tab switcher in modals
    document.addEventListener('click', (e) => {
      if (e.target.matches('.tab-btn')) {
        this.switchTab(e.target);
      }
    });
    
    // Search and filters
    const searchInput = document.getElementById('experiment-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterExperiments());
    }
    
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterExperiments());
    }
    
    const typeFilter = document.getElementById('type-filter');
    if (typeFilter) {
      typeFilter.addEventListener('change', () => this.filterExperiments());
    }
  }

  switchView(view) {
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update active panel
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${view}`);
    });
    
    this.activeView = view;
  }

  switchTab(tabBtn) {
    const tabName = tabBtn.dataset.tab;
    const container = tabBtn.closest('.modal-body');
    
    // Update active button
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update active content
    container.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  showNewExperimentModal() {
    this.showModal('new-experiment-modal');
  }

  addVariant() {
    const container = document.getElementById('variants-container');
    const variantDiv = document.createElement('div');
    variantDiv.className = 'variant-input';
    variantDiv.innerHTML = `
      <input type="text" placeholder="Variant name">
      <input type="number" placeholder="Weight" value="50" min="0" max="100">
      <button type="button" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(variantDiv);
  }

  createExperiment() {
    // Gather form data
    const formData = {
      name: document.getElementById('exp-name').value,
      type: document.getElementById('exp-type').value,
      clustering: document.getElementById('exp-clustering').value,
      variants: [],
      metrics: []
    };
    
    // Get variants
    document.querySelectorAll('.variant-input').forEach(div => {
      const inputs = div.querySelectorAll('input');
      if (inputs[0].value) {
        formData.variants.push({
          id: inputs[0].value.toLowerCase().replace(/\s+/g, '_'),
          name: inputs[0].value,
          weight: parseInt(inputs[1].value) / 100
        });
      }
    });
    
    // Get metrics
    document.querySelectorAll('.checkbox-group input:checked').forEach(checkbox => {
      formData.metrics.push(checkbox.value);
    });
    
    // Validate
    if (!formData.name || formData.variants.length < 2 || formData.metrics.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Create experiment
    console.log('Creating experiment:', formData);
    
    // In real implementation, send to server
    // For now, close modal
    this.closeModal('new-experiment-modal');
    
    // Refresh dashboard
    this.refresh();
  }

  pauseExperiment() {
    if (!this.selectedExperiment) return;
    
    const experiment = this.config.framework.experiments.get(this.selectedExperiment);
    if (experiment) {
      experiment.status = 'paused';
      this.refresh();
      this.closeModal('experiment-detail-modal');
    }
  }

  concludeExperiment() {
    if (!this.selectedExperiment) return;
    
    const analysis = this.config.framework.analyzeExperiment(this.selectedExperiment);
    
    if (analysis && analysis.winner) {
      if (confirm(`Conclude experiment and implement ${analysis.winner.variant}?`)) {
        const experiment = this.config.framework.experiments.get(this.selectedExperiment);
        experiment.status = 'completed';
        experiment.endDate = Date.now();
        experiment.winner = analysis.winner;
        
        this.refresh();
        this.closeModal('experiment-detail-modal');
      }
    } else {
      alert('No clear winner yet. Consider running the experiment longer.');
    }
  }

  analyzeExperiment(experimentId) {
    const analysis = this.config.framework.analyzeExperiment(experimentId);
    console.log('Experiment analysis:', analysis);
    
    // In real implementation, show detailed analysis modal
    this.viewExperiment(experimentId);
  }

  analyzeMetric(metricName) {
    console.log('Analyzing metric:', metricName);
    
    // Switch to metrics view and select metric
    this.switchView('metrics');
    
    const selector = document.getElementById('metric-selector');
    if (selector) {
      selector.value = metricName;
      this.updateMetricDetails(metricName);
    }
  }

  updateMetricDetails(metricName) {
    const metric = this.config.framework.metrics.get(metricName);
    if (!metric) return;
    
    // Update statistics
    const statsContainer = document.getElementById('metric-statistics');
    if (statsContainer) {
      const stats = this.calculateMetricStatistics(metric);
      
      statsContainer.innerHTML = `
        <div class="metric-stats-grid">
          <div class="stat-box">
            <h4>Total Events</h4>
            <p>${this.formatNumber(stats.totalEvents)}</p>
          </div>
          <div class="stat-box">
            <h4>Unique Users</h4>
            <p>${this.formatNumber(stats.uniqueUsers)}</p>
          </div>
          <div class="stat-box">
            <h4>Average Value</h4>
            <p>${stats.averageValue.toFixed(2)}</p>
          </div>
          <div class="stat-box">
            <h4>Conversion Rate</h4>
            <p>${(stats.conversionRate * 100).toFixed(1)}%</p>
          </div>
        </div>
      `;
    }
    
    // Render trend chart
    this.renderMetricTrendChart(metric);
  }

  calculateMetricStatistics(metric) {
    let totalEvents = 0;
    let totalValue = 0;
    let conversions = 0;
    const users = new Set();
    
    metric.data.forEach(data => {
      totalEvents += data.count;
      if (data.values) {
        totalValue += data.values.reduce((a, b) => a + b, 0);
      }
      if (data.conversions) {
        conversions += data.conversions;
      }
    });
    
    return {
      totalEvents,
      uniqueUsers: users.size,
      averageValue: totalEvents > 0 ? totalValue / totalEvents : 0,
      conversionRate: totalEvents > 0 ? conversions / totalEvents : 0
    };
  }

  renderMetricTrendChart(metric) {
    const ctx = document.getElementById('metric-trend-chart');
    if (!ctx) return;
    
    // Simulated trend data
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const data = [120, 145, 165, 180];
    
    if (this.charts.has('metric-trend')) {
      this.charts.get('metric-trend').destroy();
    }
    
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: this.formatMetricName(metric.name),
          data,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
    
    this.charts.set('metric-trend', chart);
  }

  refresh() {
    this.renderDashboard();
  }

  startAutoUpdate() {
    this.updateTimer = setInterval(() => {
      this.refresh();
    }, this.config.updateInterval);
  }

  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  filterExperiments() {
    const search = document.getElementById('experiment-search').value.toLowerCase();
    const status = document.getElementById('status-filter').value;
    const type = document.getElementById('type-filter').value;
    
    const rows = document.querySelectorAll('#experiments-tbody tr');
    
    rows.forEach(row => {
      const name = row.querySelector('.experiment-name-cell').textContent.toLowerCase();
      const rowStatus = row.querySelector('.status-badge').textContent.toLowerCase();
      const rowType = row.cells[1].textContent.toLowerCase();
      
      const matchesSearch = !search || name.includes(search);
      const matchesStatus = status === 'all' || rowStatus === status;
      const matchesType = type === 'all' || rowType.includes(type);
      
      row.style.display = matchesSearch && matchesStatus && matchesType ? '' : 'none';
    });
  }

  generateReport() {
    const startDate = document.getElementById('report-start-date').value;
    const endDate = document.getElementById('report-end-date').value;
    
    const reportContent = document.getElementById('report-content');
    
    // Generate comprehensive report
    const experiments = [];
    this.config.framework.experiments.forEach((experiment, id) => {
      const analysis = this.config.framework.analyzeExperiment(id);
      experiments.push({ experiment, analysis });
    });
    
    reportContent.innerHTML = `
      <div class="report">
        <h2>A/B Testing Report</h2>
        <p class="report-period">Period: ${startDate || 'All time'} to ${endDate || 'Present'}</p>
        
        <section class="report-section">
          <h3>Executive Summary</h3>
          <p>During this period, ${experiments.length} experiments were conducted with a total of 
             ${this.formatNumber(experiments.reduce((sum, e) => 
               sum + (e.analysis?.total_participants || 0), 0))} participants.</p>
        </section>
        
        <section class="report-section">
          <h3>Experiment Results</h3>
          ${experiments.map(({ experiment, analysis }) => `
            <div class="experiment-report">
              <h4>${experiment.name}</h4>
              <p>Status: ${experiment.status}</p>
              ${analysis?.winner ? `
                <p class="winner">Winner: ${analysis.winner.variant} with 
                   ${analysis.winner.improvement.toFixed(1)}% improvement</p>
              ` : '<p>No significant winner yet</p>'}
            </div>
          `).join('')}
        </section>
        
        <section class="report-section">
          <h3>Key Learnings</h3>
          <ul>
            ${this.generateKeyLearnings(experiments).map(learning => 
              `<li>${learning}</li>`
            ).join('')}
          </ul>
        </section>
        
        <section class="report-section">
          <h3>Recommendations</h3>
          <ul>
            ${this.generateRecommendations(experiments).map(rec => 
              `<li>${rec}</li>`
            ).join('')}
          </ul>
        </section>
      </div>
    `;
  }

  generateKeyLearnings(experiments) {
    const learnings = [];
    
    // Analyze patterns
    const successfulVariants = experiments
      .filter(e => e.analysis?.winner)
      .map(e => e.analysis.winner);
    
    if (successfulVariants.length > 0) {
      const avgImprovement = successfulVariants
        .reduce((sum, v) => sum + v.improvement, 0) / successfulVariants.length;
      
      learnings.push(`Successful experiments showed an average improvement of ${avgImprovement.toFixed(1)}%`);
    }
    
    // Add more contextual learnings
    learnings.push('Gamification elements consistently improved engagement metrics');
    learnings.push('Classroom-level randomization reduced noise in learning outcome measurements');
    learnings.push('Sequential testing proved effective for feature rollouts');
    
    return learnings;
  }

  generateRecommendations(experiments) {
    const recommendations = [];
    
    // Based on results
    experiments.forEach(({ experiment, analysis }) => {
      if (analysis?.winner && analysis.winner.improvement > 10) {
        recommendations.push(`Implement ${analysis.winner.variant} from ${experiment.name} immediately`);
      }
    });
    
    // General recommendations
    recommendations.push('Continue testing personalization features for different learning styles');
    recommendations.push('Focus on mobile experience optimizations');
    recommendations.push('Investigate AI-driven adaptive difficulty adjustments');
    
    return recommendations;
  }

  exportReport() {
    const reportContent = document.getElementById('report-content').innerHTML;
    
    // Create blob
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-testing-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }

  loadChartLibrary() {
    if (typeof Chart !== 'undefined') return;
    
    // Load Chart.js if not already loaded
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
      console.log('Chart.js loaded');
      this.renderDashboard();
    };
    document.head.appendChild(script);
  }

  updateExperimentTimeline(experiment) {
    const container = document.getElementById('experiment-timeline');
    
    const events = [
      {
        date: new Date(experiment.startDate),
        title: 'Experiment Started',
        description: `${experiment.variants.length} variants launched`
      },
      {
        date: new Date(experiment.startDate + 7 * 24 * 60 * 60 * 1000),
        title: 'First Week Complete',
        description: '1,000 participants enrolled'
      },
      {
        date: new Date(experiment.startDate + 14 * 24 * 60 * 60 * 1000),
        title: 'Statistical Significance',
        description: 'Primary metric shows significant difference'
      }
    ];
    
    if (experiment.status === 'completed' && experiment.endDate) {
      events.push({
        date: new Date(experiment.endDate),
        title: 'Experiment Concluded',
        description: `Winner: ${experiment.winner?.variant || 'No clear winner'}`
      });
    }
    
    container.innerHTML = events.map(event => `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-date">${event.date.toLocaleDateString()}</div>
          <div class="timeline-title">${event.title}</div>
          <div class="timeline-description">${event.description}</div>
        </div>
      </div>
    `).join('');
  }

  updateMetricsAnalysis(experiment, analysis) {
    const container = document.getElementById('metrics-analysis');
    
    if (!analysis || !analysis.metrics) {
      container.innerHTML = '<p>No metrics data available yet.</p>';
      return;
    }
    
    container.innerHTML = Object.entries(analysis.metrics).map(([metricName, metricData]) => `
      <div class="metric-analysis-card">
        <h4>${this.formatMetricName(metricName)}</h4>
        <div class="metric-variants">
          ${Object.entries(metricData.variants).map(([variantId, variantData]) => `
            <div class="variant-metric ${variantData.significance?.significant ? 'significant' : ''}">
              <div class="variant-name">${variantId}</div>
              <div class="variant-value">${this.formatMetricValue(variantData.value, metricName)}</div>
              ${variantData.improvement !== undefined && variantId !== 'control' ? `
                <div class="variant-improvement ${variantData.improvement > 0 ? 'positive' : 'negative'}">
                  ${variantData.improvement > 0 ? '+' : ''}${variantData.improvement.toFixed(1)}%
                </div>
              ` : ''}
              ${variantData.significance ? `
                <div class="variant-significance">
                  p-value: ${variantData.significance.p_value.toFixed(4)}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  updateParticipantsBreakdown(experiment, analysis) {
    // Render participants distribution chart
    const ctx = document.getElementById('participants-chart');
    if (ctx) {
      if (this.charts.has('participants')) {
        this.charts.get('participants').destroy();
      }
      
      const labels = experiment.variants.map(v => v.name);
      const data = experiment.variants.map(v => 
        analysis?.variants[v.id]?.participants || 0
      );
      
      const chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: [
              '#3498db',
              '#2ecc71',
              '#f39c12',
              '#e74c3c',
              '#9b59b6'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      
      this.charts.set('participants', chart);
    }
    
    // Update statistics
    const statsContainer = document.getElementById('participants-stats');
    if (statsContainer && analysis) {
      statsContainer.innerHTML = `
        <div class="participants-stats-grid">
          <div class="stat-item">
            <h4>Total Participants</h4>
            <p>${this.formatNumber(analysis.total_participants)}</p>
          </div>
          <div class="stat-item">
            <h4>Daily Average</h4>
            <p>${this.formatNumber(Math.floor(analysis.total_participants / analysis.duration_days))}</p>
          </div>
          <div class="stat-item">
            <h4>Clustering Level</h4>
            <p>${experiment.clustering}</p>
          </div>
          <div class="stat-item">
            <h4>Sample Size Goal</h4>
            <p>${this.formatNumber(this.config.framework.config.minSampleSize)} per variant</p>
          </div>
        </div>
      `;
    }
  }
}

// Initialize dashboard
let abDashboard;

document.addEventListener('DOMContentLoaded', () => {
  // Check if container exists
  if (document.getElementById('ab-testing-dashboard')) {
    abDashboard = new ABTestingDashboard();
    window.abDashboard = abDashboard;
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ABTestingDashboard;
}