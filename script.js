var sales = [];

function addSale() {
  // Get form values
  var customerName = document.getElementById("customer-name").value;
  var customerAddress = document.getElementById("customer-address").value;
  var deliveryPrice = document.getElementById("delivery-price").value;
  var gasAmount = document.getElementById("gas-amount").value;
  var paid = document.getElementById("paid").checked;
  var totalAmount = calculateTotal(deliveryPrice, gasAmount);

  // Create new sale object
  var sale = {
    customerName: customerName,
    customerAddress: customerAddress,
    deliveryPrice: deliveryPrice,
    gasAmount: gasAmount,
    totalAmount: totalAmount,
    paid: paid
  };

  // Add sale to sales array
  sales.push(sale);

  // Clear form inputs
  document.getElementById("customer-name").value = "";
  document.getElementById("customer-address").value = "";
  document.getElementById("delivery-price").value = "";
  document.getElementById("gas-amount").value = "";
  document.getElementById("paid").checked = false;

  // Refresh sales table
  showSales();
}

function calculateTotal(deliveryPrice, gasAmount) {
  // Calculate total amount based on delivery price and gas amount
  var total = parseFloat(deliveryPrice) * parseFloat(gasAmount);

  return total;
}

function showSales() {
  // Get sales table body element
  var tableBody = document.getElementById("sales-table").getElementsByTagName('tbody')[0];

  // Clear current table rows
  tableBody.innerHTML = "";

  // Add new table rows for each sale
  for (var i = 0; i < sales.length; i++) {
    var sale = sales[i];

    // Create new row element
    var row = tableBody.insertRow(i);

    // Add cells to row
    var nameCell = row.insertCell(0);
    var addressCell = row.insertCell(1);
    var deliveryPriceCell = row.insertCell(2);
    var gasAmountCell = row.insertCell(3);
    var totalAmountCell = row.insertCell(4);
    var paidCell = row.insertCell(5);
    var deleteCell = row.insertCell(6);

    // Fill cells with sale data
    nameCell.innerHTML = sale.customerName;
    addressCell.innerHTML = sale.customerAddress;
    deliveryPriceCell.innerHTML = sale.deliveryPrice;
    gasAmountCell.innerHTML = sale.gasAmount;
    totalAmountCell.innerHTML = sale.totalAmount;
    paidCell.innerHTML = sale.paid ? "Yes" : "No";

// Add delete button to cell
var deleteButton = document.createElement("button");
deleteButton.innerHTML = "Delete";
deleteButton.onclick = (function(index) {
  return function() {
    deleteSale(index);
  };
})(i);
deleteCell.appendChild(deleteButton);

    // Change row color if sale is not paid
    if (!sale.paid) {
      row.style.backgroundColor = "red";
    }
  }
}

function deleteSale(index) {
  // Remove sale from sales array at the given index
  sales.splice(index, 1);

  // Refresh sales table
  showSales();
}
function showSales() {
  // Get sales table body element
  var tableBody = document.getElementById("sales-table").getElementsByTagName('tbody')[0];

  // Clear current table rows
  tableBody.innerHTML = "";

  // Add new table rows for each sale
  var totalSales = 0;
  for (var i = 0; i < sales.length; i++) {
    var sale = sales[i];

    // Create new row element
    var row = tableBody.insertRow(i);

    // Add cells to row
    var nameCell = row.insertCell(0);
    var addressCell = row.insertCell(1);
    var deliveryPriceCell = row.insertCell(2);
    var gasAmountCell = row.insertCell(3);
    var totalAmountCell = row.insertCell(4);
    var paidCell = row.insertCell(5);
    var deleteCell = row.insertCell(6);

    // Fill cells with sale data
    nameCell.innerHTML = sale.customerName;
    addressCell.innerHTML = sale.customerAddress;
    deliveryPriceCell.innerHTML = sale.deliveryPrice;
    gasAmountCell.innerHTML = sale.gasAmount;
    totalAmountCell.innerHTML = sale.totalAmount;
    paidCell.innerHTML = sale.paid ? "Yes" : "No";

    // Add to total sales
    totalSales += sale.totalAmount;
    

    // Add delete button to cell
    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = (function(index) {
      return function() {
        deleteSale(index);
      };
    })(i);
    deleteCell.appendChild(deleteButton);

    // Change row color if sale is not paid
    if (!sale.paid) {
      row.style.backgroundColor = "red";
    }
  }

  // Add total sales row
  var totalRow = tableBody.insertRow(sales.length);
  var totalLabelCell = totalRow.insertCell(0);
  totalLabelCell.colSpan = 4;
  totalLabelCell.innerHTML = "Total Sales:";
  var totalAmountCell = totalRow.insertCell(1);
  totalAmountCell.innerHTML = totalSales.toFixed(2);
  var emptyCell1 = totalRow.insertCell(2);
  var emptyCell2 = totalRow.insertCell(3);
  var emptyCell3 = totalRow.insertCell(4);
  var emptyCell4 = totalRow.insertCell(5);
  var emptyCell5 = totalRow.insertCell(6);
}
function showProfit() {
  var totalGasCost = 0;
  var totalSellingPrice = 0;

  // Calculate total gas cost and selling price
  for (var i = 0; i < sales.length; i++) {
    var sale = sales[i];
    totalGasCost += parseFloat(sale.gasAmount) * 21;
    totalSellingPrice += parseFloat(sale.totalAmount);
  }

  // Calculate profit
  var profit = totalSellingPrice - totalGasCost;

  // Display profit
  alert("Your profit is: " + profit.toFixed(2));
}
