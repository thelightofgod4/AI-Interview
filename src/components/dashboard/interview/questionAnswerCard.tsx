import { CardTitle } from "@/components/ui/card";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  answer: string;
}

function QuestionAnswerCard({
  questionNumber,
  question,
  answer,
}: QuestionCardProps) {
  return (
    <>
      <div className=" shadow-md mb-2 bg-slate-50 rounded-2xl py-2">
        <div className="flex flex-row items-center	">
          <CardTitle className="text-lg min-w-[42px] bg-indigo-200 rounded-full p-1 mx-3">
            <p className="my-auto text-center">{questionNumber}</p>
          </CardTitle>
          <div className="flex flex-col p-1">
            <p className="font-medium">{question}</p>
            <p>{answer}</p>
          </div>
        </div>
      </div>
    </>
  );
}
export default QuestionAnswerCard;
