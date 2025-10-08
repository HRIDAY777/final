import React from 'react';
import { cn } from '@/utils/cn';

interface CalendarProps {
  mode?: 'single' | 'range';
  selected?: Date | { from?: Date; to?: Date };
  onSelect?: (date: Date | { from?: Date; to?: Date }) => void;
  initialFocus?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({ 
  mode = 'single', 
  selected, 
  onSelect, 
  initialFocus = false 
}) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedRange, setSelectedRange] = React.useState<{ from?: Date; to?: Date }>({});

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay };
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (mode === 'single') {
      onSelect?.(clickedDate);
    } else {
      if (!selectedRange.from || (selectedRange.from && selectedRange.to)) {
        setSelectedRange({ from: clickedDate, to: undefined });
      } else {
        const newRange = { from: selectedRange.from, to: clickedDate };
        setSelectedRange(newRange);
        onSelect?.(newRange);
      }
    }
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isSelected = mode === 'single' 
      ? selected instanceof Date && date.toDateString() === selected.toDateString()
      : selectedRange.from && date.toDateString() === selectedRange.from.toDateString();

    days.push(
      <button
        key={day}
        className={cn(
          "p-2 text-sm hover:bg-gray-100 rounded",
          isSelected && "bg-blue-500 text-white hover:bg-blue-600"
        )}
        onClick={() => handleDateClick(day)}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ←
        </button>
        <div className="font-medium">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          →
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

export default Calendar;
