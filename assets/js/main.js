// ==========================================
// 1. GLOBAL VARIABLES & STATE
// ==========================================
let currentUserRole = '';

// Inventory State
let allInventoryData = [];
let filteredInventoryData = [];
let inventoryCurrentPage = 1; 
const inventoryItemsPerPage = 5; 
let hasCheckedLowStock = false; 

// PO State
let allPOData = [];
let filteredPOData = [];
let poCurrentPage = 1;
const poItemsPerPage = 5;

// Analytics State
let currentAnalyticsData = null;
let valuationChartInstance = null;
let spendChartInstance = null;

// ==========================================
// 2. GLOBAL HELPER FUNCTIONS
// ==========================================
function showAlert(msg, type) {
  // Create a unique ID for this alert so the timer doesn't accidentally hide a newer alert
  let alertId = 'alert-' + Date.now();

  $("#alertBox").html(`
    <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show border-0 shadow-sm" style="z-index: 1050;">
      ${msg}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `);

  // Auto-hide the alert after 4 seconds (4000 milliseconds)
  setTimeout(function() {
    $("#" + alertId).fadeOut(400, function() {
      $(this).remove(); // Completely removes it from the screen
    });
  }, 4000);
}

// ==========================================
// 3. SPA LAZY LOADING ROUTER
// ==========================================
function initPageScripts(page) {
  // These functions will live in their respective module files!
  if (page === "inventory") {
    if (typeof loadInventory === "function") loadInventory();
    if (typeof loadSuppliers === "function") loadSuppliers();
  } else if (page === "po") {
    if (typeof loadPOs === "function") loadPOs();
    if (typeof loadSuppliers === "function") loadSuppliers(); 
  } else if (page === "analytics") {
    if (typeof loadAnalytics === "function") loadAnalytics();
  } else if (page === "vendors") {
    if (typeof loadVendors === "function") loadVendors();
  } else if (page === "issued") {
    if (typeof loadIssuedItems === "function") loadIssuedItems();
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