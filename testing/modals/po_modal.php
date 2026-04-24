<!-- CREATE PO MODAL -->
<div class="modal fade" id="createPOModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
            <form id="createPOForm">
            <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold">Create Purchase Order</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-4 py-4">
                <div class="form-floating mb-3">
                <select name="supplier_id" id="poSupplierSelect" class="form-select" required>
                    <option value="">Select a Supplier...</option>
                </select>
                <label for="poSupplierSelect">Supplier</label>
                </div>
                <div class="form-floating mb-3">
                <select name="inventory_id" id="poItemSelect" class="form-select" required>
                    <option value="">Select an Item...</option>
                </select>
                <label for="poItemSelect">Item to Order</label>
                </div>
                <div class="row g-2">
                <div class="col-6">
                    <div class="form-floating">
                    <input type="number" name="quantity" class="form-control" value="1" min="1" placeholder="Order Qty" required />
                    <label>Order Qty</label>
                    </div>
                </div>
                <div class="col-6">
                    <div class="form-floating">
                    <input type="number" step="0.01" name="unit_price" class="form-control" placeholder="Unit Price (₱)" required />
                    <label>Unit Price (₱)</label>
                    </div>
                </div>
                </div>
            </div>
            <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
                <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4">Generate PO</button>
            </div>
            </form>
        </div>
    </div>
</div>

<!-- EDIT PO QUANTITY MODAL -->
<div class="modal fade" id="editPoQtyModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
            <form id="editPoQtyForm">
            <input type="hidden" name="po_id" id="edit_po_id" />
            <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
                <h5 class="modal-title fw-bold">Edit PO Quantity</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-4 py-3">
                <p class="small text-muted mb-3">Adjust the quantity before Finance approves it.</p>
                
                <div class="d-flex justify-content-between mb-2 pb-2 border-bottom">
                <span class="text-muted small">Unit Price:</span>
                <span class="fw-bold text-dark" id="edit_po_unit_price_display">₱0.00</span>
                <input type="hidden" id="edit_po_unit_price" />
                </div>

                <div class="form-floating mb-3 mt-3">
                <input type="number" name="new_quantity" id="edit_po_qty" class="form-control fw-bold" min="1" required />
                <label for="edit_po_qty">New Quantity</label>
                </div>

                <div class="d-flex justify-content-between bg-light p-3 rounded-3 mt-2">
                <span class="text-muted fw-bold">New Total:</span>
                <span class="fw-bold text-primary fs-5" id="edit_po_total_display">₱0.00</span>
                </div>
            </div>
            <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
                <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary rounded-pill px-4">Update PO</button>
            </div>
            </form>
        </div>
    </div>
</div>