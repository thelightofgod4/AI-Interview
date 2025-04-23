import { logger } from "@/lib/logger";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

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
  
  if (callDetails.is_analysed) {
    return NextResponse.json(
      {
        callResponse,
        analytics: callDetails.analytics,
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

  // Save the call details first
  await ResponseService.saveResponse(
    {
      details: callResponse,
      is_ended: true,
      duration: duration,
    },
    body.id,
  );

  // Queue the analysis
  await ResponseService.updateResponse({
    analysis_status: "queued"
  }, body.id);

  // Return immediately without waiting for analysis
  return NextResponse.json(
    {
      callResponse,
      analytics: null,
      message: "Analysis queued, please check back later"
    },
    { status: 200 },
  );
}
