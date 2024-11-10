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
  address: string;
}

export interface DetailedShool {
  id: number;
  name: string;
  address: string;
  communicator: {
    display_name: string;
    username: string;
    email: string;
  };
}

export interface Notification {
  id: number;
  title: string;
  text: string;
  manual_delete_enabled: boolean;
}

export interface FilterOptions {
  id: string;
  name: string;
}

export interface Statics {
  number_of_shools: number;
  number_of_teams: number;
  number_of_teams_per_school: TeamsPerSchools[];
  number_of_teams_per_status: TeamsPerStatus[];
  number_of_teams_per_category: TeamsPerCategory[];
  number_of_teams_per_prog_lang: TeamsPerProgLang[];
}

export interface TeamsPerSchools {
  school__name: string;
  team_count: number;
}
export interface TeamsPerStatus {
  status: string;
  team_count: number;
}
export interface TeamsPerCategory {
  category__name: string;
  team_count: number;
}
export interface TeamsPerProgLang {
  prog_lang__name: string;
  team_count: number;
}
