// ==========================================
// ANALYTICS & EXPORTS LOGIC (analytics.js)
// ==========================================
$(document).ready(function () {

  // --- 1. Load Analytics Dashboard ---
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
          currentAnalyticsData = data; // Save globally for exports

          // KPI Cards
          $("#statTotalValue").text("₱" + parseFloat(data.total_value).toLocaleString("en-US", { minimumFractionDigits: 2 }));
          $("#statTotalSpend").text("₱" + parseFloat(data.total_spend).toLocaleString("en-US", { minimumFractionDigits: 2 }));
          $("#statTotalItems").text(data.total_items);
          $("#statTurnover").text(data.turnover_ratio + "x");

          // Predictive List
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

          // Prescriptive Action Card
          $("#prescriptiveLowCount").text(data.low_stock);
          if (data.low_stock > 0) {
            $("#prescriptiveAutoRestockBtn").prop("disabled", false).removeClass("btn-secondary").addClass("btn-success").html('<i class="bi bi-lightning-charge-fill me-2"></i> Auto-Generate POs');
          } else {
            $("#prescriptiveAutoRestockBtn").prop("disabled", true).removeClass("btn-success").addClass("btn-secondary").html('<i class="bi bi-check-all me-2"></i> Stock Optimal');
          }

          // Charts
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

  // --- 2. Prescriptive Auto-Restock ---
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

  // --- 3. EXPORT TO EXCEL ---
  window.exportExcel = function() {
    if (!currentAnalyticsData) { showAlert("Please wait for analytics data to load.", "warning"); return; }
    const wb = XLSX.utils.book_new();
    const kpiData = [ ["Metric", "Value"], ["Total Stock Valuation", parseFloat(currentAnalyticsData.total_value)], ["Total PO Spend", parseFloat(currentAnalyticsData.total_spend)], ["Inventory Turnover Ratio", parseFloat(currentAnalyticsData.turnover_ratio)], ["Total Unique Items", parseInt(currentAnalyticsData.total_items)], ["Shortages (Low Stock)", parseInt(currentAnalyticsData.low_stock)] ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiData), "KPI Summary");
    const valData = [["Supplier Name", "Stock Valuation (₱)"]]; currentAnalyticsData.valuation_data.forEach(row => { valData.push([row.supplier_name, parseFloat(row.supplier_value)]); }); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(valData), "Valuation by Supplier");
    const spendData = [["Category/Supplier", "Total Spend (₱)"]]; currentAnalyticsData.spend_by_category.forEach(row => { spendData.push([row.category_name, parseFloat(row.category_spend)]); }); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(spendData), "Spend by Category");
    XLSX.writeFile(wb, `Inventory_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- 4. EXPORT TO PDF ---
  window.exportPDF = function() {
    const { jsPDF } = window.jspdf; 
    const element = document.getElementById('analyticsContainer'); 
    const buttons = document.getElementById('analyticsButtons');
    
    buttons.style.display = 'none'; 
    const originalWidth = element.style.width; const originalMaxWidth = element.style.maxWidth; const originalBg = element.style.backgroundColor; const originalPadding = element.style.padding;
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