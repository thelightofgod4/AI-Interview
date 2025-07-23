import Link from "next/link";
import React, { useState, useEffect } from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Video, Bell, Globe } from "lucide-react";
import i18n from "i18next";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useClerk } from "@clerk/nextjs";

interface Notification {
  id: string;
  response_id: number;
  interview_id: string;
  user_id: string;
  created_at: string;
}

function Navbar() {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user } = useClerk();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          // interview_id'leri topla
          const interviewIds = data.map((n: any) => n.interview_id);
          // response_id'leri topla
          const responseIds = data.map((n: any) => n.response_id);
          // topluca interview adlarını çek
          const { data: interviews } = await supabase
            .from("interview")
            .select("id, name")
            .in("id", interviewIds);
          // topluca response adlarını çek
          const { data: responses } = await supabase
            .from("response")
            .select("id, name, interview_id, created_at")
            .in("id", responseIds);
          // id -> name map'leri oluştur
          const interviewNameMap: Record<string, string> = {};
          if (interviews) {
            interviews.forEach((r: any) => {
              interviewNameMap[r.id] = r.name;
            });
          }
          // response'ları interview_id'ye göre grupla
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
              // Son geleni bul
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
              // Her biri için ayrı bildirim
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
          // Bildirimleri tarihe göre sırala
          finalNotifications = finalNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setNotifications(finalNotifications);
        }
      }
    };
    fetchNotifications();
  }, [user?.id, i18n.language]);

  const lang = i18n.language === "tr" ? tr : enUS;

  return (
    <div className="fixed inset-x-0 top-0 bg-slate-100 z-[10] h-fit py-4 min-h-[48px]">
      <div className="flex items-center justify-between h-full gap-2 px-4 md:px-8 mx-auto min-h-[48px]">
        <div className="flex flex-row gap-3 justify-center">
          <Link href={"/dashboard"} className="flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-600" />
            <p className="px-2 py-1 text-lg md:text-2xl font-bold text-black">
              AI Interview
            </p>
          </Link>
          <p className="my-auto text-xl hidden md:block">/</p>
          <div className="my-auto hidden md:block">
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
        </div>
        <div className="flex items-center gap-6 relative">
          <div className="relative">
            <button
              className="relative group"
              aria-label="Bildirimler"
              onClick={() => setNotificationOpen((v) => !v)}
            >
            <Bell className="w-6 h-6 text-gray-700" />
              {notifications.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-purple-600 rounded-full"></span>
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
            <button onClick={() => setLangMenuOpen((v) => !v)} className="group" aria-label="Dil Seçici">
              <Globe className="w-6 h-6 text-gray-700" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
                <button aria-label="Türkçe" className="w-full text-left px-4 py-2 hover:bg-indigo-100" onClick={() => { i18n.changeLanguage('tr'); setLangMenuOpen(false); localStorage.setItem('lang', 'tr'); window.location.reload(); }}>Türkçe</button>
                <button aria-label="English" className="w-full text-left px-4 py-2 hover:bg-indigo-100" onClick={() => { i18n.changeLanguage('en'); setLangMenuOpen(false); localStorage.setItem('lang', 'en'); window.location.reload(); }}>English</button>
              </div>
            )}
          </div>
          <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
