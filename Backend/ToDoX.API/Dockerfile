# ========== Build stage ==========
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files first (for layer caching + restore)
COPY Backend/ToDoX.API/ToDoX.API.csproj Backend/ToDoX.API/

COPY Backend/Modules/AccountModule/Account.API/Account.API.csproj Backend/Modules/AccountModule/Account.API/
COPY Backend/Modules/PlansModule/Plans.API/Plans.API.csproj Backend/Modules/PlansModule/Plans.API/
COPY Backend/Modules/SharedModules/ToDoX.Infrastructure/ToDoX.Infrastructure.csproj Backend/Modules/SharedModules/ToDoX.Infrastructure/

# Restore
RUN dotnet restore Backend/ToDoX.API/ToDoX.API.csproj

# Copy the rest of the source
COPY . .

# Publish
RUN dotnet publish Backend/ToDoX.API/ToDoX.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# ========== Runtime stage ==========
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

EXPOSE 5287
ENV ASPNETCORE_URLS=http://+:5287

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ToDoX.API.dll"]
