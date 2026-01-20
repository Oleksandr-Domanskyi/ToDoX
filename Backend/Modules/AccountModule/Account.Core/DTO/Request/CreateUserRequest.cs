using System;

namespace Account.Core.DTO.Request;

public sealed class CreateUserRequest
{
    public string Name { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string Password { get; init; } = default!;
    public string ConfirmPassword { get; init; } = default!;
    public string? Role { get; init; }
    public string? Subscription { get; init; }
}
