using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.DotNet.Scaffolding.Shared.Messaging;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using WebAPI.Data;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScoreController : ControllerBase
    {
        private readonly DataDbContext _context;

        public ScoreController(DataDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("Subject/Student")]
        public IActionResult AddScore(string SubjectId, string StudentId, [FromBody] string value)
        {
            if (StudentId == null || SubjectId == null || value == null)
            {
                return BadRequest("Missing infomation");
            }

            Score score = new Score();
            score.SubjectId = SubjectId;
            score.StudentId = StudentId;
            score.SubjectScore = value;
            _context.Scores.Add(score);
            _context.SaveChanges();

            return Ok(score);
        }

        [Authorize]
        [HttpGet("get-page-data")]
        public IActionResult GetPageData(int pageNumber = 1, int pageSize = 10)
        {
            var skip = (pageNumber - 1) * pageSize;

            var PageData = _context.Scores
                    .Where(s => s.SubjectScore != "null")
                 .Skip(skip)
                 .Take(pageSize)
                 .ToList();

            var TotalData = _context.Scores.Count();

            var response = new
            {
                data = PageData,
                totalData = TotalData,
                totalPage = (int)Math.Ceiling(TotalData / (double)pageSize),
            };

            return Ok(response);
        }

        [Authorize]
        [HttpPost("Enter-point")]
        public IActionResult GetEnterPointList([FromBody] List<EnterPoint> enterPointedStudents)
        {
            if (enterPointedStudents == null)
            {
                return BadRequest("Missing infomation");
            }

            foreach (EnterPoint obj in enterPointedStudents)
            {
                if (obj != null)
                {
                    var student = _context.Students.FirstOrDefault(s => s.Id == obj.StudentId);
                    var subject = _context.Subjects.FirstOrDefault(s => s.Id == obj.SubjectId);
                    if (student == null || subject == null)
                    {
                        return NotFound();
                    }
                    var score = _context.Scores.OrderBy(s => s.Id).LastOrDefault(s => s.StudentId == student.Id && s.SubjectId == subject.Id);
                    if (score == null)
                    {
                        return NotFound();
                    }
                    score.SubjectScore = obj.SubjectScore;
                    _context.SaveChanges();
                }
            }

            return Ok(new {Message = "Done."});
        }

        [Authorize]
        [HttpDelete("Subject/Student")]
        public IActionResult DeleteScore(string SubjectId, string StudentId)
        {
            var score = _context.Scores.FirstOrDefault(s => s.StudentId == StudentId && s.SubjectId == SubjectId);
            if (score == null)
            {
                return NotFound();
            }

            _context.Scores.Remove(score);
            _context.SaveChanges();

            return Ok(new {Message = "Done."});
        }

        [Authorize]
        [HttpPatch("Subject/Student")]
        public IActionResult FixScore(string SubjectId, string StudentID, string newscore)
        {
            var score = _context.Scores.FirstOrDefault(s => s.StudentId == StudentID && s.SubjectId == SubjectId);
            if (score == null)
            {
                return NotFound();
            }
            score.SubjectScore = newscore;
            _context.SaveChanges();
            return Ok(new {Message= "Done."});
        }

        [Authorize]
        [HttpGet("get-all")]
        public IActionResult GetAllScore()
        {
            var scores = _context.Scores.ToList();
            return Ok(scores);
        }

        public class EnterPoint
        {
            public string SubjectScore { get; set; }
            public string StudentId { get; set; }
            public string SubjectId { get; set; }
        }
        
    }
}
