export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          created_at: string;
          email: string | null;
          feedback: string | null;
          id: number;
          interview_id: string | null;
          satisfaction: number | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          feedback?: string | null;
          id?: number;
          interview_id?: string | null;
          satisfaction?: number | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          feedback?: string | null;
          id?: number;
          interview_id?: string | null;
          satisfaction?: number | null;
        };
        Relationships: [];
      };
      interview: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          insights: string[] | null;
          interviewer_id: number | null;
          is_active: boolean;
          is_anonymous: boolean;
          is_archived: boolean;
          logo_url: string | null;
          name: string | null;
          objective: string | null;
          organization_id: string | null;
          question_count: number | null;
          questions: Json | null;
          quotes: Json[] | null;
          readable_slug: string | null;
          respondents: string[] | null;
          response_count: number | null;
          theme_color: string | null;
          time_duration: string | null;
          url: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
          insights?: string[] | null;
          interviewer_id?: number | null;
          is_active?: boolean;
          is_anonymous?: boolean;
          is_archived?: boolean;
          logo_url?: string | null;
          name?: string | null;
          objective?: string | null;
          organization_id?: string | null;
          question_count?: number | null;
          questions?: Json | null;
          quotes?: Json[] | null;
          readable_slug?: string | null;
          respondents?: string[] | null;
          response_count?: number | null;
          theme_color?: string | null;
          time_duration?: string | null;
          url?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          insights?: string[] | null;
          interviewer_id?: number | null;
          is_active?: boolean;
          is_anonymous?: boolean;
          is_archived?: boolean;
          logo_url?: string | null;
          name?: string | null;
          objective?: string | null;
          organization_id?: string | null;
          question_count?: number | null;
          questions?: Json | null;
          quotes?: Json[] | null;
          readable_slug?: string | null;
          respondents?: string[] | null;
          response_count?: number | null;
          theme_color?: string | null;
          time_duration?: string | null;
          url?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "interviews_interviewer_id_fkey";
            columns: ["interviewer_id"];
            isOneToOne: false;
            referencedRelation: "interviewer";
            referencedColumns: ["id"];
          },
        ];
      };
      interviewer: {
        Row: {
          agent_id: string;
          audio: string | null;
          created_at: string;
          description: string;
          empathy: number;
          exploration: number;
          id: number;
          image: string;
          name: string;
          rapport: number;
          speed: number;
        };
        Insert: {
          agent_id?: string;
          audio?: string | null;
          created_at?: string;
          description?: string;
          empathy?: number;
          exploration?: number;
          id?: number;
          image?: string;
          name?: string;
          rapport?: number;
          speed?: number;
        };
        Update: {
          agent_id?: string;
          audio?: string | null;
          created_at?: string;
          description?: string;
          empathy?: number;
          exploration?: number;
          id?: number;
          image?: string;
          name?: string;
          rapport?: number;
          speed?: number;
        };
        Relationships: [];
      };
      organization: {
        Row: {
          allowed_responses_count: number | null;
          created_at: string;
          id: string;
          image_url: string | null;
          name: string | null;
          plan: Database["public"]["Enums"]["plan"] | null;
        };
        Insert: {
          allowed_responses_count?: number | null;
          created_at?: string;
          id: string;
          image_url?: string | null;
          name?: string | null;
          plan?: Database["public"]["Enums"]["plan"] | null;
        };
        Update: {
          allowed_responses_count?: number | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          name?: string | null;
          plan?: Database["public"]["Enums"]["plan"] | null;
        };
        Relationships: [];
      };
      response: {
        Row: {
          analytics: Json | null;
          call_id: string | null;
          candidate_status: string | null;
          created_at: string;
          details: Json | null;
          duration: number | null;
          email: string | null;
          id: number;
          interview_id: string | null;
          is_analysed: boolean | null;
          is_ended: boolean | null;
          is_viewed: boolean | null;
          name: string | null;
          tab_switch_count: number | null;
        };
        Insert: {
          analytics?: Json | null;
          call_id?: string | null;
          candidate_status?: string | null;
          created_at?: string;
          details?: Json | null;
          duration?: number | null;
          email?: string | null;
          id?: number;
          interview_id?: string | null;
          is_analysed?: boolean | null;
          is_ended?: boolean | null;
          is_viewed?: boolean | null;
          name?: string | null;
          tab_switch_count?: number | null;
        };
        Update: {
          analytics?: Json | null;
          call_id?: string | null;
          candidate_status?: string | null;
          created_at?: string;
          details?: Json | null;
          duration?: number | null;
          email?: string | null;
          id?: number;
          interview_id?: string | null;
          is_analysed?: boolean | null;
          is_ended?: boolean | null;
          is_viewed?: boolean | null;
          name?: string | null;
          tab_switch_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "response_interview_id_fkey";
            columns: ["interview_id"];
            isOneToOne: false;
            referencedRelation: "interview";
            referencedColumns: ["id"];
          },
        ];
      };
      user: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          organization_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          organization_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          organization_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string;
            };
            Returns: unknown;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: unknown;
          };
      halfvec_avg: {
        Args: {
          "": number[];
        };
        Returns: unknown;
      };
      halfvec_out: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      halfvec_send: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: {
          "": unknown[];
        };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      hnswhandler: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      ivfflat_bit_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      l2_norm:
        | {
            Args: {
              "": unknown;
            };
            Returns: number;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: number;
          };
      l2_normalize:
        | {
            Args: {
              "": string;
            };
            Returns: string;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: unknown;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: unknown;
          };
      sparsevec_out: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: {
          "": unknown[];
        };
        Returns: number;
      };
      vector_avg: {
        Args: {
          "": number[];
        };
        Returns: string;
      };
      vector_dims:
        | {
            Args: {
              "": string;
            };
            Returns: number;
          }
        | {
            Args: {
              "": unknown;
            };
            Returns: number;
          };
      vector_norm: {
        Args: {
          "": string;
        };
        Returns: number;
      };
      vector_out: {
        Args: {
          "": string;
        };
        Returns: unknown;
      };
      vector_send: {
        Args: {
          "": string;
        };
        Returns: string;
      };
      vector_typmod_in: {
        Args: {
          "": unknown[];
        };
        Returns: number;
      };
    };
    Enums: {
      plan: "free" | "pro" | "free_trial_over";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
