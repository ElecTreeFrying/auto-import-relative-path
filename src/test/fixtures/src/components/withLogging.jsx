import { useEffect } from 'react';

export const withLogging = (WrappedComponent) => {
  const WithLogging = (props) => {
    useEffect(() => {
      console.log(`[mount] ${WrappedComponent.displayName ?? WrappedComponent.name}`, props);
      return () => console.log(`[unmount] ${WrappedComponent.displayName ?? WrappedComponent.name}`);
    }, [props]);
    return <WrappedComponent {...props} />;
  };
  WithLogging.displayName = `withLogging(${WrappedComponent.displayName ?? WrappedComponent.name})`;
  return WithLogging;
};

export default withLogging;
