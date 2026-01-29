using System;


namespace ToDoX.Core.Entity.UserPlanAssignment;

public class UserPlanAssignment
{
    public string UserId { get; private set; } = default!;
    public Guid PlanId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    protected UserPlanAssignment() { }
    public UserPlanAssignment(string userId, Guid planId)
    {
        UserId = userId;
        PlanId = planId;
        CreatedAt = DateTime.UtcNow;
    }
}
