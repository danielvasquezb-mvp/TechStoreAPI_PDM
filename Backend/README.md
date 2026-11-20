# TechStoreAPI_PDM
API REST para la gestión de una aplicación de e-commerce, desarrollada con ASP.NET Core y Entity Framework Core. Permite administrar usuarios, categorías, productos, carritos de compra y pedidos, utilizando SQL Server como base de datos.

1. Tecnologías utilizadas

C#

ASP.NET Core (.NET 10)

Entity Framework Core

SQL Server

Swagger / OpenAPI

Visual Studio

2. Requisitos previos

Antes de ejecutar el proyecto, debes tener instalado:

Visual Studio con la carga de trabajo de desarrollo ASP.NET y web.

.NET 10 SDK.

SQL Server o SQL Server Express.

SQL Server Management Studio (SSMS), opcional, para administrar la base de datos.

3. Descargar el proyecto

Clona el repositorio desde una terminal:

git clone https://github.com/danielvasquezb-mvp/TechStoreAPI_PDM.git
cd TechStoreAPI_PDM

También puedes descargar el proyecto desde GitHub e iniciar la solución en Visual Studio.

4. Configurar la base de datos

El proyecto utiliza SQL Server y una base de datos llamada TechStoreDB.

Verifica la cadena de conexión en appsettings.json:

{
  "ConnectionStrings": {
    "SqlLocal": "Server=localhost;Database=TechStoreDB;TrustServerCertificate=True;Integrated Security=True;"
  }
}

Asegúrate de que SQL Server esté instalado y ejecutándose. Si utilizas otra instancia, modifica la cadena de conexión según tu configuración.

5. Crear las tablas

El proyecto utiliza Entity Framework Core con el enfoque Code First.

Desde la consola del Administrador de paquetes NuGet de Visual Studio, ejecuta:

Update-Database

Este comando aplica las migraciones existentes y crea o actualiza las tablas de la base de datos.

Con el script SQL DDL, también puedes utilizarlo para crear la estructura de la base de datos.

6. Ejecutar la API

Abre la solución del proyecto en Visual Studio.

Verifica que el proyecto API sea el proyecto de inicio.

Confirma que la cadena de conexión sea correcta.

Ejecuta el proyecto con F5 o Ctrl + F5.

La API se ejecutará en la dirección configurada por Visual Studio.

7. Acceder a Swagger

Con la API en ejecución, abre:

https://localhost:7023/swagger

Swagger permite consultar los endpoints disponibles, enviar solicitudes HTTP y comprobar las respuestas de la API.

8. Funcionalidades principales

Gestión de usuarios y autenticación mediante inicio de sesión.

CRUD de categorías.

CRUD de productos.

Consulta y administración del carrito de compras.

Confirmación y consulta de pedidos.

Actualización del estado de los pedidos.

Validación de datos, existencias y relaciones entre registros.

9. Estructura de la base de datos

La base de datos contiene las siguientes entidades:

Usuario

Categoría

Producto

Carrito

DetalleCarrito

Pedido

DetallePedido

Las relaciones entre estas entidades permiten gestionar el catálogo, las compras y los pedidos de los usuarios.

10. Repositorio

Código fuente del proyecto:

https://github.com/danielvasquezb-mvp/TechStoreAPI_PDM.git
