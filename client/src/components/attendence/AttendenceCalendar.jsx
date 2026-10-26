import { useGetHolidaysQuery } from "@/hooks/empHooks";
import { dateFormat } from "@/utils/helperfn";
import { useState, useMemo } from "react";

function AttendanceCalendar({ records = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: holidaysData } = useGetHolidaysQuery();
  const holidays = holidaysData || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 1. Map records by "YYYY-MM-DD" for instant O(1) lookup
  const recordsByDate = useMemo(() => {
    const map = {};
    records.forEach((rec) => {
      if (!rec?.createdAt) return;
      const d = new Date(rec.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      map[key] = rec;
    });
    return map;
  }, [records]);

  // 2. Map holidays by "YYYY-MM-DD" for instant O(1) lookup
  const holidaysByDate = useMemo(() => {
    const map = {};
    holidays.forEach((hol) => {
      if (!hol?.date) return;
      const d = new Date(hol.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      map[key] = hol;
    });
    return map;
  }, [holidays]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col p-3 max-w-5xl w-full mx-auto gap-4 rounded-2xl border-base-400 pt- bg-gray-200">
      {/* Calendar Header & Month Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-base text-base-content">{monthName}</h3>
          <span className="badge badge-neutral badge-sm font-semibold">
            {records.length} {records.length === 1 ? "Log" : "Logs"}
          </span>
        </div>

        {/* Global Status Legend */}
        <div className="hidden md:flex gap-4 justify-center *:flex *:items-center *:gap-2 text-sm font-medium">
          <div>
            <div aria-label="success" className="status status-lg status-success"></div>
            <span>Present</span>
          </div>
          <div>
            <div aria-label="warning" className="status status-lg status-warning"></div>
            <span>Half-day</span>
          </div>
          <div>
            <div aria-label="warning" className="status status-lg status-error"></div>
            <span>Absent</span>
          </div>
          <div>
            <div aria-label="error" className="status status-lg bg-red-700"></div>
            <span>Holidays</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="btn btn-xs btn-ghost border border-base-300"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={goToToday}
            className="btn btn-xs btn-ghost border border-base-300 font-semibold"
          >
            Today
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="btn btn-xs btn-ghost border border-base-300"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {weekDays.map((day) => {
          const isHolidayHeader = day === "Sun";
          return (
            <div
              key={day}
              className={`text-xs font-bold uppercase tracking-wider text-black py-1 ${isHolidayHeader ? "bg-red-300 rounded-md" : ""
                }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="h-20 rounded-xl bg-base-200/20 border border-transparent"
          />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const record = recordsByDate[dateKey];
          const holiday = holidaysByDate[dateKey];

          const statusLower = record?.status?.toLowerCase();
          const isPresent = statusLower === "present";
          const isAbsent = statusLower === "absent";
          const isHalfDay = statusLower === "half-day";
          const now = new Date();

          const currentLoopDate = new Date(year, month, dayNum);
          const isSunday = currentLoopDate.getDay() === 0;

          const isToday =
            now.getFullYear() === year &&
            now.getMonth() === month &&
            now.getDate() === dayNum;

          return (
            <div
              key={dateKey}
              className={`h-20 p-2 rounded-xl border flex flex-col justify-between transition-all ${holiday || isSunday
                ? "bg-red-700/40 border-red-500"
                : isPresent
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : isAbsent
                    ? "bg-rose-500/10 border-rose-500/30"
                    : isHalfDay
                      ? "bg-amber-200 border-amber-500"
                      : "bg-base-100 border-base-200/80 hover:border-base-300"
                } ${isToday ? "ring-2 ring-accent ring-offset-1" : ""}`}
            >
              {/* Top row: Day Number & Status Indicator Dot */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${isToday
                    ? "text-accent"
                    : holiday || isSunday
                      ? "text-red-900"
                      : "text-base-content/80"
                    }`}
                >
                  {dayNum}
                </span>
                {record && (
                  <span
                    className={`w-2 h-2 rounded-full ${isPresent
                      ? "bg-emerald-500"
                      : isAbsent
                        ? "bg-rose-500"
                        : "bg-amber-500"
                      }`}
                  />
                )}
              </div>

              {/* Bottom row: Clean Content (No text labels repeating status) */}
              {holiday ? (
                <span className="tooltip" data-tip={holiday.title}>
                  <span className="badge badge-xs bg-red-700 text-white font-semibold truncate border-0 max-w-full text-left text-[10px]">
                    {holiday?.title}
                  </span>
                </span>
              ) : record ? (
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[11px] font-semibold text-base-content/80">
                    {dateFormat(record.createdAt).time}
                  </span>
                </div>
              ) : isSunday ? (
                <span className="badge badge-xs md:badge-sm badge-dash font-semibold">
                  W/O
                </span>
              ) : (
                <span className="text-[10px] text-base-content/30">—</span>
              )}
            </div>
          );
        })}
      </div>


    </div>
  );
}

export default AttendanceCalendar;