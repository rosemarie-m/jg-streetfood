/**
 * JG STREETFOOD - Accounts & Strict Validation
 */

const ADMIN_PASSKEY = "JG2026";
let currentAuthTab = 'login';

function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem('jg_session_user'));
  } catch (e) {
    return null;
  }
}

function setSessionUser(user) {
  if (user) localStorage.setItem('jg_session_user', JSON.stringify(user));
  else localStorage.removeItem('jg_session_user');
}

function showView(viewId) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
}

function showSplash() { showView('splashView'); }

function goToAuth(mode) {
  showView('authView');
  document.getElementById('authForm').reset();
  clearAuthErrors();
  toggleAuthTab(mode);
}

function toggleAuthTab(mode) {
  currentAuthTab = mode;
  clearAuthErrors();

  const isLogin = mode === 'login';
  document.getElementById('authTabLogin').className = isLogin
    ? "flex-1 py-2 rounded-lg neon-btn text-white transition font-bold"
    : "flex-1 py-2 rounded-lg text-neutral-500 dark:text-neutral-400 font-bold transition";

  document.getElementById('authTabSignup').className = !isLogin
    ? "flex-1 py-2 rounded-lg neon-btn text-white transition font-bold"
    : "flex-1 py-2 rounded-lg text-neutral-500 dark:text-neutral-400 font-bold transition";

  document.getElementById('authHeading').innerText = isLogin ? "Welcome Back!" : "Create New Account";
  document.getElementById('authSubheading').innerText = isLogin ? "Sign in to order meryenda or access POS" : "Register as customer or store admin";
  document.getElementById('authSubmitBtn').innerText = isLogin ? "Log In to Account" : "Register Account";
  
  const signupBox = document.getElementById('signupExtraFields');
  if (isLogin) signupBox.classList.add('hidden');
  else {
    signupBox.classList.remove('hidden');
    handleRoleSelectChange();
  }
}

function handleRoleSelectChange() {
  const role = document.getElementById('inputRole').value;
  const adminKeyBox = document.getElementById('adminKeyBox');
  if (role === 'admin') adminKeyBox.classList.remove('hidden');
  else adminKeyBox.classList.add('hidden');
}

function togglePassVisibility() {
  const input = document.getElementById('inputPassword');
  const icon = document.getElementById('passIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function showAuthError(msg) {
  const errBox = document.getElementById('authErrorMessage');
  errBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i> ${msg}`;
  errBox.classList.remove('hidden');
}

function clearAuthErrors() {
  const errBox = document.getElementById('authErrorMessage');
  errBox.innerText = '';
  errBox.classList.add('hidden');
}

// STRICT VALIDATION AND MYSQL SYNC
async function handleAuthSubmit(e) {
  e.preventDefault();
  clearAuthErrors();

  const username = document.getElementById('inputUsername').value.trim();
  const password = document.getElementById('inputPassword').value;

  if (currentAuthTab === 'signup') {
    const fullName = document.getElementById('inputFullName').value.trim();
    const phone    = document.getElementById('inputPhone').value.trim();
    const role     = document.getElementById('inputRole').value;
    const adminKey = document.getElementById('inputAdminKey').value.trim();

    // 1. Full name validation: Letters and spaces only, min 3
    if (fullName.length < 3 || !/^[a-zA-Z\s.]+$/.test(fullName)) {
      showAuthError("Paki-lagay ang buong pangalan (letters and spaces only, min 3 letters).");
      return;
    }

    // 2. Strict 11-digit Philippine Mobile Number
    if (!/^09\d{9}$/.test(phone)) {
      showAuthError("Maling Phone Number! Dapat 11-digits na nagsisimula sa '09' (Hal: 09123456789).");
      return;
    }

    // 3. Username: 4-20 alphanumeric
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
      showAuthError("Ang username ay dapat 4 hanggang 20 characters (letters at numbers lamang).");
      return;
    }

    // 4. Password: min 6 chars
    if (password.length < 6) {
      showAuthError("Masyadong maikli ang password. Minimum ng 6 characters.");
      return;
    }

    // 5. Admin Passkey check
    if (role === 'admin' && adminKey !== ADMIN_PASSKEY) {
      showAuthError(`Maling Admin Security Passkey! (Default Passkey: ${ADMIN_PASSKEY})`);
      return;
    }

    try {
      const response = await api.registerUser({ fullName, username, phone, password, role });
      
      if (!response.success) {
        showAuthError(response.message);
        return;
      }

      const userObj = { fullName, username, phone, role };
      setSessionUser(userObj);
      showToast(`Account saved to MySQL Database! Welcome, ${fullName}`);
      enterApp(userObj);

    } catch (err) {
      showAuthError("Hindi ma-reach ang MySQL Database. Siguraduhing naka-start ang Apache at MySQL sa XAMPP!");
    }

  } else {
    // LOGIN
    if (!username || !password) {
      showAuthError("Paki-lagay ang username at password.");
      return;
    }

    try {
      const response = await api.loginUser({ username, password });
      
      if (response.success) {
        setSessionUser(response.user);
        showToast(`Welcome back, ${response.user.full_name || response.user.username}!`);
        enterApp(response.user);
      } else {
        showAuthError(response.message);
      }
    } catch (err) {
      showAuthError("Hindi ma-reach ang MySQL Database. Siguraduhing binuksan mo gamit ang http://localhost/jg-streetfood/!");
    }
  }
}

function continueAsGuest() {
  const guest = { fullName: "Guest Customer", username: "Guest", role: "customer", phone: "N/A" };
  setSessionUser(guest);
  enterApp(guest);
}

function handleLogout() {
  setSessionUser(null);
  showToast("Logged out successfully");
  showSplash();
}

function enterApp(user) {
  showView('mainApp');
  const displayName = user.full_name || user.fullName || user.username;
  document.getElementById('userDisplayName').innerText = displayName;
  document.getElementById('userInitial').innerText = displayName.charAt(0).toUpperCase();

  const roleBadge = document.getElementById('userRoleBadge');
  if (user.role === 'admin') {
    roleBadge.innerText = "Admin";
    roleBadge.className = "text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500 text-white";
    document.getElementById('nav-admin-dashboard')?.classList.remove('hidden');
    document.getElementById('bot-admin-dashboard')?.classList.remove('hidden');
    document.getElementById('nav-user-dashboard')?.classList.add('hidden');
    document.getElementById('bot-user-dashboard')?.classList.add('hidden');
    goToPage('admin-dashboard');
  } else {
    roleBadge.innerText = "Customer";
    roleBadge.className = "text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-white";
    document.getElementById('nav-admin-dashboard')?.classList.add('hidden');
    document.getElementById('bot-admin-dashboard')?.classList.add('hidden');
    document.getElementById('nav-user-dashboard')?.classList.remove('hidden');
    document.getElementById('bot-user-dashboard')?.classList.remove('hidden');
    goToPage('home');
  }
}