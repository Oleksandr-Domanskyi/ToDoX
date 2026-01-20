using System;

namespace Account.Core.DTO;

public sealed class UserDto
{
    public string Id { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string UserName { get; init; } = default!;
    public string? PhoneNumber { get; init; }
    public string? ImageUrl { get; init; }
    public DateTime RegisteredAtUtc { get; init; }
}