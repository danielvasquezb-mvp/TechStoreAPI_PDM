namespace TechStoreAPI_PDM.Models
{
    public class Carrito
    {
        public int CarritoId { get; set; }

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        // Clave foránea
        public int UsuarioId { get; set; }

        // Relación
        public Usuario Usuario { get; set; } = null!;

        public ICollection<DetalleCarrito> Detalles { get; set; }
            = new List<DetalleCarrito>();
    }
}
