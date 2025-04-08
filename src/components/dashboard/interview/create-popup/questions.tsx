import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useClerk, useOrganization } from "@clerk/nextjs";
import { InterviewBase, Question } from "@/types/interview";
import { useInterviews } from "@/contexts/interviews.context";
import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionCard from "@/components/dashboard/interview/create-popup/questionCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

interface Props {
  interviewData: InterviewBase;
  setProceed: (proceed: boolean) => void;
  setOpen: (open: boolean) => void;
}

function QuestionsPopup({ interviewData, setProceed, setOpen }: Props) {
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [isClicked, setIsClicked] = useState(false);

  const [questions, setQuestions] = useState<Question[]>(
    interviewData.questions,
  );
  const [description, setDescription] = useState<string>(
    interviewData.description.trim(),
  );
  const { fetchInterviews } = useInterviews();

  const endOfListRef = useRef<HTMLDivElement>(null);
  const prevQuestionLengthRef = useRef(questions.length);

  const handleInputChange = (id: string, newQuestion: Question) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, ...newQuestion } : question,
      ),
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (questions.length === 1) {
      setQuestions(
        questions.map((question) => ({
          ...question,
          question: "",
          follow_up_count: 1,
        })),
      );

      return;
    }
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleAddQuestion = () => {
    if (questions.length < interviewData.question_count) {
      setQuestions([
        ...questions,
        { id: uuidv4(), question: "", follow_up_count: 1 },
      ]);
    }
  };

  const onSave = async () => {
    try {
      if (!user?.id || !organization?.id) {
        toast.error("User or organization ID is missing");
        return;
      }

      // Generate a unique ID for the interview
      const id = crypto.randomUUID();

      // Prepare the complete interview data
      const completeInterviewData = {
        id,
        user_id: user.id,
        organization_id: organization.id,
        name: interviewData.name,
        objective: interviewData.objective,
        description: description,
        questions: questions,
        interviewer_id: Number(interviewData.interviewer_id.toString()),
        question_count: questions.length,
        time_duration: interviewData.time_duration,
        is_anonymous: interviewData.is_anonymous,
        response_count: 0,
        is_active: true,
        is_archived: false,
        logo_url: organization?.imageUrl || "",
        theme_color: "",
        quotes: [],
        insights: [],
        respondents: [],
        created_at: new Date().toISOString()
      };

      // Log the data being sent
      console.log("Sending interview data:", {
        interviewData: completeInterviewData,
        organizationName: organization.name
      });

      const response = await fetch("/api/create-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewData: completeInterviewData,
          organizationName: organization.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create interview");
      }

      const data = await response.json();
      console.log("Interview created successfully:", data);

      // Refresh interviews list
      await fetchInterviews();

      toast.success("Interview created successfully");
      setProceed(true);
      setOpen(false);
    } catch (error: any) {
      console.error("Error creating interview:", error);
      toast.error(error?.message || "Failed to create interview");
    }
  };

  useEffect(() => {
    if (questions.length > prevQuestionLengthRef.current) {
      endOfListRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevQuestionLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <div>
      <div
        className={`text-center px-1 flex flex-col justify-top items-center w-[38rem] ${
          interviewData.question_count > 1 ? "h-[29rem]" : ""
        } `}
      >
        <div className="relative flex justify-center w-full">
          <ChevronLeft
            className="absolute left-0 opacity-50 cursor-pointer hover:opacity-100 text-gray-600 mr-36"
            size={30}
            onClick={() => {
              setProceed(false);
            }}
          />
          <h1 className="text-2xl font-semibold">Create Interview</h1>
        </div>
        <div className="my-3 text-left w-[96%] text-sm">
          We will be using these questions during the interviews. Please make
          sure they are ok.
        </div>
        <ScrollArea className="flex flex-col justify-center items-center w-full mt-3">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              questionNumber={index + 1}
              questionData={question}
              onDelete={handleDeleteQuestion}
              onQuestionChange={handleInputChange}
            />
          ))}
          <div ref={endOfListRef} />
        </ScrollArea>
        {questions.length < interviewData.question_count ? (
          <div
            className="border-indigo-600 opacity-75 hover:opacity-100 w-fit  rounded-full"
            onClick={handleAddQuestion}
          >
            <Plus
              size={45}
              strokeWidth={2.2}
              className="text-indigo-600  cursor-pointer"
            />
          </div>
        ) : (
          <></>
        )}
      </div>
      <p className="mt-3 mb-1 ml-2 font-medium">
        Interview Description{" "}
        <span
          style={{ fontSize: "0.7rem", lineHeight: "0.66rem" }}
          className="font-light text-xs italic w-full text-left block"
        >
          Note: Interviewees will see this description.
        </span>
      </p>
      <textarea
        value={description}
        className="h-fit mt-3 mx-2 py-2 border-2 rounded-md px-2 w-full border-gray-400"
        placeholder="Enter your interview description."
        rows={3}
        onChange={(e) => {
          setDescription(e.target.value);
        }}
        onBlur={(e) => {
          setDescription(e.target.value.trim());
        }}
      />
      <div className="flex justify-end mt-4">
        <Button
          type="button"
          disabled={
            isClicked ||
            questions.length < interviewData.question_count ||
            description.trim() === "" ||
            questions.some((question) => question.question.trim() === "")
          }
          className="bg-indigo-600 hover:bg-indigo-800 mr-5"
          onClick={(e) => {
            e.preventDefault();
            setIsClicked(true);
            onSave().catch((error) => {
              console.error("Error in save process:", error);
              setIsClicked(false);
            });
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
export default QuestionsPopup;
