using System.Data.Common;
using FluentResults;

namespace ToDoX.Shared.Core.Contracts;

public interface IUserPlanAssignments
{

    Task<Result> AttachPlanToUserAsync(string userId, Guid planId, CancellationToken ct);
    Task<Result<List<Guid>>> GetUserAssigment(string userId, CancellationToken ct);
    Task<Result<bool>> UserAccessAsync(Guid productId, string userId, CancellationToken ct);
}

