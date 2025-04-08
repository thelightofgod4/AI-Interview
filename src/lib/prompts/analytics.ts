export const SYSTEM_PROMPT =
  "You are an expert in analyzing interview transcripts, specializing in comprehensive behavioral and technical assessment. You must only use the main questions provided and not generate or infer additional questions. Provide detailed, actionable insights while maintaining objectivity.";

export const getInterviewAnalyticsPrompt = (
  interviewTranscript: string,
  mainInterviewQuestions: string,
) => `Analyse the following interview transcript and provide structured feedback:

###
Transcript: ${interviewTranscript}

Main Interview Questions:
${mainInterviewQuestions}


Based on this transcript and the provided main interview questions, generate the following analytics in JSON format:
1. Overall Score (0-100) and Overall Feedback (120 words) - take into account the following factors:
   - Communication Skills: Evaluate the use of language, grammar, vocabulary, and ability to articulate complex ideas.
   - Response Quality: Assess the depth, relevance, and structure of answers, including use of STAR method where applicable.
   - Professional Demeanor: Evaluate professionalism, courtesy, and interview etiquette.
   - Technical Competency: Assess technical knowledge and ability to explain complex concepts clearly.
   - Critical Thinking: Evaluate problem-solving approach, analytical skills, and logical reasoning.
   - Experience Articulation: Assess ability to relate past experiences to the role requirements.
   - Cultural Fit: Evaluate alignment with organizational values and work culture.
   - Leadership Potential: Assess leadership qualities and management capabilities where relevant.
   - Adaptability: Evaluate flexibility in thinking and approach to different scenarios.
   - Innovation: Assess creative thinking and ability to propose novel solutions.
   - Stress Management: Evaluate composure and performance under pressure.
   - Growth Mindset: Assess willingness to learn and adapt to new challenges.

2. Communication Skills: Score (0-10) and Feedback (100 words). Rating system and guidelines for communication skills is as following:
    - 10: Exceptional command of English with sophisticated vocabulary, perfect grammar, and excellent articulation of complex ideas.
    - 09: Excellent command with rare inaccuracies, sophisticated language use, and strong ability to handle complex discussions.
    - 08: Very good command with occasional minor errors, clear articulation, and effective handling of technical terminology.
    - 07: Good command with some inaccuracies but maintains effective communication throughout.
    - 06: Competent command with occasional errors but generally effective communication.
    - 05: Moderate command with noticeable errors but maintains basic communication.
    - 04: Basic command with frequent errors and difficulty expressing complex ideas.
    - 03: Limited command with significant communication barriers.
    - 02: Very limited command with major difficulties in expression.
    - 01: Minimal to no effective communication.

3. Detailed Analysis for each main interview question: ${mainInterviewQuestions}
   - Use ONLY the main questions provided, output all questions with numbers even if not found in transcript.
   - For each question, provide:
      a) Question Status: "Not Asked", "Not Answered", or "Answered"
      b) Response Quality (0-10) if answered
      c) Detailed Summary (100 words) including:
         - Main points of the answer
         - Specific examples or scenarios mentioned
         - Technical knowledge demonstrated
         - Areas where the response could be improved
      d) Key Insights (bullet points)
      e) Areas for Improvement (bullet points)

4. Comprehensive Soft Skills Assessment (150 words) analyzing:
   - Leadership Qualities: Decision-making, delegation, team management
   - Emotional Intelligence: Self-awareness, empathy, relationship management
   - Problem-Solving: Analytical thinking, creativity, resolution approach
   - Adaptability: Flexibility, learning agility, change management
   - Communication Style: Clarity, persuasiveness, active listening
   - Professional Maturity: Self-regulation, accountability, work ethic

5. Technical Skills Assessment (if applicable):
   - Technical Knowledge Score (0-10)
   - Areas of Strength (bullet points)
   - Areas for Development (bullet points)
   - Technical Communication Ability (0-10)

Ensure the output is in valid JSON format with the following structure:
{
  "overallScore": number,
  "overallFeedback": string,
  "communication": { 
    "score": number, 
    "feedback": string 
  },
  "questionAnalysis": [{
    "question": string,
    "status": string,
    "responseQuality": number,
    "summary": string,
    "keyInsights": string[],
    "improvementAreas": string[]
  }],
  "softSkillsAssessment": {
    "summary": string,
    "leadershipScore": number,
    "emotionalIntelligenceScore": number,
    "problemSolvingScore": number,
    "adaptabilityScore": number
  },
  "technicalAssessment": {
    "knowledgeScore": number,
    "strengths": string[],
    "developmentAreas": string[],
    "communicationScore": number
  }
}

IMPORTANT: Only use the main questions provided. Do not generate or infer additional questions such as follow-up questions.`;
