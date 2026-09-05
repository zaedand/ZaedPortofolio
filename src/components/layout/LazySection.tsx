import { Suspense, lazy, ComponentType } from 'react';
import { useInView } from '../../hooks/useInView';
import { useTheme } from '../../hooks/useTheme';
import SectionLoader from './SectionLoader';

interface LazySectionProps {
  importFn: () => Promise<{ default: ComponentType }>;
  minHeight?: string;
  bgColor?: string;
  lightBgColor?: string;
  id?: string;
  fallback?: React.ReactNode;
}

const LazySection: React.FC<LazySectionProps> = ({
  importFn,
  minHeight = '100vh',
  bgColor = '#0B0D10',
  lightBgColor = '#ffffff',
  id,
  fallback = <SectionLoader />,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const isDark = useTheme();
  const Component = inView ? lazy(importFn) : null;

  return (
    <div
      id={id}
      ref={ref}
      style={{ minHeight, backgroundColor: isDark ? bgColor : lightBgColor }}
    >
      {Component && (
        <Suspense fallback={fallback}>
          <Component />
        </Suspense>
      )}
    </div>
  );
};

export default LazySection;