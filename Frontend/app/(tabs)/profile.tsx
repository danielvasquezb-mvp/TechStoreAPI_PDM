
import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Usuario {
  usuarioId: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
}

export default function ProfileScreen() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const [modalCerrarSesion, setModalCerrarSesion] = useState(false);
  const [modalError, setModalError] = useState(false);

  // Consultar los datos del usuario
  const cargarUsuario = useCallback(async () => {
    try {
      const datos = await AsyncStorage.getItem("usuario");

      if (!datos) {
        setUsuario(null);
        router.replace("/(auth)/login");
        return;
      }

      setUsuario(JSON.parse(datos));
    } catch (error) {
      console.log("Error al cargar perfil:", error);
      setModalError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarUsuario();
    }, [cargarUsuario])
  );

  // Mostrar confirmación de cierre
  const cerrarSesion = () => {
    setModalCerrarSesion(true);
  };

  // Ejecutar cierre de sesión
  const ejecutarCierreSesion = async () => {
    if (cerrandoSesion) return;

    try {
      setCerrandoSesion(true);

      await AsyncStorage.removeItem("usuario");

      setModalCerrarSesion(false);

      router.replace("/(auth)/login");
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
      setModalCerrarSesion(false);
      setModalError(true);
    } finally {
      setCerrandoSesion(false);
    }
  };

  // Obtener iniciales del usuario
  const obtenerIniciales = () => {
    const inicialNombre = usuario?.nombre?.charAt(0) || "U";
    const inicialApellido = usuario?.apellido?.charAt(0) || "";

    return `${inicialNombre}${inicialApellido}`.toUpperCase();
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#2563EB" />

        <Text style={styles.textoCarga}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  if (!usuario) {
    return (
      <View style={styles.centro}>
        <Ionicons
          name="person-circle-outline"
          size={55}
          color="#94A3B8"
        />

        <Text style={styles.textoCarga}>
          No hay una sesión activa.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      showsVerticalScrollIndicator={false}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerIcono}>
          <Ionicons
            name="person-outline"
            size={25}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.headerTextos}>
          <Text style={styles.headerMarca}>
            TECHSTORE
          </Text>

          <Text style={styles.titulo}>
            Mi perfil
          </Text>

          <Text style={styles.subtituloHeader}>
            Administra y consulta tu información personal.
          </Text>
        </View>
      </View>

      {/* Tarjeta principal del usuario */}
      <View style={styles.tarjetaPerfil}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>
              {obtenerIniciales()}
            </Text>
          </View>

          <View style={styles.avatarEstado}>
            <Ionicons
              name="checkmark"
              size={12}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.nombreUsuario}>
          {usuario.nombre} {usuario.apellido}
        </Text>

        <Text style={styles.correoUsuario}>
          {usuario.correo}
        </Text>

        <View style={styles.estadoCuenta}>
          <View style={styles.estadoPunto} />

          <Text style={styles.estadoCuentaTexto}>
            Sesión activa
          </Text>
        </View>
      </View>

      {/* Información personal */}
      <View style={styles.seccionEncabezado}>
        <Text style={styles.seccionTitulo}>
          Información personal
        </Text>

        <Text style={styles.seccionDescripcion}>
          Datos registrados en tu cuenta.
        </Text>
      </View>

      <View style={styles.tarjetaDatos}>
        <View style={styles.dato}>
          <View style={styles.datoIcono}>
            <Ionicons
              name="person-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <View style={styles.datoContenido}>
            <Text style={styles.etiqueta}>
              Nombre
            </Text>

            <Text style={styles.valor}>
              {usuario.nombre || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.dato}>
          <View style={styles.datoIcono}>
            <Ionicons
              name="person-circle-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <View style={styles.datoContenido}>
            <Text style={styles.etiqueta}>
              Apellido
            </Text>

            <Text style={styles.valor}>
              {usuario.apellido || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.dato}>
          <View style={styles.datoIcono}>
            <Ionicons
              name="mail-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <View style={styles.datoContenido}>
            <Text style={styles.etiqueta}>
              Correo electrónico
            </Text>

            <Text style={styles.valor}>
              {usuario.correo || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.dato}>
          <View style={styles.datoIcono}>
            <Ionicons
              name="call-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <View style={styles.datoContenido}>
            <Text style={styles.etiqueta}>
              Teléfono
            </Text>

            <Text style={styles.valor}>
              {usuario.telefono || "No registrado"}
            </Text>
          </View>
        </View>

        <View style={styles.separador} />

        <View style={styles.dato}>
          <View style={styles.datoIcono}>
            <Ionicons
              name="location-outline"
              size={19}
              color="#2563EB"
            />
          </View>

          <View style={styles.datoContenido}>
            <Text style={styles.etiqueta}>
              Dirección
            </Text>

            <Text style={styles.valor}>
              {usuario.direccion || "No registrada"}
            </Text>
          </View>
        </View>
      </View>

      {/* Información de seguridad */}
      <View style={styles.seguridadCard}>
        <View style={styles.seguridadIcono}>
          <Ionicons
            name="shield-checkmark-outline"
            size={23}
            color="#16A34A"
          />
        </View>

        <View style={styles.seguridadTexto}>
          <Text style={styles.seguridadTitulo}>
            Cuenta protegida
          </Text>

          <Text style={styles.seguridadDescripcion}>
            Tu información de sesión se administra de forma segura
            en la aplicación.
          </Text>
        </View>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity
        style={styles.botonCerrar}
        onPress={cerrarSesion}
        disabled={cerrandoSesion}
        activeOpacity={0.8}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#FFFFFF"
        />

        <Text style={styles.textoCerrar}>
          Cerrar sesión
        </Text>
      </TouchableOpacity>

      <Text style={styles.version}>
        TECHSTORE
      </Text>

      <Text style={styles.versionDetalle}>
        Aplicación de comercio digital
      </Text>

      {/* Modal de confirmación */}
      <Modal
        visible={modalCerrarSesion}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!cerrandoSesion) {
            setModalCerrarSesion(false);
          }
        }}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <View style={styles.modalIcono}>
              <Ionicons
                name="log-out-outline"
                size={30}
                color="#DC2626"
              />
            </View>

            <Text style={styles.modalTitulo}>
              Cerrar sesión
            </Text>

            <Text style={styles.modalDescripcion}>
              ¿Estás seguro de que deseas cerrar tu sesión en
              TechStore?
            </Text>

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.modalCancelar}
                onPress={() => setModalCerrarSesion(false)}
                disabled={cerrandoSesion}
              >
                <Text style={styles.modalCancelarTexto}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmar}
                onPress={ejecutarCierreSesion}
                disabled={cerrandoSesion}
              >
                {cerrandoSesion ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name="log-out-outline"
                      size={16}
                      color="#FFFFFF"
                    />

                    <Text style={styles.modalConfirmarTexto}>
                      Salir
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de error */}
      <Modal
        visible={modalError}
        transparent
        animationType="fade"
        onRequestClose={() => setModalError(false)}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            <View style={styles.errorIcono}>
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color="#DC2626"
              />
            </View>

            <Text style={styles.modalTitulo}>
              Ha ocurrido un problema
            </Text>

            <Text style={styles.modalDescripcion}>
              No fue posible completar la operación. Intenta
              nuevamente.
            </Text>

            <TouchableOpacity
              style={styles.botonEntendido}
              onPress={() => setModalError(false)}
            >
              <Text style={styles.botonEntendidoTexto}>
                Entendido
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  contenido: {
    padding: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },

  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },

  textoCarga: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
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

  titulo: {
    fontSize: 23,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  subtituloHeader: {
    color: "#CBD5E1",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  tarjetaPerfil: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarTexto: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2563EB",
  },

  avatarEstado: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: "#16A34A",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  nombreUsuario: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  correoUsuario: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
  },

  estadoCuenta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 13,
    gap: 7,
  },

  estadoPunto: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#16A34A",
  },

  estadoCuentaTexto: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },

  seccionEncabezado: {
    marginBottom: 13,
  },

  seccionTitulo: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  seccionDescripcion: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },

  tarjetaDatos: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  dato: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 13,
  },

  datoIcono: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  datoContenido: {
    flex: 1,
  },

  etiqueta: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 5,
  },

  valor: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },

  separador: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  seguridadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 15,
    borderRadius: 14,
    marginTop: 20,
    gap: 12,
  },

  seguridadIcono: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
  },

  seguridadTexto: {
    flex: 1,
  },

  seguridadTitulo: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "800",
  },

  seguridadDescripcion: {
    color: "#15803D",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  botonCerrar: {
    backgroundColor: "#DC2626",
    padding: 15,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 25,
  },

  textoCerrar: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  version: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 27,
  },

  versionDetalle: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 5,
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
    maxWidth: 370,
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
  },

  modalIcono: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  errorIcono: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },

  modalDescripcion: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },

  modalBotones: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 23,
    width: "100%",
  },

  modalCancelar: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },

  modalCancelarTexto: {
    color: "#334155",
    fontWeight: "700",
    fontSize: 12,
  },

  modalConfirmar: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  modalConfirmarTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },

  botonEntendido: {
    backgroundColor: "#2563EB",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 22,
  },

  botonEntendidoTexto: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
});
