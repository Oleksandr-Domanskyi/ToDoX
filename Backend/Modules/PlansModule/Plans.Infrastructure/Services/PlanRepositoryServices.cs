using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using FluentResults;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using Plans.Infrastructure.Mappers;
using Plans.Infrastructure.Repositories.IRepositories;
using Plans.Infrastructure.Services.IServices;
using ToDoX.Infrastructure.Database;
using ToDoX.Infrastructure.UnitOfWork;
using ToDoX.Shared.Core.Contracts;

namespace Plans.Infrastructure.Services;

public class PlanRepositoryServices : IPlanRepositoryServices
{
    private readonly IUnitOfWork<PlanShemeDbContext, IPlanRepository> _unitOfWork;
    private readonly IUserPlanAssignments _userPlanAssignments;

    public PlanRepositoryServices(IUnitOfWork<PlanShemeDbContext, IPlanRepository> unitOfWork, IUserPlanAssignments userPlanAssignments)
    {
        _userPlanAssignments = userPlanAssignments;
        _unitOfWork = unitOfWork;
    }


    public Task<Result<List<PlanDto>>> GetAllPlans(string userId, CancellationToken cancellationToken = default)
        => Result.Try(() => GetAllPlansAsync(userId, cancellationToken));

    public Task<Result<PlanDto>> GetById(Guid id, string userId)
        => GetByIdResultAsync(id, userId);

    public Task<Result> CreatePlan(CreatePlanRequest createPlanRequest, string userId, CancellationToken cancellationToken = default)
        => Result.Try(() => CreatePlanAsync(createPlanRequest, userId, cancellationToken));


    public Task<Result> UpdatePlan(UpdatePlanRequest updatePlanRequest, string userId, CancellationToken cancellationToken = default)
        => UpdatePlanResultAsync(updatePlanRequest, userId, cancellationToken);

    public Task<Result> DeletePlan(Guid id, string userId, CancellationToken cancellationToken = default)
        => DeletePlanResultAsync(id, userId, cancellationToken);

    private async Task CreatePlanAsync(CreatePlanRequest createplanRequest, string userId, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _unitOfWork.BeginTransactionAsync();

        var planEntity = PlatToDtoMapper.CreateMap(createplanRequest);
        await _unitOfWork.Repository.AddAsync(planEntity, cancellationToken);
        await _unitOfWork.SaveChangesAsync();

        var userAttach = await _userPlanAssignments.AttachPlanToUserAsync(userId, planEntity.Id, cancellationToken);
        if (userAttach.IsFailed)
        {
            await transaction.RollbackAsync();
            throw new Exception("Some problem with user Attach");
        }
        await transaction.CommitAsync();
    }

    private async Task<Result> UpdatePlanResultAsync(UpdatePlanRequest updatePlanRequest, string userId, CancellationToken cancellationToken = default)
    {
        var access = await _userPlanAssignments.UserAccessAsync(updatePlanRequest.Id, userId, cancellationToken);
        if (access.Value)
        {
            var existing = await _unitOfWork.Repository.GetByIdAsync(updatePlanRequest.Id, cancellationToken);
            if (existing is null)
                return Result.Fail($"Plan with id {updatePlanRequest.Id} not found");

            await _unitOfWork.Repository.UpdateAsync(updatePlanRequest, cancellationToken);
            await _unitOfWork.SaveChangesAsync();
            return Result.Ok();
        }
        return Result.Fail("Not Found");

    }

    private async Task<Result> DeletePlanResultAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var access = await _userPlanAssignments.UserAccessAsync(id, userId, cancellationToken);
        if (access.Value)
        {
            var existing = await _unitOfWork.Repository.GetByIdAsync(id, cancellationToken);
            if (existing is null)
                return Result.Fail($"Plan with id {id} not found");

            await _unitOfWork.Repository.DeleteAsync(id, cancellationToken);
            await _unitOfWork.SaveChangesAsync();
            return Result.Ok();
        }
        return Result.Fail("Not Found");
    }

    private async Task<Result<PlanDto>> GetByIdResultAsync(Guid id, string userId, CancellationToken cancellationToken = default)
    {
        var access = await _userPlanAssignments.UserAccessAsync(id, userId, cancellationToken);
        if (access.IsFailed)
            return Result.Fail($"User access failed: {String.Join(Environment.NewLine, access.Errors.Select(e => e.Message))}");

        if (access.Value)
        {
            var model = await _unitOfWork.Repository.GetByIdAsync(id, cancellationToken);

            if (model is null)
                return Result.Fail<PlanDto>($"Plan with id {id} not found");
            return Result.Ok(PlatToDtoMapper.MapToDto(model));
        }
        return Result.Fail("Not Found");
    }

    private async Task<List<PlanDto>> GetAllPlansAsync(string userId, CancellationToken cancellationToken = default)
    {
        var userProducts = await _userPlanAssignments.GetUserAssigment(userId, cancellationToken);

        var model = await _unitOfWork.Repository.GetAllAsync(userProducts.Value, cancellationToken);
        return PlatToDtoMapper.MapToDtoList(model);
    }
}
