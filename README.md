# Portfolio Tracker - Net Worth Management Dashboard

A professional, Dribbble-grade financial portfolio management dashboard where you can track assets and liabilities over time, view beautiful charts, and get insights into your financial health.

![Portfolio Tracker](https://img.shields.io/badge/React-18.2-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

## Features

### Dashboard (Home)
- **Allocation Chart**: Interactive donut chart showing portfolio distribution
- **Net Worth Display**: Real-time total net worth calculation
- **Assets & Liabilities List**: 
  - Sparkline graphs for each item
  - Change vs last entry (amount + percentage)
  - Sort by highest value, name, or recently updated
  - Filter by tags
  - Search functionality

### Item Detail
- **Time-Series Chart**: Interactive chart with range selection (All, 6M, YTD, 1Y, 2Y, 5Y)
- **Hover to see values**: Detailed tooltips on hover
- **Entry History**: Full history of all value entries
- **Add/Edit/Delete**: Manage entries over time

### Insights Tab
- **Total Net Worth**: Current total value
- **Current Month Change**: How much net worth changed this month
- **Avg Monthly Savings**: Average month-over-month increase
- **All-Time High**: Highest net worth achieved
- **Biggest Gainer/Loser**: Best and worst performing assets
- **Liability-to-Asset Ratio**: Financial health indicator

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
- SQLite database (via SQLAlchemy)
- Pydantic for validation

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The backend will start at `http://localhost:8000`.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`.

### Quick Start (Both)

**Terminal 1 - Backend:**
```bash
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm install && npm run dev
```

Then open `http://localhost:5173` in your browser.

## API Endpoints

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create a tag
- `DELETE /api/tags/{id}` - Delete a tag

### Items (Assets/Liabilities)
- `GET /api/items` - List all items
- `GET /api/items/{id}` - Get item details
- `POST /api/items` - Create item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

### Entries
- `GET /api/items/{id}/entries` - List entries for an item
- `POST /api/items/{id}/entries` - Add entry
- `PUT /api/entries/{id}` - Update entry
- `DELETE /api/entries/{id}` - Delete entry

### Dashboard & Insights
- `GET /api/dashboard` - Get dashboard summary (supports sorting, filtering)
- `GET /api/insights` - Get insights summary
- `GET /api/items/{id}/timeseries` - Get time series data with range

### Utility
- `POST /api/seed` - Seed sample data (for development)

## Project Structure

```
Financial-Portfolio/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py      # Database configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Utility functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Screenshots

The app features a dark, professional UI with:
- Interactive pie chart for asset allocation
- Sparkline graphs in the asset list
- Smooth animations and transitions
- Glass morphism effects
- Responsive layout

## License

MIT
