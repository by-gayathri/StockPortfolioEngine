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

**Purpose:** Verify the system rejects investments below the $5,000 minimum at the frontend layer.

**Steps:**
1. Navigate to http://localhost:8080
2. Click **"Create Portfolio"** or go to the **Portfolio** tab.
3. In the "How much do you want to invest?" field, type `3000`.
4. Click **"Continue"**.

**Expected Result:**
- A red toast notification appears reading **"Invalid Amount — Please enter a minimum investment of $5,000."**
- The user remains on Step 1; the form does **not** advance to Step 2.
- The input field retains the value `3000`.

---

## Test Case 2 — Minimum Investment Validation (Exactly $5,000)

**Purpose:** Verify that exactly $5,000 is accepted as the boundary value and the portfolio generates correctly.

**Steps:**
1. Navigate to http://localhost:8080 → Portfolio tab.
2. In the investment field, type `5000`.
3. Observe the hint text below the input.
4. Click **"Continue"**.
5. Select any strategy (e.g., **"Index Investing"**) → click **Continue**.
6. Keep default allocation settings → click **"Generate Portfolio"**.
7. Wait for results to load.

**Expected Result:**
- As soon as any number is typed, a green hint `✓ Valid amount: $X,XXX` appears below the input (this appears for any non-empty value and is informational only — the true validation fires on clicking Continue).
- Clicking Continue with `5000` advances the form to **Step 2 — Choose Your Strategies** without showing an error toast.
- After generating the portfolio, the **Total Portfolio Value** banner shows a value close to (but potentially a few cents below) **$5,000** due to share-rounding — this is correct behavior.
- The **Total Return** indicator correctly reflects whether the current value is above or below the invested $5,000 (red `-0.00%` is expected for the rounding difference; it will **not** show green `+0.00%`).

---

## Test Case 3 — Single Strategy Selection (Ethical Investing)

**Purpose:** Verify a single strategy generates a portfolio with the correct stocks.

**Steps:**
1. Enter `10000` in the investment field → click **Continue**.
2. On Step 2, click the **"Ethical Investing"** card (it should highlight with a colored border).
3. Click **Continue**.
4. On Step 3, leave allocation at **"Equal Split" / "Predefined"** → click **"Generate Portfolio"**.
5. Wait for results to load.

**Expected Result:**
- Portfolio results appear showing **3 stocks**: AAPL (Apple Inc.), ADBE (Adobe Inc.), NSRGY (Nestlé S.A.)
- Each stock card shows: current live price, number of shares, allocation %, and a 5-day price trend chart.
- The **Total Portfolio Value** banner at the top shows a dollar value close to $10,000.
- Scrolling down to **Portfolio Summary → Historical performance** shows an area chart with **5 data points** (one per trading day).

---

## Test Case 4 — Single Strategy Selection (Index Investing)

**Purpose:** Verify Index Investing maps to the correct ETFs as specified in the project requirements.

**Steps:**
1. Enter `20000` in the investment field → click **Continue**.
2. Select **"Index Investing"** → click **Continue**.
3. Keep default allocation settings → click **"Generate Portfolio"**.

**Expected Result:**
- Exactly **3 ETFs** are shown: **VTI** (Vanguard Total Stock Market ETF), **IXUS** (iShares Core MSCI Total Intl Stk), **ILTB** (iShares Core 10+ Year USD Bond).
- Each card displays the live ETF price and a within-strategy allocation of approximately **34%, 33%, 33%**.
- The investment of $20,000 is distributed: ~$6,800 to VTI, ~$6,600 to IXUS, ~$6,600 to ILTB.

---

## Test Case 5 — Two Strategies (Equal Split)

**Purpose:** Verify that selecting two strategies with equal split divides the investment exactly 50/50.

**Steps:**
1. Enter `10000` → click **Continue**.
2. Select **"Growth Investing"** and **"Value Investing"** (both should highlight with colored borders).
3. Attempt to click a third strategy — verify a toast appears.
4. Click **Continue**.
5. On Step 3, select **"Equal Split"** for strategy distribution → click **"Generate Portfolio"**.

**Expected Result:**
- Two strategy sections appear in the results.
- **Growth Investing** section shows AMZN, TSLA, GOOGL with a combined allocation of **$5,000 (50%)**.
- **Value Investing** section shows BRK-B, KO, XOM with a combined allocation of **$5,000 (50%)**.
- The KPI banner shows **Total Portfolio Value** combining all 6 stocks.
- The **Total Return** indicator shows green `+X.XX%` or red `-X.XX%` depending on current market prices vs. invested $10,000.

---

## Test Case 6 — Two Strategies (Random Split)

**Purpose:** Verify that "Random Split" distributes the investment unevenly between two strategies, and that the split varies between runs.

**Steps:**
1. Enter `10000` → click **Continue**.
2. Select **"Quality Investing"** and **"Ethical Investing"** → click **Continue**.
3. On Step 3, select **"Random Split"** for strategy distribution → keep stock allocation as "Predefined" → click **"Generate Portfolio"**.
4. Note the strategy allocation amounts shown in the results.
5. Click **"New Portfolio"** and repeat steps 1–4.

**Expected Result:**
- Each run produces **different percentage splits** between the two strategies (e.g., 62%/38% one run, 44%/56% another).
- The **sum of both strategy allocations always equals exactly $10,000** — no money is lost or created.

---

## Test Case 7 — Live Real-Time Stock Prices

**Purpose:** Verify that current prices are fetched live from Yahoo Finance (not static mock data).

**Pre-condition:** Backend must be running with internet access.

**Steps:**
1. Generate any portfolio (e.g., $10,000, Growth Investing, default settings).
2. On each **StockCard**, note the price displayed for AMZN, TSLA, and GOOGL.
3. Open **https://finance.yahoo.com/quote/AMZN** in another browser tab.
4. Compare the price shown in the app to Yahoo Finance.

**Expected Result:**
- The price shown in the app is within a few cents of the current market price on Yahoo Finance.
- If the market is closed, prices reflect the most recent closing price.
- Clicking the **stock symbol link** on any card (e.g., "AMZN ↗") opens the Yahoo Finance page for that stock in a new tab.

---

## Test Case 8 — Weekly Portfolio Trend Chart (5-Day History)

**Purpose:** Verify that the portfolio trend chart shows exactly 5 trading days of historical data with correct date alignment across all holdings.

**Steps:**
1. Generate any portfolio (e.g., $15,000, Index Investing).
2. Scroll to the **Portfolio Summary** section at the bottom of the results.
3. Look at the **area chart** under the **"Historical performance"** heading.
4. Hover over each data point in the chart.

**Expected Result:**
- The chart shows **exactly 5 data points**, one per trading day (weekdays only, no weekends).
- The X-axis labels are dates in the format "May 05", "May 06", etc. representing the last 5 trading days.
- Hovering over a point shows a tooltip with **"Portfolio Value: $X,XXX.XX"**.
- The Y-axis range adjusts automatically to the portfolio value range.
- Repeat the test with **two strategies selected** — the trend values must correctly sum all holdings across both strategies (no date-alignment errors).

---

## Test Case 9 — PDF Export

**Purpose:** Verify that the portfolio can be exported as a well-formatted PDF with accurate data matching the screen.

**Steps:**
1. Generate any portfolio (e.g., $25,000, Quality Investing + Value Investing, Equal Split).
2. At the top of the results, click the **"Download PDF"** button.
3. Locate the downloaded file (named `Portfolio_Report_YYYY-MM-DD.pdf`) in your Downloads folder.
4. Open the PDF.

**Expected Result:**
- The PDF downloads automatically and a success toast **"PDF Downloaded!"** appears.
- It contains a **"Portfolio Summary"** section showing: Initial Investment, Current Value, **Total Return %**, and selected strategies.
- A **"Portfolio Holdings"** table lists all stocks with columns: Symbol, Name, Strategy, Price, Shares, Allocation, Value, Day Chg%.
- A **"Weekly Performance Trend"** table at the end shows 5 rows, one per trading day, with portfolio value for each day.
- All values (prices, shares, totals) match what is displayed on screen.

---

## Test Case 10 — Strategy Limit Enforcement (Max 2 Strategies)

**Purpose:** Verify a user cannot select more than 2 strategies, and deselecting re-enables others.

**Steps:**
1. Enter `10000` → click **Continue**.
2. Click **"Ethical Investing"** (selected — 1 of 2).
3. Click **"Growth Investing"** (selected — 2 of 2).
4. Attempt to click **"Index Investing"** (should be at the limit).
5. Attempt to click **"Quality Investing"**.
6. Click **"Ethical Investing"** again to deselect it.
7. Click **"Index Investing"** now.

**Expected Result:**
- After selecting 2 strategies, the remaining strategy cards appear **dimmed/disabled** (reduced opacity).
- Clicking a third strategy displays a red toast: **"Strategy Limit Reached — You can select a maximum of 2 strategies."**
- Only the 2 originally selected strategies remain highlighted.
- After deselecting one (Step 6), the previously disabled cards become **re-enabled** and clickable.
- Selecting a new replacement strategy (Step 7) works correctly and the form can proceed.

---

## Summary Table

| # | Test Case | Function Tested | Pass Criteria |
|---|-----------|-----------------|---------------|
| 1 | Below $5,000 investment | Frontend + backend input validation | Toast error, no navigation |
| 2 | Exactly $5,000 investment | Boundary value + share-rounding display | Form advances; value ≈ $5,000; sign correct |
| 3 | Ethical Investing — single | Strategy mapping | AAPL, ADBE, NSRGY shown |
| 4 | Index Investing — single | Strategy mapping | VTI, IXUS, ILTB shown |
| 5 | Two strategies, equal split | Dual strategy + allocation | 50/50 split across 6 stocks |
| 6 | Two strategies, random split | Random allocation | Different splits each run; sum = investment |
| 7 | Live stock prices | yfinance API integration | Prices match Yahoo Finance |
| 8 | Weekly trend chart | 5-day history + date alignment | 5 data points, correct cross-strategy values |
| 9 | PDF export | Report generation | PDF with all sections; "Total Return" label |
| 10 | Max 2 strategies enforced | UI validation | 3rd click blocked; deselect re-enables |
