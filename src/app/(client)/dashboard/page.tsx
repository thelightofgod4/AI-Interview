"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrganization, useClerk } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import { 
  Calendar, 
  BarChart3, 
  Users, 
  Plus, 
  UserCheck, 
  Eye,
  Clock,
  CheckCircle,
  PauseCircle,
  FolderPlus
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Bell, Globe } from "lucide-react";
import i18n from "i18next";
import { supabase } from '@/lib/supabase';
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import CreateFolderButton from "@/components/dashboard/interview/createFolderButton";
import ActionButton from '@/components/dashboard/interview/ActionButton';
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";

interface InterviewStats {
  totalInterviews: number;
  activeInterviews: number;
  closedInterviews: number;
  totalResponses: number;
}

interface RecentInterview {
  id: string;
  name: string;
  responses: number;
  status: 'active' | 'draft' | 'inactive';
  creator: string;
}

function Dashboard() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const { user } = useClerk();
  const [loading, setLoading] = useState<boolean>(false);
  
  // Cache'den başlangıç değerleri al
  const getCachedStats = (): InterviewStats => {
    if (typeof window === 'undefined') return { totalInterviews: 0, activeInterviews: 0, closedInterviews: 0, totalResponses: 0 };
    
    const cached = localStorage.getItem('dashboard-stats');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return { totalInterviews: 0, activeInterviews: 0, closedInterviews: 0, totalResponses: 0 };
      }
    }
    return { totalInterviews: 0, activeInterviews: 0, closedInterviews: 0, totalResponses: 0 };
  };

  const [stats, setStats] = useState<InterviewStats>(getCachedStats);
  // Cache'den recent interviews al
  const getCachedRecentInterviews = (): RecentInterview[] => {
    if (typeof window === 'undefined') return [];
    
    const cached = localStorage.getItem('dashboard-recent-interviews');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return [];
      }
    }
    return [];
  };

  const [recentInterviews, setRecentInterviews] = useState<RecentInterview[]>(getCachedRecentInterviews);
  const [createInterviewModalOpen, setCreateInterviewModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Interviewer ID'den isim mapping
  const getInterviewerName = (interviewerId: string | bigint | null) => {
    const idMap: { [key: string]: string } = {
      '211': 'Analytical Mia',
      '212': 'Warmth Alex',
      '213': 'Vizyoner Duru',
      '214': 'Empatik Ahmet'
    };
    
    if (!interviewerId) return 'Bilinmeyen';
    const idStr = interviewerId.toString();
    return idMap[idStr] || 'Bilinmeyen';
  };

  // İlk render için hızlı istatistikler (response sayısı olmadan)
  const quickStats = useMemo(() => {
    if (!interviews || interviews.length === 0) {
      return {
        totalInterviews: 0,
        activeInterviews: 0,
        closedInterviews: 0,
        totalResponses: 0
      };
    }

    const activeCount = interviews.filter(i => i.is_active).length;
    return {
      totalInterviews: interviews.length,
      activeInterviews: activeCount,
      closedInterviews: interviews.length - activeCount,
      totalResponses: 0 // Bu async olarak güncellenecek
    };
  }, [interviews]);

  // Hızlı recent interviews (response sayısı olmadan)
  const quickRecentInterviews = useMemo(() => {
    if (!interviews || interviews.length === 0) return [];
    
         return interviews.slice(0, 5).map(interview => ({
       id: interview.id,
       name: interview.name,
       responses: 0, // Bu async olarak güncellenecek
       status: interview.is_active ? 'active' as const : 'inactive' as const,
       creator: getInterviewerName(interview.interviewer_id)
     }));
  }, [interviews]);

  // İlk render'da hızlı stats'i göster
  useEffect(() => {
    if (interviews && interviews.length > 0) {
      setStats(quickStats);
      setRecentInterviews(quickRecentInterviews);
      
      // Hızlı stats'ı da cache'le (response sayısı olmadan)
      localStorage.setItem('dashboard-stats', JSON.stringify(quickStats));
      localStorage.setItem('dashboard-recent-interviews', JSON.stringify(quickRecentInterviews));
    }
  }, [quickStats, quickRecentInterviews, interviews]);

  // Arka planda response sayılarını getir (async)
  useEffect(() => {
    const calculateDetailedStats = async () => {
      if (!interviews || interviews.length === 0) return;

      try {
        let totalResponses = 0;
        const recentDataWithResponses: RecentInterview[] = [];

        // Promise.all ile paralel olarak fetch et - daha hızlı
        const responsePromises = interviews.slice(0, 5).map(async (interview) => {
          const responses = await ResponseService.getAllResponses(interview.id);
          totalResponses += responses.length;
          
                   return {
           id: interview.id,
           name: interview.name,
           responses: responses.length,
           status: interview.is_active ? 'active' as const : 'inactive' as const,
           creator: getInterviewerName(interview.interviewer_id)
         };
        });

        const recentData = await Promise.all(responsePromises);
        
        // Tüm interviews için total response sayısını hesapla
        if (interviews.length > 5) {
          const remainingPromises = interviews.slice(5).map(async (interview) => {
            const responses = await ResponseService.getAllResponses(interview.id);
            return responses.length;
          });
          const remainingCounts = await Promise.all(remainingPromises);
          totalResponses += remainingCounts.reduce((sum, count) => sum + count, 0);
        }

        // Stats'i güncelle (response sayısı ile)
        const updatedStats = {
          ...quickStats,
          totalResponses
        };
        setStats(updatedStats);
        
        // Cache'e kaydet
        localStorage.setItem('dashboard-stats', JSON.stringify(updatedStats));
        localStorage.setItem('dashboard-recent-interviews', JSON.stringify(recentData));
        
        setRecentInterviews(recentData);
      } catch (error) {
        console.error("Error calculating detailed stats:", error);
      }
    };

    // 100ms delay ile çalıştır - UI bloke olmasın
    const timeoutId = setTimeout(calculateDetailedStats, 100);
    return () => clearTimeout(timeoutId);
  }, [interviews]);

  useEffect(() => {
    // Kullanıcı veya organization değiştiğinde cache ve state sıfırla
    setStats({ totalInterviews: 0, activeInterviews: 0, closedInterviews: 0, totalResponses: 0 });
    setRecentInterviews([]);
    localStorage.removeItem('dashboard-stats');
    localStorage.removeItem('dashboard-recent-interviews');
  }, [user?.id, organization?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchFolders = async () => {
      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });
      if (!error && data) setFolders(data);
    };
    fetchFolders();
  }, [user?.id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          const interviewIds = data.map((n: any) => n.interview_id);
          const responseIds = data.map((n: any) => n.response_id);
          const { data: interviews } = await supabase
            .from("interview")
            .select("id, name")
            .in("id", interviewIds);
          const { data: responses } = await supabase
            .from("response")
            .select("id, name, interview_id, created_at")
            .in("id", responseIds);
          const interviewNameMap: Record<string, string> = {};
          if (interviews) {
            interviews.forEach((r: any) => {
              interviewNameMap[r.id] = r.name;
            });
          }
          const grouped: Record<string, any[]> = {};
          if (responses) {
            responses.forEach((r: any) => {
              if (!grouped[r.interview_id]) grouped[r.interview_id] = [];
              grouped[r.interview_id].push(r);
            });
          }
          let finalNotifications: any[] = [];
          Object.entries(grouped).forEach(([interviewId, respArr]) => {
            if (respArr.length >= 4) {
              const sorted = respArr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              const last = sorted[0];
              finalNotifications.push({
                id: `grouped-${interviewId}`,
                interview_id: interviewId,
                interview_name: interviewNameMap[interviewId] || "",
                response_name: last.name,
                count: respArr.length - 1,
                created_at: last.created_at,
                grouped: true
              });
            } else {
              respArr.forEach((r: any) => {
                finalNotifications.push({
                  id: r.id,
                  interview_id: interviewId,
                  interview_name: interviewNameMap[interviewId] || "",
                  response_name: r.name,
                  created_at: r.created_at,
                  grouped: false
                });
              });
            }
          });
          finalNotifications = finalNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setNotifications(finalNotifications);
        }
      }
    };
    fetchNotifications();
  }, [user?.id, i18n.language]);

  const handleCreateInterview = () => {
    setCreateInterviewModalOpen(true);
  };

  const handleBrowseInterviewers = () => {
    router.push('/dashboard/interviewers');
  };

  const handleViewAllInterviews = () => {
    router.push('/interviews');
  };

  const handleViewInterview = (interviewId: string) => {
    router.push(`/interviews/${interviewId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <PauseCircle className="mr-1 h-3 w-3" />
            Inactive
          </span>
        );
      default:
        return null;
      }
    };

  // Loading skeleton'ı tamamen kaldırdık - direkt content'i göster

  const lang = i18n.language === "tr" ? tr : enUS;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-0">
      {/* İkonlar ve switcher en sağ üstte, container dışında */}
      <div className="w-full flex justify-end px-8 pt-1">
        <div className="flex items-center gap-3">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard"
            hidePersonal={true}
            afterSelectOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
            appearance={{
              variables: {
                fontSize: "0.9rem",
              },
            }}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              className="relative group p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Bildirimler"
              onClick={() => setNotificationOpen((v) => !v)}
            >
            <Bell className="w-6 h-6 text-gray-700" />
              {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
              )}
          </button>
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500">{i18n.t("noNotifications")}</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b last:border-b-0">
                      <div className="font-medium text-sm">
                        {n.grouped
                          ? i18n.t("newResponseNotificationGrouped", { interviewName: n.interview_name, name: n.response_name, count: n.count })
                          : n.interview_name && n.response_name
                            ? i18n.t("newResponseNotificationWithInterviewAndName", { interviewName: n.interview_name, name: n.response_name })
                            : n.interview_name
                              ? i18n.t("newResponseNotificationWithInterviewName", { interviewName: n.interview_name })
                              : n.response_name
                                ? i18n.t("newResponseNotificationWithName", { name: n.response_name })
                                : i18n.t("newResponseNotification")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: lang })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen((v) => !v)} 
              className="group p-2 rounded-full hover:bg-white/20 transition-colors" 
              aria-label="Dil Seçici"
            >
              <Globe className="w-6 h-6 text-gray-700" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-xl z-50">
                <button 
                  aria-label="Türkçe" 
                  className="w-full text-left px-4 py-2 hover:bg-indigo-100 rounded-t-lg transition-colors" 
                  onClick={() => { 
                    i18n.changeLanguage('tr'); 
                    setLangMenuOpen(false); 
                    localStorage.setItem('lang', 'tr'); 
                    window.location.reload(); 
                  }}
                                 >
                   Türkçe
                 </button>
                <button 
                  aria-label="English" 
                  className="w-full text-left px-4 py-2 hover:bg-indigo-100 rounded-b-lg transition-colors" 
                  onClick={() => { 
                    i18n.changeLanguage('en'); 
                    setLangMenuOpen(false); 
                    localStorage.setItem('lang', 'en'); 
                    window.location.reload(); 
                  }}
                                 >
                   English
                 </button>
              </div>
            )}
          </div>
          <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
        </div>
      </div>
      {/* Dashboard ana içeriği */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold tracking-tight text-gray-900">{t('dashboardTitle')}</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            {t('dashboardSubtitle')}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                {t('totalInterviewsCreated')}
              </CardTitle>
              <Calendar className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalInterviews}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                {t('activeInterviews')}
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeInterviews}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm sm:text-base font-semibold text-gray-700">
                {t('closedInterviews')}
              </CardTitle>
              <Users className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.closedInterviews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('quickActions')}</h2>
          </div>
          <div className="flex flex-row items-center justify-center gap-8 mt-2">
            <ActionButton
              icon={<Plus size={56} strokeWidth={1.5} className="text-gray-700" />}
              text={t('createInterview')}
              onClick={() => setCreateInterviewModalOpen(true)}
              className="h-32 w-80"
            />
            <ActionButton
              icon={<FolderPlus size={56} strokeWidth={1.5} className="text-gray-700" />}
              text={t('createFolderButton')}
              onClick={() => setCreateFolderModalOpen(true)}
              className="h-32 w-80"
            />
            <ActionButton
              icon={<Eye size={56} strokeWidth={1.5} className="text-indigo-500" />}
              text={t('viewAllInterviews')}
              onClick={handleViewAllInterviews}
              iconBg="bg-indigo-50"
              className="h-32 w-80"
            />
          </div>
          {/* Modals */}
          <Modal
            open={createInterviewModalOpen}
            closeOnOutsideClick={false}
            onClose={() => setCreateInterviewModalOpen(false)}
          >
            <CreateInterviewModal 
              open={createInterviewModalOpen} 
              setOpen={setCreateInterviewModalOpen} 
              folders={folders}
            />
          </Modal>
          <Modal
            open={createFolderModalOpen}
            closeOnOutsideClick={true}
            onClose={() => setCreateFolderModalOpen(false)}
          >
            <CreateFolderButton 
              folders={folders}
              fetchFolders={async () => {
                if (!user?.id) return;
                const { data, error } = await supabase
                  .from('folders')
                  .select('*')
                  .eq('user_id', user?.id)
                  .order('is_default', { ascending: false })
                  .order('created_at', { ascending: true });
                if (!error && data) setFolders(data);
              }}
              modalOnly
              setOpen={setCreateFolderModalOpen}
            />
          </Modal>
                    </div>

        {/* Recent Interviews */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('recentInterviews')}</h2>
            <Button variant="outline" size="sm" onClick={handleViewAllInterviews} className="text-sm sm:text-base px-4 py-2">
              {t('viewAll')}
            </Button>
                      </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              {interviewsLoading ? (
                <div className="text-center py-12">
                  {/* Skeleton veya spinner */}
                  <span>Yükleniyor...</span>
                </div>
              ) : recentInterviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noInterviewsCreated')}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{t('createFirstInterview')}</p>
                  <Button onClick={handleCreateInterview} size="default" className="px-6 py-2">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createInterview')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Asıl içerik */}
                  {recentInterviews.map((interview) => (
                    <div 
                      key={interview.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                      onClick={() => handleViewInterview(interview.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{interview.name}</h3>
                          <p className="text-gray-600">
                            {interview.creator}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{interview.responses} {t('responses')}</p>
                          {getStatusBadge(interview.status)}
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
