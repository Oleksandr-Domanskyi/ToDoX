namespace Account.Core.Entity;

public class UserImage
{
    public string Url { get; init; } = "";

    public static string? GetImage(UserImage? userImage)
    {
        if (userImage is null)
            return null;

        else if (string.IsNullOrWhiteSpace(userImage.Url))
            return null;

        return userImage.Url;
    }
}