$(document).ready(function () {
  // ==========================================
  // 1. GLOBAL VARIABLES & STATE
  // ==========================================
  let currentUserRole = '';
  let allInventoryData = [];
  let hasCheckedLowStock = false; 

  let filteredInventoryData = [];
  let inventoryCurrentPage = 1; 
  const inventoryItemsPerPage = 5; 

  let allPOData = [];
  let filteredPOData = [];
  let poCurrentPage = 1;
  const poItemsPerPage = 5;

  let currentAnalyticsData = null;
  let valuationChartInstance = null;
  let spendChartInstance = null;

  // ==========================================
  // 2. AUTHENTICATION LOGIC
  // ==========================================
  checkAuth();

  function checkAuth() {
    $.ajax({
      url: "includes/api/api.php?action=check_auth",
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          currentUserRole = res.role;

          $("#currentUser").text(res.full_name);
          $("#loginSection").removeClass("d-flex").hide(); 
          $("#topNavbar, #dashboardSection").fadeIn();
          
          // SPA Initial Load
          if (!window.currentTab) {
            switchTab('inventory');
          }
        } else {
          $("#topNavbar, #dashboardSection").hide();
          $("#loginSection").addClass("d-flex").fadeIn(); 
        }
      },
      error: function() {
        $("#topNavbar, #dashboardSection").hide();
        $("#loginSection").addClass("d-flex").fadeIn();
      }
    });
  }

  let loginCooldownInterval; 
  $(document).on("submit", "#loginForm", function (e) {
    e.preventDefault();
    let btn = $(this).find('button[type="submit"]');
    let originalText = 'Sign In <i class="bi bi-arrow-right ms-2"></i>';
    
    btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> Authenticating...');

    $.ajax({
      url: "includes/api/api.php?action=login",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          btn.prop('disabled', false).html(originalText);
          $("#loginForm")[0].reset();
          $("#loginAlert").empty();
          checkAuth(); 
        } else if (res.status === "locked") {
          let timeLeft = res.remaining;
          clearInterval(loginCooldownInterval); 
          
          loginCooldownInterval = setInterval(function() {
            if (timeLeft <= 0) {
              clearInterval(loginCooldownInterval);
              btn.prop('disabled', false).html(originalText);
              $("#loginAlert").html(`<div class="alert alert-info py-2 small border-0 shadow-sm"><i class="bi bi-info-circle-fill me-1"></i> Cooldown finished. You may try again.</div>`);
            } else {
              btn.prop('disabled', true).html(`<i class="bi bi-lock-fill me-1"></i> Locked (${timeLeft}s)`);
              $("#loginAlert").html(`<div class="alert alert-warning py-2 small border-0 shadow-sm text-dark">
                <i class="bi bi-clock-history me-1"></i> Too many failed attempts. Try again in <strong>${timeLeft}</strong> seconds.
              </div>`);
              timeLeft--;
            }
          }, 1000);
        } else {
          btn.prop('disabled', false).html(originalText);
          $("#loginAlert").html(`<div class="alert alert-danger py-2 small border-0 shadow-sm"><i class="bi bi-exclamation-circle-fill me-1"></i> ${res.message}</div>`);
        }
      },
      error: function() {
        btn.prop('disabled', false).html(originalText);
        $("#loginAlert").html(`<div class="alert alert-danger py-2 small border-0 shadow-sm">Network error connecting to server.</div>`);
      }
    });
  });

  $(document).on("click", "#logoutBtn", function () {
    let btn = $(this);
    btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

    $.ajax({
      url: "includes/api/api.php?action=logout",
      type: "GET",
      dataType: "json",
      success: function () {
        btn.prop('disabled', false).html('<i class="bi bi-box-arrow-right me-1"></i> Logout');
        
        allInventoryData = [];
        allPOData = [];
        hasCheckedLowStock = false; 
        window.currentTab = null;
        
        checkAuth(); 
      }
    });
  });

  // ==========================================
  // 3. SPA LAZY LOADING ENGINE
  // ==========================================
  function initPageScripts(page) {
    if (page === "inventory") {
      loadInventory();
      loadSuppliers();
    } else if (page === "po") {
      loadPOs();
      loadSuppliers();
      populatePODropdowns();
    } else if (page === "analytics") {
      loadAnalytics();
    } else if (page === "vendors") {
      loadVendors();
    }
  }

  function loadPage(page) {
    $("#pageContainer").html(`
      <div class="text-center py-5">
        <div class="spinner-border text-primary"></div>
        <div class="mt-2 text-muted">Loading ${page}...</div>
      </div>
    `);

    $("#pageContainer").load("pages/" + page + ".php", function (response, status) {
      if (status === "error") {
        $("#pageContainer").html(`
          <div class="alert alert-danger shadow-sm border-0">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> Failed to load ${page} module. Ensure pages/${page}.php exists.
          </div>
        `);
      } else {
        initPageScripts(page); 
      }
    });
  }

  window.switchTab = function (tab) {
    window.currentTab = tab;
    $(".nav-link").removeClass("active");
    $("#tab-" + tab).addClass("active");
    loadPage(tab); 
  };

  // ==========================================
  // 4. INVENTORY & FILTER LOGIC
  // ==========================================
  function loadInventory() {
    $.ajax({
      url: "includes/api/api.php?action=get_inventory",
      type: "GET",
      cache: false,
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          allInventoryData = res.data; 
          applyFilters(); 

          if (!hasCheckedLowStock) {
            checkAndShowLowStockAlert(res.data);
            hasCheckedLowStock = true;
          }
        }
      },
    });
  }

  function applyFilters() {
    // Failsafe in case elements don't exist yet
    if ($("#searchInput").length === 0) return;

    let searchTerm = $("#searchInput").val().toLowerCase();
    let supplierFilter = $("#filterSupplier").val();
    let stockFilter = $("#filterStock").val();

    filteredInventoryData = allInventoryData.filter(function (item) {
      let matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
        item.inventory_id.toString().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm));
      let matchesSupplier = supplierFilter === "" || item.supplier_id.toString() === supplierFilter;
      let isLowStock = parseInt(item.quantity) <= parseInt(item.reorder_level);
      let matchesStock = stockFilter === "" || (stockFilter === "low" && isLowStock) || (stockFilter === "healthy" && !isLowStock);
      
      return matchesSearch && matchesSupplier && matchesStock;
    });

    inventoryCurrentPage = 1; 
    renderInventoryTable();
  }

  // 🔥 DELEGATED BINDINGS FOR LAZY LOADED INPUTS
  $(document).on("keyup", "#searchInput", applyFilters);
  $(document).on("change", "#filterSupplier, #filterStock", applyFilters);

  function renderInventoryTable() {
    let rows = "";
    let totalItems = filteredInventoryData.length;
    let totalPages = Math.ceil(totalItems / inventoryItemsPerPage) || 1;
    let startIndex = (inventoryCurrentPage - 1) * inventoryItemsPerPage;
    let endIndex = Math.min(startIndex + inventoryItemsPerPage, totalItems);
    
    let pageData = filteredInventoryData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      rows = `<tr><td colspan="7" class="text-center py-4 text-muted">No items found matching your filters.</td></tr>`;
    } else {
      pageData.forEach(function (item) {
        let isLowStock = parseInt(item.quantity) <= parseInt(item.reorder_level);
        let statusBadge = isLowStock
          ? '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-2"><i class="bi bi-exclamation-triangle-fill me-1"></i> Low Stock</span>'
          : '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2"><i class="bi bi-check-circle-fill me-1"></i> Healthy</span>';

        let forecastHtml = "";
        let daysOut = parseInt(item.days_to_stockout);
        let deleteItemBtn = (currentUserRole === 'admin') 
            ? `<button class="btn btn-sm btn-light text-danger delete-btn" data-id="${item.inventory_id}"><i class="bi bi-trash"></i></button>` 
            : '';
        
        if (daysOut === 999 || item.quantity == 0) forecastHtml = `<span class="text-muted small"><i class="bi bi-dash"></i> No recent usage</span>`;
        else if (daysOut <= 7) forecastHtml = `<span class="text-danger fw-bold small"><i class="bi bi-graph-down-arrow"></i> Out in ~${daysOut} days</span>`;
        else if (daysOut <= 21) forecastHtml = `<span class="text-warning fw-bold small text-dark"><i class="bi bi-graph-down"></i> Out in ~${daysOut} days</span>`;
        else forecastHtml = `<span class="text-success fw-bold small"><i class="bi bi-shield-check"></i> Safe (>3 wks)</span>`;

        if (item.daily_burn_rate > 0) forecastHtml += `<br><span class="text-muted" style="font-size: 0.7rem;">Issues ${item.daily_burn_rate}/day</span>`;

        rows += `<tr>
              <td class="ps-4">
                  <div class="fw-bold text-dark">${item.name}</div>
                  <div class="text-muted small">${item.description || "No description"}</div>
                  <div class="text-muted small">ID: #${item.inventory_id}</div>
              </td>
              <td class="hide-on-mobile"><span class="badge bg-light text-dark border">${item.supplier_name || "N/A"}</span></td>
              <td class="hide-on-mobile fw-medium">₱${parseFloat(item.unit_price).toFixed(2)}</td>
              <td>
                  <div class="fw-bold ${isLowStock ? "text-danger" : ""}">${item.quantity} units</div>
                  <div class="text-muted small">Reorder at ${item.reorder_level}</div>
              </td>
              <td class="hide-on-mobile">${forecastHtml}</td>
              <td class="hide-on-mobile text-end">${statusBadge}</td>
              <td class="pe-4 text-end">
                  <button class="btn btn-sm btn-light text-warning me-1 issue-btn" data-id="${item.inventory_id}" data-name="${item.name}"><i class="bi bi-box-arrow-up"></i></button>
                  <button class="btn btn-sm btn-light text-primary me-1 edit-btn" 
                      data-id="${item.inventory_id}" data-name="${item.name}" data-desc="${item.description}" 
                      data-qty="${item.quantity}" data-price="${item.unit_price}" data-reorder="${item.reorder_level}" 
                      data-supplier="${item.supplier_id}"><i class="bi bi-pencil"></i></button>
                  ${deleteItemBtn} 
              </td>
          </tr>`;
      });
    }
    $("#inventoryTableBody").html(rows);

    if (totalItems > 0) $("#inventoryPaginationInfo").text(`Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`);
    else $("#inventoryPaginationInfo").text("Showing 0 entries");

    renderInventoryPagination(totalPages);
  }

  function renderInventoryPagination(totalPages) {
    let paginationHtml = `<li class="page-item ${inventoryCurrentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" onclick="changeInventoryPage(${inventoryCurrentPage - 1}); return false;">Previous</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `<li class="page-item ${inventoryCurrentPage === i ? "active" : ""}"><a class="page-link" href="#" onclick="changeInventoryPage(${i}); return false;">${i}</a></li>`;
    }
    paginationHtml += `<li class="page-item ${inventoryCurrentPage === totalPages ? "disabled" : ""}"><a class="page-link" href="#" onclick="changeInventoryPage(${inventoryCurrentPage + 1}); return false;">Next</a></li>`;
    $("#inventoryPaginationControls").html(paginationHtml);
  }

  window.changeInventoryPage = function(newPage) {
    inventoryCurrentPage = newPage;
    renderInventoryTable(); 
  };

  // ==========================================
  // 5. ITEM CRUD MODALS
  // ==========================================
  $(document).on("submit", "#addItemForm", function (e) {
    e.preventDefault();
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

    $.ajax({
      url: "includes/api/api.php?action=add_item",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        submitBtn.prop("disabled", false).html(originalText);
        if (res.status === "success") {
          $("#addItemModal").modal("hide");
          $("#addItemForm")[0].reset();
          showAlert(res.message, "success");
          if (window.currentTab === "inventory") loadInventory();
        } else {
          showAlert(res.message, "danger");
        }
      },
      error: function () {
        submitBtn.prop("disabled", false).html(originalText);
        showAlert("A network error occurred.", "danger");
      },
    });
  });

  $(document).on("click", ".edit-btn", function () {
    $("#edit_supplier_id").html($("#supplierSelect").html());
    let btn = $(this);
    $("#edit_inventory_id").val(btn.data("id"));
    $("#edit_name").val(btn.data("name"));
    $("#edit_description").val(btn.data("desc"));
    $("#edit_quantity").val(btn.data("qty"));
    $("#edit_unit_price").val(btn.data("price"));
    $("#edit_reorder_level").val(btn.data("reorder"));
    $("#edit_supplier_id").val(btn.data("supplier"));
    $("#editItemModal").modal("show");
  });

  $(document).on("submit", "#editItemForm", function (e) {
    e.preventDefault();
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Updating...');

    $.ajax({
      url: "includes/api/api.php?action=update_item",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        submitBtn.prop("disabled", false).html(originalText);
        if (res.status === "success") {
          $("#editItemModal").modal("hide");
          showAlert(res.message, "success");
          if (window.currentTab === "inventory") loadInventory();
        } else {
          showAlert(res.message, "danger");
        }
      },
    });
  });

  $(document).on("click", ".delete-btn", function () {
    let itemId = $(this).data("id");
    if (confirm("Are you sure you want to delete this item? This cannot be undone.")) {
      $.ajax({
        url: "includes/api/api.php?action=delete_item",
        type: "POST",
        data: { inventory_id: itemId },
        dataType: "json",
        success: function (res) {
          if (res.status === "success") {
            showAlert(res.message, "success");
            if (window.currentTab === "inventory") loadInventory();
          } else {
            showAlert(res.message, "danger");
          }
        },
      });
    }
  });

  $(document).on("click", ".issue-btn", function () {
    let btn = $(this);
    $("#issue_inventory_id").val(btn.data("id"));
    $("#issue_item_name").text(btn.data("name"));
    $("#issue_qty").val(1);
    $("#issueItemModal").modal("show");
  });

  $(document).on("submit", "#issueItemForm", function (e) {
    e.preventDefault();
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Processing...');

    $.ajax({
      url: "includes/api/api.php?action=issue_item",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        submitBtn.prop("disabled", false).html(originalText);
        if (res.status === "success") {
          $("#issueItemModal").modal("hide");
          showAlert(res.message, "success");
          if (window.currentTab === "inventory") loadInventory();
        } else {
          showAlert(res.message, "danger");
        }
      },
    });
  });

  // ==========================================
  // 6. LOW STOCK NOTIFICATION ENGINE
  // ==========================================
  function checkAndShowLowStockAlert(inventoryData) {
    let lowStockItems = inventoryData.filter(item => parseInt(item.quantity) <= parseInt(item.reorder_level));
    
    if (lowStockItems.length > 0) {
      let rows = "";
      lowStockItems.forEach(item => {
        rows += `<tr>
          <td class="ps-4 fw-bold text-dark">${item.name}</td>
          <td class="text-danger fw-bold">${item.quantity}</td>
          <td class="text-muted">${item.reorder_level}</td>
          <td><span class="badge bg-light text-dark border">${item.supplier_name || "No Supplier"}</span></td>
        </tr>`;
      });
      $("#lowStockTableBody").html(rows);
      setTimeout(() => { $("#lowStockModal").modal("show"); }, 500);
    }
  }

  $(document).on("click", "#manualRestockBtn", function() {
    $("#lowStockModal").modal("hide");
    switchTab('po'); 
  });

  $(document).on("click", "#autoRestockBtn", function() {
    let btn = $(this);
    let originalText = btn.html();
    btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Processing...');

    $.ajax({
      url: "includes/api/api.php?action=auto_restock",
      type: "POST",
      dataType: "json",
      success: function (res) {
        btn.prop("disabled", false).html(originalText);
        $("#lowStockModal").modal("hide");
        if (res.status === "success") {
          showAlert(res.message, "success");
          switchTab('po'); 
        } else {
          showAlert(res.message, "danger");
        }
      },
      error: function() {
        btn.prop("disabled", false).html(originalText);
        showAlert("Network error during auto-restock.", "danger");
      }
    });
  });

  // ==========================================
  // 7. VENDORS LOGIC
  // ==========================================
  function loadSuppliers() {
    $.ajax({
      url: "includes/api/api.php?action=get_suppliers",
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          let options = '<option value="">Select...</option>';
          let filterOptions = '<option value="">All Suppliers</option>';
          res.data.forEach(function (sup) {
            options += `<option value="${sup.supplier_id}">${sup.name}</option>`;
            filterOptions += `<option value="${sup.supplier_id}">${sup.name}</option>`;
          });
          $("#supplierSelect").html(options);
          $("#filterSupplier").html(filterOptions);
          $("#filterPoSupplier").html(filterOptions); 

          if ($("#poSupplierSelect").length) {
            $("#poSupplierSelect").html(options);
            $("#poItemSelect").html('<option value="">Select a Supplier first...</option>');
          }
        }
      },
    });
  }

  function loadVendors() {
    $.ajax({
      url: "includes/api/api.php?action=get_suppliers",
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          let rows = "";
          res.data.forEach(function (vendor) {
            let deleteVendorBtn = (currentUserRole === 'admin')
            ? `<button class="btn btn-sm btn-light text-danger me-2 delete-vendor-btn" data-id="${vendor.supplier_id}" title="Delete"><i class="bi bi-trash"></i></button>`
            : '';

            rows += `<tr>
              <td class="ps-4">
                  <div class="fw-bold text-dark">${vendor.name}</div>
                  <div class="text-muted small"><i class="bi bi-person me-1"></i>${vendor.contact_person || "N/A"}</div>
              </td>
              <td>
                  <div class="small"><i class="bi bi-envelope me-1"></i>${vendor.email || "N/A"}</div>
                  <div class="text-muted small"><i class="bi bi-telephone me-1"></i>${vendor.phone || "N/A"}</div>
              </td>
              <td class="pe-4 text-end">
                <button class="btn btn-sm btn-light text-primary me-1 edit-vendor-btn" 
                    data-id="${vendor.supplier_id}" data-name="${vendor.name}" data-person="${vendor.contact_person || ''}"
                    data-phone="${vendor.phone || ''}" data-email="${vendor.email || ''}" data-address="${vendor.address || ''}" title="Edit">
                    <i class="bi bi-pencil"></i>
                </button>
                ${deleteVendorBtn}
                <button class="btn btn-sm btn-outline-primary rounded-pill view-history-btn" data-id="${vendor.supplier_id}" data-name="${vendor.name}">
                  <i class="bi bi-clock-history"></i> History
                </button>
              </td>
            </tr>`;
          });
          $("#vendorTableBody").html(rows);
        }
      },
    });
  }

  $(document).on("click", ".edit-vendor-btn", function () {
    let btn = $(this);
    $("#edit_vendor_id").val(btn.data("id"));
    $("#edit_vendor_name").val(btn.data("name"));
    $("#edit_vendor_contact_person").val(btn.data("person"));
    $("#edit_vendor_phone").val(btn.data("phone"));
    $("#edit_vendor_email").val(btn.data("email"));
    $("#edit_vendor_address").val(btn.data("address"));
    $("#editVendorModal").modal("show");
  });

  $(document).on("submit", "#addVendorForm", function (e) {
    e.preventDefault();
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Saving...');

    $.ajax({
      url: "includes/api/api.php?action=add_supplier",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        submitBtn.prop("disabled", false).html(originalText);
        if (res.status === "success") {
          $("#addVendorModal").modal("hide");
          $("#addVendorForm")[0].reset();
          showAlert(res.message, "success");
          if (window.currentTab === "vendors") loadVendors();
          loadSuppliers(); 
        } else {
          showAlert(res.message, "danger");
        }
      }
    });
  });

  $(document).on("submit", "#editVendorForm", function (e) {
    e.preventDefault();
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Updating...');

    $.ajax({
      url: "includes/api/api.php?action=update_supplier",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        submitBtn.prop("disabled", false).html(originalText);
        if (res.status === "success") {
          $("#editVendorModal").modal("hide");
          showAlert(res.message, "success");
          if (window.currentTab === "vendors") loadVendors();
          loadSuppliers(); 
        } else {
          showAlert(res.message, "danger");
        }
      }
    });
  });

  $(document).on("click", ".delete-vendor-btn", function () {
    let supplierId = $(this).data("id");
    if (confirm("Are you sure you want to delete this vendor? This will fail if they have active inventory items or purchase orders.")) {
      $.ajax({
        url: "includes/api/api.php?action=delete_supplier",
        type: "POST",
        data: { supplier_id: supplierId },
        dataType: "json",
        success: function (res) {
          if (res.status === "success") {
            showAlert(res.message, "success");
            if (window.currentTab === "vendors") loadVendors();
            loadSuppliers(); 
          } else {
            showAlert(res.message, "danger"); 
          }
        }
      });
    }
  });

  $(document).on("click", ".view-history-btn", function () {
    let supplierId = $(this).data("id");
    let supplierName = $(this).data("name");
    
    $("#historyVendorName").text(supplierName);
    $("#vendorHistoryTableBody").html('<tr><td colspan="5" class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm"></span> Loading history...</td></tr>');
    $("#vendorHistoryModal").modal("show");

    $.ajax({
      url: "includes/api/api.php?action=get_vendor_history&supplier_id=" + supplierId,
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          let rows = ""; 
          if (res.data.length === 0) { 
            rows = `<tr><td colspan="5" class="text-center py-4 text-muted">No procurement history found for this vendor.</td></tr>`;
          } else {
            res.data.forEach(function (po) { 
              let statusClass = po.status === "Received" ? "text-success" : (po.status === "Cancelled" ? "text-danger" : "text-warning");
              rows += `<tr>
                <td class="ps-4 fw-bold">#PO-${po.po_id}</td>
                <td>${po.order_date}</td>
                <td class="fw-medium">₱${parseFloat(po.total_amount).toFixed(2)}</td>
                <td class="${statusClass} fw-bold">${po.status}</td>
                <td class="pe-4 text-end">
                  <button class="btn btn-sm btn-outline-secondary rounded-pill view-po-details-btn" data-id="${po.po_id}">
                    <i class="bi bi-list-ul"></i> Items
                  </button>
                </td>
              </tr>`;
            });
          }
          $("#vendorHistoryTableBody").html(rows);
        } else {
          $("#vendorHistoryTableBody").html(`<tr><td colspan="5" class="text-center text-danger py-4">Error loading data.</td></tr>`);
        }
      }
    });
  });

  // ==========================================
  // 8. PURCHASE ORDERS LOGIC
  // ==========================================
  function loadPOs() {
    $.ajax({
      url: "includes/api/api.php?action=get_pos",
      type: "GET",
      cache: false,
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          allPOData = res.data; 
          applyPOFilters(); 
        }
      }
    });
  }

  function applyPOFilters() {
    // Failsafe in case elements don't exist yet
    if ($("#filterPoDateFrom").length === 0) return;

    let dateFrom = $("#filterPoDateFrom").val();
    let dateTo = $("#filterPoDateTo").val();
    let supplierFilter = $("#filterPoSupplier").val();

    filteredPOData = allPOData.filter(function (po) {
      let matchesDateFrom = dateFrom === "" || po.order_date >= dateFrom;
      let matchesDateTo = dateTo === "" || po.order_date <= dateTo;
      let matchesSupplier = supplierFilter === "" || po.supplier_id.toString() === supplierFilter;
      return matchesDateFrom && matchesDateTo && matchesSupplier;
    });

    poCurrentPage = 1; 
    renderPOTable();
  }

  // 🔥 DELEGATED BINDINGS FOR LAZY LOADED INPUTS
  $(document).on("change", "#filterPoDateFrom, #filterPoDateTo, #filterPoSupplier", applyPOFilters);

  function renderPOTable() {
    let rows = "";
    let totalItems = filteredPOData.length;
    let totalPages = Math.ceil(totalItems / poItemsPerPage) || 1;
    let startIndex = (poCurrentPage - 1) * poItemsPerPage;
    let endIndex = Math.min(startIndex + poItemsPerPage, totalItems);
    let pageData = filteredPOData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      rows = `<tr><td colspan="6" class="text-center py-4 text-muted">No purchase orders found matching your filters.</td></tr>`;
    } else {
      pageData.forEach(function (po) {
        let statusDisplay = "";
        let role = currentUserRole.toLowerCase();

        if (po.status === "Pending") {
          // 1. PENDING: Only Admins can approve or cancel
          if (role === 'admin') {
              statusDisplay = `
                  <select class="form-select form-select-sm border border-warning shadow-sm status-dropdown fw-bold text-warning" 
                          data-id="${po.po_id}" data-current="${po.status}" style="width: 150px; cursor: pointer;">
                      <option value="Pending" selected disabled>Pending (Action...)</option>
                      <option value="Approved" class="text-primary">↳ Approve PO</option>
                      <option value="Cancelled" class="text-danger">↳ Cancel PO</option>
                  </select>`;
          } else {
              statusDisplay = '<span class="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2"><i class="bi bi-hourglass-split me-1"></i> Pending Finance</span>';
          }
        } 
        else if (po.status === "Approved") {
          // 2. APPROVED: ANY user (Admin or Employee) can Receive or report an Issue
          statusDisplay = `
              <select class="form-select form-select-sm border border-success text-success shadow-sm status-dropdown fw-bold" 
                      data-id="${po.po_id}" data-current="${po.status}" style="width: 150px; cursor: pointer;">
                  <option value="Approved" selected disabled>Approved (Action...)</option>
                  <option value="Received" class="text-success">↳ Receive Items</option>
                  <option value="Missing" class="text-danger">↳ Report Missing</option>
                  <option value="Issues" class="text-warning">↳ Report Issues</option>
              </select>`;
        } 
        else if (po.status === "Missing") {
          // 3. MISSING: Locked! Static badge, no longer a dropdown.
          statusDisplay = '<span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2"><i class="bi bi-exclamation-triangle-fill me-1"></i> Missing</span>';
        }
        else if (po.status === "Issues") {
          // 4. ISSUES: Locked! Static badge, no longer a dropdown.
          statusDisplay = '<span class="badge bg-warning bg-opacity-10 text-dark border border-warning rounded-pill px-3 py-2"><i class="bi bi-exclamation-circle-fill me-1"></i> Issues Reported</span>';
        }
        else if (po.status === "Received") {
          // 5. RECEIVED: Locked!
          statusDisplay = '<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2"><i class="bi bi-check-circle-fill me-1"></i> Received</span>';
        } 
        else {
          // 6. CANCELLED / OTHER: Locked!
          statusDisplay = `<span class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-3 py-2"><i class="bi bi-x-circle-fill me-1"></i> ${po.status}</span>`;
        }

        let editBtn = po.status === "Pending" ? `<br><button class="btn btn-link btn-sm p-0 text-decoration-none small edit-po-qty-btn mt-1" data-id="${po.po_id}" data-qty="${po.item_qty}" data-price="${po.unit_price}">Edit Qty</button>` : "";

        rows += `<tr>
            <td class="ps-4 fw-bold">#PO-${po.po_id}</td>
            <td class="hide-on-mobile">${po.order_date}</td>
            <td>${po.supplier_name}</td>
            <td>
                <div class="fw-bold text-dark">${po.item_name || "No Item Data"}</div>
                <div class="text-muted small">Qty: ${po.item_qty || 0} @ ₱${parseFloat(po.unit_price).toFixed(2)} ${editBtn}</div>
            </td>
            <td class="hide-on-mobile fw-medium text-primary">₱${parseFloat(po.total_amount).toFixed(2)}</td>
            <td>${statusDisplay}</td>
        </tr>`;
      });
    }

    $("#poTableBody").html(rows);
    if (totalItems > 0) $("#poPaginationInfo").text(`Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`);
    else $("#poPaginationInfo").text("Showing 0 entries");
    renderPOPagination(totalPages);
  }

  function renderPOPagination(totalPages) {
    let paginationHtml = `<li class="page-item ${poCurrentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" onclick="changePOPage(${poCurrentPage - 1}); return false;">Previous</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `<li class="page-item ${poCurrentPage === i ? "active" : ""}"><a class="page-link" href="#" onclick="changePOPage(${i}); return false;">${i}</a></li>`;
    }
    paginationHtml += `<li class="page-item ${poCurrentPage === totalPages ? "disabled" : ""}"><a class="page-link" href="#" onclick="changePOPage(${poCurrentPage + 1}); return false;">Next</a></li>`;
    $("#poPaginationControls").html(paginationHtml);
  }

  window.changePOPage = function(newPage) {
    poCurrentPage = newPage;
    renderPOTable();
  };

  $(document).on("click", ".edit-po-qty-btn", function () {
    let poId = $(this).data("id");
    let currentQty = $(this).data("qty");
    let unitPrice = parseFloat($(this).data("price"));

    $("#edit_po_id").val(poId);
    $("#edit_po_unit_price").val(unitPrice);
    $("#edit_po_unit_price_display").text("₱" + unitPrice.toFixed(2));
    $("#edit_po_qty").val(currentQty);
    $("#edit_po_total_display").text("₱" + (currentQty * unitPrice).toFixed(2));
    $("#editPoQtyModal").modal("show");
  });

  $(document).on("input", "#edit_po_qty", function() {
    let qty = parseInt($(this).val()) || 0;
    let price = parseFloat($("#edit_po_unit_price").val());
    $("#edit_po_total_display").text("₱" + (qty * price).toFixed(2));
  });

  $(document).on("submit", "#editPoQtyForm", function (e) {
    e.preventDefault();
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Updating...');

    $.ajax({
      url: "includes/api/api.php?action=update_po_qty",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        submitBtn.prop("disabled", false).html(originalText);
        if (res.status === "success") {
          $("#editPoQtyModal").modal("hide");
          showAlert(res.message, "success");
          if (window.currentTab === "po") loadPOs();
        } else {
          showAlert(res.message, "danger");
        }
      }
    });
  });

  function populatePODropdowns() {
    $("#poSupplierSelect").html($("#supplierSelect").html());
    $("#poItemSelect").html('<option value="">Select a Supplier first...</option>');
  }

  $(document).on("change", "#poItemSelect", function () {
    let selectedOption = $(this).find("option:selected");
    let itemPrice = selectedOption.data("price");
    let priceInput = $('#createPOForm input[name="unit_price"]');
    if (itemPrice !== undefined) priceInput.val(itemPrice); 
    else priceInput.val(""); 
  });

  $(document).on("change", "#poSupplierSelect", function () {
    let supplier_id = $(this).val();
    let itemSelect = $("#poItemSelect");

    if (!supplier_id) {
      itemSelect.html('<option value="">Select a Supplier first...</option>');
      return;
    }
    itemSelect.html('<option value="">Loading items...</option>');

    $.ajax({
      url: "includes/api/api.php?action=get_supplier_items&supplier_id=" + supplier_id,
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          if (res.data.length === 0) {
            itemSelect.html('<option value="">No items registered for this supplier</option>');
          } else {
            let options = '<option value="">Select an Item...</option>';
            res.data.forEach(function (item) {
              options += `<option value="${item.inventory_id}" data-price="${item.unit_price}">${item.name} (Current Stock: ${item.quantity})</option>`;
            });
            itemSelect.html(options);
          }
        }
      },
    });
  });

  $(document).on("submit", "#createPOForm", function (e) {
    e.preventDefault();
    $.ajax({
      url: "includes/api/api.php?action=create_po",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          $("#createPOModal").modal("hide");
          $("#createPOForm")[0].reset();
          showAlert(res.message, "success");
          if (window.currentTab === "po") loadPOs();
        } else {
          showAlert(res.message, "danger");
        }
      },
    });
  });

  $(document).on("change", ".status-dropdown", function () {
    let selectElement = $(this);
    let po_id = selectElement.data("id");
    let currentStatus = selectElement.data("current");
    let newStatus = selectElement.val();

    if (newStatus === "Received") {
      if (confirm("Are you sure you want to mark this as RECEIVED? This will officially add stock to your inventory and generate a Finance invoice. This cannot be undone.")) {
        selectElement.prop("disabled", true);
        $.ajax({
          url: "includes/api/api.php?action=receive_po",
          type: "POST",
          dataType: "json",
          data: { po_id: po_id },
          success: function (res) {
            showAlert(res.message, res.status === "success" ? "success" : "danger");
            if (window.currentTab === "po") loadPOs();
          }
        });
      } else selectElement.val(currentStatus);
    } else if (newStatus === "Cancelled") {
      if (confirm("Are you sure you want to CANCEL this Purchase Order?")) {
        $.ajax({
          url: "includes/api/api.php?action=cancel_po",
          type: "POST",
          dataType: "json",
          data: { po_id: po_id },
          success: function (res) {
            showAlert(res.message, res.status === "success" ? "success" : "danger");
            if (window.currentTab === "po") loadPOs();
          }
        });
      } else selectElement.val(currentStatus);
    } else {
      $.ajax({
        url: "includes/api/api.php?action=update_po_status",
        type: "POST",
        dataType: "json",
        data: { po_id: po_id, status: newStatus },
        success: function (res) {
          showAlert(res.message, res.status === "success" ? "success" : "danger");
          if (res.status === "success") {
             if (window.currentTab === "po") loadPOs();
          } else {
             selectElement.val(currentStatus); 
          }
        },
      });
    }
  });

  $(document).on("click", ".view-po-details-btn", function () {
    let poId = $(this).data("id");
    $("#detailsPoId").text("#PO-" + poId);
    $("#poDetailsTableBody").html('<tr><td colspan="4" class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm"></span> Loading items...</td></tr>');
    $("#vendorHistoryModal").modal("hide");
    $("#poDetailsModal").modal("show");

    $.ajax({
      url: "includes/api/api.php?action=get_po_details&po_id=" + poId,
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          let rows = "";
          if (res.data.length === 0) {
            rows = `<tr><td colspan="4" class="text-center py-4 text-muted">No items found for this PO.</td></tr>`;
          } else {
            res.data.forEach(function (item) {
              let subtotal = item.quantity * item.unit_price;
              rows += `<tr>
                <td class="ps-4 fw-bold text-dark">${item.name}</td>
                <td>${item.quantity}</td>
                <td>₱${parseFloat(item.unit_price).toFixed(2)}</td>
                <td class="pe-4 text-end fw-medium text-success">₱${subtotal.toFixed(2)}</td>
              </tr>`;
            });
          }
          $("#poDetailsTableBody").html(rows);
        } else {
          $("#poDetailsTableBody").html(`<tr><td colspan="4" class="text-center text-danger py-3">Error loading details.</td></tr>`);
        }
      },
      error: function() {
        $("#poDetailsTableBody").html(`<tr><td colspan="4" class="text-center text-danger py-3">Network error. Check connection.</td></tr>`);
      }
    });
  });

  // ==========================================
  // 9. ANALYTICS LOGIC
  // ==========================================
  window.loadAnalytics = function (btn = null) {
    let originalText = "";
    if (btn) {
      originalText = $(btn).html();
      $(btn).prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Refreshing...');
    }

    $.ajax({
      url: "includes/api/api.php?action=get_analytics",
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (btn) $(btn).prop("disabled", false).html(originalText);

        if (res.status === "success") {
          let data = res.data;
          currentAnalyticsData = data; 

          $("#statTotalValue").text("₱" + parseFloat(data.total_value).toLocaleString("en-US", { minimumFractionDigits: 2 }));
          $("#statTotalSpend").text("₱" + parseFloat(data.total_spend).toLocaleString("en-US", { minimumFractionDigits: 2 }));
          $("#statTotalItems").text(data.total_items);
          $("#statTurnover").text(data.turnover_ratio + "x");

          let predHtml = "";
          if (data.predictions && data.predictions.length > 0) {
            data.predictions.forEach(item => {
              predHtml += `<li class="list-group-item d-flex justify-content-between align-items-center py-3">
                  <div>
                    <div class="fw-bold text-dark">${item.name}</div>
                    <div class="small text-muted">Stock: ${item.quantity} | Burns: ${parseFloat(item.daily_burn).toFixed(1)}/day</div>
                  </div>
                  <span class="badge bg-danger rounded-pill px-3 py-2">Out in ~${item.days_left} days</span>
                </li>`;
            });
          } else {
            predHtml = `<li class="list-group-item text-center py-4 text-success small fw-bold"><i class="bi bi-shield-check me-2"></i>No imminent stockouts predicted!</li>`;
          }
          $("#predictiveList").html(predHtml);

          $("#prescriptiveLowCount").text(data.low_stock);
          if (data.low_stock > 0) {
            $("#prescriptiveAutoRestockBtn").prop("disabled", false).removeClass("btn-secondary").addClass("btn-success");
          } else {
            $("#prescriptiveAutoRestockBtn").prop("disabled", true).removeClass("btn-success").addClass("btn-secondary").html('<i class="bi bi-check-all me-2"></i> Stock Optimal');
          }

          let valLabels = []; let valData = [];
          data.valuation_data.forEach(row => { valLabels.push(row.supplier_name); valData.push(row.supplier_value); });

          let spendLabels = []; let spendData = [];
          data.spend_by_category.forEach(row => { spendLabels.push(row.category_name); spendData.push(row.category_spend); });

          if (window.valuationChartInstance) window.valuationChartInstance.destroy();
          if (window.spendChartInstance) window.spendChartInstance.destroy();

          let ctxVal = document.getElementById("valuationChart");
          if(ctxVal) {
            window.valuationChartInstance = new Chart(ctxVal.getContext("2d"), {
              type: "bar",
              data: { labels: valLabels, datasets: [{ label: "Valuation (₱)", data: valData, backgroundColor: "rgba(13, 110, 253, 0.8)", borderRadius: 4 }] },
              plugins: [ChartDataLabels],
              options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { color: '#ffffff', anchor: 'end', align: 'bottom', font: { weight: 'bold' }, formatter: value => '₱' + parseFloat(value).toLocaleString("en-US") } } }
            });
          }

          let ctxSpend = document.getElementById("spendChart");
          if (ctxSpend) {
            window.spendChartInstance = new Chart(ctxSpend.getContext("2d"), {
              type: "doughnut",
              data: { labels: spendLabels, datasets: [{ data: spendData, backgroundColor: ["#198754", "#ffc107", "#0dcaf0", "#d63384", "#6f42c1"], borderWidth: 2, borderColor: '#ffffff' }] },
              plugins: [ChartDataLabels],
              options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { position: "right", labels: { padding: 15, generateLabels: function(chart) { const data = chart.data; if (data.labels.length && data.datasets.length) { return data.labels.map(function(label, i) { const meta = chart.getDatasetMeta(0); const style = meta.controller.getStyle(i); const value = data.datasets[0].data[i]; const formattedVal = '₱' + parseFloat(value).toLocaleString("en-US"); return { text: `${label} (${formattedVal})`, fillStyle: style.backgroundColor, strokeStyle: style.borderColor, lineWidth: style.borderWidth, hidden: !chart.getDataVisibility(i), index: i }; }); } return []; } } }, datalabels: { color: '#ffffff', font: { weight: 'bold', size: 11 }, formatter: value => value == 0 ? '' : '₱' + parseFloat(value).toLocaleString("en-US") } } }
            });
          }

          if (btn) showAlert("Dashboard data refreshed successfully!", "success");
        }
      },
      error: function () {
        if (btn) $(btn).prop("disabled", false).html(originalText);
        showAlert("Network error while trying to refresh data.", "danger");
      }
    });
  };

  $(document).on("click", "#prescriptiveAutoRestockBtn", function() {
    let btn = $(this);
    let originalText = btn.html();
    btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Generating POs...');

    $.ajax({
      url: "includes/api/api.php?action=auto_restock",
      type: "POST",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          showAlert(res.message, "success");
          if (window.currentTab === "analytics") loadAnalytics(); 
        } else {
          btn.prop("disabled", false).html(originalText);
          showAlert(res.message, "danger");
        }
      }
    });
  });

  // ==========================================
  // 10. HELPER EXPORTS & ALERTS
  // ==========================================
  function showAlert(msg, type) {
    $("#alertBox").html(`<div class="alert alert-${type} alert-dismissible fade show border-0 shadow-sm">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`);
  }

  window.exportExcel = function() {
    if (!currentAnalyticsData) { showAlert("Please wait for analytics data to load.", "warning"); return; }
    const wb = XLSX.utils.book_new();
    const kpiData = [ ["Metric", "Value"], ["Total Stock Valuation", parseFloat(currentAnalyticsData.total_value)], ["Total PO Spend", parseFloat(currentAnalyticsData.total_spend)], ["Inventory Turnover Ratio", parseFloat(currentAnalyticsData.turnover_ratio)], ["Total Unique Items", parseInt(currentAnalyticsData.total_items)], ["Shortages (Low Stock)", parseInt(currentAnalyticsData.low_stock)], ["Overstock Alerts", parseInt(currentAnalyticsData.overstock)] ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), "KPI Summary");
    const valData = [["Supplier Name", "Stock Valuation (₱)"]]; currentAnalyticsData.valuation_data.forEach(row => { valData.push([row.supplier_name, parseFloat(row.supplier_value)]); }); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(valData), "Valuation by Supplier");
    const spendData = [["Category/Supplier", "Total Spend (₱)"]]; currentAnalyticsData.spend_by_category.forEach(row => { spendData.push([row.category_name, parseFloat(row.category_spend)]); }); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(spendData), "Spend by Category");
    XLSX.writeFile(wb, `Inventory_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  window.exportPDF = function() {
    const { jsPDF } = window.jspdf; const element = document.getElementById('analyticsContainer'); const buttons = document.getElementById('analyticsButtons');
    buttons.style.display = 'none'; const originalWidth = element.style.width; const originalMaxWidth = element.style.maxWidth; const originalBg = element.style.backgroundColor; const originalPadding = element.style.padding;
    const targetWidth = 1200; element.style.width = targetWidth + 'px'; element.style.maxWidth = targetWidth + 'px'; element.style.backgroundColor = '#f3f4f6'; element.style.padding = '20px';
    html2canvas(element, { scale: 2, useCORS: true, logging: false, width: targetWidth, windowWidth: targetWidth }).then((canvas) => {
      buttons.style.display = 'flex'; element.style.width = originalWidth; element.style.maxWidth = originalMaxWidth; element.style.backgroundColor = originalBg; element.style.padding = originalPadding;
      const imgData = canvas.toDataURL('image/jpeg', 1.0); const pdf = new jsPDF('landscape', 'in', 'letter'); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData); const margin = 0.3; const maxImgWidth = pdfWidth - (margin * 2); const maxImgHeight = pdfHeight - (margin * 2);
      const ratio = Math.min(maxImgWidth / imgProps.width, maxImgHeight / imgProps.height); const finalWidth = imgProps.width * ratio; const finalHeight = imgProps.height * ratio;
      pdf.addImage(imgData, 'JPEG', (pdfWidth - finalWidth) / 2, margin, finalWidth, finalHeight); pdf.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    }).catch(err => {
      buttons.style.display = 'flex'; element.style.width = originalWidth; element.style.maxWidth = originalMaxWidth; element.style.backgroundColor = originalBg; element.style.padding = originalPadding;
      showAlert("Failed to generate PDF.", "danger");
    });
  };
});