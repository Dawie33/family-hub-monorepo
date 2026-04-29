export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="h-32 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-2xl bg-gray-200" />
        <div className="h-24 rounded-2xl bg-gray-200" />
      </div>
      <div className="h-6 w-40 rounded-full bg-gray-200" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
