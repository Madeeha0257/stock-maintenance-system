import { useEffect, useState } from "react";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load dashboard data.");
        }

        return response.json();
      })
      .then((data) => {
        setSummary(data);
      })
      .catch(() => {
        setError(
          "Unable to load dashboard data. Please make sure the backend is running."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page-message">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your store's current performance.</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Sales</span>
          <strong>₹{Number(summary.totalSales).toFixed(2)}</strong>
        </div>

        <div className="summary-card">
          <span>Total Orders</span>
          <strong>{summary.totalOrders}</strong>
        </div>

        <div className="summary-card">
          <span>Total Products</span>
          <strong>{summary.totalProducts}</strong>
        </div>

        <div className="summary-card">
          <span>Low Stock Items</span>
          <strong>{summary.lowStockItems}</strong>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;