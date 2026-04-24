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

    <?php 
    
    // header 
    include_once 'includes/header.php'; 
    
    // login
    include 'partials/login.php';
    

    ?>

    <div class="container" id="dashboardSection">
      
      <div id="alertBox"></div>

      <?php include 'partials/navbar.php'; ?>

      <!-- <?php include 'pages/inventory.php'; ?>
      
      <?php include 'pages/vendors.php'; ?>
      
      <?php include 'pages/po.php'; ?>
      
      <?php include 'pages/analytics.php'; ?> -->

      <div id="pageContainer"></div>
      
    </div>


    <?php include 'modals/item_modal.php'; ?>
    
    <?php include 'modals/vendor_modal.php'; ?>

    <?php include 'modals/po_modal.php'; ?>

    <?php include 'modals/alerts_modal.php'; ?>

    <?php include 'includes/footer.php'; ?>
  </body>
</html>