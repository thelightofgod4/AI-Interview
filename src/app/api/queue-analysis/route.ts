import { NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { callId } = body;

    if (!callId) {
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 }
      );
    }

    // Mark the response as queued for analysis
    await ResponseService.updateResponse({
      is_analysed: false,
      analysis_status: "queued"
    }, callId);

    // Trigger the analysis process
    await ResponseService.triggerAnalysis(callId);

    return NextResponse.json(
      { message: "Analysis queued successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error queueing analysis", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
