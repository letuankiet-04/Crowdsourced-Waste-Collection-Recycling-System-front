import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../ui/PageHeader.jsx'
import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import StatusPill from '../ui/StatusPill.jsx'
import { normalizeReportStatus, reportStatusToPillVariant } from '../../lib/reportStatus.js'

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDateTime(value) {
  if (!value) return '-'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return '-'
    return dateTimeFormatter.format(d)
  } catch {
    return '-'
  }
}

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

export default function ReportDetail({
  report,
  backTo = '/home',
  title = 'Report Detail',
  description,
  backLabel = 'Back',
  headerRight,
  aside,
}) {
  const safeReport = report ?? null

  const coords = safeReport?.coords ?? null
  const collectedCoords = safeReport?.collectedCoords ?? null

  const types = useMemo(() => {
    const raw = safeReport?.types
    return Array.isArray(raw) ? raw.filter(Boolean).map(String) : []
  }, [safeReport])

  const images = useMemo(() => {
    const raw = safeReport?.images
    return Array.isArray(raw) ? raw.filter(Boolean).map(String) : []
  }, [safeReport])

  const collectedImages = useMemo(() => {
    const raw = safeReport?.collectedImages
    return Array.isArray(raw) ? raw.filter(Boolean).map(String) : []
  }, [safeReport])

  const collectedWeightsEntries = useMemo(() => {
    const raw = safeReport?.collectedWeights
    if (!raw || typeof raw !== 'object') return []
    return Object.entries(raw)
      .map(([k, v]) => {
        const key = String(k)
        const num = typeof v === 'number' ? v : Number(v)
        return [key, num]
      })
      .filter(([key, num]) => Boolean(key) && Number.isFinite(num) && num >= 0)
  }, [safeReport])

  const collectedTotalWeight = useMemo(() => {
    const raw = safeReport?.collectedTotalWeight
    const num = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isFinite(num)) return num
    if (collectedWeightsEntries.length) return collectedWeightsEntries.reduce((sum, [, v]) => sum + v, 0)
    return null
  }, [safeReport, collectedWeightsEntries])

  if (!safeReport) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={title}
          description={description || 'Report not found.'}
          right={
            <Button as={Link} to={backTo} variant="outline" size="sm" className="rounded-full">
              {backLabel}
            </Button>
          }
        />
        <Card>
          <CardBody className="p-8">
            <div className="text-gray-900 font-semibold">Report not found</div>
            <div className="mt-2 text-gray-600 text-sm">
              This report may have been removed or is not available in this session.
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={title}
        description={description || `Details for ${safeReport?.id || '-'}.`}
        right={
          headerRight ?? (
            <Button as={Link} to={backTo} variant="outline" size="sm" className="rounded-full">
              {backLabel}
            </Button>
          )
        }
      />

      <div className={aside ? 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start' : null}>
        <div className="space-y-8">
          <Card>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-2xl">Report Info</CardTitle>
            </CardHeader>
            <CardBody className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Report ID" value={safeReport?.id || '-'} />
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</div>
                  <div className="mt-2">
                    <StatusPill variant={reportStatusToPillVariant(safeReport?.status)}>
                      {normalizeReportStatus(safeReport?.status)}
                    </StatusPill>
                  </div>
                </div>
                <Field label="Submitted At" value={formatDateTime(safeReport?.createdAt)} />
                <Field label="Submitted By" value={safeReport?.createdBy || '-'} />
                {safeReport?.updatedAt ? <Field label="Updated At" value={formatDateTime(safeReport?.updatedAt)} /> : null}
                {safeReport?.priority ? <Field label="Priority" value={String(safeReport?.priority)} /> : null}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-2xl">Waste</CardTitle>
            </CardHeader>
            <CardBody className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Types</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {types.length ? (
                      types.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </div>
                </div>
                <Field label="Estimated Weight" value={safeReport?.weight || '-'} />
                {collectedTotalWeight !== null ? (
                  <Field label="Collected Total Weight" value={`${collectedTotalWeight} kg`} />
                ) : null}
                {collectedWeightsEntries.length ? (
                  <div className="md:col-span-2">
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Weights</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {collectedWeightsEntries.map(([t, w]) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
                        >
                          {t}: {w} kg
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Notes</div>
                  <div className="mt-2 text-gray-800 whitespace-pre-wrap">{safeReport?.notes ? String(safeReport.notes) : '-'}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-2xl">Location</CardTitle>
            </CardHeader>
            <CardBody className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reported Address</div>
                  <div className="mt-1 text-gray-900">{safeReport?.address || '-'}</div>
                </div>
                <Field label="Reported Latitude" value={formatCoord(coords?.lat)} />
                <Field label="Reported Longitude" value={formatCoord(coords?.lng)} />

                {collectedCoords || safeReport?.collectedAddress ? (
                  <>
                    <div className="md:col-span-2 border-t border-gray-100 pt-6" />
                    <div className="md:col-span-2">
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Address</div>
                      <div className="mt-1 text-gray-900">{safeReport?.collectedAddress || '-'}</div>
                    </div>
                    <Field label="Collected Latitude" value={formatCoord(collectedCoords?.lat)} />
                    <Field label="Collected Longitude" value={formatCoord(collectedCoords?.lng)} />
                  </>
                ) : null}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="py-6 px-8">
              <CardTitle className="text-2xl">Photos</CardTitle>
            </CardHeader>
            <CardBody className="p-8">
              {images.length || collectedImages.length ? (
                <div className="space-y-6">
                  {images.length ? (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Reported Photos</div>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((src, idx) => (
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

                  {collectedImages.length ? (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Collected Photos</div>
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {collectedImages.map((src, idx) => (
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
        </div>

        {aside ? <div className="space-y-8 lg:sticky lg:top-6 self-start">{aside}</div> : null}
      </div>
    </div>
  )
}
