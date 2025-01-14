import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// App entry point
import { App } from "./App";

// Styles
import "./styles/index.scss"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
