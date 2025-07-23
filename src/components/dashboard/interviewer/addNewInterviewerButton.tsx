"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Modal from "@/components/dashboard/Modal";

function AddNewInterviewerButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card
        className="p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300 h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-lg border-2 border-dashed border-gray-300 hover:border-black transition-all"
        onClick={handleClick}
      >
        <CardContent className="p-0 h-full flex flex-col">
          <div className="flex-1 flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto">
                <Plus size={24} className="text-white" />
              </div>
              <p className="text-xs font-medium text-black px-2">
                {t('addNewInterviewer')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={isModalOpen}
        closeOnOutsideClick={true}
        onClose={handleCloseModal}
      >
        <div className="bg-white rounded-xl p-10 max-w-lg mx-auto">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-black tracking-tight">
                {t('comingSoon')}
              </h2>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-black">
                {t('addNewInterviewer')}
              </h3>
              <p className="text-base text-gray-700 leading-relaxed max-w-md mx-auto">
                {t('comingSoonForPro')}
              </p>
            </div>
            
            <div className="pt-4">
              <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-black">Pro Feature</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AddNewInterviewerButton; 
 