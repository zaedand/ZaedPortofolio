import { Suspense, lazy } from 'react';

const Lanyard = lazy(() => import('./Lanyard'));

const LanyardSkeleton = () => (
  <div className="h-full w-full animate-pulse rounded-xl bg-gradient-to-br from-[#1a1d24] to-[#0B0D10]" />
);

interface LanyardCardProps {
  photoSrc: string;
  backPhotoSrc?: string;
}

const LanyardCard: React.FC<LanyardCardProps> = ({ photoSrc, backPhotoSrc }) => {
  return (
    <div className="relative h-full w-full">
      <Suspense fallback={<LanyardSkeleton />}>
        <Lanyard
          frontImage={photoSrc}
          backImage={backPhotoSrc}
          gravity={[0, -40, 0]}
          fov={10}
        />
      </Suspense>
    </div>
  );
};

export default LanyardCard;