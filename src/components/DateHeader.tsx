interface DateHeaderProps {
  date: Date;
  isToday?: boolean;
  isTomorrow?: boolean;
  matchCount: number;
}

export function DateHeader({ date, isToday, isTomorrow, matchCount }: DateHeaderProps) {
  const formatDate = () => {
    if (isToday) return 'TODAY';
    if (isTomorrow) return 'TOMORROW';
    
    // Format as "WED, JUNE 12"
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    return `${dayOfWeek}, ${monthDay}`;
  };

  return (
    <div className="sticky top-[57px] bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border z-20 -mx-4 px-4 py-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold tracking-wide">
          {formatDate()}
        </h2>
        <span className="text-xs text-gray-500 font-semibold">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </span>
      </div>
    </div>
  );
}
