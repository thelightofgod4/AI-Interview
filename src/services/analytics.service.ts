"use server";

import { OpenAI } from "openai";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Question } from "@/types/interview";
import { Analytics } from "@/types/response";
import {
  getInterviewAnalyticsPrompt,
  getInterviewAnalyticsPromptEn,
  SYSTEM_PROMPT_TR,
  SYSTEM_PROMPT_EN,
} from "@/lib/prompts/analytics";

// Fonksiyonları dosya seviyesine taşı
async function detectEnglish(text: string) {
  const commonEnglishWords = [
    "the", "and", "was", "for", "with", "that", "this", "from", "user", "agent", "call", "interview", "position", "requested", "concluded", "acknowledged", "immediately", "conversation", "politely"
  ];
  let count = 0;
  for (const word of commonEnglishWords) {
    if (text.toLowerCase().includes(word)) count++;
  }
  return count > 2;
}

async function translateToTurkish(text: string, openai: OpenAI) {
  const translationCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Aşağıdaki metni Türkçeye çevir. Sadece çeviriyi döndür." },
      { role: "user", content: text },
    ],
  });
  return translationCompletion.choices[0]?.message?.content || text;
}

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const interviewTranscript = transcript || response.details?.transcript;
    const transcriptObject = response.details?.transcript_object || [];

    // ADAYDAN HİÇ CEVAP YOKSA ANALİZİ 0 VE UYARI OLARAK DÖN
    const hasUserResponse = Array.isArray(transcriptObject)
      ? transcriptObject.some(t => t.role === "user" && t.content && t.content.trim().length > 0)
      : (interviewTranscript && interviewTranscript.includes("User:"));

    if (!hasUserResponse) {
      return {
        analytics: {
          tr: {
          overallScore: 0,
          overallFeedback: "Adaydan yanıt alınamadı.",
          communication: { score: 0, feedback: "Adaydan yanıt alınamadı." },
          generalIntelligence: "Adaydan yanıt alınamadı.",
          softSkillSummary: "Adaydan yanıt alınamadı.",
          questionSummaries: [],
          },
          en: {
            overallScore: 0,
            overallFeedback: "No response received from the candidate.",
            communication: { score: 0, feedback: "No response received from the candidate." },
            generalIntelligence: "No response received from the candidate.",
            softSkillSummary: "No response received from the candidate.",
            questionSummaries: [],
          }
        },
        status: 200
      };
    }

    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const promptTr = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 5,
      dangerouslyAllowBrowser: true,
    });

    // SADECE TÜRKÇE ANALİZ ÜRET
    const baseCompletionTr = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_TR,
        },
        {
          role: "user",
          content: promptTr,
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutputTr = baseCompletionTr.choices[0] || {};
    const contentTr = basePromptOutputTr.message?.content || "";
    const analyticsResponseTr = JSON.parse(contentTr);
    analyticsResponseTr.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    // TÜRKÇE ANALİZİ İNGİLİZCEYE ÇEVİR
    const translationCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Aşağıdaki JSON'u İngilizceye çevir. Sadece çeviriyi döndür. JSON formatını koru." },
        { role: "user", content: JSON.stringify(analyticsResponseTr) },
      ],
    });
    let analyticsResponseEn;
    try {
      analyticsResponseEn = JSON.parse(translationCompletion.choices[0]?.message?.content || "{}");
    } catch (e) {
      analyticsResponseEn = {};
    }
    analyticsResponseEn.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    return { analytics: { tr: analyticsResponseTr, en: analyticsResponseEn }, status: 200 };
  } catch (error) {
    console.error("Error in OpenAI request:", error);
    return { error: "internal server error", status: 500 };
  }
};
