using System;
using System.Security.Claims;
using Account.Core.DTO.Request;
using Account.Core.Entity;
using FluentResults;
using ToDoX.Core.Entity.UserPlanAssignment;
using ToDoX.Infrastructure.IRepositoryManager;

namespace Account.Infrastructure.Repositories;

public interface IUserRepositories : IRepository
{
    Task<Result<User>> GetUserAsync(string email);
    Task<Result<ClaimsPrincipal>> LoginAsync(LoginRequest request);
    Task<Result> CreateUserAsync(CreateUserRequest request);
    Task<Result> EmailComnfirmAsync(string userId, string token);
    Task<Result> UpdateUserInformationAsync(string userId, UpdateUserInformationRequest request);
    Task<Result> AttachPlanToUserAsync(UserPlanAssignment userPlanAssignment, CancellationToken ct);
    Task<Result<List<Guid>>> GetUserProductsIdAsync(string userId, CancellationToken ct);
    Task<Result> DeleteUserAsync(string email);
    Task<Result<bool>> UserAccessAsync(string userId, Guid planId);
}
