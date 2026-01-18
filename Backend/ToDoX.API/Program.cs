using System.Text.Json.Serialization;
using ToDoX.Infrastructure.Extensions;
using Plans.API.Extensions;
using Plans.API.EndPoints;
using Plans.Web.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddPlansModule(builder.Configuration);
builder.Services.AddSharedInfrastructure();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", p =>
        p.WithOrigins("http://localhost:3000", "https://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod()
    );
});

builder.Services.AddControllers().AddJsonOptions(o =>
     {
         o.JsonSerializerOptions.PropertyNamingPolicy = null;
         o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
     });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("Frontend");
app.UsePlansExceptionHandling();
app.AddPlanModuleEndpoints();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();
