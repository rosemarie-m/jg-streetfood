/**
 * JG STREETFOOD - Cart & Checkout Engine
 */

let cart = [];
let pendingCustomProduct = null;
let customModalQty = 1;

let selectedPowder = "Cheese";
let selectedDrink = "Lemon Juice Palamig";
let selectedSauce = "Sweet Manong Sauce";

function addDirectToCart(productId) {
  const prod = DEFAULT_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;
  addToCart(prod, {}, 1, "");
}

function requestAddToCart(productId) {
  const prod = DEFAULT_PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  pendingCustomProduct = prod;
  customModalQty = 1;
  selectedPowder = "Cheese";
  selectedDrink = "Lemon Juice Palamig";
  selectedSauce = "Sweet Manong Sauce";

  document.getElementById('customModalItemTitle').innerText = prod.title;
  document.getElementById('customModalItemPrice').innerText = prod.priceTag || ('₱' + prod.price);
  document.getElementById('customModalQtyDisplay').innerText = customModalQty;
  document.getElementById('customModalItemNotes').value = '';

  const hasFries = prod.category === 'combo' || prod.title.includes('Fries');
  const hasDrink = prod.category === 'combo';
  const hasSauce = prod.category === 'street' || prod.title.includes('Kikiam') || prod.title.includes('Hotdog');

  document.getElementById('customSectionPowder').classList.toggle('hidden', !hasFries);
  document.getElementById('customSectionDrink').classList.toggle('hidden', !hasDrink);
  document.getElementById('customSectionSauce').classList.toggle('hidden', !hasSauce);

  selectCustomOption('powder', 'Cheese');
  selectCustomOption('drink', 'Lemon Juice Palamig');
  selectCustomOption('sauce', 'Sweet Manong Sauce');
  updateCustomModalButton();

  document.getElementById('comboCustomModal').classList.remove('hidden');
  document.getElementById('comboCustomModal').classList.add('flex');
}

function selectCustomOption(type, value) {
  if (type === 'powder') selectedPowder = value;
  if (type === 'drink') selectedDrink = value;
  if (type === 'sauce') selectedSauce = value;

  document.querySelectorAll(`.opt-card-${type}`).forEach(card => {
    const isChosen = card.getAttribute('data-val') === value;
    card.classList.toggle('border-jg-primary', isChosen);
    card.classList.toggle('bg-jg-primary/10', isChosen);
    card.classList.toggle('border-neutral-200', !isChosen);
    card.classList.toggle('dark:border-[#282d3b]', !isChosen);

    const check = card.querySelector('.opt-check');
    if (check) check.classList.toggle('hidden', !isChosen);
  });
}

function changeCustomModalQty(delta) {
  customModalQty += delta;
  if (customModalQty < 1) customModalQty = 1;
  document.getElementById('customModalQtyDisplay').innerText = customModalQty;
  updateCustomModalButton();
}

function updateCustomModalButton() {
  if (!pendingCustomProduct) return;
  const total = pendingCustomProduct.price * customModalQty;
  document.getElementById('customModalConfirmBtnText').innerText = `Add to Cart • ₱${total.toFixed(2)}`;
}

function closeCustomModal() {
  document.getElementById('comboCustomModal').classList.add('hidden');
  document.getElementById('comboCustomModal').classList.remove('flex');
  pendingCustomProduct = null;
}

function confirmAddCustomToCart() {
  if (!pendingCustomProduct) return;
  const prod = pendingCustomProduct;
  const itemNote = document.getElementById('customModalItemNotes').value.trim();

  const customizations = {};
  if (prod.category === 'combo' || prod.title.includes('Fries')) customizations.powder = selectedPowder;
  if (prod.category === 'combo') customizations.drink = selectedDrink;
  if (prod.category === 'street' || prod.title.includes('Kikiam') || prod.title.includes('Hotdog')) customizations.sauce = selectedSauce;

  addToCart(prod, customizations, customModalQty, itemNote);
  closeCustomModal();
}

function addToCart(item, customizations = {}, qty = 1, itemNote = "") {
  const customKey = JSON.stringify(customizations) + '|' + itemNote;
  const existing = cart.find(ci => ci.id === item.id && (JSON.stringify(ci.customizations) + '|' + (ci.note || '')) === customKey);

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: item.id,
      title: item.title,
      price: Number(item.price),
      customizations: customizations,
      note: itemNote,
      qty: qty
    });
  }

  updateCartCounters();
  renderCartView();
  showToast(`Added ${qty}x ${item.title} to cart!`);
}

function updateCartCounters() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('desktopCartBadge').innerText = total;
  document.getElementById('mobileCartBadge').innerText = total;
}

function updateCartItemQty(index, delta) {
  if (!cart[index]) return;
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartCounters();
  renderCartView();
}

function renderCartView() {
  const container = document.getElementById('cartPageList');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 text-neutral-400">
        <span class="text-3xl block mb-2 opacity-50">🛒</span>
        <h4 class="font-bold text-xs text-neutral-800 dark:text-white">Your cart is empty</h4>
        <p class="text-[11px] mt-0.5">Explore our menu and add your favorite street food!</p>
      </div>
    `;
    calculateCartTotals();
    return;
  }

  container.innerHTML = cart.map((item, idx) => {
    const c = item.customizations || {};
    const details = [];
    if (c.powder) details.push(`Powder: <strong class="text-jg-primary">${c.powder}</strong>`);
    if (c.drink) details.push(`Drink: <strong class="text-jg-primary">${c.drink}</strong>`);
    if (c.sauce) details.push(`Sauce: <strong class="text-jg-primary">${c.sauce}</strong>`);
    if (item.note) details.push(`Note: <span class="italic text-amber-500 font-semibold">"${item.note}"</span>`);

    return `
      <div class="bg-neutral-50 dark:bg-[#12141a] border border-neutral-200 dark:border-[#282d3b] rounded-2xl p-2.5 flex items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl overflow-hidden bg-jg-softPink dark:bg-[#191c24] flex items-center justify-center flex-shrink-0 text-jg-primary">
            <i class="fa-solid fa-utensils text-xs"></i>
          </div>
          <div class="min-w-0">
            <h5 class="font-bold truncate text-xs text-neutral-800 dark:text-white">${item.title}</h5>
            <div class="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
              ${details.length > 0 ? details.join(' &bull; ') : 'Standard item'}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="flex items-center border border-neutral-200 dark:border-[#282d3b] rounded-lg bg-white dark:bg-[#191c24] px-2 py-0.5 gap-2 font-bold text-xs">
            <button type="button" onclick="updateCartItemQty(${idx}, -1)" class="text-neutral-400 hover:text-jg-primary px-1">-</button>
            <span>${item.qty}</span>
            <button type="button" onclick="updateCartItemQty(${idx}, 1)" class="text-neutral-400 hover:text-jg-primary px-1">+</button>
          </div>
          <span class="font-black text-jg-primary text-xs min-w-[50px] text-right">
            ₱${(item.price * item.qty).toFixed(2)}
          </span>
        </div>
      </div>
    `;
  }).join('');

  calculateCartTotals();
}

function calculateCartTotals() {
  const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const isDelivery = document.querySelector('input[name="orderType"]:checked')?.value === 'delivery';
  const box = document.getElementById('cartDeliveryAddressBox');
  if (box) box.classList.toggle('hidden', !isDelivery);

  const fee = (isDelivery && subtotal > 0) ? 20 : 0;
  const total = subtotal + fee;

  document.getElementById('cartPageSubtotal').innerText = `₱${subtotal.toFixed(2)}`;
  document.getElementById('cartPageDelivery').innerText = `₱${fee.toFixed(2)}`;
  document.getElementById('cartPageTotal').innerText = `₱${total.toFixed(2)}`;
}

// CONFIRM ORDER FUNCTION NA NAKA-CONNECT DIRETSO SA MYSQL
async function handleCheckoutSubmit() {
  if (cart.length === 0) return showToast("Walang laman ang cart!");

  const currentUser = getSessionUser();
  const isDelivery = document.querySelector('input[name="orderType"]:checked')?.value === 'delivery';
  const address = document.getElementById('cartDeliveryAddress')?.value.trim();
  const overallOrderNotes = document.getElementById('cartOrderNotes')?.value.trim() || '';

  if (isDelivery && !address) {
    showToast("Paki-lagay ang landmark / dropoff para sa delivery!");
    return;
  }

  const payment = document.querySelector('input[name="cartPayment"]:checked')?.value || 'Cash';
  const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const deliveryFee = isDelivery ? 20 : 0;
  const finalTotal = subtotal + deliveryFee;
  const ticketId = 'JG-' + Math.floor(1000 + Math.random() * 9000);

  const summary = cart.map(i => {
    const c = i.customizations || {};
    const tags = [];
    if (c.powder) tags.push(c.powder);
    if (c.drink) tags.push(c.drink);
    if (c.sauce) tags.push(c.sauce);
    if (i.note) tags.push(`Note: "${i.note}"`);
    return `${i.title} (${i.qty}) ${tags.length > 0 ? '[' + tags.join(', ') + ']' : ''}`;
  }).join('; ');

  const orderData = {
    id: ticketId,
    userId: currentUser ? (currentUser.id || currentUser.username) : 'GUEST',
    customerName: currentUser ? (currentUser.full_name || currentUser.fullName || currentUser.username) : "Walk-in Guest",
    phone: currentUser ? (currentUser.phone || "N/A") : "N/A",
    itemsSummary: summary,
    customerNotes: overallOrderNotes,
    fulfillment: isDelivery ? `Delivery (${address})` : 'Stall Pickup',
    paymentMethod: payment,
    total: finalTotal
  };

  try {
    const res = await api.saveOrder(orderData);
    if (!res.success) {
      showToast("Error sa database: " + (res.message || "MySQL Insert Error"));
      return;
    }
  } catch (err) {
    showToast("Hindi ma-reach ang MySQL database!");
    return;
  }

  document.getElementById('rTicketId').innerText = `#${ticketId}`;
  document.getElementById('rPaymentMode').innerText = payment;
  document.getElementById('rTotalAmount').innerText = `₱${finalTotal.toFixed(2)}`;
  document.getElementById('receiptModal').classList.remove('hidden');

  cart = [];
  document.getElementById('cartOrderNotes').value = '';
  updateCartCounters();
  renderCartView();
}

function closeReceiptModal() {
  document.getElementById('receiptModal').classList.add('hidden');
  const user = getSessionUser();
  if (user && user.role === 'customer') goToPage('user-dashboard');
  else goToPage('home');
}