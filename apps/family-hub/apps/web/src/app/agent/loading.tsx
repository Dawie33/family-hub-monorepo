export default function Loading() {
  return (
    <div className="flex flex-col gap-3 p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
        <div className="h-16 flex-1 rounded-2xl bg-gray-200" />
      </div>
      <div className="flex gap-3 justify-end">
        <div className="h-12 w-48 rounded-2xl bg-blue-100" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
        <div className="h-24 flex-1 rounded-2xl bg-gray-200" />
      </div>
    </div>
  );
}
