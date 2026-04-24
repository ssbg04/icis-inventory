// ==========================================
// ISSUED ITEMS LOGIC (issued.js)
// ==========================================
$(document).ready(function () {

  let allIssuedData = [];
  let filteredIssuedData = [];
  let issuedCurrentPage = 1;
  const issuedItemsPerPage = 10; // Show 10 rows per page

  window.loadIssuedItems = function (btn = null) {
    let originalText = "";
    if (btn) {
      originalText = $(btn).html();
      $(btn).prop("disabled", true).html('<span class="spinner-border spinner-border-sm"></span> Refreshing...');
    }

    $.ajax({
      url: "includes/api/api.php?action=get_issued_items",
      type: "GET",
      cache: false,
      dataType: "json",
      success: function (res) {
        if (btn) $(btn).prop("disabled", false).html(originalText);
        if (res.status === "success") {
          allIssuedData = res.data;
          applyIssuedFilters();
        } else {
          showAlert("Error loading issued items.", "danger");
        }
      },
      error: function() {
        if (btn) $(btn).prop("disabled", false).html(originalText);
        showAlert("Network error.", "danger");
      }
    });
  };

  function applyIssuedFilters() {
    if ($("#searchIssuedInput").length === 0) return; // Failsafe

    let search = $("#searchIssuedInput").val().toLowerCase();
    let dateFrom = $("#filterIssuedDateFrom").val();
    let dateTo = $("#filterIssuedDateTo").val();

    filteredIssuedData = allIssuedData.filter(function (txn) {
      let matchesSearch = txn.name.toLowerCase().includes(search) || 
                          txn.transaction_id.toString().includes(search) ||
                          (txn.description && txn.description.toLowerCase().includes(search));
      
      // Convert dates to YYYY-MM-DD for accurate comparison
      let txnDate = txn.transaction_date.split(' ')[0]; 
      
      let matchesDateFrom = dateFrom === "" || txnDate >= dateFrom;
      let matchesDateTo = dateTo === "" || txnDate <= dateTo;

      return matchesSearch && matchesDateFrom && matchesDateTo;
    });

    issuedCurrentPage = 1;
    renderIssuedTable();
  }

  $(document).on("keyup", "#searchIssuedInput", applyIssuedFilters);
  $(document).on("change", "#filterIssuedDateFrom, #filterIssuedDateTo", applyIssuedFilters);

  function renderIssuedTable() {
    let rows = "";
    let totalItems = filteredIssuedData.length;
    let totalPages = Math.ceil(totalItems / issuedItemsPerPage) || 1;
    let startIndex = (issuedCurrentPage - 1) * issuedItemsPerPage;
    let endIndex = Math.min(startIndex + issuedItemsPerPage, totalItems);
    let pageData = filteredIssuedData.slice(startIndex, endIndex);

    if (pageData.length === 0) {
      rows = `<tr><td colspan="4" class="text-center py-4 text-muted">No transactions found matching your criteria.</td></tr>`;
    } else {
      pageData.forEach(function (txn) {
        // Format date to look nice (e.g., "April 24, 2026 - 3:21 PM")
        let dateObj = new Date(txn.transaction_date);
        let formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
                            " <span class='text-muted small ms-1'>" + dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute:'2-digit' }) + "</span>";

        rows += `<tr>
            <td class="ps-4 fw-bold text-secondary">#TXN-${txn.transaction_id}</td>
            <td>${formattedDate}</td>
            <td>
                <div class="fw-bold text-dark">${txn.name}</div>
                <div class="text-muted small">Item ID: #${txn.inventory_id}</div>
            </td>
            <td class="pe-4 text-end">
                <span class="badge bg-warning bg-opacity-10 text-dark border border-warning rounded-pill px-3 py-2 fs-6">
                  <i class="bi bi-dash me-1"></i>${txn.qty_issued}
                </span>
            </td>
        </tr>`;
      });
    }

    $("#issuedTableBody").html(rows);
    if (totalItems > 0) $("#issuedPaginationInfo").text(`Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`);
    else $("#issuedPaginationInfo").text("Showing 0 entries");
    
    renderIssuedPagination(totalPages);
  }

  function renderIssuedPagination(totalPages) {
    let html = `<li class="page-item ${issuedCurrentPage === 1 ? "disabled" : ""}"><a class="page-link" href="#" onclick="changeIssuedPage(${issuedCurrentPage - 1}); return false;">Previous</a></li>`;
    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${issuedCurrentPage === i ? "active" : ""}"><a class="page-link" href="#" onclick="changeIssuedPage(${i}); return false;">${i}</a></li>`;
    }
    html += `<li class="page-item ${issuedCurrentPage === totalPages ? "disabled" : ""}"><a class="page-link" href="#" onclick="changeIssuedPage(${issuedCurrentPage + 1}); return false;">Next</a></li>`;
    $("#issuedPaginationControls").html(html);
  }

  window.changeIssuedPage = function(newPage) {
    issuedCurrentPage = newPage;
    renderIssuedTable();
  };
});