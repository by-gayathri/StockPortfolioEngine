# Stock Portfolio Engine — Test Cases

**Course:** CMPE-285 | San José State University  
**Project:** Stock Portfolio Engine  
**Total Test Cases:** 10

---

## Important: $5,000 Minimum Investment Rule

The $5,000 minimum is enforced at **two layers**:

- **Frontend (InvestmentForm):** The "Continue" button on Step 1 fires a red toast and blocks navigation if the entered amount is below $5,000.
- **Backend (app.py):** The `/api/portfolio` endpoint returns HTTP 400 with `"Minimum investment is $5,000."` if the `investment` field is below 5000.

There is **no maximum** investment limit. All amounts ≥ $5,000 are accepted.

> **Note on share-rounding:** When a portfolio is generated, share quantities are rounded to 2 decimal places. As a result the displayed "Total Portfolio Value" will be a few cents less than the exact investment (e.g. $4,999.94 for a $5,000 investment). This is **correct and expected behavior** — it reflects real-world rounding when buying fractional shares. The "Total Return" indicator correctly shows a red `-0.00%` in this case rather than a misleading green `+0.00%`.

---

## Setup Instructions

Before running any test case, ensure both servers are running:

**Terminal 1 — Backend**
```bash
cd StockPortfolioEngine/backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
# Expected: "Running on http://0.0.0.0:5001"
```

**Terminal 2 — Frontend**
```bash
cd StockPortfolioEngine/frontend
npm install
npm run dev
# Expected: "Local: http://localhost:8080"
```

Open **http://localhost:8080** in a browser. Both servers must be running for live-price tests.

---

## Test Case 1 — Minimum Investment Validation (Below $5,000)

**Purpose:** Verify the system rejects investments below the $5,000 minimum.

**Steps:**
1. Navigate to http://localhost:8080.
2. Click **"Create Portfolio"** (the button in the center of the page).
3. In the "How much do you want to invest?" field, type `3000`.
4. Click **"Continue"**.

**Expected Result:**
- A red toast notification appears at the top of the screen: **"Invalid Amount — Please enter a minimum investment of $5,000."**
- The user remains on Step 1; the form does **not** advance to Step 2.
- The input field still shows `3000`.

---

## Test Case 2 — Minimum Investment Validation (Exactly $5,000)

**Purpose:** Verify that exactly $5,000 is accepted as a valid investment and the portfolio generates correctly.

**Steps:**
1. Navigate to http://localhost:8080 and click **"Create Portfolio"**.
2. Type `5000` in the investment field.
3. Observe the hint text that appears below the input.
4. Click **"Continue"**.
5. Select any strategy (e.g., **"Index Investing"**) → click **"Continue"**.
6. Leave allocation settings at default → click **"Generate Portfolio"**.
7. Wait for the results to load.

**Expected Result:**
- A green hint `✓ Valid amount: $5,000` appears below the input (informational only).
- Clicking Continue with `5000` advances to **Step 2** without an error.
- After generating, the **Total Portfolio Value** banner shows a value very close to (but possibly a few cents below) **$5,000** — this is correct behavior due to share rounding.
- The **Total Return** badge shows **red** `-0.00%` (not green), because the current value is slightly below the $5,000 invested.

---

## Test Case 3 — Single Strategy Selection (Ethical Investing)

**Purpose:** Verify a single strategy generates a portfolio with the correct stocks and displays live prices.

**Steps:**
1. Click **"Create Portfolio"** → enter `10000` → click **"Continue"**.
2. Click the **"Ethical Investing"** card (it highlights with a colored border when selected).
3. Click **"Continue"**.
4. Leave allocation at default → click **"Generate Portfolio"**.
5. Wait for results to load.

**Expected Result:**
- Portfolio results appear showing exactly **3 stock cards**: AAPL (Apple Inc.), ADBE (Adobe Inc.), NSRGY (Nestlé S.A.).
- Each card shows the current live price, number of shares purchased, allocation %, position value, and a 5-day mini price chart.
- The **Total Portfolio Value** at the top is close to $10,000.
- Clicking any stock symbol (e.g., **AAPL ↗**) opens that stock's Yahoo Finance page in a new browser tab.
- Scrolling down shows a **"Historical performance"** area chart with **5 data points** (one per trading day).

---

## Test Case 4 — Single Strategy Selection (Index Investing)

**Purpose:** Verify Index Investing maps to the correct ETFs and distributes the investment evenly.

**Steps:**
1. Click **"Create Portfolio"** → enter `20000` → click **"Continue"**.
2. Select **"Index Investing"** → click **"Continue"**.
3. Keep default allocation settings → click **"Generate Portfolio"**.

**Expected Result:**
- Exactly **3 ETF cards** are shown: **VTI** (Vanguard Total Stock Market ETF), **IXUS** (iShares Core MSCI Total Intl Stk), **ILTB** (iShares Core 10+ Year USD Bond).
- Each ETF receives approximately **33% of $20,000** (~$6,667 each).
- The investment of $20,000 is fully distributed — no unallocated amount remains.

---

## Test Case 5 — Two Strategies with Equal Split

**Purpose:** Verify that selecting two strategies divides the investment exactly 50/50, and that the Total Return sign is correct.

**Steps:**
1. Click **"Create Portfolio"** → enter `10000` → click **"Continue"**.
2. Click **"Growth Investing"** (1 of 2 selected).
3. Click **"Value Investing"** (2 of 2 selected — both cards now highlighted).
4. Try clicking a third strategy card (e.g., "Ethical Investing").
5. Click **"Continue"**.
6. On Step 3, select **"Equal Split"** → click **"Generate Portfolio"**.

**Expected Result:**
- Clicking the third strategy shows a red toast: **"Strategy Limit Reached — You can select a maximum of 2 strategies."**
- After generating, two sections appear in results: Growth Investing and Value Investing.
- **Growth Investing** stocks (AMZN, TSLA, GOOGL) have a combined allocation of exactly **$5,000 (50%)**.
- **Value Investing** stocks (BRK-B, KO, XOM) have a combined allocation of exactly **$5,000 (50%)**.
- The **Total Return** badge shows **green** if the current portfolio value exceeds $10,000, and **red** if it is below — reflecting actual market performance, not a rounded percentage quirk.

---

## Test Case 6 — Two Strategies with Random Split

**Purpose:** Verify that "Random Split" distributes the investment unevenly between strategies, and the total always equals the full investment.

**Steps:**
1. Click **"Create Portfolio"** → enter `10000` → click **"Continue"**.
2. Select **"Quality Investing"** and **"Ethical Investing"** → click **"Continue"**.
3. On Step 3, select **"Random Split"** → click **"Generate Portfolio"**.
4. Note the dollar amounts shown for each strategy in the results.
5. Click **"New Portfolio"** and repeat steps 1–4.

**Expected Result:**
- Each run produces a **different split** between the two strategies (e.g., 62%/38% one time, 45%/55% another).
- The **sum of both strategy allocations always equals exactly $10,000** — no money is lost or created.
- The stocks shown for each strategy are the correct ones (Quality: JNJ, MSFT, V — Ethical: AAPL, ADBE, NSRGY).

---

## Test Case 7 — Portfolio History (Save and Reload)

**Purpose:** Verify that previous portfolios are automatically saved and can be reloaded without losing data.

**Steps:**
1. Generate a portfolio: $10,000 → Growth Investing → Equal Split.
2. Note the **Total Portfolio Value** shown (e.g., "$9,998.50").
3. Click **"New Portfolio"**.
4. Verify the previous portfolio is still visible on screen while the form appears.
5. Generate a second portfolio: $15,000 → Index Investing → Equal Split.
6. After the new portfolio loads, scroll down or look for the **Portfolio History** section.
7. Find the first portfolio in the history list (labeled with the amount "$10,000" and timestamp).
8. Click **"Load"** on that entry.

**Expected Result:**
- After clicking "New Portfolio" in Step 3, the previous portfolio **remains visible** — it does not disappear.
- After generating the second portfolio, the first portfolio appears in the **Portfolio History panel** (showing its amount, timestamp, and return %).
- Clicking "Load" on the history entry **restores** the first portfolio as the active view — the stock cards, KPI values, and trend chart all match what was shown in Step 2.
- Up to **5 previous portfolios** are stored. Generating a 6th removes the oldest entry.

---

## Test Case 8 — Market Analytics Tab

**Purpose:** Verify the Market Analytics tab displays a complete analytics view of the current portfolio.

**Steps:**
1. Generate any portfolio (e.g., $15,000 → Quality Investing + Value Investing → Equal Split).
2. After results load, click the **"Market Analytics"** tab at the top of the page.
3. Review each section of the analytics view.
4. Hover over slices in the donut chart and bars in the bar chart.
5. Check the holdings table and find the "Best Movers" and "Worst Movers" panels.
6. Scroll to the bottom of the analytics view to find the market heatmap.

**Expected Result:**
- The analytics tab shows a **donut chart** displaying each stock's % share of the total portfolio — hovering shows the stock symbol and allocation %.
- A **bar chart** shows each strategy's "Allocated Amount" vs. "Current Value" side by side.
- A **holdings table** lists all stocks with columns: Symbol, Name, Strategy, Current Price, Shares, Allocation %, Value, Day Change %, and a small sparkline chart.
- The **Best Movers** panel shows the top 3 stocks with the highest positive intraday change (green).
- The **Worst Movers** panel shows the bottom 3 stocks with the largest negative intraday change (red).
- The **market heatmap** at the bottom shows a grid of ~30 stocks color-coded green (up) or red (down) based on their intraday performance.
- If no portfolio has been created yet, the analytics tab shows a prompt to create one first.

---

## Test Case 9 — Live Real-Time Stock Prices

**Purpose:** Verify prices are fetched live from Yahoo Finance (not cached or static mock data).

**Pre-condition:** Backend server must be running with an active internet connection.

**Steps:**
1. Generate a portfolio: $10,000 → Growth Investing → default settings.
2. On the stock cards, note the **current price** displayed for AMZN, TSLA, and GOOGL.
3. Open **https://finance.yahoo.com/quote/AMZN** in a new browser tab.
4. Compare the price shown in the app against Yahoo Finance.

**Expected Result:**
- The price shown in the app is within a few cents of the real-time price on Yahoo Finance (small lag is normal; after market hours the most recent close price is shown).
- If the market is closed, prices reflect the **most recent closing price** (not a stale number from days ago).
- Clicking the external link icon on any stock card (e.g., clicking **"AMZN ↗"**) opens the Yahoo Finance page for that symbol in a new tab.

---

## Test Case 10 — PDF Export

**Purpose:** Verify that the portfolio can be exported as a well-formatted PDF with accurate data.

**Steps:**
1. Generate a portfolio: $25,000 → Quality Investing + Value Investing → Equal Split.
2. After results load, click the **"Download PDF"** button at the top of the results section.
3. Locate the downloaded file in your **Downloads** folder — it will be named `Portfolio_Report_YYYY-MM-DD.pdf`.
4. Open the PDF and review each section.

**Expected Result:**
- The PDF downloads automatically and a green toast **"PDF Downloaded!"** appears on screen.
- The PDF contains a **Portfolio Summary** section with: Initial Investment, Current Value, Total Return %, and the selected strategies.
- A **Holdings** table lists every stock with Symbol, Name, Strategy, Price, Shares, Allocation %, Value, and Day Change %.
- A **Weekly Performance Trend** table shows 5 rows (one per trading day) with the portfolio value for each day.
- All numbers in the PDF (prices, shares, totals) match what is displayed on screen.

---

## Summary Table

| # | Test Case | Feature Tested | Pass Criteria |
|---|-----------|----------------|---------------|
| 1 | Below $5,000 | Input validation | Toast error; form stays on Step 1 |
| 2 | Exactly $5,000 | Boundary value + share-rounding sign | Form advances; value ≈ $5,000; shows red -0.00% |
| 3 | Ethical Investing — single strategy | Strategy mapping + live prices | AAPL, ADBE, NSRGY shown with live prices |
| 4 | Index Investing — single strategy | Strategy mapping + allocation | VTI, IXUS, ILTB with ~33% each |
| 5 | Two strategies — equal split | Dual-strategy + sign correctness | 50/50 split; correct green/red Total Return |
| 6 | Two strategies — random split | Random allocation | Different splits each run; sum = investment |
| 7 | Portfolio History | Save/restore previous portfolios | Portfolio preserved on "New Portfolio"; Load restores it |
| 8 | Market Analytics Tab | Analytics dashboard | Donut, bar chart, table, movers, heatmap all visible |
| 9 | Live stock prices | yfinance API integration | Prices match Yahoo Finance within a few cents |
| 10 | PDF Export | Report generation | PDF downloads with all sections; values match screen |
