import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { response_id: string } }
) {
  try {
    const { response_id } = params;
    
    if (!response_id) {
      return NextResponse.json(
        { error: "Response ID is required" },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data, error } = await supabase
      .from("feedback")
      .select("satisfaction, feedback, email")
      .eq("response_id", response_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - feedback not found
        return NextResponse.json(null, { status: 200 });
      }
      console.error("Error fetching feedback:", error);
      return NextResponse.json(
        { error: "Failed to fetch feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in feedback API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 
