import { supabase } from "@/lib/supabase";
import { Response } from "@/types/response";
import { generateInterviewAnalytics } from "./analytics.service";

export class ResponseService {
  static async createResponse(payload: any) {
    const { data, error } = await supabase
      .from("response")
      .insert([payload])
      .select();

    if (error) throw error;

    return data[0];
  }

  static async saveResponse(payload: any, call_id: string) {
    const { data, error } = await supabase
      .from("response")
      .update(payload)
      .eq("call_id", call_id)
      .select();

    if (error) throw error;

    return data;
  }

  static async updateResponse(call_id: string, payload: any) {
    const { data, error } = await supabase
      .from("response")
      .update(payload)
      .eq("call_id", call_id)
      .select();

    if (error) throw error;

    return data;
  }

  static async getAllResponses(interviewId: string) {
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .eq("interview_id", interviewId)
      .or(`details.is.null, details->call_analysis.not.is.null`)
      .eq("is_ended", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  }

  static async getResponseByCallId(id: string) {
    const { data, error } = await supabase
      .from("response")
      .select(`*`)
      .eq("call_id", id)
      .single();

    if (error) throw error;

    return data;
  }

  static async deleteResponse(id: string) {
    const { error } = await supabase
      .from("response")
      .delete()
      .eq("call_id", id);

    if (error) throw error;
  }

  static async getAllEmails(interviewId: string) {
    const { data, error } = await supabase
      .from("response")
      .select("email")
      .eq("interview_id", interviewId);

    if (error) throw error;

    return data || [];
  }

  static async triggerAnalysis(callId: string) {
    try {
      // Get the response details
      const response = await this.getResponseByCallId(callId);
      
      // Generate analytics
      const result = await generateInterviewAnalytics({
        callId: response.call_id,
        interviewId: response.interview_id,
        transcript: response.details?.transcript
      });

      // Update the response with analytics
      await this.updateResponse(callId, {
        analytics: result.analytics,
        is_analysed: true,
        analysis_status: "completed"
      });

      return result;
    } catch (error) {
      // If analysis fails, mark it as failed
      await this.updateResponse(callId, {
        analysis_status: "failed"
      });
      throw error;
    }
  }
}
