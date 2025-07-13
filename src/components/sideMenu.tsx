"use client";

import React, { useState } from "react";
import { PlayCircleIcon, SpeechIcon, HomeIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

function SideMenu() {
  const pathname = usePathname();
  if (!pathname) return null;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div
      className="bg-slate-100 p-2 h-auto min-h-screen transition-all duration-200"
      style={{
        width: isOpen ? 200 : 60,
        minWidth: isOpen ? 200 : 60,
        maxWidth: isOpen ? 200 : 60,
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex flex-col gap-1 h-full">
        <div className="flex flex-col justify-between gap-2 mt-20 mb-4">
          <div
            className={`flex items-center p-3 rounded-md hover:bg-slate-200 cursor-pointer transition-all ${
              pathname === "/dashboard"
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard")}
          >
            <HomeIcon className="font-thin mr-2" />
            {isOpen && <p className="font-medium ">{t('sidebarHome')}</p>}
          </div>
          <div
            className={`flex items-center p-3 rounded-md hover:bg-slate-200 cursor-pointer transition-all ${
              pathname.includes("/interviews")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/interviews")}
          >
            <PlayCircleIcon className="font-thin mr-2" />
            {isOpen && <p className="font-medium ">{t('sidebarInterviews')}</p>}
          </div>
          <div
            className={`flex items-center p-3 rounded-md hover:bg-slate-200 cursor-pointer transition-all ${
              pathname.endsWith("/interviewers")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard/interviewers")}
          >
            <SpeechIcon className="font-thin mr-2" />
            {isOpen && <p className="font-medium ">{t('sidebarInterviewers')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
