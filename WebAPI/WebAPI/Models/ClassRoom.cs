using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPI.Models
{
    public class ClassRoom
    {

        [Key]
        public string Id { get; set; }
        public string Name { get; set; }

        [ForeignKey("Teacher")]
        public string TeacherId { get; set; }
        public Teacher Teacher { get; set; }

        [ForeignKey("Subject")]
        public string SubjectId { get; set; }
        public Subject Subject { get; set; }

    }
}
