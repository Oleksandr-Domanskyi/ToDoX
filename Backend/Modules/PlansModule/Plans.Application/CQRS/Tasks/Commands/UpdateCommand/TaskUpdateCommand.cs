using System;
using MediatR;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;

namespace Plans.Application.CQRS.Tasks.Commands.UpdateCommand;

public class TaskUpdateCommand(TaskDto request) : IRequest
{
    public TaskDto Request = request;
}
