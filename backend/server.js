// Express Server - Dev-Flow Backend
// This is the main backend server file

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Database mock (replace with actual database)
const users = [
    { id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10), email: 'admin@devflow.com' },
    { id: 2, username: 'user', password: bcrypt.hashSync('user123', 10), email: 'user@devflow.com' }
];

let stocks = [
    {
        id: 1,
        serialNumber: 'SW-198728392328',
        itemName: 'Washing Machine',
        brand: 'Samsung',
        location: 'warehouse-a',
        category: 'Appliances',
        quantity: 5,
        lastUpdated: new Date()
    },
    {
        id: 2,
        serialNumber: 'IP-987654321',
        itemName: 'iPhone 13',
        brand: 'Apple',
        location: 'office',
        category: 'Electronics',
        quantity: 10,
        lastUpdated: new Date()
    }
];

let customers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        city: 'New York',
        joinedDate: new Date('2024-01-15')
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1 (555) 987-6543',
        city: 'Los Angeles',
        joinedDate: new Date('2024-02-20')
    }
];

let auditLog = [];

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Function to log audit trail
const logAudit = (action, table, details, userId) => {
    auditLog.push({
        timestamp: new Date(),
        user: userId,
        action,
        table,
        details,
        ipAddress: '127.0.0.1'
    });
};

// ===== AUTHENTICATION ROUTES =====

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Find user
    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );

    logAudit('LOGIN', 'users', `User ${username} logged in`, user.id);

    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email
        }
    });
});

// ===== DASHBOARD ROUTES =====

app.get('/api/dashboard/overview', verifyToken, (req, res) => {
    const lowStockItems = stocks.filter(s => s.quantity < 3).length;

    res.json({
        totalStockItems: stocks.length,
        totalCustomers: customers.length,
        lowStockItems,
        recentActivity: auditLog.slice(-5).reverse().map(log => ({
            action: log.action,
            description: `${log.table}: ${log.details}`,
            timestamp: log.timestamp
        }))
    });
});

// ===== STOCK ROUTES =====

app.get('/api/stocks', verifyToken, (req, res) => {
    res.json({ stocks });
});

app.post('/api/stocks', verifyToken, (req, res) => {
    const { serialNumber, itemName, brand, location, category, quantity } = req.body;

    if (!serialNumber || !itemName || !location) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newStock = {
        id: Math.max(...stocks.map(s => s.id), 0) + 1,
        serialNumber,
        itemName,
        brand,
        location,
        category: category || 'Uncategorized',
        quantity,
        lastUpdated: new Date()
    };

    stocks.push(newStock);
    logAudit('CREATE', 'stocks', `Stock item ${itemName} added`, req.user.id);

    res.json({ success: true, stock: newStock });
});

app.delete('/api/stocks/:id', verifyToken, (req, res) => {
    const stock = stocks.find(s => s.id == req.params.id);

    if (!stock) {
        return res.status(404).json({ message: 'Stock not found' });
    }

    stocks = stocks.filter(s => s.id != req.params.id);
    logAudit('DELETE', 'stocks', `Stock item ${stock.itemName} deleted`, req.user.id);

    res.json({ success: true, message: 'Stock deleted' });
});

// ===== CUSTOMER ROUTES =====

app.get('/api/customers', verifyToken, (req, res) => {
    res.json({ customers });
});

app.post('/api/customers', verifyToken, (req, res) => {
    const { name, email, phone, city } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const newCustomer = {
        id: Math.max(...customers.map(c => c.id), 0) + 1,
        name,
        email,
        phone,
        city,
        joinedDate: new Date()
    };

    customers.push(newCustomer);
    logAudit('CREATE', 'customers', `Customer ${name} added`, req.user.id);

    res.json({ success: true, customer: newCustomer });
});

app.delete('/api/customers/:id', verifyToken, (req, res) => {
    const customer = customers.find(c => c.id == req.params.id);

    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }

    customers = customers.filter(c => c.id != req.params.id);
    logAudit('DELETE', 'customers', `Customer ${customer.name} deleted`, req.user.id);

    res.json({ success: true, message: 'Customer deleted' });
});

// ===== AI CATEGORIZATION ROUTE =====

app.post('/api/ai/categorize', verifyToken, (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        return res.json({ success: true, itemsProcessed: 0, message: 'No items to categorize' });
    }

    // Simple AI categorization logic (in production, use OpenAI API)
    const categories = {
        'washing machine': 'Appliances',
        'iphone': 'Electronics',
        'samsung': 'Electronics',
        'laptop': 'Computers',
        'desk': 'Furniture',
        'chair': 'Furniture',
        'phone': 'Electronics',
        'tablet': 'Electronics',
        'monitor': 'Computers',
        'keyboard': 'Computers',
        'mouse': 'Computers'
    };

    let categorized = 0;

    items.forEach(item => {
        const name = item.itemName.toLowerCase();
        const brand = (item.brand || '').toLowerCase();

        for (const [keyword, category] of Object.entries(categories)) {
            if (name.includes(keyword) || brand.includes(keyword)) {
                const stockIndex = stocks.findIndex(s => s.id === item.id);
                if (stockIndex !== -1) {
                    stocks[stockIndex].category = category;
                    categorized++;
                }
                break;
            }
        }
    });

    logAudit('AI_CATEGORIZE', 'stocks', `${categorized} items categorized`, req.user.id);

    res.json({ success: true, itemsProcessed: categorized, message: 'AI categorization complete' });
});

// ===== AUDIT LOG ROUTE =====

app.get('/api/audit', verifyToken, (req, res) => {
    res.json({ auditLog });
});

// ===== HEALTH CHECK =====

app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Dev-Flow Backend Server running on http://localhost:${PORT}`);
    console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔑 Test credentials: admin / admin123`);
});
