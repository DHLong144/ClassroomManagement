using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class Menu
    {
        [Key]
        public int Id { get; set; }

        public string CategoryName { get; set; }
        public string? ParentCategory { get; set; }

        public string? Url { get; set; }


    }
}
