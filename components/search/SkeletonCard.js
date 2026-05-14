export default function SkeletonCard() {
  return (
    <div className="bg-white border border-ash rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-ash">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-6 skeleton w-32 mb-2" />
            <div className="h-4 skeleton w-48" />
          </div>
          <div className="h-6 skeleton rounded-full w-36" />
        </div>
      </div>
      <div className="flex border-b border-ash">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 py-3 flex justify-center">
            <div className="h-3 skeleton w-16" />
          </div>
        ))}
      </div>
      <div className="px-6 py-5 space-y-3">
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-5/6" />
        <div className="h-4 skeleton w-4/6" />
      </div>
    </div>
  );
}
