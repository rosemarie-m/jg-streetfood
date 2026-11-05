/**
 * JG STREETFOOD - Customer / Foodie Dashboard
 */

function renderUserDashboard() {
  const user = getSessionUser();
  if (!user) {
    goToAuth('login');
    return;
  }

  document.getElementById('udUserName').innerText = user.fullName || user.username;
  document.getElementById('udUserHandle').innerText = `@${user.username}`;
  document.getElementById('udUserPhone').innerText = user.phone || 'No phone set';

  const myOrders = getStoredOrders().filter(o => o.userId === user.id || o.customerName === user.fullName);
  const totalSpent = myOrders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + Number(o.total), 0);
  const activeOrdersCount = myOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;

  document.getElementById('udTotalOrders').innerText = myOrders.length;
  document.getElementById('udActiveOrders').innerText = activeOrdersCount;
  document.getElementById('udTotalSpent').innerText = `₱${totalSpent.toFixed(2)}`;

  const container = document.getElementById('udOrdersList');
  if (!container) return;

  if (myOrders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-jg-muted">
        <i class="fa-solid fa-receipt text-3xl mb-1 opacity-40"></i>
        <p class="font-bold text-xs text-neutral-800 dark:text-white">No orders yet</p>
        <p class="text-[10px]">Your meryenda tickets will appear here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = myOrders.map(order => `
    <div class="p-3.5 rounded-2xl bg-jg-bgLight dark:bg-[#181113] border border-jg-borderLight dark:border-jg-darkBorder space-y-2 text-xs">
      <div class="flex items-center justify-between">
        <span class="font-black text-jg-primary">#${order.id} &bull; <small class="text-jg-muted font-normal">${order.createdAt}</small></span>
        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold ${
          order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
          order.status === 'Preparing' ? 'bg-blue-100 text-blue-700' :
          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
          'bg-amber-100 text-amber-700'
        }">
          ${order.status}
        </span>
      </div>
      <p class="font-semibold text-neutral-800 dark:text-white">${order.itemsSummary}</p>
      <div class="flex justify-between border-t border-jg-borderLight/60 dark:border-jg-darkBorder/60 pt-1.5 text-[11px] text-jg-muted">
        <span>Mode: <strong class="text-neutral-700 dark:text-neutral-300">${order.fulfillment}</strong></span>
        <span class="font-black text-jg-primary">₱${Number(order.total).toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}