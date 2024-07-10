import { describe, expect, vi, beforeAll } from "vitest";

import { EventTrackerElement } from "./event-tracker";

describe("EventTrackerElement", () => {
  // define the element before running the tests
  beforeAll(async () => {
    window.customElements.define("event-tracker", EventTrackerElement);

    await window.customElements.whenDefined("event-tracker");
  });

  const getMockHandlerAttachedToCustomElement = () => {
    const mockHandler = vi.fn();

    EventTrackerElement.setEventHandler(mockHandler);

    return mockHandler;
  };

  describe("should only add events to direct child", (test) => {
    test("non-direct child", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="click">
          <div>
            <button id="button">button</button>
          </div>
        </event-tracker>`;

      window.document.getElementById("button")?.click();

      expect(mockHandler).not.toBeCalled();
    });
  });

  describe("should correctly handle events", (test) => {
    test("appear event", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="appear">
            <button>button</button>
        </event-tracker>`;

      expect(mockHandler).toBeCalledTimes(1);
      expect(mockHandler.mock.lastCall?.length).toBe(3);
      expect(mockHandler.mock.lastCall?.slice(0, 2)).toStrictEqual(["appear", null]);
    });

    test("click event", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
      <event-tracker event="click">
          <button id="button">button</button>
      </event-tracker>`;

      window.document.getElementById("button")?.click();

      expect(mockHandler).toBeCalledTimes(1);
      expect(mockHandler.mock.lastCall?.length).toBe(3);
      expect(mockHandler.mock.lastCall?.slice(0, 2)).toStrictEqual(["click", null]);
    });

    test("multiple events", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="appear|click">
            <button id="button">button</button>
        </event-tracker>`;

      window.document.getElementById("button")?.click();

      expect(mockHandler).toBeCalledTimes(2);
      expect(mockHandler.mock.calls[0].slice(0, 2)).toStrictEqual(["appear", null]);
      expect(mockHandler.mock.calls[1].slice(0, 2)).toStrictEqual(["click", null]);
    });
  });

  describe("should correctly parse the data", (test) => {
    test("should parse object data", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      const testData = { data: 123 };

      window.document.body.innerHTML = `
        <event-tracker event="appear" data='${JSON.stringify(testData)}'>
            <button>button</button>
        </event-tracker>`;

      expect(mockHandler.mock.lastCall?.slice(0, 2)).toStrictEqual(["appear", testData]);
    });

    test("should parse non-object data", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      const testData = "test";

      window.document.body.innerHTML = `
        <event-tracker event="appear" data="${testData}">
            <button>button</button>
        </event-tracker>`;

      expect(mockHandler.mock.lastCall?.slice(0, 2)).toStrictEqual(["appear", testData]);
    });

    test("should return null if data is not provided", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="appear">
            <button>button</button>
        </event-tracker>`;

      expect(mockHandler.mock.lastCall?.slice(0, 2)).toStrictEqual(["appear", null]);
    });
  });

  describe('should correctly handle "disabled" attribute', (test) => {
    test("should not handle events if disabled", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="appear" disabled>
            <button>button</button>
        </event-tracker>`;

      expect(mockHandler).not.toBeCalled();
    });

    test("should handle events if not disabled", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="appear">
            <button>button</button>
        </event-tracker>`;

      expect(mockHandler).toBeCalled();
    });

    test("should correctly handle switching from disabled to enabled", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="appear" disabled>
            <button>button</button>
        </event-tracker>`;

      expect(mockHandler).not.toBeCalled();

      window.document.querySelector("event-tracker")?.removeAttribute("disabled");

      expect(mockHandler).toBeCalled();
    });

    test("should correctly handle switching from enabled to disabled", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker event="click">
            <button id="button">button</button>
        </event-tracker>`;

      window.document.getElementById("button")?.click();
      expect(mockHandler).toBeCalledTimes(1);

      window.document.querySelector("event-tracker")?.setAttribute("disabled", "");
      window.document.getElementById("button")?.click();

      expect(mockHandler).toBeCalledTimes(1);
    });
  });
});
