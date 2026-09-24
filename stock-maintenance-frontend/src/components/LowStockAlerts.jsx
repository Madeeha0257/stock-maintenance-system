import { useEffect, useState } from "react";

function LowStockAlerts() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLowStockProducts = async () => {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to load inventory");
        }

        const products = await response.json();

        const alerts = products
          .map((product) => {
            const stock = product.inventory?.stockQuantity ?? 0;

            let status;

            if (stock === 0) {
              status = "OUT OF STOCK";
            } else if (stock <= 10) {
              status = "LOW STOCK";
            } else {
              status = "IN STOCK";
            }

            return {
              ...product,
              currentStock: stock,
              status,
            };
          })
          .filter((product) => product.currentStock <= 10);

        setLowStockProducts(alerts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLowStockProducts();
  }, []);

  if (loading) {
    return (
      <div className="page-container low-stock-page">
        <div className="page-header">
          <div>
            <h1>Low Stock Alerts</h1>
            <p>Products that require stock attention.</p>
          </div>
        </div>

        <div className="empty-state">
          Loading stock information...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container low-stock-page">
      <div className="page-header">
        <div>
          <h1>Low Stock Alerts</h1>
          <p>Products that require stock attention.</p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!error && lowStockProducts.length === 0 && (
        <div className="empty-state">
          <strong>All products are sufficiently stocked.</strong>
          <p>
            No products currently have stock at or below 10.
          </p>
        </div>
      )}

      {!error && lowStockProducts.length > 0 && (
        <div className="low-stock-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Dealer</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product.productID}>
                  <td className="low-stock-product-name">
                    {product.productName}
                  </td>

                  <td className="low-stock-quantity">
                    {product.currentStock}
                  </td>

                  <td>
                    {product.dealer?.dealerName ??
                      "Not assigned"}
                  </td>

                  <td>
                    <span
                      className={`low-stock-badge ${
                        product.currentStock === 0
                          ? "out-of-stock"
                          : "low-stock"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LowStockAlerts;