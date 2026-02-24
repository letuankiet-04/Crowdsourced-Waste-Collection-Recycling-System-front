import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card.jsx'

export default function ReportPhotosCard({ images, collectedImages }) {
  const reported = Array.isArray(images) ? images : []
  const collected = Array.isArray(collectedImages) ? collectedImages : []
  const hasAny = reported.length || collected.length

  return (
    <Card>
      <CardHeader className="py-6 px-8">
        <CardTitle className="text-2xl">Photos</CardTitle>
      </CardHeader>
      <CardBody className="p-8">
        {hasAny ? (
          <div className="space-y-6">
            {reported.length ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reported Photos</div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {reported.map((src, idx) => (
                    <img
                      key={`${src}-${idx}`}
                      src={src}
                      alt={`Report photo ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-xl border border-gray-100"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {collected.length ? (
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Photos</div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {collected.map((src, idx) => (
                    <img
                      key={`${src}-${idx}`}
                      src={src}
                      alt={`Collected photo ${idx + 1}`}
                      className="w-full h-40 object-cover rounded-xl border border-gray-100"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="text-gray-600 text-sm">No photos attached.</div>
        )}
      </CardBody>
    </Card>
  )
}
