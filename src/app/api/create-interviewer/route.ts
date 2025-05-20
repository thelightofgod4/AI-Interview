import { logger } from "@/lib/logger";
import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse, NextRequest } from "next/server";
import Retell from "retell-sdk";
import { INTERVIEWERS, RETELL_AGENT_GENERAL_PROMPT_MIA, RETELL_AGENT_GENERAL_PROMPT_ALEX, RETELL_AGENT_GENERAL_PROMPT_DURU, RETELL_AGENT_GENERAL_PROMPT_AHMET } from "@/lib/constants";

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
    // Mia için ayrı model ve agent
    logger.info("Creating Mia LLM model...");
    const miaModel = await retellClient.llm.create({
      model: "gpt-4o-mini",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT_MIA,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });
    logger.info("Mia LLM model created", { llm_id: miaModel.llm_id });
    logger.info("Creating Mia agent...");
    const newFirstAgent = await retellClient.agent.create({
      response_engine: { llm_id: miaModel.llm_id, type: "retell-llm" },
      voice_id: "custom_voice_6162b707fb42803f707cc944a3",
      agent_name: "Mia",
    });
    logger.info("Mia agent created successfully", { agent_id: newFirstAgent.agent_id });
    const newInterviewer = await InterviewerService.createInterviewer({
      agent_id: newFirstAgent.agent_id,
      ...INTERVIEWERS.MIA,
    });
    logger.info("Mia interviewer created in database", { interviewer: newInterviewer });

    // Alex için ayrı model ve agent
    logger.info("Creating Alex LLM model...");
    const alexModel = await retellClient.llm.create({
      model: "gpt-4o-mini",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT_ALEX,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });
    logger.info("Alex LLM model created", { llm_id: alexModel.llm_id });
    logger.info("Creating Alex agent...");
    const newSecondAgent = await retellClient.agent.create({
      response_engine: { llm_id: alexModel.llm_id, type: "retell-llm" },
      voice_id: "custom_voice_62c863ffa835bde34a67e02ea5",
      agent_name: "Alex",
    });
    logger.info("Alex agent created successfully", { agent_id: newSecondAgent.agent_id });
    const newSecondInterviewer = await InterviewerService.createInterviewer({
      agent_id: newSecondAgent.agent_id,
      ...INTERVIEWERS.ALEX,
    });
    logger.info("Alex interviewer created in database", { interviewer: newSecondInterviewer });

    // Duru için ayrı model ve agent
    logger.info("Creating Duru LLM model...");
    const duruModel = await retellClient.llm.create({
      model: "gpt-4o-mini",
      general_prompt: RETELL_AGENT_GENERAL_PROMPT_DURU,
      general_tools: [
        {
          type: "end_call",
          name: "end_call_1",
          description:
            "End the call if the user uses goodbye phrases such as 'bye,' 'goodbye,' or 'have a nice day.' ",
        },
      ],
    });
    logger.info("Duru LLM model created", { llm_id: duruModel.llm_id });
    logger.info("Creating Duru agent...");
    const newThirdAgent = await retellClient.agent.create({
      response_engine: { llm_id: duruModel.llm_id, type: "retell-llm" },
      voice_id: "custom_voice_364370f6601bf695fb194ac3a6",
      agent_name: "Duru",
      language: "tr-TR",
    });
    logger.info("Duru agent created successfully", { agent_id: newThirdAgent.agent_id });
    const newThirdInterviewer = await InterviewerService.createInterviewer({
      agent_id: newThirdAgent.agent_id,
      ...INTERVIEWERS.DURU,
    });
    logger.info("Duru interviewer created in database", { interviewer: newThirdInterviewer });

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
