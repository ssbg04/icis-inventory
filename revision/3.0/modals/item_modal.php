<!-- ADD ITEM MODAL -->
<div class="modal fade" id="addItemModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
          <form id="addItemForm">
            <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
              <h5 class="modal-title fw-bold">Add New Item</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-4 py-4">
              <div class="form-floating mb-3">
                <input type="text" name="name" class="form-control" id="addName" placeholder="Item Name" required />
                <label for="addName">Item Name</label>
              </div>
              <div class="form-floating mb-3">
                <textarea name="description" class="form-control" id="addDesc" style="height: 80px" placeholder="Description"></textarea>
                <label for="addDesc">Description / Serial No.</label>
              </div>
              <div class="row g-2">
                <div class="col-4 mb-3">
                  <div class="form-floating">
                    <input type="number" name="quantity" class="form-control" id="addQty" value="0" placeholder="Qty" />
                    <label for="addQty">Init. Qty</label>
                  </div>
                </div>
                <div class="col-4 mb-3">
                  <div class="form-floating">
                    <input type="number" step="0.01" name="unit_price" class="form-control" id="addPrice" placeholder="Price" required />
                    <label for="addPrice">Price (₱)</label>
                  </div>
                </div>
                <div class="col-4 mb-3">
                  <div class="form-floating">
                    <input type="number" name="reorder_level" class="form-control" id="addReorder" value="10" placeholder="Reorder" />
                    <label for="addReorder">Reorder At</label>
                  </div>
                </div>
              </div>
              <div class="form-floating">
                <select name="supplier_id" id="supplierSelect" class="form-select" required>
                  <option value="">Select a supplier...</option>
                </select>
                <label for="supplierSelect">Supplier</label>
              </div>
            </div>
            <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
              <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4">Save Item</button>
            </div>
          </form>
        </div>
    </div>
</div>

<!-- EDIT ITEM MODAL -->
<div class="modal fade" id="editItemModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
      <form id="editItemForm">
        <input type="hidden" name="inventory_id" id="edit_inventory_id" />
        <input type="hidden" name="quantity" id="edit_quantity" />
        <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
          <h5 class="modal-title fw-bold">Edit Item</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body px-4 py-4">
          <div class="form-floating mb-3">
            <input type="text" name="name" id="edit_name" class="form-control" placeholder="Item Name" required />
            <label for="edit_name">Item Name</label>
          </div>
          <div class="form-floating mb-3">
            <textarea name="description" id="edit_description" class="form-control" style="height: 80px" placeholder="Description"></textarea>
            <label for="edit_description">Description / Serial No.</label>
          </div>
          <div class="row g-2">
            <div class="col-6 mb-3">
              <div class="form-floating">
                <input type="number" step="0.01" name="unit_price" id="edit_unit_price" class="form-control" placeholder="Price" required />
                <label for="edit_unit_price">Price (₱)</label>
              </div>
            </div>
            <div class="col-6 mb-3">
              <div class="form-floating">
                <input type="number" name="reorder_level" id="edit_reorder_level" class="form-control" placeholder="Reorder At" required />
                <label for="edit_reorder_level">Reorder At</label>
              </div>
            </div>
          </div>
          <div class="form-floating">
            <select name="supplier_id" id="edit_supplier_id" class="form-select" required></select>
            <label for="edit_supplier_id">Supplier</label>
          </div>
        </div>
        <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
          <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary rounded-pill px-4">Update Details</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- ISSUE ITEM MODAL -->
<div class="modal fade" id="issueItemModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
      <form id="issueItemForm">
        <input type="hidden" name="inventory_id" id="issue_inventory_id" />
        <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
          <h5 class="modal-title fw-bold text-warning"><i class="bi bi-box-arrow-up"></i> Issue Item</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body px-4 py-3">
          <p class="small text-muted mb-3">Dispense <strong id="issue_item_name" class="text-dark"></strong> from inventory.</p>
          <div class="form-floating mb-2">
            <input type="number" name="issue_qty" id="issue_qty" class="form-control" value="1" min="1" required />
            <label for="issue_qty">Quantity to Issue</label>
          </div>
        </div>
        <div class="modal-footer border-top-0 px-4 pb-4 pt-0 d-flex flex-nowrap">
          <button type="button" class="btn btn-light rounded-pill w-50" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-warning rounded-pill w-50 text-white fw-medium">Confirm</button>
        </div>
      </form>
    </div>
  </div>
</div>