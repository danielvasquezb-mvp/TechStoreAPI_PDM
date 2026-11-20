
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreAPI_PDM.Models;
using TechStoreAPI_PDM.Services;

namespace TechStoreAPI_PDM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarritosController : ControllerBase
    {
        private readonly TechStoreContext _context;

        public CarritosController(TechStoreContext context)
        {
            _context = context;
        }

        // GET: api/Carritos/usuario/1
        [HttpGet("usuario/{usuarioId}")]
        public async Task<IActionResult> GetCarrito(int usuarioId)
        {
            var carrito = await _context.Carrito
                .Where(c => c.UsuarioId == usuarioId)
                .Select(c => new
                {
                    c.CarritoId,
                    c.UsuarioId,
                    c.FechaCreacion,
                    Productos = c.Detalles.Select(d => new
                    {
                        d.DetalleCarritoId,
                        d.ProductoId,
                        Producto = d.Producto.Nombre,
                        d.Cantidad,
                        PrecioUnitario = d.Producto.Precio,
                        Subtotal = d.Cantidad * d.Producto.Precio
                    }),
                    Total = c.Detalles.Sum(d =>
                        d.Cantidad * d.Producto.Precio)
                })
                .FirstOrDefaultAsync();

            if (carrito == null)
            {
                return NotFound(new
                {
                    mensaje = "El carrito no existe para este usuario."
                });
            }

            return Ok(carrito);
        }

        // POST: api/Carritos/usuario/1/agregar
        [HttpPost("usuario/{usuarioId}/agregar")]
        public async Task<IActionResult> AgregarProducto(
            int usuarioId, [FromBody] DetalleCarrito detalle)
        {
            var usuario = await _context.Usuario
                .FindAsync(usuarioId);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "El usuario no existe."
                });
            }

            if (detalle.Cantidad <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "La cantidad debe ser mayor que cero."
                });
            }

            var producto = await _context.Producto
                .FindAsync(detalle.ProductoId);

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            if (!producto.Activo)
            {
                return BadRequest(new
                {
                    mensaje = "El producto no está activo."
                });
            }

            var carrito = await _context.Carrito
                .Include(c => c.Detalles)
                .FirstOrDefaultAsync(c => c.UsuarioId == usuarioId);

            if (carrito == null)
            {
                carrito = new Carrito
                {
                    UsuarioId = usuarioId,
                    FechaCreacion = DateTime.UtcNow
                };

                _context.Carrito.Add(carrito);
                await _context.SaveChangesAsync();
            }

            var detalleExistente = await _context.DetalleCarrito
                .FirstOrDefaultAsync(d =>
                    d.CarritoId == carrito.CarritoId &&
                    d.ProductoId == detalle.ProductoId);

            int cantidadFinal = detalle.Cantidad;

            if (detalleExistente != null)
            {
                cantidadFinal += detalleExistente.Cantidad;
            }

            if (cantidadFinal > producto.Stock)
            {
                return BadRequest(new
                {
                    mensaje = "La cantidad solicitada supera el stock disponible.",
                    stockDisponible = producto.Stock
                });
            }

            if (detalleExistente != null)
            {
                detalleExistente.Cantidad = cantidadFinal;
            }
            else
            {
                var nuevoDetalle = new DetalleCarrito
                {
                    CarritoId = carrito.CarritoId,
                    ProductoId = producto.ProductoId,
                    Cantidad = detalle.Cantidad
                };

                _context.DetalleCarrito.Add(nuevoDetalle);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Producto agregado al carrito.",
                carritoId = carrito.CarritoId,
                productoId = producto.ProductoId,
                cantidad = cantidadFinal
            });
        }

        // PUT: api/Carritos/1/producto/2
        [HttpPut("{carritoId}/producto/{productoId}")]
        public async Task<IActionResult> ActualizarCantidad(
            int carritoId, int productoId,
            [FromBody] DetalleCarrito datos)
        {
            if (datos.Cantidad <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "La cantidad debe ser mayor que cero."
                });
            }

            var detalle = await _context.DetalleCarrito
                .FirstOrDefaultAsync(d =>
                    d.CarritoId == carritoId &&
                    d.ProductoId == productoId);

            if (detalle == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no está en este carrito."
                });
            }

            var producto = await _context.Producto
                .FindAsync(productoId);

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            if (!producto.Activo)
            {
                return BadRequest(new
                {
                    mensaje = "El producto no está activo."
                });
            }

            if (datos.Cantidad > producto.Stock)
            {
                return BadRequest(new
                {
                    mensaje = "La cantidad solicitada supera el stock disponible.",
                    stockDisponible = producto.Stock
                });
            }

            detalle.Cantidad = datos.Cantidad;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Carritos/1/producto/2
        [HttpDelete("{carritoId}/producto/{productoId}")]
        public async Task<IActionResult> EliminarProducto(
            int carritoId, int productoId)
        {
            var detalle = await _context.DetalleCarrito
                .FirstOrDefaultAsync(d =>
                    d.CarritoId == carritoId &&
                    d.ProductoId == productoId);

            if (detalle == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no está en este carrito."
                });
            }

            _context.DetalleCarrito.Remove(detalle);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Carritos/1/vaciar
        [HttpDelete("{carritoId}/vaciar")]
        public async Task<IActionResult> VaciarCarrito(int carritoId)
        {
            var carrito = await _context.Carrito
                .Include(c => c.Detalles)
                .FirstOrDefaultAsync(c => c.CarritoId == carritoId);

            if (carrito == null)
            {
                return NotFound(new
                {
                    mensaje = "El carrito no existe."
                });
            }

            _context.DetalleCarrito.RemoveRange(carrito.Detalles);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "El carrito se vació correctamente."
            });
        }
    }
}
