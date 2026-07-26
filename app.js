const STORAGE_KEYS = {
  content: 'brightbite-content-v1',
  menu: 'brightbite-menu-v1',
  points: 'brightbite-points-v1'
};

const defaultContent = {
  heroTitle: 'Bright Bite helps you serve faster.',
  heroDescription: 'A friendly, modern point-of-sale experience designed to feel polished and easy to update for every shift.',
  stat1: '24/7',
  stat2: '100%',
  stat3: 'Fast'
};

const defaultNavigation = [
  { label: 'Home', href: 'index.html' },
  { label: 'About', href: 'about.html' },
  { label: 'Menu', href: 'menu.html' },
  { label: 'Order', href: 'order.html' }
];

const defaultMenu = [
  { name: 'Signature Burger', price: 8.99, description: 'A juicy double stack with crisp pickles and house sauce.' },
  { name: 'Crispy Wrap', price: 7.49, description: 'Crispy chicken with fresh slaw and a light drizzle.' },
  { name: 'Garden Bowl', price: 6.99, description: 'A fresh bowl packed with greens, toppings, and herbs.' },
  { name: 'Mango Cooler', price: 3.49, description: 'A bright, refreshing drink that pairs with any meal.' }
];

const defaultPoints = { john: 540, jamie: 1200, sam: 760 };

let content = loadJson(STORAGE_KEYS.content, defaultContent);
let menu = loadJson(STORAGE_KEYS.menu, defaultMenu);
let points = loadJson(STORAGE_KEYS.points, defaultPoints);
let navigation = loadJson('brightbite-navigation-v1', defaultNavigation);
let cart = [];
let paymentMethod = 'cash';
let receiptText = '';

function loadJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 1800);
}

function renderHome() {
  const title = document.getElementById('heroTitle');
  const description = document.getElementById('heroDescription');
  const heading = document.getElementById('homeHeading');
  const intro = document.getElementById('homeDescription');
  if (title) title.value = content.heroTitle || defaultContent.heroTitle;
  if (description) description.value = content.heroDescription || defaultContent.heroDescription;
  if (heading) heading.textContent = content.heroTitle || defaultContent.heroTitle;
  if (intro) intro.textContent = content.heroDescription || defaultContent.heroDescription;

  const stat1 = document.getElementById('stat1');
  const stat2 = document.getElementById('stat2');
  const stat3 = document.getElementById('stat3');
  if (stat1) stat1.textContent = content.stat1 || defaultContent.stat1;
  if (stat2) stat2.textContent = content.stat2 || defaultContent.stat2;
  if (stat3) stat3.textContent = content.stat3 || defaultContent.stat3;
}

function saveAboutContent() {
  content.heroTitle = document.getElementById('heroTitle').value.trim() || defaultContent.heroTitle;
  content.heroDescription = document.getElementById('heroDescription').value.trim() || defaultContent.heroDescription;
  saveJson(STORAGE_KEYS.content, content);
  renderHome();
  showToast('Content saved');
}

function saveNavigationMenu() {
  navigation = [
    { label: document.getElementById('navLabel1').value.trim() || 'Home', href: document.getElementById('navHref1').value.trim() || 'index.html' },
    { label: document.getElementById('navLabel2').value.trim() || 'About', href: document.getElementById('navHref2').value.trim() || 'about.html' },
    { label: document.getElementById('navLabel3').value.trim() || 'Menu', href: document.getElementById('navHref3').value.trim() || 'menu.html' },
    { label: document.getElementById('navLabel4').value.trim() || 'Order', href: document.getElementById('navHref4').value.trim() || 'order.html' }
  ];
  saveJson('brightbite-navigation-v1', navigation);
  renderNavigation();
  showToast('Menu updated');
}

function renderNavigation() {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  nav.innerHTML = navigation.map((item) => {
    const isActive = currentPage === item.href || (currentPage === '' && item.href === 'index.html');
    return `<a class="nav-link ${isActive ? 'active' : ''}" href="${item.href}">${item.label}</a>`;
  }).join('');
}

function renderMenu() {
  const list = document.getElementById('menuList');
  if (!list) return;
  list.innerHTML = '';
  menu.forEach((item, index) => {
    const block = document.createElement('div');
    block.className = 'menu-card';
    block.innerHTML = `
      <div class="price-pill">$${Number(item.price).toFixed(2)}</div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="payment-row">
        <button class="btn btn-secondary" onclick="editMenuItem(${index})">Edit</button>
        <button class="btn btn-danger" onclick="deleteMenuItem(${index})">Delete</button>
        <button class="btn btn-primary" onclick="addToCartFromMenu('${item.name}', ${item.price})">Add to order</button>
      </div>
    `;
    list.appendChild(block);
  });
}

function addMenuItemFromForm() {
  const name = document.getElementById('newItemName').value.trim();
  const price = parseFloat(document.getElementById('newItemPrice').value);
  const description = document.getElementById('newItemDescription').value.trim();
  if (!name || Number.isNaN(price)) {
    showToast('Please enter a valid name and price');
    return;
  }
  menu.push({ name, price, description: description || 'Freshly prepared and ready to serve.' });
  saveJson(STORAGE_KEYS.menu, menu);
  renderMenu();
  document.getElementById('newItemName').value = '';
  document.getElementById('newItemPrice').value = '';
  document.getElementById('newItemDescription').value = '';
  showToast('Menu item added');
}

function editMenuItem(index) {
  const item = menu[index];
  const nextName = prompt('Edit item name', item.name);
  if (nextName === null) return;
  const nextPrice = prompt('Edit price', item.price);
  if (nextPrice === null) return;
  const nextDescription = prompt('Edit description', item.description);
  if (nextDescription === null) return;
  menu[index] = { name: nextName.trim() || item.name, price: parseFloat(nextPrice) || item.price, description: nextDescription.trim() || item.description };
  saveJson(STORAGE_KEYS.menu, menu);
  renderMenu();
  showToast('Menu item updated');
}

function deleteMenuItem(index) {
  menu.splice(index, 1);
  saveJson(STORAGE_KEYS.menu, menu);
  renderMenu();
  showToast('Menu item removed');
}

function addToCartFromMenu(name, price) {
  const existing = cart.find((entry) => entry.name === name);
  if (existing) existing.qty += 1;
  else cart.push({ name, price, qty: 1 });
  renderOrder();
  showToast(`${name} added`);
}

function renderOrder() {
  const list = document.getElementById('orderList');
  const totalElement = document.getElementById('orderTotal');
  const pointsElement = document.getElementById('pointsCost');
  if (!list) return;

  if (!cart.length) {
    list.innerHTML = '<div class="empty">Your order is empty. Add a menu item to get started.</div>';
  } else {
    list.innerHTML = cart.map((entry) => `
      <div class="order-row">
        <div>
          <strong>${entry.name}</strong><br />
          <span style="color:var(--muted);">$${Number(entry.price).toFixed(2)} each</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty('${entry.name}', -1)">−</button>
          <span>${entry.qty}</span>
          <button class="qty-btn" onclick="changeQty('${entry.name}', 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  const total = cart.reduce((sum, entry) => sum + entry.price * entry.qty, 0);
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
  if (pointsElement) pointsElement.textContent = `${Math.ceil(total) * 100} pts`;
  updatePaymentUi();
}

function changeQty(name, delta) {
  cart = cart.map((entry) => entry.name === name ? { ...entry, qty: Math.max(0, entry.qty + delta) } : entry).filter((entry) => entry.qty > 0);
  renderOrder();
}

function updatePaymentUi() {
  const cashBlock = document.getElementById('cashInputBlock');
  const pointsBlock = document.getElementById('pointsBlock');
  document.querySelectorAll('.payment-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.method === paymentMethod);
  });
  if (cashBlock) cashBlock.style.display = paymentMethod === 'cash' ? 'block' : 'none';
  if (pointsBlock) pointsBlock.style.display = paymentMethod === 'points' ? 'block' : 'none';
}

function setPaymentMethod(method) {
  paymentMethod = method;
  updatePaymentUi();
}

function completeOrder() {
  if (!cart.length) {
    showToast('Add items before checking out');
    return;
  }

  const customerName = document.getElementById('customerName').value.trim() || 'Customer';
  const customerEmail = document.getElementById('customerEmail').value.trim();
  const isDelivery = document.getElementById('isDelivery').checked;
  const address = document.getElementById('deliveryAddress').value.trim();
  const total = cart.reduce((sum, entry) => sum + entry.price * entry.qty, 0);

  if (isDelivery && !address) {
    showToast('Provide a delivery address');
    return;
  }

  const normalizedName = customerName.toLowerCase();
  if (paymentMethod === 'points') {
    const required = Math.ceil(total) * 100;
    const balance = points[normalizedName] || 0;
    if (balance < required) {
      showToast(`Need ${required} pts. Balance: ${balance}`);
      return;
    }
    points[normalizedName] = balance - required;
  } else {
    const paid = parseFloat(document.getElementById('cashAmount').value || 0);
    if (paymentMethod === 'cash' && paid < total) {
      showToast('Cash is short');
      return;
    }
    points[normalizedName] = (points[normalizedName] || 0) + Math.floor(total * 100);
  }

  saveJson(STORAGE_KEYS.points, points);
  receiptText = `Receipt\nCustomer: ${customerName}\nItems: ${cart.map((entry) => `${entry.name} x${entry.qty}`).join(', ')}\nTotal: $${total.toFixed(2)}\nMethod: ${paymentMethod.toUpperCase()}\n${isDelivery ? `Delivery to: ${address}` : ''}`;

  showToast('Order processed');
  const receiptActions = document.getElementById('receiptActions');
  if (receiptActions) receiptActions.style.display = 'flex';
  cart = [];
  renderOrder();
  document.getElementById('customerName').value = '';
  document.getElementById('customerEmail').value = '';
  document.getElementById('deliveryAddress').value = '';
  document.getElementById('cashAmount').value = '';
  document.getElementById('isDelivery').checked = false;
  toggleDeliveryUi();
}

function downloadReceipt() {
  if (!receiptText) return;
  const blob = new Blob([receiptText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'receipt.txt';
  link.click();
  showToast('Receipt downloaded');
}

function sendReceiptEmail() {
  const email = document.getElementById('customerEmail').value.trim();
  if (!email) {
    showToast('Add an email address');
    return;
  }
  window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}&su=${encodeURIComponent('Receipt')}&body=${encodeURIComponent(receiptText)}`);
  showToast('Email opened');
}

function toggleDeliveryUi() {
  const block = document.getElementById('addressBlock');
  if (block) block.style.display = document.getElementById('isDelivery').checked ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavigation();
  renderHome();
  renderMenu();
  renderOrder();
  updatePaymentUi();
  toggleDeliveryUi();

  const deliveryToggle = document.getElementById('isDelivery');
  if (deliveryToggle) deliveryToggle.addEventListener('change', toggleDeliveryUi);

  document.querySelectorAll('.payment-btn').forEach((button) => {
    button.addEventListener('click', () => setPaymentMethod(button.dataset.method));
  });

  const homeTitle = document.getElementById('heroTitle');
  const homeDescription = document.getElementById('heroDescription');
  if (homeTitle) homeTitle.addEventListener('input', () => content.heroTitle = homeTitle.value);
  if (homeDescription) homeDescription.addEventListener('input', () => content.heroDescription = homeDescription.value);
});
