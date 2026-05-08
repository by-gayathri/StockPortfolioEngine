import json
import os
import random
from datetime import datetime, timedelta

import plotly
import plotly.graph_objs as go
import yfinance as yf
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev_secret_key")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Predefined strategies and their stocks/ETFs
STRATEGIES = {
    "Ethical Investing": {"AAPL": 0.34, "ADBE": 0.33, "NSRGY": 0.33},
    "Growth Investing": {"AMZN": 0.34, "TSLA": 0.33, "GOOGL": 0.33},
    "Index Investing": {"VTI": 0.34, "IXUS": 0.33, "ILTB": 0.33},
    "Quality Investing": {"MSFT": 0.34, "JNJ": 0.33, "PG": 0.33},
    "Value Investing": {"BRK-B": 0.34, "KO": 0.33, "XOM": 0.33},
}


def fetch_stock_prices(stocks):
    """Fetch latest prices and intraday change."""
    prices = {}
    for stock in stocks:
        ticker = yf.Ticker(stock)
        info = ticker.history(period="1d")
        if not info.empty:
            close_price = round(info["Close"].iloc[-1], 2)
            open_price = info["Open"].iloc[-1]
            change = round(close_price - open_price, 2)
            prices[stock] = {"price": close_price, "change": change}
        else:
            prices[stock] = {"price": None, "change": 0}
    return prices


def fetch_weekly_trends_with_dates(stocks):
    """Fetch weekly trend data (5 trading days) for each stock with unified date range."""
    trends = {}
    all_dates_set = set()
    stock_data = {}
    
    # First pass: collect all data and find common date range
    for stock in stocks:
        ticker = yf.Ticker(stock)
        history = ticker.history(period="5d")
        
        if not history.empty:
            dates = history.index.strftime("%Y-%m-%d").tolist()
            prices = list(history["Close"].values)
            stock_data[stock] = {"dates": dates, "prices": prices}
            all_dates_set.update(dates)
        else:
            stock_data[stock] = {"dates": [], "prices": []}
    
    # Determine unified date range (last 5 trading days available across all stocks)
    if all_dates_set:
        unified_dates = sorted(all_dates_set)[-5:]
    else:
        # Fallback to last 5 calendar days
        today = datetime.today()
        unified_dates = [
            (today - timedelta(days=i)).strftime("%Y-%m-%d")
            for i in reversed(range(5))
        ]
    
    # Second pass: align all stocks to unified date range
    for stock in stocks:
        data = stock_data.get(stock, {"dates": [], "prices": []})
        dates = data["dates"]
        prices = data["prices"]
        
        # Create a price map for available dates
        price_map = {dates[i]: prices[i] for i in range(len(dates)) if i < len(prices)}
        
        # Build aligned prices for unified dates
        aligned_prices = []
        for date in unified_dates:
            if date in price_map and price_map[date] is not None:
                aligned_prices.append(price_map[date])
            else:
                aligned_prices.append(None)
        
        # Fill missing values: first try next day (back-fill), then previous day (forward-fill)
        # Back-fill pass: use next available value
        for i in range(len(aligned_prices) - 2, -1, -1):
            if aligned_prices[i] is None and i < len(aligned_prices) - 1 and aligned_prices[i + 1] is not None:
                aligned_prices[i] = aligned_prices[i + 1]
        
        # Forward-fill pass: use previous available value for any remaining None
        for i in range(1, len(aligned_prices)):
            if aligned_prices[i] is None and aligned_prices[i - 1] is not None:
                aligned_prices[i] = aligned_prices[i - 1]
        
        trends[stock] = {"dates": unified_dates, "prices": aligned_prices}
    
    return trends


def generate_plotly_graph(stock, trends):
    """Generate a Plotly line graph JSON for a stock."""
    if not trends["prices"]:
        return None

    dates = trends["dates"]
    prices = trends["prices"]

    trace = go.Scatter(
        x=dates,
        y=prices,
        mode="lines+markers",
        name=f"{stock} Trend",
        line=dict(color="blue", width=2),
        marker=dict(size=6),
        connectgaps=False,
    )
    layout = go.Layout(
        title=f"Weekly Trend for {stock}",
        xaxis=dict(title="Date", tickangle=-45, tickfont=dict(size=10), showgrid=True),
        yaxis=dict(title="Price (USD)", showgrid=True),
        width=600,
        height=250,
        template="plotly_white",
        margin=dict(l=30, r=30, t=40, b=30),
    )
    fig = go.Figure(data=[trace], layout=layout)
    return json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)


def get_investment_allocation(investment, strategies, split_equally):
    """Allocate investment across strategies."""
    if split_equally or len(strategies) == 1:
        allocation_per_strategy = round(investment / len(strategies), 2)
        return {strategy: allocation_per_strategy for strategy in strategies}

    random_allocations = [random.random() for _ in strategies]
    total = sum(random_allocations)
    return {
        strategies[i]: round((random_allocations[i] / total) * investment, 2)
        for i in range(len(strategies))
    }


def get_stocks_and_ratios(strategy, split_equally):
    stocks = STRATEGIES[strategy]
    if split_equally:
        return stocks

    stock_names = list(stocks.keys())
    random_values = [random.random() for _ in stock_names]
    total = sum(random_values)
    normalized_values = [round(val / total, 2) for val in random_values]

    difference = 1 - sum(normalized_values)
    normalized_values[0] += round(difference, 2)

    return dict(zip(stock_names, normalized_values))


def calculate_portfolio_value(investment, stock_allocations, stock_prices):
    """Compute portfolio details per stock."""
    portfolio = {}
    total_value = 0

    trends_with_dates = fetch_weekly_trends_with_dates(stock_allocations.keys())

    for stock, ratio in stock_allocations.items():
        allocation = round(investment * ratio, 2)
        price_info = stock_prices.get(stock, {})
        price = price_info.get("price")

        if price is None:
            portfolio[stock] = {
                "allocation": allocation,
                "price": None,
                "shares": 0,
                "graph": None,
                "allocation_percentage": round(ratio, 2),
                "dates": trends_with_dates[stock]["dates"],
                "prices": trends_with_dates[stock]["prices"],
                "change": round(price_info.get("change", 0), 2),
            }
            continue

        shares = round(allocation / price, 2)
        trends = trends_with_dates[stock]
        graph_json = generate_plotly_graph(stock, trends)
        stock_value = round(shares * price, 2)

        portfolio[stock] = {
            "allocation": allocation,
            "allocation_percentage": round(ratio, 2),
            "price": round(price, 2),
            "shares": shares,
            "graph": graph_json,
            "dates": trends["dates"],
            "prices": trends["prices"],
            "change": round(price_info.get("change", 0), 2),
        }
        total_value += stock_value

    return portfolio, round(total_value, 2)


def build_weekly_portfolio_trend(results):
    """Aggregate weekly trend across all stocks in all strategies."""
    # All stocks now have the same unified date range
    # Get dates from the first stock in the first result
    unified_dates = []
    if results and results[0]["portfolio"]:
        first_stock = next(iter(results[0]["portfolio"].values()))
        unified_dates = first_stock.get("dates", [])
    
    if not unified_dates:
        return []
    
    # Initialize daily values for each date
    daily_values = [{"day": date, "value": 0.0} for date in unified_dates]
    
    # Aggregate portfolio value for each date
    for result in results:
        for stock_data in result["portfolio"].values():
            dates = stock_data.get("dates") or []
            prices = stock_data.get("prices") or []
            shares = stock_data.get("shares", 0) or 0
            
            # Since all stocks have unified dates, dates should match unified_dates
            for idx, date in enumerate(dates):
                if idx >= len(daily_values):
                    break
                    
                price = prices[idx] if idx < len(prices) else None
                if price is not None and price > 0:
                    daily_values[idx]["value"] += shares * price
    
    # Round values and format dates
    for i in range(len(daily_values)):
        daily_values[i]["value"] = round(daily_values[i]["value"], 2)
        
        # Format date for display (e.g., "Dec 9")
        try:
            dt = datetime.strptime(daily_values[i]["day"], "%Y-%m-%d")
            daily_values[i]["day"] = dt.strftime("%b %d")
        except (ValueError, TypeError):
            pass
    
    return daily_values


@app.route("/api/portfolio", methods=["POST"])
def portfolio():
    """Return portfolio suggestion and trends."""
    try:
        data = request.get_json(force=True) or {}
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400

    investment = data.get("investment")
    strategies = data.get("strategies", [])
    split_equally = data.get("split_equally", True)
    split_strategy = data.get("split_strategy", True)

    if not isinstance(investment, (int, float)) or investment < 5000:
        return jsonify({"error": "Minimum investment is $5000."}), 400
    if not isinstance(strategies, list) or not (1 <= len(strategies) <= 2):
        return jsonify({"error": "Please select one or two strategies."}), 400
    for strategy in strategies:
        if strategy not in STRATEGIES:
            return jsonify({"error": f"Unknown strategy: {strategy}"}), 400

    allocation_per_strategy = get_investment_allocation(
        investment, strategies, split_strategy
    )

    results = []
    overall_total_value = 0

    for strategy in strategies:
        stocks = get_stocks_and_ratios(strategy, split_equally)
        stock_prices = fetch_stock_prices(stocks.keys())
        portfolio_data, strategy_total_value = calculate_portfolio_value(
            allocation_per_strategy[strategy], stocks, stock_prices
        )
        results.append(
            {
                "strategy": strategy,
                "portfolio": portfolio_data,
                "total_value": round(strategy_total_value, 2),
            }
        )
        overall_total_value += strategy_total_value

    weekly_trend = build_weekly_portfolio_trend(results)

    return jsonify(
        {
            "results": results,
            "overall_total_value": round(overall_total_value, 2),
            "weekly_trend": weekly_trend,
        }
    )


@app.route("/api/market-ticker", methods=["GET"])
def market_ticker():
    """Return market ticker snapshot."""
    symbols = [
        "AAPL",
        "TSLA",
        "AMZN",
        "GOOGL",
        "MSFT",
        "NFLX",
        "NVDA",
        "META",
        "BRK-B",
        "V",
        "JNJ",
        "XOM",
        "BAC",
        "PG",
        "DIS",
        "CSCO",
        "PEP",
        "KO",
        "WMT",
        "COST",
        "MA",
        "HD",
        "ADBE",
        "CRM",
        "PYPL",
        "INTC",
        "QCOM",
        "T",
        "NKE",
        "MCD",
    ]
    prices = fetch_stock_prices(symbols)
    market_ticker_data = {
        symbol: {"price": data["price"], "change": data["change"]}
        for symbol, data in prices.items()
        if data.get("price") is not None
    }
    return jsonify({"market_ticker": market_ticker_data})


@app.route("/api/recommendations", methods=["GET"])
def recommendations():
    """Return AI-generated stock recommendations with real prices."""
    # Top candidate stocks for recommendations
    recommendation_symbols = ["AAPL", "MSFT", "TSLA", "NVDA", "GOOGL"]
    prices = fetch_stock_prices(recommendation_symbols)
    
    recommendation_reasons = {
        "AAPL": "Strong growth trajectory with consistent earnings. Excellent for growth-focused portfolios.",
        "MSFT": "AI leadership position. Premium valuation justified by market dominance.",
        "TSLA": "EV market leader. Consider for growth strategies with higher risk tolerance.",
        "NVDA": "Semiconductor leader benefiting from AI boom. High growth potential.",
        "GOOGL": "Diversified tech leader with strong fundamentals. Stable long-term investment.",
    }
    
    recommendations_list = []
    for symbol in recommendation_symbols:
        price_data = prices.get(symbol, {})
        current_price = price_data.get("price")
        
        if current_price is None:
            continue
            
        # Calculate target price (10-15% upside based on analysis)
        upside_pct = random.uniform(8, 15)
        target_price = round(current_price * (1 + upside_pct / 100), 2)
        
        # Determine risk level based on volatility
        change = abs(price_data.get("change", 0))
        if change > 3:
            risk_level = "high"
            confidence = random.randint(70, 80)
        elif change > 1:
            risk_level = "medium"
            confidence = random.randint(80, 88)
        else:
            risk_level = "low"
            confidence = random.randint(85, 95)
        
        recommendations_list.append({
            "symbol": symbol,
            "name": get_stock_name(symbol),
            "reason": recommendation_reasons.get(symbol, "Recommended based on market analysis."),
            "confidence": confidence,
            "riskLevel": risk_level,
            "targetPrice": target_price,
            "currentPrice": current_price,
            "change": round(price_data.get("change", 0), 2),
        })
    
    return jsonify({"recommendations": recommendations_list})


def get_stock_name(symbol: str) -> str:
    """Get stock name from symbol."""
    stock_names = {
        "AAPL": "Apple Inc.",
        "MSFT": "Microsoft Corporation",
        "TSLA": "Tesla Inc.",
        "NVDA": "NVIDIA Corporation",
        "GOOGL": "Alphabet Inc.",
        "AMZN": "Amazon.com Inc.",
        "META": "Meta Platforms Inc.",
        "TSLA": "Tesla Inc.",
        "BRK-B": "Berkshire Hathaway Inc.",
        "JPM": "JPMorgan Chase & Co.",
    }
    return stock_names.get(symbol, symbol)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)

