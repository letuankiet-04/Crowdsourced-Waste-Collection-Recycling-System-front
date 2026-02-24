export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold text-red-600">403</h1>
      <p className="mt-2 text-slate-600">You are not authorized to view this page.</p>
    </div>
  )
}
