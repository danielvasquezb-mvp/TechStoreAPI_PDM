
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreAPI_PDM.Models;
using TechStoreAPI_PDM.Services;

namespace TechStoreAPI_PDM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductosController : ControllerBase
    {
        private readonly TechStoreContext _context;

        public ProductosController(TechStoreContext context)
        {
            _context = context;
        }

        // GET: api/Productos
        [HttpGet]
        public async Task<IActionResult> GetProductos()
        {
            var productos = await _context.Producto
                .Select(p => new
                {
                    p.ProductoId,
                    p.Nombre,
                    p.Descripcion,
                    p.Precio,
                    p.Stock,
                    p.ImagenUrl,
                    p.Activo,
                    p.FechaRegistro,
                    p.CategoriaId,
                    Categoria = p.Categoria.Nombre
                })
                .ToListAsync();

            return Ok(productos);
        }

        // GET: api/Productos/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProducto(int id)
        {
            var producto = await _context.Producto
                .Where(p => p.ProductoId == id)
                .Select(p => new
                {
                    p.ProductoId,
                    p.Nombre,
                    p.Descripcion,
                    p.Precio,
                    p.Stock,
                    p.ImagenUrl,
                    p.Activo,
                    p.FechaRegistro,
                    p.CategoriaId,
                    Categoria = p.Categoria.Nombre
                })
                .FirstOrDefaultAsync();

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            return Ok(producto);
        }

        // POST: api/Productos
        [HttpPost]
        public async Task<IActionResult> CrearProducto(Producto producto)
        {
            if (string.IsNullOrWhiteSpace(producto.Nombre))
            {
                return BadRequest(new
                {
                    mensaje = "El nombre del producto es obligatorio."
                });
            }

            if (producto.Precio <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "El precio debe ser mayor que cero."
                });
            }

            if (producto.Stock < 0)
            {
                return BadRequest(new
                {
                    mensaje = "El stock no puede ser negativo."
                });
            }

            var categoria = await _context.Categoria
                .FindAsync(producto.CategoriaId);

            if (categoria == null)
            {
                return BadRequest(new
                {
                    mensaje = "La categoría seleccionada no existe."
                });
            }

            producto.Nombre = producto.Nombre.Trim();

            // Evitar guardar relaciones enviadas en el JSON.
            producto.Categoria = categoria;
            producto.DetallesCarrito = new List<DetalleCarrito>();
            producto.DetallesPedido = new List<DetallePedido>();

            _context.Producto.Add(producto);
            await _context.SaveChangesAsync();

            var respuesta = new
            {
                producto.ProductoId,
                producto.Nombre,
                producto.Descripcion,
                producto.Precio,
                producto.Stock,
                producto.ImagenUrl,
                producto.Activo,
                producto.FechaRegistro,
                producto.CategoriaId,
                Categoria = categoria.Nombre
            };

            return CreatedAtAction(
                nameof(GetProducto),
                new { id = producto.ProductoId },
                respuesta
            );
        }

        // PUT: api/Productos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarProducto(
            int id, Producto producto)
        {
            if (id != producto.ProductoId)
            {
                return BadRequest(new
                {
                    mensaje = "El ID de la URL no coincide con el ID del producto."
                });
            }

            if (string.IsNullOrWhiteSpace(producto.Nombre))
            {
                return BadRequest(new
                {
                    mensaje = "El nombre del producto es obligatorio."
                });
            }

            if (producto.Precio <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "El precio debe ser mayor que cero."
                });
            }

            if (producto.Stock < 0)
            {
                return BadRequest(new
                {
                    mensaje = "El stock no puede ser negativo."
                });
            }

            var existente = await _context.Producto.FindAsync(id);

            if (existente == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            var categoria = await _context.Categoria
                .FindAsync(producto.CategoriaId);

            if (categoria == null)
            {
                return BadRequest(new
                {
                    mensaje = "La categoría seleccionada no existe."
                });
            }

            existente.Nombre = producto.Nombre.Trim();
            existente.Descripcion = producto.Descripcion;
            existente.Precio = producto.Precio;
            existente.Stock = producto.Stock;
            existente.ImagenUrl = producto.ImagenUrl;
            existente.Activo = producto.Activo;
            existente.CategoriaId = producto.CategoriaId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Productos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarProducto(int id)
        {
            var producto = await _context.Producto.FindAsync(id);

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            bool tieneDetallesCarrito = await _context.DetalleCarrito
                .AnyAsync(d => d.ProductoId == id);

            bool tieneDetallesPedido = await _context.DetallePedido
                .AnyAsync(d => d.ProductoId == id);

            if (tieneDetallesCarrito || tieneDetallesPedido)
            {
                return Conflict(new
                {
                    mensaje = "No se puede eliminar el producto porque está asociado a un carrito o pedido."
                });
            }

            _context.Producto.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
