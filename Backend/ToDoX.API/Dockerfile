# ========== Build stage ==========
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files first (layer caching)
COPY Backend/ToDoX.API/ToDoX.API.csproj Backend/ToDoX.API/
COPY Backend/Modules/AccountModule/Account.API/Account.API.csproj Backend/Modules/AccountModule/Account.API/
COPY Backend/Modules/PlansModule/Plans.API/Plans.API.csproj Backend/Modules/PlansModule/Plans.API/
COPY Backend/Modules/SharedModules/ToDoX.Infrastructure/ToDoX.Infrastructure.csproj Backend/Modules/SharedModules/ToDoX.Infrastructure/

RUN dotnet restore Backend/ToDoX.API/ToDoX.API.csproj

# Copy actual source
COPY Backend/ Backend/

RUN dotnet publish Backend/ToDoX.API/ToDoX.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# ========== Runtime stage ==========
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble AS final
WORKDIR /app

EXPOSE 5287
ENV ASPNETCORE_URLS=http://+:5287

# Fix: libgssapi_krb5.so.2
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 libkrb5-3 \
    && rm -rf /var/lib/apt/lists/*

# non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

COPY --from=build /app/publish .
USER appuser

ENTRYPOINT ["dotnet", "ToDoX.API.dll"]
