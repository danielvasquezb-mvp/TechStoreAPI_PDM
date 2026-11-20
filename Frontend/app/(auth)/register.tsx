
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [modalRegistro, setModalRegistro] = useState(false);

  const handleRegister = async () => {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !correo.trim() ||
      !password.trim()
    ) {
      Alert.alert(
        "Atención",
        "Nombre, apellido, correo y contraseña son obligatorios."
      );
      return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      correo.trim()
    );

    if (!correoValido) {
      Alert.alert(
        "Correo inválido",
        "Ingresa un correo electrónico válido."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (cargando) return;

    setCargando(true);

    try {
      const respuesta = await api.post("/Usuarios", {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        password,
        telefono: telefono.trim() || null,
        direccion: direccion.trim() || null,
      });

      console.log("Usuario registrado:", respuesta.data);

      setModalRegistro(true);
    } catch (error: any) {
      console.log("Error de registro:", error.message);
      console.log("Respuesta del servidor:", error.response?.data);

      Alert.alert(
        "Error de registro",
        error.response?.data?.mensaje ||
          error.message ||
          "No fue posible crear la cuenta."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          {/* Identidad visual */}
          <View style={styles.brandContainer}>
            <View style={styles.logoIcon}>
              <Ionicons
                name="hardware-chip-outline"
                size={34}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.logoText}>
              Tech<Text style={styles.logoHighlight}>Store</Text>
            </Text>

            <Text style={styles.brandDescription}>
              PLATAFORMA DE COMERCIO DIGITAL
            </Text>
          </View>

          {/* Formulario de registro */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>
                Crear cuenta
              </Text>

              <Text style={styles.description}>
                Regístrate para acceder a nuestros productos y servicios.
              </Text>
            </View>

            {/* Nombre */}
            <Text style={styles.label}>Nombre</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Ingresa tu nombre"
                placeholderTextColor="#94A3B8"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                autoComplete="given-name"
              />
            </View>

            {/* Apellido */}
            <Text style={styles.label}>Apellido</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Ingresa tu apellido"
                placeholderTextColor="#94A3B8"
                value={apellido}
                onChangeText={setApellido}
                autoCapitalize="words"
                autoComplete="family-name"
              />
            </View>

            {/* Correo */}
            <Text style={styles.label}>Correo electrónico</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#94A3B8"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            {/* Teléfono */}
            <Text style={styles.label}>Teléfono</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Ingresa tu teléfono"
                placeholderTextColor="#94A3B8"
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            </View>

            {/* Dirección */}
            <Text style={styles.label}>Dirección</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Ingresa tu dirección"
                placeholderTextColor="#94A3B8"
                value={direccion}
                onChangeText={setDireccion}
                autoCapitalize="sentences"
              />
            </View>

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
                autoComplete="new-password"
              />

              <TouchableOpacity
                onPress={() => setMostrarPassword(!mostrarPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    mostrarPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={21}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Botón de registro */}
            <TouchableOpacity
              style={[
                styles.button,
                cargando && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={cargando}
              activeOpacity={0.85}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    Crear cuenta
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Acceso al login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                ¿Ya tienes una cuenta?
              </Text>

              <Link
                href="/(auth)/login"
                style={styles.loginLink}
              >
                Inicia sesión
              </Link>
            </View>
          </View>

          {/* Seguridad */}
          <View style={styles.securityContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={17}
              color="#64748B"
            />

            <Text style={styles.securityText}>
              Tus datos se gestionan de forma segura
            </Text>
          </View>

          <Text style={styles.footer}>
            © 2026 TechStore · Todos los derechos reservados
          </Text>

        </View>
      </ScrollView>
      <Modal
  visible={modalRegistro}
  transparent
  animationType="fade"
  onRequestClose={() => setModalRegistro(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <View style={styles.successIcon}>
        <Ionicons
          name="checkmark-circle"
          size={55}
          color="#16A34A"
        />
      </View>

      <Text style={styles.modalTitle}>
        ¡Cuenta creada!
      </Text>

      <Text style={styles.modalDescription}>
        Tu registro en TechStore se ha completado correctamente.
        Ya puedes iniciar sesión con tus credenciales.
      </Text>

      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => {
          setModalRegistro(false);
          router.replace("/(auth)/login");
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.modalButtonText}>
          Ir al inicio de sesión
        </Text>

        <Ionicons
          name="arrow-forward"
          size={18}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 22,
  },

  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },

  brandContainer: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoIcon: {
    width: 66,
    height: 66,
    borderRadius: 19,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
    elevation: 5,
  },

  logoText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1,
  },

  logoHighlight: {
    color: "#2563EB",
  },

  brandDescription: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#64748B",
    marginTop: 7,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },

  cardHeader: {
    marginBottom: 15,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  description: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 21,
    marginTop: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginTop: 14,
    marginBottom: 9,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 11,
    paddingHorizontal: 14,
    minHeight: 53,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 12,
    paddingHorizontal: 11,
  },

  button: {
    backgroundColor: "#1D4ED8",
    minHeight: 55,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 27,
    elevation: 3,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  loginContainer: {
    alignItems: "center",
    marginTop: 24,
    gap: 7,
  },

  loginText: {
    color: "#64748B",
    fontSize: 13,
  },

  loginLink: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 14,
  },

  securityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    marginTop: 25,
  },

  securityText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },

  footer: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 19,
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
  padding: 28,
  alignItems: "center",
  elevation: 10,
},

successIcon: {
  marginBottom: 15,
},

modalTitle: {
  fontSize: 24,
  fontWeight: "800",
  color: "#0F172A",
  marginBottom: 12,
},

modalDescription: {
  fontSize: 14,
  color: "#64748B",
  textAlign: "center",
  lineHeight: 22,
  marginBottom: 25,
},

modalButton: {
  width: "100%",
  backgroundColor: "#1D4ED8",
  minHeight: 52,
  borderRadius: 11,
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
},

modalButtonText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "700",
},
});
