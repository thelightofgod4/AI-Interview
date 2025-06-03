import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCallLanguage } from "@/contexts/call-language.context";

const useTabSwitchPrevention = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsDialogOpen(true);
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleUnderstand = () => {
    setIsDialogOpen(false);
  };

  return { isDialogOpen, tabSwitchCount, handleUnderstand };
};

function TabSwitchWarning() {
  const { isDialogOpen, handleUnderstand } = useTabSwitchPrevention();
  const { getLocalizedText } = useCallLanguage();

  return (
    <AlertDialog open={isDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {getLocalizedText('Uyarı: Sekme Değiştirme', 'Warning: Tab Switching')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {getLocalizedText(
              'Sekme değiştirmek görüşme performansınızı olumsuz etkileyebilir. Sekme değiştirme işlemleri takip edilmektedir.',
              'Switching tabs may degrade your interview performance. Tab switching is tracked.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-indigo-400 hover:bg-indigo-600 text-white"
            onClick={handleUnderstand}
          >
            {getLocalizedText('Anladım', 'I understand')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { TabSwitchWarning, useTabSwitchPrevention };
