import { formatFullPerthDate } from '../utils/timezone';

interface DateHeaderProps {
  date: Date;
  isToday?: boolean;
  isTomorrow?: boolean;
  matchCount: number;
}

export function DateHeader({ date, isToday, isTomorrow, matchCount }: DateHeaderProps) {
  const formatDate = () => {
    const fullDate = formatFullPerthDate(date);

    if (isToday) return `TODAY · ${fullDate}`;
    if (isTomorrow) return `TOMORROW · ${fullDate}`;

    return fullDate;
  };

  return (
    <div className="sticky top-[57px] nav-glass border-b border-dark-border z-20 -mx-4 px-4 py-3">
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
