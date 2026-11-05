/**
 * JG STREETFOOD - MySQL API Bridge
 */

const API_ENDPOINT = 'api.php';

const DEFAULT_PRODUCTS = [
  { id: 1, title: "JG1 (Drinks + Fries)", desc: "Solo crispy fries & cold palamig juice", price: 30, priceTag: "₱30", category: "combo", badge: "Best Value" },
  { id: 2, title: "JG2 (Drinks + Fries + Kikiam)", desc: "Solo fries, 3 pcs kikiam & cold drink", price: 35, priceTag: "₱35", category: "combo", badge: "Bestseller" },
  { id: 3, title: "JG3 (Drinks + Fries + Hotdog)", desc: "Solo fries, 3 pcs red hotdog & juice", price: 40, priceTag: "₱40", category: "combo", badge: "Heavy Meryenda" },
  { id: 4, title: "Fishball (7 pcs)", desc: "Golden fried street fishballs with sauce", price: 5, priceTag: "₱5 / 7pcs", category: "street", badge: "Classic ₱5" },
  { id: 5, title: "Kikiam (3 pcs)", desc: "Savory fried spiced kikiam skewers", price: 5, priceTag: "₱5 / 3pcs", category: "street", badge: "Crispy" },
  { id: 6, title: "Pinoy Hotdog (3 pcs)", desc: "Tender Filipino cocktail red hotdogs", price: 10, priceTag: "₱10 / 3pcs", category: "street", badge: "Favorite" },
  { id: 7, title: "Solo Fries", desc: "Crispy seasoned golden potato french fries", price: 25, priceTag: "₱25", category: "street", badge: "Hot Fry" },
  { id: 8, title: "Lemon Juice Palamig", desc: "Cold dispenser-chilled lemon refresher", price: 10, priceTag: "₱10", category: "drinks", badge: "Cold Palamig" },
  { id: 9, title: "Pineapple Juice Palamig", desc: "Sweet tropical chilled pineapple cooler", price: 10, priceTag: "₱10", category: "drinks", badge: "Tropical" },
  { id: 10, title: "YEMA CAKE (Tub)", desc: "Soft sponge cake covered in sweet custard yema", price: 135, priceTag: "₱135", category: "cakes", badge: "Tub Bestseller" },
  { id: 11, title: "UBE CAKE (Tub)", desc: "Authentic purple yam cake in sealed tub", price: 135, priceTag: "₱135", category: "cakes", badge: "Halaya Cake" },
  { id: 12, title: "CHOCOLATE CAKE (Tub)", desc: "Moist chocolate ganache fudge cake", price: 135, priceTag: "₱135", category: "cakes", badge: "Fudge Tub" },
  { id: 13, title: "DARK CHOCO CAKE (Tub)", desc: "Semi-sweet dark cocoa decadent tub cake", price: 135, priceTag: "₱135", category: "cakes", badge: "Dark Cocoa" }
];

const api = {
  async registerUser(userData) {
    const res = await fetch(`${API_ENDPOINT}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  async loginUser(credentials) {
    const res = await fetch(`${API_ENDPOINT}?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return await res.json();
  },

  async fetchOrders(userId = '') {
    try {
      const url = userId ? `${API_ENDPOINT}?action=get_orders&user_id=${encodeURIComponent(userId)}` : `${API_ENDPOINT}?action=get_orders`;
      const res = await fetch(url);
      const data = await res.json();
      return data.success ? data.orders : [];
    } catch (e) {
      return [];
    }
  },

  async saveOrder(order) {
    const res = await fetch(`${API_ENDPOINT}?action=create_order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return await res.json();
  },

  async updateOrderStatus(orderId, status) {
    const res = await fetch(`${API_ENDPOINT}?action=update_order_status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status })
    });
    return await res.json();
  },

  async fetchUsers() {
    try {
      const res = await fetch(`${API_ENDPOINT}?action=get_users`);
      const data = await res.json();
      return data.success ? data.users : [];
    } catch (e) {
      return [];
    }
  }
};