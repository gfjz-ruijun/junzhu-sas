import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    if (value) {
      const [year, monthStr] = value.split("-");
      return new Date(parseInt(year), parseInt(monthStr) - 1);
    }
    return new Date();
  });

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const days = useMemo(() => {
    const dayCount = daysInMonth(month);
    const firstDay = firstDayOfMonth(month);
    const days = [];

    // 上个月的日期
    const prevMonthDays = daysInMonth(
      new Date(month.getFullYear(), month.getMonth() - 1)
    );
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(
          month.getFullYear(),
          month.getMonth() - 1,
          prevMonthDays - i
        ),
      });
    }

    // 当前月的日期
    for (let i = 1; i <= dayCount; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(month.getFullYear(), month.getMonth(), i),
      });
    }

    // 下个月的日期
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(month.getFullYear(), month.getMonth() + 1, i),
      });
    }

    return days;
  }, [month]);

  const handlePrevMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1));
  };

  const handleSelectDate = (date: Date) => {
    const year = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(date.getDate()).padStart(2, "0");
    onChange(`${year}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "选择日期";
    const [year, monthStr, dayStr] = dateStr.split("-");
    return `${year}年${monthStr}月${dayStr}日`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left hover:bg-gray-50 transition-colors"
      >
        {formatDisplayDate(value)}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 w-80">
          {/* 月份导航 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center font-semibold">
              {month.getFullYear()}年{String(month.getMonth() + 1).padStart(2, "0")}月
            </div>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((item, index) => {
              const isSelected =
                selectedDate &&
                item.date.toDateString() === selectedDate.toDateString();
              const isToday = new Date().toDateString() === item.date.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => handleSelectDate(item.date)}
                  className={`
                    p-2 text-sm rounded transition-colors
                    ${!item.isCurrentMonth ? "text-gray-300" : ""}
                    ${isSelected ? "bg-blue-500 text-white font-semibold" : ""}
                    ${isToday && !isSelected ? "bg-blue-100 text-blue-600 font-semibold" : ""}
                    ${!isSelected && item.isCurrentMonth && !isToday ? "hover:bg-gray-100" : ""}
                  `}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* 快捷按钮 */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const today = new Date();
                handleSelectDate(today);
              }}
              className="flex-1"
            >
              今天
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              取消
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

