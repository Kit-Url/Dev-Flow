# Dev-Flow

A unified web-based database platform for company employees. Like QNE but fully integrated with password protection, online access, and AI assistance - eliminating the need for RDP to access server databases.

## Key Features

- 🔐 **Secure Authentication** — password-protected login, role-based access
- 📊 **Stock Management** — track inventory by location, serial numbers, quantities, categories, brand
- 👥 **Customer Management** — manage customer data, orders, history
- 🛒 **Orders/Purchases** — create and track orders
- 🔍 **Integrated Query Tool** — built-in database search (replaces QNE)
- 🤖 **AI Assistant** — auto-categorize items when server is idle
- 📋 **Audit Log** — track all changes, user actions, access
- 🔒 **Secure Tunnel** — Cloudflare Tunnel to database with encryption
- 📱 **Mobile Responsive** — accessible from any device

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js/Express
- **Database:** MySQL/SQLite for user management
- **Security:** JWT authentication, SSL/TLS, Cloudflare Tunnel
- **AI Integration:** OpenAI API for auto-categorization

## Project Structure

```
Dev-Flow/
├── index.html              # Login page
├── dashboard.html          # Main dashboard (overview)
├── stock-list.html         # Stock/Inventory management
├── customers.html          # Customer management
├── orders.html             # Orders management
├── css/
│   └── style.css           # Global styling
├── js/
│   ├── auth.js             # Authentication logic
│   ├── dashboard.js        # Dashboard functionality
│   ├── stock.js            # Stock management
│   └── ai-categorizer.js   # AI categorization helper
├── backend/
│   ├── server.js           # Express server
│   ├── auth.js             # Authentication endpoints
│   ├── stock-routes.js     # Stock API endpoints
│   ├── ai-service.js       # AI categorization service
│   └── database.js         # Database connection & queries
└── docs/
    └── SETUP.md            # Setup instructions
```

## Stock Management Features

### Stock List Format
- **Location** — where item is stored (warehouse, office, etc.)
- **Item Name** — product name
- **Serial Number** — unique identifier (SW-198728392328)
- **Quantity** — number in stock
- **Brand** — manufacturer (Apple, Samsung, etc.)
- **Category** — auto-detected by AI (washing machine, iPhone, laptop, etc.)
- **Last Updated** — timestamp of last change

### AI Categorization
When the server is not in use, the AI helper:
1. Analyzes item names and serial numbers
2. Auto-suggests product category (e.g., "iPhone" → Electronics/Smartphones)
3. Auto-identifies brand (e.g., "iPhone XS" → Apple)
4. Helps staff verify and organize inventory

### Search & Filter
- Search by **Location** (warehouse A, office B, etc.)
- Search by **Type/Category** (washing machine, electronics, etc.)
- Search by **Serial Number** (SW-198728392328)
- Filter by **Brand** (Apple, Samsung, LG, etc.)

## Getting Started

### Prerequisites
- Node.js 14+
- MySQL/SQLite
- Cloudflare Tunnel account (for secure database connection)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Kit-Url/Dev-Flow.git
cd Dev-Flow
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables (`.env`)
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASS=your_database_password
DB_NAME=dev_flow
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_ai_api_key
CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token
```

4. Start the backend server
```bash
npm start
```

5. Open `index.html` in browser and login

## Usage

1. **Login** with company credentials
2. **Navigate** to Stock List to manage inventory
3. **Add items** with location, name, serial number, quantity
4. **AI categorizes** items automatically (brand + category)
5. **Search** by location, type, or serial number
6. **Export** reports as needed
7. All actions logged in audit trail

## Security

- ✅ End-to-end encryption via Cloudflare Tunnel
- ✅ Database verified before connection
- ✅ No RDP required
- ✅ Role-based access control
- ✅ Audit logging of all activities
- ✅ Password hashing & JWT tokens
- ✅ HTTPS/TLS enforcement

## Support

For issues or questions, contact your IT administrator or create an issue in the repository.
