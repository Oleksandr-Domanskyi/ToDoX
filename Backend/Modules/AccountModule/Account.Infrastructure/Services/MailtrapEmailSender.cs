using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Configuration;

namespace Account.Infrastructure.Services;

public sealed class MailtrapEmailSender : IEmailSender
{
    private readonly HttpClient _http;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public MailtrapEmailSender(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        var section = config.GetSection("Mailtrap");
        if (!section.Exists())
            throw new InvalidOperationException("Missing Mailtrap configuration.");

        var token = section["ApiToken"]
            ?? throw new InvalidOperationException("Missing Mailtrap:ApiToken");

        _fromEmail = section["FromEmail"]
            ?? throw new InvalidOperationException("Missing Mailtrap:FromEmail");

        _fromName = section["FromName"] ?? "ToDoX";

        _http = httpClientFactory.CreateClient(nameof(MailtrapEmailSender));
        _http.BaseAddress = new Uri("https://send.api.mailtrap.io/");
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var payload = new
        {
            from = new { email = _fromEmail, name = _fromName },
            to = new[] { new { email } },
            subject,
            html = htmlMessage
        };

        var json = JsonSerializer.Serialize(payload);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        using var resp = await _http.PostAsync("api/send", content);

        if (!resp.IsSuccessStatusCode)
        {
            var body = await resp.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"Mailtrap send failed: {(int)resp.StatusCode} {resp.ReasonPhrase}. Body: {body}");
        }
    }
}
