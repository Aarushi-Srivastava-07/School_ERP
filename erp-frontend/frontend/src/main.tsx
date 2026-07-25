import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { ERPProvider } from "./context/ERPContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ERPProvider>
        <App />
      </ERPProvider>
    </AuthProvider>
  </StrictMode>
);