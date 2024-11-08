export interface UserData {
  id: number;
  user: number;
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
