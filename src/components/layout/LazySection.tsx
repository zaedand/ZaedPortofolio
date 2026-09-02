import { Suspense, lazy, ComponentType } from 'react';
import { useInView } from '../../hooks/useInView';

interface LazySectionProps {
  importFn: () => Promise<{ default: ComponentType }>;
  minHeight?: string; // reserve ruang supaya scroll tidak "loncat" (cegah layout shift)
  fallback?: React.ReactNode;
}

const LazySection: React.FC<LazySectionProps> = ({ importFn, minHeight = '100vh', fallback = null }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Component = inView ? lazy(importFn) : null;

  return (
    <div ref={ref} style={{ minHeight }}>
      {Component && (
        <Suspense fallback={fallback}>
          <Component />
        </Suspense>
      )}
    </div>
  );
};

export default LazySection;