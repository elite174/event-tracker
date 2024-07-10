import { EventTrackerElement } from "./lib";

EventTrackerElement.setEventHandler(console.log);

customElements.define("event-tracker", EventTrackerElement);
