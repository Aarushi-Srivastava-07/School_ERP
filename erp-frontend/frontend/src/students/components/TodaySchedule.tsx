import type { FC } from "react";

// Define the shape of a schedule entry – helps TS catch typos
interface ScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

// Static data – will be replaced by an API call later
const schedule: ScheduleItem[] = [
  { time: "08:00 AM", subject: "Mathematics", teacher: "Mrs. Sunita Mishra", room: "201" },
  { time: "09:00 AM", subject: "Science", teacher: "Mr. Rajiv Pandey", room: "Physics Lab" },
  { time: "10:00 AM", subject: "English", teacher: "Ms. Vandana Nair", room: "201" },
];

const TodaySchedule: FC = () => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Today's Schedule</h3>
      
      <div className="space-y-0">
        {schedule.map((item, idx) => {
          const isCurrent = idx === 0;
          return (
            <div key={idx} className="flex relative">
              {/* Timeline Line */}
              {idx !== schedule.length - 1 && (
                <div className="absolute left-[64px] sm:left-[70px] top-8 bottom-[-24px] w-0.5 bg-gray-100"></div>
              )}
              
              {/* Time */}
              <div className="w-[50px] sm:w-[60px] pt-4 text-right pr-3 sm:pr-4">
                <span className="text-xs font-semibold text-gray-500 whitespace-pre-line leading-tight block">
                  {item.time.replace(' ', '\n')}
                </span>
              </div>
              
              {/* Timeline Indicator */}
              <div className="relative pt-4 px-1 sm:px-2">
                <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 bg-white relative z-10 ${isCurrent ? 'border-blue-500' : 'border-gray-300'}`}></div>
              </div>
              
              {/* Card */}
              <div className="flex-1 pb-6 pl-3 sm:pl-4 pt-1">
                <div className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  isCurrent 
                    ? 'bg-blue-50/50 border-blue-200 shadow-md' 
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}>
                  <h4 className={`text-sm font-semibold ${isCurrent ? 'text-blue-800' : 'text-gray-800'}`}>{item.subject}</h4>
                  <p className="text-xs text-gray-500 mt-1">{item.teacher} • {item.room}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaySchedule;
