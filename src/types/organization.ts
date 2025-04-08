export interface Organization {
  id: string;
  created_at: Date;
  image_url: string;
  name: string;
  plan: string;
  allowed_responses_count: number;
}
