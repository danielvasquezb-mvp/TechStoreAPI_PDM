
import { api } from "./api";

export interface Usuario {
  usuarioId: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  fechaRegistro: string;
  activo: boolean;
}

interface LoginResponse {
  mensaje: string;
  usuario: Usuario;
}

export const iniciarSesion = async (
  correo: string,
  password: string
): Promise<LoginResponse> => {
  const respuesta = await api.post<LoginResponse>(
    "/Usuarios/Login",
    {
      correo,
      password,
    }
  );

  return respuesta.data;
};
