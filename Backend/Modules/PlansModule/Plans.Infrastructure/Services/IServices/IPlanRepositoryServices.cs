using System;
using FluentResults;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using ToDoX.Infrastructure.IRepositoryManager;

namespace Plans.Infrastructure.Services.IServices;

public interface IPlanRepositoryServices
{
    Task<Result<List<PlanDto>>> GetAllPlans(string userId, CancellationToken cancellationToken = default);
    Task<Result<PlanDto>> GetById(Guid id, string userId);
    Task<Result> CreatePlan(CreatePlanRequest createplanRequest, string userId, CancellationToken cancellationToken = default);
    Task<Result> UpdatePlan(UpdatePlanRequest updatePlanRequest, string userId, CancellationToken cancellationToken = default);
    Task<Result> DeletePlan(Guid id, string userId, CancellationToken cancellationToken = default);
}
