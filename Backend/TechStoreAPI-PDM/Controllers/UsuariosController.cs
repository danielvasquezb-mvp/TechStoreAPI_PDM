
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechStoreAPI_PDM.Models;
using TechStoreAPI_PDM.Services;

namespace TechStoreAPI_PDM.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly TechStoreContext _context;
        private readonly PasswordHasher<Usuario> _hasher = new();

        public UsuariosController(TechStoreContext context)
        {
            _context = context;
        }

        // GET: api/Usuarios
        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuarios = await _context.Usuario
                .Select(u => new
                {
                    u.UsuarioId,
                    u.Nombre,
                    u.Apellido,
                    u.Correo,
                    u.Telefono,
                    u.Direccion,
                    u.FechaRegistro,
                    u.Activo
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        // GET: api/Usuarios/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUsuario(int id)
        {
            var usuario = await _context.Usuario
                .Where(u => u.UsuarioId == id)
                .Select(u => new
                {
                    u.UsuarioId,
                    u.Nombre,
                    u.Apellido,
                    u.Correo,
                    u.Telefono,
                    u.Direccion,
                    u.FechaRegistro,
                    u.Activo
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "El usuario no existe."
                });
            }

            return Ok(usuario);
        }

        // POST: api/Usuarios
        [HttpPost]
        public async Task<IActionResult> CrearUsuario(Usuario usuario)
        {
            if (string.IsNullOrWhiteSpace(usuario.Nombre) ||
                string.IsNullOrWhiteSpace(usuario.Apellido) ||
                string.IsNullOrWhiteSpace(usuario.Correo) ||
                string.IsNullOrWhiteSpace(usuario.Password))
            {
                return BadRequest(new
                {
                    mensaje = "Nombre, apellido, correo y contraseña son obligatorios."
                });
            }

            usuario.Nombre = usuario.Nombre.Trim();
            usuario.Apellido = usuario.Apellido.Trim();
            usuario.Correo = usuario.Correo.Trim();

            bool existe = await _context.Usuario
                .AnyAsync(u => u.Correo == usuario.Correo);

            if (existe)
            {
                return Conflict(new
                {
                    mensaje = "Ya existe un usuario con ese correo."
                });
            }

            if (usuario.Password.Length < 8)
            {
                return BadRequest(new
                {
                    mensaje = "La contraseña debe tener al menos 8 caracteres."
                });
            }

            usuario.UsuarioId = 0;
            usuario.FechaRegistro = DateTime.UtcNow;
            usuario.Activo = true;
            usuario.Carrito = null;
            usuario.Pedidos = new List<Pedido>();

            usuario.Password = _hasher.HashPassword(
                usuario, usuario.Password);

            _context.Usuario.Add(usuario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetUsuario),
                new { id = usuario.UsuarioId },
                new
                {
                    usuario.UsuarioId,
                    usuario.Nombre,
                    usuario.Apellido,
                    usuario.Correo,
                    usuario.Telefono,
                    usuario.Direccion,
                    usuario.FechaRegistro,
                    usuario.Activo
                });
        }

        // PUT: api/Usuarios/5
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarUsuario(
            int id, Usuario datos)
        {
            if (id != datos.UsuarioId)
            {
                return BadRequest(new
                {
                    mensaje = "El ID de la URL no coincide con el ID del usuario."
                });
            }

            var usuario = await _context.Usuario.FindAsync(id);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "El usuario no existe."
                });
            }

            if (string.IsNullOrWhiteSpace(datos.Nombre) ||
                string.IsNullOrWhiteSpace(datos.Apellido) ||
                string.IsNullOrWhiteSpace(datos.Correo))
            {
                return BadRequest(new
                {
                    mensaje = "Nombre, apellido y correo son obligatorios."
                });
            }

            string correo = datos.Correo.Trim();

            bool correoDuplicado = await _context.Usuario
                .AnyAsync(u => u.Correo == correo &&
                               u.UsuarioId != id);

            if (correoDuplicado)
            {
                return Conflict(new
                {
                    mensaje = "El correo ya pertenece a otro usuario."
                });
            }

            if (!string.IsNullOrWhiteSpace(datos.Password) &&
                datos.Password.Length < 8)
            {
                return BadRequest(new
                {
                    mensaje = "La contraseña debe tener al menos 8 caracteres."
                });
            }

            usuario.Nombre = datos.Nombre.Trim();
            usuario.Apellido = datos.Apellido.Trim();
            usuario.Correo = correo;
            usuario.Telefono = datos.Telefono;
            usuario.Direccion = datos.Direccion;
            usuario.Activo = datos.Activo;

            if (!string.IsNullOrWhiteSpace(datos.Password))
            {
                usuario.Password = _hasher.HashPassword(
                    usuario, datos.Password);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarUsuario(int id)
        {
            var usuario = await _context.Usuario
                .Include(u => u.Carrito)
                .Include(u => u.Pedidos)
                .FirstOrDefaultAsync(u => u.UsuarioId == id);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "El usuario no existe."
                });
            }

            if (usuario.Carrito != null || usuario.Pedidos.Any())
            {
                return Conflict(new
                {
                    mensaje = "No se puede eliminar el usuario porque tiene un carrito o pedidos asociados."
                });
            }

            _context.Usuario.Remove(usuario);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        // POST: api/Usuarios/Login
        [HttpPost("Login")]
        public async Task<IActionResult> Login(
            [FromBody] Usuario datos)
        {
            if (string.IsNullOrWhiteSpace(datos.Correo) ||
                string.IsNullOrWhiteSpace(datos.Password))
            {
                return BadRequest(new
                {
                    mensaje = "El correo y la contraseña son obligatorios."
                });
            }

            string correo = datos.Correo.Trim();

            var usuario = await _context.Usuario
                .FirstOrDefaultAsync(u => u.Correo == correo);

            if (usuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "Correo o contraseña incorrectos."
                });
            }

            var resultado = _hasher.VerifyHashedPassword(
                usuario,
                usuario.Password,
                datos.Password);

            if (resultado == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new
                {
                    mensaje = "Correo o contraseña incorrectos."
                });
            }

            if (!usuario.Activo)
            {
                return Unauthorized(new
                {
                    mensaje = "La cuenta está desactivada."
                });
            }

            return Ok(new
            {
                mensaje = "Inicio de sesión exitoso.",
                usuario = new
                {
                    usuario.UsuarioId,
                    usuario.Nombre,
                    usuario.Apellido,
                    usuario.Correo,
                    usuario.Telefono,
                    usuario.Direccion,
                    usuario.FechaRegistro,
                    usuario.Activo
                }
            });
        }

    }
}
