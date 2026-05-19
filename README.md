# Stock Portfolio Engine

Build personalized stock portfolios with live market data, strategy-based allocation, portfolio history, analytics, and PDF reporting.

## Overview

Stock Portfolio Engine is a full-stack portfolio builder for CMPE-285. Users enter an investment amount, choose one or two investment strategies, configure allocation rules, and receive a portfolio built from live Yahoo Finance market data.

The app includes:

- A React and TypeScript frontend with a dashboard, portfolio builder, analytics view, settings panel, and export tools.
- A Flask backend that fetches current prices and 5-day trends through `yfinance`.
- Browser persistence for the active portfolio, user name, and saved portfolio history.
- PDF, email, and clipboard sharing workflows for generated portfolios.

## Latest Updates

- Saved portfolio history now supports **10 previous portfolios**.
- Settings now shows the saved-history count as `N of 10 slots used`.
- The old Settings sentence about local-storage persistence was removed from the UI.
- Total Return now compares current value against the initial investment and preserves small negative percentages instead of displaying `-0.00%`.
- Portfolio values can be refreshed manually and are refreshed automatically while the dashboard is open.
- Current value, Total Return, exported reports, history cards, dashboard KPIs, and analytics now use the corrected return direction and percentage formatting.

## Prerequisites

- Node.js v18 or higher
- Python v3.9 or higher
- Internet access for live Yahoo Finance data

## How to Run

Run the backend and frontend in separate terminals.

### Terminal 1: Backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

Backend URL:

```text
http://localhost:5001
```

Health check:

```text
http://localhost:5001/health
```

### Terminal 2: Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend URL:

```text
http://localhost:8080
```

The frontend uses `http://localhost:5001` as the default API base URL. To override it, set `VITE_API_BASE_URL` before starting Vite.

## Core User Flow

1. Enter an investment amount of at least `$5,000`.
2. Select one or two strategies.
3. Choose allocation settings:
   - Strategy split: Equal Split or Random Split
   - Stock split: Equal Stock Split or Random Stock Split
4. Generate the portfolio.
5. Review dashboard KPIs, holdings, charts, recommendations, and analytics.
6. Refresh prices manually or wait for dashboard auto-refresh.
7. Export the portfolio to PDF, share by email, or copy a summary.
8. Load prior portfolios from the saved history list.

## Investment Strategies

The backend supports five strategies:

| Strategy | Holdings |
|---|---|
| Ethical Investing | AAPL, ADBE, NSRGY |
| Growth Investing | AMZN, TSLA, GOOGL |
| Index Investing | VTI, IXUS, ILTB |
| Quality Investing | MSFT, JNJ, PG |
| Value Investing | BRK-B, KO, XOM |

Users can select up to two strategies per portfolio. Selecting a third strategy is blocked with a toast message.

## Validation and Calculation Notes

- The minimum investment is `$5,000`.
- There is no maximum investment limit.
- Share quantities are rounded to 2 decimals, so the final current value may differ slightly from the initial investment.
- Total Return is calculated as:

```text
((current portfolio value - initial investment) / initial investment) * 100
```

- Return direction is based on dollar comparison against the initial investment.
- Very small losses display as an actual negative percentage, such as `-0.0034%`, instead of `-0.00%`.
- If the backend is unavailable, the frontend can fall back to simulated portfolio data so the UI remains usable.

## Persistence and Settings

The app stores the following in the browser:

- `portfolioUserName`
- `currentPortfolio`
- `portfolioHistory`

Portfolio history is saved newest first and keeps up to 10 previous portfolios. In Settings, the Portfolio Data section shows the current count, for example:

```text
1 of 10 slots used
```

Users can clear all saved portfolio history from Settings.

## Analytics and Reporting

The Market Analytics view includes:

- Portfolio summary cards
- Allocation donut chart
- Strategy comparison chart
- Holdings performance table
- Best and worst intraday movers
- Market heatmap

Portfolio reports include:

- Initial investment
- Current value
- Total Return percentage
- Selected strategies
- Holdings table
- Weekly performance trend

Reports can be downloaded as PDF. Users can also share by email or copy a text summary to the clipboard.

## Backend API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Basic health check |
| `POST` | `/api/portfolio` | Generate a strategy-based portfolio |
| `POST` | `/api/refresh-prices` | Refresh prices for an existing portfolio |
| `GET` | `/api/market-ticker` | Fetch market ticker snapshot |
| `GET` | `/api/recommendations` | Fetch recommendation cards with live prices |

### Sample Portfolio Request

```bash
curl -X POST http://localhost:5001/api/portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "investment": 10000,
    "strategies": ["Growth Investing", "Value Investing"],
    "split_strategy": true,
    "split_equally": true
  }'
```

### Sample Portfolio Response Shape

```json
{
  "results": [
    {
      "strategy": "Growth Investing",
      "total_value": 4999.52,
      "portfolio": {
        "AMZN": {
          "allocation": 1700,
          "allocation_percentage": 0.34,
          "price": 218.94,
          "shares": 7.76,
          "change": 1.15
        }
      }
    }
  ],
  "overall_total_value": 9998.94,
  "weekly_trend": [
    {
      "day": "May 15",
      "value": 9987.42
    }
  ]
}
```

## Project Structure

```text
StockPortfolioEngine/
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   `-- README.md
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   `-- pages/
|   |-- package.json
|   `-- vite.config.ts
|-- assets/
|   |-- reports/
|   `-- screenshots/
|-- TEST_CASES.md
|-- DEMO_SCRIPT_3_PERSON.md
`-- REQUIREMENTS.md
```

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- jsPDF

Backend:

- Flask
- Flask-CORS
- yfinance
- Plotly

## Testing and Demo Materials

- `TEST_CASES.md` contains the 10 manual test cases for validation, strategy mapping, allocation behavior, history, analytics, live pricing, and PDF export.
- `DEMO_SCRIPT_3_PERSON.md` splits the demo across three presenters and reflects the latest 10-slot history and negative-return display behavior.
