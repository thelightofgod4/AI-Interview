export interface Interviewer {
  id: bigint;
  user_id: string;
  created_at: Date;
  name: string;
  rapport: number;
  exploration: number;
  empathy: number;
  speed: number;
  image: string;
  description: string;
  audio: string;
  agent_id: string;
}
