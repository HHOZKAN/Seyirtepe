export default function Loading() {
  return (
    <div className="px-4 py-5 space-y-3 animate-pulse">
      <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-36 bg-gray-200 rounded" />
            <div className="h-5 w-20 bg-gray-100 rounded-full" />
          </div>
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-8 w-full bg-gray-100 rounded-lg mt-2" />
        </div>
      ))}
    </div>
  )
}
