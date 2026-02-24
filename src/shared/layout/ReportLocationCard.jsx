import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card.jsx'

function formatCoord(value) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return '-'
  return n.toFixed(5)
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{label}</div>
      <div className="mt-1 text-gray-900">{value ?? '-'}</div>
    </div>
  )
}

export default function ReportLocationCard({ reportedAddress, reportedCoords, collectedAddress, collectedCoords }) {
  const reported = reportedCoords ?? null
  const collected = collectedCoords ?? null
  const showCollected = Boolean(collected) || (typeof collectedAddress === 'string' && collectedAddress.trim())

  return (
    <Card>
      <CardHeader className="py-6 px-8">
        <CardTitle className="text-2xl">Location</CardTitle>
      </CardHeader>
      <CardBody className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reported Address</div>
            <div className="mt-1 text-gray-900">{reportedAddress || '-'}</div>
          </div>
          <Field label="Reported Latitude" value={formatCoord(reported?.lat)} />
          <Field label="Reported Longitude" value={formatCoord(reported?.lng)} />

          {showCollected ? (
            <>
              <div className="md:col-span-2 border-t border-gray-100 pt-6" />
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Address</div>
                <div className="mt-1 text-gray-900">{collectedAddress || '-'}</div>
              </div>
              <Field label="Collected Latitude" value={formatCoord(collected?.lat)} />
              <Field label="Collected Longitude" value={formatCoord(collected?.lng)} />
            </>
          ) : null}
        </div>
      </CardBody>
    </Card>
  )
}
