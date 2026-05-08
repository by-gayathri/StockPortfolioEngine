# Backend (Flask) for Smart Portfolio Builder

## Quick start
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use .venv\Scripts\activate
pip install -r requirements.txt
python app.py  # Starts on http://localhost:5001
```

## Configuration
- `PORT` (default `5001`) to change the listen port.
- `FLASK_DEBUG=true` to enable debug mode.
- `SECRET_KEY` to override the Flask secret key.

## API
- `POST /api/portfolio`
  - Body: `{"investment": 10000, "strategies": ["Growth Investing"], "split_equally": true, "split_strategy": true}`
  - Returns portfolio breakdown, per-stock Plotly graph JSON, and weekly aggregated trend.
- `GET /api/market-ticker`
  - Returns `{ "market_ticker": { "AAPL": { "price": 123.45, "change": 1.23 }, ... } }`
- `GET /health` health check.

## Notes
- Uses live data via `yfinance`; network access is required.
- CORS is enabled for `/api/*` to allow the Vite frontend to call this backend.

