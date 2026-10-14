
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreAPI_PDM.Models;
using TechStoreAPI_PDM.Services;

namespace TechStoreAPI_PDM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PedidosController : ControllerBase
    {
        private readonly TechStoreContext _context;

        public PedidosController(TechStoreContext context)
        {
            _context = context;
        }

        // GET: api/Pedidos
        [HttpGet]
        public async Task<IActionResult> GetPedidos()
        {
            var pedidos = await _context.Pedido
                .AsNoTracking()
                .Select(p => new
                {
                    p.PedidoId,
                    p.FechaPedido,
                    p.Total,
                    p.Estado,
                    p.DireccionEntrega,
                    p.UsuarioId,
                    Detalles = p.Detalles.Select(d => new
                    {
                        d.DetallePedidoId,
                        d.ProductoId,
                        Producto = d.Producto.Nombre,
                        d.Cantidad,
                        d.PrecioUnitario,
                        Subtotal = d.Cantidad * d.PrecioUnitario
                    })
                })
                .ToListAsync();

            return Ok(pedidos);
        }

        // GET: api/Pedidos/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPedido(int id)
        {
            var pedido = await _context.Pedido
                .AsNoTracking()
                .Where(p => p.PedidoId == id)
                .Select(p => new
                {
                    p.PedidoId,
                    p.FechaPedido,
                    p.Total,
                    p.Estado,
                    p.DireccionEntrega,
                    p.UsuarioId,
                    Detalles = p.Detalles.Select(d => new
                    {
                        d.DetallePedidoId,
                        d.ProductoId,
                        Producto = d.Producto.Nombre,
                        d.Cantidad,
                        d.PrecioUnitario,
                        Subtotal = d.Cantidad * d.PrecioUnitario
                    })
                })
                .FirstOrDefaultAsync();

            if (pedido == null)
                return NotFound(new { mensaje = "El pedido no existe." });

            return Ok(pedido);
        }

        // GET: api/Pedidos/usuario/1
        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetPedidosUsuario(int usuarioId)
        {
            var usuarioExiste = await _context.Usuario
                .AnyAsync(u => u.UsuarioId == usuarioId);

            if (!usuarioExiste)
                return NotFound(new { mensaje = "El usuario no existe." });

            var pedidos = await _context.Pedido
                .AsNoTracking()
                .Where(p => p.UsuarioId == usuarioId)
                .Select(p => new
                {
                    p.PedidoId,
                    p.FechaPedido,
                    p.Total,
                    p.Estado,
                    p.DireccionEntrega,
                    Detalles = p.Detalles.Select(d => new
                    {
                        d.ProductoId,
                        Producto = d.Producto.Nombre,
                        d.Cantidad,
                        d.PrecioUnitario
                    })
                })
                .ToListAsync();

            return Ok(pedidos);
        }

        // POST: api/Pedidos/usuario/1/confirmar
        [HttpPost("usuario/{usuarioId}/confirmar")]
        public async Task<IActionResult> ConfirmarPedido(
            int usuarioId, [FromBody] Pedido datos)
        {
            if (string.IsNullOrWhiteSpace(datos.DireccionEntrega))
                return BadRequest(new
                {
                    mensaje = "La dirección de entrega es obligatoria."
                });

            var usuario = await _context.Usuario
                .FirstOrDefaultAsync(u => u.UsuarioId == usuarioId);

            if (usuario == null)
                return NotFound(new { mensaje = "El usuario no existe." });

            if (!usuario.Activo)
                return BadRequest(new { mensaje = "El usuario está inactivo." });

            var carrito = await _context.Carrito
                .Include(c => c.Detalles)
                .ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

            if (carrito == null || !carrito.Detalles.Any())
                return BadRequest(new { mensaje = "El carrito está vacío." });

            // Validar todos los productos antes de modificar el inventario.
            foreach (var detalle in carrito.Detalles)
            {
                if (detalle.Producto == null ||
                    !detalle.Producto.Activo)
                {
                    return BadRequest(new
                    {
                        mensaje = "El carrito contiene un producto inexistente o inactivo."
                    });
                }

                if (detalle.Cantidad <= 0 ||
                    detalle.Producto.Stock < detalle.Cantidad)
                {
                    return BadRequest(new
                    {
                        mensaje = $"Stock insuficiente para el producto {detalle.ProductoId}."
                    });
                }
            }

            await using var transaccion =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var pedido = new Pedido
                {
                    UsuarioId = usuarioId,
                    FechaPedido = DateTime.UtcNow,
                    Estado = "Pendiente",
                    DireccionEntrega = datos.DireccionEntrega.Trim(),
                    Total = 0
                };

                foreach (var detalle in carrito.Detalles)
                {
                    var precio = detalle.Producto.Precio;

                    pedido.Detalles.Add(new DetallePedido
                    {
                        ProductoId = detalle.ProductoId,
                        Cantidad = detalle.Cantidad,
                        PrecioUnitario = precio
                    });

                    pedido.Total += precio * detalle.Cantidad;

                    // Descontar las unidades del inventario.
                    detalle.Producto.Stock -= detalle.Cantidad;
                }

                _context.Pedido.Add(pedido);

                // Vaciar el carrito después de copiar sus productos al pedido.
                _context.DetalleCarrito.RemoveRange(carrito.Detalles);

                await _context.SaveChangesAsync();
                await transaccion.CommitAsync();

                return CreatedAtAction(
                    nameof(GetPedido),
                    new { id = pedido.PedidoId },
                    new
                    {
                        mensaje = "Pedido creado correctamente.",
                        pedido.PedidoId,
                        pedido.FechaPedido,
                        pedido.Total,
                        pedido.Estado,
                        pedido.DireccionEntrega,
                        pedido.UsuarioId
                    });
            }
            catch
            {
                await transaccion.RollbackAsync();
                throw;
            }
        }

        // PUT: api/Pedidos/5/estado
        [HttpPut("{id}/estado")]
        public async Task<IActionResult> ActualizarEstado(
            int id, [FromBody] Pedido datos)
        {
            var pedido = await _context.Pedido
                .FirstOrDefaultAsync(p => p.PedidoId == id);

            if (pedido == null)
                return NotFound(new { mensaje = "El pedido no existe." });

            var estadosPermitidos = new[]
            {
                "Pendiente",
                "Procesando",
                "Enviado",
                "Entregado",
                "Cancelado"
            };

            var nuevoEstado = estadosPermitidos.FirstOrDefault(
                e => e.Equals(datos.Estado, StringComparison.OrdinalIgnoreCase));

            if (nuevoEstado == null)
                return BadRequest(new
                {
                    mensaje = "Estado no válido.",
                    estadosPermitidos
                });

            if (pedido.Estado == "Cancelado" ||
                pedido.Estado == "Entregado")
            {
                return BadRequest(new
                {
                    mensaje = "No se puede modificar un pedido cancelado o entregado."
                });
            }

            pedido.Estado = nuevoEstado;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Estado actualizado correctamente.",
                pedido.PedidoId,
                pedido.Estado
            });
        }

        // DELETE: api/Pedidos/5
        // Solo permite eliminar pedidos pendientes y devuelve su stock.
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarPedido(int id)
        {
            var pedido = await _context.Pedido
                .Include(p => p.Detalles)
                .FirstOrDefaultAsync(p => p.PedidoId == id);

            if (pedido == null)
                return NotFound(new { mensaje = "El pedido no existe." });

            if (pedido.Estado != "Pendiente")
                return BadRequest(new
                {
                    mensaje = "Solo se pueden eliminar pedidos pendientes."
                });

            await using var transaccion =
                await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var detalle in pedido.Detalles)
                {
                    var producto = await _context.Producto
                        .FirstOrDefaultAsync(
                            p => p.ProductoId == detalle.ProductoId);

                    if (producto != null)
                        producto.Stock += detalle.Cantidad;
                }

                _context.DetallePedido.RemoveRange(pedido.Detalles);
                _context.Pedido.Remove(pedido);

                await _context.SaveChangesAsync();
                await transaccion.CommitAsync();

                return Ok(new { mensaje = "Pedido eliminado y stock restituido." });
            }
            catch
            {
                await transaccion.RollbackAsync();
                throw;
            }
        }
    }
}
