import { useEffect, useState } from "react";

function Sales() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/sales/summary")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load sales data.");
        }

        return response.json();
      })
      .then((data) => {
        setSalesData(data);
      })
      .catch(() => {
        setError(
          "Unable to load sales data. Please make sure the backend is running."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page-message">Loading sales...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="sales-page">
      <div className="page-header">
        <div>
          <h1>Sales</h1>
          <p>View sales performance and transaction history.</p>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Sales</span>
          <strong>
            ₹{Number(salesData.totalSales).toFixed(2)}
          </strong>
        </div>

        <div className="summary-card">
          <span>Total Orders</span>
          <strong>{salesData.totalOrders}</strong>
        </div>

        <div className="summary-card">
          <span>Average Bill Value</span>
          <strong>
            ₹{Number(salesData.averageBillValue).toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="sales-grid">
        <div className="sales-card">
          <div className="table-toolbar">
            <div>
              <h2>Sales Trend</h2>
              <p>Daily sales based on completed bills.</p>
            </div>
          </div>

          <div className="sales-trend">
            {salesData.salesTrend.map((item) => (
              <div className="sales-trend-row" key={item.date}>
                <span>{item.date}</span>

                <div className="sales-bar-container">
                  <div
                    className="sales-bar"
                    style={{
                      width: `${
                        salesData.totalSales > 0
                          ? (Number(item.sales) /
                              Number(salesData.totalSales)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <strong>₹{Number(item.sales).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="sales-card">
          <div className="table-toolbar">
            <div>
              <h2>Top Selling Products</h2>
              <p>Products ranked by quantity sold.</p>
            </div>
          </div>

          {salesData.topSellingProducts.length === 0 ? (
            <div className="empty-message">
              No sales data available.
            </div>
          ) : (
            <div className="sales-list">
              {salesData.topSellingProducts.map((product, index) => (
                <div
                  className="sales-list-row"
                  key={product.productName}
                >
                  <div>
                    <span className="sales-rank">
                      #{index + 1}
                    </span>

                    <strong>{product.productName}</strong>
                  </div>

                  <span>
                    {product.quantitySold} unit(s)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sales-card">
          <div className="table-toolbar">
            <div>
              <h2>Payment Methods</h2>
              <p>Sales amount grouped by payment method.</p>
            </div>
          </div>

          {salesData.paymentMethodBreakdown.length === 0 ? (
            <div className="empty-message">
              No payment data available.
            </div>
          ) : (
            <div className="sales-list">
              {salesData.paymentMethodBreakdown.map((payment) => (
                <div
                  className="sales-list-row"
                  key={payment.paymentMethod}
                >
                  <strong>{payment.paymentMethod}</strong>

                  <span>
                    ₹{Number(payment.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sales-card">
          <div className="table-toolbar">
            <div>
              <h2>Recent Sales</h2>
              <p>Latest completed transactions.</p>
            </div>
          </div>

          {salesData.recentSales.length === 0 ? (
            <div className="empty-message">
              No sales available.
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>

                <tbody>
                  {salesData.recentSales.map((sale) => (
                    <tr key={sale.billID}>
                      <td>#{sale.billID}</td>
                      <td>
                        {new Date(sale.date).toLocaleString()}
                      </td>
                      <td>
                        ₹{Number(sale.totalAmount).toFixed(2)}
                      </td>
                      <td>{sale.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sales;