// ==========================================
// AUTHENTICATION LOGIC (auth.js)
// ==========================================
$(document).ready(function () {

  // 1. Check auth immediately when the page loads
  checkAuth();

  function checkAuth() {
    $.ajax({
      url: "includes/api/api.php?action=check_auth",
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          // Grab global variable from main.js
          currentUserRole = res.role;

          $("#currentUser").text(res.full_name);
          $("#loginSection").removeClass("d-flex").hide(); 
          $("#topNavbar, #dashboardSection").fadeIn();
          
          // SPA Initial Load: If no tab is active, load inventory
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

  // 2. Handle Login Form & Brute Force Cooldown Timer
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

  // 3. Handle Logout Button
  $(document).on("click", "#logoutBtn", function () {
    let btn = $(this);
    btn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span>');

    $.ajax({
      url: "includes/api/api.php?action=logout",
      type: "GET",
      dataType: "json",
      success: function () {
        btn.prop('disabled', false).html('<i class="bi bi-box-arrow-right me-1"></i> Logout');
        
        // Wipe global data from main.js so the next person can't inspect element to see it
        allInventoryData = [];
        allPOData = [];
        hasCheckedLowStock = false; 
        window.currentTab = null;
        
        checkAuth(); // Hides dashboard and shows login screen
      }
    });
  });

});