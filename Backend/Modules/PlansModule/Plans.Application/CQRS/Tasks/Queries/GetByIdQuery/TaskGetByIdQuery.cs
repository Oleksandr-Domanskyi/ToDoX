using System;
using MediatR;
using Plans.Core.DTO;

namespace Plans.Application.CQRS.Tasks.Queries.GetByIdQuery;

public class TaskGetByIdQuery(Guid PlanId, Guid id) : IRequest<TaskDto>
{
    public Guid PlanId = PlanId;
    public Guid Id = id;
}
