"use client";

import React, { useEffect, useState } from "react";
import { Analytics, CallData } from "@/types/response";
import axios from "axios";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import ReactAudioPlayer from "react-audio-player";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ResponseService } from "@/services/responses.service";
import { useRouter } from "next/navigation";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgress } from "@nextui-org/react";
import QuestionAnswerCard from "@/components/dashboard/interview/questionAnswerCard";
import { marked } from "marked";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateStatus } from "@/lib/enum";
import { ArrowLeft } from "lucide-react";
import OpenAI from "openai";
import { useTranslation } from 'react-i18next';

type CallProps = {
  call_id: string;
  onDeleteResponse: (deletedCallId: string) => void;
  onCandidateStatusChange: (callId: string, newStatus: string) => void;
};

// Analytics tipi hem eski hem yeni formatı destekleyecek şekilde genişletiliyor
type AnalyticsMultiLang = Analytics | { tr: Analytics; en: Analytics };

function CallInfo({
  call_id,
  onDeleteResponse,
  onCandidateStatusChange,
}: CallProps) {
  const [call, setCall] = useState<CallData>();
  const [analytics, setAnalytics] = useState<AnalyticsMultiLang | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [candidateStatus, setCandidateStatus] = useState<string>(CandidateStatus.NO_STATUS);
  const [interviewId, setInterviewId] = useState<string>("");
  const [tabSwitchCount, setTabSwitchCount] = useState<number>();
  const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [responseId, setResponseId] = useState<number | null>(null);
  const { t, i18n } = useTranslation();

  function detectEnglish(text: string) {
    const commonEnglishWords = [
      "the", "and", "was", "for", "with", "that", "this", "from", "user", "agent", "call", "interview", "position", "requested", "concluded", "acknowledged", "immediately", "conversation", "politely"
    ];
    let count = 0;
    for (const word of commonEnglishWords) {
      if (text.toLowerCase().includes(word)) count++;
    }
    return count > 2;
  }

  async function translateToTurkish(text: string) {
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
    const translationCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Aşağıdaki metni Türkçeye çevir. Sadece çeviriyi döndür." },
        { role: "user", content: text },
      ],
    });
    return translationCompletion.choices[0]?.message?.content || text;
  }

  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true);
      setCall(undefined);
      setEmail("");
      setName("");

      try {
        const response = await axios.post("/api/get-call", { id: call_id });
        setCall(response.data.callResponse);
        
        if (response.data.status === "processing") {
          // Start polling if analysis is in progress
          const pollInterval = setInterval(async () => {
            try {
              const pollResponse = await axios.post("/api/get-call", { id: call_id });
              if (pollResponse.data.status === "completed") {
                setAnalytics(pollResponse.data.analytics);
                clearInterval(pollInterval);
              } else if (pollResponse.data.status === "failed") {
                clearInterval(pollInterval);
                toast.error("Analysis failed. Please try again later.");
              }
            } catch (error) {
              console.error("Polling error:", error);
              clearInterval(pollInterval);
            }
          }, 5000); // Poll every 5 seconds

          // Cleanup interval on unmount
          return () => clearInterval(pollInterval);
        } else {
        setAnalytics(response.data.analytics);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponses();
  }, [call_id]);

  useEffect(() => {
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        const response = await ResponseService.getResponseByCallId(call_id);
        setEmail(response.email);
        setName(response.name);
        setCandidateStatus(response.candidate_status || CandidateStatus.NO_STATUS);
        setInterviewId(response.interview_id);
        setTabSwitchCount(response.tab_switch_count);
        setResponseId(response.id);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call_id]);

  useEffect(() => {
    const replaceAgentAndUser = (transcript: string, name: string): string => {
      const agentReplacement = "**AI interviewer:**";
      const userReplacement = `**${name}:**`;

      // Replace "Agent:" with "AI interviewer:" and "User:" with the variable `${name}:`
      let updatedTranscript = transcript
        .replace(/Agent:/g, agentReplacement)
        .replace(/User:/g, userReplacement);

      // Add space between the dialogues
      updatedTranscript = updatedTranscript.replace(/(?:\r\n|\r|\n)/g, "\n\n");

      return updatedTranscript;
    };

    if (call && name) {
      setTranscript(replaceAgentAndUser(call?.transcript as string, name));
    }
  }, [call, name]);

  useEffect(() => {
    async function handleTranslation() {
      if (call?.call_analysis?.call_summary && detectEnglish(call.call_analysis.call_summary)) {
        const translated = await translateToTurkish(call.call_analysis.call_summary);
        setTranslatedSummary(translated);
      } else {
        setTranslatedSummary(null);
      }
    }
    handleTranslation();
  }, [call?.call_analysis?.call_summary]);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (responseId) {
        try {
          const response = await axios.get(`/api/feedback/${responseId}`);
          setFeedbackData(response.data);
        } catch (error) {
          console.error('Error fetching feedback:', error);
          setFeedbackData(null);
        }
      }
    };
    
    fetchFeedback();
  }, [responseId]);

  const onDeleteResponseClick = async () => {
    try {
      const response = await ResponseService.getResponseByCallId(call_id);

      if (response) {
        const interview_id = response.interview_id;

        await ResponseService.deleteResponse(call_id);

        router.push(`/interviews/${interview_id}`);

        onDeleteResponse(call_id);
      }

      toast.success("Response deleted successfully.", {
        position: "bottom-right",

        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting response:", error);

      toast.error("Failed to delete the response.", {
        position: "bottom-right",

        duration: 3000,
      });
    }
  };

  // analyticsData: seçili dile göre analytics verisi
  const lang = i18n.language === 'tr' ? 'tr' : 'en';
  let analyticsData: Analytics | undefined = undefined;
  if (analytics && typeof analytics === 'object' && 'tr' in (analytics as any) && 'en' in (analytics as any)) {
    analyticsData = (analytics as any)[lang];
  } else if (analytics) {
    analyticsData = analytics as Analytics;
  }

  const getSatisfactionEmoji = (satisfaction: number) => {
    switch (satisfaction) {
      case 0: return '😀';
      case 1: return '😐';
      case 2: return '😔';
      default: return '😐';
    }
  };

  const getSatisfactionText = (satisfaction: number) => {
    switch (satisfaction) {
      case 0: return t('good', 'Good');
      case 1: return t('moderate', 'Moderate');
      case 2: return t('bad', 'Bad');
      default: return t('moderate', 'Moderate');
    }
  };

  const getFeedbackText = () => {
    if (!feedbackData) {
      return t('noFeedbackGiven', 'No feedback was provided');
    }
    
    if (feedbackData.feedback && feedbackData.feedback.trim()) {
      return feedbackData.feedback;
    }
    
    if (typeof feedbackData.satisfaction === 'number') {
      return t('noWrittenComment', 'No written comment was provided');
    }
    
    return t('noFeedbackGiven', 'No feedback was provided');
  };

  return (
    <div className="z-[10] mx-2 mb-[100px]">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[75%] w-full">
          <LoaderWithText />
        </div>
      ) : (
        <>
          <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 y-3">
            <div className="flex flex-col justify-between bt-2">
              {/* <p className="font-semibold my-2 ml-2">
                Response Analysis and Insights
              </p> */}
              <div>
                <div className="flex justify-between items-center pb-4 pr-2">
                  <div
                    className=" inline-flex items-center text-indigo-600 hover:cursor-pointer"
                    onClick={() => {
                      router.push(`/interviews/${interviewId}`);
                    }}
                  >
                    <ArrowLeft className="mr-2" />
                    <p className="text-sm font-semibold">{t('backToSummary')}</p>
                  </div>
                  {(typeof tabSwitchCount === 'number' && tabSwitchCount > 0) && (
                    <p className="text-sm font-semibold text-red-500 bg-red-200 rounded-sm px-2 py-1">
                      Tab Switching Detected
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-between gap-3 w-full">
                <div className="flex flex-row justify-between">
                  <div className="flex flex-row gap-3">
                    <Avatar>
                      <AvatarFallback>{name ? name[0] : "A"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      {name && (
                        <p className="text-sm font-semibold px-2">{name}</p>
                      )}
                      {email && <p className="text-sm px-2">{email}</p>}
                    </div>
                  </div>
                  <div className="flex flex-row mr-2 items-center gap-3">
                    <Select
                      value={candidateStatus}
                      onValueChange={async (newValue: string) => {
                        setCandidateStatus(newValue);
                        await ResponseService.updateResponse(
                          { candidate_status: newValue },
                          call_id,
                        );
                        onCandidateStatusChange(call_id, newValue);
                      }}
                    >
                      <SelectTrigger className="w-[180px]  bg-slate-50 rounded-2xl">
                        <SelectValue placeholder="Not Selected" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CandidateStatus.NO_STATUS}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                            {t('noStatus')}
                          </div>
                        </SelectItem>
                        <SelectItem value={CandidateStatus.NOT_SELECTED}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                            {t('notSelected')}
                          </div>
                        </SelectItem>
                        <SelectItem value={CandidateStatus.POTENTIAL}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                            {t('potential')}
                          </div>
                        </SelectItem>
                        <SelectItem value={CandidateStatus.SELECTED}>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                            {t('selected')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button
                          disabled={isClicked}
                          className="bg-red-500 hover:bg-red-600 p-2"
                        >
                          <TrashIcon size={16} className="" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>

                          <AlertDialogDescription>
                            {t('deleteResponseConfirm')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>

                          <AlertDialogAction
                            className="bg-indigo-600 hover:bg-indigo-800"
                            onClick={async () => {
                              await onDeleteResponseClick();
                            }}
                          >
                            {t('continue')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-col mt-3">
                  <p className="font-semibold">{t('recording')}</p>
                  <div className="flex flex-row gap-3 mt-2">
                    {call?.recording_url && (
                      <ReactAudioPlayer src={call?.recording_url} controls />
                    )}
                    <a
                      className="my-auto"
                      href={call?.recording_url}
                      download=""
                      aria-label="Download"
                    >
                      <DownloadIcon size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            {/* <div>{call.}</div> */}
          </div>
          <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 my-3">
            <p className="font-semibold my-2">{t('generalSummary')}</p>

            <div className="grid grid-cols-3 gap-4 my-2 mt-4 ">
              {analyticsData?.overallScore !== undefined && (
                <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                  <div className="flex flex-row gap-2 align-middle">
                    <CircularProgress
                      classNames={{
                        svg: "w-28 h-28 drop-shadow-md",
                        indicator: "stroke-indigo-600",
                        track: "stroke-indigo-600/10",
                        value: "text-3xl font-semibold text-indigo-600",
                      }}
                      value={analyticsData?.overallScore}
                      strokeWidth={4}
                      showValueLabel={true}
                      formatOptions={{ signDisplay: "never" }}
                    />
                    <p className="font-medium my-auto text-xl">
                      {t('generalScore')}
                    </p>
                  </div>
                  <div className="">
                    <div className="font-medium ">
                      <span className="font-bold">{t('feedback')}:</span>
                      <div className="mt-1">
                        {analyticsData?.overallFeedback === undefined ? (
                        <Skeleton className="w-[200px] h-[20px]" />
                      ) : (
                          analyticsData?.overallFeedback
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {analyticsData?.communication && (
                <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                  <div className="flex flex-row gap-2 align-middle">
                    <CircularProgress
                      classNames={{
                        svg: "w-28 h-28 drop-shadow-md",
                        indicator: "stroke-indigo-600",
                        track: "stroke-indigo-600/10",
                        value: "text-3xl font-semibold text-indigo-600",
                      }}
                      value={analyticsData?.communication.score}
                      maxValue={10}
                      minValue={0}
                      strokeWidth={4}
                      showValueLabel={true}
                      valueLabel={
                        <div className="flex items-baseline">
                          {analyticsData?.communication.score ?? 0}
                          <span className="text-xl ml-0.5">/10</span>
                        </div>
                      }
                      formatOptions={{ signDisplay: "never" }}
                    />
                    <p className="font-medium my-auto text-xl">{t('communication')}</p>
                  </div>
                  <div className="">
                    <div className="font-medium ">
                      <span className="font-bold">{t('feedback')}:</span>
                      <div className="mt-1">
                        {analyticsData?.communication.feedback === undefined ? (
                        <Skeleton className="w-[200px] h-[20px]" />
                      ) : (
                          analyticsData?.communication.feedback
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
                <div className="flex flex-row gap-2  align-middle">
                  <p className="my-auto font-bold">{t('userSentiment')}: </p>
                  <p className="font-medium my-auto">
                    {call?.call_analysis?.user_sentiment === undefined ? (
                      <Skeleton className="w-[200px] h-[20px]" />
                    ) : (
                      call?.call_analysis?.user_sentiment
                    )}
                  </p>

                  <div
                    className={`${
                      call?.call_analysis?.user_sentiment == "Neutral"
                        ? "text-yellow-500"
                        : call?.call_analysis?.user_sentiment == "Negative"
                          ? "text-red-500"
                          : call?.call_analysis?.user_sentiment == "Positive"
                            ? "text-green-500"
                            : "text-transparent"
                    } text-xl`}
                  >
                    ●
                  </div>
                </div>
                <div className="">
                  <div className="font-medium  ">
                    <span className="font-bold">{t('interviewSummary')}:</span>
                    <div className="mt-1">
                      {call?.call_analysis === undefined ? (
                      <Skeleton className="w-[200px] h-[20px]" />
                    ) : (
                        (i18n.language === 'tr' && (call?.call_analysis?.call_summary_tr || call?.call_analysis?.call_summary_en || call?.call_analysis?.call_summary)) ||
                        (i18n.language === 'en' && (call?.call_analysis?.call_summary_en || call?.call_analysis?.call_summary_tr || call?.call_analysis?.call_summary)) ||
                        call?.call_analysis?.call_summary || ''
                    )}
                    </div>
                  </div>
                </div>
                <p className="font-medium ">
                  {call?.call_analysis?.call_completion_rating_reason}
                </p>
              </div>
            </div>
          </div>
          
          {/* User Feedback Section */}
          <div className="bg-slate-200 rounded-2xl p-4 px-5 my-3">
            <p className="font-semibold my-2 mb-4">{t('userFeedback', 'User Feedback')}</p>
            <div className="flex flex-col gap-3 text-sm p-4 rounded-2xl bg-slate-50">
              {feedbackData ? (
                <>
                  <div className="flex flex-row gap-3 align-middle">
                    <span className="text-2xl">{getSatisfactionEmoji(feedbackData.satisfaction)}</span>
                    <span className="font-medium text-lg">{getSatisfactionText(feedbackData.satisfaction)}</span>
                  </div>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 min-h-[60px]">
                    <p className={`${(!feedbackData.feedback || !feedbackData.feedback.trim()) ? 'italic text-gray-500' : ''}`}>
                      {getFeedbackText()}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <p className="text-gray-500 italic text-center">
                    {t('noFeedbackGiven', 'No feedback was provided')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {analyticsData &&
            analyticsData.questionSummaries &&
            analyticsData.questionSummaries.length > 0 && (
              <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4 px-5 my-3">
                <p className="font-semibold my-2 mb-4">{t('questionSummary')}</p>
                <div className="text-sm mt-3 py-3 leading-6 px-2">
                  {analyticsData.questionSummaries.map((qs: any, index: number) => (
                    <QuestionAnswerCard
                      key={qs.question}
                      questionNumber={index + 1}
                      question={qs.question}
                      answer={qs.summary}
                    />
                  ))}
                </div>
              </div>
            )}
          <div className="bg-slate-200 rounded-2xl min-h-[150px] p-4 px-5 mb-[150px]">
            <p className="font-semibold my-2 mb-4">{t('transcript')}</p>
            <div className="rounded-2xl text-sm max-h-[60vh] overflow-y-auto whitespace-pre-line px-2">
              <div
                className="text-sm p-4 rounded-2xl leading-6 bg-slate-50"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: marked(transcript) }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CallInfo;
