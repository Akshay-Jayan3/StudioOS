import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "designos",
  apiKey: process.env.TRIGGER_SECRET_KEY!,
  apiUrl: "https://api.trigger.dev",
});
