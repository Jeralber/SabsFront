export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    permisos?: string[]; 
  };
}
