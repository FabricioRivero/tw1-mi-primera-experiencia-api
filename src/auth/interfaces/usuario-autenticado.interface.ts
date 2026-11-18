export interface UsuarioAutenticado {
  sub: number;
  email: string;
  rol: 'ADMIN' | 'CANDIDATO' | 'ORGANIZACION';
  iat?: number;
  exp?: number;
}
