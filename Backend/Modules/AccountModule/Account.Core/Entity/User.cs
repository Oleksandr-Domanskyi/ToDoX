using System;
using Microsoft.AspNetCore.Identity;

namespace Account.Core.Entity;

public class User : IdentityUser
{
    public DateTime LastUpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime RegisteredAtUtc { get; init; } = DateTime.UtcNow;
    public UserImage? accountImage { get; private set; } = new();


    public void SetImage(string url) => accountImage = new UserImage { Url = url };
}



