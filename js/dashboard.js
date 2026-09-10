// Dashboard Module - Handle navigation, data loading, and interactions

class DashboardManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.stocks = [];
        this.customers = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Stock section events
        document.getElementById('addStockBtn')?.addEventListener('click', () => this.openAddStockModal());
        document.getElementById('stockSearch')?.addEventListener('input', (e) => this.filterStocks(e.target.value));
        document.getElementById('locationFilter')?.addEventListener('change', () => this.applyStockFilters());
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.applyStockFilters());
        document.getElementById('aiCategorizeBtn')?.addEventListener('click', () => this.runAICategorization());

        // Customer section events
        document.getElementById('addCustomerBtn')?.addEventListener('click', () => this.openAddCustomerModal());
        document.getElementById('customerSearch')?.addEventListener('input', (e) => this.filterCustomers(e.target.value));

        // Modal close button
        document.querySelector('.close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    }

    // Switch between sections
    switchSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected section
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }

        // Add active class to clicked nav item
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

        this.currentSection = section;

        // Load section-specific data
        switch(section) {
            case 'stocks':
                this.loadStocksData();
                break;
            case 'customers':
                this.loadCustomersData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
            case 'dashboard':
                this.loadDashboardData();
                break;
        }
    }

    // Load dashboard overview data
    async loadDashboardData() {
        try {
            const data = await auth.makeRequest('/dashboard/overview');
            
            if (data) {
                document.getElementById('totalStock').textContent = data.totalStockItems || 0;
                document.getElementById('totalCustomers').textContent = data.totalCustomers || 0;
                document.getElementById('lowStock').textContent = data.lowStockItems || 0;
                
                // Load recent activity
                this.displayRecentActivity(data.recentActivity || []);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    // Load stocks data
    async loadStocksData() {
        try {
            const data = await auth.makeRequest('/stocks');
            
            if (data && data.stocks) {
                this.stocks = data.stocks;
                this.displayStocks(this.stocks);
            }
        } catch (error) {
            console.error('Error loading stocks:', error);
        }
    }

    // Load customers data
    async loadCustomersData() {
        try {
            const data = await auth.makeRequest('/customers');
            
            if (data && data.customers) {
                this.customers = data.customers;
                this.displayCustomers(this.customers);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    }

    // Load settings data
    async loadSettingsData() {
        try {
            const data = await auth.makeRequest('/settings');
            console.log('Settings loaded:', data);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Display stocks in table
    displayStocks(stocks) {
        const tbody = document.getElementById('stocksTable');
        
        if (stocks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary);">No stock items found</td></tr>';
            return;
        }

        tbody.innerHTML = stocks.map(stock => `
            <tr>
                <td>${stock.serialNumber || 'N/A'}</td>
                <td>${stock.itemName || 'N/A'}</td>
                <td>${stock.brand || 'N/A'}</td>
                <td>${stock.location || 'N/A'}</td>
                <td><span style="background-color: rgba(157, 78, 221, 0.3); padding: 4px 8px; border-radius: 4px;">${stock.category || 'Uncategorized'}</span></td>
                <td>${stock.quantity || 0}</td>
                <td>${new Date(stock.lastUpdated || Date.now()).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="dashboard.editStock('${stock.id}')">Edit</button>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px; color: #ef476f;" onclick="dashboard.deleteStock('${stock.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Display customers in table
    displayCustomers(customers) {
        const tbody = document.getElementById('customersTable');
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary);">No customers found</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(customer => `
            <tr>
                <td>${customer.id || 'N/A'}</td>
                <td>${customer.name || 'N/A'}</td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${customer.city || 'N/A'}</td>
                <td>${new Date(customer.joinedDate || Date.now()).toLocaleDateString()}</td>
                <td>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="dashboard.editCustomer('${customer.id}')">Edit</button>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px; color: #ef476f;" onclick="dashboard.deleteCustomer('${customer.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Display recent activity
    displayRecentActivity(activities) {
        const log = document.getElementById('activityLog');
        
        if (activities.length === 0) {
            log.innerHTML = '<p style="color: var(--text-secondary);">No recent activity</p>';
            return;
        }

        log.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <strong>${activity.action}</strong> - ${activity.description} 
                <span style="color: #9d4edd;">${new Date(activity.timestamp).toLocaleString()}</span>
            </div>
        `).join('');
    }

    // Filter stocks by search term
    filterStocks(searchTerm) {
        const filtered = this.stocks.filter(stock =>
            stock.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.displayStocks(filtered);
    }

    // Filter customers by search term
    filterCustomers(searchTerm) {
        const filtered = this.customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm)
        );
        this.displayCustomers(filtered);
    }

    // Apply location and category filters to stocks
    applyStockFilters() {
        const locationFilter = document.getElementById('locationFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filtered = this.stocks;

        if (locationFilter) {
            filtered = filtered.filter(stock => stock.location === locationFilter);
        }

        if (categoryFilter) {
            filtered = filtered.filter(stock => stock.category === categoryFilter);
        }

        this.displayStocks(filtered);
    }

    // Run AI categorization on uncategorized items
    async runAICategorization() {
        const btn = document.getElementById('aiCategorizeBtn');
        btn.disabled = true;
        btn.textContent = '🤖 Processing...';

        try {
            const result = await auth.makeRequest('/ai/categorize', {
                method: 'POST',
                body: JSON.stringify({ 
                    items: this.stocks.filter(s => !s.category || s.category === 'Uncategorized')
                })
            });

            if (result.success) {
                alert('✅ AI Categorization complete! ' + result.itemsProcessed + ' items categorized.');
                this.loadStocksData();
            } else {
                alert('❌ Error during categorization. Please try again.');
            }
        } catch (error) {
            console.error('AI categorization error:', error);
            alert('Error during AI categorization');
        } finally {
            btn.disabled = false;
            btn.textContent = '🤖 AI Categorize';
        }
    }

    // Open modal for adding stock
    openAddStockModal() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
            <h2>Add New Stock Item</h2>
            <form id="addStockForm" style="margin-top: 20px;">
                <div class="form-group">
                    <label for="serialNumber">Serial Number</label>
                    <input type="text" id="serialNumber" required placeholder="e.g., SW-198728392328">
                </div>
                <div class="form-group">
                    <label for="itemName">Item Name</label>
                    <input type="text" id="itemName" required placeholder="e.g., Washing Machine">
                </div>
                <div class="form-group">
                    <label for="brand">Brand</label>
                    <input type="text" id="brand" placeholder="e.g., Samsung, Apple">
                </div>
                <div class="form-group">
                    <label for="location">Location</label>
                    <select id="location" required>
                        <option value="">Select Location</option>
                        <option value="warehouse-a">Warehouse A</option>
                        <option value="warehouse-b">Warehouse B</option>
                        <option value="office">Office</option>
                        <option value="storage">Storage Room</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="category">Category</label>
                    <input type="text" id="category" placeholder="Will be auto-categorized by AI">
                </div>
                <div class="form-group">
                    <label for="quantity">Quantity</label>
                    <input type="number" id="quantity" required min="1" value="1">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Add Stock Item</button>
            </form>
        `;

        modal.classList.remove('hidden');

        document.getElementById('addStockForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitAddStock();
        });
    }

    // Submit add stock form
    async submitAddStock() {
        const stockData = {
            serialNumber: document.getElementById('serialNumber').value,
            itemName: document.getElementById('itemName').value,
            brand: document.getElementById('brand').value,
            location: document.getElementById('location').value,
            category: document.getElementById('category').value,
            quantity: parseInt(document.getElementById('quantity').value)
        };

        try {
            const result = await auth.makeRequest('/stocks', {
                method: 'POST',
                body: JSON.stringify(stockData)
            });

            if (result.success) {
                alert('✅ Stock item added successfully!');
                this.closeModal();
                this.loadStocksData();
            } else {
                alert('❌ Error adding stock item');
            }
        } catch (error) {
            console.error('Error adding stock:', error);
            alert('Error adding stock item');
        }
    }

    // Open modal for adding customer
    openAddCustomerModal() {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
            <h2>Add New Customer</h2>
            <form id="addCustomerForm" style="margin-top: 20px;">
                <div class="form-group">
                    <label for="customerName">Name</label>
                    <input type="text" id="customerName" required placeholder="Full name">
                </div>
                <div class="form-group">
                    <label for="customerEmail">Email</label>
                    <input type="email" id="customerEmail" required placeholder="email@example.com">
                </div>
                <div class="form-group">
                    <label for="customerPhone">Phone</label>
                    <input type="tel" id="customerPhone" required placeholder="+1 (555) 123-4567">
                </div>
                <div class="form-group">
                    <label for="customerCity">City</label>
                    <input type="text" id="customerCity" placeholder="City">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%;">Add Customer</button>
            </form>
        `;

        modal.classList.remove('hidden');

        document.getElementById('addCustomerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitAddCustomer();
        });
    }

    // Submit add customer form
    async submitAddCustomer() {
        const customerData = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value,
            city: document.getElementById('customerCity').value
        };

        try {
            const result = await auth.makeRequest('/customers', {
                method: 'POST',
                body: JSON.stringify(customerData)
            });

            if (result.success) {
                alert('✅ Customer added successfully!');
                this.closeModal();
                this.loadCustomersData();
            } else {
                alert('❌ Error adding customer');
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Error adding customer');
        }
    }

    // Edit stock item
    async editStock(id) {
        alert('Edit stock feature coming soon for ID: ' + id);
    }

    // Delete stock item
    async deleteStock(id) {
        if (!confirm('Are you sure you want to delete this stock item?')) return;

        try {
            const result = await auth.makeRequest(`/stocks/${id}`, {
                method: 'DELETE'
            });

            if (result.success) {
                alert('✅ Stock item deleted');
                this.loadStocksData();
            } else {
                alert('❌ Error deleting stock item');
            }
        } catch (error) {
            console.error('Error deleting stock:', error);
        }
    }

    // Edit customer
    async editCustomer(id) {
        alert('Edit customer feature coming soon for ID: ' + id);
    }

    // Delete customer
    async deleteCustomer(id) {
        if (!confirm('Are you sure you want to delete this customer?')) return;

        try {
            const result = await auth.makeRequest(`/customers/${id}`, {
                method: 'DELETE'
            });

            if (result.success) {
                alert('✅ Customer deleted');
                this.loadCustomersData();
            } else {
                alert('❌ Error deleting customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    }

    // Close modal
    closeModal() {
        document.getElementById('modal').classList.add('hidden');
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard')) {
        dashboard = new DashboardManager();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardManager;
}
