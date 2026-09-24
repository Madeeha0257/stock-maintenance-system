import { useEffect, useState } from "react";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Failed to load customers.");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
  const loadCustomers = async () => {
    try {
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Failed to load customers.");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  loadCustomers();
}, []);
  const resetForm = () => {
    setCustomerName("");
    setPhone("");
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!customerName.trim()) {
      setError("Customer name cannot be empty.");
      return;
    }

    if (!phone.trim()) {
      setError("Customer phone cannot be empty.");
      return;
    }

    const customerData = {
      customerName: customerName.trim(),
      phone: phone.trim(),
    };

    try {
      const url = editingCustomer
        ? `/api/customers/${editingCustomer.customerID}`
        : "/api/customers";

      const method = editingCustomer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save customer.");
      }

      setSuccess(
        editingCustomer
          ? "Customer updated successfully."
          : "Customer added successfully."
      );

      resetForm();
      fetchCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.customerName);
    setPhone(customer.phone);
    setShowForm(true);
    setError("");
    setSuccess("");
    setSelectedCustomer(null);
  };

  const handleDelete = async (customerID) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/customers/${customerID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete customer.");
      }

      setSuccess("Customer deleted successfully.");
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewHistory = async (customer) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/customers/${customer.customerID}/purchase-history`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load purchase history."
        );
      }

      setSelectedCustomer(customer);
      setPurchaseHistory(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchValue = search.toLowerCase();

    return (
      customer.customerName.toLowerCase().includes(searchValue) ||
      customer.phone.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage store customers and view purchase history.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
            setError("");
            setSuccess("");
          }}
        >
          + Add Customer
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {success && <div className="success-message">{success}</div>}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Customers</span>
          <strong>{customers.length}</strong>
        </div>
      </div>

      {showForm && (
        <div
          className="form-card"
          style={{ marginBottom: "24px" }}
        >
          <h2>
            {editingCustomer ? "Edit Customer" : "Add Customer"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Customer Name</label>

                <input
                  type="text"
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Enter customer name"
                />
              </div>

              <div className="form-group">
                <label>Phone</label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingCustomer
                  ? "Update Customer"
                  : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-card">
        <div className="table-toolbar">
          <div>
            <h2>Customer List</h2>
            <p>Search and manage registered customers.</p>
          </div>

          <input
            className="search-input"
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="empty-message">
                      No customers found.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.customerID}>
                    <td>{customer.customerID}</td>

                    <td className="product-name">
                      {customer.customerName}
                    </td>

                    <td>{customer.phone}</td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="secondary-button"
                          onClick={() =>
                            handleViewHistory(customer)
                          }
                        >
                          View
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            handleEdit(customer)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(customer.customerID)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <div
          className="inventory-card"
          style={{ marginTop: "24px" }}
        >
          <div className="table-toolbar">
            <div>
              <h2>{selectedCustomer.customerName}</h2>
              <p>{selectedCustomer.phone}</p>
            </div>
          </div>

          <div className="table-wrapper">
            {purchaseHistory.length === 0 ? (
              <div className="empty-message">
                No purchase history available.
              </div>
            ) : (
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Bill Date</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseHistory.map((bill) => (
                    <tr key={bill.billID}>
                      <td>{bill.billID}</td>

                      <td>
                        {new Date(
                          bill.billDate
                        ).toLocaleString()}
                      </td>

                      <td>
                        ₹{Number(bill.totalAmount).toFixed(2)}
                      </td>

                      <td>
                        {bill.payment?.paymentMethod || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;