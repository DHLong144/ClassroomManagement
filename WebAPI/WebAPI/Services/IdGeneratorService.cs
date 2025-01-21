using Microsoft.CodeAnalysis.FlowAnalysis.DataFlow;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;

namespace WebAPI.Services
{
    public class IdGeneratorService
    {
        private readonly DataDbContext _context;

        public IdGeneratorService(DataDbContext context)
        {
            _context = context;
        }

        public string GenTeacherId()
        {
            return "TEA" + GetLastId(_context.Teachers);
        }

        public string GenStudentId()
        {
            return "STU" + GetLastId(_context.Students);
        }

        public string GenClassRoomId()
        {
            return "CLA" + GetLastId(_context.ClassRooms);
        }

        public string GenSubjectId()
        {
            return "SUB" + GetLastId(_context.Subjects);
        }

        private string GetLastId<T>(DbSet<T> dbSet) where T : class
        {
            var lastId = dbSet.OrderByDescending(e => EF.Property<string>(e, "Id"))
                      .Select(e => EF.Property<string>(e, "Id"))
                      .FirstOrDefault();
            if (lastId == null)
            {
                return "001";
            }
            int count = int.Parse(lastId.Substring(lastId.Length - 3));
            int intId = count + 1;
            return intId.ToString("D3");
        }
    }
}
