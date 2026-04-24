// ==========================================
// VENDORS & SUPPLIERS LOGIC (vendors.js)
// ==========================================
$(document).ready(function () {

  // --- 1. Global Supplier Fetch (Fills dropdowns on all pages) ---
  window.loadSuppliers = function() {
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
          
          // Auto-fill Create PO modal if it exists
          if ($("#poSupplierSelect").length) {
            $("#poSupplierSelect").html(options);
            $("#poItemSelect").html('<option value="">Select a Supplier first...</option>');
          }
        }
      },
    });
  };

  // --- 2. Load Vendor Table ---
  window.loadVendors = function() {
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
  };

  // --- 3. CRUD Operations ---
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
          loadSuppliers(); // Refresh global dropdowns
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

  // --- 4. Vendor History Modal ---
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

});