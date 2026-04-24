<div id="vendorsContainer">
    <div class="d-flex justify-content-between align-items-center mb-4 header-actions">
        <h4 class="mb-0 fw-bold">Vendor Management</h4>
        <button class="btn btn-primary shadow-sm rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#addVendorModal">
        <i class="bi bi-plus-lg me-1"></i> Add Vendor
        </button>
    </div>
    
    <div class="card card-custom overflow-hidden">
        <div class="table-responsive">
        <table class="table table-hover table-custom mb-0">
            <thead class="bg-light">
            <tr>
                <th class="ps-4">Supplier Name</th>
                <th>Contact Info</th>
                <th class="pe-4 text-end">Action</th>
            </tr>
            </thead>
            <tbody id="vendorTableBody">
            </tbody>
        </table>
        </div>
    </div>
</div>