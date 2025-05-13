"use client";

import React, { useState } from "react";
import { PlayCircleIcon, SpeechIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`z-[10] bg-slate-100 p-2 fixed top-[64px] left-0 h-full transition-all duration-200 
        hidden md:block
        ${isOpen ? "w-[200px]" : "w-[60px]"}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex flex-col gap-1 h-full">
        <div className="flex flex-col justify-between gap-2 mt-2">
          <div
            className={`flex items-center p-3 rounded-md hover:bg-slate-200 cursor-pointer transition-all ${
              pathname.endsWith("/dashboard") ||
              pathname.includes("/interviews")
                ? "bg-indigo-200"
                : "bg-slate-100"
            }`}
            onClick={() => router.push("/dashboard")}
          >
            <PlayCircleIcon className="font-thin mr-2" />
            {isOpen && <p className="font-medium ">Interviews</p>}
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
            {isOpen && <p className="font-medium ">Interviewers</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
