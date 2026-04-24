<div id="inventoryContainer">
    <div class="d-flex justify-content-between align-items-center mb-4 header-actions">
        <h4 class="fw-bold mb-0">Inventory Overview</h4>
        <button class="btn btn-primary shadow-sm rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#addItemModal">
        <i class="bi bi-plus-lg me-1"></i> Add Item
        </button>
    </div>

    <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
        <div class="input-group shadow-sm rounded-3 bg-white">
            <span class="input-group-text bg-transparent border-0"><i class="bi bi-search text-muted"></i></span>
            <input type="text" id="searchInput" class="form-control border-0 bg-transparent ps-0" placeholder="Search items..." />
        </div>
        </div>
        <div class="col-12 col-md-4">
        <select id="filterSupplier" class="form-select shadow-sm border-0">
            <option value="">All Suppliers</option>
        </select>
        </div>
        <div class="col-12 col-md-4">
        <select id="filterStock" class="form-select shadow-sm border-0">
            <option value="">All Stock Levels</option>
            <option value="low">Low Stock Alerts</option>
            <option value="healthy">Healthy Stock</option>
        </select>
        </div>
    </div>

    <div class="card card-custom overflow-hidden">
        <div class="table-responsive">
        <table class="table table-hover table-custom mb-0">
            <thead class="bg-light">
            <tr>
                <th class="ps-4">Item Details</th>
                <th class="hide-on-mobile">Supplier</th>
                <th class="hide-on-mobile">Unit Price</th>
                <th>Stock</th>
                <th class="hide-on-mobile">AI Forecast</th> 
                <th class="hide-on-mobile text-end">Status</th>
                <th class="pe-4 text-end">Action</th>
            </tr>
            </thead>
            <tbody id="inventoryTableBody">
            </tbody>
        </table>

        </div>
    </div>
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-3">
        <span class="text-muted small" id="inventoryPaginationInfo">Showing 0 entries</span>
        <nav>
        <ul class="pagination pagination-sm mb-0" id="inventoryPaginationControls">
            </ul>
        </nav>
    </div>
</div>