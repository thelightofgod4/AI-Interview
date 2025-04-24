import { logger } from "@/lib/logger";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";
import axios from "axios";

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  logger.info("get-call request received");
  const body = await req.json();

  const callDetails: Response = await ResponseService.getResponseByCallId(
    body.id,
  );
  let callResponse = callDetails.details;
  
  // If analysis is completed, return results
  if (callDetails.is_analysed) {
    return NextResponse.json(
      {
        callResponse,
        analytics: callDetails.analytics,
        status: "completed"
      },
      { status: 200 },
    );
  }

  // If analysis is in progress, return status
  if (callDetails.analysis_status === "processing") {
    return NextResponse.json(
      {
        callResponse,
        analytics: null,
        status: "processing"
      },
      { status: 200 },
    );
  }

  const callOutput = await retell.call.retrieve(body.id);
  const interviewId = callDetails?.interview_id;
  callResponse = callOutput;
  const duration = Math.round(
    callResponse.end_timestamp / 1000 - callResponse.start_timestamp / 1000,
  );

  // Save call details
  await ResponseService.saveResponse(
    {
      details: callResponse,
      is_ended: true,
      duration: duration,
    },
    body.id,
  );

  // Start analysis in background
  try {
    await axios.post("/api/queue-analysis", { callId: body.id });
  } catch (error) {
    logger.error("Failed to queue analysis", { error: error instanceof Error ? error.message : String(error) });
  }

  return NextResponse.json(
    {
      callResponse,
      analytics: null,
      status: "processing"
    },
    { status: 200 },
  );
}
