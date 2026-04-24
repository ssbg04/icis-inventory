<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ICIS Inventory System</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" />

    <link rel="stylesheet" href="assets/css/style.css">

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  </head>

  <body>
    <nav class="navbar navbar-expand-lg navbar-custom py-3 mb-4">
      <div class="container">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2 text-dark" href="#">
          <div class="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-flex">
            <i class="bi bi-box-seam"></i>
          </div>
          ICIS Inventory System
        </a>
      </div>
    </nav>

    <div class="container" id="dashboardSection">
      <div id="alertBox"></div>

      <div class="mb-4 overflow-auto">
        <ul class="nav nav-pills" id="dashboardTabs">
          <li class="nav-item">
            <a class="nav-link active" href="#" id="tab-inventory" onclick="switchTab('inventory')">
              <i class="bi bi-boxes me-1"></i> Inventory View
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="tab-vendors" onclick="switchTab('vendors')">
              <i class="bi bi-boxes me-1"></i>Vendors
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="tab-po" onclick="switchTab('po')">
              <i class="bi bi-receipt me-1"></i> Purchase Orders
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" id="tab-analytics" onclick="switchTab('analytics')">
              <i class="bi bi-graph-up-arrow me-1"></i> Reports & Analytics
            </a>
          </li>
        </ul>
      </div>

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

      <div id="poContainer" style="display: none">
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

      <div id="analyticsContainer" style="display: none">
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

      <div id="vendorsContainer" style="display: none">
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
    </div>


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

    <script src="assets/js/app.js"></script>
  </body>
</html>