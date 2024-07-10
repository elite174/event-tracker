import { EventTrackerElement } from "./lib/event-tracker";

EventTrackerElement.setEventHandler(console.log);

customElements.define("event-tracker", EventTrackerElement);
