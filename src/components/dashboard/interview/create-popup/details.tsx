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
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold mb-4 text-center">Görüşme Oluştur</h1>
        <div className="space-y-4">
          {/* Görüşme Adı */}
          <div className="space-y-1.5">
            <label htmlFor="interview-name" className="text-sm font-medium block">
              Görüşme Adı:
            </label>
            <input
              id="interview-name"
              type="text"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="örn. Görüşmenin Adı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => setName(e.target.value.trim())}
            />
          </div>

          {/* Görüşmeci Seçimi */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Görüşmeci Seçin:
            </label>
            <div className="relative flex flex-col items-center">
              <div
                id="slider-3"
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-center"
              >
                {interviewers.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 relative"
                  >
                    <button
                      className="absolute -top-1 right-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInterviewerDetails(item);
                        setOpenInterviewerDetails(true);
                      }}
                    >
                      <Info size={16} color="#4f46e5" strokeWidth={2.2} />
                    </button>
                    <div
                      className={`w-20 h-20 rounded-full overflow-hidden cursor-pointer transition-all ${
                        selectedInterviewer === item.id
                          ? "ring-4 ring-indigo-600"
                          : "hover:ring-2 hover:ring-indigo-400"
                      }`}
                      onClick={() => setSelectedInterviewer(item.id)}
                    >
                      <Image
                        src={item.image}
                        alt={`${item.name} avatar`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-sm text-center">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Amaç */}
          <div className="space-y-1.5">
            <label htmlFor="objective" className="text-sm font-medium block">
              Amaç:
            </label>
            <Textarea
              id="objective"
              className="w-full min-h-[80px] px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="örn. Adayların teknik becerilerini ve önceki projelerini değerlendirin."
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onBlur={(e) => setObjective(e.target.value.trim())}
            />
          </div>

          {/* Dosya Yükleme */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              Görüşmeyle ilgili belgeleri yükleyin:
            </label>
            <FileUpload
              isUploaded={isUploaded}
              setIsUploaded={setIsUploaded}
              fileName={fileName}
              setFileName={setFileName}
              setUploadedDocumentContext={setUploadedDocumentContext}
            />
          </div>

          {/* Anonim Seçeneği */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <label htmlFor="anonymous" className="text-sm font-medium">
                Yanıtlar anonim olsun mu?
              </label>
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
            </div>
            <p className="text-xs text-gray-500">
              Not: Eğer anonim ise, görüşmecinin e-posta ve adı toplanmayacak.
            </p>
          </div>

          {/* Soru Sayısı ve Süre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="question-count" className="text-sm font-medium block">
                Soru Sayısı:
              </label>
              <input
                id="question-count"
                type="number"
                min="1"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="örn. 5"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="duration" className="text-sm font-medium block">
                Süre (dk):
              </label>
              <input
                id="duration"
                type="number"
                min="1"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="örn. 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-3">
            <Button
              className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700"
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
              className="w-full sm:w-auto bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
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
