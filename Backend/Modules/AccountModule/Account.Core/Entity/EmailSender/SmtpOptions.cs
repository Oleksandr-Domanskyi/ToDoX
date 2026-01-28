using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Account.Core.Entity
{
    public sealed class SmtpOptions
    {
        public string Host { get; set; } = default!;
        public int Port { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;

        public string Username { get; set; } = default!;
        public string Password { get; set; } = default!;

        public string FromEmail { get; set; } = default!;
        public string FromName { get; set; } = "ToDoX";
    }
}