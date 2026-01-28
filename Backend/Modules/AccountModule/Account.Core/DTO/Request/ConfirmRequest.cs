using System;

namespace Account.Core.DTO.Request;

public class ConfirmRequest
{
    public string? userId { get; set; }
    public string? token { get; set; }
}
