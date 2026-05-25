import { ReactNode } from 'react';

interface GenericListProps<T> {
  items: T[];
  keyOf: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  empty?: ReactNode;
}

export const GenericList = <T,>({ items, keyOf, renderItem, empty }: GenericListProps<T>) => {
  if (items.length === 0) return <>{empty ?? null}</>;
  return (
    <ul className="generic-list">
      {items.map((item) => (
        <li key={keyOf(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
};
