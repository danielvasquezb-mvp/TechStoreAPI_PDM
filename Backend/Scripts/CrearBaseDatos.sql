IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
CREATE TABLE [Categoria] (
    [CategoriaId] int NOT NULL IDENTITY,
    [Nombre] nvarchar(max) NOT NULL,
    [Descripcion] nvarchar(max) NULL,
    [Activa] bit NOT NULL,
    CONSTRAINT [PK_Categoria] PRIMARY KEY ([CategoriaId])
);

CREATE TABLE [Usuario] (
    [UsuarioId] int NOT NULL IDENTITY,
    [Nombre] nvarchar(max) NOT NULL,
    [Apellido] nvarchar(max) NOT NULL,
    [Correo] nvarchar(max) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [Telefono] nvarchar(max) NULL,
    [Direccion] nvarchar(max) NULL,
    [FechaRegistro] datetime2 NOT NULL,
    [Activo] bit NOT NULL,
    CONSTRAINT [PK_Usuario] PRIMARY KEY ([UsuarioId])
);

CREATE TABLE [Producto] (
    [ProductoId] int NOT NULL IDENTITY,
    [Nombre] nvarchar(max) NOT NULL,
    [Descripcion] nvarchar(max) NOT NULL,
    [Precio] decimal(18,2) NOT NULL,
    [Stock] int NOT NULL,
    [ImagenUrl] nvarchar(max) NULL,
    [Activo] bit NOT NULL,
    [FechaRegistro] datetime2 NOT NULL,
    [CategoriaId] int NOT NULL,
    CONSTRAINT [PK_Producto] PRIMARY KEY ([ProductoId]),
    CONSTRAINT [FK_Producto_Categoria_CategoriaId] FOREIGN KEY ([CategoriaId]) REFERENCES [Categoria] ([CategoriaId]) ON DELETE CASCADE
);

CREATE TABLE [Carrito] (
    [CarritoId] int NOT NULL IDENTITY,
    [FechaCreacion] datetime2 NOT NULL,
    [UsuarioId] int NOT NULL,
    CONSTRAINT [PK_Carrito] PRIMARY KEY ([CarritoId]),
    CONSTRAINT [FK_Carrito_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([UsuarioId]) ON DELETE CASCADE
);

CREATE TABLE [Pedido] (
    [PedidoId] int NOT NULL IDENTITY,
    [FechaPedido] datetime2 NOT NULL,
    [Total] decimal(18,2) NOT NULL,
    [Estado] nvarchar(max) NOT NULL,
    [DireccionEntrega] nvarchar(max) NOT NULL,
    [UsuarioId] int NOT NULL,
    CONSTRAINT [PK_Pedido] PRIMARY KEY ([PedidoId]),
    CONSTRAINT [FK_Pedido_Usuario_UsuarioId] FOREIGN KEY ([UsuarioId]) REFERENCES [Usuario] ([UsuarioId]) ON DELETE CASCADE
);

CREATE TABLE [DetalleCarrito] (
    [DetalleCarritoId] int NOT NULL IDENTITY,
    [Cantidad] int NOT NULL,
    [CarritoId] int NOT NULL,
    [ProductoId] int NOT NULL,
    CONSTRAINT [PK_DetalleCarrito] PRIMARY KEY ([DetalleCarritoId]),
    CONSTRAINT [FK_DetalleCarrito_Carrito_CarritoId] FOREIGN KEY ([CarritoId]) REFERENCES [Carrito] ([CarritoId]) ON DELETE CASCADE,
    CONSTRAINT [FK_DetalleCarrito_Producto_ProductoId] FOREIGN KEY ([ProductoId]) REFERENCES [Producto] ([ProductoId]) ON DELETE CASCADE
);

CREATE TABLE [DetallePedido] (
    [DetallePedidoId] int NOT NULL IDENTITY,
    [Cantidad] int NOT NULL,
    [PrecioUnitario] decimal(18,2) NOT NULL,
    [PedidoId] int NOT NULL,
    [ProductoId] int NOT NULL,
    CONSTRAINT [PK_DetallePedido] PRIMARY KEY ([DetallePedidoId]),
    CONSTRAINT [FK_DetallePedido_Pedido_PedidoId] FOREIGN KEY ([PedidoId]) REFERENCES [Pedido] ([PedidoId]) ON DELETE CASCADE,
    CONSTRAINT [FK_DetallePedido_Producto_ProductoId] FOREIGN KEY ([ProductoId]) REFERENCES [Producto] ([ProductoId]) ON DELETE CASCADE
);

CREATE UNIQUE INDEX [IX_Carrito_UsuarioId] ON [Carrito] ([UsuarioId]);

CREATE INDEX [IX_DetalleCarrito_CarritoId] ON [DetalleCarrito] ([CarritoId]);

CREATE INDEX [IX_DetalleCarrito_ProductoId] ON [DetalleCarrito] ([ProductoId]);

CREATE INDEX [IX_DetallePedido_PedidoId] ON [DetallePedido] ([PedidoId]);

CREATE INDEX [IX_DetallePedido_ProductoId] ON [DetallePedido] ([ProductoId]);

CREATE INDEX [IX_Pedido_UsuarioId] ON [Pedido] ([UsuarioId]);

CREATE INDEX [IX_Producto_CategoriaId] ON [Producto] ([CategoriaId]);

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261014183702_Inicial', N'10.0.13');

COMMIT;
GO

BEGIN TRANSACTION;
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261014183841_AjustarPrecisionMonetaria', N'10.0.13');

COMMIT;
GO

