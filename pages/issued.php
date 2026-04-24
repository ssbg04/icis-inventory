<div class="d-flex justify-content-between align-items-center mb-4 header-actions">
  <h4 class="mb-0 fw-bold">Issued Items Log</h4>
  <div class="d-flex gap-2">
    <button class="btn btn-outline-secondary bg-white text-dark shadow-sm" onclick="loadIssuedItems(this)">
      <i class="bi bi-arrow-clockwise me-1"></i> Refresh
    </button>
  </div>
</div>

<div class="card border-0 shadow-sm mb-4">
  <div class="card-body p-4">
    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
          <input type="text" id="searchIssuedInput" class="form-control border-start-0" placeholder="Search by Item Name or Transaction ID...">
        </div>
      </div>
      <div class="col-md-3">
        <input type="date" id="filterIssuedDateFrom" class="form-control form-control-sm" placeholder="From Date">
      </div>
      <div class="col-md-3">
        <input type="date" id="filterIssuedDateTo" class="form-control form-control-sm" placeholder="To Date">
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light text-muted small text-uppercase">
          <tr>
            <th class="ps-4 fw-medium">Txn ID</th>
            <th class="fw-medium">Date Issued</th>
            <th class="fw-medium">Item Details</th>
            <th class="text-end fw-medium pe-4">Qty Issued</th>
          </tr>
        </thead>
        <tbody id="issuedTableBody">
          </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-4">
      <div class="text-muted small" id="issuedPaginationInfo">Showing 0 entries</div>
      <ul class="pagination pagination-sm mb-0" id="issuedPaginationControls"></ul>
    </div>
  </div>
</div>