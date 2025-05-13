import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse, NextRequest } from "next/server";
import Retell from "retell-sdk";
import { INTERVIEWERS, RETELL_AGENT_GENERAL_PROMPT_LISA, RETELL_AGENT_GENERAL_PROMPT_BOB, RETELL_AGENT_GENERAL_PROMPT_AYSE, RETELL_AGENT_GENERAL_PROMPT_AHMET } from "@/lib/constants";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

// Bu fonksiyon build sırasında çağrılmayacak
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Build sırasında çağrılmayı engelle
  if (process.env.NODE_ENV === 'production' && !req.headers.get('user-agent')) {
    return NextResponse.json({ error: "Not allowed during build" }, { status: 403 });
  }

  logger.info("create-interviewer request received");

  try {
    // Lisa için ayrı model ve agent
    logger.info("Creating Lisa LLM model...");
    const lisaModel = await retellClient.llm.create({
      model: "gpt-4o-mini",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT_LISA,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });
    logger.info("Lisa LLM model created", { llm_id: lisaModel.llm_id });
    logger.info("Creating Lisa agent...");
    const newFirstAgent = await retellClient.agent.create({
      response_engine: { llm_id: lisaModel.llm_id, type: "retell-llm" },
      voice_id: "11labs-Chloe",
      agent_name: "Lisa",
    });
    logger.info("Lisa agent created successfully", { agent_id: newFirstAgent.agent_id });
    const newInterviewer = await InterviewerService.createInterviewer({
      agent_id: newFirstAgent.agent_id,
      ...INTERVIEWERS.LISA,
    });
    logger.info("Lisa interviewer created in database", { interviewer: newInterviewer });

    // Bob için ayrı model ve agent
    logger.info("Creating Bob LLM model...");
    const bobModel = await retellClient.llm.create({
      model: "gpt-4o-mini",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT_BOB,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });
    logger.info("Bob LLM model created", { llm_id: bobModel.llm_id });
    logger.info("Creating Bob agent...");
    const newSecondAgent = await retellClient.agent.create({
      response_engine: { llm_id: bobModel.llm_id, type: "retell-llm" },
      voice_id: "11labs-Brian",
      agent_name: "Bob",
    });
    logger.info("Bob agent created successfully", { agent_id: newSecondAgent.agent_id });
    const newSecondInterviewer = await InterviewerService.createInterviewer({
      agent_id: newSecondAgent.agent_id,
      ...INTERVIEWERS.BOB,
    });
    logger.info("Bob interviewer created in database", { interviewer: newSecondInterviewer });

    // Ayşe için ayrı model ve agent
    logger.info("Creating Ayşe LLM model...");
    const ayseModel = await retellClient.llm.create({
      model: "gpt-4o-mini",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT_AYSE,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });
    logger.info("Ayşe LLM model created", { llm_id: ayseModel.llm_id });
    logger.info("Creating Ayşe agent...");
    const newThirdAgent = await retellClient.agent.create({
      response_engine: { llm_id: ayseModel.llm_id, type: "retell-llm" },
      voice_id: "custom_voice_364370f6601bf695fb194ac3a6",
      agent_name: "Ayse",
      language: "tr-TR",
    });
    logger.info("Ayşe agent created successfully", { agent_id: newThirdAgent.agent_id });
    const newThirdInterviewer = await InterviewerService.createInterviewer({
      agent_id: newThirdAgent.agent_id,
      ...INTERVIEWERS.AYSE,
    });
    logger.info("Ayşe interviewer created in database", { interviewer: newThirdInterviewer });

    // Ahmet için ayrı model ve agent
    logger.info("Creating Ahmet LLM model...");
    const ahmetModel = await retellClient.llm.create({
      model: "gpt-4o-mini",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT_AHMET,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });
    logger.info("Ahmet LLM model created", { llm_id: ahmetModel.llm_id });
    logger.info("Creating Ahmet agent...");
    const newFourthAgent = await retellClient.agent.create({
      response_engine: { llm_id: ahmetModel.llm_id, type: "retell-llm" },
      voice_id: "custom_voice_b2dc0bc778e4c9c93e615959bf",
      agent_name: "Ahmet",
      language: "tr-TR",
    });
    logger.info("Ahmet agent created successfully", { agent_id: newFourthAgent.agent_id });
    const newFourthInterviewer = await InterviewerService.createInterviewer({
      agent_id: newFourthAgent.agent_id,
      ...INTERVIEWERS.AHMET,
    });
    logger.info("Ahmet interviewer created in database", { interviewer: newFourthInterviewer });

    return NextResponse.json(
      {
        newInterviewer,
        newSecondInterviewer,
        newThirdInterviewer,
        newFourthInterviewer,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
    logger.error("Error creating interviewers:", errorMessage);
    console.error("Detailed error:", error);

    return NextResponse.json(
      { error: "Failed to create interviewers", details: errorMessage },
      { status: 500 },
    );
  }
}
