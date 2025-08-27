import { useState, useEffect, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
}

// ClientOnly component ensures children only render on the client side.
// This prevents SSR hydration mismatches for client-side only components.
export function ClientOnly({ children, fallback = null, delay = 0 }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    console.log('ClientOnly: Starting hydration process...');
    
    const timer = setTimeout(() => {
      setHasMounted(true);
      console.log('ClientOnly: Hydration complete, showing client content');
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!hasMounted) {
    console.log('ClientOnly: Showing SSR fallback content');
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
