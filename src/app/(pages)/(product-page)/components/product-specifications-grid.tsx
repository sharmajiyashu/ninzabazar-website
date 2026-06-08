type Spec = { key: string; value: string }

export default function ProductSpecificationsGrid({
  specifications,
}: {
  specifications: Spec[]
}) {
  if (!specifications?.length) return null

  return (
    <section className="mt-10 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Product Specifications</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-gray-200 rounded-xl overflow-hidden">
        {specifications.map((spec, index) => (
          <div
            key={`${spec.key}-${index}`}
            className="border-b border-r border-gray-200 px-4 py-3 text-sm bg-white min-h-[52px] flex flex-col justify-center"
          >
            <span className="text-gray-500 capitalize">{spec.key}</span>
            <span className="font-semibold text-gray-900 mt-0.5">{spec.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
