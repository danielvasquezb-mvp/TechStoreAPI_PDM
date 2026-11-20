
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export interface ProductoCarrito {
  detalleCarritoId: number;
  productoId: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Carrito {
  carritoId: number;
  usuarioId: number;
  fechaCreacion: string;
  productos: ProductoCarrito[];
  total: number;
}

// Obtener el usuario que inició sesión
const obtenerUsuarioId = async (): Promise<number> => {
  const datos = await AsyncStorage.getItem("usuario");

  if (!datos) {
    throw new Error("No se encontró una sesión activa.");
  }

  const usuario = JSON.parse(datos);
  return usuario.usuarioId;
};

// Consultar el carrito del usuario
export const obtenerCarrito = async () => {
  const usuarioId = await obtenerUsuarioId();

  const respuesta = await api.get<Carrito>(
    `/Carritos/usuario/${usuarioId}`
  );

  return respuesta.data;
};

// Agregar un producto al carrito
export const agregarProducto = async (
  productoId: number,
  cantidad: number
) => {
  const usuarioId = await obtenerUsuarioId();

  const respuesta = await api.post(
    `/Carritos/usuario/${usuarioId}/agregar`,
    {
      productoId,
      cantidad,
    }
  );

  return respuesta.data;
};

// Actualizar la cantidad de un producto
export const actualizarCantidad = async (
  carritoId: number,
  productoId: number,
  cantidad: number
) => {
  await api.put(
    `/Carritos/${carritoId}/producto/${productoId}`,
    { cantidad }
  );
};

// Eliminar un producto del carrito
export const eliminarProducto = async (
  carritoId: number,
  productoId: number
) => {
  await api.delete(
    `/Carritos/${carritoId}/producto/${productoId}`
  );
};

// Vaciar el carrito
export const vaciarCarrito = async (carritoId: number) => {
  const respuesta = await api.delete(
    `/Carritos/${carritoId}/vaciar`
  );

  return respuesta.data;
};
