# Event tracker custom element

This custom element can be used mostly for tracking events for analytics. It wraps html elements and tracks some events on **direct children**.

## Usage

```html
<script>
  // 1. Create event handler
  // trackerElement is the instance of EventTrackerElement
  const eventHandler = (event, data, trackerElement) => console.log(event, data, trackerElement);

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
<event-tracker event="click" data='{a: "hi"}'>
  <button type="button">Click me</button>
</event-tracker>

<!-- Data can be string or number too -->
<event-tracker event="click" data="Some string">
  <button type="button">Click me</button>
</event-tracker>

<!-- You may not pass any data if you don't need it -->
<event-tracker event="click">
  <button type="button">Click me</button>
</event-tracker>

<!-- You may track multiple events at the same time -->
<event-tracker event="click|appear">
  <button type="button">Click me</button>
</event-tracker>

<!-- You may disable tracking. No events will be called -->
<event-tracker event="click|appear" disabled>
  <button type="button">Click me</button>
</event-tracker>
```

## Supported attributes

- `event` - trigger type. Possible options:
  - `appear` - will be triggered on mount (`connectedCallback`)
  - `change`, `click` - DOM events
- `data` - a data which will be passed to callback.
- `disabled` - disables tracking events

## LICENSE

MIT
