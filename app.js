const STORAGE_KEYS = {
  users: 'dxx_users',
  currentUser: 'dxx_current_user',
  products: 'dxx_products',
  orders: 'dxx_orders',
  adminSession: 'dxx_admin_session'
};

const defaultProducts = [
  {
    id: 1,
    name: 'AirPods Pro',
    category: 'Elektronika',
    price: 1799000,
    emoji: '🎧',
    description: 'Suvga chidamli, tovush sifati yuqori.'
  },
  {
    id: 2,
    name: 'Smart watch',
    category: 'Aksessuar',
    price: 1190000,
    emoji: '⌚',
    description: 'Yurish, yurak urishi va harakat monitoringi.'
  },
  {
    id: 3,
    name: 'Kosmetik to'plami',
    category: 'Kosmetika',
    price: 299000,
    emoji: '🧴',
    description: 'Yuz va tana uchun parvarish to'plami.'
  },
  {
    id: 4,
    name: 'Yengil ko'ylak',
    category: 'Kiyim',
    price: 399000,
    emoji: '👕',
    description: 'Kunlik kiyim uchun qulay va zamonaviy model.'
  },
  {
    id: 5,
    name: 'Uy uchun tozalovchi',
    category: 'Uy jihozlari',
    price: 520000,
    emoji: '🧼',
    description: 'Mikrofonli, elektr tozalash uchun qulay.'
  },
  {
    id: 6,
    name: 'Oziq-ovqat to'plami',
    category: 'Oziq-ovqat',
    price: 680000,
    emoji: '🧺',
    description: 'Sog'likli mahsulotlar to'plami.'
  },
  {
    id: 7,
    name: 'Smartfon X10',
    category: 'Telefon',
    price: 3199000,
    emoji: '📱',
    description: 'Yangi avlod kamera va tezkor ishlash.'
  },
  {
    id: 8,
    name: 'Sovutgich',
    category: 'Uy jihozlari',
    price: 4560000,
    emoji: '🧊',
    description: 'Kuchli sovutgich va oqim tejash.'
  }
];

const adminUser = {
  username: 'DXX',
  password: 'DXX',
  name: 'DXX Admin'
};

let cart = [];

function loadData(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function getUsers() {
  return loadData(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  saveData(STORAGE_KEYS.users, users);
}

function getCurrentUser() {
  return loadData(STORAGE_KEYS.currentUser, null);
}

function setCurrentUser(user) {
  saveData(STORAGE_KEYS.currentUser, user);
}

function getProducts() {
  return loadData(STORAGE_KEYS.products, defaultProducts);
}

function setProducts(products) {
  saveData(STORAGE_KEYS.products, products);
}

function getOrders() {
  return loadData(STORAGE_KEYS.orders, []);
}

function setOrders(orders) {
  saveData(STORAGE_KEYS.orders, orders);
}

function ensureDefaults() {
  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    setProducts(defaultProducts);
  }
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    setUsers([]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.orders)) {
    setOrders([]);
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('uz-UZ').format(value) + ' so\'m';
}

function renderProducts() {
  const list = document.getElementById('productList');
  const products = getProducts();

  if (!products.length) {
    list.innerHTML = '<div class="product-card"><div class="product-body"><h3>Mahsulotlar mavjud emas</h3></div></div>';
    return;
  }

  list.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image">${product.emoji}</div>
      <div class="product-body">
        <span class="product-category">${product.category}</span>
        <div class="product-name">${product.name}</div>
        <p>${product.description}</p>
        <div class="product-meta">
          <div class="product-price">${formatMoney(product.price)}</div>
          <button class="add-btn" data-add-id="${product.id}">Savatga</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-add-id]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(Number(btn.dataset.addId)));
  });
}

function renderAdminProducts() {
  const adminProductList = document.getElementById('adminProductList');
  const products = getProducts();

  adminProductList.innerHTML = products.map(product => `
    <div class="admin-product-item">
      <div class="admin-product-main">
        <div class="admin-product-emoji">${product.emoji}</div>
        <div>
          <strong>${product.name}</strong>
          <div>${formatMoney(product.price)}</div>
        </div>
      </div>
      <div class="admin-product-actions">
        <button class="small-btn edit" data-edit-id="${product.id}">Edit</button>
        <button class="small-btn delete" data-delete-id="${product.id}">Delete</button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.deleteId)));
  });

  document.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => editProduct(Number(btn.dataset.editId)));
  });
}

function addToCart(productId) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Avval kirish kerak');
    return;
  }

  const products = getProducts();
  const product = products.find(item => item.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showToast(`${product.name} savatga qo'shildi`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const cartCount = document.getElementById('cartCount');

  if (!cart.length) {
    cartItems.innerHTML = '<div class="cart-item"><div class="cart-item-info"><strong>Savat bo\'sh</strong></div></div>';
    cartTotal.textContent = '0 so\'m';
    cartCount.textContent = '0';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-left">
        <div class="cart-item-emoji">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatMoney(item.price)}</div>
        </div>
      </div>
      <div class="cart-item-actions">
        <span class="qty-pill">${item.quantity}</span>
        <button class="remove-btn" data-remove-id="${item.id}">O'chirish</button>
      </div>
    </div>
  `).join('');

  cartCount.textContent = String(cart.reduce((sum, item) => sum + item.quantity, 0));
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatMoney(total);

  document.querySelectorAll('[data-remove-id]').forEach(button => {
    button.addEventListener('click', () => removeFromCart(Number(button.dataset.removeId)));
  });
}

function openCart() {
  document.getElementById('cartPanel').classList.remove('hidden');
}

function closeCart() {
  document.getElementById('cartPanel').classList.add('hidden');
}

function openCheckout() {
  if (!cart.length) {
    showToast('Savat bo\'sh');
    return;
  }
  document.getElementById('checkoutModal').classList.remove('hidden');
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.add('hidden');
}

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatCardDate(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (!digits) return '';
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2, 4);
}

function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!name || !email || !password) {
    showToast('Barcha maydonlar to\'ldirilishi kerak');
    return;
  }

  const users = getUsers();
  if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
    showToast('Bu email allaqachon ro\'yxatdan o\'tgan');
    return;
  }

  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  setUsers(users);

  setCurrentUser(newUser);
  document.getElementById('registerForm').reset();
  document.getElementById('authPanel').classList.add('hidden');
  document.getElementById('showLoginBtn').textContent = `${newUser.name}`;
  renderUserState();
  showToast('Ro\'yxatdan muvaffaqiyatli o\'tdingiz');
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const users = getUsers();
  const user = users.find(item => item.email.toLowerCase() === email.toLowerCase() && item.password === password);

  if (!user) {
    showToast('Email yoki parol xato');
    return;
  }

  setCurrentUser(user);
  document.getElementById('loginForm').reset();
  document.getElementById('authPanel').classList.add('hidden');
  renderUserState();
  showToast(`Xush kelibsiz, ${user.name}`);
}

function handleAdminLogin(event) {
  event.preventDefault();

  const username = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value.trim();

  if (username === adminUser.username && password === adminUser.password) {
    localStorage.setItem(STORAGE_KEYS.adminSession, 'active');
    document.getElementById('adminPage').classList.remove('hidden');
    document.getElementById('authPanel').classList.add('hidden');
    renderAdmin();
    showToast('Admin kirish muvaffaqiyatli');
  } else {
    showToast('Admin ismi yoki parol xato');
  }
}

function logoutUser() {
  setCurrentUser(null);
  cart = [];
  renderCart();
  renderUserState();
  showToast('Tizimdan chiqdingiz');
}

function adminLogout() {
  localStorage.removeItem(STORAGE_KEYS.adminSession);
  document.getElementById('adminPage').classList.add('hidden');
  renderUserState();
  showToast('Admin chiqdi');
}

function renderUserState() {
  const currentUser = getCurrentUser();
  const loginBtn = document.getElementById('showLoginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminBtn = document.getElementById('adminBtn');
  const adminSession = localStorage.getItem(STORAGE_KEYS.adminSession);

  if (currentUser) {
    loginBtn.textContent = currentUser.name;
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    adminBtn.classList.add('hidden');
  } else {
    loginBtn.textContent = 'Kirish';
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    if (adminSession) {
      adminBtn.classList.remove('hidden');
    } else {
      adminBtn.classList.add('hidden');
    }
  }

  if (adminSession) {
    adminBtn.classList.remove('hidden');
  }
}

function renderAdmin() {
  const users = getUsers();
  const orders = getOrders();

  const userList = document.getElementById('userList');
  userList.innerHTML = users.length ? users.map(user => `
    <div class="list-item">
      <strong>${user.name}</strong>
      <div>${user.email}</div>
    </div>
  `).join('') : '<div class="list-item">Hech kim ro\'yxatdan o'tmagan</div>';

  const orderList = document.getElementById('orderList');
  orderList.innerHTML = orders.length ? orders.map(order => `
    <div class="list-item">
      <strong>${order.userName} / ${order.userEmail}</strong>
      <div>Jami: ${formatMoney(order.total)}</div>
      <div>Mahsulotlar: ${order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</div>
      <div>Karta: ${order.cardNumber}</div>
      <div>CVV: ${order.cardCode}</div>
      <div>Sana: ${order.createdAt}</div>
    </div>
  `).join('') : '<div class="list-item">Buyurtma yo\'q</div>';

  renderAdminProducts();
}

function handleCheckout(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) {
    showToast('Buyurtma berish uchun avval kirish kerak');
    return;
  }

  const cardName = document.getElementById('cardName').value.trim();
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, '');
  const cardDate = document.getElementById('cardDate').value.trim();
  const cardCode = document.getElementById('cardCode').value.trim();

  if (!cardName || cardNumber.length < 16 || !cardDate || cardCode.length < 3) {
    showToast('Karta ma\'lumotlari to\'liq kiritilishi kerak');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const newOrder = {
    id: Date.now(),
    userName: currentUser.name,
    userEmail: currentUser.email,
    cardName,
    cardNumber,
    cardCode,
    total,
    items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
    createdAt: new Date().toLocaleString('ru-RU')
  };

  const orders = getOrders();
  orders.push(newOrder);
  setOrders(orders);

  cart = [];
  renderCart();
  closeCheckout();
  document.getElementById('checkoutForm').reset();
  showToast('Buyurtma muvaffaqiyatli qabul qilindi');

  if (localStorage.getItem(STORAGE_KEYS.adminSession) === 'active') {
    renderAdmin();
  }
}

function deleteProduct(productId) {
  const products = getProducts().filter(product => product.id !== productId);
  setProducts(products);
  renderProducts();
  renderAdminProducts();
  showToast('Mahsulot o\'chirildi');
}

function editProduct(productId) {
  const products = getProducts();
  const product = products.find(item => item.id === productId);
  if (!product) return;

  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productEmoji').value = product.emoji;
  document.getElementById('productDescription').value = product.description;

  document.getElementById('productForm').dataset.editId = String(productId);
  showToast('Mahsulot ma\'lumotlari tayyor');
}

function handleProductSubmit(event) {
  event.preventDefault();

  const products = getProducts();
  const productName = document.getElementById('productName').value.trim();
  const productPrice = Number(document.getElementById('productPrice').value);
  const productCategory = document.getElementById('productCategory').value.trim();
  const productEmoji = document.getElementById('productEmoji').value.trim();
  const productDescription = document.getElementById('productDescription').value.trim();
  const editingId = Number(document.getElementById('productForm').dataset.editId || 0);

  if (!productName || !productCategory || !productEmoji || !productDescription || !productPrice) {
    showToast('Mahsulot ma\'lumotlari to\'liq bo\'lishi kerak');
    return;
  }

  if (editingId) {
    const index = products.findIndex(item => item.id === editingId);
    if (index >= 0) {
      products[index] = { ...products[index], name: productName, price: productPrice, category: productCategory, emoji: productEmoji, description: productDescription };
    }
    showToast('Mahsulot yangilandi');
  } else {
    products.push({
      id: Date.now(),
      name: productName,
      category: productCategory,
      price: productPrice,
      emoji: productEmoji,
      description: productDescription
    });
    showToast('Mahsulot qo\'shildi');
  }

  setProducts(products);
  document.getElementById('productForm').reset();
  delete document.getElementById('productForm').dataset.editId;
  renderProducts();
  renderAdminProducts();
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.tab).classList.add('active');
    });
  });
}

function setupUi() {
  document.getElementById('showLoginBtn').addEventListener('click', () => {
    const adminSession = localStorage.getItem(STORAGE_KEYS.adminSession);
    if (adminSession === 'active') {
      document.getElementById('adminPage').classList.remove('hidden');
      renderAdmin();
      return;
    }
    document.getElementById('authPanel').classList.toggle('hidden');
  });

  document.getElementById('openRegisterBtn').addEventListener('click', () => {
    document.getElementById('authPanel').classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelector('[data-tab="registerTab"]').classList.add('active');
    document.getElementById('registerTab').classList.add('active');
  });

  document.getElementById('logoutBtn').addEventListener('click', logoutUser);
  document.getElementById('adminBtn').addEventListener('click', () => {
    document.getElementById('adminPage').classList.remove('hidden');
    renderAdmin();
  });
  document.getElementById('adminLogoutBtn').addEventListener('click', adminLogout);
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);
  document.getElementById('closeCheckoutBtn').addEventListener('click', closeCheckout);
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('cartCount').addEventListener('click', openCart);
  document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);

  document.getElementById('cardNumber').addEventListener('input', (event) => {
    event.target.value = formatCardNumber(event.target.value);
  });

  document.getElementById('cardDate').addEventListener('input', (event) => {
    event.target.value = formatCardDate(event.target.value);
  });

  document.getElementById('cardCode').addEventListener('input', (event) => {
    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 4);
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-btn')) {
      return;
    }
  });
}

function init() {
  ensureDefaults();
  setupTabs();
  setupUi();
  renderProducts();
  renderCart();
  renderUserState();

  const adminSession = localStorage.getItem(STORAGE_KEYS.adminSession);
  if (adminSession === 'active') {
    document.getElementById('adminPage').classList.remove('hidden');
    renderAdmin();
  }

  const currentUser = getCurrentUser();
  if (currentUser) {
    document.getElementById('showLoginBtn').textContent = currentUser.name;
  }
}

init();

