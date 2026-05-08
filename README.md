# Stock Portfolio Builder

Build personalized stock portfolios with real-time data and weekly trend analysis.

## Prerequisites

-   **Node.js** (v18 or higher)
-   **Python** (v3.9 or higher)

## How to Run

You need **2 terminals** - one for backend, one for frontend.

### Terminal 1: Start Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

Backend runs at: `http://localhost:5001`

### Terminal 2: Start Frontend

```bash
# From project root
cd frontend

npm install
npm run dev
```

Frontend runs at: `http://localhost:8080`

## Features

-   5 investment strategies (Ethical, Growth, Index, Quality, Value)
-   Real-time stock prices from Yahoo Finance
-   Weekly trend charts (5-day history)
-   Automatic portfolio allocation
-   PDF export and email sharing

## Project Structure

```
StockPortfolio-285Project/
├── backend/
│   ├── app.py           # Flask API
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── components/  # React components
│       └── lib/         # API integration
└── package.json
```

## Tech Stack

**Frontend**: React, TypeScript, Tailwind CSS, Recharts  
**Backend**: Flask, yfinance, Plotly
