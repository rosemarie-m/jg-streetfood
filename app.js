/**
 * JG STREETFOOD - Menu Rendering & Polling
 */

let pollingInterval = null;

function goToPage(pageId) {
  if (pageId === 'admin-dashboard') {
    const user = getSessionUser();
    if (!user || user.role !== 'admin') {
      showToast("Admins only! Access restricted.");
      return;
    }
    renderAdminDashboard();
  }

  if (pageId === 'user-dashboard') {
    const user = getSessionUser();
    if (!user) {
      goToAuth('login');
      return;
    }
    renderUserDashboard();
  }

  if (pageId === 'cart') renderCartView();

  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('neon-btn', 'text-white');
    btn.classList.add('text-neutral-600', 'dark:text-neutral-300');
  });
  const activeNav = document.getElementById(`nav-${pageId}`);
  if (activeNav) {
    activeNav.classList.add('neon-btn', 'text-white');
    activeNav.classList.remove('text-neutral-600', 'dark:text-neutral-300');
  }

  document.querySelectorAll('.bot-btn').forEach(btn => btn.classList.remove('text-jg-primary'));
  const activeBot = document.getElementById(`bot-${pageId}`);
  if (activeBot) activeBot.classList.add('text-jg-primary');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// INALIS ANG DOBLENG PLUS SIGN (Malinis nang "Add" o "Customize & Add")
function renderMenuGrid(items) {
  const container = document.getElementById('menuItemsContainer');
  if (!container) return;

  container.innerHTML = items.map(product => {
    const needsCustomization = product.category === 'combo' || 
                               product.category === 'street' || 
                               product.title.includes('Fries');

    const buttonHtml = needsCustomization
      ? `<button type="button" onclick="requestAddToCart(${product.id})" class="neon-btn-sm px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer">
           <i class="fa-solid fa-sliders text-[10px]"></i> Customize & Add
         </button>`
      : `<button type="button" onclick="addDirectToCart(${product.id})" class="neon-btn px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
           <i class="fa-solid fa-plus text-[10px]"></i> Add
         </button>`;

    return `
      <div class="bg-white dark:bg-[#191c24] border border-neutral-200 dark:border-[#282d3b] rounded-2xl p-3.5 flex flex-col justify-between hover:border-jg-primary/60 transition shadow-xs">
        <div>
          <div class="relative w-full h-32 rounded-xl overflow-hidden mb-2.5 bg-neutral-100 dark:bg-[#12141a] flex flex-col items-center justify-center text-jg-primary">
            <i class="fa-solid fa-utensils text-2xl opacity-40"></i>
            <span class="text-[9px] font-bold text-neutral-400 mt-1">${product.title}</span>
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/95 dark:bg-[#191c24] text-[9px] font-black text-jg-primary uppercase border border-jg-primary/30">
              ${product.badge || 'Fresh'}
            </span>
          </div>
          <h4 class="font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-100 font-display">${product.title}</h4>
          <p class="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">${product.desc}</p>
        </div>

        <div class="flex items-center justify-between pt-2.5 mt-2 border-t border-neutral-100 dark:border-[#282d3b]">
          <span class="text-xs font-black text-jg-primary font-display">${product.priceTag || '₱' + product.price}</span>
          ${buttonHtml}
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(cat) {
  document.querySelectorAll('.cat-pill').forEach(btn => {
    const isTarget = btn.getAttribute('data-cat') === cat;
    btn.classList.toggle('neon-btn', isTarget);
    btn.classList.toggle('text-white', isTarget);
  });
  if (cat === 'all') renderMenuGrid(DEFAULT_PRODUCTS);
  else renderMenuGrid(DEFAULT_PRODUCTS.filter(p => p.category === cat));
}

function handleMenuSearch(keyword) {
  const term = keyword.toLowerCase().trim();
  renderMenuGrid(DEFAULT_PRODUCTS.filter(p => p.title.toLowerCase().includes(term)));
}

function toggleDarkMode() {
  const html = document.documentElement;
  const icon = document.getElementById('themeIcon');
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    icon?.classList.replace('fa-sun', 'fa-moon');
  } else {
    html.classList.add('dark');
    icon?.classList.replace('fa-moon', 'fa-sun');
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.innerText = message;
  toast.classList.remove('translate-y-24', 'opacity-0');
  setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 2600);
}

function startRealtimePolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    const activeSection = document.querySelector('.page-section.active');
    if (activeSection && activeSection.id === 'page-user-dashboard') {
      renderUserDashboard();
    } else if (activeSection && activeSection.id === 'page-admin-dashboard') {
      renderAdminDashboard();
    }
  }, 4000);
}

window.addEventListener('load', () => {
  renderMenuGrid(DEFAULT_PRODUCTS);
  updateCartCounters();
  startRealtimePolling();

  const user = getSessionUser();
  if (user) enterApp(user);
  else showSplash();
});