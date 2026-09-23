import { useState } from "react";
import Inventory from "./components/Inventory";
import AddProduct from "./components/AddProduct";
import "./App.css";

function App() {
  const [page, setPage] = useState("inventory");

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
              page === "inventory" ? "active" : ""
            }`}
            onClick={() => setPage("inventory")}
          >
            Inventory
          </button>

          <button
            className="sidebar-button"
            onClick={() => setPage("billing")}
          >
            Billing
          </button>

          <button
            className="sidebar-button"
            onClick={() => setPage("sales")}
          >
            Sales
          </button>

          <button
            className="sidebar-button"
            onClick={() => setPage("reports")}
          >
            Reports
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {page === "inventory" && (
          <Inventory onAddProduct={() => setPage("add-product")} />
        )}

        {page === "add-product" && (
          <AddProduct
            onCancel={() => setPage("inventory")}
            onProductAdded={() => setPage("inventory")}
          />
        )}

        {page === "billing" && (
          <div className="page-message">
            Billing will be implemented in Milestone 5.
          </div>
        )}

        {page === "sales" && (
          <div className="page-message">
            Sales will be implemented in Milestone 6.
          </div>
        )}

        {page === "reports" && (
          <div className="page-message">
            Reports will be implemented later.
          </div>
        )}
      </main>
    </div>
  );
}

export default App;