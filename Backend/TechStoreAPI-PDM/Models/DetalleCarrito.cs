namespace TechStoreAPI_PDM.Models
{
    public class DetalleCarrito
    {
        public int DetalleCarritoId { get; set; }

        public int Cantidad { get; set; }

        // Claves foráneas
        public int CarritoId { get; set; }

        public int ProductoId { get; set; }

        // Relaciones
        public Carrito? Carrito { get; set; }

        public Producto? Producto { get; set; }
    }
}
