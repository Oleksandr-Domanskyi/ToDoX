using System.Text.Json.Serialization;
using ToDoX.Infrastructure.Extensions;
using Plans.API.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddPlansModule(builder.Configuration);
builder.Services.AddSharedInfrastructure();


builder.Services.AddControllers().AddJsonOptions(o =>
     {
         o.JsonSerializerOptions.PropertyNamingPolicy = null;
         o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
     });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();
