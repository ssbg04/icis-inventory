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
          $("#statIssuedItems").text(data.issued_30_days || "0");

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

          // Charts Data Preparation
          let valLabels = []; 
          let valData = [];
          data.valuation_data.forEach(row => { 
            let formattedValue = '₱' + parseFloat(row.supplier_value).toLocaleString("en-US", { minimumFractionDigits: 2 });
            // 🔥 Multi-line X-Axis: Puts the Name on top, Number underneath
            valLabels.push([row.supplier_name, formattedValue]); 
            valData.push(row.supplier_value); 
          });

          let spendLabels = []; 
          let spendData = [];
          data.spend_by_category.forEach(row => { 
            spendLabels.push(row.category_name); 
            spendData.push(row.category_spend); 
          });

          if (window.valuationChartInstance) window.valuationChartInstance.destroy();
          if (window.spendChartInstance) window.spendChartInstance.destroy();

          let ctxVal = document.getElementById("valuationChart");
          if(ctxVal) {
            window.valuationChartInstance = new Chart(ctxVal.getContext("2d"), {
              type: "bar",
              data: { 
                  labels: valLabels, 
                  datasets: [{ 
                      label: "Valuation", 
                      data: valData, 
                      backgroundColor: "rgba(13, 110, 253, 0.8)", 
                      borderRadius: 4 
                  }] 
              },
              // 🔥 Removed ChartDataLabels plugin to clear floating numbers
              options: { 
                  layout: { padding: { top: 20, right: 20, bottom: 10, left: 10 } }, 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { 
                      legend: { display: false }
                  },
                  scales: {
                      x: {
                          ticks: {
                              // Center aligns the multi-line text beautifully
                              align: 'center',
                              color: '#495057',
                              font: { weight: '500', size: 11 }
                          }
                      }
                  }
              }
            });
          }

          let ctxSpend = document.getElementById("spendChart");
          if (ctxSpend) {
            // Define colors array so we can share it between the chart and the HTML legend
            let doughnutColors = ["#198754", "#ffc107", "#0dcaf0", "#d63384", "#6f42c1", "#fd7e14", "#20c997", "#6610f2"];

            window.spendChartInstance = new Chart(ctxSpend.getContext("2d"), {
              type: "doughnut",
              data: { 
                  labels: spendLabels, 
                  datasets: [{ 
                      data: spendData, 
                      backgroundColor: doughnutColors, 
                      borderWidth: 2, 
                      borderColor: '#ffffff' 
                  }] 
              },
              options: { 
                  layout: { padding: 10 }, 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  cutout: "65%", 
                  plugins: { 
                      // 🔥 Turn off the squished built-in canvas legend completely!
                      legend: { display: false } 
                  } 
              }
            });

            // 🔥 Generate a beautiful, perfectly formatted HTML Legend
            let legendHtml = '<div class="row mt-4 text-center justify-content-center">';
            
            spendLabels.forEach((label, i) => {
                let value = '₱' + parseFloat(spendData[i]).toLocaleString("en-US", { minimumFractionDigits: 2 });
                let color = doughnutColors[i % doughnutColors.length];
                
                legendHtml += `
                    <div class="col-6 mb-3">
                        <div class="d-flex align-items-center justify-content-center mb-1">
                            <span class="shadow-sm" style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%; margin-right: 8px;"></span>
                            <span class="text-muted small fw-bold text-truncate" title="${label}">${label}</span>
                        </div>
                        <div class="fw-bold text-dark">${value}</div>
                    </div>`;
            });
            legendHtml += '</div>';

            // Remove any old custom legend, then inject the new one right below the canvas container
            $("#customSpendLegend").remove();
            $(ctxSpend).parent().after(`<div id="customSpendLegend">${legendHtml}</div>`);
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
    if (!currentAnalyticsData) { 
      showAlert("Please wait for analytics data to load.", "warning"); 
      return; 
    }

    // Helper function to cleanly format currency for the spreadsheet
    const formatCurrency = (val) => '₱' + parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 });

    const wb = XLSX.utils.book_new();

    // SHEET 1: KPI Summary
    const kpiData = [
      ["System Analytics", "Value"],
      ["Current Stock Value", formatCurrency(currentAnalyticsData.total_value)],
      ["Total Purchases (Spend)", formatCurrency(currentAnalyticsData.total_spend)],
      ["Inventory Turnover Ratio", parseFloat(currentAnalyticsData.turnover_ratio) + "x"],
      ["Total Unique Items", parseInt(currentAnalyticsData.total_items)],
      ["Items Issued/Borrowed (30 Days)", parseInt(currentAnalyticsData.issued_30_days || 0)],
      ["Critical Shortages (Action Items)", parseInt(currentAnalyticsData.low_stock)],
      ["Overstock Alerts", parseInt(currentAnalyticsData.overstock)]
    ];
    const wsKpi = XLSX.utils.aoa_to_sheet(kpiData);
    // Expand column widths to make it readable
    wsKpi['!cols'] = [{ wch: 35 }, { wch: 20 }]; 
    XLSX.utils.book_append_sheet(wb, wsKpi, "KPI Summary");

    // SHEET 2: Valuation by Supplier
    const valData = [["Supplier Name", "Stock Valuation"]]; 
    if (currentAnalyticsData.valuation_data) {
      currentAnalyticsData.valuation_data.forEach(row => { 
        valData.push([row.supplier_name, formatCurrency(row.supplier_value)]); 
      }); 
    }
    const wsVal = XLSX.utils.aoa_to_sheet(valData);
    wsVal['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsVal, "Valuation by Supplier");

    // SHEET 3: Spend by Category
    const spendData = [["Category / Supplier", "Total Spend"]]; 
    if (currentAnalyticsData.spend_by_category) {
      currentAnalyticsData.spend_by_category.forEach(row => { 
        spendData.push([row.category_name, formatCurrency(row.category_spend)]); 
      }); 
    }
    const wsSpend = XLSX.utils.aoa_to_sheet(spendData);
    wsSpend['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSpend, "Spend by Category");

    // SHEET 4: Stock Depletion Forecast
    const forecastData = [["Item Name", "Current Stock", "Daily Burn Rate", "Estimated Days Left"]];
    if (currentAnalyticsData.predictions && currentAnalyticsData.predictions.length > 0) {
      currentAnalyticsData.predictions.forEach(item => {
        forecastData.push([
          item.name,
          item.quantity + " units",
          parseFloat(item.daily_burn).toFixed(2) + " / day",
          item.days_left + " days"
        ]);
      });
    } else {
      forecastData.push(["No imminent stockouts predicted!", "-", "-", "-"]);
    }
    const wsForecast = XLSX.utils.aoa_to_sheet(forecastData);
    wsForecast['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 18 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsForecast, "Depletion Forecast");

    // Generate and download the file
    let dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `ICIS_Analytics_Report_${dateStr}.xlsx`);
  };

  // --- 4. EXPORT TO PDF ---
  window.exportPDF = function() {
    const { jsPDF } = window.jspdf; 
    const element = document.getElementById('analyticsContainer'); 
    const buttons = document.getElementById('analyticsButtons');
    
    if (!element) return; // Failsafe
    
    // 1. Hide buttons and lock layout for snapshot
    buttons.style.display = 'none'; 
    const originalWidth = element.style.width; 
    const originalMaxWidth = element.style.maxWidth; 
    const originalBg = element.style.backgroundColor; 
    const originalPadding = element.style.padding;
    
    // Force a wide desktop view so charts don't squash together
    const targetWidth = 1440; 
    element.style.width = targetWidth + 'px'; 
    element.style.maxWidth = targetWidth + 'px'; 
    element.style.backgroundColor = '#f8f9fa'; 
    element.style.padding = '40px'; 

    // 2. Add a tiny delay to ensure Chart.js animations are 100% finished
    setTimeout(() => {
        html2canvas(element, { 
            scale: 2.5, // 🔥 Upped to 3 for ultra-crisp text and charts
            useCORS: true, 
            logging: false, 
            width: targetWidth, 
            windowWidth: targetWidth 
        }).then((canvas) => {
            
          // 3. Restore the live UI instantly
          buttons.style.display = 'flex'; 
          element.style.width = originalWidth; 
          element.style.maxWidth = originalMaxWidth; 
          element.style.backgroundColor = originalBg; 
          element.style.padding = originalPadding;

          const h100Cards = element.querySelectorAll('.h-100');
          h100Cards.forEach(card => card.style.minHeight = '100%');
          
          // 🔥 Use PNG instead of JPEG to prevent blurry artifacting!
          const imgData = canvas.toDataURL('image/png'); 
          
          // 4. Build the PDF
          const pdf = new jsPDF('landscape', 'in', 'letter'); 
          const pdfWidth = pdf.internal.pageSize.getWidth(); 
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imgProps = pdf.getImageProperties(imgData); 
          const margin = 0.3; 
          const maxImgWidth = pdfWidth - (margin * 2); 
          const maxImgHeight = pdfHeight - (margin * 2);
          
          const ratio = Math.min(maxImgWidth / imgProps.width, maxImgHeight / imgProps.height); 
          const finalWidth = imgProps.width * ratio; 
          const finalHeight = imgProps.height * ratio;
          
          // Add the sharp PNG to the PDF and download
          pdf.addImage(imgData, 'PNG', (pdfWidth - finalWidth) / 2, margin, finalWidth, finalHeight); 
          pdf.save(`ICIS_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`);
          
          showAlert("High-Resolution PDF downloaded successfully!", "success");
          
        }).catch(err => {
          // Restore UI if something breaks
          buttons.style.display = 'flex'; 
          element.style.width = originalWidth; 
          element.style.maxWidth = originalMaxWidth; 
          element.style.backgroundColor = originalBg; 
          element.style.padding = originalPadding;
          showAlert("Failed to generate PDF.", "danger");
          console.error(err);
        });
    }, 300); // 300ms pause
  };

});