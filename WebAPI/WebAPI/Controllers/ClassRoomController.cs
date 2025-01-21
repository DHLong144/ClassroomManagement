using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ClassRoomController : ControllerBase
    {
        private readonly DataDbContext _context;
        private readonly IdGeneratorService _idGenerator;

        public ClassRoomController(DataDbContext context, IdGeneratorService idGenerator)
        {
            _context = context;
            _idGenerator = idGenerator;
        }

        [Authorize]
        [HttpPost("add")]
        public IActionResult Add([FromBody] Room room)
        {
            if (room == null || room.TeacherId == null || room.SubjectId == null)
            {
                return BadRequest("Missing infomation");
            }

            Subject? subject = _context.Subjects.FirstOrDefault(s => s.Id == room.SubjectId);
            if (subject == null)
            {
                return NotFound("Subject does not exist");
            }

            Teacher? teacher = _context.Teachers.FirstOrDefault(t => t.Id == room.TeacherId);
            if (teacher == null)
            {
                return NotFound("Teacher does not exist");
            }    

            ClassRoom classroom = new ClassRoom
            {
                Id = _idGenerator.GenClassRoomId(),
                SubjectId = room.SubjectId,
                TeacherId = room.TeacherId,
                Name = subject.Name,
            };

            _context.ClassRooms.Add(classroom);
            _context.SaveChanges();

            return CreatedAtAction(nameof(Add), new { id = classroom.Id }, classroom);
        }

        [Authorize]
        [HttpGet("get-page-data")]
        public IActionResult GetPageData(int pageNumber = 1, int pageSize = 10)
        {
            var skip = (pageNumber - 1) * pageSize;

            var PageData = _context.ClassRooms
                 .Skip(skip)
                 .Take(pageSize)
                 .ToList();

            var TotalData = _context.ClassRooms.Count();

            var response = new
            {
                 data = PageData,
                 totalData = TotalData,
                 totalPage = (int)Math.Ceiling(TotalData / (double)pageSize),
            };

            return Ok(response);
        }

        [Authorize]
        [HttpPost("class/student")]
        public IActionResult AddStudent(string classId, [FromBody] List<string> studentIds)
        {
            var classroom = _context.ClassRooms.FirstOrDefault(c => c.Id == classId);
            if (classroom == null)
            {
                return NotFound();
            }
            foreach (var studentId in studentIds)
            {
                var studentindata = _context.Students.FirstOrDefault(s => s.Id == studentId);
                var studentinclass = _context.ClassRoomsStudents.FirstOrDefault(s => s.StudentId == studentId && s.ClassRoomId == classId);
                if (studentindata != null && studentinclass == null)
                {
                    ClassRoomStudent classRoomStudent = new ClassRoomStudent
                    {
                        ClassRoomId = classId,
                        StudentId = studentId,
                    };
                    _context.ClassRoomsStudents.Add(classRoomStudent);

                    Score newscore = new Score
                    {
                        SubjectScore = "null",
                        SubjectId = classroom.SubjectId,
                        StudentId = studentId
                    };
                    _context.Scores.Add(newscore);
                }
            }
            _context.SaveChanges();

            var nowstudentIds = _context.ClassRoomsStudents.Where(c => c.ClassRoomId == classId).Select(s => s.StudentId).ToList();
            return Ok(nowstudentIds);
        }

        [Authorize]
        [HttpDelete("class/student")]
        public IActionResult DeleteStudent(string classId, string studentId)
        {
            var classroom = _context.ClassRooms.FirstOrDefault(c => c.Id == classId);
            var student = _context.ClassRoomsStudents.FirstOrDefault(s => s.ClassRoomId == classId && s.StudentId == studentId);
            if (classroom == null || student == null)
            {
                return NotFound();
            }
            _context.ClassRoomsStudents.Remove(student);
            _context.SaveChanges();

            var studentIds = _context.ClassRoomsStudents.Where(c => c.ClassRoomId == classId).Select(s => s.StudentId).ToList();
            return Ok(studentIds);
        }

        [Authorize]
        [HttpGet("get-all")]
        public IActionResult GetAll()
        {
            var classroom = _context.ClassRooms.ToList();
            return Ok(classroom);
        }

        [Authorize]
        [HttpGet("class")]
        public IActionResult ClassInfo(string classId)
        {
            var classroom = _context.ClassRooms.Include(c => c.Subject).Include(c => c.Teacher).FirstOrDefault(c => c.Id == classId);
            if (classroom == null)
            {
                return NotFound();
            }

            var studentIds = _context.ClassRoomsStudents.Where(c => c.ClassRoomId == classId).Select(s => s.StudentId).ToList();

            var students = _context.Students.Where(s => studentIds.Contains(s.Id)).ToList();

            return Ok(new { students });
        }

        [Authorize]
        [HttpGet("studentlist")]
        public IActionResult StudentList()
        {
            var studentlist = _context.ClassRoomsStudents.ToList();

            return Ok(new { studentlist });
        }

        [Authorize]
        [HttpDelete("class")]
        public IActionResult DeleteClass(string classId)
        {
            var classroom = _context.ClassRooms.FirstOrDefault(c => c.Id == classId);
            if (classroom == null)
            {
                return NotFound();
            }
            _context.ClassRooms.Remove(classroom);
            _context.SaveChanges();
            return Ok(new { Message = "Done." });
        }

        [Authorize]
        [HttpPatch("Class/switchteacher")]
        public IActionResult SwitchTeacher(string ClassId, string newTeacherId)
        {
            var room = _context.ClassRooms.FirstOrDefault(r => r.Id == ClassId);
            if (room == null)
            {
                return NotFound();
            }
            room.TeacherId = newTeacherId;
            _context.SaveChanges();

            return Ok(room);
        }


        public class Room
        {
            public string TeacherId { get; set; }
            public string SubjectId { get; set; }
        }
    }
}
