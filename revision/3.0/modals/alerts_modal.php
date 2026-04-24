<div class="modal fade" id="lowStockModal" tabindex="-1" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
            <div class="modal-header bg-danger bg-opacity-10 border-bottom-0 pb-0 px-4 pt-4">
            <h5 class="modal-title fw-bold text-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> Low Stock Alert!
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-4 py-4">
            <p class="text-muted mb-3">The following items have dropped below their minimum reorder levels and require restocking.</p>
            
            <div class="table-responsive border rounded-3 overflow-auto mb-4" style="max-height: 300px;">
                <table class="table table-hover table-custom mb-0">
                <thead class="bg-light sticky-top">
                    <tr>
                    <th class="ps-4">Item Name</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>Supplier</th>
                    </tr>
                </thead>
                <tbody id="lowStockTableBody">
                    </tbody>
                </table>
            </div>

            <div class="alert alert-primary border-0 d-flex align-items-center mb-0">
                <i class="bi bi-info-circle-fill fs-4 me-3"></i>
                <div>
                <strong>How would you like to proceed?</strong><br>
                <span class="small"><strong>Manual:</strong> Go to the PO tab to create orders yourself.<br>
                <strong>Automatic:</strong> The system will instantly generate "Pending" Purchase Orders for all items listed above.</span>
                </div>
            </div>
            </div>
            <div class="modal-footer bg-light border-top-0 px-4 pb-4 pt-3 d-flex justify-content-end gap-2" style="border-radius: 0 0 16px 16px;">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Ignore</button>
            <button type="button" class="btn btn-dark rounded-pill px-4" id="manualRestockBtn">Manual Restock</button>
            <button type="button" class="btn btn-primary rounded-pill px-4" id="autoRestockBtn">
                <i class="bi bi-lightning-charge-fill me-1"></i> Auto-Restock All
            </button>
            </div>
        </div>
    </div>
</div>