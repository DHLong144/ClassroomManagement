using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPI.Models
{
    public class ClassRoomStudent
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("ClassRoom")]
        public string ClassRoomId { get; set; }
        public ClassRoom ClassRoom { get; set; }

        [ForeignKey("Student")]
        public string StudentId { get; set; }
        public Student Student { get; set; }
    }
}
