using System;
using Account.Core.Entity;
using Account.Core.Enums;

namespace Account.Core.DTO.Request;

public sealed class CreateUserRequest
{
    public string Name { get; init; } = default!;
    public string Email { get; init; } = default!;
    public string Password { get; init; } = default!;
    public string ConfirmPassword { get; init; } = default!;
    public string Role { get; init; } = Roles.User.ToString();
    public string Subscription { get; init; } = Subscriptions.Default.ToString();
    public string ImageUrl { get; init; } = string.Empty;
}
