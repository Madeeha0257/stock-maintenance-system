import { useEffect, useState } from "react";

function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);

  const [dealerName, setDealerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [selectedDealer, setSelectedDealer] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDealers = async () => {
    try {
      const response = await fetch("/api/dealers");

      if (!response.ok) {
        throw new Error("Failed to load dealers.");
      }

      const data = await response.json();
      setDealers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadDealers = async () => {
      try {
        const response = await fetch("/api/dealers");

        if (!response.ok) {
          throw new Error("Failed to load dealers.");
        }

        const data = await response.json();
        setDealers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDealers();
  }, []);

  const resetForm = () => {
    setDealerName("");
    setPhone("");
    setAddress("");
    setEditingDealer(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!dealerName.trim()) {
      setError("Dealer name cannot be empty.");
      return;
    }

    if (!phone.trim()) {
      setError("Dealer phone cannot be empty.");
      return;
    }

    if (!address.trim()) {
      setError("Dealer address cannot be empty.");
      return;
    }

    const dealerData = {
      dealerName: dealerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      const url = editingDealer
        ? `/api/dealers/${editingDealer.dealerID}`
        : "/api/dealers";

      const method = editingDealer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dealerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save dealer.");
      }

      setSuccess(
        editingDealer
          ? "Dealer updated successfully."
          : "Dealer added successfully."
      );

      resetForm();
      fetchDealers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (dealer) => {
    setEditingDealer(dealer);
    setDealerName(dealer.dealerName);
    setPhone(dealer.phone);
    setAddress(dealer.address);

    setShowForm(true);
    setSelectedDealer(null);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (dealerID) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this dealer?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/dealers/${dealerID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete dealer.");
      }

      setSuccess("Dealer deleted successfully.");
      setSelectedDealer(null);

      fetchDealers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleView = (dealer) => {
    setSelectedDealer(dealer);
    setShowForm(false);
    setError("");
    setSuccess("");
  };

  const filteredDealers = dealers.filter((dealer) => {
    const searchValue = search.toLowerCase();

    return (
      dealer.dealerName.toLowerCase().includes(searchValue) ||
      dealer.phone.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dealers</h1>
          <p>Manage store suppliers and dealer information.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
            setSelectedDealer(null);
            setError("");
            setSuccess("");
          }}
        >
          + Add Dealer
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Dealers</span>
          <strong>{dealers.length}</strong>
        </div>
      </div>

      {showForm && (
        <div
          className="form-card"
          style={{ marginBottom: "24px" }}
        >
          <h2>
            {editingDealer ? "Edit Dealer" : "Add Dealer"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Dealer Name</label>

                <input
                  type="text"
                  value={dealerName}
                  onChange={(event) =>
                    setDealerName(event.target.value)
                  }
                  placeholder="Enter dealer name"
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

              <div className="form-group">
                <label>Address</label>

                <input
                  type="text"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Enter dealer address"
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
                {editingDealer
                  ? "Update Dealer"
                  : "Save Dealer"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-card">
        <div className="table-toolbar">
          <div>
            <h2>Dealer List</h2>
            <p>Search and manage registered dealers.</p>
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
                <th>Dealer ID</th>
                <th>Dealer Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-message">
                      No dealers found.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDealers.map((dealer) => (
                  <tr key={dealer.dealerID}>
                    <td>{dealer.dealerID}</td>

                    <td className="product-name">
                      {dealer.dealerName}
                    </td>

                    <td>{dealer.phone}</td>

                    <td>{dealer.address}</td>

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
                            handleView(dealer)
                          }
                        >
                          View
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() =>
                            handleEdit(dealer)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(dealer.dealerID)
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

      {selectedDealer && (
        <div
          className="inventory-card"
          style={{ marginTop: "24px" }}
        >
          <div className="table-toolbar">
            <div>
              <h2>{selectedDealer.dealerName}</h2>
              <p>Dealer Details</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Dealer ID</label>
              <input
                type="text"
                value={selectedDealer.dealerID}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={selectedDealer.phone}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={selectedDealer.address}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dealers;