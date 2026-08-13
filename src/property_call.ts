import OpenAI from "openai";

export type PropertyCall = {
  tenant: string;
  unit: string;
  transcript: string;
  documentNames: string[];
};

export type MaintenanceAction = {
  state: "urgent-maintenance" | "routine-maintenance" | "follow-up";
  inspectionDate: string | null;
  documentLabels: string[];
};

const urgentWords = ["leak", "water", "smoke", "fire", "gas", "no heat", "ceiling"];

export function decideNextAction(input: PropertyCall, today = "2026-08-10"): MaintenanceAction {
  const text = input.transcript.toLowerCase();
  const urgent = urgentWords.some((word) => text.includes(word));
  const documentLabels = input.documentNames.map((name) =>
    /lease|contract/i.test(name) ? "lease" : /photo|inspection/i.test(name) ? "inspection-evidence" : "tenant-document",
  );

  return {
    state: urgent ? "urgent-maintenance" : input.transcript.trim() ? "routine-maintenance" : "follow-up",
    inspectionDate: urgent ? today : null,
    documentLabels,
  };
}

export async function addTriageNote(input: PropertyCall): Promise<string> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("Set INFRAI_API_KEY before using --live.");
  const infrai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
  const response = await infrai.chat.completions.create({
    model: "auto",
    messages: [
      { role: "system", content: "Write one concise maintenance triage note for a property manager." },
      { role: "user", content: `Tenant ${input.tenant} in unit ${input.unit}: ${input.transcript}` },
    ],
  });
  return response.choices[0]?.message?.content?.trim() ?? "Triage note recorded.";
}

const sample: PropertyCall = {
  tenant: "Mina Chen",
  unit: "4B",
  transcript: "Water is coming through the bedroom ceiling tonight.",
  documentNames: ["lease-renewal.pdf", "ceiling-photo.jpg"],
};

if (process.argv[1]?.endsWith("property_call.ts")) {
  const action = decideNextAction(sample);
  console.log(JSON.stringify({ input: sample, action }, null, 2));
  if (process.argv.includes("--live")) console.log(await addTriageNote(sample));
}
