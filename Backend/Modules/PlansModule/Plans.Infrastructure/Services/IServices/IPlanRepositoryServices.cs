using System;
using FluentResults;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using ToDoX.Infrastructure.IRepositoryManager;

namespace Plans.Infrastructure.Services.IServices;

public interface IPlanRepositoryServices
{
    Task<Result<List<PlanDto>>> GetAllPlans(CancellationToken cancellationToken = default);
    Task<Result<PlanDto>> GetById(Guid id);
    Task<Result> CreatePlan(CreatePlanRequest createplanRequest, CancellationToken cancellationToken = default);
    Task<Result> UpdatePlan(UpdatePlanRequest updatePlanRequest, CancellationToken cancellationToken = default);
    Task<Result> DeletePlan(Guid id, CancellationToken cancellationToken = default);
}
