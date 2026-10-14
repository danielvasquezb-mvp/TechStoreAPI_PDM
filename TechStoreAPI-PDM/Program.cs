
using Microsoft.EntityFrameworkCore;
using TechStoreAPI_PDM.Services;

var builder = WebApplication.CreateBuilder(args);

// Conexión con SQL Server
builder.Services.AddDbContext<TechStoreContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("SqlLocal"));
});

// Servicios de la API
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configuración de Swagger
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
