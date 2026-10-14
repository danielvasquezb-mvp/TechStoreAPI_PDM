using Microsoft.EntityFrameworkCore;
using TechStoreAPI_PDM.Models;

namespace TechStoreAPI_PDM.Services
{
    public class TechStoreContext : DbContext
    {
        public TechStoreContext(DbContextOptions options) : base(options) { }

        public DbSet<Usuario> Usuario { get; set; }
        public DbSet<Producto> Producto { get; set; }
        public DbSet<Categoria> Categoria { get; set; }
        public DbSet<Carrito> Carrito { get; set; }
        public DbSet<DetalleCarrito> DetalleCarrito { get; set; }
        public DbSet<Pedido> Pedido { get; set; }
        public DbSet<DetallePedido> DetallePedido { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Producto>()
                .Property(p => p.Precio)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Pedido>()
                .Property(p => p.Total)
                .HasPrecision(18, 2);

            modelBuilder.Entity<DetallePedido>()
                .Property(p => p.PrecioUnitario)
                .HasPrecision(18, 2);
        }
    }

}
