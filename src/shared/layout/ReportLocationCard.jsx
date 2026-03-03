import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card.jsx'
import GoongMapView from '../components/maps/GoongMapView.jsx'

export default function ReportLocationCard({ reportedAddress, reportedCoords, collectedAddress, collectedCoords }) {
  const showCollected = Boolean(collectedCoords) || (typeof collectedAddress === 'string' && collectedAddress.trim())
  const points = [
    reportedCoords ? { coords: reportedCoords, label: 'Reported location' } : null,
    collectedCoords ? { coords: collectedCoords, label: 'Collected location' } : null,
  ].filter(Boolean)
  const showMap = points.length > 0

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

          {showCollected ? (
            <>
              <div className="md:col-span-2 border-t border-gray-100 pt-6" />
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Address</div>
                <div className="mt-1 text-gray-900">{collectedAddress || '-'}</div>
              </div>
            </>
          ) : null}

          {showMap ? (
            <>
              <div className="md:col-span-2 border-t border-gray-100 pt-6" />
              <div className="md:col-span-2">
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Map</div>
                <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200">
                  <GoongMapView points={points} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </CardBody>
    </Card>
  )
}
