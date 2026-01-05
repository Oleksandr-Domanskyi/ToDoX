using System;
using MediatR;
using Plans.Core.DTO;

namespace Plans.Application.CQRS.Tasks.Queries.GetAllQuery;

public class TaskGetAllQuery(Guid planId) : IRequest<List<TaskDto>>
{
    public Guid PlanId = planId;
}
