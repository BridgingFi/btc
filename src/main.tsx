import {
  init as initTMA,
  LaunchParamsRetrieveError,
} from "@telegram-apps/sdk-react";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import debug from "debug";
import * as Sentry from "@sentry/react";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import "@/styles/globals.css";

Sentry.init({
  enabled: !import.meta.env.DEV && import.meta.env.VITE_SENTRY_DSN,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

// enable debug logs in browser console according to VITE_DEBUG
if (import.meta.env.VITE_DEBUG) debug.enable(import.meta.env.VITE_DEBUG);
const log = debug("app:main");

// Initialize telegram apps sdk
try {
  initTMA();
} catch (error) {
  log("Failed to initialize TMA: %o", error);
  if (!(error instanceof LaunchParamsRetrieveError)) {
    Sentry.captureException(error);
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
