import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";

interface Props {
  interviewer: Interviewer;
}

const interviewerCard = ({ interviewer }: Props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="p-0 inline-block cursor-pointer hover:scale-105 ease-in-out duration-300 h-40 w-36 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-0">
          <div className="w-full h-28 overflow-hidden">
            <Image
              src={interviewer.image}
              alt="Picture of the interviewer"
              width={200}
              height={40}
              className="w-full h-full object-cover object-center"
            />
          </div>
          <CardTitle className="mt-3 text-base text-center">
            {interviewer.name}
          </CardTitle>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => {
          setOpen(false);
        }}
      >
        <InterviewerDetailsModal interviewer={interviewer} />
      </Modal>
    </>
  );
};

export default interviewerCard;
