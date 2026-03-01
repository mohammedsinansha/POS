const STORAGE_KEY = "novapos-state-v1";

const DEFAULT_PRODUCTS = [
  { id: crypto.randomUUID(), name: "Coffee 250g", sku: "CF-250", price: 8.5, stock: 42 },
  { id: crypto.randomUUID(), name: "Milk 1L", sku: "MLK-1L", price: 2.2, stock: 25 },
  { id: crypto.randomUUID(), name: "Bread Loaf", sku: "BR-LOAF", price: 1.8, stock: 14 },
  { id: crypto.randomUUID(), name: "Chocolate Bar", sku: "CH-80", price: 1.25, stock: 8 },
  { id: crypto.randomUUID(), name: "Orange Juice", sku: "OJ-1L", price: 3.9, stock: 12 }
];

const state = {
  products: [],
  cart: [],
  history: []
};

const productGrid = document.getElementById("productGrid");
const cartBody = document.getElementById("cartBody");
const historyBody = document.getElementById("historyBody");
const receiptContent = document.getElementById("receiptContent");
const cashierNameInput = document.getElementById("cashierName");

function money(value) {
  return `$${value.toFixed(2)}`;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    products: state.products,
    history: state.history,
    cashierName: cashierNameInput.value.trim()
  }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.products = DEFAULT_PRODUCTS;
    return;
  }

  try {
    const data = JSON.parse(raw);
    state.products = Array.isArray(data.products) && data.products.length ? data.products : DEFAULT_PRODUCTS;
    state.history = Array.isArray(data.history) ? data.history : [];
    cashierNameInput.value = data.cashierName || "";
  } catch {
    state.products = DEFAULT_PRODUCTS;
  }
}

function computeTotals() {
  const discountRate = Number(document.getElementById("discount").value || 0) / 100;
  const taxRate = Number(document.getElementById("tax").value || 0) / 100;
  const subtotal = state.cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = subtotal * discountRate;
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * taxRate;
  const total = taxable + tax;
  return { subtotal, discount, tax, total };
}

function renderProducts() {
  const search = document.getElementById("productSearch").value.trim().toLowerCase();
  const filtered = state.products.filter((p) =>
    [p.name, p.sku].some((v) => v.toLowerCase().includes(search))
  );

  productGrid.innerHTML = "";
  filtered.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <strong>${product.name}</strong>
      <small>SKU: ${product.sku}</small>
      <small>${money(product.price)}</small>
      <small class="stock ${product.stock <= 5 ? "low" : ""}">Stock: ${product.stock}</small>
      <button class="btn" ${product.stock <= 0 ? "disabled" : ""}>Add to Cart</button>
    `;
    card.querySelector("button").addEventListener("click", () => addToCart(product.id));
    productGrid.appendChild(card);
  });
}

function addToCart(productId) {
  const product = state.products.find((p) => p.id === productId);
  if (!product || product.stock <= 0) return;

  const line = state.cart.find((item) => item.productId === productId);
  if (line) {
    if (line.qty >= product.stock) return;
    line.qty += 1;
  } else {
    state.cart.push({ productId, name: product.name, price: product.price, qty: 1 });
  }

  renderCart();
}

function updateCartQty(productId, qty) {
  const product = state.products.find((p) => p.id === productId);
  const line = state.cart.find((item) => item.productId === productId);
  if (!product || !line) return;

  line.qty = Math.max(1, Math.min(Number(qty) || 1, product.stock));
  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.productId !== productId);
  renderCart();
}

function renderCart() {
  cartBody.innerHTML = "";

  state.cart.forEach((line) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${line.name}</td>
      <td><input data-role="qty" type="number" min="1" value="${line.qty}" style="width:70px"></td>
      <td>${money(line.price)}</td>
      <td>${money(line.price * line.qty)}</td>
      <td><button class="btn danger" data-role="remove">×</button></td>
    `;
    row.querySelector('[data-role="qty"]').addEventListener("input", (e) => updateCartQty(line.productId, e.target.value));
    row.querySelector('[data-role="remove"]').addEventListener("click", () => removeFromCart(line.productId));
    cartBody.appendChild(row);
  });

  const totals = computeTotals();
  const amountReceived = Number(document.getElementById("amountReceived").value || 0);
  const change = amountReceived - totals.total;

  document.getElementById("subtotal").textContent = money(totals.subtotal);
  document.getElementById("discountValue").textContent = `-${money(totals.discount)}`;
  document.getElementById("taxValue").textContent = money(totals.tax);
  document.getElementById("grandTotal").textContent = money(totals.total);
  document.getElementById("changeDue").textContent = money(change > 0 ? change : 0);
}

function renderHistory() {
  historyBody.innerHTML = "";
  [...state.history].reverse().forEach((sale) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sale.receiptNo}</td>
      <td>${new Date(sale.timestamp).toLocaleString()}</td>
      <td>${sale.cashier || "-"}</td>
      <td>${sale.items.reduce((sum, i) => sum + i.qty, 0)}</td>
      <td>${sale.paymentMethod}</td>
      <td>${money(sale.total)}</td>
    `;
    historyBody.appendChild(row);
  });
}

function renderKPIs() {
  const today = new Date().toDateString();
  const todaySales = state.history.filter((sale) => new Date(sale.timestamp).toDateString() === today);
  const revenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const average = todaySales.length ? revenue / todaySales.length : 0;
  const lowStock = state.products.filter((p) => p.stock <= 5).length;

  document.getElementById("kpiRevenue").textContent = money(revenue);
  document.getElementById("kpiTransactions").textContent = String(todaySales.length);
  document.getElementById("kpiAverage").textContent = money(average);
  document.getElementById("kpiLowStock").textContent = String(lowStock);
}

function completeSale(event) {
  event.preventDefault();
  if (!state.cart.length) {
    alert("Cart is empty.");
    return;
  }

  const totals = computeTotals();
  const amountReceived = Number(document.getElementById("amountReceived").value || 0);
  if (amountReceived < totals.total) {
    alert("Amount received is less than total.");
    return;
  }

  for (const line of state.cart) {
    const product = state.products.find((p) => p.id === line.productId);
    if (!product || product.stock < line.qty) {
      alert(`Insufficient stock for ${line.name}`);
      return;
    }
  }

  state.cart.forEach((line) => {
    const product = state.products.find((p) => p.id === line.productId);
    product.stock -= line.qty;
  });

  const sale = {
    receiptNo: `R-${String(state.history.length + 1).padStart(5, "0")}`,
    timestamp: new Date().toISOString(),
    cashier: cashierNameInput.value.trim(),
    paymentMethod: document.getElementById("paymentMethod").value,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    received: amountReceived,
    change: amountReceived - totals.total,
    items: state.cart.map((x) => ({ ...x }))
  };

  state.history.push(sale);
  receiptContent.textContent = formatReceipt(sale);

  state.cart = [];
  renderProducts();
  renderCart();
  renderHistory();
  renderKPIs();
  saveState();
}

function formatReceipt(sale) {
  const lines = [
    `Receipt ${sale.receiptNo}`,
    `${new Date(sale.timestamp).toLocaleString()}`,
    `Cashier: ${sale.cashier || "N/A"}`,
    "--------------------------------",
    ...sale.items.map((i) => `${i.name} x${i.qty}  ${money(i.qty * i.price)}`),
    "--------------------------------",
    `Subtotal: ${money(sale.subtotal)}`,
    `Discount: -${money(sale.discount)}`,
    `Tax: ${money(sale.tax)}`,
    `Total: ${money(sale.total)}`,
    `Paid: ${money(sale.received)} via ${sale.paymentMethod}`,
    `Change: ${money(sale.change)}`,
    "Thank you for shopping!"
  ];

  return lines.join("\n");
}

function addProduct(event) {
  event.preventDefault();
  const name = document.getElementById("productName").value.trim();
  const sku = document.getElementById("productSku").value.trim();
  const price = Number(document.getElementById("productPrice").value);
  const stock = Number(document.getElementById("productStock").value);

  if (!name || !sku || price < 0 || stock < 0) return;
  if (state.products.some((p) => p.sku.toLowerCase() === sku.toLowerCase())) {
    alert("SKU already exists.");
    return;
  }

  state.products.push({ id: crypto.randomUUID(), name, sku, price, stock });
  event.target.reset();
  renderProducts();
  renderKPIs();
  saveState();
}

function clearHistory() {
  if (!confirm("Clear all sales history?")) return;
  state.history = [];
  renderHistory();
  renderKPIs();
  saveState();
}

function resetCurrentSale() {
  state.cart = [];
  document.getElementById("discount").value = 0;
  document.getElementById("tax").value = 10;
  document.getElementById("amountReceived").value = 0;
  renderCart();
}

function init() {
  loadState();
  renderProducts();
  renderCart();
  renderHistory();
  renderKPIs();

  document.getElementById("productSearch").addEventListener("input", renderProducts);
  document.getElementById("discount").addEventListener("input", renderCart);
  document.getElementById("tax").addEventListener("input", renderCart);
  document.getElementById("amountReceived").addEventListener("input", renderCart);
  document.getElementById("checkoutForm").addEventListener("submit", completeSale);
  document.getElementById("productForm").addEventListener("submit", addProduct);
  document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);
  document.getElementById("newSaleBtn").addEventListener("click", resetCurrentSale);
  cashierNameInput.addEventListener("input", saveState);
}

init();
