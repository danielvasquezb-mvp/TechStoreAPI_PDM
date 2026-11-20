namespace TechStoreAPI_PDM.Models
{
    public class Producto
    {
        public int ProductoId { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Descripcion { get; set; } = string.Empty;

        public decimal Precio { get; set; }

        public int Stock { get; set; }

        public string? ImagenUrl { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // Clave foránea
        public int CategoriaId { get; set; }

        // Relación
        public Categoria? Categoria { get; set; }

        public ICollection<DetalleCarrito> DetallesCarrito { get; set; }
            = new List<DetalleCarrito>();

        public ICollection<DetallePedido> DetallesPedido { get; set; }
            = new List<DetallePedido>();
    }
}
