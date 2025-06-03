"use client";

import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useCallLanguage } from '@/contexts/call-language.context';
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const CallHelpButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { getLocalizedText } = useCallLanguage();

  const helpContent = {
    title: getLocalizedText('Yardım ve İpuçları', 'Help and Tips'),
    sections: [
      {
        title: getLocalizedText('Ses Ayarları', 'Audio Settings'),
        content: getLocalizedText(
          '🎧 ZORUNLU: Kulaklık kullanımı mecburidir!\n• Hoparlör veya telefon hoparlörü kesinlikle kullanmayın\n• Mikrofonunuzun açık olduğundan emin olun\n• Ses seviyenizin uygun olduğunu kontrol edin\n• Kaliteli kulaklık kullanırsanız daha iyi ses kalitesi elde edersiniz',
          '🎧 MANDATORY: Headphone usage is required!\n• Do not use speakers or phone speakers under any circumstances\n• Make sure your microphone is turned on\n• Check that your volume level is appropriate\n• Using quality headphones will provide better audio quality'
        )
      },
      {
        title: getLocalizedText('Çevre Koşulları', 'Environment'),
        content: getLocalizedText(
          '• Sessiz bir ortamda olduğunuzdan emin olun\n• Arka plan gürültüsünü minimize edin\n• İyi aydınlatılmış bir yerde oturun',
          '• Make sure you are in a quiet environment\n• Minimize background noise\n• Sit in a well-lit area'
        )
      },
      {
        title: getLocalizedText('Görüşme İpuçları', 'Interview Tips'),
        content: getLocalizedText(
          '• Net ve anlaşılır konuşun\n• Soruları dikkatle dinleyin\n• Cevaplarınızı düşünerek verin\n• Samimi ve doğal olun',
          '• Speak clearly and understandably\n• Listen to questions carefully\n• Think before giving your answers\n• Be genuine and natural'
        )
      },
      {
        title: getLocalizedText('Teknik Konular', 'Technical Issues'),
        content: getLocalizedText(
          '• İnternet bağlantınızın stabil olduğundan emin olun\n• Tarayıcınızın mikrofon iznini verdiğini kontrol edin\n• Sorun yaşarsanız sayfayı yenileyin',
          '• Make sure your internet connection is stable\n• Check that your browser has microphone permission\n• Refresh the page if you experience problems'
        )
      }
    ]
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
        title={getLocalizedText('Yardım', 'Help')}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="text-sm font-medium">
          {getLocalizedText('Yardım', 'Help')}
        </span>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                {helpContent.title}
              </AlertDialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
          
          <div className="space-y-6 py-4">
            {helpContent.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  {section.title}
                </h3>
                <div className="pl-8 text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 text-center">
              {getLocalizedText(
                'Başka sorularınız varsa, size bu görüşme linkini gönderen kişiyle iletişime geçebilirsiniz.',
                'If you have other questions, you can contact the person who sent you this interview link.'
              )}
            </p>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 
