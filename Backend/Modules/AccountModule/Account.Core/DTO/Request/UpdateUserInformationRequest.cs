using System;

namespace Account.Core.DTO.Request;

public class UpdateUserInformationRequest
{
    public string? UserName { get; init; }
    public string? Email { get; init; }
    public string? PhoneNumber { get; init; }
    public string? ImageUrl { get; init; }
}
