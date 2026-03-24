import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../ui/PageHeader.jsx'
import { Card, CardBody, CardHeader, CardTitle } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import StatusPill from '../ui/StatusPill.jsx'
import { normalizeReportStatus, reportStatusToPillVariant } from '../lib/reportStatus.js'
import ReportLocationCard from './ReportLocationCard.jsx'
import ReportPhotosCard from './ReportPhotosCard.jsx'

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
  showWaste = true,
  showWasteTypes = true,
  wasteItemsLabel = 'Estimated Items',
  showSubmittedBy = true,
  reportInfoExtra,
}) {
  const safeReport = report ?? null
  const reportCode = safeReport?.reportCode ?? safeReport?.code ?? null
  const collectionRequestId = safeReport?.collectionRequestId ?? safeReport?.requestId ?? null
  const displayReportCode = reportCode != null && String(reportCode).trim() !== '' ? String(reportCode) : null
  const displayReportId = safeReport?.id != null && String(safeReport.id).trim() !== '' ? String(safeReport.id) : null
  const descriptionText = useMemo(() => {
    const raw = safeReport?.description ?? safeReport?.notes ?? safeReport?.note ?? safeReport?.detail ?? null
    if (raw == null) return null
    const s = String(raw).trim()
    return s ? s : null
  }, [safeReport])

  const images = useMemo(() => {
    const raw = safeReport?.images ?? safeReport?.imageUrls ?? safeReport?.image_urls
    return Array.isArray(raw) ? raw.filter(Boolean).map(String) : []
  }, [safeReport])

  const collectedImages = useMemo(() => {
    const raw = safeReport?.collectedImages ?? safeReport?.collectedImageUrls ?? safeReport?.collected_image_urls
    return Array.isArray(raw) ? raw.filter(Boolean).map(String) : []
  }, [safeReport])

  const wasteItemsEntries = useMemo(() => {
    const raw = safeReport?.wasteItems
    const list = Array.isArray(raw) ? raw : []
    return list
      .map((item) => {
        const name = item?.name ? String(item.name) : ''
        const unit = item?.unit ? String(item.unit) : ''
        const w = typeof item?.estimatedWeight === 'number' ? item.estimatedWeight : Number(item?.estimatedWeight)
        return name ? { name, unit, estimatedWeight: Number.isFinite(w) ? w : null } : null
      })
      .filter(Boolean)
  }, [safeReport])

  const wasteTypesEntries = useMemo(() => {
    const raw = safeReport?.types
    const list = Array.isArray(raw) ? raw : []
    return list.map((t) => (t == null ? '' : String(t).trim())).filter(Boolean)
  }, [safeReport])

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
        description={description || `Details for ${displayReportCode || displayReportId || '-'}.`}
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
                <Field label="Report Code" value={displayReportCode || '-'} />
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Status</div>
                  <div className="mt-2">
                    <StatusPill variant={reportStatusToPillVariant(safeReport?.status)}>
                      {normalizeReportStatus(safeReport?.status)}
                    </StatusPill>
                  </div>
                </div>
                {collectionRequestId != null && String(collectionRequestId).trim() !== '' ? (
                  <Field label="Collection Request ID" value={String(collectionRequestId)} />
                ) : null}
                <Field label="Submitted At" value={formatDateTime(safeReport?.createdAt)} />
                {showSubmittedBy ? (
                  <Field
                    label="Submitted By"
                    value={safeReport?.submitBy || safeReport?.submit_by || safeReport?.createdBy || '-'}
                  />
                ) : null}
                {safeReport?.updatedAt ? <Field label="Updated At" value={formatDateTime(safeReport?.updatedAt)} /> : null}
                {safeReport?.priority ? <Field label="Priority" value={String(safeReport?.priority)} /> : null}
              </div>
              {descriptionText ? (
                <div className="mt-6">
                  <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Description</div>
                  <div className="mt-2 whitespace-pre-line text-gray-900">{descriptionText}</div>
                </div>
              ) : null}
              {reportInfoExtra ? <div className="mt-6">{reportInfoExtra}</div> : null}
            </CardBody>
          </Card>

          {showWaste ? (
            <Card>
              <CardHeader className="py-6 px-8">
                <CardTitle className="text-2xl">Waste</CardTitle>
              </CardHeader>
              <CardBody className="p-8">
                {wasteItemsEntries.length ? (
                  <div>
                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{wasteItemsLabel}</div>
                    <div className="mt-3 overflow-x-auto rounded-2xl border border-gray-200">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold">Name</th>
                            <th className="px-4 py-3 text-left font-semibold">Estimated weight</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {wasteItemsEntries.map((it) => (
                            <tr key={it.name}>
                              <td className="px-4 py-3 text-gray-900">{it.name}</td>
                              <td className="px-4 py-3 text-gray-900">
                                {it.estimatedWeight != null
                                  ? `${it.estimatedWeight} ${it.unit ? String(it.unit).toLowerCase() : 'kg'}`
                                  : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : !showWasteTypes || !wasteTypesEntries.length ? (
                  <div className="text-gray-600">-</div>
                ) : null}
              </CardBody>
            </Card>
          ) : null}

          <ReportLocationCard
            reportedAddress={safeReport?.address}
            reportedCoords={safeReport?.coords}
            collectedAddress={safeReport?.collectedAddress}
            collectedCoords={safeReport?.collectedCoords}
          />

          <ReportPhotosCard images={images} collectedImages={collectedImages} />
        </div>

        {aside ? <div className="space-y-8 lg:sticky lg:top-6 self-start">{aside}</div> : null}
      </div>
    </div>
  )
}
