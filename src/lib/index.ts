export type ETEvent = (typeof SUPPORTED_EVENT_MAP)[keyof typeof SUPPORTED_EVENT_MAP];
export type ETEventHandler = <T>(event: ETEvent, data: T, trackerElement: EventTrackerElement) => void;
type ObservedAttribute = (typeof SUPPORTED_ATTRIBUTE_MAP)["DISABLED"];

export const SUPPORTED_ATTRIBUTE_MAP = {
  DISABLED: "disabled",
  EVENT: "event",
  DATA: "data",
} as const;

/** Supported DOM events */
export const SUPPORTED_DOM_EVENT_MAP = {
  CLICK: "click",
  CHANGE: "change",
};

export const SUPPORTED_EVENT_MAP = {
  ...SUPPORTED_DOM_EVENT_MAP,
  /** This event is fired on mount (connectedCallback) */
  APPEAR: "appear",
} as const;

const parseBoolean = (value: any): boolean => {
  if (value === "false" || value === null || value === false) return false;

  // empty attributes like <event-tracker disabled> should be treated as true
  return true;
};

const SUPPORTED_EVENTS_SET = new Set<ETEvent>(Object.values(SUPPORTED_EVENT_MAP));
const SUPPORTED_DOM_EVENTS_SET = new Set(Object.values(SUPPORTED_DOM_EVENT_MAP));

export class EventTrackerElement extends HTMLElement {
  static observedAttributes = [SUPPORTED_ATTRIBUTE_MAP.DISABLED];

  /** This function should be defined from outside. It is used to handle events. */
  private static eventHandler: ETEventHandler = () => {};

  /** Static setter for all  */
  public static setEventHandler(eventHandler: ETEventHandler) {
    this.eventHandler = eventHandler;
  }

  /** This abort controller is used to remove event listeners */
  private eventsAbortController = new AbortController();

  private getEventTypes(): ETEvent[] {
    return (
      this.getAttribute(SUPPORTED_ATTRIBUTE_MAP.EVENT)
        ?.split("|")
        .filter((event): event is ETEvent => SUPPORTED_EVENTS_SET.has(event as ETEvent)) ?? []
    );
  }

  /** Returns parsed json from SUPPORTED_ATTRIBUTE_MAP.DATA attribute */
  private getParsedData<T>(): T | null {
    const data = this.getAttribute(SUPPORTED_ATTRIBUTE_MAP.DATA);

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return data as unknown as T;
    }
  }

  /** This function registers callbacks on interaction events (like 'click') */
  private registerDOMEventsCallbacks(eventTypes: ETEvent[]) {
    for (const eventType of eventTypes) {
      // Do nothing for non-dom events
      if (!SUPPORTED_DOM_EVENTS_SET.has(eventType)) continue;

      this.childNodes.forEach((child) => {
        // Add event listener only to HTMLElements
        if (child instanceof HTMLElement)
          child.addEventListener(
            eventType,
            (event) => {
              // Don't trigger event if the target is not the child
              if (event.target !== child) return;

              EventTrackerElement.eventHandler(eventType, this.getParsedData(), this);
            },
            {
              signal: this.eventsAbortController.signal,
            }
          );
      });
    }
  }

  private initEventCallbacks() {
    const eventTypes = this.getEventTypes();
    this.registerDOMEventsCallbacks(eventTypes);

    // Trigger appear event on mount
    if (eventTypes.includes("appear")) EventTrackerElement.eventHandler("appear", this.getParsedData(), this);
  }

  private updateDisabledState(disabled: boolean) {
    if (disabled) {
      // Remove event listeners
      this.eventsAbortController.abort();
      // and reset the controller
      this.eventsAbortController = new AbortController();
    } else {
      this.initEventCallbacks();
    }
  }

  attributeChangedCallback(name: ObservedAttribute, _: string, newValue: string) {
    switch (name) {
      case SUPPORTED_ATTRIBUTE_MAP.DISABLED: {
        this.updateDisabledState(parseBoolean(newValue));

        break;
      }
    }
  }

  connectedCallback() {
    this.updateDisabledState(parseBoolean(this.getAttribute(SUPPORTED_ATTRIBUTE_MAP.DISABLED)));
  }

  disconnectedCallback() {
    // Remove event listeners
    this.eventsAbortController.abort();
  }
}
