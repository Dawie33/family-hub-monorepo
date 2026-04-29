export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="h-10 rounded-xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
