<div id="analyticsContainer">
    <div class="d-flex justify-content-between align-items-center mb-4 header-actions">
        <h4 class="mb-0 fw-bold">Dashboard Analytics</h4>
        <div class="d-flex gap-2" id="analyticsButtons">
        <button class="btn btn-outline-success shadow-sm rounded-pill px-3 bg-white" onclick="exportExcel()">
            <i class="bi bi-file-earmark-excel me-1"></i> Excel
        </button>
        <button class="btn btn-outline-danger shadow-sm rounded-pill px-3 bg-white" onclick="exportPDF()">
            <i class="bi bi-file-earmark-pdf me-1"></i> PDF
        </button>
        <button class="btn btn-outline-primary shadow-sm rounded-pill px-3 bg-white" onclick="loadAnalytics(this)">
            <i class="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-12 col-lg-8">
        
        <h6 class="fw-bold text-secondary text-uppercase mb-3" style="letter-spacing: 1px;"><i class="bi bi-eye text-primary me-2"></i>1. Descriptive (Current State)</h6>
        <div class="row g-3 mb-5">
            <div class="col-12 col-md-4">
            <div class="card card-custom kpi-card p-3 text-center h-100 border-top border-primary border-4">
                <div class="text-muted small fw-bold mb-1">STOCK VALUATION</div>
                <h4 id="statTotalValue" class="fw-bold text-primary mb-0">₱0.00</h4>
            </div>
            </div>
            <div class="col-12 col-md-4">
            <div class="card card-custom kpi-card p-3 text-center h-100 border-top border-dark border-4">
                <div class="text-muted small fw-bold mb-1">TOTAL PO SPEND</div>
                <h4 id="statTotalSpend" class="fw-bold text-dark mb-0">₱0.00</h4>
            </div>
            </div>
            <div class="col-12 col-md-4">
            <div class="card card-custom kpi-card p-3 text-center h-100 border-top border-secondary border-4">
                <div class="text-muted small fw-bold mb-1">UNIQUE ITEMS</div>
                <h4 id="statTotalItems" class="fw-bold text-secondary mb-0">0</h4>
            </div>
            </div>
        </div>

        <h6 class="fw-bold text-secondary text-uppercase mb-3" style="letter-spacing: 1px;"><i class="bi bi-search text-info me-2"></i>2. Diagnostic (Trends & Causes)</h6>
        <div class="row g-3 mb-4">
            <div class="col-12 col-md-4">
            <div class="card card-custom kpi-card p-3 text-center h-100 bg-light">
                <div class="text-muted small fw-bold mb-1">INVENTORY TURNOVER</div>
                <h3 id="statTurnover" class="fw-bold text-info mb-1">0.00x</h3>
                <span class="small text-muted">Spend vs. Current Stock</span>
            </div>
            </div>
            <div class="col-12 col-md-8">
                <div class="card card-custom p-3 h-100">
                <div class="text-muted small fw-bold mb-2 text-center">SPEND BY CATEGORY (SUPPLIER)</div>
                <div style="position: relative; height: 150px; width: 100%">
                    <canvas id="spendChart"></canvas>
                </div>
                </div>
            </div>
            <div class="col-12">
                <div class="card card-custom p-3">
                <div class="text-muted small fw-bold mb-2 text-center">VALUATION BY SUPPLIER</div>
                <div style="position: relative; height: 200px; width: 100%">
                    <canvas id="valuationChart"></canvas>
                </div>
                </div>
            </div>
        </div>

        </div>

        <div class="col-12 col-lg-4">
        
        <h6 class="fw-bold text-secondary text-uppercase mb-3" style="letter-spacing: 1px;"><i class="bi bi-graph-up-arrow text-warning me-2"></i>3. Predictive (Forecast)</h6>
        <div class="card card-custom mb-5 p-0 overflow-hidden">
            <div class="bg-warning bg-opacity-10 p-3 border-bottom border-warning border-opacity-25">
            <h6 class="fw-bold text-dark mb-0">High-Risk Stockouts</h6>
            <span class="small text-muted">Items predicted to run out in < 7 days based on recent burn rates.</span>
            </div>
            <div class="p-0">
            <ul class="list-group list-group-flush" id="predictiveList">
                <li class="list-group-item text-center py-4 text-muted small">Loading predictions...</li>
            </ul>
            </div>
        </div>

        <h6 class="fw-bold text-secondary text-uppercase mb-3" style="letter-spacing: 1px;"><i class="bi bi-lightning-charge-fill text-success me-2"></i>4. Prescriptive (Action)</h6>
        <div class="card card-custom bg-success bg-opacity-10 border-0 p-4 text-center">
            <div class="mb-3">
            <i class="bi bi-robot text-success" style="font-size: 2.5rem;"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">System Recommendation</h5>
            <p class="text-muted small mb-4">
            You have <strong class="text-danger" id="prescriptiveLowCount">0</strong> items currently below their reorder thresholds. The system can automatically generate optimized Purchase Orders for all affected suppliers right now.
            </p>
            <button class="btn btn-success rounded-pill fw-bold shadow-sm w-100 py-2" id="prescriptiveAutoRestockBtn">
            <i class="bi bi-magic me-2"></i> Execute Auto-Restock
            </button>
        </div>

        </div>
    </div>
</div>