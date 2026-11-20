# TechStoreAPI-PDM

Aplicación de comercio electrónico desarrollada con **ASP.NET Core Web API, C#, Entity Framework Core, SQL Server y React Native con Expo**.

## 1. Estructura del proyecto

TechStoreAPI-PDM/
│
├── Backend/
│   └── TechStoreAPI-PDM/
│
├── Frontend/
│   ├── app/
│   ├── services/
│   └── package.json
│
├── BD/
│   └── CrearBaseDatos.sql
│
└── README.md

## 2. Requisitos previos

Antes de ejecutar el proyecto, se deben instalar:

- Visual Studio 2022 o Visual Studio Code.
- .NET 10 SDK.
- SQL Server.
- SQL Server Management Studio (SSMS).
- Node.js y npm.
- Expo Go (para ejecutar la aplicación en un dispositivo móvil).

## 3. Configuración de la base de datos

1. Abrir SQL Server Management Studio.
2. Conectarse a la instancia de SQL Server.
3. Abrir el archivo `BD/CrearBaseDatos.sql`.
4. Ejecutar el script para crear la base de datos y sus objetos.
5. Verificar que la base de datos se haya creado correctamente.

## 4. Configuración y ejecución del backend

El backend está desarrollado con ASP.NET Core Web API y Entity Framework Core.

### Configurar la conexión

Abrir el archivo:

`Backend/TechStoreAPI-PDM/appsettings.json`

Configurar la cadena de conexión para que corresponda con la instancia de SQL Server y la base de datos creada.

### Ejecutar la API

Abrir una terminal en la carpeta del backend:

cd Backend/TechStoreAPI-PDM

Restaurar los paquetes:

dotnet restore

Ejecutar el proyecto:

dotnet run

La API utiliza como dirección local configurada:

https://localhost:7023

La documentación de Swagger estará disponible si está habilitada en la configuración del proyecto.

## 5. Configuración y ejecución del frontend

El frontend está desarrollado con React Native y Expo.

Abrir una terminal en la carpeta del frontend:

cd Frontend

Instalar las dependencias:

npm install

Verificar el archivo:

`services/api.ts`

La dirección base debe apuntar a la API que se está ejecutando.

### Iniciar la aplicación

npx expo start

Para ejecutar la aplicación en el navegador, presionar `w` en la terminal de Expo.

También se puede utilizar Expo Go para probarla en un dispositivo móvil.

## 6. Orden recomendado de ejecución

Para utilizar correctamente la aplicación:

1. Crear la base de datos en SQL Server.
2. Configurar la conexión del backend.
3. Iniciar el backend.
4. Instalar las dependencias del frontend.
5. Iniciar Expo.
6. Utilizar la aplicación para registrarse, iniciar sesión, consultar productos, gestionar el carrito y realizar pedidos.

## 7. Tecnologías utilizadas

| Componente | Tecnología |
|---|---|
| Backend | ASP.NET Core Web API |
| Lenguaje backend | C# |
| ORM | Entity Framework Core |
| Base de datos | SQL Server |
| Frontend | React Native |
| Framework móvil | Expo |
| Lenguaje frontend | TypeScript |
| Navegación | Expo Router |
| Consumo de API | Axios |
