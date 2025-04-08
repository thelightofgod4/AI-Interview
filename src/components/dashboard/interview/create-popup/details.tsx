import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useInterviewers } from "@/contexts/interviewers.context";
import { InterviewBase, Question } from "@/types/interview";
import { ChevronRight, ChevronLeft, Info } from "lucide-react";
import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import FileUpload from "../fileUpload";
import Modal from "@/components/dashboard/Modal";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { Interviewer } from "@/types/interviewer";

interface Props {
  open: boolean;
  setLoading: (loading: boolean) => void;
  interviewData: InterviewBase;
  setInterviewData: (interviewData: InterviewBase) => void;
  isUploaded: boolean;
  setIsUploaded: (isUploaded: boolean) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

function DetailsPopup({
  open,
  setLoading,
  interviewData,
  setInterviewData,
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
}: Props) {
  const { interviewers } = useInterviewers();
  const [isClicked, setIsClicked] = useState(false);
  const [openInterviewerDetails, setOpenInterviewerDetails] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<Interviewer>();

  const [name, setName] = useState(interviewData.name);
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interviewData.interviewer_id,
  );
  const [objective, setObjective] = useState(interviewData.objective);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interviewData.is_anonymous,
  );
  const [numQuestions, setNumQuestions] = useState(
    interviewData.question_count == 0
      ? ""
      : String(interviewData.question_count),
  );
  const [duration, setDuration] = useState(interviewData.time_duration);
  const [uploadedDocumentContext, setUploadedDocumentContext] = useState("");

  const slideLeft = (id: string, value: number) => {
    var slider = document.getElementById(`${id}`);
    if (slider) {
      slider.scrollLeft = slider.scrollLeft - value;
    }
  };

  const slideRight = (id: string, value: number) => {
    var slider = document.getElementById(`${id}`);
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + value;
    }
  };

  const onGenrateQuestions = async () => {
    setLoading(true);

    // Find the selected interviewer
    const selectedInterviewerData = interviewers.find(i => i.id === selectedInterviewer);
    
    const data = {
      name: name.trim(),
      objective: objective.trim(),
      number: numQuestions,
      context: uploadedDocumentContext,
      language: selectedInterviewerData?.name === "Keşifçi Ayşe" || selectedInterviewerData?.name === "Empatik Ahmet" ? "tr" : "en"
    };

    const generatedQuestions = (await axios.post(
      "/api/generate-interview-questions",
      data,
    )) as any;

    const generatedQuestionsResponse = JSON.parse(
      generatedQuestions?.data?.response,
    );

    const updatedQuestions = generatedQuestionsResponse.questions.map(
      (question: Question) => ({
        id: uuidv4(),
        question: question.question.trim(),
        follow_up_count: 1,
      }),
    );

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: updatedQuestions,
      interviewer_id: selectedInterviewer,
      question_count: Number(numQuestions),
      time_duration: duration,
      description: generatedQuestionsResponse.description,
      is_anonymous: isAnonymous,
    };
    setInterviewData(updatedInterviewData);
  };

  const onManual = () => {
    setLoading(true);

    const updatedInterviewData = {
      ...interviewData,
      name: name.trim(),
      objective: objective.trim(),
      questions: [{ id: uuidv4(), question: "", follow_up_count: 1 }],
      interviewer_id: selectedInterviewer,
      question_count: Number(numQuestions),
      time_duration: String(duration),
      description: "",
      is_anonymous: isAnonymous,
    };
    setInterviewData(updatedInterviewData);
  };

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedInterviewer(BigInt(0));
      setObjective("");
      setIsAnonymous(false);
      setNumQuestions("");
      setDuration("");
      setIsClicked(false);
    }
  }, [open]);

  return (
    <>
      <div className="text-center w-[38rem]">
        <h1 className="text-xl font-semibold">Görüşme Oluştur</h1>
        <div className="flex flex-col justify-center items-start mt-4 ml-10 mr-8">
          <div className="flex flex-row justify-center items-center">
            <h3 className="text-sm font-medium">Görüşme Adı:</h3>
            <input
              type="text"
              className="border-b-2 focus:outline-none border-gray-500 px-2 w-96 py-0.5 ml-3"
              placeholder="örn. Görüşmenin Adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => setName(e.target.value.trim())}
            />
          </div>
          <h3 className="text-sm mt-3 font-medium">Görüşmeci Seçin:</h3>
          <div className="relative flex items-center mt-1">
            <div
              id="slider-3"
              className=" h-36 pt-1 overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide w-[27.5rem]"
            >
              {interviewers.map((item, key) => (
                <div
                  className=" p-0 inline-block cursor-pointer ml-1 mr-5 rounded-xl shrink-0 overflow-hidden"
                  key={item.id}
                >
                  <button
                    className="absolute ml-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInterviewerDetails(item);
                      setOpenInterviewerDetails(true);
                    }}
                  >
                    <Info size={18} color="#4f46e5" strokeWidth={2.2} />
                  </button>
                  <div
                    className={`w-[96px] overflow-hidden rounded-full ${
                      selectedInterviewer === item.id
                        ? "border-4 border-indigo-600"
                        : ""
                    }`}
                    onClick={() => setSelectedInterviewer(item.id)}
                  >
                    <Image
                      src={item.image}
                      alt="Görüşmecinin fotoğrafı"
                      width={70}
                      height={70}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="mt-0 text-xs text-center">
                    {item.name}
                  </CardTitle>
                </div>
              ))}
            </div>
            {interviewers.length > 4 && (
              <div className="flex flex-row justify-center items-center space-x-3">
                <ChevronLeft
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  size={20}
                  onClick={() => slideLeft("slider-3", 190)}
                />
                <ChevronRight
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  size={20}
                  onClick={() => slideRight("slider-3", 190)}
                />
              </div>
            )}
          </div>
          <div className="flex flex-row justify-center items-center mt-3">
            <h3 className="text-sm font-medium">Amaç:</h3>
            <Textarea
              className="border-2 focus:outline-none border-gray-500 px-2 w-96 py-0.5 ml-3 h-24"
              placeholder="örn. Adayların teknik becerilerini ve önceki projelerini değerlendirin."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onBlur={(e) => setObjective(e.target.value.trim())}
            />
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-medium mb-1">Görüşmeyle ilgili belgeleri yükleyin:</h3>
            <FileUpload
              isUploaded={isUploaded}
              setIsUploaded={setIsUploaded}
              fileName={fileName}
              setFileName={setFileName}
              setUploadedDocumentContext={setUploadedDocumentContext}
            />
          </div>
          <div className="flex flex-row justify-center items-center mt-3">
            <h3 className="text-sm font-medium">Yanıtlar anonim olsun mu?</h3>
            <div className="ml-3">
              <Switch
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
            <p className="text-xs text-gray-500 ml-2">
              Not: Eğer anonim ise, görüşmecinin e-posta ve adı toplanmayacak.
            </p>
          </div>
          <div className="flex flex-row justify-center items-center mt-3">
            <h3 className="text-sm font-medium">Soru Sayısı:</h3>
            <input
              type="number"
              className="border-b-2 focus:outline-none border-gray-500 px-2 w-20 py-0.5 ml-3"
              placeholder="örn. 5"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            />
            <h3 className="text-sm font-medium ml-8">Süre (dk):</h3>
            <input
              type="number"
              className="border-b-2 focus:outline-none border-gray-500 px-2 w-20 py-0.5 ml-3"
              placeholder="örn. 30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-center items-center mt-8 mb-4 space-x-4">
            <Button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              disabled={
                !name ||
                selectedInterviewer === BigInt(0) ||
                !objective ||
                !numQuestions ||
                !duration ||
                isClicked
              }
              onClick={() => {
                if (!isClicked) {
                  setIsClicked(true);
                  onGenrateQuestions();
                }
              }}
            >
              Soruları Oluştur
            </Button>
            <Button
              className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-200"
              disabled={
                !name ||
                selectedInterviewer === BigInt(0) ||
                !objective ||
                !numQuestions ||
                !duration ||
                isClicked
              }
              onClick={() => {
                if (!isClicked) {
                  setIsClicked(true);
                  onManual();
                }
              }}
            >
              Kendim Gireceğim
            </Button>
          </div>
        </div>
      </div>
      {openInterviewerDetails && interviewerDetails && (
        <Modal
          open={openInterviewerDetails}
          onClose={() => setOpenInterviewerDetails(false)}
        >
          <InterviewerDetailsModal interviewer={interviewerDetails} />
        </Modal>
      )}
    </>
  );
}

export default DetailsPopup;
