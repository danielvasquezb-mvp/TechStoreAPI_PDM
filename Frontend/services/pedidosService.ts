
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export interface DetallePedido {
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  pedidoId: number;
  fechaPedido: string;
  total: number;
  estado: string;
  direccionEntrega: string;
  detalles: DetallePedido[];
}

const obtenerUsuarioId = async (): Promise<number> => {
  const datos = await AsyncStorage.getItem("usuario");

  if (!datos) {
    throw new Error("No se encontró una sesión activa.");
  }

  const usuario = JSON.parse(datos);

  return usuario.usuarioId;
};

// Consultar pedidos del usuario
export const obtenerPedidos = async (): Promise<Pedido[]> => {
  const usuarioId = await obtenerUsuarioId();

  const respuesta = await api.get<Pedido[]>(
    `/Pedidos/usuario/${usuarioId}`
  );

  return respuesta.data;
};

// Consultar un pedido específico
export const obtenerPedido = async (
  pedidoId: number
): Promise<Pedido> => {
  const respuesta = await api.get<Pedido>(
    `/Pedidos/${pedidoId}`
  );

  return respuesta.data;
};

// Confirmar una compra
export const confirmarPedido = async (
  direccionEntrega: string
) => {
  const usuarioId = await obtenerUsuarioId();

  const respuesta = await api.post(
    `/Pedidos/usuario/${usuarioId}/confirmar`,
    { direccionEntrega }
  );

  return respuesta.data;
};

// Eliminar un pedido pendiente
export const eliminarPedido = async (
  pedidoId: number
) => {
  const respuesta = await api.delete(
    `/Pedidos/${pedidoId}`
  );

  return respuesta.data;
};
