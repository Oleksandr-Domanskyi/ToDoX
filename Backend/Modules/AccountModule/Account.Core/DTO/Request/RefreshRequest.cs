using System;

namespace Account.Core.DTO.Request;

public sealed class RefreshRequest
{
    public string RefreshToken { get; init; } = default!;
}
