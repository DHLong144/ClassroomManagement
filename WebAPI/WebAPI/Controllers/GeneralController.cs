using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using System.Configuration;
using System.Data;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeneralController : ControllerBase
    {
        private readonly DataDbContext _context;
        private readonly IdGeneratorService _idGenerator;

        public GeneralController(DataDbContext context, IdGeneratorService idGenerator)
        {
            _context = context;
            _idGenerator = idGenerator;
        }

        [Authorize]
        [HttpGet("get-page-data")]
        public IActionResult GetPageData(string Role, int pageNumber = 1, int pageSize = 10)
        {
            if (Role == "teacher")
            {
                var skip = (pageNumber - 1) * pageSize;

                var PageData = _context.Teachers
                    .Skip(skip)
                    .Take(pageSize)
                    .ToList();

                var TotalData = _context.Teachers.Count();

                var response = new
                {
                    data = PageData,
                    totalData = TotalData,
                    totalPage = (int)Math.Ceiling(TotalData / (double)pageSize),
                };

                return Ok(response);
            }

            if (Role == "student")
            {
                var skip = (pageNumber - 1) * pageSize;

                var PageData = _context.Students
                    .Skip(skip)
                    .Take(pageSize)
                    .ToList();

                var TotalData = _context.Students.Count();

                var response = new
                {
                    data = PageData,
                    totalData = TotalData,
                    TotalPage = (int)Math.Ceiling(TotalData / (double)pageSize),
                };

                return Ok(response);
            }

            if (Role == "subject")
            {
                var skip = (pageNumber - 1) * pageSize;

                var PageData = _context.Subjects
                    .Skip(skip)
                    .Take(pageSize)
                    .ToList();

                var TotalData = _context.Subjects.Count();

                var response = new
                {
                    data = PageData,
                    totalData = TotalData,
                    TotalPage = (int)Math.Ceiling(TotalData / (double)pageSize),
                };

                return Ok(response);
            }

            return BadRequest();
        }

        [Authorize]
        [HttpPost("add")]
        public IActionResult Add([FromBody] Info info)
        {
            if (info == null || info.Name == null || info.Role == null)
            {
                return BadRequest("Missing information.");
            }

            if (info.Role == "teacher")
            {
                Teacher teacher = new Teacher();
                teacher.Id = _idGenerator.GenTeacherId();
                teacher.Name = info.Name;
                _context.Teachers.Add(teacher);
                _context.SaveChanges();
                return CreatedAtAction(nameof(Add), new {id = teacher.Id}, teacher);
            }

            if (info.Role == "student")
            {
                Student student = new Student();
                student.Id = _idGenerator.GenStudentId();
                student.Name = info.Name;
                _context.Students.Add(student);
                _context.SaveChanges();
                return CreatedAtAction(nameof(Add), new { id = student.Id }, student);
            }

            if (info.Role == "subject")
            {
                Subject subject = new Subject();
                subject.Id = _idGenerator.GenSubjectId();
                subject.Name = info.Name;
                _context.Subjects.Add(subject);
                _context.SaveChanges();
                return CreatedAtAction(nameof(Add), new { id = subject.Id }, subject);
            }

            return NotFound();
        }

        [Authorize]
        [HttpGet("get-info")]
        public IActionResult GetInfo(string Id)
        {
            if (Id.Substring(0, 3) == "TEA")
            {
                var teacher = _context.Teachers.FirstOrDefault(t => t.Id == Id);
                if (teacher == null)
                {
                    return NotFound();
                }
                return Ok(teacher);
            }

            if (Id.Substring(0, 3) == "STU")
            {
                var student = _context.Students.FirstOrDefault(s => s.Id == Id);
                if (student == null)
                {
                    return NotFound();
                }
                return Ok(student);
            }

            if (Id.Substring(0, 3) == "SUB")
            {
                var subject = _context.Subjects.FirstOrDefault(s => s.Id == Id);
                if (subject == null)
                {
                    return NotFound();
                }
                return Ok(subject);
            }

            return NotFound();
        }

        [Authorize]
        [HttpGet("get-all")]
        public IActionResult GetAll(string Role)
        {
            if (Role == "teacher")
            {
                var teacher = _context.Teachers.ToList();
                return Ok(teacher);
            }

            if (Role == "student")
            {
                var student = _context.Students.ToList();
                return Ok(student);
            }

            if (Role == "subject")
            {
                var subject = _context.Subjects.ToList();
                return Ok(subject);
            }

            return NotFound();
        }

        [Authorize]
        [HttpDelete]
        public IActionResult Delete(string Id)
        {
            if (string.IsNullOrEmpty(Id))
            {
                return BadRequest("Id is required.");
            }

            if (Id.Substring(0, 3) == "TEA")
            {
                var teacher = _context.Teachers.FirstOrDefault(t => t.Id == Id);
                if (teacher == null)
                {
                    return NotFound(); 
                }
                _context.Teachers.Remove(teacher);
                _context.SaveChanges();
            }

            if (Id.Substring(0, 3) == "STU")
            {
                var student = _context.Students.FirstOrDefault(t => t.Id == Id);
                if (student == null)
                {
                    return NotFound();
                }
                _context.Students.Remove(student);
                _context.SaveChanges();
            }

            if (Id.Substring(0, 3) == "SUB")
            {
                var subject = _context.Subjects.FirstOrDefault(t => t.Id == Id);
                if (subject == null)
                {
                    return NotFound();
                }
                _context.Subjects.Remove(subject);
                _context.SaveChanges();
            }

            return Ok(new {Message = "Done."}); 
        }

        [Authorize]
        [HttpPatch]
        public IActionResult Update(string Id, [FromBody] InfoForEdit info)
        {
            if (Id.Substring(0, 3) == "TEA")
            {
                var teacher = _context.Teachers.FirstOrDefault(t => t.Id == Id);
                if (teacher == null)
                {
                    return NotFound();
                }
                teacher.Name = info.Name;
                _context.SaveChanges();
                return Ok(new {Message = "Done."});
            }

            if (Id.Substring(0, 3) == "STU")
            {
                var student = _context.Students.FirstOrDefault(t => t.Id == Id);
                if (student == null)
                {
                    return NotFound();
                }
                student.Name = info.Name;
                _context.SaveChanges();
                return Ok(new { Message = "Done." });
            }

            if (Id.Substring(0, 3) == "SUB")
            {
                var subject = _context.Subjects.FirstOrDefault(t => t.Id == Id);
                if (subject == null)
                {
                    return NotFound();
                }
                subject.Name = info.Name;
                _context.SaveChanges();
                return Ok(new { Message = "Done." });
            }

            return NotFound();
        }
    }

    public class Info 
    {
        public string Name { get; set; }
        public string Role { get; set; }
    }

    public class InfoForEdit
    {
        public string Name { get; set; }

    }
}
