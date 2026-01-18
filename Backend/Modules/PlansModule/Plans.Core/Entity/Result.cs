using System.Collections.Generic;
using System.Linq;
using FluentValidation.Results;

namespace Plans.Core.Entity
{
    public sealed class Result
    {
        public bool IsSuccess { get; }
        public IReadOnlyDictionary<string, string[]> Errors { get; }

        private Result(bool isSuccess, IReadOnlyDictionary<string, string[]> errors)
        {
            IsSuccess = isSuccess;
            Errors = errors;
        }

        public static Result Success() =>
            new(true, new Dictionary<string, string[]>());

        public static Result ValidationError(IEnumerable<ValidationFailure> failures) =>
            new(false,
                failures
                    .GroupBy(f => f.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(f => f.ErrorMessage).ToArray()
                    ));
        public static Result Failure(string key, IEnumerable<string> errors) =>
            new(false, new Dictionary<string, string[]>
            {
                [string.IsNullOrWhiteSpace(key) ? "Error" : key] =
                    (errors ?? Enumerable.Empty<string>())
                    .Where(e => !string.IsNullOrWhiteSpace(e))
                    .ToArray()
            });
        public static Result Failure(string key, string error) =>
            Failure(key, new[] { error });
    }
}
