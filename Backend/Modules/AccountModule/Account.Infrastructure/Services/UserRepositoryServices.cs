using System;
using System.Security.Claims;
using Account.Core.DTO;
using Account.Core.DTO.Request;
using Account.Core.Entity;
using Account.Infrastructure.Database;
using Account.Infrastructure.Mappers;
using Account.Infrastructure.Repositories;
using FluentResults;
using ToDoX.Infrastructure.UnitOfWork;

namespace Account.Infrastructure.Services;

public sealed class UserRepositoryServices : IUserRepositoryServices
{
    private readonly IUnitOfWork<AccountDbContext, IUserRepositories> _unitOfWork;

    public UserRepositoryServices(IUnitOfWork<AccountDbContext, IUserRepositories> unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ClaimsPrincipal>> LoginAsync(LoginRequest request)
        => await _unitOfWork.Repository.LoginAsync(request);

    public async Task<Result> EmailComfirmAsync(string userId, string token)
        => await _unitOfWork.Repository.EmailComnfirmAsync(userId, token);

    public async Task<Result<UserDto>> GetUserAsync(string email)
    {
        var result = await _unitOfWork.Repository.GetUserAsync(email);
        if (result.IsFailed)
            return Result.Fail<UserDto>(result.Errors);

        return Result.Ok(UserMapper.Map(result.Value));
    }
    public async Task<Result> CreateUserAsync(CreateUserRequest request)
        => await _unitOfWork.Repository.CreateUserAsync(request);

    public async Task<Result> UpdateUserInformationAsync(string userId, UpdateUserInformationRequest request)
        => await _unitOfWork.Repository.UpdateUserInformationAsync(userId, request);

    public async Task<Result> DeleteUserAsync(string email)
        => await _unitOfWork.Repository.DeleteUserAsync(email);
}
