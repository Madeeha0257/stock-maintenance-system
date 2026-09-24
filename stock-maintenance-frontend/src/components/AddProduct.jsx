import { useEffect, useState } from "react";

function AddProduct({ onCancel, onProductAdded }) {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    unitPrice: "",
    quantity: "",
    dealerID: "",
  });

  const [dealers, setDealers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/dealers")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to load dealers.");
        }

        return response.json();
      })
      .then((data) => {
        setDealers(data);
      })
      .catch(() => {
        setError("Unable to load dealers. Please try again.");
      });
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const productName = formData.productName.trim();
    const category = formData.category.trim();
    const unitPrice = Number(formData.unitPrice);
    const quantity = Number(formData.quantity);

    if (!productName) {
      setError("Product name cannot be empty.");
      return;
    }

    if (!category) {
      setError("Category cannot be empty.");
      return;
    }

    if (!formData.unitPrice || unitPrice <= 0) {
      setError("Unit price must be greater than 0.");
      return;
    }

    if (
      formData.quantity === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Quantity must be a whole number and cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const productData = {
        productName,
        category,
        unitPrice,
        quantity,
        dealer: formData.dealerID
          ? { dealerID: Number(formData.dealerID) }
          : null,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText || "Unable to add the product."
        );
      }

      setSuccess("Product added successfully.");

      setFormData({
        productName: "",
        category: "",
        unitPrice: "",
        quantity: "",
        dealerID: "",
      });

      setTimeout(() => {
        onProductAdded();
      }, 800);
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the backend. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="page-header">
        <div>
          <h1>Add Product</h1>
          <p>Add a new product to your store inventory.</p>
        </div>

        <button className="secondary-button" onClick={onCancel}>
          Back to Inventory
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="productName">Product Name</label>

              <input
                id="productName"
                name="productName"
                type="text"
                placeholder="Enter product name"
                value={formData.productName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>

              <input
                id="category"
                name="category"
                type="text"
                placeholder="Enter category"
                value={formData.category}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="unitPrice">Unit Price (₹)</label>

              <input
                id="unitPrice"
                name="unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter unit price"
                value={formData.unitPrice}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Initial Quantity</label>

              <input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                step="1"
                placeholder="Enter initial quantity"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group dealer-field">
              <label htmlFor="dealerID">Dealer</label>

              <select
                id="dealerID"
                name="dealerID"
                value={formData.dealerID}
                onChange={handleChange}
              >
                <option value="">Not assigned</option>

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
          </div>

          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;