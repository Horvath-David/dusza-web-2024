export interface UserData {
  user_id: number;
  user_data_id: number;
  username: string;
  display_name: string;
  role: string;
  grade?: number;
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
