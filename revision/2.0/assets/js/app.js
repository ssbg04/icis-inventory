$(document).ready(function () {
        // 1. App Initialization & Authentication Check
        // checkAuth();

        // function checkAuth() {
        //   $.ajax({
        //     url: "api.php?action=check_auth",
        //     type: "GET",
        //     dataType: "json",
        //     success: function (res) {
        //       if (res.status === "success") {
        //         // Logged in
        //         $("#currentUser").text(res.username);
        //         $("#loginSection").hide();
        //         $("#dashboardSection").fadeIn();
        //         loadInventory();
        //         loadSuppliers();
        //       } else {
        //         // Not logged in
        //         $("#dashboardSection").hide();
        //         $("#loginSection").fadeIn();
        //       }
        //     },
        //   });
        // }

        // 2. Login Handling
        // $("#loginForm").submit(function (e) {
        //   e.preventDefault();
        //   $.ajax({
        //     url: "api.php?action=login",
        //     type: "POST",
        //     data: $(this).serialize(),
        //     dataType: "json",
        //     success: function (res) {
        //       if (res.status === "success") {
        //         $("#loginForm")[0].reset();
        //         $("#loginAlert").empty();
        //         checkAuth(); // Reload state
        //       } else {
        //         $("#loginAlert").html(
        //           `<div class="alert alert-danger py-2 small">${res.message}</div>`,
        //         );
        //       }
        //     },
        //   });
        // });

        // 3. Logout Handling
        // $("#logoutBtn").click(function () {
        //   $.ajax({
        //     url: "api.php?action=logout",
        //     type: "GET",
        //     dataType: "json",
        //     success: function (res) {
        //       checkAuth();
        //     },
        //   });
        // });

      // --- Low Stock Auto-Notification Logic ---
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
      
      // Delay slightly so the UI finishes painting first
      setTimeout(() => {
        $("#lowStockModal").modal("show");
      }, 500);
    }
  }

  // Handle "Manual Restock" button
  $("#manualRestockBtn").click(function() {
    $("#lowStockModal").modal("hide");
    switchTab('po'); // Switches to the PO tab
  });

  // Handle "Auto Restock" button
  $("#autoRestockBtn").click(function() {
    let btn = $(this);
    let originalText = btn.html();
    btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Processing...');

    $.ajax({
      url: "api.php?action=auto_restock",
      type: "POST",
      dataType: "json",
      success: function (res) {
        btn.prop("disabled", false).html(originalText);
        $("#lowStockModal").modal("hide");
        
        if (res.status === "success") {
          showAlert(res.message, "success");
          switchTab('po'); // Switch to PO tab to see the new pending orders
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

      let allInventoryData = [];
      let hasCheckedLowStock = false; // NEW FLAG

      let inventoryCurrentPage = 1;   // The page we are currently looking at
      const inventoryItemsPerPage = 5; // How many rows to show per page

      let allPOData = [];
      let filteredPOData = [];
      let poCurrentPage = 1;
      const poItemsPerPage = 5;
        loadInventory();
        loadSuppliers();

        // 4. Data Loading functions
        // 1. Declare this globally at the top of your $(document).ready block!

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

          // NEW: Check for low stock on initial load
          if (!hasCheckedLowStock) {
            checkAndShowLowStockAlert(res.data);
            hasCheckedLowStock = true;
          }
        }
      },
    });
  }

        // 2. The new Filtering Engine
        function applyFilters() {
          let searchTerm = $("#searchInput").val().toLowerCase();
          let supplierFilter = $("#filterSupplier").val();
          let stockFilter = $("#filterStock").val();

          // Save the result to our new filteredInventoryData array
          filteredInventoryData = allInventoryData.filter(function (item) {
            let matchesSearch =
              item.name.toLowerCase().includes(searchTerm) ||
              item.inventory_id.toString().includes(searchTerm) ||
              (item.description && item.description.toLowerCase().includes(searchTerm));

            let matchesSupplier = supplierFilter === "" || item.supplier_id.toString() === supplierFilter;

            let isLowStock = parseInt(item.quantity) <= parseInt(item.reorder_level);
            let matchesStock =
              stockFilter === "" ||
              (stockFilter === "low" && isLowStock) ||
              (stockFilter === "healthy" && !isLowStock);

            return matchesSearch && matchesSupplier && matchesStock;
          });

          inventoryCurrentPage = 1; // Reset to page 1 when searching
          renderInventoryTable();
        }

        // Attach event listeners so it filters instantly when you type or click!
        $("#searchInput").on("keyup", applyFilters);
        $("#filterSupplier, #filterStock").on("change", applyFilters);

        // 3. The separated rendering function
        // 4. Render Inventory Table
  function renderInventoryTable() {
    let rows = "";
    
    // --- NEW: Pagination Math ---
    let totalItems = filteredInventoryData.length;
    let totalPages = Math.ceil(totalItems / inventoryItemsPerPage) || 1;
    let startIndex = (inventoryCurrentPage - 1) * inventoryItemsPerPage;
    let endIndex = Math.min(startIndex + inventoryItemsPerPage, totalItems);
    
    // Slice the array to only grab the items for the current page!
    let pageData = filteredInventoryData.slice(startIndex, endIndex);
    // ----------------------------

    if (pageData.length === 0) {
      rows = `<tr><td colspan="7" class="text-center py-4 text-muted">No items found matching your filters.</td></tr>`;
    } else {
      // Loop through pageData instead of the whole array
      pageData.forEach(function (item) {
        let isLowStock = parseInt(item.quantity) <= parseInt(item.reorder_level);
        let statusBadge = isLowStock
          ? '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-2"><i class="bi bi-exclamation-triangle-fill me-1"></i> Low Stock</span>'
          : '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2"><i class="bi bi-check-circle-fill me-1"></i> Healthy</span>';

        let forecastHtml = "";
        let daysOut = parseInt(item.days_to_stockout);
        
        if (daysOut === 999 || item.quantity == 0) {
          forecastHtml = `<span class="text-muted small"><i class="bi bi-dash"></i> No recent usage</span>`;
        } else if (daysOut <= 7) {
          forecastHtml = `<span class="text-danger fw-bold small"><i class="bi bi-graph-down-arrow"></i> Out in ~${daysOut} days</span>`;
        } else if (daysOut <= 21) {
          forecastHtml = `<span class="text-warning fw-bold small text-dark"><i class="bi bi-graph-down"></i> Out in ~${daysOut} days</span>`;
        } else {
          forecastHtml = `<span class="text-success fw-bold small"><i class="bi bi-shield-check"></i> Safe (>3 wks)</span>`;
        }

        if (item.daily_burn_rate > 0) {
            forecastHtml += `<br><span class="text-muted" style="font-size: 0.7rem;">Issues ${item.daily_burn_rate}/day</span>`;
        }

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
                  <button class="btn btn-sm btn-light text-danger delete-btn" data-id="${item.inventory_id}"><i class="bi bi-trash"></i></button>
              </td>
          </tr>`;
      });
    }
    $("#inventoryTableBody").html(rows);

    // --- NEW: Update the Text and Draw the Buttons ---
    if (totalItems > 0) {
      $("#inventoryPaginationInfo").text(`Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`);
    } else {
      $("#inventoryPaginationInfo").text("Showing 0 entries");
    }

    renderInventoryPagination(totalPages);
  }

  // Generate the actual HTML for the page buttons
  function renderInventoryPagination(totalPages) {
    let paginationHtml = "";
    
    // Previous Button
    paginationHtml += `<li class="page-item ${inventoryCurrentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changeInventoryPage(${inventoryCurrentPage - 1}); return false;">Previous</a>
    </li>`;

    // Numbered Page Buttons
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `<li class="page-item ${inventoryCurrentPage === i ? "active" : ""}">
        <a class="page-link" href="#" onclick="changeInventoryPage(${i}); return false;">${i}</a>
      </li>`;
    }

    // Next Button
    paginationHtml += `<li class="page-item ${inventoryCurrentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changeInventoryPage(${inventoryCurrentPage + 1}); return false;">Next</a>
    </li>`;

    $("#inventoryPaginationControls").html(paginationHtml);
  }

  // Handle clicking a page number
  window.changeInventoryPage = function(newPage) {
    inventoryCurrentPage = newPage;
    renderInventoryTable(); // Re-draw the table with the new slice of data!
  };

        // 4. Update loadSuppliers so it populates the new Filter dropdown too!
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
              $("#filterPoSupplier").html(filterOptions); // NEW: Populate PO filter
            }
          },
        });
      }

        // 5. Add Item Handling
        $("#addItemForm").submit(function (e) {
          e.preventDefault();
          let submitBtn = $(this).find('button[type="submit"]');
          let originalText = submitBtn.html();
          submitBtn
            .prop("disabled", true)
            .html(
              '<span class="spinner-border spinner-border-sm"></span> Saving...',
            );

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

                // 🔥 THIS RELOADS THE LIST INSTANTLY
                loadInventory();
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

        // Tab Switching Logic
       let valuationChartInstance = null;
  let spendChartInstance = null;

  window.switchTab = function (tab) {
    $(".nav-link").removeClass("active");
    $("#tab-" + tab).addClass("active");

    // Hide all containers
    $("#inventoryContainer, #poContainer, #analyticsContainer, #vendorsContainer").hide();

    if (tab === "inventory") {
      $("#inventoryContainer").fadeIn();
      loadInventory();
    } else if (tab === "po") {
      $("#poContainer").fadeIn();
      loadPOs();
      populatePODropdowns();
    } else if (tab === "analytics") {
      $("#analyticsContainer").fadeIn();
      loadAnalytics();
    } else if (tab === "vendors") {
      // NEW VENDOR TAB
      $("#vendorsContainer").fadeIn();
      loadVendors();
    }
  };
        

  // Update the Vendor Table rendering inside loadVendors() to handle the extra data
  function loadVendors() {
    $.ajax({
      url: "includes/api/api.php?action=get_suppliers",
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          let rows = "";
          res.data.forEach(function (vendor) {
            // Render the complex table row
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
                <button class="btn btn-sm btn-light text-danger me-2 delete-vendor-btn" data-id="${vendor.supplier_id}" title="Delete">
                    <i class="bi bi-trash"></i>
                </button>
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

  // Edit Modal Population Trigger
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

  // (The rest of your $("#addVendorForm").submit, $("#editVendorForm").submit, and $(".delete-vendor-btn").click functions from the previous message stay exactly the same!)

  // --- Add Vendor ---
  $("#addVendorForm").submit(function (e) {
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
          loadVendors();
          loadSuppliers(); // Refresh dropdowns in other tabs
        } else {
          showAlert(res.message, "danger");
        }
      }
    });
  });

  // --- Update Vendor ---
  $("#editVendorForm").submit(function (e) {
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
          loadVendors();
          loadSuppliers(); // Refresh dropdowns in other tabs
          loadInventory(); // Refresh table in case supplier names changed
        } else {
          showAlert(res.message, "danger");
        }
      }
    });
  });

  // --- Delete Vendor ---
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
            loadVendors();
            loadSuppliers(); // Refresh dropdowns in other tabs
          } else {
            showAlert(res.message, "danger"); // Will likely trigger if foreign key constraints exist
          }
        }
      });
    }
  });

  // View specific items inside a Purchase Order
  // View Procurement History for a Specific Vendor
  $(document).on("click", ".view-history-btn", function () {
    let supplierId = $(this).data("id");
    let supplierName = $(this).data("name");
    
    $("#historyVendorName").text(supplierName);
    $("#vendorHistoryTableBody").html('<tr><td colspan="5" class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm"></span> Loading history...</td></tr>');
    $("#vendorHistoryModal").modal("show");

    // We use a dedicated endpoint to get just this vendor's POs
    $.ajax({
      url: "includes/api/api.php?action=get_vendor_history&supplier_id=" + supplierId,
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          let rows = ""; // Make sure to declare the rows variable!
          
          if (res.data.length === 0) { // Changed vendorPOs to res.data
            rows = `<tr><td colspan="5" class="text-center py-4 text-muted">No procurement history found for this vendor.</td></tr>`;
          } else {
            res.data.forEach(function (po) { // Changed vendorPOs to res.data
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

    // View specific items inside a Purchase Order
  $(document).on("click", ".view-po-details-btn", function () {
    let poId = $(this).data("id");
    
    $("#detailsPoId").text("#PO-" + poId);
    $("#poDetailsTableBody").html('<tr><td colspan="4" class="text-center text-muted py-3"><span class="spinner-border spinner-border-sm"></span> Loading items...</td></tr>');
    
    // Hide the history modal and show the details modal
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
  

        // Load Purchase Orders
        // ----------------------------------------------------------------
  // PURCHASE ORDERS LOGIC
  // ----------------------------------------------------------------

  // ----------------------------------------------------------------
  // PURCHASE ORDERS LOGIC (WITH PAGINATION & FILTERS)
  // ----------------------------------------------------------------

  function loadPOs() {
    $.ajax({
      url: "includes/api/api.php?action=get_pos",
      type: "GET",
      cache: false,
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          allPOData = res.data; // Save raw data globally
          applyPOFilters(); // Trigger the filtering and rendering pipeline
        }
      }
    });
  }

  function applyPOFilters() {
    let dateFrom = $("#filterPoDateFrom").val();
    let dateTo = $("#filterPoDateTo").val();
    let supplierFilter = $("#filterPoSupplier").val();

    filteredPOData = allPOData.filter(function (po) {
      // Date Filter Logic
      let matchesDateFrom = dateFrom === "" || po.order_date >= dateFrom;
      let matchesDateTo = dateTo === "" || po.order_date <= dateTo;
      
      // Supplier Filter Logic
      let matchesSupplier = supplierFilter === "" || po.supplier_id.toString() === supplierFilter;

      return matchesDateFrom && matchesDateTo && matchesSupplier;
    });

    poCurrentPage = 1; // Reset to first page when filters change
    renderPOTable();
  }

  // Attach event listeners to trigger filters automatically when changed
  $("#filterPoDateFrom, #filterPoDateTo, #filterPoSupplier").on("change", applyPOFilters);

  function renderPOTable() {
    let rows = "";
    
    // Pagination Math
    let totalItems = filteredPOData.length;
    let totalPages = Math.ceil(totalItems / poItemsPerPage) || 1;
    let startIndex = (poCurrentPage - 1) * poItemsPerPage;
    let endIndex = Math.min(startIndex + poItemsPerPage, totalItems);
    
    // Slice the array to only get the items for the current page
    let pageData = filteredPOData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      rows = `<tr><td colspan="6" class="text-center py-4 text-muted">No purchase orders found matching your filters.</td></tr>`;
    } else {
      pageData.forEach(function (po) {
        let statusDisplay = "";

        if (po.status === "Pending") {
          statusDisplay = '<span class="badge bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2"><i class="bi bi-hourglass-split me-1"></i> Pending Finance</span>';
        } else if (po.status === "Approved") {
          statusDisplay = `
              <select class="form-select form-select-sm border border-success shadow-sm status-dropdown fw-bold text-success" 
                      data-id="${po.po_id}" data-current="${po.status}" style="width: 150px; cursor: pointer;">
                  <option value="Approved" selected>Approved (Action...)</option>
                  <option value="Received" class="text-success">↳ Receive Items</option>
                  <option value="Missing" class="text-danger">↳ Report Missing</option>
                  <option value="Issues" class="text-warning">↳ Report Issues</option>
              </select>`;
        } else if (po.status === "Received") {
          statusDisplay = '<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2"><i class="bi bi-check-circle-fill me-1"></i> Received</span>';
        } else {
          statusDisplay = `<span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2"><i class="bi bi-exclamation-circle-fill me-1"></i> ${po.status}</span>`;
        }

        // Added an "Edit" button if pending
        let editBtn = po.status === "Pending" ? 
          `<br><button class="btn btn-link btn-sm p-0 text-decoration-none small edit-po-qty-btn mt-1" data-id="${po.po_id}" data-qty="${po.item_qty}" data-price="${po.unit_price}">Edit Qty</button>` : "";

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
    
    // Update Info Text (e.g., "Showing 1 to 10 of 45 entries")
    if (totalItems > 0) {
      $("#poPaginationInfo").text(`Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`);
    } else {
      $("#poPaginationInfo").text("Showing 0 entries");
    }

    renderPOPagination(totalPages);
  }

  function renderPOPagination(totalPages) {
    let paginationHtml = "";
    
    // Previous Button
    paginationHtml += `<li class="page-item ${poCurrentPage === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePOPage(${poCurrentPage - 1}); return false;">Previous</a>
    </li>`;

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `<li class="page-item ${poCurrentPage === i ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePOPage(${i}); return false;">${i}</a>
      </li>`;
    }

    // Next Button
    paginationHtml += `<li class="page-item ${poCurrentPage === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" onclick="changePOPage(${poCurrentPage + 1}); return false;">Next</a>
    </li>`;

    $("#poPaginationControls").html(paginationHtml);
  }

  // Called when a pagination button is clicked
  window.changePOPage = function(newPage) {
    poCurrentPage = newPage;
    renderPOTable(); // Re-render just the slice, no need to re-filter
  };

  // --- Dynamic PO Quantity Editing (Only for Pending) ---
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

  // Calculate total dynamically when user types a new quantity
  $("#edit_po_qty").on("input", function() {
    let qty = parseInt($(this).val()) || 0;
    let price = parseFloat($("#edit_po_unit_price").val());
    $("#edit_po_total_display").text("₱" + (qty * price).toFixed(2));
  });

  // Submit the new quantity to the backend
  $("#editPoQtyForm").submit(function (e) {
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
          loadPOs();
        } else {
          showAlert(res.message, "danger");
        }
      }
    });
  });

        // Fill Suppliers in the Create PO Modal
        function populatePODropdowns() {
          // Copy the supplier options from the Add Item modal
          $("#poSupplierSelect").html($("#supplierSelect").html());

          // Reset the items dropdown
          $("#poItemSelect").html(
            '<option value="">Select a Supplier first...</option>',
          );
        }

        // Auto-fill Unit Price when an item is selected in Create PO
        $("#poItemSelect").change(function () {
          // Find the option the user just clicked
          let selectedOption = $(this).find("option:selected");

          // Grab the hidden data-price we attached to it
          let itemPrice = selectedOption.data("price");

          // Target the unit_price input field
          let priceInput = $('#createPOForm input[name="unit_price"]');

          if (itemPrice !== undefined) {
            priceInput.val(itemPrice); // Fill the price
          } else {
            priceInput.val(""); // Clear it if they select the blank "Select an item..." option
          }
        });

        // Listen for when a user selects a different Supplier
        $("#poSupplierSelect").change(function () {
          let supplier_id = $(this).val();
          let itemSelect = $("#poItemSelect");

          // If they selected the blank option, clear the items
          if (!supplier_id) {
            itemSelect.html(
              '<option value="">Select a Supplier first...</option>',
            );
            return;
          }

          // Show a loading state
          itemSelect.html('<option value="">Loading items...</option>');

          // Fetch items only for this specific supplier
          $.ajax({
            url: "includes/api/api.php?action=get_supplier_items&supplier_id=" + supplier_id,
            type: "GET",
            dataType: "json",
            success: function (res) {
              if (res.status === "success") {
                if (res.data.length === 0) {
                  itemSelect.html(
                    '<option value="">No items registered for this supplier</option>',
                  );
                } else {
                  let options = '<option value="">Select an Item...</option>';
                  res.data.forEach(function (item) {
                    // 🔥 Added data-price here
                    options += `<option value="${item.inventory_id}" data-price="${item.unit_price}">${item.name} (Current Stock: ${item.quantity})</option>`;
                  });
                  itemSelect.html(options);
                }
              }
            },
          });
        });

        // Handle Create PO Form Submission
        $("#createPOForm").submit(function (e) {
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
                loadPOs();
              } else {
                showAlert(res.message, "danger");
              }
            },
          });
        });

        // Listen for PO Status inline dropdown changes
        $(document).on("change", ".status-dropdown", function () {
          let selectElement = $(this);
          let po_id = selectElement.data("id");
          let currentStatus = selectElement.data("current");
          let newStatus = selectElement.val();

          if (newStatus === "Received") {
            if (
              confirm(
                "Are you sure you want to mark this as RECEIVED? This will officially add stock to your inventory and generate a Finance invoice. This cannot be undone.",
              )
            ) {

              selectElement.prop("disabled", true);
              $.ajax({
                url: "includes/api/api.php?action=receive_po",
                type: "POST",
                dataType: "json",
                data: { po_id: po_id },
                success: function (res) {
                  // 🔥 FIXED: Translate 'error' to Bootstrap's 'danger' class
                  showAlert(
                    res.message,
                    res.status === "success" ? "success" : "danger",
                  );
                  loadPOs();
                  if ($("#tab-analytics").hasClass("active")) loadAnalytics();
                },
              });
            } else {
              selectElement.val(currentStatus); // Revert dropdown if they click Cancel
            }
          } else if (newStatus === "Cancelled") {
            if (
              confirm("Are you sure you want to CANCEL this Purchase Order?")
            ) {
              $.ajax({
                url: "includes/api/api.php?action=cancel_po",
                type: "POST",
                dataType: "json",
                data: { po_id: po_id },
                success: function (res) {
                  // 🔥 FIXED: Translate 'error' to Bootstrap's 'danger' class
                  showAlert(
                    res.message,
                    res.status === "success" ? "success" : "danger",
                  );
                  loadPOs();
                },
              });
            } else {
              selectElement.val(currentStatus); // Revert dropdown if they click Cancel
            }
          } else {
            // Just switching between Draft and Ordered
            $.ajax({
              url: "includes/api/api.php?action=update_po_status",
              type: "POST",
              dataType: "json",
              data: { po_id: po_id, status: newStatus },
              success: function (res) {
                showAlert(
                  res.message,
                  res.status === "success" ? "success" : "danger",
                );
                if (res.status === "success") {
                  selectElement.data("current", newStatus);
                } else {
                  selectElement.val(currentStatus); // Revert on failure
                }
              },
            });
          }
        });

        // Open Issue Modal
        $(document).on("click", ".issue-btn", function () {
          let btn = $(this);
          $("#issue_inventory_id").val(btn.data("id"));
          $("#issue_item_name").text(btn.data("name"));
          $("#issue_qty").val(1); // Reset to 1
          $("#issueItemModal").modal("show");
        });

        // Submit Issue Form
        $("#issueItemForm").submit(function (e) {
          e.preventDefault();
          let submitBtn = $(this).find('button[type="submit"]');
          let originalText = submitBtn.html();
          submitBtn
            .prop("disabled", true)
            .html(
              '<span class="spinner-border spinner-border-sm"></span> Processing...',
            );

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
                loadInventory(); // Refresh the table instantly!
              } else {
                showAlert(res.message, "danger");
              }
            },
          });
        });

        // ----------------------------------------------------------------
  // ANALYTICS & EXPORT LOGIC
  // ----------------------------------------------------------------

  let currentAnalyticsData = null; // Store data globally for the exports

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

          // 1 & 2. Descriptive & Diagnostic Cards
          $("#statTotalValue").text("₱" + parseFloat(data.total_value).toLocaleString("en-US", { minimumFractionDigits: 2 }));
          $("#statTotalSpend").text("₱" + parseFloat(data.total_spend).toLocaleString("en-US", { minimumFractionDigits: 2 }));
          $("#statTotalItems").text(data.total_items);
          $("#statTurnover").text(data.turnover_ratio + "x");

          // 3. Predictive List
          let predHtml = "";
          if (data.predictions && data.predictions.length > 0) {
            data.predictions.forEach(item => {
              predHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3">
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

          // 4. Prescriptive Logic
          $("#prescriptiveLowCount").text(data.low_stock);
          if (data.low_stock > 0) {
            $("#prescriptiveAutoRestockBtn").prop("disabled", false).removeClass("btn-secondary").addClass("btn-success");
          } else {
            // Disable the button if everything is healthy
            $("#prescriptiveAutoRestockBtn").prop("disabled", true).removeClass("btn-success").addClass("btn-secondary").html('<i class="bi bi-check-all me-2"></i> Stock Optimal');
          }

          // --- Render Charts (Diagnostic) ---
          let valLabels = []; let valData = [];
          data.valuation_data.forEach(function (row) {
            valLabels.push(row.supplier_name);
            valData.push(row.supplier_value);
          });

          let spendLabels = []; let spendData = [];
          data.spend_by_category.forEach(function (row) {
            spendLabels.push(row.category_name);
            spendData.push(row.category_spend);
          });

          if (window.valuationChartInstance) window.valuationChartInstance.destroy();
          if (window.spendChartInstance) window.spendChartInstance.destroy();

          let ctxVal = document.getElementById("valuationChart").getContext("2d");
          window.valuationChartInstance = new Chart(ctxVal, {
            type: "bar",
            data: {
              labels: valLabels,
              datasets: [{ 
                label: "Valuation (₱)", 
                data: valData, 
                backgroundColor: "rgba(13, 110, 253, 0.8)", 
                borderRadius: 4 
              }]
            },
            plugins: [ChartDataLabels],
            options: { 
              responsive: true, maintainAspectRatio: false, 
              plugins: { 
                legend: { display: false },
                datalabels: {
                  color: '#ffffff', anchor: 'end', align: 'bottom', font: { weight: 'bold' },
                  formatter: function(value) { return '₱' + parseFloat(value).toLocaleString("en-US"); }
                }
              } 
            }
          });

          let ctxSpend = document.getElementById("spendChart").getContext("2d");
          window.spendChartInstance = new Chart(ctxSpend, {
            type: "doughnut",
            data: {
              labels: spendLabels,
              datasets: [{ 
                data: spendData, 
                backgroundColor: ["#198754", "#ffc107", "#0dcaf0", "#d63384", "#6f42c1"], 
                borderWidth: 2, borderColor: '#ffffff'
              }]
            },
            plugins: [ChartDataLabels],
            options: { 
              responsive: true, maintainAspectRatio: false, cutout: "60%", 
              plugins: { 
                legend: { 
                  position: "right",
                  labels: {
                    padding: 15,
                    generateLabels: function(chart) {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map(function(label, i) {
                          const meta = chart.getDatasetMeta(0);
                          const style = meta.controller.getStyle(i);
                          const value = data.datasets[0].data[i];
                          const formattedVal = '₱' + parseFloat(value).toLocaleString("en-US");
                          return {
                            text: `${label} (${formattedVal})`,
                            fillStyle: style.backgroundColor, strokeStyle: style.borderColor,
                            lineWidth: style.borderWidth, hidden: !chart.getDataVisibility(i), index: i
                          };
                        });
                      }
                      return [];
                    }
                  }
                },
                datalabels: {
                  color: '#ffffff', font: { weight: 'bold', size: 11 },
                  formatter: function(value) { return value == 0 ? '' : '₱' + parseFloat(value).toLocaleString("en-US"); }
                }
              } 
            }
          });

          if (btn) showAlert("Dashboard data refreshed successfully!", "success");
        }
      },
      error: function () {
        if (btn) $(btn).prop("disabled", false).html(originalText);
        showAlert("Network error while trying to refresh data.", "danger");
      }
    });
  };

  // Wire up the new Prescriptive Dashboard Button to the existing auto-restock endpoint
  $(document).on("click", "#prescriptiveAutoRestockBtn", function() {
    let btn = $(this);
    let originalText = btn.html();
    btn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Generating POs...');

    $.ajax({
      url: "api.php?action=auto_restock",
      type: "POST",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          showAlert(res.message, "success");
          loadAnalytics(); // Refresh the dashboard instantly to show 0 low stock
        } else {
          btn.prop("disabled", false).html(originalText);
          showAlert(res.message, "danger");
        }
      }
    });
  });

  // --- EXPORT TO EXCEL ---
  window.exportExcel = function() {
    if (!currentAnalyticsData) {
      showAlert("Please wait for analytics data to load.", "warning");
      return;
    }

    // Initialize a new Excel Workbook
    const wb = XLSX.utils.book_new();

    // 1. Sheet: KPI Summary
    const kpiData = [
      ["Metric", "Value"],
      ["Total Stock Valuation", parseFloat(currentAnalyticsData.total_value)],
      ["Total PO Spend", parseFloat(currentAnalyticsData.total_spend)],
      ["Inventory Turnover Ratio", parseFloat(currentAnalyticsData.turnover_ratio)],
      ["Total Unique Items", parseInt(currentAnalyticsData.total_items)],
      ["Shortages (Low Stock)", parseInt(currentAnalyticsData.low_stock)],
      ["Overstock Alerts", parseInt(currentAnalyticsData.overstock)]
    ];
    const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, wsKpi, "KPI Summary");

    // 2. Sheet: Valuation by Supplier
    const valData = [["Supplier Name", "Stock Valuation (₱)"]];
    currentAnalyticsData.valuation_data.forEach(row => {
      valData.push([row.supplier_name, parseFloat(row.supplier_value)]);
    });
    const wsVal = XLSX.utils.aoa_to_sheet(valData);
    XLSX.utils.book_append_sheet(wb, wsVal, "Valuation by Supplier");

    // 3. Sheet: Spend by Category/Supplier
    const spendData = [["Category/Supplier", "Total Spend (₱)"]];
    currentAnalyticsData.spend_by_category.forEach(row => {
      spendData.push([row.category_name, parseFloat(row.category_spend)]);
    });
    const wsSpend = XLSX.utils.aoa_to_sheet(spendData);
    XLSX.utils.book_append_sheet(wb, wsSpend, "Spend by Category");

    // Generate and download file
    XLSX.writeFile(wb, `Inventory_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- EXPORT TO PDF ---
 // --- EXPORT TO PDF (ROBUST JSPDF + HTML2CANVAS METHOD) ---
  window.exportPDF = function() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('analyticsContainer');
    const buttons = document.getElementById('analyticsButtons');
    
    // 1. Hide buttons during capture
    buttons.style.display = 'none';

    // 2. Save original styles to restore later
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    const originalBg = element.style.backgroundColor;
    const originalPadding = element.style.padding;

    // 3. Force a strict "Desktop" layout so charts don't stack
    // 1200px is wide enough to trigger Bootstrap's desktop grid
    const targetWidth = 1200;
    element.style.width = targetWidth + 'px';
    element.style.maxWidth = targetWidth + 'px';
    element.style.backgroundColor = '#f3f4f6'; // Match background
    element.style.padding = '20px'; // Add breathing room

    // 4. Use html2canvas to take a high-quality snapshot
    html2canvas(element, {
      scale: 2, // 2x scale for sharp text/charts
      useCORS: true,
      logging: false,
      width: targetWidth,
      windowWidth: targetWidth // Tricks the browser into thinking the window is wide
    }).then((canvas) => {
      
      // 5. Restore the UI instantly after the snapshot is taken
      buttons.style.display = 'flex';
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.backgroundColor = originalBg;
      element.style.padding = originalPadding;

      // 6. Convert the canvas to an image
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // 7. Create the PDF (Landscape, Letter size: 11 x 8.5 inches)
      const pdf = new jsPDF('landscape', 'in', 'letter');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // 8. Calculate aspect ratio to fit the image perfectly on the page
      const imgProps = pdf.getImageProperties(imgData);
      const margin = 0.3; // 0.3 inch margin
      
      // Calculate max available space
      const maxImgWidth = pdfWidth - (margin * 2);
      const maxImgHeight = pdfHeight - (margin * 2);

      // Calculate scaled dimensions keeping aspect ratio
      const ratio = Math.min(maxImgWidth / imgProps.width, maxImgHeight / imgProps.height);
      const finalWidth = imgProps.width * ratio;
      const finalHeight = imgProps.height * ratio;

      // Center the image horizontally and vertically
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = margin; // Pin to top margin

      // 9. Add image and save
      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`Inventory_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    }).catch(err => {
      // Failsafe: Restore UI if something breaks
      buttons.style.display = 'flex';
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.backgroundColor = originalBg;
      element.style.padding = originalPadding;
      showAlert("Failed to generate PDF.", "danger");
      console.error("PDF Error:", err);
    });
  };

        // Open Edit Modal (Triggered by the new .edit-btn class)
        $(document).on("click", ".edit-btn", function () {
          // Copy suppliers dropdown
          $("#edit_supplier_id").html($("#supplierSelect").html());

          // Extract data from the button we just clicked
          let btn = $(this);
          $("#edit_inventory_id").val(btn.data("id"));
          $("#edit_name").val(btn.data("name"));
          $("#edit_description").val(btn.data("desc"));
          $("#edit_quantity").val(btn.data("qty"));
          $("#edit_unit_price").val(btn.data("price"));
          $("#edit_reorder_level").val(btn.data("reorder"));
          $("#edit_supplier_id").val(btn.data("supplier"));

          // Show the modal
          $("#editItemModal").modal("show");
        });

        // Submit the Edit Form
        $("#editItemForm").submit(function (e) {
          e.preventDefault();
          let submitBtn = $(this).find('button[type="submit"]');
          let originalText = submitBtn.html();
          submitBtn
            .prop("disabled", true)
            .html(
              '<span class="spinner-border spinner-border-sm"></span> Updating...',
            );

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

                // Force the reload
                loadInventory();
              } else {
                showAlert(res.message, "danger");
              }
            },
          });
        });

        // Delete Item (Triggered by the new .delete-btn class)
        $(document).on("click", ".delete-btn", function () {
          let itemId = $(this).data("id"); // Get the ID from the button's data attribute

          if (
            confirm(
              "Are you sure you want to delete this item? This cannot be undone.",
            )
          ) {
            $.ajax({
              url: "includes/api/api.php?action=delete_item",
              type: "POST",
              data: { inventory_id: itemId },
              dataType: "json",
              success: function (res) {
                if (res.status === "success") {
                  showAlert(res.message, "success");

                  // Force the reload
                  loadInventory();
                } else {
                  // This will catch the Foreign Key constraint if it's tied to a PO!
                  showAlert(res.message, "danger");
                }
              },
            });
          }
        });

        // Helper function for alerts
        function showAlert(msg, type) {
          $("#alertBox")
            .html(`<div class="alert alert-${type} alert-dismissible fade show border-0 shadow-sm">
                ${msg}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`);
        }
      });
      