import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Main.tsx is running!");

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
        console.error("Failed to find the root element");
    } else {
        console.log("Found root element, mounting App...");
        createRoot(rootElement).render(<App />);
        console.log("App mounted successfully");
    }
} catch (error) {
    console.error("Error mounting App:", error);
}
