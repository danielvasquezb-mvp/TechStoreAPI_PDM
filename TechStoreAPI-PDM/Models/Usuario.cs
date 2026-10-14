namespace TechStoreAPI_PDM.Models
{
    public class Usuario
    {
        public int UsuarioId { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Apellido { get; set; } = string.Empty;

        public string Correo { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string? Telefono { get; set; }

        public string? Direccion { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        public bool Activo { get; set; } = true;

        // Relaciones
        public Carrito? Carrito { get; set; }

        public ICollection<Pedido> Pedidos { get; set; }
            = new List<Pedido>();
    }
}
