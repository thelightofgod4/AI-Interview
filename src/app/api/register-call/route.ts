import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  try {
    logger.info("register-call request received");
    const body = await req.json();
    logger.info("Request body:", body);

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
    
    const interviewer = await InterviewerService.getInterviewer(interviewerId);
    logger.info("Interviewer details:", interviewer);

    if (!interviewer?.agent_id) {
      logger.error("agent_id not found for interviewer", { interviewerId });
      return NextResponse.json(
        { error: "Interviewer configuration error" },
        { status: 500 }
      );
    }

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
