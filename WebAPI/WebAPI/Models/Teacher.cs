using System.ComponentModel.DataAnnotations;


namespace WebAPI.Models
{
    public class Teacher
    {

        [Key]
        public string Id { get; set; }
        public string Name { get; set; }


    }
}