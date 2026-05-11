# Requirements Document

## Functional Requirements

1. The system shall allow users to enter an investment amount.
2. The system shall validate the minimum investment amount.
3. The system shall allow users to select one or more investment strategies.
4. The system shall fetch real-time stock prices using Yahoo Finance.
5. The system shall generate portfolio allocation based on selected strategies.
6. The system shall display recommended stocks with allocation percentages.
7. The system shall show weekly stock trend charts.
8. The system shall automatically allocate the investment amount across selected stocks.
9. The system shall allow users to export the generated portfolio as a PDF.
10. The system shall allow users to share the portfolio through email.

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