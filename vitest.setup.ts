import "@testing-library/jest-dom/vitest";

// Mock ResizeObserver (not implemented in jsdom)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock pointer capture methods (used by Radix UI Select)
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};

// Mock scrollIntoView (used by Radix UI components)
window.HTMLElement.prototype.scrollIntoView = () => {};

// Mock matchMedia (not implemented in jsdom)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Clear localStorage between tests
beforeEach(() => {
  localStorage.clear();
});
