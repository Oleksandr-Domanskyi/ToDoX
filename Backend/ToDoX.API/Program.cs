using System.Text.Json.Serialization;
using Plans.API.Extensions;
using Plans.Infrastructure.Extentions;
using Account.API.Extensions;
using Account.API.Endpoints;
using ToDoX.Shared.Core.Extensions;
using Asp.Versioning;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();


// Api Version
builder.Services
    .AddApiVersioning(o =>
    {
        o.DefaultApiVersion = new ApiVersion(1, 0);
        o.AssumeDefaultVersionWhenUnspecified = true;
        o.ReportApiVersions = true;
    })
    .AddApiExplorer(o =>
    {
        o.GroupNameFormat = "'v'VVV";
        o.SubstituteApiVersionInUrl = true;
    });

builder.Services.AddAccountModule(builder.Configuration);
builder.Services.AddPlansModule(builder.Configuration);
builder.Services.AddSharedInfrastructure();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", p => p
        .WithOrigins(
            "http://localhost:3000", "https://localhost:3000",
            "http://localhost:3443", "https://localhost:3443"
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = null;
    o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "ToDoX API", Version = "v1" });
});

var app = builder.Build();

var api = app.MapGroup("/api/v{version:apiVersion}");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseGlobalExceptionHandling(app.Environment);

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

api.AddPlanModuleEndpoints();
api.AddAccountEndpoints();


await app.AddAccountSeeder();

app.Run();
