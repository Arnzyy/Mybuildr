export default async function BuilderSitePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Builder Site: {slug}</h1>
        <p className="text-gray-600">This will be a builder&apos;s website</p>
        <p className="text-sm text-gray-400 mt-4">Coming soon</p>
      </div>
    </div>
  )
}
