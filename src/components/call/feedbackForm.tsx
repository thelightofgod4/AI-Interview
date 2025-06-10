import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackData } from "@/types/response";
import { useCallLanguage } from "@/contexts/call-language.context";

enum SatisfactionLevel {
  Positive = "😀",
  Moderate = "😐",
  Negative = "😔",
}

interface FeedbackFormProps {
  onSubmit: (data: Omit<FeedbackData, "response_id">) => void;
  email: string;
}

export function FeedbackForm({ onSubmit, email }: FeedbackFormProps) {
  const [satisfaction, setSatisfaction] = useState<SatisfactionLevel>(
    SatisfactionLevel.Moderate,
  );
  const [feedback, setFeedback] = useState("");
  const { getLocalizedText } = useCallLanguage();

  const handleSubmit = () => {
    if (satisfaction !== null || feedback.trim() !== "") {
      onSubmit({
        satisfaction: Object.values(SatisfactionLevel).indexOf(satisfaction),
        feedback,
        email,
      });
    }
  };

  const getEmojiTooltip = (emoji: SatisfactionLevel) => {
    switch (emoji) {
      case SatisfactionLevel.Positive:
        return getLocalizedText(
          'Harikaydı',
          'It was great'
        );
      case SatisfactionLevel.Moderate:
        return getLocalizedText(
          'İyiydi ama geliştirilebilir',
          'It was okay but could be better'
        );
      case SatisfactionLevel.Negative:
        return getLocalizedText(
          'Beklentimin altındaydı',
          'Below expectations'
        );
      default:
        return '';
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        {getLocalizedText(
          'Görüşme deneyeminiz nasıldır?',
          'How was your interview experience?'
        )}
      </h3>
      <div className="flex justify-center space-x-4 mb-4">
        {Object.values(SatisfactionLevel).map((emoji) => (
          <div key={emoji} className="relative group">
            <button
              className={`text-3xl p-2 rounded-lg transition-all ${satisfaction === emoji ? "border-2 border-indigo-600 bg-indigo-50" : "hover:bg-gray-100"}`}
              onClick={() => setSatisfaction(emoji)}
            >
              {emoji}
            </button>
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block min-w-[160px] max-w-[200px] bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-normal text-center pointer-events-none z-10">
              {getEmojiTooltip(emoji)}
            </div>
          </div>
        ))}
      </div>
      <Textarea
        value={feedback}
        placeholder={getLocalizedText(
          'Geri bildiriminizi buraya yazın',
          'Write your feedback here'
        )}
        className="mb-4"
        onChange={(e) => setFeedback(e.target.value)}
      />
      <Button
        disabled={satisfaction === null && feedback.trim() === ""}
        className="w-full bg-indigo-600 text-white"
        onClick={handleSubmit}
      >
        {getLocalizedText('Geri Bildirimi Gönder', 'Send Feedback')}
      </Button>
    </div>
  );
}
