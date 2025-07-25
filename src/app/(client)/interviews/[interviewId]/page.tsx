"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useInterviews } from "@/contexts/interviews.context";
import { Share2, Filter, Pencil, UserIcon, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ResponseService } from "@/services/responses.service";
import { ClientService } from "@/services/clients.service";
import { Interview } from "@/types/interview";
import { Response } from "@/types/response";
import { formatTimestampToDateHHMM } from "@/lib/utils";
import CallInfo from "@/components/call/callInfo";
import SummaryInfo from "@/components/dashboard/interview/summaryInfo";
import { InterviewService } from "@/services/interviews.service";
import EditInterview from "@/components/dashboard/interview/editInterview";
import Modal from "@/components/dashboard/Modal";
import { toast } from "sonner";
import SharePopup from "@/components/dashboard/interview/sharePopup";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateStatus } from "@/lib/enum";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import axios from "axios";
import { useTranslation } from 'react-i18next';

interface Props {
  params: {
    interviewId: string;
  };
  searchParams: {
    call: string;
    edit: boolean;
  };
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewHome({ params, searchParams }: Props) {
  const [interview, setInterview] = useState<Interview>();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isViewed, setIsViewed] = useState(false);
  const [themeColor, setThemeColor] = useState("#4F46E5");
  const [iconColor, seticonColor] = useState("#4F46E5");
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<CandidateStatus | "ALL">("ALL");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { organization } = useOrganization();
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const getInterviewById = async (interviewId: string) => {
    try {
      const response = await InterviewService.getInterviewById(interviewId);
      return response;
    } catch (error) {
      console.error("Error fetching interview:", error);
      return null;
    }
  };

  const fetchResponses = async (interviewId: string) => {
    try {
      const responses = await ResponseService.getAllResponses(interviewId);
      setResponses(responses || []);
    } catch (error) {
      console.error("Error fetching responses:", error);
      setResponses([]);
    }
  };

  useEffect(() => {
    const fetchInterviewData = async () => {
      setLoading(true);
      try {
        const interviewData = await getInterviewById(params.interviewId);
        if (interviewData) {
          setInterview(interviewData);
          setIsActive(interviewData.is_active);
          setIsViewed(interviewData.is_viewed);
          setThemeColor(interviewData.theme_color ?? "#4F46E5");
          seticonColor(interviewData.theme_color ?? "#4F46E5");
          await fetchResponses(params.interviewId);
        }
      } catch (error) {
        console.error("Error in fetchInterviewData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewData();
  }, [params.interviewId]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  const seeInterviewPreviewPage = () => {
    // Production'da her zaman https kullan
    const protocol = "https";
    if (interview?.url) {
      window.open(interview.url, "_blank");
    } else {
      console.error("Interview URL is null or undefined.");
    }
  };

  const handleDeleteResponse = (deletedCallId: string) => {
    if (responses) {
      setResponses(
        responses.filter((response) => response.call_id !== deletedCallId),
      );
      if (searchParams.call === deletedCallId) {
        router.push(`/interviews/${params.interviewId}`);
      }
    }
  };

  const handleResponseClick = async (response: Response) => {
    try {
      await ResponseService.saveResponse({ is_viewed: true }, response.call_id);
      if (responses) {
        const updatedResponses = responses.map((r) =>
          r.call_id === response.call_id ? { ...r, is_viewed: true } : r,
        );
        setResponses(updatedResponses);
      }
      setIsViewed(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async () => {
    try {
      const updatedIsActive = !isActive;
      setIsActive(updatedIsActive);

      await InterviewService.updateInterview(
        { is_active: updatedIsActive },
        params.interviewId,
      );

      toast.success(t("interviewStatusUpdated"), {
        description: updatedIsActive ? t("interviewNowActive") : t("interviewNowInactive"),
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update the interview status.",
        duration: 3000,
      });
    }
  };

  const handleThemeColorChange = async (newColor: string) => {
    try {
      await InterviewService.updateInterview(
        { theme_color: newColor },
        params.interviewId,
      );

      toast.success("Theme color updated", {
        position: "bottom-right",
        duration: 3000,
      });
      setThemeColor(newColor);
      seticonColor(newColor);
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update the theme color.",
        duration: 3000,
      });
    }
  };

  const handleCandidateStatusChange = (callId: string, newStatus: string) => {
    setResponses((prevResponses) => {
      return prevResponses?.map((response) =>
        response.call_id === callId
          ? { ...response, candidate_status: newStatus }
          : response,
      );
    });
  };

  const openSharePopup = () => {
    setIsSharePopupOpen(true);
  };

  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  const handleColorChange = (color: any) => {
    setThemeColor(color.hex);
  };

  const applyColorChange = () => {
    handleThemeColorChange(themeColor);
    setShowColorPicker(false);
  };

  const filterResponses = () => {
    if (!responses) {
      return [];
    }
    if (filterStatus == "ALL") {
      return responses;
    }

    return responses?.filter(
      (response) => response?.candidate_status == filterStatus,
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen mx-0 bg-white">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[80%] w-full">
          <LoaderWithText />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 w-full flex-1">
            <div className="w-full md:w-[15%] bg-slate-200 rounded-md p-4 flex flex-col min-h-[85vh]">
              <div className="flex flex-col gap-2 flex-1 h-full">
                <div className="flex flex-row md:flex-col gap-2">
                  <Button
                    className={`w-full text-sm flex items-center justify-start gap-2 ${
                      !searchParams.call && !searchParams.edit
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : ""
                    }`}
                    variant={"ghost"}
                    onClick={() => {
                      router.push(`/interviews/${params.interviewId}`);
                    }}
                  >
                    <UserIcon className="h-4 w-4" />
                    {t('summaryTab')}
                  </Button>
                  <Button
                    className="w-full text-sm flex items-center justify-start gap-2"
                    variant={"ghost"}
                    onClick={openSharePopup}
                  >
                    <Share2 className="h-4 w-4" />
                    {t('share')}
                  </Button>
                  <Button
                    className={`w-full text-sm flex items-center justify-start gap-2 ${
                      searchParams.edit
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : ""
                    }`}
                    variant={"ghost"}
                    onClick={() => {
                      router.push(
                        `/interviews/${params.interviewId}?edit=true`,
                      );
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    {t('edit')}
                  </Button>
                </div>
                <div className="flex flex-row md:flex-col items-center gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isActive}
                      onCheckedChange={handleToggle}
                    />
                    <p className="text-sm">
                      {isActive ? t('active') : t('inactive')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-sm font-medium">{t('filter')}</p>
                  <Select
                    value={filterStatus}
                    onValueChange={(value: CandidateStatus | "ALL") =>
                      setFilterStatus(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('filter')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t('all')}</SelectItem>
                      <SelectItem value="NOT_SELECTED">{t('notSelected')}</SelectItem>
                      <SelectItem value="POTENTIAL">{t('potential')}</SelectItem>
                      <SelectItem value="SELECTED">{t('selected')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea className="flex-1 mt-4">
                  {filterResponses().map((response) => (
                    <div
                      key={response.call_id}
                      className={`flex flex-row gap-1 items-center w-full p-2 rounded-md mb-2 cursor-pointer hover:bg-slate-300 ${
                        searchParams.call === response.call_id
                          ? "bg-slate-300"
                          : "bg-slate-100"
                      }`}
                      onClick={() => {
                        if (!response.is_viewed) {
                          handleResponseClick(response);
                        }
                        router.push(
                          `/interviews/${params.interviewId}?call=${response.call_id}`,
                        );
                      }}
                    >
                      <div className="flex flex-row gap-1 items-center w-full">
                        {response.candidate_status === "NOT_SELECTED" ? (
                          <div className="w-[5%] h-full bg-red-500 rounded-sm" />
                        ) : response.candidate_status === "POTENTIAL" ? (
                          <div className="w-[5%] h-full bg-yellow-500 rounded-sm" />
                        ) : response.candidate_status === "SELECTED" ? (
                          <div className="w-[5%] h-full bg-green-500 rounded-sm" />
                        ) : (
                          <div className="w-[5%] h-full bg-gray-400 rounded-sm" />
                        )}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col my-auto">
                            <p className="font-medium mb-[2px] text-sm">
                              {response?.name
                                ? t('responseOf', { name: response?.name })
                                : "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatTimestampToDateHHMM(
                                String(response?.created_at),
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-center justify-center ml-auto flex-shrink-0">
                            {!response.is_viewed && (
                              <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
            {responses && (
              <div className="w-full md:w-[85%] rounded-md">
                {searchParams.call ? (
                  <CallInfo
                    call_id={searchParams.call}
                    onDeleteResponse={handleDeleteResponse}
                    onCandidateStatusChange={handleCandidateStatusChange}
                  />
                ) : searchParams.edit ? (
                  <EditInterview interview={interview} />
                ) : (
                  <SummaryInfo responses={responses} interview={interview} />
                )}
              </div>
            )}
          </div>
        </>
      )}
      {isSharePopupOpen && (
        <SharePopup
          open={isSharePopupOpen}
          shareContent={
            interview?.readable_slug
              ? `${base_url}/call/${interview?.readable_slug}`
              : (interview?.url as string)
          }
          onClose={closeSharePopup}
        />
      )}
    </div>
  );
}

export default InterviewHome;
