import { useState } from "react";
import Inventory from "./components/Inventory";
import AddProduct from "./components/AddProduct";
import Login from "./components/Login";
import Billing from "./components/Billing";
import Dashboard from "./components/Dashboard";
import Sales from "./components/Sales";
import Customers from "./components/Customers";
import Dealers from "./components/Dealers";
import PurchaseOrders from "./components/PurchaseOrders";

import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("stockMaintenanceUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [page, setPage] = useState("dashboard");

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("stockMaintenanceUser");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const isOwner = user.role === "OWNER";

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Stock Maintenance</h2>
          <p>Retail Management System</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-button ${
              page === "dashboard" ? "active" : ""
            }`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          {isOwner && (
            <button
              className={`sidebar-button ${
                page === "inventory" || page === "add-product" ? "active" : ""
              }`}
              onClick={() => setPage("inventory")}
            >
              Inventory
            </button>
          )}

          <button
            className={`sidebar-button ${
              page === "billing" ? "active" : ""
            }`}
            onClick={() => setPage("billing")}
          >
            Billing
          </button>

          {isOwner && (
            <>
              <button
                className={`sidebar-button ${
                  page === "sales" ? "active" : ""
                }`}
                onClick={() => setPage("sales")}
              >
                Sales
              </button>

              <button
                className={`sidebar-button ${
                  page === "reports" ? "active" : ""
                }`}
                onClick={() => setPage("reports")}
              >
                Reports
              </button>

              <button
                className={`sidebar-button ${
                  page === "dealers" ? "active" : ""
                }`}
                onClick={() => setPage("dealers")}
              >
                Dealers
              </button>

              <button
                className={`sidebar-button ${
                  page === "customers" ? "active" : ""
                }`}
                onClick={() => setPage("customers")}
              >
                Customers
              </button>

              <button
                className={`sidebar-button ${
                  page === "purchase-orders" ? "active" : ""
                }`}
                onClick={() => setPage("purchase-orders")}
              >
                Purchase Orders
              </button>

              <button
                className={`sidebar-button ${
                  page === "low-stock" ? "active" : ""
                }`}
                onClick={() => setPage("low-stock")}
              >
                Low Stock Alerts
              </button>
            </>
          )}

          {!isOwner && (
            <button
              className={`sidebar-button ${
                page === "customers" ? "active" : ""
              }`}
              onClick={() => setPage("customers")}
            >
              Customers
            </button>
          )}

          <button className="sidebar-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {page === "dashboard" && <Dashboard />}

        {page === "inventory" && isOwner && (
          <Inventory onAddProduct={() => setPage("add-product")} />
        )}

        {page === "add-product" && isOwner && (
          <AddProduct
            onCancel={() => setPage("inventory")}
            onProductAdded={() => setPage("inventory")}
          />
        )}

        {page === "billing" && <Billing />}

        {page === "sales" && isOwner && <Sales />}

        {page === "reports" && isOwner && (
          <div className="page-message">
            Reports will be implemented later.
          </div>
        )}

        {page === "dealers" && isOwner && <Dealers />}

        {page === "customers" && <Customers />}

        {page === "purchase-orders" && isOwner && <PurchaseOrders />}

        {page === "low-stock" && isOwner && (
          <div className="page-message">
            Low Stock Alerts will be implemented later.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;