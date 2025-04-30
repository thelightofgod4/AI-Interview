import React from 'react';
import Call from '@/components/call';
import { Interview } from '@/types/interview';

interface Props {
  params: {
    interviewId: string;
  };
}

interface PopUpMessageProps {
  title: string;
  description: string;
  image: string;
}

function PopUpMessage({ title, description, image }: PopUpMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <img src={image} alt={title} className="w-32 h-32 mb-4" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}

function PopupLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
}

function InterviewInterface({ params }: Props) {
  const [interview, setInterview] = React.useState<Interview | null>(null);
  const [interviewNotFound, setInterviewNotFound] = React.useState(false);
  const [isActive, setIsActive] = React.useState(true);

  React.useEffect(() => {
    const fetchInterview = async () => {
      try {
        // Add your interview fetching logic here
      } catch (error) {
        console.error('Error fetching interview:', error);
        setInterviewNotFound(true);
      }
    };

    fetchInterview();
  }, [params.interviewId]);

  return (
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
      <div className="text-center text-sm text-gray-600 mt-2">
        Powered by{" "}
        <a
          href="https://ozaltinlabs.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:text-indigo-600 transition-colors"
        >
          Özaltın Labs
        </a>
      </div>
    </div>
  );
}

export default InterviewInterface; 
