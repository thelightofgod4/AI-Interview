import React, { useEffect, useState } from "react";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import DetailsPopup from "@/components/dashboard/interview/create-popup/details";
import QuestionsPopup from "@/components/dashboard/interview/create-popup/questions";
import { InterviewBase } from "@/types/interview";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  folders: any[];
}

const CreateEmptyInterviewData = (): InterviewBase => ({
  user_id: "",
  organization_id: "",
  name: "",
  interviewer_id: BigInt(0),
  objective: "",
  question_count: 0,
  time_duration: "",
  is_anonymous: false,
  questions: [],
  description: "",
  response_count: BigInt(0),
});

function CreateInterviewModal({ open, setOpen, folders }: Props) {
  const [loading, setLoading] = useState(false);
  const [proceed, setProceed] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewBase>(
    CreateEmptyInterviewData(),
  );

  // Below for File Upload
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  // userId'i localStorage'dan veya context'ten çek (örnek: localStorage'dan)
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  useEffect(() => {
    if (loading == true) {
      setLoading(false);
      setProceed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewData]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setProceed(false);
      setInterviewData(CreateEmptyInterviewData());
      // Below for File Upload
      setIsUploaded(false);
      setFileName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {loading ? (
        <div className="w-full max-w-[38rem] h-[35.3rem] px-4">
          <LoaderWithLogo />
        </div>
      ) : !proceed ? (
        <DetailsPopup
          open={open}
          setLoading={setLoading}
          interviewData={interviewData}
          setInterviewData={setInterviewData}
          // Below for File Upload
          isUploaded={isUploaded}
          setIsUploaded={setIsUploaded}
          fileName={fileName}
          setFileName={setFileName}
          folders={folders}
          userId={userId}
        />
      ) : (
        <QuestionsPopup
          interviewData={interviewData}
          setProceed={setProceed}
          setOpen={setOpen}
        />
      )}
    </>
  );
}

export default CreateInterviewModal;
