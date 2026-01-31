using System;

namespace Account.API.Constants;

public static class ErrorMessagePatterns
{
    public const string NotFound = "not found";
    public const string AlreadyExists = "already exists";
    public const string InvalidCredentials = "invalid credentials";
    public const string Locked = "locked";
    public const string TwoFactor = "two-factor";
    public const string Required = "required";

    public const string DefaultError = "Operation failed.";
}
