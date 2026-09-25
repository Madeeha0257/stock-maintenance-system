import { useEffect, useState } from "react";

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [dealerID, setDealerID] = useState("");
  const [items, setItems] = useState([]);

  const [selectedProductID, setSelectedProductID] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch("/api/purchase-orders");

      if (!response.ok) {
        throw new Error("Failed to load purchase orders");
      }

      const data = await response.json();
      setPurchaseOrders(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          purchaseOrdersResponse,
          dealersResponse,
          productsResponse,
        ] = await Promise.all([
          fetch("/api/purchase-orders"),
          fetch("/api/dealers"),
          fetch("/api/products"),
        ]);

        if (!purchaseOrdersResponse.ok) {
          throw new Error("Failed to load purchase orders");
        }

        if (!dealersResponse.ok) {
          throw new Error("Failed to load dealers");
        }

        if (!productsResponse.ok) {
          throw new Error("Failed to load products");
        }

        const [
          purchaseOrdersData,
          dealersData,
          productsData,
        ] = await Promise.all([
          purchaseOrdersResponse.json(),
          dealersResponse.json(),
          productsResponse.json(),
        ]);

        setPurchaseOrders(purchaseOrdersData);
        setDealers(dealersData);
        setProducts(productsData);
      } catch (err) {
        setError(err.message);
      }
    };

    loadInitialData();
  }, []);

  const resetForm = () => {
    setDealerID("");
    setItems([]);
    setSelectedProductID("");
    setSelectedQuantity(1);
    setMessage("");
    setError("");
  };

  const openCreateForm = () => {
    resetForm();
    setSelectedOrder(null);
    setShowForm(true);
  };

  const cancelForm = () => {
    resetForm();
    setShowForm(false);
  };

  const addProduct = () => {
    setError("");
    setMessage("");

    if (!selectedProductID) {
      setError("Please select a product");
      return;
    }

    const quantity = Number(selectedQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    const product = products.find(
      (item) => item.productID === Number(selectedProductID)
    );

    if (!product) {
      setError("Product not found");
      return;
    }

    if (
      items.some(
        (item) => item.product.productID === product.productID
      )
    ) {
      setError("This product has already been added");
      return;
    }

    const unitPrice = Number(product.costPrice);

    if (unitPrice <= 0) {
    setError("Product cost price is not set");
    return;
    }

    const subtotal = unitPrice * quantity;

    setItems([
      ...items,
      {
        product,
        quantity,
        unitPrice,
        subtotal,
      },
    ]);

    setSelectedProductID("");
    setSelectedQuantity(1);
  };

  const removeProduct = (productID) => {
    setItems(
      items.filter(
        (item) => item.product.productID !== productID
      )
    );
  };

  const getTotal = () => {
    return items.reduce(
      (total, item) => total + item.subtotal,
      0
    );
  };

  const createPurchaseOrder = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!dealerID) {
      setError("Please select a dealer");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one product");
      return;
    }

    const body = {
      dealer: {
        dealerID: Number(dealerID),
      },
      items: items.map((item) => ({
        product: {
          productID: item.product.productID,
        },
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Failed to create purchase order"
        );
      }

      setMessage(
        `Purchase Order #${data.purchaseOrderID} created successfully.`
      );

      resetForm();
      setShowForm(false);

      await fetchPurchaseOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const receivePurchaseOrder = async (id) => {
    setError("");
    setMessage("");

    const confirmed = window.confirm(
      "Are you sure you want to mark this purchase order as received? Stock will be increased."
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/purchase-orders/${id}/receive`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Failed to receive purchase order"
        );
      }

      setMessage(
        `Purchase Order #${id} marked as received.`
      );

      setSelectedOrder(null);
      await fetchPurchaseOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const viewPurchaseOrder = async (id) => {
    setError("");

    try {
      const response = await fetch(
        `/api/purchase-orders/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load purchase order");
      }

      const data = await response.json();
      setSelectedOrder(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  const availableProducts = products.filter(
    (product) =>
      !items.some(
        (item) =>
          item.product.productID === product.productID
      )
  );

  if (showForm) {
    return (
      <div className="page-container purchase-orders-page">
        <div className="page-header">
          <div>
            <h1>Create Purchase Order</h1>
            <p>Create a new purchase order for a dealer.</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        <form onSubmit={createPurchaseOrder}>
          <div className="form-group">
            <label>Dealer</label>

            <select
              value={dealerID}
              onChange={(e) =>
                setDealerID(e.target.value)
              }
              required
            >
              <option value="">
                Select Dealer
              </option>

              {dealers.map((dealer) => (
                <option
                  key={dealer.dealerID}
                  value={dealer.dealerID}
                >
                  {dealer.dealerName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h2>Products</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Product</label>

                <select
                  value={selectedProductID}
                  onChange={(e) =>
                    setSelectedProductID(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select Product
                  </option>

                  {availableProducts.map((product) => (
                    <option
                      key={product.productID}
                      value={product.productID}
                    >
                      {product.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity</label>

                <input
                  type="number"
                  min="1"
                  value={selectedQuantity}
                  onChange={(e) =>
                    setSelectedQuantity(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>&nbsp;</label>

                <button
                  type="button"
                  className="primary-button"
                  onClick={addProduct}
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="table-container  purchase-order-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.product.productID}
                    >
                      <td>
                        {item.product.productName}
                      </td>

                      <td>
                        ₹{item.unitPrice.toFixed(2)}
                      </td>

                      <td>{item.quantity}</td>

                      <td>
                        ₹{item.subtotal.toFixed(2)}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            removeProduct(
                              item.product.productID
                            )
                          }
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="total-section">
            <strong>
              Total: ₹{getTotal().toFixed(2)}
            </strong>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
            >
              Create Purchase Order
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={cancelForm}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Purchase Orders</h1>
          <p>
            Manage dealer purchase orders and receiving.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={openCreateForm}
        >
          + Create Purchase Order
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {purchaseOrders.length === 0 ? (
        <div className="empty-state">
          No purchase orders found.
        </div>
      ) : (
        <div className="table-container purchase-orders-table">
          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Date</th>
                <th>Dealer</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {purchaseOrders.map((order) => (
                <tr
                  key={order.purchaseOrderID}
                >
                  <td>
                    #{order.purchaseOrderID}
                  </td>

                  <td>
                    {formatDate(order.orderDate)}
                  </td>

                  <td>
                    {order.dealer?.dealerName ??
                      "Not assigned"}
                  </td>

                  <td>
                    {order.items?.length ?? 0}
                  </td>

                  <td>
                    <span
  className={`po-status ${
    order.status === "RECEIVED"
      ? "received"
      : "pending"
  }`}
>
  {order.status}
</span>
                  </td>

                  <td>
                    ₹
                    {Number(
                      order.totalAmount
                    ).toFixed(2)}
                  </td>

                  <td>
  <div className="purchase-order-actions">
    <button
      className="secondary-button"
      onClick={() =>
        viewPurchaseOrder(order.purchaseOrderID)
      }
    >
      View
    </button>

    {order.status === "PENDING" && (
      <button
        className="primary-button"
        onClick={() =>
          receivePurchaseOrder(order.purchaseOrderID)
        }
      >
        Mark as Received
      </button>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay purchase-order-modal-overlay">
          <div className="modal purchase-order-modal">
            <h2>
              Purchase Order #
              {selectedOrder.purchaseOrderID}
            </h2>

            <p>
              <strong>Date:</strong>{" "}
              {formatDate(
                selectedOrder.orderDate
              )}
            </p>

            <p>
              <strong>Dealer:</strong>{" "}
              {selectedOrder.dealer?.dealerName ??
                "Not assigned"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedOrder.status}
            </p>

            <div className="table-container purchase-order-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedOrder.items?.map(
                    (item) => (
                      <tr
                        key={
                          item.purchaseOrderItemID
                        }
                      >
                        <td>
                          {item.product
                            ?.productName ??
                            "Unknown Product"}
                        </td>

                        <td>
                          ₹
                          {Number(
                            item.unitPrice
                          ).toFixed(2)}
                        </td>

                        <td>
                          {item.quantity}
                        </td>

                        <td>
                          ₹
                          {Number(
                            item.subtotal
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <h3>
              Total: ₹
              {Number(
                selectedOrder.totalAmount
              ).toFixed(2)}
            </h3>

            <div className="form-actions">
              {selectedOrder.status ===
                "PENDING" && (
                <button
                  className="primary-button"
                  onClick={() =>
                    receivePurchaseOrder(
                      selectedOrder.purchaseOrderID
                    )
                  }
                >
                  Mark as Received
                </button>
              )}

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedOrder(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrders;