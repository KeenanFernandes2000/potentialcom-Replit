import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Clean up DOM between tests so renders don't leak state.
afterEach(() => {
  cleanup();
});
