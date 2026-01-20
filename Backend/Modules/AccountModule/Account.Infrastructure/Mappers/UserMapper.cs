using System;
using Account.Core.DTO;
using Account.Core.Entity;

namespace Account.Infrastructure.Mappers;

public static class UserMapper
{
    public static UserDto Map(User user) => new()
    {
        Id = user.Id,
        Email = user.Email!,
        UserName = user.UserName!,
        PhoneNumber = user.PhoneNumber,
        ImageUrl = UserImage.GetImage(user.accountImage),
        RegisteredAtUtc = user.RegisteredAtUtc
    };
}
