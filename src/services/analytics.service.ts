"use server";

import { OpenAI } from "openai";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Question } from "@/types/interview";
import { Analytics } from "@/types/response";
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
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
          overallScore: 0,
          overallFeedback: "Adaydan yanıt alınamadı.",
          communication: { score: 0, feedback: "Adaydan yanıt alınamadı." },
          generalIntelligence: "Adaydan yanıt alınamadı.",
          softSkillSummary: "Adaydan yanıt alınamadı.",
          questionSummaries: [],
        },
        status: 200
      };
    }

    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      maxRetries: 5,
      dangerouslyAllowBrowser: true,
    });

    const baseCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content || "";
    const analyticsResponse = JSON.parse(content);

    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    // questionAnalysis içindeki summary'leri çevir
    if (analyticsResponse.questionAnalysis && Array.isArray(analyticsResponse.questionAnalysis)) {
      for (let i = 0; i < analyticsResponse.questionAnalysis.length; i++) {
        const item = analyticsResponse.questionAnalysis[i];
        if (item.summary && await detectEnglish(item.summary)) {
          console.log("[ÇEVİRİ] questionAnalysis.summary İngilizce, çeviriliyor...");
          analyticsResponse.questionAnalysis[i].summary = await translateToTurkish(item.summary, openai);
        }
      }
    }

    // softSkillSummary varsa onu da çevir
    if (analyticsResponse.softSkillSummary) {
      console.log("[DEBUG] softSkillSummary orijinal:", analyticsResponse.softSkillSummary);
      const isEnglish = await detectEnglish(analyticsResponse.softSkillSummary);
      console.log("[DEBUG] softSkillSummary İngilizce algılandı mı?", isEnglish);
      if (isEnglish) {
        console.log("[ÇEVİRİ] softSkillSummary İngilizce, çeviriliyor...");
        const translated = await translateToTurkish(analyticsResponse.softSkillSummary, openai);
        console.log("[ÇEVİRİ] softSkillSummary çeviri sonucu:", translated);
        analyticsResponse.softSkillSummary = translated;
      }
    }

    // overallFeedback varsa onu da çevir
    if (analyticsResponse.overallFeedback && await detectEnglish(analyticsResponse.overallFeedback)) {
      console.log("[ÇEVİRİ] overallFeedback İngilizce, çeviriliyor...");
      analyticsResponse.overallFeedback = await translateToTurkish(analyticsResponse.overallFeedback, openai);
    }

    return { analytics: analyticsResponse, status: 200 };
  } catch (error) {
    console.error("Error in OpenAI request:", error);

    return { error: "internal server error", status: 500 };
  }
};
