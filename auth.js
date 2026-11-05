/**
 * JG STREETFOOD - Authentication Controller
 */

let authMode = 'login'; // 'login' or 'signup'

function getSessionUser() {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return session ? JSON.parse(session) : null;
  } catch (e) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return null;
  }
}

function setSessionUser(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// 1st Screen -> Auth View
function goToAuth(mode) {
  const splash = document.getElementById('splashView');
  const auth = document.getElementById('authView');
  const main = document.getElementById('mainApp');

  if (splash) {
    splash.classList.add('hidden');
    splash.style.display = 'none';
  }
  if (main) {
    main.classList.add('hidden');
    main.style.display = 'none';
  }
  if (auth) {
    auth.classList.remove('hidden');
    auth.style.display = 'flex';
  }

  const form = document.getElementById('authForm');
  if (form) form.reset();
  
  toggleAuthTab(mode);
}

// Back to Splash Screen
function showSplash() {
  const splash = document.getElementById('splashView');
  const auth = document.getElementById('authView');
  const main = document.getElementById('mainApp');

  if (splash) {
    splash.classList.remove('hidden');
    splash.style.display = 'flex';
  }
  if (auth) {
    auth.classList.add('hidden');
    auth.style.display = 'none';
  }
  if (main) {
    main.classList.add('hidden');
    main.style.display = 'none';
  }
}

function toggleAuthTab(mode) {
  authMode = mode;
  const loginTab = document.getElementById('authTabLogin');
  const signupTab = document.getElementById('authTabSignup');
  const heading = document.getElementById('authHeading');
  const subheading = document.getElementById('authSubheading');
  const submitBtn = document.getElementById('authSubmitBtn');
  const signupFields = document.getElementById('signupExtraFields');

  if (mode === 'login') {
    loginTab.className = "flex-1 py-2 rounded-lg bg-jg-primary text-white font-bold transition";
    signupTab.className = "flex-1 py-2 rounded-lg text-jg-muted font-bold transition";
    heading.innerText = "Welcome Back!";
    subheading.innerText = "Sign in to order your meryenda or manage stall";
    submitBtn.innerText = "Log In to Account";
    signupFields.classList.add('hidden');
    signupFields.style.display = 'none';
  } else {
    signupTab.className = "flex-1 py-2 rounded-lg bg-jg-primary text-white font-bold transition";
    loginTab.className = "flex-1 py-2 rounded-lg text-jg-muted font-bold transition";
    heading.innerText = "Create New Account";
    subheading.innerText = "Register as a customer or stall admin";
    submitBtn.innerText = "Complete Registration";
    signupFields.classList.remove('hidden');
    signupFields.style.display = 'block';
  }
}

function togglePassVisibility() {
  const input = document.getElementById('inputPassword');
  const icon = document.getElementById('passIcon');
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('inputUsername').value.trim();
  const password = document.getElementById('inputPassword').value;
  const users = getStoredUsers();

  if (authMode === 'signup') {
    const fullName = document.getElementById('inputFullName').value.trim();
    const phone = document.getElementById('inputPhone').value.trim();
    const role = document.getElementById('inputRole').value;

    if (!username || !password || !fullName) {
      showToast("Please fill in all required fields!");
      return;
    }

    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      showToast("Username already taken! Please pick another.");
      return;
    }

    const newUser = {
      id: 'USR-' + Date.now(),
      fullName: fullName,
      username: username,
      password: password,
      phone: phone || "N/A",
      role: role, // 'customer' or 'admin'
      createdAt: new Date().toLocaleDateString()
    };

    users.push(newUser);
    saveStoredUsers(users);
    setSessionUser(newUser);

    showToast(`Account created! Welcome, ${newUser.fullName}`);
    enterApp(newUser);
  } else {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (!user) {
      showToast("Invalid username or password. Please Sign Up first!");
      return;
    }

    setSessionUser(user);
    showToast(`Welcome back, ${user.fullName || user.username}!`);
    enterApp(user);
  }
}

function continueAsGuest() {
  const guestUser = {
    id: 'GUEST-' + Math.floor(100 + Math.random() * 900),
    fullName: "Guest Customer",
    username: "Guest",
    role: "customer"
  };
  setSessionUser(guestUser);
  enterApp(guestUser);
}

function handleLogout() {
  setSessionUser(null);
  showToast("Logged out successfully");
  showSplash();
}

function enterApp(user) {
  const splash = document.getElementById('splashView');
  const auth = document.getElementById('authView');
  const main = document.getElementById('mainApp');

  if (splash) {
    splash.classList.add('hidden');
    splash.style.display = 'none';
  }
  if (auth) {
    auth.classList.add('hidden');
    auth.style.display = 'none';
  }
  if (main) {
    main.classList.remove('hidden');
    main.style.display = 'flex';
  }

  const displayName = user.fullName || user.username;
  document.getElementById('userDisplayName').innerText = displayName;
  document.getElementById('userInitial').innerText = displayName.charAt(0).toUpperCase();

  const roleBadge = document.getElementById('userRoleBadge');
  if (user.role === 'admin') {
    roleBadge.innerText = "Admin";
    roleBadge.className = "text-[9px] px-1.5 py-0.5 rounded font-black uppercase bg-rose-500 text-white";
    
    document.getElementById('nav-admin-dashboard')?.classList.remove('hidden');
    document.getElementById('bot-admin-dashboard')?.classList.remove('hidden');
    document.getElementById('nav-user-dashboard')?.classList.add('hidden');
    document.getElementById('bot-user-dashboard')?.classList.add('hidden');

    goToPage('admin-dashboard');
  } else {
    roleBadge.innerText = user.username === 'Guest' ? "Guest" : "Customer";
    roleBadge.className = "text-[9px] px-1.5 py-0.5 rounded font-black uppercase bg-emerald-500 text-white";

    document.getElementById('nav-admin-dashboard')?.classList.add('hidden');
    document.getElementById('bot-admin-dashboard')?.classList.add('hidden');
    document.getElementById('nav-user-dashboard')?.classList.remove('hidden');
    document.getElementById('bot-user-dashboard')?.classList.remove('hidden');

    goToPage('home');
  }
}