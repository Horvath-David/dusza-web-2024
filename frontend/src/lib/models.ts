export interface UserData {
  user_id: number;
  user_data_id: number;
  username: string;
  display_name: string;
  role: string;
  grade?: number;
  team_id?: number;
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
    name:string,
    username:string,
    email: string
  };
}

export interface TeamInfo{
  id:number;
  owner:number;
  name:string;
  members: [
    {
      name:string;
      grade:number;
    },
    {
      name:string;
      grade:number;
    },
    {
      name:string;
      grade:number;
    }
  ];
  supplementary_members: [
    {
      name:string;
      grade:number;
    }
  ];
  school: number;
  teacher_name:string;
  category: number;
  prog_lang: number;
  status:string;
}
