import { useState } from "react";
import Inventory from "./components/Inventory";
import AddProduct from "./components/AddProduct";
import Login from "./components/Login";
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
        {page === "dashboard" && (
          <div className="page-message">
            <h1>Welcome, {user.username}</h1>
            <p>
              You are logged in as {user.role === "OWNER" ? "Shop Owner" : "Cashier"}.
            </p>
          </div>
        )}

        {page === "inventory" && isOwner && (
          <Inventory onAddProduct={() => setPage("add-product")} />
        )}

        {page === "add-product" && isOwner && (
          <AddProduct
            onCancel={() => setPage("inventory")}
            onProductAdded={() => setPage("inventory")}
          />
        )}

        {page === "billing" && (
          <div className="page-message">
            Billing will be implemented in the next milestone.
          </div>
        )}

        {page === "sales" && isOwner && (
          <div className="page-message">
            Sales will be implemented later.
          </div>
        )}

        {page === "reports" && isOwner && (
          <div className="page-message">
            Reports will be implemented later.
          </div>
        )}

        {page === "dealers" && isOwner && (
          <div className="page-message">
            Dealer Management will be implemented later.
          </div>
        )}

        {page === "customers" && (
          <div className="page-message">
            Customer Management will be implemented later.
          </div>
        )}

        {page === "purchase-orders" && isOwner && (
          <div className="page-message">
            Purchase Orders will be implemented later.
          </div>
        )}

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