export type ETEventHandler = <T>(
  event: Event,
  data: T,
  trackerElement: EventTrackerElement,
  targetElement: HTMLElement
) => void;

export type ETEventName = keyof HTMLElementEventMap;
export type ETEventOptions =
  | boolean
  | ({ data?: string | number | boolean | object } & Omit<AddEventListenerOptions, "signal">);
export type ETEventConfig = Partial<Record<ETEventName, ETEventOptions>>;

export class EventTrackerElement extends HTMLElement {
  /** This function should be defined from outside. It is used to handle events. */
  private static eventHandler: ETEventHandler = () => {};

  /** Static setter for all  */
  public static setEventHandler(eventHandler: ETEventHandler) {
    this.eventHandler = eventHandler;
  }

  private currentTrackConfig: ETEventConfig | undefined;
  /** This abort controller is used to remove event listeners */
  private eventsAbortController = new AbortController();

  set trackConfig(config: ETEventConfig | undefined) {
    this.setAttribute("has-config", config ? "true" : "false");

    this.unregisterEventListeners();
    this.currentTrackConfig = config;
    this.registerDOMEventsCallbacks();
  }

  get trackConfig() {
    return this.currentTrackConfig;
  }

  set disabled(value: boolean | undefined) {
    if (value) {
      this.setAttribute("disabled", "true");
      this.unregisterEventListeners();
    } else {
      this.removeAttribute("disabled");
      this.registerDOMEventsCallbacks();
    }
  }

  get disabled() {
    return this.hasAttribute("disabled");
  }

  private registerDOMEventsCallbacks() {
    if (!this.currentTrackConfig || this.disabled) return;

    this.eventsAbortController = new AbortController();

    for (const [eventName, options] of Object.entries(this.currentTrackConfig)) {
      this.childNodes.forEach((child) => {
        // Add event listener only to HTMLElements
        if (child instanceof HTMLElement && options !== false) {
          const data = typeof options === "boolean" ? undefined : options;

          child.addEventListener(
            eventName,
            (event) => {
              // Don't trigger event if the target is not the child
              if (event.target !== child) return;

              EventTrackerElement.eventHandler(event, data?.data, this, child);
            },
            {
              capture: data?.capture,
              once: data?.once,
              passive: data?.passive,
              signal: this.eventsAbortController.signal,
            }
          );
        }
      });
    }
  }

  private unregisterEventListeners() {
    this.eventsAbortController.abort();
  }

  disconnectedCallback() {
    this.unregisterEventListeners();
  }
}
