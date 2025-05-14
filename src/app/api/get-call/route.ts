import { logger } from "@/lib/logger";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";
import { generateInterviewAnalytics } from "@/services/analytics.service";
import { OpenAI } from "openai";

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  logger.info("get-call request received");
  const body = await req.json();

  try {
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

    // call_summary Türkçeye çevrilsin
    if (callResponse.call_analysis?.call_summary) {
      const summary = callResponse.call_analysis.call_summary;
      const isEnglish = /the|and|was|for|with|that|this|from|user|agent|call|interview|position|requested|concluded|acknowledged|immediately|conversation|politely/i.test(summary);
      if (isEnglish) {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Aşağıdaki metni Türkçeye çevir. Sadece çeviriyi döndür." },
            { role: "user", content: summary },
          ],
        });
        callResponse.call_analysis.call_summary = completion.choices[0]?.message?.content || summary;
      }
    }

    // Save call details
    await ResponseService.saveResponse(
      {
        details: callResponse,
        is_ended: true,
        duration: duration,
      },
      body.id,
    );

    // Start analysis synchronously
    try {
      // Mark as processing
      await ResponseService.updateResponse({
        analysis_status: "processing"
      }, body.id);

      logger.info("Starting interview analytics generation", { callId: body.id });
      
      // Wait for analysis to complete
      const result = await generateInterviewAnalytics({
        callId: body.id,
        interviewId: interviewId,
        transcript: callResponse.transcript,
      });

      logger.info("Analytics generation completed", { callId: body.id });

      // Update with results immediately
      await ResponseService.updateResponse({
        analytics: result.analytics,
        is_analysed: true,
        analysis_status: "completed"
      }, body.id);

      // Return completed status with analytics
      return NextResponse.json(
        {
          callResponse,
          analytics: result.analytics,
          status: "completed"
        },
        { status: 200 },
      );

    } catch (analysisError) {
      logger.error("Analysis failed", { 
        error: analysisError instanceof Error ? analysisError.message : String(analysisError),
        callId: body.id,
        stack: analysisError instanceof Error ? analysisError.stack : undefined
      });

      await ResponseService.updateResponse({
        analysis_status: "failed"
      }, body.id);

      return NextResponse.json(
        {
          callResponse,
          analytics: null,
          status: "failed",
          error: "Analysis failed"
        },
        { status: 500 },
      );
    }
  } catch (error) {
    logger.error("Request failed", { 
      error: error instanceof Error ? error.message : String(error),
      callId: body.id,
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        error: "Request failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 },
    );
  }
}
