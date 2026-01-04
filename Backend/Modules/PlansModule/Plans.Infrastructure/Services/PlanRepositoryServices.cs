using System;
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
    public PlanRepositoryServices(IUnitOfWork<PlanShemeDbContext, IPlanRepository> unitOfWork) => _unitOfWork = unitOfWork;


    public async Task<Result<List<PlanDto>>> GetAllPlans() => await Result.Try(async Task () => await GetAllPlansAsync());
    public async Task<Result<PlanDto>> GetById(Guid id) => await Result.Try(async Task () => await GetByIdAsync(id));
    public async Task<Result> CreatePlan(CreatePlanRequest createplanRequest) => await Result.Try(async Task () => await CreatePlanAsync(createplanRequest));
    public async Task<Result> UpdatePlan(UpdatePlanRequest updatePlanRequest) => await Result.Try(async Task () => await UpdatePlanAsync(updatePlanRequest));
    public async Task<Result> DeletePlan(Guid id) => await Result.Try(async Task () => await DeletePlanAsync(id));

    private async Task CreatePlanAsync(CreatePlanRequest createplanRequest)
    {
        var planEntity = PlatToDtoMapper.CreateMap(createplanRequest);
        await _unitOfWork.Repository.AddAsync(planEntity);
        await _unitOfWork.SaveChangesAsync();
    }
    private async Task UpdatePlanAsync(UpdatePlanRequest updatePlanRequest)
    {
        await _unitOfWork.Repository.UpdateAsync(updatePlanRequest);
        await _unitOfWork.SaveChangesAsync();
    }
    private async Task DeletePlanAsync(Guid id)
    {
        await _unitOfWork.Repository.DeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();
    }
    private async Task<PlanDto> GetByIdAsync(Guid id)
    {
        var model = await _unitOfWork.Repository.GetByIdAsync(id);
        return PlatToDtoMapper.MapToDto(model);
    }
    private async Task<List<PlanDto>> GetAllPlansAsync()
    {
        var model = await _unitOfWork.Repository.GetAllAsync();
        return PlatToDtoMapper.MapToDtoList(model);
    }
}
