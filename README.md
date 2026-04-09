# Portfolio Tracker - Net Worth Management Dashboard

A professional, Dribbble-grade financial portfolio management dashboard where you can track assets and liabilities over time, view beautiful charts, and get insights into your financial health.

![Portfolio Tracker](https://img.shields.io/badge/React-18.2-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## 🌐 Live Demo

- **Frontend**: [https://financial-portfolio-delta.vercel.app](https://financial-portfolio-delta.vercel.app)
- **Backend API**: [https://portfolio-api-vne0.onrender.com/docs](https://portfolio-api-vne0.onrender.com/docs)

## Features

### Dashboard (Home)
- **Side-by-Side Layout**: Desktop-optimized two-column layout
- **Allocation Chart**: Interactive donut chart showing portfolio distribution by category
- **Net Worth Trend Chart**: Advanced area chart with gradient fill showing portfolio growth over time
  - Time range selector (6M, YTD, 1Y, 2Y, All)
  - Trend indicator with percentage change
  - Hover tooltips with detailed breakdown
  - Statistics row (Highest, Average, Lowest)
- **Net Worth Display**: Real-time total net worth calculation
- **Assets & Liabilities Grid**: 
  - Responsive 3-column grid on desktop
  - Sparkline graphs for each item
  - Change vs last entry (amount + percentage)
  - Sort by highest value, name, or recently updated
  - Filter by tags
  - Search functionality

### Item Detail
- **Time-Series Chart**: Interactive chart with range selection (All, 6M, YTD, 1Y, 2Y, 5Y)
- **Hover to see values**: Detailed tooltips on hover
- **Entry History**: Full history of all value entries (sorted newest first)
- **Pagination**: "Show More" button for large entry lists
- **Add/Edit/Delete**: Manage entries over time

### Insights Tab
- **Total Net Worth**: Current total value
- **Current Month Change**: How much net worth changed this month
- **Avg Monthly Savings**: Average month-over-month increase
- **All-Time High**: Highest net worth achieved
- **Biggest Gainer/Loser**: Best and worst performing assets
- **Liability-to-Asset Ratio**: Financial health indicator
- **Monthly Savings Bar Chart**: Visualize savings trends
- **Quarterly Savings Bar Chart**: Track quarterly performance
- **Asset Allocation Pie Chart**: With annotated percentages

### Authentication
- **User Registration**: Create account with email/password
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: All data is user-specific

### General
- **User-defined categories**: Add any asset or liability (Stocks, PPF, EPF, Mutual Funds, Real Estate, Crypto, Credit Cards, etc.)
- **Tags**: Color-coded tags for organization
- **Dark mode**: Professional dark theme by default
- **Responsive**: Works on desktop and mobile
- **Smooth animations**: Framer Motion powered transitions

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for blazing fast dev experience
- TailwindCSS for styling
- Recharts for interactive charts
- Framer Motion for animations
- React Router for navigation
- Lucide React for icons

### Backend
- Python FastAPI
- PostgreSQL database (production) / SQLite (local development)
- SQLAlchemy ORM
- Pydantic for validation
- JWT authentication with bcrypt password hashing

### Deployment
- **Frontend**: Vercel
- **Backend**: Render.com
- **Database**: Render PostgreSQL

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+

### Backend Setup

```bash
cd backend

python -m venv venv

# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

pip install -r requirements.txt

python main.py
```

The backend will start at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

The frontend will start at `http://localhost:5173`.

### Environment Variables

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:8000/api
```

**Backend** (for PostgreSQL - optional):
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

## API Documentation

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": null,
  "created_at": "2026-04-09T10:00:00.000000"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": null,
  "created_at": "2026-04-09T10:00:00.000000"
}
```

### Tags

#### List Tags
```http
GET /api/tags
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Stocks",
    "color": "#3b82f6",
    "created_at": "2026-04-09T10:00:00.000000"
  },
  {
    "id": 2,
    "name": "Retirement",
    "color": "#10b981",
    "created_at": "2026-04-09T10:00:00.000000"
  }
]
```

#### Create Tag
```http
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mutual Funds",
  "color": "#8b5cf6"
}
```

**Response:**
```json
{
  "id": 3,
  "name": "Mutual Funds",
  "color": "#8b5cf6",
  "created_at": "2026-04-09T10:00:00.000000"
}
```

### Items (Assets/Liabilities)

#### List Items
```http
GET /api/items
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Indian Stocks",
    "type": "asset",
    "currency": "INR",
    "icon": null,
    "tags": [{"id": 1, "name": "Stocks", "color": "#3b82f6"}],
    "entries": [...],
    "created_at": "2026-04-09T10:00:00.000000",
    "updated_at": "2026-04-09T10:00:00.000000"
  }
]
```

#### Create Item
```http
POST /api/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "SBI PPF",
  "type": "asset",
  "currency": "INR",
  "tag_ids": [2]
}
```

**Response:**
```json
{
  "id": 2,
  "name": "SBI PPF",
  "type": "asset",
  "currency": "INR",
  "icon": null,
  "tags": [{"id": 2, "name": "Retirement", "color": "#10b981"}],
  "entries": [],
  "created_at": "2026-04-09T10:00:00.000000",
  "updated_at": "2026-04-09T10:00:00.000000"
}
```

#### Update Item
```http
PUT /api/items/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "SBI PPF Account",
  "tag_ids": [2, 3]
}
```

### Entries

#### Add Entry
```http
POST /api/items/{item_id}/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 917000,
  "date": "2026-04-08",
  "note": "Monthly update"
}
```

**Response:**
```json
{
  "id": 1,
  "item_id": 2,
  "amount": 917000.0,
  "date": "2026-04-08T00:00:00",
  "note": "Monthly update",
  "created_at": "2026-04-09T10:00:00.000000"
}
```

#### Update Entry
```http
PUT /api/entries/{entry_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 920000,
  "note": "Corrected amount"
}
```

### Dashboard

#### Get Dashboard Summary
```http
GET /api/dashboard?sort_by=value&sort_order=desc&tag_id=1&search=stocks
Authorization: Bearer <token>
```

**Query Parameters:**
- `sort_by`: `value` | `name` | `updated`
- `sort_order`: `asc` | `desc`
- `tag_id`: Filter by tag ID
- `search`: Search term

**Response:**
```json
{
  "total_assets": 4247582.0,
  "total_liabilities": 0.0,
  "net_worth": 4247582.0,
  "allocation": [
    {"name": "Stocks", "value": 1026832.0, "color": "#3b82f6"},
    {"name": "Retirement", "value": 1867000.0, "color": "#10b981"},
    {"name": "Mutual Funds", "value": 1113000.0, "color": "#8b5cf6"}
  ],
  "items": [
    {
      "id": 1,
      "name": "Indian Stocks",
      "type": "asset",
      "currency": "INR",
      "tags": [...],
      "current_value": 1026832.0,
      "previous_value": 1022000.0,
      "change_amount": 4832.0,
      "change_percent": 0.47,
      "last_updated": "2026-04-08",
      "sparkline": [980000, 1010000, 1022000, 1026832]
    }
  ]
}
```

### Insights

#### Get Insights Summary
```http
GET /api/insights
Authorization: Bearer <token>
```

**Response:**
```json
{
  "net_worth": 4247582.0,
  "month_change": 125000.0,
  "month_change_percent": 3.03,
  "avg_monthly_savings": 85000.0,
  "all_time_high": 4247582.0,
  "all_time_high_date": "2026-04-09T10:00:00.000000Z",
  "biggest_gainer": {
    "name": "Grow Mutual Fund",
    "change_percent": 12.5,
    "change_amount": 52000.0
  },
  "biggest_loser": {
    "name": "NPS",
    "change_percent": -2.1,
    "change_amount": -4500.0
  },
  "liability_ratio": 0.0,
  "monthly_savings": [
    {"month": "May", "savings": 45000.0},
    {"month": "Jun", "savings": 52000.0},
    ...
  ],
  "quarterly_savings": [
    {"quarter": "Q1 2026", "savings": 180000.0},
    {"quarter": "Q2 2026", "savings": 125000.0}
  ]
}
```

### Net Worth History

#### Get Net Worth History
```http
GET /api/networth-history?range=1y
Authorization: Bearer <token>
```

**Query Parameters:**
- `range`: `6m` | `ytd` | `1y` | `2y` | `4y` | `5y` | `all`

**Response:**
```json
{
  "data": [
    {
      "date": "2024-12-04",
      "net_worth": 670335.0,
      "assets": 670335.0,
      "liabilities": 0
    },
    {
      "date": "2025-05-01",
      "net_worth": 3315000.0,
      "assets": 3315000.0,
      "liabilities": 0
    },
    {
      "date": "2026-04-08",
      "net_worth": 4247582.0,
      "assets": 4247582.0,
      "liabilities": 0
    }
  ]
}
```

### Time Series

#### Get Item Time Series
```http
GET /api/items/{item_id}/timeseries?range=1y
Authorization: Bearer <token>
```

**Response:**
```json
{
  "item_id": 1,
  "item_name": "Indian Stocks",
  "data": [
    {"date": "2024-12-04", "value": 670335.0},
    {"date": "2025-01-07", "value": 658268.0},
    {"date": "2025-06-02", "value": 841500.0},
    {"date": "2026-04-08", "value": 1026832.0}
  ]
}
```

## Project Structure

```
Financial-Portfolio/
├── backend/
│   ├── main.py          # FastAPI application & routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py      # Database configuration
│   ├── auth.py          # Authentication logic
│   ├── requirements.txt
│   ├── Procfile         # Render deployment
│   └── render.yaml      # Render configuration
├── frontend/
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # Reusable components
│   │   │   ├── AddItemModal.tsx
│   │   │   ├── AddEntryModal.tsx
│   │   │   ├── AllocationChart.tsx
│   │   │   ├── EditItemModal.tsx
│   │   │   ├── EditEntryModal.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── NetWorthTrendChart.tsx
│   │   │   ├── Sparkline.tsx
│   │   │   └── TimeSeriesChart.tsx
│   │   ├── context/     # React context
│   │   │   └── AuthContext.tsx
│   │   ├── pages/       # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Insights.tsx
│   │   │   ├── ItemDetail.tsx
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Signup.tsx
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env             # Local environment
│   ├── .env.production  # Production environment
│   ├── package.json
│   ├── vercel.json      # Vercel configuration
│   └── tailwind.config.js
├── .gitignore
└── README.md
```

## Screenshots

The app features a dark, professional UI with:
- Side-by-side layout with allocation pie chart and net worth trend chart
- Interactive gradient area chart showing portfolio growth
- Sparkline graphs in the asset list
- Smooth animations and transitions
- Glass morphism effects
- Responsive grid layout for assets

## License

MIT
