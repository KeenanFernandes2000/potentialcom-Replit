import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS animation library
AOS.init({
  duration: 800,
  once: false,
  offset: 100,
});

createRoot(document.getElementById("root")!).render(<App />);
