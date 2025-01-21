using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class Student
    {

        [Key]
        public string Id { get; set; }

        public string Name { get; set; }

    }
}
