import React from "react";
import { createRoot } from "react-dom/client";
import Popup from "./pages/Popup.jsx";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
