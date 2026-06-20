export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          project_type: string | null;
          budget: number | null;
          source: string | null;
          status: "New Lead" | "Discovery Scheduled" | "Proposal Sent" | "Won" | "Lost";
          notes: string | null;
          ai_score: number | null;
          ai_qualification: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          preferences: string | null;
          notes: string | null;
          lead_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          name: string;
          client_id: string | null;
          status: "Discovery" | "Design" | "Approval" | "Execution" | "Completed";
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          spent: number;
          designer: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at" | "spent"> & {
          id?: string;
          spent?: number;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      ai_task_runs: {
        Row: {
          id: string;
          agent: string;
          trigger_type: "manual" | "webhook" | "scheduled";
          trigger_entity: string | null;
          trigger_entity_id: string | null;
          status: "running" | "completed" | "failed";
          input: Json | null;
          output: Json | null;
          error: string | null;
          duration_ms: number | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["ai_task_runs"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_task_runs"]["Insert"]>;
      };
      milestones: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          due_date: string | null;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["milestones"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["milestones"]["Insert"]>;
      };
    };
  };
};

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type AITaskRun = Database["public"]["Tables"]["ai_task_runs"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
