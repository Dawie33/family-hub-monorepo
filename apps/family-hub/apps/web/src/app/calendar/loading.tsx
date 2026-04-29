export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 rounded-full bg-gray-200" />
        <div className="h-8 w-24 rounded-full bg-gray-200" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-6 rounded bg-gray-200" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
