using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Plans.Core.DTO.Request
{
    public sealed class ChecklistItemRequest
    {
        public string RichTextJson { get; init; } = "{}";
        public bool Done { get; init; }
    }
}