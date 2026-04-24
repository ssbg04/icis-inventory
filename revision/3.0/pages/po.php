<div id="poContainer">
    <div class="d-flex justify-content-between align-items-center mb-4 header-actions">
        <h4 class="mb-0 fw-bold">Purchase Orders</h4>
        <button class="btn btn-primary shadow-sm rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#createPOModal">
        <i class="bi bi-cart-plus me-1"></i> Create PO
        </button>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
        <div class="form-floating">
            <input type="date" id="filterPoDateFrom" class="form-control border-0 shadow-sm" />
            <label>Date From</label>
        </div>
        </div>
        <div class="col-12 col-md-4">
        <div class="form-floating">
            <input type="date" id="filterPoDateTo" class="form-control border-0 shadow-sm" />
            <label>Date To</label>
        </div>
        </div>
        <div class="col-12 col-md-4">
        <div class="form-floating">
            <select id="filterPoSupplier" class="form-select border-0 shadow-sm">
            <option value="">All Suppliers</option>
            </select>
            <label>Supplier Filter</label>
        </div>
        </div>
    </div>

    <div class="card card-custom overflow-hidden mb-3">
        <div class="table-responsive">
        <table class="table table-hover table-custom mb-0">
            <thead class="bg-light">
            <tr>
                <th class="ps-4">PO #</th>
                <th class="hide-on-mobile">Date</th>
                <th>Supplier</th>
                <th>Details</th>
                <th class="hide-on-mobile">Total Amount</th>
                <th>Status</th>
            </tr>
            </thead>
            <tbody id="poTableBody">
            </tbody>
        </table>
        </div>
    </div>

    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <span class="text-muted small" id="poPaginationInfo">Showing 0 entries</span>
        <nav>
        <ul class="pagination pagination-sm mb-0" id="poPaginationControls">
            </ul>
        </nav>
    </div>
</div>