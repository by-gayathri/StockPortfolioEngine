# Requirements Document

## Functional Requirements

## Strategy Mapping Requirements

1. The system shall allow the user to select one or two investment strategies.
2. The system shall support the following investment strategies:
   - Ethical Investing
   - Growth Investing
   - Index Investing
   - Quality Investing
   - Value Investing
3. Each investment strategy shall map to at least three different stocks or ETFs.
4. The Index Investing strategy shall include ETFs such as VTI, IXUS, and ILTB.
5. The Ethical Investing strategy shall include stocks such as AAPL, ADBE, and NSRGY.
6. The system shall divide the investment amount across the selected stocks or ETFs.
7. The system shall display the current price, number of shares, allocation percentage, and value for each selected stock or ETF.
8. The system shall calculate the total current portfolio value using live market data.
9. The system shall display a 5-day weekly trend of the overall portfolio value.
10. The system shall allow the user to download a PDF report containing portfolio summary, holdings, allocation, and weekly performance trend.

## Non-Functional Requirements

1. The application should be easy to use and understand.
2. The system should respond within a reasonable time after portfolio generation.
3. The frontend and backend should be separated for better maintainability.
4. The system should display clear error messages for invalid input.
5. The system should handle external API failures gracefully.
6. The project should be easy to run locally using README instructions.
7. The user interface should be responsive for different screen sizes.
8. The code should be modular and easy to extend.

## Assumptions

- Users have basic knowledge of stocks and investment strategies.
- Stock data depends on Yahoo Finance availability.
- Portfolio output is generated for educational purposes only.
- The application is not intended to provide professional financial advice.

## Constraints

- The backend depends on external stock market data.
- Portfolio recommendations may change based on real-time stock prices.
- Email sharing requires correct email configuration.
- The current version does not include user login or saved portfolio history.