using System.Security.Claims;
using Account.Core.DTO;
using Account.Core.DTO.Request;
using FluentResults;

namespace Account.Infrastructure.Services;

public interface IUserRepositoryServices
{
    Task<Result<ClaimsPrincipal>> LoginAsync(LoginRequest request);
    Task<Result<UserDto>> GetUserAsync(string email);
    Task<Result> CreateUserAsync(CreateUserRequest request);
    Task<Result> EmailComfirmAsync(string userId, string token);
    Task<Result> UpdateUserInformationAsync(string userId, UpdateUserInformationRequest request);
    Task<Result> DeleteUserAsync(string email);
    Task<Result> AttachUserPlanAsync(string userId, Guid planId, CancellationToken ct);
    Task<Result<List<Guid>>> GetUserProductsIdAsync(string userId, CancellationToken ct);
    Task<Result<bool>> UserAccessAsync(string userId, Guid planId, CancellationToken ct);
}