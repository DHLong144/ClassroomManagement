using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Framework;
using Microsoft.IdentityModel.Tokens;
using System.ComponentModel.DataAnnotations;
using System.Drawing.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebAPI.Data;
using WebAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class LoginController : ControllerBase
{
    private readonly DataDbContext _context;
    private readonly IConfiguration _configuration;

    public LoginController(DataDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost]
    public IActionResult Login([FromBody] LoginRequest request)
    {

        User? user = _context.Users.FirstOrDefault(u => u.Name == request.Name && u.Password == request.Password);

        if (user == null)
        {
            return Unauthorized("Invalid name or password");
        }
        else
        {
            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }
    }
    [Authorize]
    [HttpGet("userinfo")]
    public IActionResult GetUserInfo()
    {
        var userName = HttpContext.User.FindFirst("Sub")?.Value;
        if (userName == null)
        {
            return Unauthorized("Invalid token");
        }
        var user = _context.Users.SingleOrDefault(u => u.Name == userName);
        if (user == null)
        {
            return NotFound("User not found");
        }

        return Ok(new
        {
            user.Id,
            user.Name,
            user.Phone,
            user.Email,
            user.Address
        });
    }

    private string GenerateJwtToken(User user)
    {
    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.NameId, user.Id),
            new Claim("Sub", user.Name),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddMinutes(60),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
    }
}



