/**
 * JG STREETFOOD - Admin POS & Kitchen Order Stream
 */

let activeAdminTab = 'orders';

async function renderAdminDashboard() {
  const user = getSessionUser();
  if (!user || user.role !== 'admin') {
    showToast("Admins only! Access restricted.");
    goToPage('home');
    return;
  }

  const allOrders = await api.fetchOrders();
  const allUsers  = await api.fetchUsers();

  const totalRev = allOrders.filter(o => o.status === 'Completed').reduce((s, o) => s + Number(o.total), 0);
  document.getElementById('adMetricSales').innerText = `₱${totalRev.toLocaleString()}`;
  document.getElementById('adMetricCompleted').innerText = allOrders.filter(o => o.status === 'Completed').length;
  document.getElementById('adMetricPending').innerText = allOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready').length;
  document.getElementById('adMetricUsers').innerText = allUsers.length;

  if (activeAdminTab === 'orders') renderAdminOrdersTable(allOrders);
  if (activeAdminTab === 'users') renderAdminUsersTable(allUsers);
}

function switchAdminTab(tab) {
  activeAdminTab = tab;
  ['orders', 'users'].forEach(t => {
    const btn = document.getElementById(`adTabBtn-${t}`);
    const sec = document.getElementById(`adSection-${t}`);
    if (btn) {
      btn.className = (t === tab)
        ? "px-4 py-1.5 rounded-xl neon-btn font-bold transition"
        : "px-4 py-1.5 rounded-xl bg-white dark:bg-[#191c24] border border-neutral-200 dark:border-[#282d3b] text-neutral-500 dark:text-neutral-400 font-semibold transition";
    }
    if (sec) sec.classList.toggle('hidden', t !== tab);
  });
  renderAdminDashboard();
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('adOrdersTableBody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-neutral-400">Walang natanggap na orders sa MySQL database.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr class="hover:bg-neutral-50 dark:hover:bg-[#12141a] border-b border-neutral-200 dark:border-[#282d3b]">
      <td class="py-2.5 font-bold text-jg-primary">#${o.id}</td>
      <td class="py-2.5">
        <strong class="block text-neutral-800 dark:text-white font-bold">${o.customer_name || o.customerName}</strong>
        <span class="text-[10px] text-neutral-400">📞 ${o.phone}</span>
      </td>
      <td class="py-2.5 text-[11px] text-neutral-500 dark:text-neutral-400 max-w-[200px]">
        <div>${o.items_summary || o.itemsSummary}</div>
        ${(o.customer_notes || o.customerNotes) ? `<div class="mt-1 text-[10px] text-amber-500 font-extrabold bg-amber-50 dark:bg-amber-950/60 p-1 rounded-lg border border-amber-300">📢 Request: "${o.customer_notes || o.customerNotes}"</div>` : ''}
      </td>
      <td class="py-2.5 text-[11px] font-semibold">${o.fulfillment}</td>
      <td class="py-2.5 font-bold ${o.payment_method === 'GCash' ? 'text-blue-500' : 'text-emerald-500'}">${o.payment_method || o.paymentMethod}</td>
      <td class="py-2.5 font-black text-jg-primary">₱${Number(o.total).toFixed(2)}</td>
      <td class="py-2.5">
        <select onchange="updateOrderStatus('${o.id}', this.value)" class="text-[10px] font-bold px-2 py-1 rounded-lg border border-neutral-200 dark:border-[#282d3b] bg-white dark:bg-[#191c24]">
          <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
          <option value="Preparing" ${o.status === 'Preparing' ? 'selected' : ''}>🔥 Preparing</option>
          <option value="Ready" ${o.status === 'Ready' ? 'selected' : ''}>🛵 Ready / Delivering</option>
          <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>✅ Completed</option>
          <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>❌ Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(id, status) {
  await api.updateOrderStatus(id, status);
  showToast(`Order #${id} set to ${status}!`);
  renderAdminDashboard();
}

function renderAdminUsersTable(users) {
  const tbody = document.getElementById('adUsersTableBody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-neutral-400">Walang users sa database.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr class="hover:bg-neutral-50 dark:hover:bg-[#12141a] border-b border-neutral-200 dark:border-[#282d3b]">
      <td class="py-2 font-bold text-xs">${u.full_name || u.fullName}</td>
      <td class="py-2 text-[11px] text-neutral-400">@${u.username}</td>
      <td class="py-2 text-[11px]">${u.phone}</td>
      <td class="py-2">
        <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}">
          ${u.role}
        </span>
      </td>
      <td class="py-2 text-[10px] text-neutral-400">${u.created_at || 'Just now'}</td>
    </tr>
  `).join('');
}