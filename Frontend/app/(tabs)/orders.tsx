
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  Pedido,
  obtenerPedidos,
  obtenerPedido,
  eliminarPedido,
} from "../../services/pedidosService";

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<Pedido | null>(null);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const [pedidoAEliminar, setPedidoAEliminar] =
    useState<Pedido | null>(null);

  const [procesando, setProcesando] = useState(false);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<
    "exito" | "error"
  >("exito");
  const [modalMensaje, setModalMensaje] = useState(false);

  const mostrarMensaje = (
    texto: string,
    tipo: "exito" | "error"
  ) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setModalMensaje(true);
  };

  // Cargar historial de pedidos
  const cargarPedidos = useCallback(async () => {
    try {
      const datos = await obtenerPedidos();
      setPedidos(datos);
    } catch (error: any) {
      console.log("Error al cargar pedidos:", error);

      mostrarMensaje(
        error.response?.data?.mensaje ||
          error.message ||
          "No fue posible cargar los pedidos.",
        "error"
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [cargarPedidos])
  );

  // Consultar detalle de un pedido
  const verDetalle = async (pedidoId: number) => {
    try {
      setCargandoDetalle(true);

      const datos = await obtenerPedido(pedidoId);
      setPedidoSeleccionado(datos);
    } catch (error: any) {
      mostrarMensaje(
        error.response?.data?.mensaje ||
          "No fue posible consultar el pedido.",
        "error"
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  // Eliminar pedido pendiente
  const ejecutarEliminar = async () => {
    if (!pedidoAEliminar || procesando) return;

    try {
      setProcesando(true);

      await eliminarPedido(pedidoAEliminar.pedidoId);

      setPedidoAEliminar(null);
      setPedidoSeleccionado(null);

      await cargarPedidos();

      mostrarMensaje(
        "El pedido fue eliminado correctamente.",
        "exito"
      );
    } catch (error: any) {
      mostrarMensaje(
        error.response?.data?.mensaje ||
          "No fue posible eliminar el pedido.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  // Formatear precios
  const formatearPrecio = (valor: number) => {
    return valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  };

  // Formatear fechas
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Color según estado
  const obtenerColorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "#D97706";
      case "procesando":
        return "#2563EB";
      case "enviado":
        return "#7C3AED";
      case "entregado":
        return "#16A34A";
      case "cancelado":
        return "#DC2626";
      default:
        return "#64748B";
    }
  };

  // Icono según estado
  const obtenerIconoEstado = (estado: string): keyof typeof Ionicons.glyphMap => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "time-outline";
      case "procesando":
        return "sync-outline";
      case "enviado":
        return "car-outline";
      case "entregado":
        return "checkmark-circle-outline";
      case "cancelado":
        return "close-circle-outline";
      default:
        return "ellipse-outline";
    }
  };

  // Tarjeta de pedido
  const renderPedido = ({ item }: { item: Pedido }) => (
    <View style={styles.pedidoCard}>
      <View style={styles.pedidoHeader}>
        <View style={styles.pedidoIcono}>
          <Ionicons
            name="receipt-outline"
            size={23}
            color="#2563EB"
          />
        </View>

        <View style={styles.pedidoInfo}>
          <Text style={styles.pedidoNumero}>
            Pedido #{item.pedidoId}
          </Text>

          <Text style={styles.fecha}>
            {formatearFecha(item.fechaPedido)}
          </Text>
        </View>

        <View
          style={[
            styles.estadoBadge,
            {
              backgroundColor: `${obtenerColorEstado(item.estado)}15`,
            },
          ]}
        >
          <Ionicons
            name={obtenerIconoEstado(item.estado)}
            size={13}
            color={obtenerColorEstado(item.estado)}
          />

          <Text
            style={[
              styles.estadoTexto,
              { color: obtenerColorEstado(item.estado) },
            ]}
          >
            {item.estado}
          </Text>
        </View>
      </View>

      <View style={styles.separador} />

      <View style={styles.pedidoResumen}>
        <View style={styles.resumenItem}>
          <Ionicons
            name="cube-outline"
            size={17}
            color="#64748B"
          />

          <Text style={styles.resumenTexto}>
            {item.detalles.length} producto(s)
          </Text>
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>

          <Text style={styles.totalPrecio}>
            {formatearPrecio(item.total)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.detalleButton}
        onPress={() => verDetalle(item.pedidoId)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="eye-outline"
          size={18}
          color="#FFFFFF"
        />

        <Text style={styles.detalleButtonText}>
          Consultar detalles
        </Text>
      </TouchableOpacity>

      {item.estado.toLowerCase() === "pendiente" && (
        <TouchableOpacity
          style={styles.eliminarButton}
          onPress={() => setPedidoAEliminar(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="trash-outline"
            size={17}
            color="#DC2626"
          />

          <Text style={styles.eliminarButtonText}>
            Eliminar pedido
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.loadingText}>
          Cargando historial de pedidos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerIcono}>
          <Ionicons
            name="receipt-outline"
            size={25}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.headerTextos}>
          <Text style={styles.headerMarca}>TECHSTORE</Text>
          <Text style={styles.title}>Mis pedidos</Text>
          <Text style={styles.subtitle}>
            Consulta tus compras y realiza seguimiento a tus pedidos.
          </Text>
        </View>
      </View>

      {/* Resumen */}
      <View style={styles.resumenGeneral}>
        <View style={styles.resumenIcono}>
          <Ionicons
            name="bag-check-outline"
            size={22}
            color="#2563EB"
          />
        </View>

        <View style={styles.resumenGeneralTexto}>
          <Text style={styles.resumenGeneralNumero}>
            {pedidos.length}
          </Text>

          <Text style={styles.resumenGeneralLabel}>
            {pedidos.length === 1
              ? "Pedido registrado"
              : "Pedidos registrados"}
          </Text>
        </View>

        <View style={styles.resumenGeneralDerecha}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#16A34A"
          />

          <Text style={styles.resumenSeguridad}>
            Compras seguras
          </Text>
        </View>
      </View>

      <View style={styles.listaEncabezado}>
        <Text style={styles.listaTitulo}>
          Historial de compras
        </Text>

        <Text style={styles.listaCantidad}>
          {pedidos.length} registro(s)
        </Text>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.pedidoId.toString()}
        renderItem={renderPedido}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => {
              setActualizando(true);
              cargarPedidos();
            }}
            colors={["#2563EB"]}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcono}>
              <Ionicons
                name="receipt-outline"
                size={48}
                color="#94A3B8"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Aún no tienes pedidos
            </Text>

            <Text style={styles.emptyDescription}>
              Cuando realices una compra en TechStore, podrás
              consultar aquí su información y estado.
            </Text>
          </View>
        }
      />

      {/* Modal de detalle */}
      <Modal
        visible={pedidoSeleccionado !== null || cargandoDetalle}
        transparent
        animationType="slide"
        onRequestClose={() => setPedidoSeleccionado(null)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            {cargandoDetalle ? (
              <View style={styles.detalleCargando}>
                <ActivityIndicator
                  size="large"
                  color="#2563EB"
                />

                <Text style={styles.loadingText}>
                  Consultando pedido...
                </Text>
              </View>
            ) : pedidoSeleccionado ? (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalMarca}>
                      TECHSTORE
                    </Text>

                    <Text style={styles.modalTitulo}>
                      Pedido #{pedidoSeleccionado.pedidoId}
                    </Text>

                    <Text style={styles.detalleFecha}>
                      {formatearFecha(
                        pedidoSeleccionado.fechaPedido
                      )}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.modalCerrarIcono}
                    onPress={() => setPedidoSeleccionado(null)}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.separador} />

                <Text style={styles.seccionTitulo}>
                  Estado del pedido
                </Text>

                <View style={styles.estadoDetalle}>
                  <Ionicons
                    name={obtenerIconoEstado(
                      pedidoSeleccionado.estado
                    )}
                    size={20}
                    color={obtenerColorEstado(
                      pedidoSeleccionado.estado
                    )}
                  />

                  <Text
                    style={[
                      styles.detalleEstado,
                      {
                        color: obtenerColorEstado(
                          pedidoSeleccionado.estado
                        ),
                      },
                    ]}
                  >
                    {pedidoSeleccionado.estado}
                  </Text>
                </View>

                <Text style={styles.seccionTitulo}>
                  Dirección de entrega
                </Text>

                <View style={styles.direccionContainer}>
                  <Ionicons
                    name="location-outline"
                    size={19}
                    color="#2563EB"
                  />

                  <Text style={styles.detalleTexto}>
                    {pedidoSeleccionado.direccionEntrega}
                  </Text>
                </View>

                <Text style={styles.seccionTitulo}>
                  Productos del pedido
                </Text>

                <FlatList
                  data={pedidoSeleccionado.detalles}
                  keyExtractor={(item, index) =>
                    `${item.productoId}-${index}`
                  }
                  style={styles.detalleLista}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={styles.productoDetalle}>
                      <View style={styles.productoIcono}>
                        <Ionicons
                          name="cube-outline"
                          size={20}
                          color="#2563EB"
                        />
                      </View>

                      <View style={styles.productoInfo}>
                        <Text style={styles.productoNombre}>
                          {item.producto}
                        </Text>

                        <Text style={styles.productoCantidad}>
                          {item.cantidad} unidad(es) ·{" "}
                          {formatearPrecio(item.precioUnitario)}
                        </Text>
                      </View>

                      <Text style={styles.productoPrecio}>
                        {formatearPrecio(
                          item.precioUnitario * item.cantidad
                        )}
                      </Text>
                    </View>
                  )}
                />

                <View style={styles.totalDetalle}>
                  <Text style={styles.totalDetalleLabel}>
                    Total de la compra
                  </Text>

                  <Text style={styles.totalPrecio}>
                    {formatearPrecio(pedidoSeleccionado.total)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.cerrarButton}
                  onPress={() => setPedidoSeleccionado(null)}
                >
                  <Text style={styles.cerrarButtonText}>
                    Cerrar detalles
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal
        visible={pedidoAEliminar !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!procesando) setPedidoAEliminar(null);
        }}
      >
        <View style={styles.modalFondo}>
          <View style={styles.confirmacionContenido}>
            <View style={styles.confirmacionIcono}>
              <Ionicons
                name="trash-outline"
                size={29}
                color="#DC2626"
              />
            </View>

            <Text style={styles.confirmacionTitulo}>
              Eliminar pedido
            </Text>

            <Text style={styles.confirmacionTexto}>
              ¿Deseas eliminar el pedido #
              {pedidoAEliminar?.pedidoId}?
            </Text>

            <Text style={styles.confirmacionNota}>
              Esta acción devolverá las cantidades de sus productos
              al inventario y no se podrá deshacer.
            </Text>

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={() => setPedidoAEliminar(null)}
                disabled={procesando}
              >
                <Text style={styles.cancelarTexto}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmarButton}
                onPress={ejecutarEliminar}
                disabled={procesando}
              >
                {procesando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color="#FFFFFF"
                    />

                    <Text style={styles.confirmarTexto}>
                      Eliminar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de mensajes */}
      <Modal
        visible={modalMensaje}
        transparent
        animationType="fade"
        onRequestClose={() => setModalMensaje(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.mensajeContenido}>
            <View
              style={[
                styles.mensajeIcono,
                {
                  backgroundColor:
                    tipoMensaje === "exito"
                      ? "#DCFCE7"
                      : "#FEE2E2",
                },
              ]}
            >
              <Ionicons
                name={
                  tipoMensaje === "exito"
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={35}
                color={
                  tipoMensaje === "exito"
                    ? "#16A34A"
                    : "#DC2626"
                }
              />
            </View>

            <Text style={styles.mensajeTitulo}>
              {tipoMensaje === "exito"
                ? "Operación exitosa"
                : "Ha ocurrido un problema"}
            </Text>

            <Text style={styles.mensajeTexto}>
              {mensaje}
            </Text>

            <TouchableOpacity
              style={styles.cerrarButton}
              onPress={() => setModalMensaje(false)}
            >
              <Text style={styles.cerrarButtonText}>
                Entendido
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 18,
    marginBottom: 16,
    gap: 14,
  },

  headerIcono: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTextos: {
    flex: 1,
  },

  headerMarca: {
    color: "#60A5FA",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  resumenGeneral: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 23,
  },

  resumenIcono: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  resumenGeneralTexto: {
    marginLeft: 12,
    flex: 1,
  },

  resumenGeneralNumero: {
    color: "#0F172A",
    fontSize: 21,
    fontWeight: "800",
  },

  resumenGeneralLabel: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },

  resumenGeneralDerecha: {
    alignItems: "center",
    gap: 4,
  },

  resumenSeguridad: {
    fontSize: 10,
    color: "#16A34A",
    fontWeight: "600",
  },

  listaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  listaTitulo: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  listaCantidad: {
    color: "#64748B",
    fontSize: 11,
  },

  list: {
    paddingBottom: 35,
    flexGrow: 1,
  },

  pedidoCard: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  pedidoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  pedidoIcono: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  pedidoInfo: {
    flex: 1,
  },

  pedidoNumero: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
  },

  fecha: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 5,
  },

  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 20,
  },

  estadoTexto: {
    fontSize: 10,
    fontWeight: "800",
  },

  separador: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 15,
  },

  pedidoResumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  resumenItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  resumenTexto: {
    color: "#64748B",
    fontSize: 12,
  },

  totalContainer: {
    alignItems: "flex-end",
  },

  totalLabel: {
    color: "#64748B",
    fontSize: 11,
  },

  totalPrecio: {
    color: "#2563EB",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 3,
  },

  detalleButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 13,
    borderRadius: 10,
  },

  detalleButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  eliminarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: 12,
    marginTop: 4,
  },

  eliminarButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 55,
  },

  emptyIcono: {
    width: 95,
    height: 95,
    borderRadius: 28,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  emptyDescription: {
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
    fontSize: 13,
  },

  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContenido: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 440,
    maxHeight: "88%",
    padding: 22,
    borderRadius: 20,
  },

  detalleCargando: {
    padding: 35,
    alignItems: "center",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  modalMarca: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 5,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  detalleFecha: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 5,
  },

  modalCerrarIcono: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  seccionTitulo: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 13,
    marginTop: 14,
    marginBottom: 8,
  },

  estadoDetalle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  detalleEstado: {
    fontWeight: "800",
    fontSize: 14,
  },

  direccionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
  },

  detalleTexto: {
    color: "#475569",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  detalleLista: {
    maxHeight: 190,
    marginTop: 3,
  },

  productoDetalle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 9,
  },

  productoIcono: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  productoInfo: {
    flex: 1,
  },

  productoNombre: {
    fontWeight: "700",
    color: "#0F172A",
    fontSize: 12,
  },

  productoCantidad: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 4,
  },

  productoPrecio: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 11,
  },

  totalDetalle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 15,
    marginTop: 13,
  },

  totalDetalleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  cerrarButton: {
    backgroundColor: "#2563EB",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 17,
  },

  cerrarButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  confirmacionContenido: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 370,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },

  confirmacionIcono: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  confirmacionTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  confirmacionTexto: {
    color: "#334155",
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 21,
  },

  confirmacionNota: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },

  modalBotones: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 23,
    width: "100%",
  },

  cancelarButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },

  cancelarTexto: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
  },

  confirmarButton: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  confirmarTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  mensajeContenido: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 370,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },

  mensajeIcono: {
    width: 65,
    height: 65,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  mensajeTitulo: {
    color: "#0F172A",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },

  mensajeTexto: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
});
