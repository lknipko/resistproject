export default function TestDeployPage() {
  return (
    <div className="min-h-screen bg-white text-black p-8">
      <h1 className="text-4xl font-bold mb-4">Deployment Test Page</h1>
      <p className="text-xl mb-4">
        ✅ If you can see this page, Railway deployed the latest code.
      </p>
      <p className="text-gray-600">
        Timestamp: {new Date().toISOString()}
      </p>
      <p className="text-sm text-gray-500 mt-8">
        Build ID: v2-2026-02-05-auth-fix
      </p>
    </div>
  )
}
