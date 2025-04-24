import { NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";
import { logger } from "@/lib/logger";
import { generateInterviewAnalytics } from "@/services/analytics.service";

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

    // Get response details
    const response = await ResponseService.getResponseByCallId(callId);
    
    if (!response) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    // If already analyzed, return existing analytics
    if (response.is_analysed) {
      return NextResponse.json(
        { analytics: response.analytics },
        { status: 200 }
      );
    }

    // Mark as processing
    await ResponseService.updateResponse({
      analysis_status: "processing"
    }, callId);

    // Start analysis
    try {
      const result = await generateInterviewAnalytics({
        callId: response.call_id,
        interviewId: response.interview_id,
        transcript: response.details?.transcript
      });

      // Update with results
      await ResponseService.updateResponse({
        analytics: result.analytics,
        is_analysed: true,
        analysis_status: "completed"
      }, callId);

      return NextResponse.json(
        { analytics: result.analytics },
        { status: 200 }
      );
    } catch (error) {
      logger.error("Analysis failed", { error: error instanceof Error ? error.message : String(error) });
      
      // Mark as failed
      await ResponseService.updateResponse({
        analysis_status: "failed"
      }, callId);

      return NextResponse.json(
        { error: "Analysis failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Error in queue-analysis", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
