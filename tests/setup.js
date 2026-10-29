import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { JSDOM } from "jsdom";
// Use a real Storage object: Node 25's global webstorage is only a partial stub.
const storageWindow = new JSDOM("", { url: "https://reader.example" }).window;
Object.defineProperty(globalThis, "localStorage", {
  value: storageWindow.localStorage,
  configurable: true,
});
Object.defineProperty(globalThis, "Storage", {
  value: storageWindow.Storage,
  configurable: true,
});
afterEach(() => cleanup());
