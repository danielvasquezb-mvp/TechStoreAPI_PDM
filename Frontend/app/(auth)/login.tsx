
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { iniciarSesion } from "../../services/authService";

export default function LoginScreen() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert("Atención", "Ingresa tu correo y contraseña.");
      return;
    }

    if (cargando) return;

    setCargando(true);

    try {
      const respuesta = await iniciarSesion(
        correo.trim(),
        password
      );

      await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(respuesta.usuario)
      );

      Alert.alert("Bienvenido", respuesta.mensaje);

      router.replace("/(tabs)");
    } catch (error: any) {
      console.log("Error de inicio de sesión:", error.message);
      console.log("Respuesta:", error.response?.data);

      const mensaje =
        error.response?.data?.mensaje ||
        error.message ||
        "No fue posible conectar con el servidor.";

      Alert.alert("Error de inicio de sesión", mensaje);
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

          {/* Tarjeta de autenticación */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>
                Bienvenido
              </Text>

              <Text style={styles.description}>
                Ingresa tus credenciales para acceder a tu cuenta.
              </Text>
            </View>

            {/* Correo */}
            <Text style={styles.label}>
              Correo electrónico
            </Text>

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

            {/* Contraseña */}
            <Text style={styles.label}>
              Contraseña
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#64748B"
              />

              <TextInput
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
                autoComplete="current-password"
                onSubmitEditing={handleLogin}
                returnKeyType="go"
              />

              <TouchableOpacity
                onPress={() => setMostrarPassword(!mostrarPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Botón de acceso */}
            <TouchableOpacity
              style={[
                styles.button,
                cargando && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={cargando}
              activeOpacity={0.85}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    Iniciar sesión
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Registro */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                ¿Todavía no tienes una cuenta?
              </Text>

              <Link
                href="/(auth)/register"
                style={styles.registerLink}
              >
                Crear cuenta
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
              Acceso seguro a tu cuenta
            </Text>
          </View>

          <Text style={styles.footer}>
            © 2026 TechStore · Todos los derechos reservados
          </Text>

        </View>
      </ScrollView>
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
    paddingVertical: 35,
    paddingHorizontal: 22,
  },

  content: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },

  brandContainer: {
    alignItems: "center",
    marginBottom: 32,
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
    padding: 27,
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
    marginBottom: 25,
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
    marginBottom: 9,
    marginTop: 15,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 11,
    paddingHorizontal: 14,
    minHeight: 54,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 13,
    paddingHorizontal: 11,
    outlineStyle: "none",
  } as any,

  button: {
    backgroundColor: "#1D4ED8",
    minHeight: 55,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 28,
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

  registerContainer: {
    alignItems: "center",
    marginTop: 25,
    gap: 7,
  },

  registerText: {
    color: "#64748B",
    fontSize: 13,
  },

  registerLink: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 14,
  },

  securityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    marginTop: 27,
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
    marginTop: 20,
  },
});
