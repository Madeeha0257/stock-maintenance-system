import { useEffect, useState } from "react";

function Reports() {
  const [activeReport, setActiveReport] = useState("stock");

  const [stockReport, setStockReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [dealerReports, setDealerReports] = useState([]);
  const [customerReport, setCustomerReport] = useState(null);
  const [valuationReport, setValuationReport] = useState(null);
  const [profitReport, setProfitReport] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reportOptions = [
    {
      id: "stock",
      icon: "📦",
      title: "Stock Report",
      description: "Current stock, status and inventory value",
    },
    {
      id: "sales",
      icon: "💰",
      title: "Sales Report",
      description: "Sales revenue and products sold",
    },
    {
      id: "dealers",
      icon: "🚚",
      title: "Dealer Report",
      description: "Dealer products and purchase orders",
    },
    {
      id: "customers",
      icon: "👥",
      title: "Customer Report",
      description: "Customer purchase history",
    },
    {
      id: "valuation",
      icon: "📊",
      title: "Inventory Valuation",
      description: "Current inventory cost value",
    },
    {
      id: "profit",
      icon: "📈",
      title: "Profit Report",
      description: "Estimated profit using current cost",
    },
  ];

  const loadStockReport = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports/stock");

      if (!response.ok) {
        throw new Error("Unable to load stock report.");
      }

      const data = await response.json();
      setStockReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start date and end date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/reports/sales?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error("Unable to load sales report.");
      }

      const data = await response.json();
      setSalesReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDealerReports = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports/dealers");

      if (!response.ok) {
        throw new Error("Unable to load dealer report.");
      }

      const data = await response.json();
      setDealerReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/customers");

      if (!response.ok) {
        throw new Error("Unable to load customers.");
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerReport = async () => {
    if (!selectedCustomer) {
      setError("Please select a customer.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/reports/customers/${selectedCustomer}`
      );

      if (!response.ok) {
        throw new Error("Unable to load customer report.");
      }

      const data = await response.json();
      setCustomerReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadValuationReport = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports/inventory-valuation");

      if (!response.ok) {
        throw new Error("Unable to load inventory valuation.");
      }

      const data = await response.json();
      setValuationReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProfitReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start date and end date.");
      return;

    }


    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/reports/profit?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        throw new Error("Unable to load profit report.");
      }

      const data = await response.json();
      setProfitReport(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
  const timer = setTimeout(() => {
    if (activeReport === "stock") {
      loadStockReport();
    } else if (activeReport === "dealers") {
      loadDealerReports();
    } else if (activeReport === "valuation") {
      loadValuationReport();
    } else if (activeReport === "customers") {
      loadCustomers();
    }
  }, 0);

  return () => clearTimeout(timer);
}, [activeReport]);


  const handleReportChange = (report) => {
    setActiveReport(report);
    setError("");
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "Not set";
    }

    return `₹${Number(value).toFixed(2)}`;
  };

   const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString();
  };

  const getBarWidth = (value, maxValue) => {
    if (!maxValue || value <= 0) {
      return 0;
    }

    return Math.max((value / maxValue) * 100, 4);
  };

  const getProductTotals = (items, valueKey) => {
    const totals = {};

    items.forEach((item) => {
      const productName = item.product || "Unknown Product";
      const value = Number(item[valueKey] ?? 0);

      totals[productName] = (totals[productName] || 0) + value;
    });

    return Object.entries(totals)
      .map(([product, value]) => ({ product, value }))
      .sort((a, b) => b.value - a.value);
  };

  const renderStockReport = () => {
    if (!stockReport) {
      return null;
    }

    return (
      <>
        <div className="summary-grid">
          <div className="summary-card">
            <span>Total Products</span>
            <strong>{stockReport.totalProducts}</strong>
          </div>

          <div className="summary-card">
            <span>Total Units</span>
            <strong>{stockReport.totalUnits}</strong>
          </div>

          <div className="summary-card">
            <span>Inventory Cost Value</span>
            <strong>
              {formatCurrency(stockReport.totalInventoryCostValue)}
            </strong>
          </div>

          <div className="summary-card">
            <span>Out of Stock</span>
            <strong>{stockReport.outOfStock}</strong>
          </div>

          <div className="summary-card">
            <span>Low Stock</span>
            <strong>{stockReport.lowStock}</strong>
          </div>

          <div className="summary-card">
            <span>Missing Cost</span>
            <strong>{stockReport.productsMissingCost}</strong>
          </div>
        </div>

                <div className="report-chart-card">
          <div className="report-chart-header">
            <div>
              <h3>Current Stock by Product</h3>
              <p>Visual comparison of current stock quantities.</p>
            </div>
          </div>

          <div className="report-bar-chart">
            {stockReport.products.length === 0 ? (
              <p className="empty-state">No stock data available.</p>
            ) : (
              stockReport.products
                .slice()
                .sort((a, b) => b.currentStock - a.currentStock)
                .map((product) => {
                  const maxStock = Math.max(
                    ...stockReport.products.map(
                      (item) => Number(item.currentStock) || 0
                    )
                  );

                  return (
                    <div className="report-bar-row" key={product.productID}>
                      <span className="report-bar-label">
                        {product.productName}
                      </span>

                      <div className="report-bar-track">
                        <div
                          className="report-bar-fill"
                          style={{
                            width: `${getBarWidth(
                              Number(product.currentStock) || 0,
                              maxStock
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="report-bar-value">
                        {product.currentStock}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>


        <div className="inventory-card">
          <div className="table-toolbar">
            <div>
              <h3>Current Stock</h3>
              <p>Current inventory based on stock quantity and cost price.</p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Dealer</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Current Stock</th>
                  <th>Stock Value</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {stockReport.products.map((product) => (
                  <tr key={product.productID}>
                    <td>{product.productID}</td>
                    <td>{product.productName}</td>
                    <td>{product.category}</td>
                    <td>{product.dealer}</td>
                    <td>{formatCurrency(product.costPrice)}</td>
                    <td>{formatCurrency(product.sellingPrice)}</td>
                    <td>{product.currentStock}</td>
                    <td>{formatCurrency(product.stockValue)}</td>
                    <td>
                      <span
                        className={`stock-badge ${
                          product.stockStatus === "In Stock"
                            ? "in-stock"
                            : product.stockStatus === "Low Stock"
                            ? "low-stock"
                            : "out-of-stock"
                        }`}
                      >
                        {product.stockStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderSalesReport = () => {
    if (!salesReport) {
      return null;
    }

    return (
      <>
        <div className="summary-grid">
          <div className="summary-card">
            <span>Total Revenue</span>
            <strong>{formatCurrency(salesReport.totalRevenue)}</strong>
          </div>

          <div className="summary-card">
            <span>Total Orders</span>
            <strong>{salesReport.totalOrders}</strong>
          </div>

          <div className="summary-card">
            <span>Total Items Sold</span>
            <strong>{salesReport.totalItemsSold}</strong>
          </div>

          <div className="summary-card">
            <span>Average Bill Value</span>
            <strong>{formatCurrency(salesReport.averageBillValue)}</strong>
          </div>
        </div>

                <div className="report-chart-card">
          <div className="report-chart-header">
            <div>
              <h3>Revenue by Product</h3>
              <p>Revenue generated by each product in the selected period.</p>
            </div>
          </div>

          <div className="report-bar-chart">
            {salesReport.sales.length === 0 ? (
              <p className="empty-state">No sales data available.</p>
            ) : (
              (() => {
                const revenueTotals = getProductTotals(
                  salesReport.sales,
                  "revenue"
                );

                const maxRevenue = Math.max(
                  ...revenueTotals.map((item) => item.value)
                );

                return revenueTotals.map((item) => (
                  <div className="report-bar-row" key={item.product}>
                    <span className="report-bar-label">
                      {item.product}
                    </span>

                    <div className="report-bar-track">
                      <div
                        className="report-bar-fill"
                        style={{
                          width: `${getBarWidth(
                            item.value,
                            maxRevenue
                          )}%`,
                        }}
                      />
                    </div>

                    <span className="report-bar-value">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ));
              })()
            )}
          </div>
        </div>


        <div className="inventory-card">
          <div className="table-toolbar">
            <div>
              <h3>Sales Transactions</h3>
              <p>
                {salesReport.startDate} to {salesReport.endDate}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Selling Price</th>
                  <th>Revenue</th>
                  <th>Payment</th>
                </tr>
              </thead>

              <tbody>
                {salesReport.sales.map((sale, index) => (
                  <tr key={`${sale.billID}-${index}`}>
                    <td>{sale.billID}</td>
                    <td>{formatDate(sale.date)}</td>
                    <td>{sale.product}</td>
                    <td>{sale.quantitySold}</td>
                    <td>{formatCurrency(sale.sellingPrice)}</td>
                    <td>{formatCurrency(sale.revenue)}</td>
                    <td>{sale.paymentMethod}</td>
                  </tr>
                ))}

                {salesReport.sales.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No sales found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderDealerReport = () => {
    return (
      <div className="report-stack">
        {dealerReports.map((dealer) => (
          <div className="inventory-card" key={dealer.dealerID}>
            <div className="table-toolbar">
              <div>
                <h3>{dealer.dealerName}</h3>
                <p>
                  {dealer.phone} • {dealer.address}
                </p>
              </div>

              <span className="report-count">
                {dealer.purchaseOrders.length} Purchase Orders
              </span>
            </div>

            <div className="report-info-grid">
              <div>
                <span>Dealer ID</span>
                <strong>{dealer.dealerID}</strong>
              </div>

              <div>
                <span>Products Supplied</span>
                <strong>{dealer.suppliedProducts.length}</strong>
              </div>

              <div>
                <span>Purchase Orders</span>
                <strong>{dealer.purchaseOrders.length}</strong>
              </div>
            </div>

            {dealer.suppliedProducts.length > 0 && (
              <div className="report-section">
                <h4>Supplied Products</h4>

                <div className="report-chip-list">
                  {dealer.suppliedProducts.map((product) => (
                    <span className="report-chip" key={product.productID}>
                      {product.productName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="report-section">
              <h4>Purchase Orders</h4>

              {dealer.purchaseOrders.length === 0 ? (
                <p className="empty-state">No purchase orders found.</p>
              ) : (
                <div className="table-wrapper">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>PO ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Items</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dealer.purchaseOrders.map((order) => (
                        <tr key={order.purchaseOrderID}>
                          <td>{order.purchaseOrderID}</td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>
                            <span className="report-status">
                              {order.status}
                            </span>
                          </td>
                          <td>
                            {order.items.map((item, index) => (
                              <div key={index} className="report-item-line">
                                {item.product} × {item.quantity} @{" "}
                                {formatCurrency(item.unitPrice)}
                              </div>
                            ))}
                          </td>
                          <td>{formatCurrency(order.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {dealerReports.length === 0 && (
          <div className="inventory-card">
            <p className="empty-state">No dealers found.</p>
          </div>
        )}
      </div>
    );
  };

  const renderCustomerReport = () => {
    if (!customerReport) {
      return (
        <div className="inventory-card">
          <p className="empty-state">
            Select a customer and generate the report.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="summary-grid">
          <div className="summary-card">
            <span>Customer</span>
            <strong>{customerReport.customer.customerName}</strong>
          </div>

          <div className="summary-card">
            <span>Total Orders</span>
            <strong>{customerReport.totalOrders}</strong>
          </div>

          <div className="summary-card">
            <span>Total Spent</span>
            <strong>{formatCurrency(customerReport.totalSpent)}</strong>
          </div>

          <div className="summary-card">
            <span>Average Order</span>
            <strong>{formatCurrency(customerReport.averageOrder)}</strong>
          </div>
        </div>

        <div className="inventory-card">
          <div className="table-toolbar">
            <div>
              <h3>{customerReport.customer.customerName}</h3>
              <p>
                Customer ID: {customerReport.customer.customerID} •{" "}
                {customerReport.customer.phone}
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Date</th>
                  <th>Products</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {customerReport.purchases.map((purchase) => (
                  <tr key={purchase.billID}>
                    <td>{purchase.billID}</td>
                    <td>{formatDate(purchase.date)}</td>
                    <td>
                      {purchase.items.map((item, index) => (
                        <div key={index} className="report-item-line">
                          {item.product} × {item.quantity} @{" "}
                          {formatCurrency(item.sellingPrice)}
                        </div>
                      ))}
                    </td>
                    <td>{purchase.paymentMethod}</td>
                    <td>{formatCurrency(purchase.totalAmount)}</td>
                  </tr>
                ))}

                {customerReport.purchases.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No purchases found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderValuationReport = () => {
    if (!valuationReport) {
      return null;
    }

    return (
      <>
        <div className="summary-grid">
          <div className="summary-card">
            <span>Total Inventory Cost Value</span>
            <strong>{formatCurrency(valuationReport.totalValuation)}</strong>
          </div>

          <div className="summary-card">
            <span>Products Missing Cost</span>
            <strong>{valuationReport.productsMissingCost}</strong>
          </div>

          <div className="summary-card">
            <span>Valuation Basis</span>
            <strong>Current Cost</strong>
          </div>
        </div>

        <div className="inventory-card">
          <div className="table-toolbar">
            <div>
              <h3>Inventory Valuation</h3>
              <p>
                Current stock quantity multiplied by current purchase cost.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Cost Price</th>
                  <th>Stock Value</th>
                  <th>Cost Information</th>
                </tr>
              </thead>

              <tbody>
                {valuationReport.products.map((product) => (
                  <tr key={product.productID}>
                    <td>{product.productID}</td>
                    <td>{product.productName}</td>
                    <td>{product.category}</td>
                    <td>{product.currentStock}</td>
                    <td>{formatCurrency(product.costPrice)}</td>
                    <td>{formatCurrency(product.stockValue)}</td>
                    <td>
                      <span
                        className={
                          product.costInformation === "Available"
                            ? "report-status available"
                            : "report-status missing"
                        }
                      >
                        {product.costInformation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  const renderProfitReport = () => {
    if (!profitReport) {
      return null;
    }

    return (
      <>
        <div className="summary-grid">
          <div className="summary-card">
            <span>Total Revenue</span>
            <strong>{formatCurrency(profitReport.totalRevenue)}</strong>
          </div>

          <div className="summary-card">
            <span>Estimated Cost</span>
            <strong>
              {formatCurrency(profitReport.totalEstimatedCost)}
            </strong>
          </div>

          <div className="summary-card">
            <span>Estimated Profit</span>
            <strong>
              {formatCurrency(profitReport.totalEstimatedProfit)}
            </strong>
          </div>

          <div className="summary-card">
            <span>Missing Cost Items</span>
            <strong>{profitReport.productsMissingCost}</strong>
          </div>
        </div>

                <div className="report-chart-card">
          <div className="report-chart-header">
            <div>
              <h3>Revenue vs Estimated Cost</h3>
              <p>
                Comparison based on the selected period and current cost basis.
              </p>
            </div>
          </div>

          <div className="report-comparison-chart">
            {[
              {
                label: "Revenue",
                value: Number(profitReport.totalRevenue) || 0,
              },
              {
                label: "Estimated Cost",
                value: Number(profitReport.totalEstimatedCost) || 0,
              },
            ].map((item) => {
              const maxValue = Math.max(
                Number(profitReport.totalRevenue) || 0,
                Number(profitReport.totalEstimatedCost) || 0
              );

              return (
                <div className="report-bar-row" key={item.label}>
                  <span className="report-bar-label">{item.label}</span>

                  <div className="report-bar-track">
                    <div
                      className="report-bar-fill"
                      style={{
                        width: `${getBarWidth(item.value, maxValue)}%`,
                      }}
                    />
                  </div>

                  <span className="report-bar-value">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="inventory-card">
          <div className="table-toolbar">
            <div>
              <h3>Estimated Profit</h3>
              <p>
                {profitReport.startDate} to {profitReport.endDate}
              </p>
            </div>

            <span className="report-status">
              Current Cost Basis
            </span>
          </div>

          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Selling Price</th>
                  <th>Revenue</th>
                  <th>Cost Price</th>
                  <th>Estimated Cost</th>
                  <th>Estimated Profit</th>
                </tr>
              </thead>

              <tbody>
                {profitReport.sales.map((sale, index) => (
                  <tr key={`${sale.billID}-${index}`}>
                    <td>{sale.billID}</td>
                    <td>{formatDate(sale.date)}</td>
                    <td>{sale.product}</td>
                    <td>{sale.quantitySold}</td>
                    <td>{formatCurrency(sale.sellingPrice)}</td>
                    <td>{formatCurrency(sale.revenue)}</td>
                    <td>{formatCurrency(sale.costPrice)}</td>
                    <td>{formatCurrency(sale.estimatedCost)}</td>
                    <td>{formatCurrency(sale.estimatedProfit)}</td>
                  </tr>
                ))}

                {profitReport.sales.length === 0 && (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      No sales found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-note">
          <strong>Note:</strong> Profit is an estimate based on the current
          Product cost price. It is not historical accounting profit.
        </div>
      </>
    );
  };

  const renderReport = () => {
    if (loading) {
      return <div className="page-message">Loading report...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    if (activeReport === "stock") {
      return renderStockReport();
    }

    if (activeReport === "sales") {
      return renderSalesReport();
    }

    if (activeReport === "dealers") {
      return renderDealerReport();
    }

    if (activeReport === "customers") {
      return renderCustomerReport();
    }

    if (activeReport === "valuation") {
      return renderValuationReport();
    }

    if (activeReport === "profit") {
      return renderProfitReport();
    }

    return null;
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>
            View stock, sales, dealer, customer, valuation and profit
            information.
          </p>
        </div>
      </div>

      <div className="report-selector">
  {reportOptions.map((report) => (
    <button
      key={report.id}
      className={`report-card ${
        activeReport === report.id ? "active" : ""
      }`}
      onClick={() => handleReportChange(report.id)}
    >
      <span className="report-card-icon">{report.icon}</span>

      <span className="report-card-content">
        <strong>{report.title}</strong>
        <small>{report.description}</small>
      </span>

      <span className="report-card-arrow">→</span>
    </button>
  ))}
</div>

      {(activeReport === "sales" || activeReport === "profit") && (
        <div className="report-filters">
          <div className="filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>

          <button
            className="primary-button"
            onClick={
              activeReport === "sales"
                ? loadSalesReport
                : loadProfitReport
            }
          >
            Generate Report
          </button>
        </div>
      )}

      {activeReport === "customers" && (
        <div className="report-filters">
          <div className="filter-group">
            <label htmlFor="customer">Customer</label>

            <select
              id="customer"
              value={selectedCustomer}
              onChange={(event) => {
                setSelectedCustomer(event.target.value);
                setCustomerReport(null);
                setError("");
              }}
            >
              <option value="">Select customer</option>

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

          <button
            className="primary-button"
            onClick={loadCustomerReport}
          >
            Generate Report
          </button>
        </div>
      )}

      <div className="report-content">{renderReport()}</div>
    </div>
  );
}

export default Reports;