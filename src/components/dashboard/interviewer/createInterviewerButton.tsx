"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InterviewerService } from "@/services/interviewers.service";
import axios from "axios";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";

function CreateInterviewerButton() {
  const [isLoading, setIsLoading] = useState(false);

  const createInterviewers = async () => {
    setIsLoading(true);
    const response = await axios.get("/api/create-interviewer", {});
    console.log(response);
    setIsLoading(false);
    InterviewerService.getAllInterviewers();
  };

  return (
    <>
      <Card
        className="p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300 h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md"
        onClick={() => createInterviewers()}
      >
        <CardContent className="p-0">
          {isLoading ? (
            <div className="w-full h-20 overflow-hidden flex justify-center items-center">
              <Loader2 size={40} className="animate-spin" />
            </div>
          ) : (
            <div className="w-full h-20 overflow-hidden flex justify-center items-center">
              <Plus size={40} />
            </div>
          )}
          <p className="my-3 mx-auto text-xs text-wrap w-fit text-center">
            Create four Default Interviewers
          </p>
        </CardContent>
      </Card>
    </>
  );
}

export default CreateInterviewerButton;
