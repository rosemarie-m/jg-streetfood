/**
 * JG STREETFOOD - Customer Dashboard & Live Tracker
 */

async function renderUserDashboard() {
  const user = getSessionUser();
  // Bawal mag-redirect kapag walang user
  if (!user) return;

  const nameEl = document.getElementById('udUserName');
  const handleEl = document.getElementById('udUserHandle');
  const phoneEl = document.getElementById('udUserPhone');

  if (nameEl) nameEl.innerText = user.full_name || user.fullName || user.username;
  if (handleEl) handleEl.innerText = `@${user.username}`;
  if (phoneEl) phoneEl.innerText = user.phone || 'No phone set';

  const myOrders = await api.fetchOrders(user.username);

  const totalSpent = myOrders
    .filter(o => (o.status || '').toLowerCase() !== 'cancelled')
    .reduce((s, o) => s + Number(o.total || 0), 0);

  const activeOrders = myOrders.filter(o => {
    const s = (o.status || '').toLowerCase();
    return s === 'pending' || s === 'preparing' || s === 'ready';
  });

  const totalOrdersEl = document.getElementById('udTotalOrders');
  const activeOrdersEl = document.getElementById('udActiveOrders');
  const totalSpentEl = document.getElementById('udTotalSpent');

  if (totalOrdersEl) totalOrdersEl.innerText = myOrders.length;
  if (activeOrdersEl) activeOrdersEl.innerText = activeOrders.length;
  if (totalSpentEl) totalSpentEl.innerText = `₱${totalSpent.toFixed(2)}`;

  const trackerBox = document.getElementById('udLiveTrackerBox');
  const listContainer = document.getElementById('udOrdersList');

  // LIVE 4-STEP TRACKER
  if (trackerBox) {
    if (myOrders.length > 0) {
      const latestOrder = activeOrders.length > 0 ? activeOrders[0] : myOrders[0];
      trackerBox.classList.remove('hidden');
      trackerBox.innerHTML = generateTrackerHTML(latestOrder);
    } else {
      trackerBox.classList.add('hidden');
    }
  }

  // ORDER LIST
  if (!listContainer) return;

  if (myOrders.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-8 text-neutral-400">
        <i class="fa-solid fa-receipt text-3xl mb-1 opacity-40"></i>
        <p class="font-bold text-xs text-neutral-800 dark:text-white">No orders yet</p>
        <p class="text-[10px]">Your meryenda tickets will appear here.</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = myOrders.map(order => {
    const s = (order.status || '').toLowerCase();
    let badgeColor = 'bg-yellow-100 text-yellow-700';

    if (s === 'preparing') badgeColor = 'bg-amber-100 text-amber-700 animate-pulse font-extrabold';
    else if (s === 'ready') badgeColor = 'bg-blue-100 text-blue-700 font-extrabold';
    else if (s === 'completed') badgeColor = 'bg-emerald-100 text-emerald-700 font-extrabold';
    else if (s === 'cancelled') badgeColor = 'bg-rose-100 text-rose-700';

    return `
      <div class="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#12141a] border border-neutral-200 dark:border-[#282d3b] space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <span class="font-black text-jg-primary">
            #${order.id} &bull; <small class="text-neutral-400 font-normal">${order.created_at || order.createdAt || 'Recent'}</small>
          </span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}">
            ${order.status}
          </span>
        </div>
        <p class="font-semibold text-neutral-800 dark:text-white">${order.items_summary || order.itemsSummary || 'Standard item'}</p>
        <div class="flex justify-between border-t border-neutral-200 dark:border-[#282d3b] pt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>Mode: <strong class="text-neutral-700 dark:text-neutral-300">${order.fulfillment || 'Stall Pickup'}</strong></span>
          <span class="font-black text-jg-primary">₱${Number(order.total || 0).toFixed(2)}</span>
        </div>
      </div>
    `;
  }).join('');
}

function generateTrackerHTML(order) {
  const steps = [
    { key: 'pending', label: 'Order Sent', icon: 'fa-receipt' },
    { key: 'preparing', label: 'Preparing / Frying', icon: 'fa-fire-burner' },
    { key: 'ready', label: 'Ready / Delivering', icon: 'fa-motorcycle' },
    { key: 'completed', label: 'Completed', icon: 'fa-circle-check' }
  ];

  const currentStatus = (order.status || '').toLowerCase();
  let currentIdx = 0;
  if (currentStatus === 'preparing') currentIdx = 1;
  else if (currentStatus === 'ready') currentIdx = 2;
  else if (currentStatus === 'completed') currentIdx = 3;

  return `
    <div class="p-4 rounded-3xl bg-gradient-to-br from-jg-primary/15 to-transparent border-2 border-jg-primary/50 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full ${currentStatus === 'completed' ? 'bg-emerald-500' : 'bg-jg-primary animate-ping'}"></span>
          <span class="text-xs font-black uppercase tracking-wider text-jg-primary">Live Kitchen Tracker</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-extrabold text-neutral-800 dark:text-white">Ticket #${order.id}</span>
          <button type="button" onclick="renderUserDashboard()" class="text-[11px] text-jg-primary font-bold hover:underline cursor-pointer">
            <i class="fa-solid fa-arrows-rotate"></i> Refresh
          </button>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2 text-center pt-1">
        ${steps.map((s, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return `
            <div class="flex flex-col items-center">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition duration-300 ${
                isCurrent 
                  ? 'neon-btn animate-bounce shadow-md scale-110' 
                  : isDone 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'bg-neutral-200 dark:bg-[#12141a] text-neutral-400'
              }">
                <i class="fa-solid ${s.icon}"></i>
              </div>
              <span class="text-[9px] font-black mt-1.5 ${isCurrent ? 'text-jg-primary scale-105' : (isDone ? 'text-neutral-800 dark:text-white' : 'text-neutral-400')}">${s.label}</span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="p-2.5 rounded-xl bg-white dark:bg-[#191c24] border border-neutral-200 dark:border-[#282d3b] text-xs flex justify-between items-center">
        <span class="truncate max-w-[200px] text-neutral-600 dark:text-neutral-300 font-semibold">${order.items_summary || order.itemsSummary || 'Order details'}</span>
        <span class="font-black text-jg-primary">₱${Number(order.total || 0).toFixed(2)}</span>
      </div>
    </div>
  `;
}