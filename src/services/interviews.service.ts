import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const getAllInterviews = async (userId: string, organizationId: string) => {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from("interview")
      .select(`*`)
      .or(`organization_id.eq.${organizationId},user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    return [...(clientData || [])];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const getInterviewById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`*`)
      .or(`id.eq.${id},readable_slug.eq.${id}`);

    return data ? data[0] : null;
  } catch (error) {
    console.log(error);

    return [];
  }
};

const updateInterview = async (payload: any, id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .update({ ...payload })
    .eq("id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const deleteInterview = async (id: string) => {
  const { error, data } = await supabase
    .from("interview")
    .delete()
    .eq("id", id);
  if (error) {
    console.log(error);

    return [];
  }

  return data;
};

const getAllRespondents = async (interviewId: string) => {
  try {
    const { data, error } = await supabase
      .from("interview")
      .select(`respondents`)
      .eq("interview_id", interviewId);

    return data || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterview = async (payload: any) => {
  try {
    // Validate required fields
    if (!payload.name || !payload.objective || !payload.questions || !payload.user_id || !payload.organization_id || !payload.interviewer_id) {
      throw new Error("Missing required fields for interview creation");
    }

    // Prepare interview data with all required fields
    const interviewData = {
      id: payload.id,
      name: payload.name,
      description: payload.description || "",
      objective: payload.objective,
      organization_id: payload.organization_id,
      user_id: payload.user_id,
      interviewer_id: payload.interviewer_id,
      is_active: true,
      is_anonymous: payload.is_anonymous || false,
      is_archived: false,
      logo_url: payload.logo_url || "",
      theme_color: payload.theme_color || "",
      url: payload.url,
      readable_slug: payload.readable_slug,
      questions: payload.questions,
      quotes: [],
      insights: [],
      respondents: [],
      question_count: payload.question_count,
      response_count: 0,
      time_duration: payload.time_duration,
      created_at: new Date().toISOString()
    };

    // Insert the interview and return the created record
    const { error, data } = await supabase
      .from("interview")
      .insert(interviewData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating interview:", error);
      throw error;
    }

    console.log("Successfully created interview:", data);
    return data;
  } catch (error) {
    console.error("Error in createInterview:", error);
    throw error;
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
};
