"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useOrganization } from "@clerk/nextjs";
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
  PauseCircle 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Bell, HelpCircle, Globe } from "lucide-react";
import i18n from "i18next";

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
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 relative">
      {/* Header Actions */}
      <div className="fixed top-6 right-8 z-10 flex items-center gap-6">
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
          <button className="relative group p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Bildirimler">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-purple-600 rounded-full"></span>
          </button>
          <button className="group p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Yardım">
            <HelpCircle className="w-6 h-6 text-gray-700" />
          </button>
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

      <div className="w-full max-w-7xl mx-auto px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">{t('dashboardTitle')}</h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t('dashboardSubtitle')}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-700">
              {t('totalInterviewsCreated')}
            </CardTitle>
              <Calendar className="h-6 w-6 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalInterviews}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-700">
              {t('activeInterviews')}
            </CardTitle>
              <BarChart3 className="h-6 w-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.activeInterviews}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                          <CardTitle className="text-lg font-semibold text-gray-700">
              {t('closedInterviews')}
            </CardTitle>
              <Users className="h-6 w-6 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stats.closedInterviews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">{t('quickActions')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg" onClick={handleCreateInterview}>
              <CardContent className="flex items-center justify-center p-10">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('createInterview')}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg" onClick={handleBrowseInterviewers}>
              <CardContent className="flex items-center justify-center p-10">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-green-100">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('browseInterviewers')}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-lg" onClick={handleViewAllInterviews}>
              <CardContent className="flex items-center justify-center p-10">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-purple-100">
                    <Eye className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{t('viewAllInterviews')}</h3>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">{t('recentInterviews')}</h2>
            <Button variant="outline" size="lg" onClick={handleViewAllInterviews} className="text-lg px-6 py-3">
              {t('viewAll')}
            </Button>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              {recentInterviews.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('noInterviewsCreated')}</h3>
                  <p className="text-gray-600 mb-6">{t('createFirstInterview')}</p>
                  <Button onClick={handleCreateInterview} size="lg" className="px-8 py-3 text-lg">
                    <Plus className="mr-2 h-5 w-5" />
                    {t('createInterview')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentInterviews.map((interview) => (
                    <div 
                      key={interview.id}
                      className="flex items-center justify-between p-6 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                      onClick={() => handleViewInterview(interview.id)}
                    >
                                          <div className="flex items-center space-x-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{interview.name}</h3>
                        <p className="text-gray-600">
                          {interview.creator}
                        </p>
                      </div>
                    </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">{interview.responses} {t('responses')}</p>
                          {getStatusBadge(interview.status)}
                        </div>
                        <Button variant="ghost" size="lg" className="h-12 w-12">
                          <Eye className="h-5 w-5" />
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

      {/* Create Interview Modal */}
      <Modal
        open={createInterviewModalOpen}
        closeOnOutsideClick={false}
        onClose={() => {
          setCreateInterviewModalOpen(false);
        }}
      >
        <CreateInterviewModal 
          open={createInterviewModalOpen} 
          setOpen={setCreateInterviewModalOpen} 
        />
      </Modal>
    </main>
  );
}

export default Dashboard;
