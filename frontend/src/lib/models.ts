export interface UserData {
  user_id: number;
  user_data_id: number;
  username: string;
  display_name: string;
  role: string;
  grade?: number;
  team_id?: number;
}

export interface Team {
  id: number;
  owner: number;
  name: string;
  members: TeamMember[];
  supplementary_members?: TeamMember[];
  school: School;
  teacher_name: string;
  category: Category;
  prog_lang: ProgrammingLanguage;
  status: "registered" | "approved_by_organizer" | "approved_by_school";
}

export interface TeamMember {
  name: string;
  grade: number;
}

export interface ProgrammingLanguage {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface School {
  id: number;
  name: string;
  adress: string;
}

export interface DetailedShool {
  id: number;
  name: string;
  address: string;
  communicator: {
    name: string;
    username: string;
    email: string;
  };
}

export interface Notification {
  title: string;
  text: string;
  manual_delete_enabled: boolean;
}
