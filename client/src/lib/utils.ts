import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// DOM utility functions for safer DOM operations
export const safelyObserveDOM = {
  /**
   * Safely creates a MutationObserver with proper error handling
   * @param callback - The callback function to execute on mutations
   * @param element - The element to observe
   * @param options - MutationObserver options
   * @returns cleanup function
   */
  createObserver: (
    callback: MutationCallback,
    element: Element | null,
    options: MutationObserverInit
  ): (() => void) => {
    if (!element || typeof MutationObserver === "undefined") {
      return () => {}; // Return empty cleanup function
    }

    try {
      const observer = new MutationObserver(callback);
      observer.observe(element, options);

      return () => {
        try {
          observer.disconnect();
        } catch (error) {
          console.warn("Error disconnecting MutationObserver:", error);
        }
      };
    } catch (error) {
      console.warn("Error creating MutationObserver:", error);
      return () => {};
    }
  },

  /**
   * Safely executes a function when DOM is ready
   * @param callback - Function to execute
   */
  onReady: (callback: () => void): void => {
    if (typeof document === "undefined") {
      return;
    }

    if (document.readyState === "loading") {
      const handleReady = () => {
        callback();
        document.removeEventListener("DOMContentLoaded", handleReady);
      };
      document.addEventListener("DOMContentLoaded", handleReady);
    } else {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(callback);
    }
  },

  /**
   * Safely checks if an element is valid for observation
   * @param element - Element to check
   * @returns boolean
   */
  isValidElement: (element: Element | null): element is Element => {
    return element instanceof Element && element.isConnected;
  },
};
