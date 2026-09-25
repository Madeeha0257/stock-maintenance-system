# Stock Maintenance System

## Project

The Stock Maintenance System is a full-stack web application developed for managing the day-to-day operations of an in-person retail store. It provides a centralized platform for managing products, inventory, billing, sales, customers, dealers, purchase orders, low-stock alerts, and reports.

The system is designed to reduce manual stock management and keep important store operations connected. Stock is automatically updated when sales are completed or purchase orders are received, while customers, dealers, and transaction records are maintained in a relational database.

The system also provides inventory valuation and an estimated profit report. `Product.costPrice` represents the current purchase cost, `Product.unitPrice` represents the selling price, and `Inventory.stockQuantity` is the authoritative current stock quantity.

## Tech Stack Used

- **Java + Spring Boot** - Chosen to build the backend REST API and organize the application using Controllers, Services, and Repositories.
- **Spring Data JPA + Hibernate** - Chosen to simplify database access and map Java entities to relational database tables.
- **MySQL** - Chosen as the relational database for storing products, inventory, bills, customers, dealers, payments, and purchase orders.
- **React + Vite** - Chosen to build a component-based frontend with a fast development environment.
- **JavaScript + CSS** - Used to implement frontend functionality and the application's user interface.
- **Maven** - Used for backend dependency management and building the Spring Boot application.

## Key Features

- **Product Management:** Add, view, update, and delete products with category, cost price, selling price, quantity, and optional dealer information, allowing the store to maintain accurate product records.
- **Inventory Management:** Track current stock, stock value, and stock status using `Inventory.stockQuantity` as the authoritative quantity, helping the store monitor available products.
- **Billing and Sales:** Create bills and record sold products and quantities, allowing the store to manage in-person customer purchases.
- **Automatic Stock Deduction:** Automatically reduces inventory after a successful sale, preventing stock records from becoming outdated.
- **Payment Recording:** Records payment information associated with completed bills using simulated payment processing.
- **Customer Management:** Maintain customer information and purchase history, helping the store track customer transactions.
- **Dealer Management:** Maintain dealer information and associate products with their dealers, helping identify product suppliers.
- **Purchase Orders:** Create and receive purchase orders from dealers, increasing inventory only when an order is received.
- **Low Stock Alerts:** Identifies products with stock of 10 or less so that products requiring replenishment can be noticed easily.
- **Reports:** Provides Stock, Sales, Dealer, Customer, Inventory Valuation, and Profit reports for viewing store information in one place.
- **Inventory Valuation:** Calculates current inventory cost using `stockQuantity × costPrice`, giving the store the current cost value of its stock.
- **Estimated Profit:** Calculates estimated profit using actual sales revenue and the current product cost, providing a simple profitability view for the project.

## User Roles

### Owner / Admin

The Owner has management-level access to the system. The Owner can manage products, customers, dealers, purchase orders, view sales information, access low-stock alerts, and generate reports. Inventory is updated automatically through sales and received purchase orders.

### Cashier

The Cashier is responsible mainly for day-to-day sales operations. The Cashier can access billing and process customer purchases using the available products and payment options. The Cashier does not have the same management-level access as the Owner and cannot manually adjust inventory stock.

## Scope of Project

The project focuses on the core operational requirements of a physical retail store. It covers inventory and product management, in-store billing and sales, customer and dealer management, purchase orders, and low-stock monitoring. The system also provides reports for stock, sales, dealers, customers, inventory valuation, and estimated profit. Inventory valuation uses the current `Product.costPrice`, while profit is calculated on a current-cost basis rather than historical accounting methods. Advanced features such as GST accounting, dealer payment tracking, AI forecasting, mobile applications, and real payment gateways are outside the current scope.

## System Architecture and Data Flow

The system follows a layered full-stack architecture:

```text
React + Vite Frontend
        ↓
REST API / JSON
        ↓
Spring Boot Controllers
        ↓
Services / Business Logic
        ↓
Spring Data JPA / Hibernate
        ↓
MySQL Database
```

User actions from the React frontend are sent to the Spring Boot REST API. Controllers receive the requests and pass them to the appropriate service, where validation and business rules are applied. Spring Data JPA/Hibernate communicates with MySQL to read or update the required data.

For example, during a sale, the frontend sends the billing request to the backend. The backend validates the transaction, records the bill and payment information, and deducts the sold quantity from `Inventory.stockQuantity`. When a purchase order is received, the backend increases the corresponding inventory stock.

## Running the Project Locally

### Prerequisites

Install the following before running the project:

- Java JDK
- MySQL
- Node.js and npm

Make sure the `stock_maintenance` MySQL database is available.

### 1. Configure the Backend

Open:

```text
stock-maintenance-backend/src/main/resources/application.properties
```

Enter your local MySQL username and password in the database configuration.

> **Note:** Do not commit or share your database password.

### 2. Run the Backend

Open a terminal inside the backend folder:

```text
stock-maintenance-backend/
```

Run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend will run at:

```text
http://localhost:8080
```

### 3. Run the Frontend

Open another terminal inside the frontend folder:

```text
stock-maintenance-frontend/
```

Install the dependencies:

```powershell
npm install
```

Then start the frontend:

```powershell
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

### Ports

| Component | Port |
|---|---:|
| React Frontend | 5173 |
| Spring Boot Backend | 8080 |
| MySQL | 3306 |

### Running the Application

Once both servers are running, open:

```text
http://localhost:5173
```

The React frontend communicates with the Spring Boot backend through the REST API, while the backend connects to the MySQL database.

## Future Scope

The system can be extended with additional features to support larger and more advanced retail operations.

- **GST and Tax Management:** Add GST calculation, tax breakdowns, and tax-related reports for billing.
- **Dealer Payment Tracking:** Track payments made to dealers and maintain outstanding balances.
- **Advanced Inventory Tracking:** Support batch numbers, expiry dates, and more detailed stock movement history.
- **Historical Profit Calculation:** Introduce historical cost tracking such as FIFO or weighted-average costing for more accurate profit analysis.
- **Real Payment Gateway Integration:** Replace simulated payments with secure online payment processing.
- **Mobile Application:** Provide a mobile interface for store owners and staff.
- **Advanced Analytics:** Add sales trends, demand analysis, and inventory forecasting.
- **Notifications:** Send automated notifications for low-stock products, purchase orders, and other important events.
- **Backup and Data Recovery:** Add automated database backup and recovery mechanisms for improved data safety.
