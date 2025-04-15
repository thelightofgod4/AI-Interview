import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { InterviewService } from "@/services/interviews.service";
import { logger } from "@/lib/logger";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export async function POST(req: Request) {
  try {
    const url_id = nanoid();
    const protocol = base_url?.includes("localhost") ? "http" : "https";
    const url = `${protocol}://${base_url}/call/${url_id}`;
    const body = await req.json();

    logger.info("create-interview request received", { body });

    const payload = body.interviewData;

    // Validate required fields
    if (!payload.user_id || !payload.organization_id) {
      logger.error("Missing user_id or organization_id");

      return NextResponse.json(
        { error: "User or organization ID is missing" },
        { status: 400 }
      );
    }

    const newInterview = await InterviewService.createInterview({
      ...payload,
      url: url,
      id: url_id,
    });

    logger.info("Interview created successfully", { newInterview });

    return NextResponse.json(
      { response: "Interview created successfully", interview: newInterview },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("Error creating interview", { error: error?.message || error });

    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
