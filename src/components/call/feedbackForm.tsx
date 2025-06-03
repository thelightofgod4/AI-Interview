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

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        {getLocalizedText(
          'Platformdan memnun kaldınız mı?',
          'Are you satisfied with the platform?'
        )}
      </h3>
      <div className="flex justify-center space-x-4 mb-4">
        {Object.values(SatisfactionLevel).map((emoji) => (
          <button
            key={emoji}
            className={`text-3xl p-2 rounded-lg transition-all ${satisfaction === emoji ? "border-2 border-indigo-600 bg-indigo-50" : "hover:bg-gray-100"}`}
            onClick={() => setSatisfaction(emoji)}
          >
            {emoji}
          </button>
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
