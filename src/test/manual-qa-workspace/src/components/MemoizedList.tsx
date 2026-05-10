import { memo } from 'react';

interface MemoizedListProps {
  items: ReadonlyArray<{ id: string; label: string }>;
  onSelect?: (id: string) => void;
}

export const MemoizedList = memo<MemoizedListProps>(({ items, onSelect }) => (
  <ul className="memoized-list">
    {items.map((item) => (
      <li key={item.id}>
        <button type="button" onClick={() => onSelect?.(item.id)}>
          {item.label}
        </button>
      </li>
    ))}
  </ul>
));

MemoizedList.displayName = 'MemoizedList';
