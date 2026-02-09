using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace Plans.API.Json;

public static class PlansJson
{
    public static readonly JsonSerializerOptions Options = Create();

    private static JsonSerializerOptions Create()
    {
        var o = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        o.Converters.Add(new JsonStringEnumConverter());
        o.TypeInfoResolverChain.Add(new DefaultJsonTypeInfoResolver());

        return o;
    }
}
