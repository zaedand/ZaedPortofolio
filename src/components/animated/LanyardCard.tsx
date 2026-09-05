import { Suspense, lazy } from 'react';
import { ThreeCircles } from 'react-loader-spinner';

const Lanyard = lazy(() => import('./Lanyard'));

const LanyardSkeleton = () => (
  <div className="flex h-full w-full items-center justify-center">
    <ThreeCircles visible={true} height="70" width="70" color="#3B82F6" ariaLabel="loading-lanyard" />
  </div>
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
          fov={9}
        />
      </Suspense>
    </div>
  );
};

export default LanyardCard;