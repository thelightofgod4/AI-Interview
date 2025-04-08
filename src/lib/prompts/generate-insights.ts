export const SYSTEM_PROMPT =
  "You are an expert in uncovering deeper insights from interview question and answer sets.";

export const createUserPrompt = (
  callSummaries: string,
  interviewName: string,
  interviewObjective: string,
  interviewDescription: string,
) => {
  return `Imagine you are an interviewer who is an expert in uncovering deeper insights from call summaries.
    Use the list of call summaries and the interview details below to generate insights.
    
    ###
    Call Summaries: ${callSummaries}

    ###
    Interview Title: ${interviewName}
    Interview Objective: ${interviewObjective}
    Interview Description: ${interviewDescription}

    Give 3 insights from the call summaries that highlights user feedback. Only output the insights. Do not include user names in the insights.
    Make sure each insight is 25 words or less.
    
    Output the answer in JSON format with the key "insights" with an array on 3 insights as the value.`;
};
