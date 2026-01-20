using System;

namespace Account.Core.DTO.Request;

public class LoginRequest
{
    public string Email { get; set; } = default!;
    public string Password { get; set; } = default!;
    public bool IsPersistent { get; set; } = false;
    public bool LockoutOnFailure { get; set; } = false;
}
