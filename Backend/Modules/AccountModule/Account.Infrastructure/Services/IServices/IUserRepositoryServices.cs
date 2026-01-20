using Account.Core.DTO;
using Account.Core.DTO.Request;
using FluentResults;

namespace Account.Infrastructure.Services;

public interface IUserRepositoryServices
{
    Task<Result> LoginAsync(LoginRequest request);
    Task<Result<UserDto>> GetUserAsync(string email);
    Task<Result> CreateUserAsync(CreateUserRequest request);
    Task<Result> UpdateUserInformationAsync(string userId, UpdateUserInformationRequest request);
    Task<Result> DeleteUserAsync(string email);
}