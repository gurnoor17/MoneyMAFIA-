# moneyMafia - Personal Finance Tracker

moneyMafia is a production-ready, feature-rich Personal Finance Tracker built using **React**, **Node.js/Express**, and **PostgreSQL**. It features a modern, responsive fintech-style glassmorphic user interface supporting dark and light themes, detailed spending analytics graphs, automated category budget trackers, CSV reports exports, user profile updates, and recurring transaction automations.

## Repository Folder Structure

```
finance-tracker/
├── backend/
│   ├── config/
│   │   ├── db.js             # PostgreSQL connection pool configuration
│   │   └── schema.sql        # Database tables schema and indexes setup
│   ├── controllers/
│   │   ├── authController.js        # User signup, login, session validation
│   │   ├── budgetController.js      # Budget limits CRUD & alert triggers
│   │   ├── dashboardController.js   # Analytics aggregating, chart feeds, AI suggestions
│   │   ├── profileController.js     # Profile details, stats, password reset, account deletion
│   │   └── transactionController.js # Transaction CRUD, advanced filter queries, CSV exporting
│   ├── middleware/
│   │   └── authMiddleware.js # Token authentication validator
│   ├── routes/
│   │   ├── auth.js           # Auth routes
│   │   ├── budgets.js        # Budgets routes
│   │   ├── dashboard.js      # Dashboard routes
│   │   ├── profile.js        # Profile routes
│   │   └── transactions.js   # Transactions routes
│   ├── .env                  # Configuration variables
│   ├── package.json          # Node dependency definitions
│   └── server.js             # Server startup entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Theme toggle, navigation headers, alert dropdown
│   │   │   ├── Sidebar.jsx          # Sidebar links drawer
│   │   │   ├── TransactionModal.jsx # Add/edit transaction inputs modal
│   │   │   └── TransactionTable.jsx # Paginated, sortable transactions table
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Session state provider hook
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Stat cards, Recharts visualizations, notifications, insights
│   │   │   ├── Budgets.jsx          # Color-coded budget progress bars
│   │   │   ├── Login.jsx            # Sign-in page
│   │   │   ├── Profile.jsx          # User statistics, password change, account deletion
│   │   │   └── Register.jsx         # Sign-up page
│   │   ├── services/
│   │   │   └── api.js               # Central API call handler
│   │   ├── App.jsx                  # React Router routes, Protected route checker
│   │   ├── index.css                # Global fintech glassmorphic styles
│   │   └── main.jsx                 # App client bundle entry
│   └── package.json                 # Frontend dependencies (React Router, Recharts, Lucide)
└── README.md                        # This setup document
```

---

## Deployment & Setup Instructions

### 1. Database Configuration

Ensure PostgreSQL is running on your machine.
The database schema has already been applied to a database called `finance_tracker`.

To recreate or manually inspect the schema, you can run the schema file using `psql`:
```bash
cd backend
psql -d finance_tracker -f config/schema.sql
```

Ensure your backend `.env` matches your local database settings:
```env
PORT=5050
NODE_ENV=development
DB_USER=YOUR_POSTGRES_USER       # e.g., gurnoorsingh or postgres
DB_HOST=localhost
DB_DATABASE=finance_tracker
DB_PASSWORD=YOUR_PASSWORD       # Leave empty if not required locally
DB_PORT=5432
JWT_SECRET=super_secret_personal_finance_tracker_key_2026_secure
```

---

### 2. Backend Startup

Install node packages and run the express development server:
```bash
cd backend
npm install
npm run dev
```
The backend server will run on `http://localhost:5050`. You can test if it is up by visiting `http://localhost:5050/api/health`.

---

### 3. Frontend Startup

Install npm dependencies and launch the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
The web app will run locally (typically on `http://localhost:5173`).

---

## Technical Features Implemented

* **User Authentication**: Complete login, signup, password hashing via `bcryptjs`, and stateless session validation using `jsonwebtoken` route authorization wrappers.
* **Recurring Transactions**: Automatically checks and spawns recurring instances of logs (daily, weekly, monthly, yearly) on user session loading/fetches.
* **Category Budgeting**: Supports individual category limit targets with real-time expenditure calculations, warning triggers (> 80% usage), and overspent alerts.
* **Interactive Graphs (Recharts)**: Beautiful SVG analytics containing monthly cash flow bar comparisons, timeline line charts, and category breakdown pie graphs.
* **Data Portability**: Allows exporting structured ledger lists filtered by dates/search directly to comma-separated value (CSV) reports.
* **Fintech Glassmorphism Design**: Vanilla CSS theme offering seamless Dark & Light theme switches, card shadows, responsive mobile navbar menus, and smooth hover/action animations.
