import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/messages/$id")({
  head: () => ({ meta: [{ title: "Messages — Pulse" }] }),
});
