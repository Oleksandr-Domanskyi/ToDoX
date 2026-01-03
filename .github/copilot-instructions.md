# GitHub Copilot instructions — ToDoX

Purpose
- Help AI coding agents be immediately productive in this repository (ToDoX).

Big picture
- Solution: `ToDoX.sln` contains a single backend API project at `Backend/ToDoX.API`.
- The API is a minimal .NET 10 minimal-API app (see `Backend/ToDoX.API/Program.cs`).
- OpenAPI is enabled via the `Microsoft.AspNetCore.OpenApi` package and the `AddOpenApi`/`MapOpenApi` calls in `Program.cs`.
- There is no database or external service configured in the repository (no DB packages present). Endpoints are defined inline with `app.MapGet` style handlers.

Where to look first
- `Backend/ToDoX.API/Program.cs` — primary entrypoint and examples of endpoints (e.g. `GetWeatherForecast`).
- `Backend/ToDoX.API/ToDoX.API.csproj` — target framework (`net10.0`) and package references.
- `Backend/ToDoX.API/appsettings.json` and `appsettings.Development.json` — runtime configuration and logging levels.
- `ToDoX.sln` — use this for opening the project in Visual Studio.

Build, run and debug (examples)
- Build solution: `dotnet build ToDoX.sln`
- Run API from repo root: `dotnet run --project Backend/ToDoX.API`
- Publish: `dotnet publish -c Release -o ./publish Backend/ToDoX.API`
- Use `ASPNETCORE_ENVIRONMENT=Development` to load `appsettings.Development.json` when needed.

Project-specific conventions & patterns
- Minimal-API style: use `builder.Services` to register dependencies and `app.MapGet/MapPost` for routes.
- DTOs often use C# `record` types (see `WeatherForecast` in `Program.cs`).
- Implicit usings are enabled — prefer concise files without explicit system usings.
- Target framework is `net10.0` — avoid changing TargetFramework unless upgrading the whole repo.

Integration points & dependencies
- The only explicit package is `Microsoft.AspNetCore.OpenApi` (see project file).
- No database libraries or external APIs are present; if you add integrations, register connection strings in `appsettings.json`.

How to modify and extend
- Add services: `builder.Services.AddSingleton<IMyService, MyService>();` near the top of `Program.cs`.
- Add endpoints: follow the existing `app.MapGet("/path", handler)` pattern and return plain records/POCOs or IActionResults.
- Keep middleware order simple: `UseHttpsRedirection()` is present; add auth/middleware before mapping endpoints as needed.

Tests and CI
- No tests or CI configuration were detected. If you add tests, place them in a `tests/` folder and prefer `dotnet test` for execution.

Examples to copy from
- Small endpoint example (from `Program.cs`):
  - `app.MapGet("/weatherforecast", () => { /* returns WeatherForecast[] */ }).WithName("GetWeatherForecast");`
- OpenAPI usage is via `builder.Services.AddOpenApi()` and `app.MapOpenApi()`.

When in doubt
- Inspect `Backend/ToDoX.API/Program.cs` to follow existing minimal-API patterns.
- Keep changes localized to `Backend/ToDoX.API` unless modifying solution-level items in `ToDoX.sln`.

After you update this file
- Ask for reviewer guidance if you add external integrations (DB, auth, messaging).

If anything here is unclear, tell me which area to expand (build, runtime, endpoints, or dependencies).
