import Link from "next/link";
import React, { useState } from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Video, Bell, HelpCircle, Globe } from "lucide-react";

function Navbar() {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  return (
    <div className="fixed inset-x-0 top-0 bg-slate-100 z-[10] h-fit py-4">
      <div className="flex items-center justify-between h-full gap-2 px-4 md:px-8 mx-auto">
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
          <button className="relative group">
            <Bell className="w-6 h-6 text-gray-700" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-purple-600 rounded-full"></span>
          </button>
          <button className="group">
            <HelpCircle className="w-6 h-6 text-gray-700" />
          </button>
          <div className="relative">
            <button onClick={() => setLangMenuOpen((v) => !v)} className="group">
              <Globe className="w-6 h-6 text-gray-700" />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
                <button className="w-full text-left px-4 py-2 hover:bg-indigo-100">Türkçe</button>
                <button className="w-full text-left px-4 py-2 hover:bg-indigo-100">English</button>
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
