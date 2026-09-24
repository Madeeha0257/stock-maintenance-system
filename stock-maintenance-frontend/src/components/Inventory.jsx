import { useEffect, useState } from "react";

function Inventory({ onAddProduct }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    fetch("/api/products")
        .then(async (response) => {
        if (!response.ok) {
            throw new Error("Unable to load inventory");
        }

        return response.json();
        })
        .then((data) => {
        setProducts(data);
        })
        .catch(() => {
        setError(
            "Unable to connect to the backend. Please make sure Spring Boot is running."
        );
        })
        .finally(() => {
        setLoading(false);
        });
    }, []);

  const handleDelete = async (productId, productName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.productID !== productId)
      );
    } catch {
      setError("Unable to delete the product. Please try again.");
    }
  };

  const getStockQuantity = (product) => {
    return product.inventory?.stockQuantity ?? 0;
  };

  const getStockStatus = (stockQuantity) => {
    if (stockQuantity === 0) {
      return "Out of Stock";
    }

    if (stockQuantity <= 10) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();

    return (
      product.productName.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
    );
  });

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + getStockQuantity(product),
    0
  );

  const lowStockItems = products.filter(
    (product) => getStockQuantity(product) > 0 && getStockQuantity(product) <= 10
  ).length;

  if (loading) {
    return <div className="page-message">Loading inventory...</div>;
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage your store products and stock levels.</p>
        </div>

        <button className="primary-button" onClick={onAddProduct}>
          + Add Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Products</span>
          <strong>{totalProducts}</strong>
        </div>

        <div className="summary-card">
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
        </div>

        <div className="summary-card">
          <span>Low Stock Items</span>
          <strong>{lowStockItems}</strong>
        </div>
      </div>

      <div className="inventory-card">
        <div className="table-toolbar">
          <div>
            <h2>Product Inventory</h2>
            <p>Current stock available in the store.</p>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="search-input"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-message">
            No products found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock Quantity</th>
                  <th>Stock Status</th>
                  <th>Dealer</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const stockQuantity = getStockQuantity(product);
                  const stockStatus = getStockStatus(stockQuantity);

                  return (
                    <tr key={product.productID}>
                      <td>#{product.productID}</td>

                      <td className="product-name">
                        {product.productName}
                      </td>

                      <td>{product.category}</td>

                      <td>₹{Number(product.unitPrice).toFixed(2)}</td>

                      <td>{stockQuantity}</td>

                      <td>
                        <span
                          className={`stock-badge ${stockStatus
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {stockStatus}
                        </span>
                      </td>

                      <td>
                        {product.dealer?.dealerName ?? "Not assigned"}
                      </td>

                      <td>
                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(
                              product.productID,
                              product.productName
                            )
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;