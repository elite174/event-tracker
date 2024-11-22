# Event tracker custom element

This custom element can be used mostly for tracking events for analytics. It wraps html elements and tracks some events on **direct children**.

## Usage

```html
<script>
  // 1. Create event handler
  // trackerElement is the instance of EventTrackerElement
  const eventHandler = (event, data, trackerElement, targetElement) =>
    console.log(event, data, trackerElement, targetElement);

  // 2. Set event handler BEFORE register it (to correctly handle `appear` events)
  EventTrackerElement.setEventHandler(eventHandler);

  // 3. Register custom element
  customElements.define("event-tracker", EventTrackerElement);
</script>

<style>
  /** Don't forget to add this to make tracker invisible to your styles */
  event-tracker {
    display: contents;
  }
</style>

<h1>Examples</h1>
<!-- On every button click event handler will be fired -->
<event-tracker>
  <button type="button">Click me</button>
</event-tracker>
<script>
  document.querySelector("event-tracker").trackConfig = {
    // listen to DOM events
    click: true,
    // skip some events
    mousedown: false,
    mouseup: {
      // pass custom data
      data: {
        customData: "Hello",
      },
      // pass event listener options
      capture: true,
      once: true,
      passive: false,
    },
  };

  // disable if necessary
  document.querySelector("event-tracker").disabled = true;
</script>
```

## Supported attributes

- `disabled` - disables tracking events

## Types

```tsx
export type ETEventHandler = <T>(
  event: Event,
  data: T,
  trackerElement: EventTrackerElement,
  targetElement: HTMLElement
) => void;
export declare const ET_SUPPORTED_ATTRIBUTE_MAP: {
  readonly DISABLED: "disabled";
};
export type ETEventName = keyof HTMLElementEventMap;
export type ETEventOptions =
  | boolean
  | ({
      data?: string | number | boolean | object;
    } & Omit<AddEventListenerOptions, "signal">);
export type ETEventConfig = Partial<Record<ETEventName, ETEventOptions>>;
export interface EventTrackerHTMLAttributes {
  /** Disables event tracking */
  [ET_SUPPORTED_ATTRIBUTE_MAP.DISABLED]?: boolean;
}
export declare class EventTrackerElement extends HTMLElement {
  static observedAttributes: "disabled"[];
  /** This function should be defined from outside. It is used to handle events. */
  private static eventHandler;
  /** Static setter for all  */
  static setEventHandler(eventHandler: ETEventHandler): void;
  private currentTrackConfig;
  /** This abort controller is used to remove event listeners */
  private eventsAbortController;
  set trackConfig(val: ETEventConfig | undefined);
  get trackConfig(): ETEventConfig | undefined;
  set disabled(value: boolean | undefined);
  get disabled(): boolean | undefined;
  /** This function registers callbacks on interaction events (like 'click') */
  private registerDOMEventsCallbacks;
  private unregisterEventListeners;
  disconnectedCallback(): void;
}
```

## LICENSE

MIT
