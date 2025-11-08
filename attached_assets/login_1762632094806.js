// ============================================
// AUTHENTICATION STATE
// ============================================

const authState = {
    users: [],
    currentUser: null
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    checkIfLoggedIn();
    console.log('🔐 Authentication ready');
    console.log('Demo: demo@mindflow.com / Demo123456');
});

// ============================================
// LOAD USERS FROM localStorage
// ============================================

function loadUsers() {
    const saved = localStorage.getItem('mindflow_users');
    if (saved) {
        authState.users = JSON.parse(saved);
    } else {
        // Create demo user
        authState.users = [
            {
                id: 1,
                name: 'Demo User',
                email: 'demo@mindflow.com',
                password: 'Demo123456'
            }
        ];
        saveUsers();
    }
}

function saveUsers() {
    localStorage.setItem('mindflow_users', JSON.stringify(authState.users));
}

// ============================================
// CHECK IF ALREADY LOGGED IN
// ============================================

function checkIfLoggedIn() {
    const savedUser = localStorage.getItem('mindflow_currentUser');
    if (savedUser) {
        // User already logged in, go to dashboard
        window.location.href = 'index.html';
    }
}

// ============================================
// SWITCH BETWEEN LOGIN & SIGNUP
// ============================================

function switchToLogin() {
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    clearMessages();
}

function switchToSignup() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    clearMessages();
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function findUserByEmail(email) {
    return authState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// ============================================
// LOGIN HANDLER
// ============================================

function handleLogin(event) {
    event.preventDefault();
    clearMessages();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validate
    if (!email || !password) {
        showLoginError('Please fill in all fields');
        return;
    }

    if (!validateEmail(email)) {
        showLoginError('Please enter a valid email');
        return;
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
        showLoginError('Email not found. Please sign up first');
        return;
    }

    // Check password
    if (user.password !== password) {
        showLoginError('Incorrect password');
        return;
    }

    // Success! Save user and redirect
    localStorage.setItem('mindflow_currentUser', JSON.stringify(user));
    if (rememberMe) {
        localStorage.setItem('mindflow_rememberMe', 'true');
    }

    showLoginSuccess('✅ Login successful! Redirecting...');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ============================================
// SIGNUP HANDLER
// ============================================

function handleSignup(event) {
    event.preventDefault();
    clearMessages();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const terms = document.getElementById('terms').checked;

    // Validate
    if (!name || !email || !password || !confirm) {
        showSignupError('Please fill in all fields');
        return;
    }

    if (name.length < 2) {
        showSignupError('Name must be at least 2 characters');
        return;
    }

    if (!validateEmail(email)) {
        showSignupError('Please enter a valid email');
        return;
    }

    if (findUserByEmail(email)) {
        showSignupError('Email already registered. Please login instead');
        return;
    }

    if (password.length < 8) {
        showSignupError('Password must be at least 8 characters');
        return;
    }

    if (password !== confirm) {
        showSignupError('Passwords do not match');
        return;
    }

    if (!terms) {
        showSignupError('Please agree to Terms of Service');
        return;
    }

    // Create new user
    const newUser = {
        id: authState.users.length + 1,
        name: name,
        email: email,
        password: password
    };

    authState.users.push(newUser);
    saveUsers();

    // Auto-login
    localStorage.setItem('mindflow_currentUser', JSON.stringify(newUser));

    showSignupSuccess('✅ Account created! Welcome to MindFlow!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ============================================
// MESSAGE DISPLAY
// ============================================

function showLoginError(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.style.display = 'block';
}

function showLoginSuccess(msg) {
    const el = document.getElementById('loginSuccess');
    el.textContent = msg;
    el.style.display = 'block';
}

function showSignupError(msg) {
    const el = document.getElementById('signupError');
    el.textContent = msg;
    el.style.display = 'block';
}

function showSignupSuccess(msg) {
    const el = document.getElementById('signupSuccess');
    el.textContent = msg;
    el.style.display = 'block';
}

function clearMessages() {
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginSuccess').style.display = 'none';
    document.getElementById('signupError').style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'none';
}

// ============================================
// LOGOUT FUNCTION
// ============================================

function handleLogout() {
    localStorage.removeItem('mindflow_currentUser');
    localStorage.removeItem('mindflow_rememberMe');
    window.location.href = 'login.html';
}