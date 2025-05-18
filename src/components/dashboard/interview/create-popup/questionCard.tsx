import { Question } from "@/types/interview";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from 'react-i18next';

interface QuestionCardProps {
  questionNumber: number;
  questionData: Question;
  onQuestionChange: (id: string, question: Question) => void;
  onDelete: (id: string) => void;
  questionLabel?: string;
  depthLevelLabel?: string;
  lowLabel?: string;
  mediumLabel?: string;
  highLabel?: string;
}

const QuestionCard = ({
  questionNumber,
  questionData,
  onQuestionChange,
  onDelete,
  questionLabel = "Soru",
  depthLevelLabel = "Derinlik Seviyesi:",
  lowLabel = "Düşük",
  mediumLabel = "Orta",
  highLabel = "Yüksek",
}: QuestionCardProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Card className=" shadow-md mb-5 pb-3 ">
        <CardContent className="p-2 mx-5">
          <div className="flex flex-row justify-between items-center w-full">
            <h2 className="font-semibold text-lg">{t('questionLabel')} {questionNumber}</h2>
            <div className="flex flex-row items-center gap-2">
              <span className="font-medium">{t('depthLevel')}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-7  hover:bg-indigo-800  ${
                        questionData?.follow_up_count == 1
                          ? "bg-indigo-600"
                          : "opacity-50"
                      } `}
                      onClick={() =>
                        onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 1,
                        })
                      }
                    >
                      {t('low')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">Kısa takip sorusu</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-7  hover:bg-indigo-800 ${
                        questionData?.follow_up_count == 2
                          ? "bg-indigo-600"
                          : "opacity-50"
                      } `}
                      onClick={() =>
                        onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 2,
                        })
                      }
                    >
                      {t('medium')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">Orta seviye takip</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`text-xs h-7 hover:bg-indigo-800  ${
                        questionData?.follow_up_count == 3
                          ? "bg-indigo-600"
                          : "opacity-50"
                      } `}
                      onClick={() =>
                        onQuestionChange(questionData.id, {
                          ...questionData,
                          follow_up_count: 3,
                        })
                      }
                    >
                      {t('high')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-200">
                    <p className="text-zinc-800">Derinlemesine takip</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <textarea
              value={questionData?.question}
              className="h-fit mt-3 pt-1 border-2 rounded-md w-full px-2 border-gray-400"
              placeholder="e.g. Can you tell me about a challenging project you've worked on?"
              rows={3}
              onChange={(e) =>
                onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value,
                })
              }
              onBlur={(e) =>
                onQuestionChange(questionData.id, {
                  ...questionData,
                  question: e.target.value.trim(),
                })
              }
            />
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Trash2
                  className="cursor-pointer ml-3"
                  color="red"
                  size={24}
                  onClick={() => setOpen(true)}
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Bu soruyu silmek istediğinize emin misiniz?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem geri alınamaz. Soru kalıcı olarak silinecek.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => {
                      onDelete(questionData.id);
                      setOpen(false);
                    }}
                  >
                    Sil
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default QuestionCard;
