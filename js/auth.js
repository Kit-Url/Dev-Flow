// Authentication Module - Handle login and session management

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.apiUrl = 'http://localhost:3000/api'; // Backend API URL
    }

    // Handle login form submission
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                return { success: true, message: 'Login successful' };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Connection error. Please try again.' };
        }
    }

    // Handle logout
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get auth token
    getToken() {
        return this.token;
    }

    // Make authenticated API request
    async makeRequest(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            ...options.headers
        };

        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                ...options,
                headers
            });

            if (response.status === 401) {
                // Token expired or invalid
                this.logout();
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            return null;
        }
    }
}

// Initialize auth manager
const auth = new AuthManager();

// On page load - check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // We're on the login page
        if (auth.isAuthenticated()) {
            // Already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');
            const successMsg = document.getElementById('successMsg');

            // Hide previous messages
            errorMsg.style.display = 'none';
            successMsg.style.display = 'none';

            // Attempt login
            const result = await auth.login(username, password);

            if (result.success) {
                successMsg.textContent = result.message;
                successMsg.style.display = 'block';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                errorMsg.textContent = result.message;
                errorMsg.style.display = 'block';
            }
        });
    } else {
        // We're on the dashboard page
        if (!auth.isAuthenticated()) {
            // Not logged in, redirect to login
            window.location.href = 'index.html';
        }

        // Display username in header
        const usernameElement = document.getElementById('username');
        if (usernameElement && auth.getCurrentUser()) {
            usernameElement.textContent = `Welcome, ${auth.getCurrentUser().username}`;
        }

        // Handle logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    auth.logout();
                }
            });
        }
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
