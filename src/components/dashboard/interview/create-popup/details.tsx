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
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();

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
      language: selectedInterviewerData?.name === "Vizyoner Duru" || selectedInterviewerData?.name === "Empatik Ahmet" ? "tr" : "en"
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
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-lg font-semibold mb-4 text-center">{t('createInterviewTitle')}</h1>
        <div className="space-y-4">
          {/* Görüşme Adı */}
          <div className="space-y-1.5">
            <label htmlFor="interview-name" className="text-sm font-medium block">
              {t('interviewName')}:
            </label>
            <input
              id="interview-name"
              type="text"
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={t('placeholderInterviewName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => setName(e.target.value.trim())}
            />
          </div>

          {/* Görüşmeci Seçimi */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium block">
              {t('selectInterviewer')}:
            </label>
            <div className="w-full flex justify-center min-h-[90px]">
            <div
              id="slider-3"
                className="flex flex-nowrap gap-1 sm:gap-2 justify-center px-2 w-full"
            >
                {interviewers.map((item) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 relative group"
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
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden cursor-pointer transition-all ${
                      selectedInterviewer === item.id
                          ? "ring-4 ring-indigo-600"
                          : "hover:ring-2 hover:ring-indigo-400"
                    }`}
                    onClick={() => setSelectedInterviewer(item.id)}
                  >
                    <Image
                      src={item.image}
                        alt={`${item.name} avatar`}
                        width={64}
                        height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[90%] z-20 hidden group-hover:block min-w-[120px] max-w-[180px] bg-gray-800 text-gray-100 text-[10px] rounded px-2 py-1 shadow-lg whitespace-normal text-center pointer-events-none">
                    {item.name.includes('Mia') && (i18n.language === 'tr' ? 'Teknik becerileri ölçen, hızlı ve hedef odaklı (İngilizce)' : 'Assesses technical skills, fast and goal-oriented (English)')}
                    {item.name.includes('Alex') && (i18n.language === 'tr' ? 'Kişilik ve kültürel uyumu değerlendiren, rahatlatıcı (İngilizce)' : 'Evaluates personality and culture fit, relaxing (English)')}
                    {item.name.includes('Duru') && (i18n.language === 'tr' ? 'Liderlik ve stratejik düşünmeyi ölçen, vizyoner (Türkçe)' : 'Assesses leadership and strategic thinking, visionary (Turkish)')}
                    {item.name.includes('Ahmet') && (i18n.language === 'tr' ? 'Duygusal zeka ve iletişimi değerlendiren, destekleyici (Türkçe)' : 'Assesses emotional intelligence and communication, supportive (Turkish)')}
                  </div>
                    <p className="mt-2 text-xs sm:text-sm text-center">{item.name}</p>
                </div>
              ))}
              </div>
            </div>
          </div>

          {/* Amaç */}
          <div className="space-y-1.5">
            <label htmlFor="objective" className="text-sm font-medium block">
              {t('objective')}:
            </label>
            <Textarea
              id="objective"
              className="w-full min-h-[80px] px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder={t('placeholderObjective')}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onBlur={(e) => setObjective(e.target.value.trim())}
            />
          </div>

          {/* Soru Sayısı ve Süre */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="question-count" className="text-sm font-medium block">
                {t('questionCount')}:
              </label>
              <input
                id="question-count"
                type="number"
                min="1"
                max="5"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="max 5"
                value={numQuestions}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || (Number(value) >= 1 && Number(value) <= 5)) {
                    setNumQuestions(value);
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="duration" className="text-sm font-medium block">
                {t('duration')}:
              </label>
            <input
                id="duration"
              type="number"
                min="1"
                max="10"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="max 10"
              value={duration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || (Number(value) >= 1 && Number(value) <= 10)) {
                    setDuration(value);
                  }
                }}
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
              {t('generateQuestions')}
            </Button>
            <Button
              className="w-full sm:w-auto bg-gray-200 text-gray-700 hover:bg-gray-300"
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
              {t('manualEntry')}
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
