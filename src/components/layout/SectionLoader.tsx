import { ThreeCircles } from 'react-loader-spinner';

const SectionLoader = () => {
  return (
    <div className="flex h-full w-full items-center justify-center py-24">
      <ThreeCircles
        visible={true}
        height="80"
        width="80"
        color="#3B82F6"
        ariaLabel="loading"
      />
    </div>
  );
};

export default SectionLoader;