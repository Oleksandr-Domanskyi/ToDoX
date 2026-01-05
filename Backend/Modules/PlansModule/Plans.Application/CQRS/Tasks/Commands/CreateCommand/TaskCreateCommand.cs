using System;
using MediatR;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Tasks.Commands.CreateCommand;

public class TaskCreateCommand(CreateTaskRequest request) : IRequest
{
    public CreateTaskRequest Request = request;
}
