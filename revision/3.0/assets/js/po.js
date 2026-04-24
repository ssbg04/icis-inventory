// ==========================================
// PURCHASE ORDERS LOGIC (po.js)
// ==========================================
$(document).ready(function () {

  // --- 1. Load Data & Filters ---
  window.loadPOs = function() {
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
  };

  function applyPOFilters() {
    if ($("#filterPoDateFrom").length === 0) return; // Failsafe

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

  $(document).on("change", "#filterPoDateFrom, #filterPoDateTo, #filterPoSupplier", applyPOFilters);

  // --- 2. Render Table ---
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
          // PENDING: Only Admins can approve or cancel
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
          // APPROVED: ANY user (Admin or Employee) can Receive or report an Issue
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
          statusDisplay = '<span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2"><i class="bi bi-exclamation-triangle-fill me-1"></i> Missing</span>';
        }
        else if (po.status === "Issues") {
          statusDisplay = '<span class="badge bg-warning bg-opacity-10 text-dark border border-warning rounded-pill px-3 py-2"><i class="bi bi-exclamation-circle-fill me-1"></i> Issues Reported</span>';
        }
        else if (po.status === "Received") {
          statusDisplay = '<span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2"><i class="bi bi-check-circle-fill me-1"></i> Received</span>';
        } 
        else {
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

  // --- 3. Edit Quantities ---
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

  // --- 4. Create PO Logic ---
  window.populatePODropdowns = function() {
    $("#poSupplierSelect").html($("#supplierSelect").html());
    $("#poItemSelect").html('<option value="">Select a Supplier first...</option>');
  };

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
    let submitBtn = $(this).find('button[type="submit"]');
    let originalText = submitBtn.html();
    submitBtn.prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Submitting...');

    $.ajax({
      url: "includes/api/api.php?action=create_po",
      type: "POST",
      data: $(this).serialize(),
      dataType: "json",
      success: function (res) {
        submitBtn.prop("disabled", false).html(originalText);
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

  // --- 5. Status Actions (Approval / Receive) ---
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

  // --- 6. PO Details Modal ---
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

});