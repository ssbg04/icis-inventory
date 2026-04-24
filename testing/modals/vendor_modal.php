
<!-- ADD VENDOR MODAL -->
<div class="modal fade" id="addVendorModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
          <form id="addVendorForm">
            <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
              <h5 class="modal-title fw-bold">Add New Vendor</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body px-4 py-4">
              <div class="form-floating mb-3">
                <input type="text" name="name" class="form-control" id="addVendorName" placeholder="Company Name" required />
                <label for="addVendorName">Company Name</label>
              </div>
              <div class="form-floating mb-3">
                <input type="text" name="contact_person" class="form-control" placeholder="Contact Person" />
                <label>Contact Person</label>
              </div>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="form-floating">
                    <input type="text" name="phone" class="form-control" placeholder="Phone" />
                    <label>Phone Number</label>
                  </div>
                </div>
                <div class="col-6">
                  <div class="form-floating">
                    <input type="email" name="email" class="form-control" placeholder="Email" />
                    <label>Email Address</label>
                  </div>
                </div>
              </div>
              <div class="form-floating">
                <textarea name="address" class="form-control" style="height: 80px" placeholder="Physical Address"></textarea>
                <label>Physical Address</label>
              </div>
            </div>
            <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
              <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary rounded-pill px-4">Save Vendor</button>
            </div>
          </form>
        </div>
    </div>
</div>

<!-- EDIT VENDOR MODAL -->
<div class="modal fade" id="editVendorModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
      <form id="editVendorForm">
        <input type="hidden" name="supplier_id" id="edit_vendor_id" />
        <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
          <h5 class="modal-title fw-bold">Edit Vendor</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body px-4 py-4">
          <div class="form-floating mb-3">
            <input type="text" name="name" id="edit_vendor_name" class="form-control" placeholder="Company Name" required />
            <label>Company Name</label>
          </div>
          <div class="form-floating mb-3">
            <input type="text" name="contact_person" id="edit_vendor_contact_person" class="form-control" placeholder="Contact Person" />
            <label>Contact Person</label>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <div class="form-floating">
                <input type="text" name="phone" id="edit_vendor_phone" class="form-control" placeholder="Phone" />
                <label>Phone Number</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating">
                <input type="email" name="email" id="edit_vendor_email" class="form-control" placeholder="Email" />
                <label>Email Address</label>
              </div>
            </div>
          </div>
          <div class="form-floating">
            <textarea name="address" id="edit_vendor_address" class="form-control" style="height: 80px" placeholder="Physical Address"></textarea>
            <label>Physical Address</label>
          </div>
        </div>
        <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
          <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
          <button type="submit" class="btn btn-primary rounded-pill px-4">Update Vendor</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- VENDOR HISTORY MODAL -->
<div class="modal fade" id="vendorHistoryModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
      <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
        <h5 class="modal-title fw-bold">
          Procurement History: <span id="historyVendorName" class="text-primary"></span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body px-4 py-4">
        
        <div class="table-responsive border rounded-3 overflow-hidden">
          <table class="table table-hover table-custom mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">PO #</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th class="pe-4 text-end">Action</th> </tr>
            </thead>
            <tbody id="vendorHistoryTableBody">
              </tbody>
          </table>
        </div>

      </div>
      <div class="modal-footer border-top-0 px-4 pb-4 pt-0">
        <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

<!-- VENDOR PO DETAILS MODAL -->
<div class="modal fade" id="poDetailsModal" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
      <div class="modal-header border-bottom-0 pb-0 px-4 pt-4">
        <h5 class="modal-title fw-bold">
          PO Items: <span id="detailsPoId" class="text-primary"></span>
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body px-4 py-4">
        <div class="table-responsive border rounded-3 overflow-hidden">
          <table class="table table-hover table-custom mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Item Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th class="pe-4 text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody id="poDetailsTableBody">
              </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer border-top-0 px-4 pb-4 pt-0 d-flex justify-content-between">
        <button type="button" class="btn btn-light rounded-pill px-4" data-bs-toggle="modal" data-bs-target="#vendorHistoryModal">
          <i class="bi bi-arrow-left me-1"></i> Back to History
        </button>
        <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>