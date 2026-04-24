// ==========================================
// INVENTORY LOGIC (inventory.js)
// ==========================================
$(document).ready(function () {

  // --- 1. Load Data ---
  window.loadInventory = function() {
    $.ajax({
      url: "includes/api/api.php?action=get_inventory",
      type: "GET",
      cache: false,
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          allInventoryData = res.data; 
          applyFilters(); 

          // Low stock alert check
          if (!hasCheckedLowStock) {
            checkAndShowLowStockAlert(res.data);
            hasCheckedLowStock = true;
          }
        }
      },
    });
  };

  // --- 2. Filtering ---
  function applyFilters() {
    if ($("#searchInput").length === 0) return; // Failsafe if DOM isn't ready

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

  $(document).on("keyup", "#searchInput", applyFilters);
  $(document).on("change", "#filterSupplier, #filterStock", applyFilters);

  // --- 3. Rendering ---
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

  // --- 4. CRUD Operations ---
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
      }
    });
  });

  $(document).on("click", ".edit-btn", function () {
    $("#edit_supplier_id").html($("#supplierSelect").html()); // Copy current suppliers
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

  // --- 5. Low Stock Alerts ---
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
      }
    });
  });

});