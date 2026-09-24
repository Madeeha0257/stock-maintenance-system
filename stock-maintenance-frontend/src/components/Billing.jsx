import { useEffect, useState } from "react";

function Billing() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerID, setSelectedCustomerID] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successBill, setSuccessBill] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch(() => {
        setError(
          "Unable to load products. Please make sure the backend is running."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
  fetch("/api/customers")
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Unable to load customers.");
      }

      return response.json();
    })
    .then((data) => {
      setCustomers(data);
    })
    .catch(() => {
      setError("Unable to load customers.");
    });
}, []);

  const getStockQuantity = (product) => {
    return product.inventory?.stockQuantity ?? 0;
  };

  const filteredProducts = products.filter((product) => {
    return product.productName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const addToCart = (product) => {
    setError("");

    const stockQuantity = getStockQuantity(product);

    if (stockQuantity <= 0) {
      setError(`${product.productName} is out of stock.`);
      return;
    }

    const existingItem = cart.find(
      (item) => item.productID === product.productID
    );

    if (existingItem) {
      if (existingItem.quantity >= stockQuantity) {
        setError(
          `Only ${stockQuantity} unit(s) of ${product.productName} are available.`
        );
        return;
      }

      setCart((currentCart) =>
        currentCart.map((item) =>
          item.productID === product.productID
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );

      return;
    }

    setCart((currentCart) => [
      ...currentCart,
      {
        productID: product.productID,
        productName: product.productName,
        unitPrice: Number(product.unitPrice),
        quantity: 1,
        stockQuantity,
      },
    ]);
  };

  const updateQuantity = (productID, quantity) => {
    setError("");

    const item = cart.find((cartItem) => cartItem.productID === productID);

    if (!item) return;

    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (newQuantity > item.stockQuantity) {
      setError(
        `Only ${item.stockQuantity} unit(s) of ${item.productName} are available.`
      );
      return;
    }

    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.productID === productID
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  const removeFromCart = (productID) => {
    setError("");

    setCart((currentCart) =>
      currentCart.filter((item) => item.productID !== productID)
    );
  };

  const totalAmount = cart.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0
  );

  const completeBill = async () => {
    setError("");

    if (cart.length === 0) {
      setError("Add at least one product to the bill.");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        items: cart.map((item) => ({
            productID: item.productID,
            quantity: item.quantity,
        })),
        paymentMethod,
        customerID: selectedCustomerID
            ? Number(selectedCustomerID)
            : null,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || "Unable to complete the bill."
        );
      }

      setSuccessBill(responseData);
        setCart([]);
        setSelectedCustomerID("");

        setProducts((currentProducts) =>
        currentProducts.map((product) => {
            const soldItem = cart.find(
            (item) => item.productID === product.productID
            );

            if (!soldItem) {
            return product;
            }

            return {
            ...product,
            inventory: {
                ...product.inventory,
                stockQuantity:
                product.inventory.stockQuantity - soldItem.quantity,
            },
            };
        })
        );

        setSearchTerm("");
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the backend. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="page-message">Loading billing...</div>;
  }

  return (
    <div className="billing-page">
      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p>Create a bill and process the customer's payment.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {successBill && (
        <div className="success-message">
          <strong>Bill created successfully.</strong>
          <div>Bill ID: #{successBill.billID}</div>
          <div>
            Total: ₹{Number(successBill.totalAmount).toFixed(2)}
          </div>
          <div>
            Payment: {successBill.payment?.paymentMethod}
          </div>
        </div>
      )}

      <div className="billing-layout">
        <div className="billing-products-card">
          <div className="table-toolbar">
            <div>
              <h2>Select Products</h2>
              <p>Search and add products to the current bill.</p>
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
            <div className="empty-message">No products found.</div>
          ) : (
            <div className="billing-product-list">
              {filteredProducts.map((product) => {
                const stockQuantity = getStockQuantity(product);

                return (
                  <div
                    className="billing-product-row"
                    key={product.productID}
                  >
                    <div>
                      <strong>{product.productName}</strong>
                      <span>{product.category}</span>
                    </div>

                    <div className="billing-product-price">
                      ₹{Number(product.unitPrice).toFixed(2)}
                    </div>

                    <div className="billing-product-stock">
                      Stock: {stockQuantity}
                    </div>

                    <button
                      className="primary-button"
                      onClick={() => addToCart(product)}
                      disabled={stockQuantity === 0}
                    >
                      {stockQuantity === 0 ? "Out of Stock" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="billing-cart-card">
          <div className="table-toolbar">
            <div>
              <h2>Current Bill</h2>
              <p>Review products before completing payment.</p>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="empty-message">
              No products added to the bill.
            </div>
          ) : (
            <div className="billing-cart">
              {cart.map((item) => (
                <div className="billing-cart-row" key={item.productID}>
                  <div className="billing-cart-product">
                    <strong>{item.productName}</strong>
                    <span>
                      ₹{item.unitPrice.toFixed(2)} each · Stock:{" "}
                      {item.stockQuantity}
                    </span>
                  </div>

                  <input
                    type="number"
                    min="1"
                    max={item.stockQuantity}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(
                        item.productID,
                        event.target.value
                      )
                    }
                    className="quantity-input"
                  />

                  <strong>
                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                  </strong>

                  <button
                    className="delete-button"
                    onClick={() => removeFromCart(item.productID)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="billing-total">
                <span>Total Amount</span>
                <strong>₹{totalAmount.toFixed(2)}</strong>
              </div>

              <div className="payment-section">
                <label htmlFor="customer">Customer (Optional)</label>

                <select
                    id="customer"
                    value={selectedCustomerID}
                    onChange={(event) =>
                    setSelectedCustomerID(event.target.value)
                    }
                >
                    <option value="">Walk-in Customer</option>

                    {customers.map((customer) => (
                    <option
                        key={customer.customerID}
                        value={customer.customerID}
                    >
                        {customer.customerName} - {customer.phone}
                    </option>
                    ))}
                </select>
                </div>

              <div className="payment-section">
                <label htmlFor="paymentMethod">Payment Method</label>

                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>

              <button
                className="primary-button complete-bill-button"
                onClick={completeBill}
                disabled={processing}
              >
                {processing ? "Processing..." : "Complete Bill"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Billing;