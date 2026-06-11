import '@testing-library/jest-dom'

// jsdom does not implement these browser APIs; framer-motion (useReducedMotion,
// whileInView) and ContentPosts (scrollTo/scrollIntoView) rely on them.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

global.IntersectionObserver = global.IntersectionObserver || MockObserver
global.ResizeObserver = global.ResizeObserver || MockObserver

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {})
window.scrollTo = () => {}
