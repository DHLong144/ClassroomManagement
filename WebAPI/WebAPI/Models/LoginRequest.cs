using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class LoginRequest
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
