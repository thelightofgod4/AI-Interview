"use client";

import { useInterviews } from "@/contexts/interviews.context";
import { useEffect, useState } from "react";
import Call from "@/components/call";
import Image from "next/image";
import { ArrowUpRightSquareIcon } from "lucide-react";
import { Interview } from "@/types/interview";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { CallLanguageProvider } from "@/contexts/call-language.context";

type Props = {
  params: {
    interviewId: string;
  };
};

type PopupProps = {
  title: string;
  description: string;
  image: string;
};

function PopupLoader() {
  return (
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] justify-center items-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all md:block dark:border-white">
        <div className="relative flex flex-col items-center justify-center h-full">
          <LoaderWithText />
        </div>
      </div>
      <div className="flex flex-row justify-center align-middle mt-3">
        <div className="text-center text-md font-semibold">
          Powered by <span className="font-bold">Özaltın Labs</span>
        </div>
      </div>
    </div>
  );
}

function PopUpMessage({ title, description, image }: PopupProps) {
  return (
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] content-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all  md:block dark:border-white ">
        <div className="flex flex-col items-center justify-center my-auto">
          <Image
            src={image}
            alt="Graphic"
            width={200}
            height={200}
            className="mb-4"
          />
          <h1 className="text-md font-medium mb-2">{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="flex flex-row justify-center align-middle mt-3">
        <div className="text-center text-md font-semibold">
          Powered by <span className="font-bold">Özaltın Labs</span>
        </div>
      </div>
    </div>
  );
}

function InterviewInterface({ params }: Props) {
  const [interview, setInterview] = useState<Interview>();
  const [isActive, setIsActive] = useState(true);
  const { getInterviewById } = useInterviews();
  const [interviewNotFound, setInterviewNotFound] = useState(false);
  useEffect(() => {
    if (interview) {
      setIsActive(interview?.is_active === true);
    }
  }, [interview, params.interviewId]);

  useEffect(() => {
    const fetchinterview = async () => {
      try {
        const response = await getInterviewById(params.interviewId);
        if (response) {
          setInterview(response);
          document.title = response.name;
        } else {
          setInterviewNotFound(true);
        }
      } catch (error) {
        console.error(error);
        setInterviewNotFound(true);
      }
    };

    fetchinterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CallLanguageProvider>
      <div>
        <div className="p-8 mx-auto form-container">
          {!interview ? (
            interviewNotFound ? (
              <PopUpMessage
                title="Geçersiz URL"
                description="Erişmeye çalıştığınız görüşme linki geçersiz. Lütfen URL'i kontrol edip tekrar deneyin."
                image="/invalid-url.png"
              />
            ) : (
              <PopupLoader />
            )
          ) : !isActive ? (
            <PopUpMessage
              title="Görüşme Kullanılamıyor"
              description="Şu anda yanıt kabul etmiyoruz. Daha fazla bilgi için lütfen gönderen kişiyle iletişime geçin."
              image="/closed.png"
            />
          ) : (
            <Call interview={interview} />
          )}
        </div>
      </div>
    </CallLanguageProvider>
  );
}

export default InterviewInterface;
