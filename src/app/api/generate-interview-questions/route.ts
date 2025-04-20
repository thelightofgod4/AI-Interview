import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import {
  SYSTEM_PROMPT,
  generateQuestionsPrompt,
} from "@/lib/prompts/generate-questions";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

type Language = "en" | "tr";

export async function POST(req: Request, res: Response) {
  logger.info("generate-interview-questions request received");
  
  try {
    const body = await req.json();
    logger.info("Request body:", body);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 5,
      dangerouslyAllowBrowser: true,
    });

    const lang = (body.language || "en") as Language;
    logger.info("Using language:", lang);

    const prompt = generateQuestionsPrompt(body);
    logger.info("Generated prompt:", prompt);

    const baseCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT[lang],
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content;

    if (!content) {
      throw new Error("No content generated from OpenAI");
    }

    logger.info("Interview questions generated successfully");
    logger.info("Generated content:", content);

    return NextResponse.json(
      {
        response: content,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Error generating interview questions:", errorMessage);
    logger.error("Full error:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}
