using System.Security.Claims;
using System.Text;
using Account.Core.DTO.Request;
using Account.Core.Entity;
using FluentResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using ToDoX.Infrastructure.IRepositoryManager;

namespace Account.Infrastructure.Repositories;

public sealed class UserRepositories : IUserRepositories
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    private readonly IConfiguration _configuration;
    private readonly IEmailSender _emailSender;
    public UserRepositories(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration configuration,
        IEmailSender emailSender)
    {
        _emailSender = emailSender;
        _configuration = configuration;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    public async Task<Result<ClaimsPrincipal>> LoginAsync(LoginRequest request)
    {
        if (request is null)
            return Result.Fail("Login request is required.");

        if (!AreCredentialsValid(request.Email, request.Password))
            return Result.Fail("Email and password are required.");

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Result.Fail("Invalid credentials.");

        var signInResult = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: request.LockoutOnFailure);
        if (!signInResult.Succeeded)
        {
            return signInResult switch
            {
                { IsLockedOut: true } => Result.Fail("Account is locked. Try again later."),
                { IsNotAllowed: true } => Result.Fail("Login not allowed. Confirm your email first."),
                { RequiresTwoFactor: true } => Result.Fail("Two-factor authentication required."),
                _ => Result.Fail("Invalid credentials.")
            };
        }
        var principal = await _signInManager.CreateUserPrincipalAsync(user);
        return Result.Ok(principal);
    }

    public async Task<Result<User>> GetUserAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Fail<User>("Email is required.");

        var user = await _userManager.FindByEmailAsync(email);
        return user is null
            ? Result.Fail<User>("User not found.")
            : Result.Ok(user);
    }

    public async Task<Result> CreateUserAsync(CreateUserRequest request)
    {
        if (request is null)
            return Result.Fail("Create user request is required.");

        if (!AreCredentialsValid(request.Email, request.Password))
            return Result.Fail("Email and password are required.");

        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing is not null)
            return Result.Fail("User with this email already exists.");

        if (request.Password != request.ConfirmPassword)
            return Result.Fail("Password confirmation does not match.");

        var user = new User(request.Name, request.Email, request.ImageUrl);

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            return Result.Fail(createResult.Errors.Select(e => e.Description).ToArray());

        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            var roleResult = await _userManager.AddToRoleAsync(user, request.Role);
            if (!roleResult.Succeeded)
                return Result.Fail(roleResult.Errors.Select(e => e.Description).ToArray());
        }

        if (!string.IsNullOrWhiteSpace(request.Subscription))
        {
            var claimResult = await _userManager.AddClaimAsync(user, new Claim("subscription", request.Subscription));
            if (!claimResult.Succeeded)
                return Result.Fail(claimResult.Errors.Select(e => e.Description).ToArray());
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var tokenEncoded = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var frontendBaseUrl = _configuration["Frontend:BaseUrl"];
        if (string.IsNullOrWhiteSpace(frontendBaseUrl))
            return Result.Fail("Frontend base url is not configured.");

        var confirmUrl = $"{frontendBaseUrl.TrimEnd('/')}/confirm-email?userId={user.Id}&token={tokenEncoded}";

        var html = $@"
        <p>Hello, {System.Net.WebUtility.HtmlEncode(user.UserName ?? user.Email)}!</p>
        <p>Please confirm your email by clicking the link below:</p>
        <p><a href=""{confirmUrl}"">Confirm email</a></p>
        <p>If you did not create an account, you can ignore this email.</p>";

        await _emailSender.SendEmailAsync(user.Email!, "Confirm your email", html);

        return Result.Ok();
    }


    public async Task<Result> UpdateUserInformationAsync(string userId, UpdateUserInformationRequest request)
    {
        if (request is null)
            return Result.Fail("Update request is required.");

        if (string.IsNullOrWhiteSpace(userId))
            return Result.Fail("User id is required.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return Result.Fail("User not found.");

        var changed = false;

        if (!string.IsNullOrWhiteSpace(request.UserName) &&
            !string.Equals(user.UserName, request.UserName, StringComparison.Ordinal))
        {
            user.UserName = request.UserName;
            changed = true;
        }

        if (!string.IsNullOrWhiteSpace(request.Email) &&
            !string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailResult = await _userManager.SetEmailAsync(user, request.Email);
            if (!emailResult.Succeeded)
                return Result.Fail(emailResult.Errors.Select(e => e.Description).ToArray());

            changed = true;
        }

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber) &&
            !string.Equals(user.PhoneNumber, request.PhoneNumber, StringComparison.Ordinal))
        {
            var phoneResult = await _userManager.SetPhoneNumberAsync(user, request.PhoneNumber);
            if (!phoneResult.Succeeded)
                return Result.Fail(phoneResult.Errors.Select(e => e.Description).ToArray());
            changed = true;
        }

        if (!string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            user.SetImage(request.ImageUrl);
            changed = true;
        }

        if (!changed)
            return Result.Ok();

        user.LastUpdatedAtUtc = DateTime.UtcNow;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return Result.Fail(updateResult.Errors.Select(e => e.Description).ToArray());

        return Result.Ok();
    }


    public async Task<Result> DeleteUserAsync(string email)
    {
        var userResult = await GetUserAsync(email);
        if (userResult.IsFailed)
            return Result.Fail(userResult.Errors.Select(e => e.Message).ToArray());

        var deleteResult = await _userManager.DeleteAsync(userResult.Value);
        if (!deleteResult.Succeeded)
            return Result.Fail(deleteResult.Errors.Select(e => e.Description).ToArray());

        return Result.Ok();
    }

    private static bool AreCredentialsValid(string ctx, string ctx1)
        => !string.IsNullOrWhiteSpace(ctx) &&
           !string.IsNullOrWhiteSpace(ctx1);

    public async Task<Result> EmailComnfirmAsync(string userId, string token)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return Result.Fail("Invalid user.");

        var tokenBytes = WebEncoders.Base64UrlDecode(token);
        var tokenDecoded = Encoding.UTF8.GetString(tokenBytes);

        var result = await _userManager.ConfirmEmailAsync(user, tokenDecoded);

        return result.Succeeded
            ? Result.Ok()
            : Result.Fail(result.Errors.Select(e => e.Description));
    }

}
