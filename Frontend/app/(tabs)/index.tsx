
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";

interface Producto {
  productoId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagenUrl?: string | null;
  activo: boolean;
  categoria?: {
    categoriaId: number;
    nombre: string;
  } | null;
}

export default function HomeScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

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
      console.log("Error al cargar productos destacados:", err.message);
      setError("No fue posible cargar los productos.");
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

  const productosFiltrados = productos
    .filter((producto) =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase().trim())
    )
    .slice(0, 4);

  const renderAcceso = (
    titulo: string,
    descripcion: string,
    icono: keyof typeof Ionicons.glyphMap,
    destino: "/(tabs)/productos" | "/(tabs)/carrito" | "/(tabs)/pedidos"
  ) => (
    <TouchableOpacity
      style={styles.accessCard}
      onPress={() => router.push(destino)}
      activeOpacity={0.8}
    >
      <View style={styles.accessIcon}>
        <Ionicons name={icono} size={23} color="#2563EB" />
      </View>

      <View style={styles.accessInfo}>
        <Text style={styles.accessTitle}>{titulo}</Text>
        <Text style={styles.accessDescription}>{descripcion}</Text>
      </View>

      <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={actualizando}
          onRefresh={() => cargarProductos(true)}
          colors={["#2563EB"]}
        />
      }
    >
      {/* Encabezado principal */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.brandLabel}>TECHNOLOGY STORE</Text>
            <Text style={styles.logo}>TechStore</Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons name="hardware-chip-outline" size={29} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.heroTextContainer}>
          <Text style={styles.welcome}>
            ¡Bienvenido a tu tienda tecnológica!
          </Text>

          <Text style={styles.headerDescription}>
            Descubre productos tecnológicos para tu día a día.
          </Text>
        </View>

        <View style={styles.heroDecoration}>
          <Ionicons name="flash" size={18} color="#BFDBFE" />
          <Text style={styles.heroDecorationText}>
            Tecnología al alcance de todos
          </Text>
        </View>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={21} color="#64748B" />

        <TextInput
          style={styles.search}
          placeholder="Buscar productos..."
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

      {/* Accesos rápidos */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <Text style={styles.sectionSubtitle}>
            Gestiona tu experiencia en TechStore
          </Text>
        </View>
      </View>

      <View style={styles.accessContainer}>
        {renderAcceso(
          "Catálogo",
          "Explorar productos",
          "grid-outline",
          "/(tabs)/productos"
        )}

        {renderAcceso(
          "Mi carrito",
          "Consultar productos agregados",
          "cart-outline",
          "/(tabs)/carrito"
        )}

        {renderAcceso(
          "Mis pedidos",
          "Consultar mis compras",
          "receipt-outline",
          "/(tabs)/pedidos"
        )}
      </View>

      {/* Productos destacados */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Productos destacados</Text>
          <Text style={styles.sectionSubtitle}>
            Conoce algunos de nuestros productos
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/productos")}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAll}>Ver todos</Text>
          <Ionicons name="arrow-forward" size={15} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>
            Cargando productos...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={42}
            color="#94A3B8"
          />

          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => cargarProductos()}
          >
            <Ionicons name="refresh" size={17} color="#FFFFFF" />
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : productosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="search-outline"
            size={42}
            color="#94A3B8"
          />

          <Text style={styles.emptyText}>
            {busqueda
              ? "No se encontraron productos."
              : "No hay productos disponibles."}
          </Text>
        </View>
      ) : (
        productosFiltrados.map((producto) => (
          <View key={producto.productoId} style={styles.product}>
            <View style={styles.productImageContainer}>
              {producto.imagenUrl ? (
                <Image
                  source={{ uri: producto.imagenUrl }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="image-outline"
                    size={38}
                    color="#94A3B8"
                  />
                  <Text style={styles.placeholderText}>
                    Sin imagen
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.category}>
                {producto.categoria?.nombre || "Producto"}
              </Text>

              <Text style={styles.productName} numberOfLines={2}>
                {producto.nombre}
              </Text>

              <Text style={styles.description} numberOfLines={2}>
                {producto.descripcion || "Sin descripción disponible."}
              </Text>

              <View style={styles.productFooter}>
                <View>
                  <Text style={styles.priceLabel}>Precio</Text>
                  <Text style={styles.price}>
                    {formatearPrecio(producto.precio)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.availabilityBadge,
                    producto.stock > 0
                      ? styles.availableBadge
                      : styles.unavailableBadge,
                  ]}
                >
                  <View
                    style={[
                      styles.availabilityDot,
                      producto.stock > 0
                        ? styles.availableDot
                        : styles.unavailableDot,
                    ]}
                  />

                  <Text
                    style={[
                      styles.availability,
                      producto.stock > 0
                        ? styles.available
                        : styles.unavailable,
                    ]}
                  >
                    {producto.stock > 0 ? "Disponible" : "Agotado"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}

      {/* Botón del catálogo */}
      <TouchableOpacity
        style={styles.catalogButton}
        onPress={() => router.push("/(tabs)/productos")}
        activeOpacity={0.85}
      >
        <Text style={styles.catalogButtonText}>
          Explorar catálogo completo
        </Text>
        <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Pie de pantalla */}
      <View style={styles.footer}>
        <Ionicons name="hardware-chip-outline" size={17} color="#94A3B8" />
        <Text style={styles.footerText}>
          TechStore · Tu espacio tecnológico
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  hero: {
    backgroundColor: "#0F172A",
    borderRadius: 20,
    padding: 22,
    marginTop: 8,
    marginBottom: 22,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#93C5FD",
    letterSpacing: 2,
  },
  logo: {
    fontSize: 29,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTextContainer: {
    marginTop: 25,
  },
  welcome: {
    fontSize: 19,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 27,
  },
  headerDescription: {
    fontSize: 13,
    color: "#CBD5E1",
    marginTop: 8,
    lineHeight: 20,
  },
  heroDecoration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 22,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  heroDecorationText: {
    fontSize: 12,
    color: "#BFDBFE",
    fontWeight: "600",
  },
  searchContainer: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 27,
    gap: 10,
  },
  search: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
    outlineStyle: "none",
  } as any,
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  accessContainer: {
    gap: 10,
    marginBottom: 29,
  },
  accessCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  accessIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  accessInfo: {
    flex: 1,
  },
  accessTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  accessDescription: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5,
  },
  seeAll: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "700",
  },
  product: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  productImageContainer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  productImage: {
    width: "100%",
    height: 175,
  },
  imagePlaceholder: {
    height: 175,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#94A3B8",
    fontSize: 12,
  },
  productInfo: {
    padding: 16,
  },
  category: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 7,
  },
  productName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  description: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 7,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  priceLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 3,
  },
  price: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1D4ED8",
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  availableBadge: {
    backgroundColor: "#DCFCE7",
  },
  unavailableBadge: {
    backgroundColor: "#FEE2E2",
  },
  availabilityDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },
  availableDot: {
    backgroundColor: "#16A34A",
  },
  unavailableDot: {
    backgroundColor: "#DC2626",
  },
  availability: {
    fontSize: 11,
    fontWeight: "700",
  },
  available: {
    color: "#15803D",
  },
  unavailable: {
    color: "#B91C1C",
  },
  loading: {
    padding: 35,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
  },
  loadingText: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    gap: 10,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
    fontSize: 13,
  },
  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    fontSize: 13,
  },
  catalogButton: {
    backgroundColor: "#1D4ED8",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  catalogButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    marginTop: 25,
  },
  footerText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
