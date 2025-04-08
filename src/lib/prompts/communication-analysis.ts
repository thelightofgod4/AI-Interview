export const SYSTEM_PROMPT = `You are an expert in analyzing communication skills from interview transcripts. Your task is to:
1. Analyze the communication skills demonstrated in the transcript
2. Identify specific quotes that support your analysis
3. Provide a detailed breakdown of strengths and areas for improvement`;

export const getCommunicationAnalysisPrompt = (
  transcript: string,
) => `Analyze the communication skills demonstrated in the following interview transcript:

Transcript: ${transcript}

Please provide your analysis in the following JSON format:
{
  "communicationScore": number, // Score from 0-10 based on the standard communication scoring system
  "overallFeedback": string,   // 2-3 sentence summary of communication skills
  "supportingQuotes": [        // Array of relevant quotes with analysis
    {
      "quote": string,         // The exact quote from the transcript
      "analysis": string,      // Brief analysis of what this quote demonstrates about communication skills
      "type": string          // Either "strength" or "improvement_area"
    }
  ],
  "strengths": [string],       // List of communication strengths demonstrated
  "improvementAreas": [string] // List of areas where communication could be improved
}`;
