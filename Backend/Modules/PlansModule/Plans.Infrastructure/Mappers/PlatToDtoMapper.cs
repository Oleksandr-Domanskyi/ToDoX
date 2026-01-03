using System;
using Plans.Core.DTO;
using Plans.Core.DTO.Request;
using ToDoX.Core.Entity;

namespace Plans.Infrastructure.Mappers;

public class PlatToDtoMapper
{

    public static PlanEntity CreateMap(CreatePlanRequest request)
        => new PlanEntity(request.Name, request.Description);

    public static List<PlanDto> MapToDtoList(IEnumerable<PlanEntity> entities)
        => entities.Select(MapToDto).ToList();

    public static PlanDto MapToDto(PlanEntity entity)
        => new PlanDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            Tasks = entity.Tasks != null
                ? entity.Tasks.Select(TaskEntityToDtoMapper.MapToDto).ToList()
                : Array.Empty<TaskDto>(),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
}

