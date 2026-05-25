import { ComponentType } from 'react';

interface ThemeProps {
  theme: 'light' | 'dark';
}

export function withTheme<P extends object>(
  WrappedComponent: ComponentType<P & ThemeProps>,
  theme: ThemeProps['theme'] = 'light',
): ComponentType<P> {
  const WithTheme = (props: P) => <WrappedComponent {...props} theme={theme} />;
  WithTheme.displayName = `withTheme(${WrappedComponent.displayName ?? WrappedComponent.name})`;
  return WithTheme;
}
