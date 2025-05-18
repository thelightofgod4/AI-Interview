"use client";

import { Interview } from "@/types/interview";
import { Interviewer } from "@/types/interviewer";
import { Response } from "@/types/response";
import React, { useEffect, useState } from "react";
import { UserCircleIcon, SmileIcon, Info } from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import { PieChart } from "@mui/x-charts/PieChart";
import { CandidateStatus } from "@/lib/enum";
import { convertSecondstoMMSS } from "@/lib/utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import DataTable, {
  TableData,
} from "@/components/dashboard/interview/dataTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

type SummaryProps = {
  responses: Response[];
  interview: Interview | undefined;
};

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info
            className="h-2 w-2 text-[#4F46E5] inline-block ml-0 align-super font-bold"
            strokeWidth={2.5}
          />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-500 text-white font-normal">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SummaryInfo({ responses, interview }: SummaryProps) {
  const { interviewers } = useInterviewers();
  const { t } = useTranslation();
  const [interviewer, setInterviewer] = useState<Interviewer>();
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [completedInterviews, setCompletedInterviews] = useState<number>(0);
  const [sentimentCount, setSentimentCount] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [callCompletion, setCallCompletion] = useState({
    complete: 0,
    incomplete: 0,
    partial: 0,
  });

  const totalResponses = responses.length;

  const [candidateStatusCount, setCandidateStatusCount] = useState({
    [CandidateStatus.NO_STATUS]: 0,
    [CandidateStatus.NOT_SELECTED]: 0,
    [CandidateStatus.POTENTIAL]: 0,
    [CandidateStatus.SELECTED]: 0,
  });

  const [tableData, setTableData] = useState<TableData[]>([]);

  const prepareTableData = (responses: Response[]): TableData[] => {
    return responses.map((response) => ({
      call_id: response.call_id,
      name: response.name || "Anonymous",
      overallScore: response.analytics?.overallScore || 0,
      communicationScore: response.analytics?.communication?.score || 0,
      callSummary:
        response.analytics?.softSkillSummary ||
        response.details?.call_analysis?.call_summary ||
        "No summary available",
    }));
  };

  useEffect(() => {
    if (!interviewers || !interview) {
      return;
    }
    const interviewer = interviewers.find(
      (interviewer) => interviewer.id === interview.interviewer_id,
    );
    setInterviewer(interviewer);
  }, [interviewers, interview]);

  useEffect(() => {
    if (!responses) {
      return;
    }

    const sentimentCounter = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const callCompletionCounter = {
      complete: 0,
      incomplete: 0,
      partial: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;

    const statusCounter = {
      [CandidateStatus.NO_STATUS]: 0,
      [CandidateStatus.NOT_SELECTED]: 0,
      [CandidateStatus.POTENTIAL]: 0,
      [CandidateStatus.SELECTED]: 0,
    };

    responses.forEach((response) => {
      const sentiment = response.details?.call_analysis?.user_sentiment;
      if (sentiment === "Positive") {
        sentimentCounter.positive += 1;
      } else if (sentiment === "Negative") {
        sentimentCounter.negative += 1;
      } else if (sentiment === "Neutral") {
        sentimentCounter.neutral += 1;
      }

      const callCompletion =
        response.details?.call_analysis?.call_completion_rating;
      if (callCompletion === "Complete") {
        callCompletionCounter.complete += 1;
      } else if (callCompletion === "Incomplete") {
        callCompletionCounter.incomplete += 1;
      } else if (callCompletion === "Partial") {
        callCompletionCounter.partial += 1;
      }

      const agentTaskCompletion =
        response.details?.call_analysis?.agent_task_completion_rating;
      if (
        agentTaskCompletion === "Complete" ||
        agentTaskCompletion === "Partial"
      ) {
        completedCount += 1;
      }

      totalDuration += response.duration;
      if (
        Object.values(CandidateStatus).includes(
          response.candidate_status as CandidateStatus,
        )
      ) {
        statusCounter[response.candidate_status as CandidateStatus]++;
      }
    });

    setSentimentCount(sentimentCounter);
    setCallCompletion(callCompletionCounter);
    setTotalDuration(totalDuration);
    setCompletedInterviews(completedCount);
    setCandidateStatusCount(statusCounter);

    const preparedData = prepareTableData(responses);
    setTableData(preparedData);
  }, [responses]);

  return (
    <div className="h-screen z-[10] mx-2">
      {responses.length > 0 ? (
        <div className="bg-slate-200 rounded-2xl min-h-[120px] p-4">
          <div className="flex flex-col gap-4 justify-between items-start mx-2">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row gap-2 items-center">
                <p className="font-semibold">{t('generalEvaluation')}</p>
              </div>
              <p className="text-sm">
                {t('interviewer')}: <span className="font-medium">{interviewer?.name}</span>
              </p>
              <p className="text-sm">
                {t('interviewDescription')}: {" "}
                <span className="font-medium">{interview?.description}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-2">{t('responseStats')}</h3>
                <div className="flex flex-row justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{responses.length}</p>
                    <p className="text-sm text-gray-600">{t('totalResponses')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedInterviews}</p>
                    <p className="text-sm text-gray-600">{t('completed')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-2">{t('candidateStatus')}</h3>
                <div className="flex flex-row justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-green-500">
                      {candidateStatusCount.SELECTED}
                    </p>
                    <p className="text-sm text-gray-600">{t('selected')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">
                      {candidateStatusCount.POTENTIAL}
                    </p>
                    <p className="text-sm text-gray-600">{t('potential')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">
                      {candidateStatusCount.NOT_SELECTED}
                    </p>
                    <p className="text-sm text-gray-600">{t('notSelected')}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium mb-2">{t('averageDuration')}</h3>
                <p className="text-2xl font-bold">
                  {convertSecondstoMMSS(totalDuration / responses.length)}
                </p>
                <p className="text-sm text-gray-600">{t('minutes')}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-4 mx-2 p-4 rounded-2xl bg-slate-50 shadow-md">
              <ScrollArea className="h-[250px] w-full">
                <DataTable data={tableData} interviewId={interview?.id || ""} />
              </ScrollArea>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-500">Henüz yanıt yok</p>
        </div>
      )}
    </div>
  );
}

export default SummaryInfo;
