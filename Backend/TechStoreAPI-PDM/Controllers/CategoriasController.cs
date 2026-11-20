
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreAPI_PDM.Models;
using TechStoreAPI_PDM.Services;

namespace TechStoreAPI_PDM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly TechStoreContext _context;

        public CategoriasController(TechStoreContext context)
        {
            _context = context;
        }

        // GET: api/Categorias
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
        {
            return await _context.Categoria.ToListAsync();
        }

        // GET: api/Categorias/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Categoria>> GetCategoria(int id)
        {
            var categoria = await _context.Categoria.FindAsync(id);

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensaje = "La categoría no existe."
                });
            }

            return Ok(categoria);
        }

        // POST: api/Categorias
        [HttpPost]
        public async Task<ActionResult<Categoria>> CrearCategoria(
            Categoria categoria)
        {
            if (string.IsNullOrWhiteSpace(categoria.Nombre))
            {
                return BadRequest(new
                {
                    mensaje = "El nombre de la categoría es obligatorio."
                });
            }

            categoria.Nombre = categoria.Nombre.Trim();

            bool existe = await _context.Categoria
                .AnyAsync(c => c.Nombre == categoria.Nombre);

            if (existe)
            {
                return Conflict(new
                {
                    mensaje = "Ya existe una categoría con ese nombre."
                });
            }

            _context.Categoria.Add(categoria);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCategoria),
                new { id = categoria.CategoriaId },
                categoria
            );
        }

        // PUT: api/Categorias/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarCategoria(
            int id, Categoria categoria)
        {
            if (id != categoria.CategoriaId)
            {
                return BadRequest(new
                {
                    mensaje = "El ID de la URL no coincide con el ID de la categoría."
                });
            }

            if (string.IsNullOrWhiteSpace(categoria.Nombre))
            {
                return BadRequest(new
                {
                    mensaje = "El nombre de la categoría es obligatorio."
                });
            }

            var existente = await _context.Categoria.FindAsync(id);

            if (existente == null)
            {
                return NotFound(new
                {
                    mensaje = "La categoría no existe."
                });
            }

            string nombre = categoria.Nombre.Trim();

            bool nombreDuplicado = await _context.Categoria
                .AnyAsync(c => c.Nombre == nombre
                    && c.CategoriaId != id);

            if (nombreDuplicado)
            {
                return Conflict(new
                {
                    mensaje = "Ya existe otra categoría con ese nombre."
                });
            }

            existente.Nombre = nombre;
            existente.Descripcion = categoria.Descripcion;
            existente.Activa = categoria.Activa;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Categorias/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarCategoria(int id)
        {
            var categoria = await _context.Categoria
                .FindAsync(id);

            if (categoria == null)
            {
                return NotFound(new
                {
                    mensaje = "La categoría no existe."
                });
            }

            bool tieneProductos = await _context.Producto
                .AnyAsync(p => p.CategoriaId == id);

            if (tieneProductos)
            {
                return Conflict(new
                {
                    mensaje = "No se puede eliminar la categoría porque tiene productos asociados."
                });
            }

            _context.Categoria.Remove(categoria);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
