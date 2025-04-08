import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { Retell } from "retell-sdk";

const apiKey = process.env.RETELL_API_KEY || "";

export async function POST(req: NextRequest, res: NextResponse) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (
    !Retell.verify(
      JSON.stringify(req.body),
      apiKey,
      req.headers.get("x-retell-signature") as string,
    )
  ) {
    console.error("Invalid signature");

    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { event, call } = req.body as unknown as { event: string; call: any };

  switch (event) {
    case "call_started":
      console.log("Call started event received", call.call_id);
      break;
    case "call_ended":
      console.log("Call ended event received", call.call_id);
      break;
    case "call_analyzed":
      const result = await axios.post("/api/get-call", {
        id: call.call_id,
      });
      console.log("Call analyzed event received", call.call_id);
      break;
    default:
      console.log("Received an unknown event:", event);
  }

  // Acknowledge the receipt of the event
  return NextResponse.json({ status: 204 });
}
