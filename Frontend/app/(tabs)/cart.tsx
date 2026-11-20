
import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  Carrito,
  ProductoCarrito,
  obtenerCarrito,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito,
} from "../../services/carritoService";

import { confirmarPedido } from "../../services/pedidosService";

export default function CartScreen() {
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const [productoAEliminar, setProductoAEliminar] =
    useState<ProductoCarrito | null>(null);

  const [tipoConfirmacion, setTipoConfirmacion] =
    useState<"eliminar" | "vaciar" | null>(null);

  const [procesando, setProcesando] = useState(false);

  const [modalCompra, setModalCompra] = useState(false);
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [procesandoCompra, setProcesandoCompra] = useState(false);
  const [errorCompra, setErrorCompra] = useState("");

  const cargarCarrito = useCallback(async () => {
    try {
      const datos = await obtenerCarrito();
      setCarrito(datos);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCarrito(null);
      } else {
        console.log("Error al cargar carrito:", error);

        // Se mantiene el registro del error para depuración.
        setCarrito(null);
      }
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarCarrito();
    }, [cargarCarrito])
  );

  const formatearPrecio = (valor: number) => {
    return valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  };

  const cambiarCantidad = async (
    producto: ProductoCarrito,
    nuevaCantidad: number
  ) => {
    if (!carrito || nuevaCantidad < 1 || procesando) return;

    try {
      await actualizarCantidad(
        carrito.carritoId,
        producto.productoId,
        nuevaCantidad
      );

      await cargarCarrito();
    } catch (error: any) {
      console.log("Error al actualizar cantidad:", error);

      // La disponibilidad se vuelve a verificar al actualizar.
      setProductoAEliminar(null);
    }
  };

  const confirmarEliminar = (producto: ProductoCarrito) => {
    setProductoAEliminar(producto);
    setTipoConfirmacion("eliminar");
  };

  const confirmarVaciar = () => {
    if (!carrito || carrito.productos.length === 0) return;

    setTipoConfirmacion("vaciar");
  };

  const cerrarConfirmacion = () => {
    if (procesando) return;

    setTipoConfirmacion(null);
    setProductoAEliminar(null);
  };

  const ejecutarConfirmacion = async () => {
    if (!carrito || !tipoConfirmacion || procesando) return;

    try {
      setProcesando(true);

      if (tipoConfirmacion === "eliminar") {
        if (!productoAEliminar) return;

        await eliminarProducto(
          carrito.carritoId,
          productoAEliminar.productoId
        );
      } else {
        await vaciarCarrito(carrito.carritoId);
      }

      setTipoConfirmacion(null);
      setProductoAEliminar(null);

      await cargarCarrito();
    } catch (error: any) {
      console.log("Error en la operación:", error);
      console.log("Respuesta API:", error.response?.data);
    } finally {
      setProcesando(false);
    }
  };

  const abrirCompra = () => {
    if (!carrito || carrito.productos.length === 0) return;

    setDireccionEntrega("");
    setErrorCompra("");
    setModalCompra(true);
  };

  const ejecutarCompra = async () => {
    const direccion = direccionEntrega.trim();

    if (!direccion) {
      setErrorCompra("Ingresa la dirección donde deseas recibir tu pedido.");
      return;
    }

    if (procesandoCompra) return;

    try {
      setProcesandoCompra(true);
      setErrorCompra("");

      const respuesta = await confirmarPedido(direccion);

      console.log("Pedido confirmado:", respuesta);

      setModalCompra(false);
      setDireccionEntrega("");
      setCarrito(null);

      router.push("/(tabs)/orders");
    } catch (error: any) {
      console.log("Error al confirmar pedido:", error);
      console.log("Respuesta API:", error.response?.data);

      setErrorCompra(
        error.response?.data?.mensaje ||
          error.response?.data?.title ||
          error.message ||
          "No fue posible confirmar el pedido."
      );
    } finally {
      setProcesandoCompra(false);
    }
  };

  const renderProducto = ({ item }: { item: ProductoCarrito }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productIcon}>
          <Ionicons
            name="cube-outline"
            size={25}
            color="#2563EB"
          />
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmarEliminar(item)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={19} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <Text style={styles.productName}>{item.producto}</Text>

      <Text style={styles.priceLabel}>Precio unitario</Text>
      <Text style={styles.price}>
        {formatearPrecio(item.precioUnitario)}
      </Text>

      <View style={styles.productDivider} />

      <View style={styles.productFooter}>
        <View>
          <Text style={styles.quantityLabel}>Cantidad</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.cantidad <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={() => cambiarCantidad(item, item.cantidad - 1)}
              disabled={item.cantidad <= 1}
            >
              <Ionicons name="remove" size={18} color="#1D4ED8" />
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.cantidad}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => cambiarCantidad(item, item.cantidad + 1)}
            >
              <Ionicons name="add" size={18} color="#1D4ED8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.subtotalContainer}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotal}>
            {formatearPrecio(item.subtotal)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>TECHNOLOGY STORE</Text>
            <Text style={styles.title}>Mi carrito</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="cart-outline" size={27} color="#FFFFFF" />
          </View>
        </View>

        <Text style={styles.headerDescription}>
          Revisa tus productos antes de confirmar tu compra.
        </Text>
      </View>

      {!carrito || carrito.productos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="cart-outline"
              size={55}
              color="#2563EB"
            />
          </View>

          <Text style={styles.emptyTitle}>
            Tu carrito está vacío
          </Text>

          <Text style={styles.emptyDescription}>
            Agrega productos desde nuestro catálogo para comenzar tu compra.
          </Text>

          <TouchableOpacity
            style={styles.catalogButton}
            onPress={() => router.push("/(tabs)/products")}
          >
            <Ionicons name="grid-outline" size={18} color="#FFFFFF" />
            <Text style={styles.catalogButtonText}>
              Explorar productos
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={carrito.productos}
          keyExtractor={(item) => item.detalleCarritoId.toString()}
          renderItem={renderProducto}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => {
                setActualizando(true);
                cargarCarrito();
              }}
              colors={["#2563EB"]}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <View>
                <Text style={styles.sectionTitle}>Tus productos</Text>
                <Text style={styles.productCount}>
                  {carrito.productos.length} producto(s) en tu carrito
                </Text>
              </View>

              <TouchableOpacity
                onPress={confirmarVaciar}
                style={styles.clearHeaderButton}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text style={styles.clearHeaderText}>Vaciar</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <View style={styles.summary}>
              <View style={styles.summaryHeader}>
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color="#2563EB"
                />
                <Text style={styles.summaryTitle}>
                  Resumen de compra
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total a pagar</Text>

                <Text style={styles.totalPrice}>
                  {formatearPrecio(carrito.total)}
                </Text>
              </View>

              <View style={styles.securityInfo}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={17}
                  color="#16A34A"
                />
                <Text style={styles.securityText}>
                  Revisa tu pedido antes de confirmarlo.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={abrirCompra}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.checkoutText}>
                  Continuar compra
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modal para eliminar o vaciar */}
      <Modal
        visible={tipoConfirmacion !== null}
        transparent
        animationType="fade"
        onRequestClose={cerrarConfirmacion}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <View style={styles.modalIconError}>
              <Ionicons
                name="alert-circle-outline"
                size={42}
                color="#DC2626"
              />
            </View>

            <Text style={styles.modalTitulo}>
              {tipoConfirmacion === "eliminar"
                ? "Eliminar producto"
                : "Vaciar carrito"}
            </Text>

            <Text style={styles.modalDescripcion}>
              {tipoConfirmacion === "eliminar"
                ? `¿Deseas eliminar ${productoAEliminar?.producto} del carrito?`
                : "¿Estás seguro de que deseas eliminar todos los productos del carrito?"}
            </Text>

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.modalCancelar}
                onPress={cerrarConfirmacion}
                disabled={procesando}
              >
                <Text style={styles.modalCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalEliminar}
                onPress={ejecutarConfirmacion}
                disabled={procesando}
              >
                {procesando ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalEliminarTexto}>
                    {tipoConfirmacion === "eliminar" ? "Eliminar" : "Vaciar"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de compra */}
      <Modal
        visible={modalCompra}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!procesandoCompra) setModalCompra(false);
        }}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <View style={styles.modalIconCompra}>
              <Ionicons
                name="bag-check-outline"
                size={40}
                color="#2563EB"
              />
            </View>

            <Text style={styles.modalTitulo}>Confirmar compra</Text>

            <Text style={styles.modalDescripcion}>
              Ingresa la dirección donde deseas recibir tu pedido.
            </Text>

            <Text style={styles.inputLabel}>Dirección de entrega</Text>

            <TextInput
              style={styles.direccionInput}
              placeholder="Ej. Calle 10 # 20-30, Medellín"
              placeholderTextColor="#94A3B8"
              value={direccionEntrega}
              onChangeText={(texto) => {
                setDireccionEntrega(texto);
                setErrorCompra("");
              }}
              multiline
              numberOfLines={3}
              editable={!procesandoCompra}
              textAlignVertical="top"
            />

            {errorCompra ? (
              <Text style={styles.errorCompra}>{errorCompra}</Text>
            ) : null}

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.modalCancelar}
                onPress={() => setModalCompra(false)}
                disabled={procesandoCompra}
              >
                <Text style={styles.modalCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmarCompraButton}
                onPress={ejecutarCompra}
                disabled={procesandoCompra}
              >
                {procesandoCompra ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalEliminarTexto}>
                    Confirmar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
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
  },
  header: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 23,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#93C5FD",
    letterSpacing: 2,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 5,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerDescription: {
    fontSize: 13,
    color: "#CBD5E1",
    marginTop: 12,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  emptyIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  emptyDescription: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 10,
    lineHeight: 22,
    fontSize: 13,
  },
  catalogButton: {
    backgroundColor: "#1D4ED8",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 24,
  },
  catalogButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  list: {
    padding: 18,
    paddingBottom: 35,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },
  productCount: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  clearHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 9,
    backgroundColor: "#FEE2E2",
    borderRadius: 9,
  },
  clearHeaderText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "700",
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  productIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  price: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 3,
  },
  productDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 15,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  quantityLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 33,
    height: 33,
    backgroundColor: "#DBEAFE",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantity: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtotalContainer: {
    alignItems: "flex-end",
  },
  subtotalLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtotal: {
    color: "#1D4ED8",
    fontWeight: "800",
    fontSize: 17,
  },
  summary: {
    backgroundColor: "#FFFFFF",
    padding: 19,
    borderRadius: 15,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 17,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  totalPrice: {
    fontSize: 21,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 16,
    marginBottom: 18,
  },
  securityText: {
    color: "#64748B",
    fontSize: 11,
  },
  checkoutButton: {
    backgroundColor: "#1D4ED8",
    padding: 15,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  modalFondo: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContenido: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    maxWidth: 380,
    padding: 24,
    borderRadius: 18,
  },
  modalIconError: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalIconCompra: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  modalDescripcion: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 21,
    marginBottom: 17,
  },
  modalBotones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
  modalCancelar: {
    padding: 12,
    borderRadius: 9,
    backgroundColor: "#E2E8F0",
    minWidth: 90,
    alignItems: "center",
  },
  modalCancelarTexto: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 13,
  },
  modalEliminar: {
    padding: 12,
    borderRadius: 9,
    backgroundColor: "#DC2626",
    minWidth: 90,
    alignItems: "center",
  },
  modalEliminarTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  direccionInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 9,
    padding: 12,
    minHeight: 85,
    fontSize: 13,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  errorCompra: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 9,
  },
  confirmarCompraButton: {
    padding: 12,
    borderRadius: 9,
    backgroundColor: "#1D4ED8",
    minWidth: 100,
    alignItems: "center",
  },
});
