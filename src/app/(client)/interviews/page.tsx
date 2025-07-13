"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrganization, useClerk } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import { Gem, Plus, Search, Filter, User, Folder, Activity, X, RotateCcw, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import CreateFolderButton from '@/components/dashboard/interview/createFolderButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const { user } = useClerk();
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] =
    useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { t } = useTranslation();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Interviewer mapping
  const interviewerMap = {
    "211": "Analytical Mia",
    "212": "Warmth Alex", 
    "213": "Vizyoner Duru",
    "214": "Empatik Ahmet"
  };

  // Filtered interviews
  const filteredInterviews = useMemo(() => {
    if (!interviews) return [];
    return interviews.filter((interview) => {
      const matchesSearch = interview.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesInterviewer = 
        selectedInterviewer === "all" || 
        interview.interviewer_id?.toString() === selectedInterviewer;
      const matchesStatus = 
        selectedStatus === "all" ||
        (selectedStatus === "active" && interview.is_active) ||
        (selectedStatus === "inactive" && !interview.is_active);
      const matchesFolder =
        selectedFolder === "all" || interview.folder_id?.toString() === selectedFolder;
      return matchesSearch && matchesInterviewer && matchesStatus && matchesFolder;
    });
  }, [interviews, searchQuery, selectedInterviewer, selectedStatus, selectedFolder]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || selectedInterviewer !== "all" || selectedStatus !== "all" || selectedFolder !== "all";

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedInterviewer("all");
    setSelectedStatus("all");
    setSelectedFolder("all");
  };

  function InterviewsLoader() {
    return (
      <>
        <div className="flex flex-row">
          <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-60 w-56 ml-1 mr-3  mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
          <div className="h-60 w-56 ml-1 mr-3 mt-3 flex-none animate-pulse rounded-xl bg-gray-300" />
        </div>
      </>
    );
  }

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponsesCount = async () => {
      if (organization?.id && interviews) {
        setLoading(true);
        try {
          let totalResponses = 0;
          if (currentPlan != "free_trial_over") {
            for (const interview of interviews) {
              const responses = await ResponseService.getAllResponses(
                interview.id,
              );
              totalResponses += responses.length;
            }
          }

          if (
            totalResponses >= allowedResponsesCount &&
            currentPlan === "free"
          ) {
            setCurrentPlan("free_trial_over");
            try {
              for (const interview of interviews) {
                await InterviewService.updateInterview(
                  { is_active: false },
                  interview.id,
                );
              }
            } catch (error) {
              console.error("Error disabling active interviews", error);
            }
            await ClientService.updateOrganization(
              { plan: "free_trial_over" },
              organization.id,
            );
          }
        } catch (error) {
          console.error("Error fetching responses:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResponsesCount();
  }, [interviews, organization, currentPlan, allowedResponsesCount]);

  const [folders, setFolders] = useState<any[] | undefined>(undefined);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return;
    setDeleteLoading(true);
    await supabase.from('folders').delete().eq('id', deleteFolderId);
    setDeleteLoading(false);
    setDeleteFolderId(null);
    fetchFolders();
  };

  const fetchFolders = async () => {
    setLoading(true);
    if (!user?.id) {
      setFolders(undefined);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    if (!error && data) setFolders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFolders();
  }, [user?.id]);

  // Folder bazlı interview gruplama
  const interviewsByFolder = useMemo(() => {
    const map: Record<string, any[]> = {};
    folders?.forEach(folder => {
      map[folder.id] = [];
    });
    filteredInterviews.forEach(interview => {
      if (interview.folder_id && map[interview.folder_id]) {
        map[interview.folder_id].push(interview);
      }
    });
    return map;
  }, [folders, filteredInterviews]);

  const [openFolders, setOpenFolders] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Varsayılan olarak tüm folderlar kapalı başlasın
    if (folders && folders.length > 0) {
      const initial: Record<number, boolean> = {};
      folders.forEach(f => { initial[f.id] = false; });
      setOpenFolders(initial);
    }
  }, [folders]);

  const toggleFolder = (folderId: number) => {
    setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div>
        <div className="flex flex-row items-start justify-between gap-3 mt-8 mb-2 w-full">
          <div>
            <h2 className="mr-2 text-2xl font-semibold tracking-tight">
              {t('myInterviewsTitle')}
            </h2>
            <div className=" text-sm tracking-tight text-gray-600 font-medium ">
              {t('myInterviewsSubtitle')}
            </div>
          </div>
          <div className="flex flex-row gap-4 mt-1">
            <CreateInterviewCard folders={folders ?? []} small />
            <div onClick={() => setCreateFolderModalOpen(true)} style={{ cursor: 'pointer' }}>
              <CreateFolderButton folders={folders ?? []} fetchFolders={fetchFolders} />
            </div>
          </div>
        </div>
        <Modal
          open={createFolderModalOpen}
          onClose={() => setCreateFolderModalOpen(false)}
        >
          <CreateFolderButton folders={folders ?? []} fetchFolders={fetchFolders} modalOnly setOpen={setCreateFolderModalOpen} />
        </Modal>
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-6 mb-6">
          {/* Header with filter count and reset button */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {filteredInterviews.length} {t('results', 'results')} 
                {interviews && interviews.length > 0 && ` ${t('of', 'of')} ${interviews.length}`}
              </span>
              {hasActiveFilters && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {t('filtered', 'Filtered')}
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-3 text-xs border-gray-300 hover:bg-gray-50"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                {t('resetFilters', 'Reset')}
              </Button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={t('searchInterviews', 'Search interviews...')}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="flex h-12 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 pl-12 pr-10 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 hover:bg-gray-100 focus:hover:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Interviewer Filter */}
              <div className="min-w-0 relative">
                <Select value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
                  <SelectTrigger className={`w-[180px] h-12 border-gray-300 hover:bg-gray-100 focus:bg-white transition-all duration-200 rounded-lg ${selectedInterviewer !== "all" ? "bg-blue-50 border-blue-300" : "bg-gray-50"}`}>
                    <div className="flex items-center">
                      <User className={`h-4 w-4 mr-2 ${selectedInterviewer !== "all" ? "text-blue-600" : "text-gray-600"}`} />
                      <SelectValue placeholder="Interviewer" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allInterviewers', 'All Interviewers')}</SelectItem>
                    {Object.entries(interviewerMap).map(([id, name]) => (
                      <SelectItem key={id} value={id}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedInterviewer !== "all" && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Folder Filter (placeholder for future) */}
              <div className="min-w-0 relative">
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger
                    className={`w-[150px] h-12 border-gray-300 hover:bg-gray-100 focus:bg-white transition-all duration-200 rounded-lg ${
                      selectedFolder !== "all" ? "bg-orange-50 border-orange-300" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <Folder className="h-4 w-4 mr-2 text-gray-600" />
                      <SelectValue placeholder="Folder" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allFolders', 'All Folders')}</SelectItem>
                    {folders?.map(folder => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>{folder.name}</SelectItem>
                    ))}
                  </SelectContent>
                  {selectedFolder !== "all" && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </Select>
              </div>

              {/* Status Filter */}
              <div className="min-w-0 relative">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className={`w-[140px] h-12 border-gray-300 hover:bg-gray-100 focus:bg-white transition-all duration-200 rounded-lg ${selectedStatus !== "all" ? "bg-green-50 border-green-300" : "bg-gray-50"}`}>
                    <div className="flex items-center">
                      <Activity className={`h-4 w-4 mr-2 ${selectedStatus !== "all" ? "text-green-600" : "text-gray-600"}`} />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allStatus', 'All Status')}</SelectItem>
                    <SelectItem value="active">{t('active', 'Active')}</SelectItem>
                    <SelectItem value="inactive">{t('inactive', 'Inactive')}</SelectItem>
                  </SelectContent>
                </Select>
                {selectedStatus !== "all" && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8">
          {loading || folders === undefined ? (
            <div className="text-center py-12">
              {/* Skeleton veya spinner */}
              <span>Yükleniyor...</span>
            </div>
          ) : folders
            .filter(folder => selectedFolder === "all" || folder.id.toString() === selectedFolder)
            .map((folder) => (
              <div key={folder.id} className="mb-6 border-b pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    className="flex items-center gap-2 text-xl font-bold text-gray-800 focus:outline-none hover:text-indigo-600 transition-colors"
                    onClick={() => toggleFolder(folder.id)}
                    style={{ userSelect: 'none' }}
                  >
                    {openFolders[folder.id] ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                    {folder.name}
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="ml-1 p-1 rounded hover:bg-red-100 group"
                        title={t('deleteFolderButton')}
                        onClick={e => { e.stopPropagation(); setDeleteFolderId(folder.id.toString()); }}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('deleteFolderConfirm')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteFolder} disabled={deleteLoading}>
                          {deleteLoading ? t('deleting', 'Siliniyor...') : t('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                {openFolders[folder.id] && (
                  <div className="flex flex-wrap items-start">
                    {interviewsByFolder[folder.id] && interviewsByFolder[folder.id].length > 0 ? (
                      interviewsByFolder[folder.id].map((item) => (
                        <InterviewCard
                          id={item.id}
                          interviewerId={item.interviewer_id}
                          key={item.id}
                          name={item.name}
                          url={item.url ?? ""}
                          readableSlug={item.readable_slug}
                        />
                      ))
                    ) : (
                      <div className="text-gray-400 italic ml-2">{t('noInterviewsYet', 'Henüz görüşme yok')}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}

export default Interviews; 
 