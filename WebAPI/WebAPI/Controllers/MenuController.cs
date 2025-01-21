using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Services;
namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly DataDbContext _context;

        public MenuController(DataDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("add")]
        public IActionResult AddCategory(string categoryName, string? url, string? parentCategory)
        {
            if (categoryName == null)
            {
                return BadRequest();
            }
            Menu menu = new Menu();
            menu.CategoryName = categoryName;
                menu.Url = url;
                menu.ParentCategory = parentCategory;
            _context.Menu.Add(menu);
            _context.SaveChanges();
            return Ok(menu);
        }


        [Authorize]
        [HttpGet("get-page-data")]
        public IActionResult GetPageData(int pageNumber = 1, int pageSize = 10)
        {
            var skip = (pageNumber - 1) * pageSize;

            var PageData = _context.Menu
                 .Skip(skip)
                 .Take(pageSize)
                 .ToList();

            var TotalData = _context.Menu.Count();

            var response = new
            {
                data = PageData,
                totalData = TotalData,
                totalPage = (int)Math.Ceiling(TotalData / (double)pageSize),
            };

            return Ok(response);
        }

        [Authorize]
        [HttpGet("get-all")]
        public IActionResult GetAll()
        {
            var categories = _context.Menu.ToList();

            return Ok(categories);
        }

        [Authorize]
        [HttpPatch("edit")]
        public IActionResult EditCategory(int id, string name, string url, string parentCategory)
        {
            Menu? menu = _context.Menu.FirstOrDefault(m => m.Id == id);
            if (menu == null)
            {
                return NotFound();
            }
            menu.Url = url;
            menu.CategoryName = name;
            menu.ParentCategory = parentCategory;
            _context.SaveChanges();
            return Ok(menu);
        }

        [Authorize]
        [HttpDelete("delete")]
        public IActionResult DeleteCategory(int id)
        {
            Menu? menu = _context.Menu.FirstOrDefault(m => m.Id == id);
            if (menu == null)
            {
                return NotFound();
            }
            DeleteChildCategories(menu.CategoryName);
            _context.Menu.Remove(menu);
            _context.SaveChanges();
            return Ok(new {Message = "Done."});
        }

        private void DeleteChildCategories(string parentCategoryName)
        {
            var childrens = _context.Menu.Where(c => c.ParentCategory == parentCategoryName).ToList();
            foreach (var child in childrens)
            {
                DeleteChildCategories(child.CategoryName);
                _context.Menu.Remove(child);
            }
        }
    }
}
