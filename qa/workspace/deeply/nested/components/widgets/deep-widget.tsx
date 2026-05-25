interface DeepWidgetProps {
  level: number;
}

export const DeepWidget = ({ level }: DeepWidgetProps) => (
  <div className={`deep-widget deep-widget--level-${level}`}>Level {level}</div>
);
