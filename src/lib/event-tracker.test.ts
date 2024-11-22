import { describe, expect, vi, beforeAll } from "vitest";

import { ETEventConfig, ETEventHandler, EventTrackerElement } from ".";

const setTrackConfig = (config: ETEventConfig) => {
  const trackerElement = window.document.querySelector("event-tracker") as EventTrackerElement | undefined;

  if (trackerElement) trackerElement.trackConfig = config;
};

const setDisabled = (disabled: boolean) => {
  const trackerElement = window.document.querySelector("event-tracker") as EventTrackerElement | undefined;

  if (trackerElement) trackerElement.disabled = disabled;
};

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
        <event-tracker>
          <div>
            <button id="button">button</button>
          </div>
        </event-tracker>`;

      setTrackConfig({ click: true });
      window.document.getElementById("button")?.click();

      expect(mockHandler).not.toBeCalled();
    });
  });

  describe("should correctly handle events", (test) => {
    test("click event", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
      <event-tracker>
          <button id="button">button</button>
      </event-tracker>`;

      setTrackConfig({ click: true });
      window.document.getElementById("button")?.click();

      expect(mockHandler).toBeCalledTimes(1);
      const lastCallArguments = mockHandler.mock.lastCall as Parameters<ETEventHandler> | undefined;

      expect(lastCallArguments?.length).toBe(4);
      expect(lastCallArguments?.[0].type).toBe("click");
      expect(lastCallArguments?.[1]).toBe(undefined);
    });

    test("multiple events", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker>
            <button id="button">button</button>
        </event-tracker>`;

      setTrackConfig({ click: true, mousedown: true });

      window.document.getElementById("button")?.click();
      window.document.getElementById("button")?.dispatchEvent(new Event("mousedown"));

      expect(mockHandler).toBeCalledTimes(2);
      expect((mockHandler.mock.calls[0] as Parameters<ETEventHandler> | undefined)?.[0].type).toBe("click");
      expect((mockHandler.mock.calls[1] as Parameters<ETEventHandler> | undefined)?.[0].type).toBe("mousedown");
    });
  });

  describe("should correctly return the data", (test) => {
    test("should parse object data", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker>
            <button>button</button>
        </event-tracker>`;

      setTrackConfig({
        click: {
          data: 123,
        },
      });
      window.document.querySelector("button")?.click();

      const lastCallArguments = mockHandler.mock.lastCall as Parameters<ETEventHandler> | undefined;

      expect(lastCallArguments?.[0].type).toBe("click");
      expect(lastCallArguments?.[1]).toBe(123);
    });

    test("should return undefined if data is not provided", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker>
            <button>button</button>
        </event-tracker>`;

      setTrackConfig({ click: true });

      window.document.querySelector("button")?.click();

      const lastCallArguments = mockHandler.mock.lastCall as Parameters<ETEventHandler> | undefined;

      expect(lastCallArguments?.[0].type).toBe("click");
      expect(lastCallArguments?.[1]).toBe(undefined);
    });
  });

  describe('should correctly handle "disabled" attribute', (test) => {
    test("should not handle events if disabled", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker>
            <button>button</button>
        </event-tracker>`;

      setTrackConfig({ click: true });
      setDisabled(true);
      window.document.querySelector("button")?.click();

      // @ts-ignore
      expect(window.document.querySelector("event-tracker")?.disabled).toBe(true);
      expect(window.document.querySelector("event-tracker")?.getAttribute("disabled")).toBe("true");
      expect(mockHandler).not.toBeCalled();
    });

    test("should correctly handle switching from disabled to enabled", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker>
            <button>button</button>
        </event-tracker>`;

      setTrackConfig({ click: true });
      setDisabled(true);
      window.document.querySelector("button")?.click();

      // @ts-ignore
      expect(window.document.querySelector("event-tracker")?.disabled).toBe(true);
      expect(window.document.querySelector("event-tracker")?.getAttribute("disabled")).toBe("true");
      expect(mockHandler).not.toBeCalled();

      setDisabled(false);

      window.document.querySelector("button")?.click();
      // @ts-ignore
      expect(window.document.querySelector("event-tracker")?.disabled).toBe(false);
      expect(window.document.querySelector("event-tracker")?.getAttribute("disabled")).toBe(null);
      expect(mockHandler).toBeCalled();
    });

    test("should correctly handle switching from enabled to disabled", () => {
      const mockHandler = getMockHandlerAttachedToCustomElement();

      window.document.body.innerHTML = `
        <event-tracker>
            <button>button</button>
        </event-tracker>`;

      setTrackConfig({ click: true });
      window.document.querySelector("button")?.click();

      // @ts-ignore
      expect(window.document.querySelector("event-tracker")?.disabled).toBe(false);
      expect(window.document.querySelector("event-tracker")?.getAttribute("disabled")).toBe(null);
      expect(mockHandler).toBeCalled();

      setDisabled(true);
      window.document.querySelector("button")?.click();

      // @ts-ignore
      expect(window.document.querySelector("event-tracker")?.disabled).toBe(true);
      expect(window.document.querySelector("event-tracker")?.getAttribute("disabled")).toBe("true");
      expect(mockHandler).toBeCalledTimes(1);
    });
  });
});
