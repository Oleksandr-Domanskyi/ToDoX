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

namespace Plans.Infrastructure.Services;

public class PlanRepositoryServices : IPlanRepositoryServices
{
    private readonly IUnitOfWork<PlanShemeDbContext, IPlanRepository> _unitOfWork;

    public PlanRepositoryServices(IUnitOfWork<PlanShemeDbContext, IPlanRepository> unitOfWork)
        => _unitOfWork = unitOfWork;

    public Task<Result<List<PlanDto>>> GetAllPlans(CancellationToken cancellationToken = default)
        => Result.Try(() => GetAllPlansAsync(cancellationToken));

    public Task<Result<PlanDto>> GetById(Guid id)
        => GetByIdResultAsync(id);

    public Task<Result> CreatePlan(CreatePlanRequest createPlanRequest, CancellationToken cancellationToken = default)
        => Result.Try(() => CreatePlanAsync(createPlanRequest, cancellationToken));

    public Task<Result> UpdatePlan(UpdatePlanRequest updatePlanRequest, CancellationToken cancellationToken = default)
        => UpdatePlanResultAsync(updatePlanRequest, cancellationToken);

    public Task<Result> DeletePlan(Guid id, CancellationToken cancellationToken = default)
        => DeletePlanResultAsync(id, cancellationToken);


    private async Task CreatePlanAsync(CreatePlanRequest createplanRequest, CancellationToken cancellationToken = default)
    {
        var planEntity = PlatToDtoMapper.CreateMap(createplanRequest);
        await _unitOfWork.Repository.AddAsync(planEntity, cancellationToken);
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<Result> UpdatePlanResultAsync(UpdatePlanRequest updatePlanRequest, CancellationToken cancellationToken = default)
    {
        var existing = await _unitOfWork.Repository.GetByIdAsync(updatePlanRequest.Id, cancellationToken);
        if (existing is null)
            return Result.Fail($"Plan with id {updatePlanRequest.Id} not found");

        await _unitOfWork.Repository.UpdateAsync(updatePlanRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync();
        return Result.Ok();
    }

    private async Task<Result> DeletePlanResultAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existing = await _unitOfWork.Repository.GetByIdAsync(id, cancellationToken);
        if (existing is null)
            return Result.Fail($"Plan with id {id} not found");

        await _unitOfWork.Repository.DeleteAsync(id, cancellationToken);
        await _unitOfWork.SaveChangesAsync();
        return Result.Ok();
    }

    private async Task<Result<PlanDto>> GetByIdResultAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var model = await _unitOfWork.Repository.GetByIdAsync(id, cancellationToken);

        if (model is null)
            return Result.Fail<PlanDto>($"Plan with id {id} not found");
        return Result.Ok(PlatToDtoMapper.MapToDto(model));
    }

    private async Task<List<PlanDto>> GetAllPlansAsync(CancellationToken cancellationToken = default)
    {
        var model = await _unitOfWork.Repository.GetAllAsync(cancellationToken);
        return PlatToDtoMapper.MapToDtoList(model);
    }
}
