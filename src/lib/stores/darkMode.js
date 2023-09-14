import { writable } from "svelte/store";

/**
 * 
 * @param {boolean} darkMode 
 */
export const createDarkModeStore = (darkMode) => {
  const store = writable(darkMode);
  return store;
}