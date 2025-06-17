"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";
import { useTranslation } from "react-i18next";

function CreateInterviewCard({ folders, small = false }: { folders: any[], small?: boolean }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Card
        className={`flex items-center border-dashed border-gray-700 border-2 cursor-pointer hover:scale-105 ease-in-out duration-300 ${small ? 'h-16 w-44' : 'h-60 w-56'} ml-1 mr-3 mt-0 rounded-xl shrink-0 overflow-hidden shadow-md`}
        onClick={() => {
          setOpen(true);
        }}
      >
        <CardContent className="flex items-center flex-col mx-auto p-0">
          <div className="flex flex-col justify-center items-center w-full overflow-hidden">
            <Plus size={small ? 32 : 90} strokeWidth={0.5} className="text-gray-700" />
          </div>
          <CardTitle className={`p-0 text-center ${small ? 'text-sm' : 'text-md'}`}>
            {t('createInterviewCard')}
          </CardTitle>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} folders={folders} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
