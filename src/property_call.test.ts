import test from "node:test";
import assert from "node:assert/strict";
import { decideNextAction } from "./property_call.ts";

test("a ceiling leak becomes an urgent repair and same-day inspection", () => {
  const action = decideNextAction({
    tenant: "Mina Chen",
    unit: "4B",
    transcript: "Water is coming through the bedroom ceiling tonight.",
    documentNames: ["lease-renewal.pdf", "ceiling-photo.jpg"],
  });

  assert.equal(action.state, "urgent-maintenance");
  assert.equal(action.inspectionDate, "2026-08-10");
  assert.deepEqual(action.documentLabels, ["lease", "inspection-evidence"]);
});
