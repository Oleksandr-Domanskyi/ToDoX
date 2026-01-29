using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Plans.Application.Services.IServices;

namespace Plans.Application.Services;

public class CurrentUserId : ICurrentUserId
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserId(IHttpContextAccessor http)
        => _http = http;

    public string UserId =>
        _http.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("UserId claim is missing");
}
