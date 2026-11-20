namespace TechStoreAPI_PDM.Models
{
    public class DetallePedido
    {
        public int DetallePedidoId { get; set; }

        public int Cantidad { get; set; }

        public decimal PrecioUnitario { get; set; }

        // Claves foráneas
        public int PedidoId { get; set; }

        public int ProductoId { get; set; }

        // Relaciones
        public Pedido Pedido { get; set; } = null!;

        public Producto Producto { get; set; } = null!;
    }

}
