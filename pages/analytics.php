<div class="d-flex justify-content-between align-items-center mb-4 header-actions" id="analyticsButtons">
  <h4 class="mb-0 fw-bold">System Overview</h4>
  <div class="d-flex gap-2">
    <button class="btn btn-outline-success bg-white shadow-sm" onclick="exportExcel()">
      <i class="bi bi-file-earmark-excel me-1"></i> Excel
    </button>
    <button class="btn btn-outline-danger bg-white shadow-sm" onclick="exportPDF()">
      <i class="bi bi-file-earmark-pdf me-1"></i> PDF
    </button>
    <button class="btn btn-primary shadow-sm" onclick="loadAnalytics(this)">
      <i class="bi bi-arrow-clockwise me-1"></i> Refresh
    </button>
  </div>
</div>

<div id="analyticsContainer">
  <div class="row g-3 mb-4">
    <div class="col-md-3">
      <div class="card border-0 shadow-sm h-100 bg-primary text-white">
        <div class="card-body p-4">
          <div class="text-white-50 small fw-bold text-uppercase mb-1">Current Stock Value</div>
          <h3 class="fw-bold mb-0" id="statTotalValue">₱0.00</h3>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-4">
          <div class="text-muted small fw-bold text-uppercase mb-1">Items Borrowed/Issued (30 Days)</div>
          <h3 class="fw-bold mb-0 text-dark" id="statIssuedItems">0</h3>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-4">
          <div class="text-muted small fw-bold text-uppercase mb-1">Total Purchases</div>
          <h3 class="fw-bold mb-0 text-dark" id="statTotalSpend">₱0.00</h3>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-4">
          <div class="text-muted small fw-bold text-uppercase mb-1">Total Unique Items</div>
          <h3 class="fw-bold mb-0 text-dark" id="statTotalItems">0</h3>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4 mb-4">
    <div class="col-md-8">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-4">
          <h6 class="fw-bold text-dark mb-4">Stock Value by Supplier</h6>
          <div style="height: 300px;"><canvas id="valuationChart"></canvas></div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-4">
          <h6 class="fw-bold text-dark mb-4">Spending by Category</h6>
          <div style="height: 300px;"><canvas id="spendChart"></canvas></div>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4">
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body p-4">
          <h6 class="fw-bold text-dark mb-3"><i class="bi bi-graph-down-arrow text-danger me-2"></i>Stock Depletion Forecast</h6>
          <p class="text-muted small mb-3">Items expected to run out soon based on recent usage.</p>
          <ul class="list-group list-group-flush border-top" id="predictiveList"></ul>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card border-0 shadow-sm h-100 bg-light border border-success border-opacity-25">
        <div class="card-body p-4 text-center d-flex flex-column justify-content-center">
          <div class="bg-success bg-opacity-10 text-success d-inline-flex p-3 rounded-circle mx-auto mb-3">
            <i class="bi bi-box-seam fs-2"></i>
          </div>
          <h5 class="fw-bold text-dark">Action Items</h5>
          <p class="text-muted mb-4">You have <strong id="prescriptiveLowCount" class="text-danger">0</strong> items currently at or below their minimum reorder level.</p>
          <button class="btn btn-success rounded-pill px-4 py-2 mx-auto shadow-sm" id="prescriptiveAutoRestockBtn">
            <i class="bi bi-lightning-charge-fill me-1"></i> Auto-Generate Restock Orders
          </button>
        </div>
      </div>
    </div>
  </div>
</div>