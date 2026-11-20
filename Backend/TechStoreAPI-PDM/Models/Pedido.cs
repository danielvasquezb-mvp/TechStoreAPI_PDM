namespace TechStoreAPI_PDM.Models
{
    public class Pedido
    {
        public int PedidoId { get; set; }

        public DateTime FechaPedido { get; set; } = DateTime.UtcNow;

        public decimal Total { get; set; }

        public string Estado { get; set; } = "Pendiente";

        public string DireccionEntrega { get; set; } = string.Empty;

        // Clave foránea
        public int UsuarioId { get; set; }

        // Relación
        public Usuario? Usuario { get; set; }

        public ICollection<DetallePedido> Detalles { get; set; }
            = new List<DetallePedido>();
    }
}
