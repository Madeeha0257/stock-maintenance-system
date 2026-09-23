import { useEffect, useState } from "react";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    fetch("/api/test")
      .then((response) => response.text())
      .then((data) => {
        setBackendStatus(data);
      })
      .catch(() => {
        setBackendStatus("Backend Not Connected");
      });
  }, []);

  return (
    <div>
      <h1>Stock Maintenance System</h1>
      <p>Backend Status: {backendStatus}</p>
    </div>
  );
}

export default App;