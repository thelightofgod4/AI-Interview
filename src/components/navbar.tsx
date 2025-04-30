import Link from "next/link";
import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Video } from "lucide-react";

function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 bg-slate-100 z-[10] h-fit py-4">
      <div className="flex items-center justify-between h-full gap-2 px-4 md:px-8 mx-auto">
        <div className="flex flex-row gap-3 justify-center">
          <Link href={"/dashboard"} className="flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-600" />
            <p className="px-2 py-1 text-lg md:text-2xl font-bold text-black">
              AI Video Interview <span className="text-[8px]">Beta</span>
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
        <div className="flex items-center">
          <UserButton afterSignOutUrl="/sign-in" signInUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
