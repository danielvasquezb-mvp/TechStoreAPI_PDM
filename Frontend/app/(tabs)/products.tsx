
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../../services/api";
import { agregarProducto } from "../../services/carritoService";

interface Categoria {
  categoriaId: number;
  nombre: string;
}

interface Producto {
  productoId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string | null;
  activo: boolean;
  categoriaId: number;
  categoria?: Categoria | null;
}

export default function ProductsScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [productoAgregando, setProductoAgregando] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [tituloModal, setTituloModal] = useState("");
  const [tipoModal, setTipoModal] = useState<"exito" | "error">("exito");

  const cargarProductos = async (refrescar = false) => {
    try {
      if (refrescar) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError("");

      const respuesta = await api.get<Producto[]>("/Productos");

      const productosActivos = respuesta.data.filter(
        (producto) => producto.activo
      );

      setProductos(productosActivos);
    } catch (err: any) {
      console.log("Error al cargar productos:", err.message);
      console.log("Respuesta del servidor:", err.response?.data);

      setError(
        "No fue posible cargar los productos. Verifica la conexión con el servidor."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const formatearPrecio = (precio: number) => {
    return precio.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  };

  const handleAgregarCarrito = async (producto: Producto) => {
    if (producto.stock <= 0) {
      setTituloModal("Producto agotado");
      setMensajeModal("Este producto no está disponible actualmente.");
      setTipoModal("error");
      setModalVisible(true);
      return;
    }

    if (productoAgregando !== null) return;

    try {
      setProductoAgregando(producto.productoId);

      const respuesta = await agregarProducto(producto.productoId, 1);

      setTituloModal("¡Producto agregado!");
      setMensajeModal(
        respuesta.mensaje || `${producto.nombre} se agregó al carrito correctamente.`
      );
      setTipoModal("exito");
      setModalVisible(true);
    } catch (err: any) {
      console.log("Error al agregar al carrito:", err.message);
      console.log("Respuesta del servidor:", err.response?.data);

      const mensaje =
        err.response?.data?.mensaje ||
        "No fue posible agregar el producto al carrito.";

      setTituloModal("No se pudo agregar");
      setMensajeModal(mensaje);
      setTipoModal("error");
      setModalVisible(true);
    } finally {
      setProductoAgregando(null);
    }
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  const renderProducto = ({ item }: { item: Producto }) => {
    const agregando = productoAgregando === item.productoId;
    const agotado = item.stock <= 0;

    return (
      <View style={styles.card}>
        <View style={styles.imagenContainer}>
          {item.imagenUrl ? (
            <Image
              source={{ uri: item.imagenUrl }}
              style={styles.imagen}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagenVacia}>
              <Ionicons
                name="image-outline"
                size={42}
                color="#94A3B8"
              />
              <Text style={styles.imagenVaciaTexto}>Sin imagen</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.categoria}>
            {item.categoria?.nombre || "Producto"}
          </Text>

          <Text style={styles.nombre} numberOfLines={2}>
            {item.nombre}
          </Text>

          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion || "Sin descripción disponible."}
          </Text>

          <View style={styles.precioContainer}>
            <View>
              <Text style={styles.precioLabel}>Precio</Text>
              <Text style={styles.precio}>
                {formatearPrecio(item.precio)}
              </Text>
            </View>

            <View
              style={[
                styles.disponibilidadBadge,
                agotado ? styles.agotadoBadge : styles.disponibleBadge,
              ]}
            >
              <View
                style={[
                  styles.disponibilidadPunto,
                  agotado ? styles.puntoAgotado : styles.puntoDisponible,
                ]}
              />
              <Text
                style={[
                  styles.disponibilidad,
                  agotado ? styles.agotado : styles.disponible,
                ]}
              >
                {agotado ? "Agotado" : "Disponible"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.botonCarrito,
              (agotado || agregando || productoAgregando !== null) &&
                styles.botonDeshabilitado,
            ]}
            onPress={() => handleAgregarCarrito(item)}
            disabled={agotado || agregando || productoAgregando !== null}
            activeOpacity={0.85}
          >
            {agregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name={agotado ? "close-circle-outline" : "cart-outline"}
                  size={19}
                  color="#FFFFFF"
                />
                <Text style={styles.botonCarritoTexto}>
                  {agotado ? "No disponible" : "Agregar al carrito"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.mensaje}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centrado}>
        <Ionicons
          name="cloud-offline-outline"
          size={48}
          color="#94A3B8"
        />

        <Text style={styles.error}>{error}</Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => cargarProductos()}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
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
            <Text style={styles.titulo}>Nuestro catálogo</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="grid-outline"
              size={27}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.subtitulo}>
          Encuentra los productos tecnológicos que necesitas.
        </Text>

        <View style={styles.contadorContainer}>
          <Ionicons name="cube-outline" size={16} color="#BFDBFE" />
          <Text style={styles.contadorTexto}>
            {productosFiltrados.length} productos disponibles en el catálogo
          </Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <Ionicons name="search-outline" size={21} color="#64748B" />

        <TextInput
          style={styles.busqueda}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#94A3B8"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda("")}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productosFiltrados}
        renderItem={renderProducto}
        keyExtractor={(item) => item.productoId.toString()}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarProductos(true)}
            colors={["#2563EB"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.vacioContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color="#94A3B8"
            />
            <Text style={styles.vacioTitulo}>
              No se encontraron productos
            </Text>
            <Text style={styles.vacio}>
              {busqueda
                ? "Intenta con otro nombre."
                : "No hay productos disponibles actualmente."}
            </Text>
          </View>
        }
      />

      {/* Modal de confirmación */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalIcon,
                tipoModal === "exito"
                  ? styles.modalIconExito
                  : styles.modalIconError,
              ]}
            >
              <Ionicons
                name={
                  tipoModal === "exito"
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={48}
                color={tipoModal === "exito" ? "#16A34A" : "#DC2626"}
              />
            </View>

            <Text style={styles.modalTitulo}>{tituloModal}</Text>

            <Text style={styles.modalMensaje}>{mensajeModal}</Text>

            <TouchableOpacity
              style={styles.modalBoton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBotonTexto}>Aceptar</Text>
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
  },
  header: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    color: "#93C5FD",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  titulo: {
    fontSize: 25,
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
  subtitulo: {
    fontSize: 13,
    color: "#CBD5E1",
    marginTop: 12,
    lineHeight: 20,
  },
  contadorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 17,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  contadorTexto: {
    fontSize: 12,
    color: "#BFDBFE",
    fontWeight: "600",
  },
  busquedaContainer: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 5,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  busqueda: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
    outlineStyle: "none",
  } as any,
  lista: {
    padding: 18,
    paddingTop: 13,
    paddingBottom: 30,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  imagenContainer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  imagen: {
    width: "100%",
    height: 180,
  },
  imagenVacia: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagenVaciaTexto: {
    color: "#94A3B8",
    fontSize: 12,
  },
  info: {
    padding: 16,
  },
  categoria: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 7,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  descripcion: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 7,
    lineHeight: 19,
  },
  precioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 17,
    gap: 8,
  },
  precioLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 3,
  },
  precio: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  disponibilidadBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  disponibleBadge: {
    backgroundColor: "#DCFCE7",
  },
  agotadoBadge: {
    backgroundColor: "#FEE2E2",
  },
  disponibilidadPunto: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },
  puntoDisponible: {
    backgroundColor: "#16A34A",
  },
  puntoAgotado: {
    backgroundColor: "#DC2626",
  },
  disponibilidad: {
    fontSize: 11,
    fontWeight: "700",
  },
  disponible: {
    color: "#15803D",
  },
  agotado: {
    color: "#B91C1C",
  },
  botonCarrito: {
    backgroundColor: "#1D4ED8",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
    minHeight: 49,
    flexDirection: "row",
    gap: 9,
  },
  botonDeshabilitado: {
    backgroundColor: "#94A3B8",
  },
  botonCarritoTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F1F5F9",
  },
  mensaje: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 13,
  },
  error: {
    color: "#DC2626",
    textAlign: "center",
    marginVertical: 16,
    fontSize: 13,
  },
  boton: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  vacioContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 35,
    marginTop: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    gap: 10,
  },
  vacioTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  vacio: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 27,
    alignItems: "center",
  },
  modalIcon: {
    width: 75,
    height: 75,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  modalIconExito: {
    backgroundColor: "#DCFCE7",
  },
  modalIconError: {
    backgroundColor: "#FEE2E2",
  },
  modalTitulo: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  modalMensaje: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 23,
  },
  modalBoton: {
    width: "100%",
    backgroundColor: "#1D4ED8",
    minHeight: 49,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBotonTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
