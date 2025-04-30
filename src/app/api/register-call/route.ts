import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  try {
    logger.info("register-call request received");
    
    let body;
    try {
      body = await req.json();
      logger.info("Request body:", body);
    } catch (parseError) {
      logger.error("Failed to parse request body", { error: parseError });
      return NextResponse.json(
        { error: "Invalid request body", details: "Request body could not be parsed" },
        { status: 400 }
      );
    }

    if (!process.env.RETELL_API_KEY) {
      logger.error("RETELL_API_KEY is not configured");
      return NextResponse.json(
        { error: "API key configuration error" },
        { status: 500 }
      );
    }

    if (!body.interviewer_id) {
      logger.error("interviewer_id is missing in request body");
      return NextResponse.json(
        { error: "interviewer_id is required" },
        { status: 400 }
      );
    }

    const interviewerId = body.interviewer_id;
    logger.info("Interviewer ID:", interviewerId);
    
    let interviewer;
    try {
      interviewer = await InterviewerService.getInterviewer(interviewerId);
      logger.info("Interviewer details:", interviewer);
    } catch (interviewerError: any) {
      logger.error("Failed to get interviewer", { error: interviewerError });
      return NextResponse.json(
        { error: "Failed to get interviewer details", details: interviewerError?.message || "Unknown error" },
        { status: 500 }
      );
    }

    if (!interviewer?.agent_id) {
      logger.error("agent_id not found for interviewer", { interviewerId });
      return NextResponse.json(
        { error: "Interviewer configuration error" },
        { status: 500 }
      );
    }

    try {
      const registerCallResponse = await retellClient.call.createWebCall({
        agent_id: interviewer.agent_id,
        retell_llm_dynamic_variables: body.dynamic_data,
      });

      logger.info("Call registered successfully");

      return NextResponse.json(
        {
          registerCallResponse,
        },
        { status: 200 }
      );
    } catch (retellError: any) {
      logger.error("Retell API error", { 
        error: retellError?.message || retellError,
        stack: retellError?.stack
      });
      
      return NextResponse.json(
        { error: "Failed to register call with Retell", details: retellError?.message || "Unknown error" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    logger.error("Error in register-call", { 
      error: error?.message || error,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
