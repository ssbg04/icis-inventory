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
function showAlert(msg, type = 'info') {
  const toastId = 'toast-' + Date.now();
  const iconMap = {
    'success': 'bi-check-circle-fill',
    'danger': 'bi-exclamation-octagon-fill',
    'warning': 'bi-exclamation-triangle-fill',
    'info': 'bi-info-circle-fill'
  };
  const icon = iconMap[type] || 'bi-bell-fill';
  const title = type.charAt(0).toUpperCase() + type.slice(1);

  const toastHtml = `
    <div id="${toastId}" class="toast toast-custom toast-${type} fade hide" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
      <div class="toast-header toast-header-custom">
        <i class="bi ${icon} text-${type} me-2"></i>
        <strong class="me-auto text-${type}">${title}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body toast-body-custom">
        ${msg}
      </div>
    </div>
  `;

  $("#toastContainer").append(toastHtml);
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { autohide: false });
  toast.show();

  toastElement.addEventListener('hidden.bs.toast', function () {
    $(this).remove();
  });
}

// Global function for complex notifications (with buttons/links)
function showNotification(options) {
  const toastId = 'notif-' + Date.now();
  const type = options.type || 'info';
  const icon = options.icon || 'bi-bell-fill';
  
  const toastHtml = `
    <div id="${toastId}" class="toast toast-custom toast-${type} fade hide" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false" style="min-width: 300px;">
      <div class="toast-header toast-header-custom">
        <i class="bi ${icon} text-${type} me-2"></i>
        <strong class="me-auto text-${type}">${options.title || 'Notification'}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body toast-body-custom">
        <div class="mb-2">${options.message}</div>
        ${options.action ? `<button class="btn btn-sm btn-${type} rounded-pill px-3 mt-2" onclick="${options.action.callback}">${options.action.label}</button>` : ''}
      </div>
    </div>
  `;

  $("#toastContainer").append(toastHtml);
  
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { autohide: false });
  toast.show();

  toastElement.addEventListener('hidden.bs.toast', function () {
    $(this).remove();
  });
}

// Dedicated function for opening low stock modal
window.viewLowStock = function() {
  $("#lowStockModal").modal("show");
};


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