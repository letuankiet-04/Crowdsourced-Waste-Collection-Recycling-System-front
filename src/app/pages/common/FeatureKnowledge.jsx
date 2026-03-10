import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PATHS } from '../../routes/paths.js'

import protectedRouteRaw from '../../auth/ProtectedRoute.jsx?raw'
import roleLayoutRaw from '../../../shared/layout/RoleLayout.jsx?raw'
import appRoutesRaw from '../../routes/AppRoutes.jsx?raw'
import clientRaw from '../../../services/http/client.js?raw'
import apiErrorRaw from '../../../services/http/ApiError.js?raw'
import unwrapApiResponseRaw from '../../../services/http/unwrapApiResponse.js?raw'
import notifyProviderRaw from '../../../shared/ui/NotifyProvider.jsx?raw'
import notifyCoreRaw from '../../../notifications/notifyCore.js?raw'
import useNotifyRaw from '../../../shared/hooks/useNotify.js?raw'

function normalizeVitePath(p) {
  return String(p || '').replace(/^\/src\//, 'src/')
}

function posixDirname(p) {
  const parts = String(p || '').split('/')
  parts.pop()
  return parts.join('/')
}

function normalizePosixPath(p) {
  const raw = String(p || '')
  const hasLeadingSlash = raw.startsWith('/')
  const parts = raw.split('/').filter((x) => x !== '')
  const out = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      out.pop()
      continue
    }
    out.push(part)
  }
  return `${hasLeadingSlash ? '/' : ''}${out.join('/')}`
}

function toViteSrcKey(p) {
  const raw = String(p || '')
  if (!raw) return ''
  if (raw.startsWith('/src/')) return raw
  if (raw.startsWith('src/')) return `/${raw}`
  return raw.startsWith('/') ? raw : `/${raw}`
}

function resolveImportToSrcPath(entryFile, importSource) {
  const src = String(importSource || '')
  if (!src) return null
  if (src.startsWith('.')) {
    const base = posixDirname(entryFile)
    return normalizePosixPath(`${base}/${src}`)
  }
  if (src.startsWith('/src/')) return normalizeVitePath(src)
  if (src.startsWith('src/')) return src
  if (src.includes('/src/')) return normalizeVitePath(src)
  return null
}

function resolveToExistingSrcFile(srcIndex, srcPath) {
  const raw = String(srcPath || '')
  if (!raw) return null
  const hasExt = /\.(jsx|tsx|js|ts)$/i.test(raw)
  const candidates = hasExt
    ? [raw]
    : [
        `${raw}.jsx`,
        `${raw}.tsx`,
        `${raw}.js`,
        `${raw}.ts`,
        `${raw}/index.jsx`,
        `${raw}/index.tsx`,
        `${raw}/index.js`,
        `${raw}/index.ts`,
      ]

  for (const c of candidates) {
    const key = toViteSrcKey(c)
    if (srcIndex?.[key]) return normalizeVitePath(key)
  }
  return null
}

function sliceLines(raw, from, to) {
  const lines = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
  const start = Math.max(1, Number(from) || 1)
  const end = Math.max(start, Number(to) || start)
  return lines.slice(start - 1, end).join('\n').trimEnd()
}

function matchesQuery(entry, q) {
  const query = String(q || '').trim().toLowerCase()
  if (!query) return true
  const hay = `${entry.title} ${entry.file} ${String(entry.raw ?? '')}`.toLowerCase()
  return hay.includes(query)
}

function findReturnLine(raw) {
  const lines = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
  const idx = lines.findIndex((l) => /\breturn\s*\(/.test(l))
  return idx >= 0 ? idx + 1 : null
}

function parseImports(raw) {
  const lines = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
  const result = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('import ')) continue
    if (/^import\s+['"]/.test(trimmed)) continue
    const m = trimmed.match(/^import\s+(.+?)\s+from\s+['"](.+?)['"]\s*;?\s*$/)
    if (!m) continue
    result.push({ spec: m[1].trim(), source: m[2].trim() })
  }
  return result
}

function extractImportedComponentNames(imports) {
  const names = new Set()
  for (const it of imports) {
    const spec = it.spec
    const ns = spec.match(/^\*\s+as\s+([A-Za-z0-9_$]+)/)
    if (ns?.[1]) names.add(ns[1])
    const named = spec.match(/\{([^}]+)\}/)
    if (named?.[1]) {
      for (const part of named[1].split(',')) {
        const token = part.trim()
        if (!token) continue
        const name = token.split(/\s+as\s+/)[0]?.trim()
        if (name) names.add(name)
      }
    }
    const defaultCandidate = spec
      .replace(/\{[^}]*\}/g, '')
      .replace(/\*\s+as\s+[A-Za-z0-9_$]+/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)[0]
    if (defaultCandidate) names.add(defaultCandidate)
  }
  return Array.from(names).filter((n) => /^[A-Z]/.test(n))
}

function extractComponentImports(imports) {
  const out = new Map()
  for (const it of imports) {
    const spec = it.spec
    const source = it.source

    const ns = spec.match(/^\*\s+as\s+([A-Za-z0-9_$]+)/)
    if (ns?.[1] && /^[A-Z]/.test(ns[1])) out.set(`${ns[1]}@@${source}`, { name: ns[1], source })

    const named = spec.match(/\{([^}]+)\}/)
    if (named?.[1]) {
      for (const part of named[1].split(',')) {
        const token = part.trim()
        if (!token) continue
        const name = token.split(/\s+as\s+/)[0]?.trim()
        if (name && /^[A-Z]/.test(name)) out.set(`${name}@@${source}`, { name, source })
      }
    }

    const defaultCandidate = spec
      .replace(/\{[^}]*\}/g, '')
      .replace(/\*\s+as\s+[A-Za-z0-9_$]+/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)[0]
    if (defaultCandidate && /^[A-Z]/.test(defaultCandidate))
      out.set(`${defaultCandidate}@@${source}`, { name: defaultCandidate, source })
  }
  return Array.from(out.values())
}

function extractHooks(raw) {
  const hooks = [
    'useState',
    'useEffect',
    'useMemo',
    'useCallback',
    'useRef',
    'useNavigate',
    'useParams',
    'useLocation',
    'useSearchParams',
  ]
  const text = String(raw ?? '')
  return hooks.filter((h) => text.includes(`${h}(`))
}

function extractServiceEndpoints(raw) {
  const text = String(raw ?? '')
  const endpoints = []

  const callRe = /\bapi\.(get|post|put|patch|delete)\(\s*(["'`])([^"'`]+)\2/gi
  let m
  while ((m = callRe.exec(text))) {
    const method = String(m[1] || '').toUpperCase()
    const url = String(m[3] || '').trim()
    if (!url) continue
    if (m[2] === '`' && url.includes('${')) continue
    endpoints.push({ method, url })
  }

  const requestRe = /\bapi\.request\(\s*\{([\s\S]*?)\}\s*\)/gi
  while ((m = requestRe.exec(text))) {
    const body = String(m[1] || '')
    const methodMatch = body.match(/\bmethod\s*:\s*(["'`])([a-z]+)\1/i)
    const urlMatch = body.match(/\burl\s*:\s*(["'`])([^"'`]+)\1/i)
    const method = String(methodMatch?.[2] || '').toUpperCase()
    const url = String(urlMatch?.[2] || '').trim()
    if (method && url) endpoints.push({ method, url })
  }

  const fetchRe = /\bfetch\(\s*(["'`])(https?:\/\/[^"'`]+)\1/gi
  while ((m = fetchRe.exec(text))) {
    endpoints.push({ method: 'FETCH', url: String(m[2] || '').trim() })
  }

  const seen = new Set()
  const out = []
  for (const e of endpoints) {
    const key = `${e.method} ${e.url}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(e)
  }
  out.sort((a, b) => (a.method + a.url).localeCompare(b.method + b.url))
  return out
}

function CodeBlock({ code }) {
  return (
    <pre className="mt-3 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
      <code>{code}</code>
    </pre>
  )
}

function CodeSection({ title, meta, code, explanation }) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer select-none text-sm font-semibold text-slate-900">{title}</summary>
      {meta ? <div className="mt-2 text-xs text-slate-600">{meta}</div> : null}
      {explanation ? <div className="mt-2 text-sm text-slate-700">{explanation}</div> : null}
      <CodeBlock code={code} />
    </details>
  )
}

const FEATURE_LABEL = {
  auth: 'Auth',
  home: 'Home',
  citizen: 'Citizen',
  collector: 'Collector',
  enterprise: 'Enterprise',
  admin: 'Admin',
}

function explainHook(hook) {
  if (hook === 'useState') return 'Tạo state cục bộ cho component. setState sẽ trigger re-render.'
  if (hook === 'useEffect')
    return 'Chạy side-effect (fetch API, subscribe, sync DOM). Dùng dependency array để kiểm soát khi nào chạy.'
  if (hook === 'useMemo')
    return 'Memo hoá giá trị tính toán. Hữu ích khi tính nặng hoặc cần giữ reference ổn định.'
  if (hook === 'useCallback')
    return 'Memo hoá function. Hữu ích khi truyền callback xuống component con để tránh re-render không cần thiết.'
  if (hook === 'useRef')
    return 'Giữ giá trị qua nhiều lần render mà không trigger re-render, hoặc lấy ref DOM.'
  if (hook === 'useNavigate') return 'Điều hướng trang bằng code (React Router).'
  if (hook === 'useParams') return 'Đọc params từ URL (ví dụ :reportId).'
  if (hook === 'useLocation') return 'Đọc thông tin location hiện tại (pathname, search...).'
  if (hook === 'useSearchParams') return 'Đọc/ghi query string (?a=1) theo kiểu URLSearchParams.'
  return ''
}

function explainImportedComponent(name, importSource) {
  if (name === 'RoleLayout')
    return 'Layout dùng chung cho từng role: nhận sidebar/navbar/footer qua props và render children.'
  if (name.toLowerCase().includes('sidebar')) return 'Sidebar: menu điều hướng theo role/feature.'
  if (name.toLowerCase().includes('navbar')) return 'Navbar: thanh điều hướng phía trên (header actions, avatar, thông báo...).'
  if (name.toLowerCase().includes('footer')) return 'Footer: phần chân trang, thường chứa contact hoặc info.'
  if (name.toLowerCase().includes('dialog') || name.toLowerCase().includes('modal'))
    return 'Dialog/Modal: UI nổi để xác nhận/nhập thông tin, thường được điều khiển bằng state.'
  if (String(importSource || '').includes('/services/'))
    return 'Service: nơi gọi API (axios) và trả dữ liệu cho UI.'
  return 'Component con: tách nhỏ UI để dễ đọc, dễ reuse. Mở file import để xem props và trách nhiệm.'
}

function formatFeatureLabel(featureId) {
  const known = FEATURE_LABEL[featureId]
  if (known) return known
  const id = String(featureId || '').trim()
  if (!id) return 'Unknown'
  return id
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function resolveComponentsFromRaw({ entryFile, raw, srcIndex }) {
  const imports = parseImports(raw)
  const componentImports = extractComponentImports(imports)
  return componentImports
    .map((it) => {
      const resolvedSrc = resolveImportToSrcPath(entryFile, it.source)
      const resolvedFile = resolveToExistingSrcFile(srcIndex, resolvedSrc)
      return {
        name: it.name,
        source: it.source,
        resolvedFile,
        target: resolvedFile || it.source,
      }
    })
    .filter((it) => it.resolvedFile || it.source.startsWith('.') || it.source.startsWith('/src/') || it.source.startsWith('src/'))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function FeatureEntry({ entry, srcIndex, rawServiceFiles }) {
  const imports = useMemo(() => parseImports(entry.raw), [entry.raw])
  const importedComponents = useMemo(() => extractImportedComponentNames(imports), [imports])
  const hooks = useMemo(() => extractHooks(entry.raw), [entry.raw])
  const returnLine = useMemo(() => findReturnLine(entry.raw), [entry.raw])

  const serviceUsage = useMemo(() => {
    const serviceImports = imports.filter((it) => String(it.source || '').includes('/services/'))
    if (!serviceImports.length) return []
    const out = []
    for (const it of serviceImports) {
      const resolvedSrc = resolveImportToSrcPath(entry.file, it.source)
      const resolvedFile = resolveToExistingSrcFile(srcIndex, resolvedSrc)
      const viteKey = toViteSrcKey(resolvedFile)
      const raw = rawServiceFiles?.[viteKey]
      const endpoints = extractServiceEndpoints(raw)
      out.push({
        source: it.source,
        file: resolvedFile || it.source,
        endpoints,
      })
    }
    return out
      .filter((x) => x.file)
      .sort((a, b) => String(a.file).localeCompare(String(b.file)))
  }, [entry.file, imports, rawServiceFiles, srcIndex])

  const screenComponents = useMemo(() => {
    if (entry.kind !== 'screen') return []
    return resolveComponentsFromRaw({ entryFile: entry.file, raw: entry.raw, srcIndex })
  }, [entry.file, entry.kind, entry.raw, srcIndex])

  return (
    <details className="rounded-3xl border border-slate-200 bg-white p-5">
      <summary className="cursor-pointer select-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">{entry.title}</div>
            <div className="mt-1 text-sm text-slate-600">{entry.file}</div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {entry.area ? (
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800">{entry.area}</div>
            ) : null}
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {formatFeatureLabel(entry.feature)}
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{entry.kind}</div>
          </div>
        </div>
      </summary>

      <div className="mt-4 grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Cách đọc nhanh file này (cho người mới)</div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Nhìn phần import để biết component/hook/service nào đang được dùng.</li>
            <li>Tìm các state/hàm handler (thường là handleX) để hiểu dữ liệu thay đổi ra sao.</li>
            <li>Tìm đoạn return(...) để hiểu UI được compose như thế nào.</li>
            <li>Nếu có fetch API, thường nằm trong useEffect hoặc trong handler gọi service.</li>
          </ol>
        </div>

        {imports.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Imports (component/hook/service đang dùng)</div>
            <div className="mt-2 grid gap-2">
              {imports.map((it) => (
                <div key={`${it.spec}:${it.source}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-xs font-semibold text-slate-800">
                    <span className="font-mono">{it.spec}</span> <span className="text-slate-500">from</span>{' '}
                    <span className="font-mono text-slate-700">{it.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {hooks.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Hooks xuất hiện trong file</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {hooks.map((h) => (
                <li key={h}>
                  <span className="font-semibold">{h}</span>: {explainHook(h)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {serviceUsage.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Services & API đang được gọi (theo import)</div>
            <div className="mt-1 text-xs text-slate-600">
              Nếu endpoint không hiện ra, thường do url được build bằng template string hoặc gọi qua helper khác.
            </div>
            <div className="mt-3 grid gap-2">
              {serviceUsage.map((s) => (
                <details key={s.file} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <summary className="cursor-pointer select-none text-xs font-semibold text-slate-800">
                    <span className="font-mono">{s.file}</span>{' '}
                    <span className="text-slate-500">·</span>{' '}
                    <span className="text-slate-600">{s.endpoints.length} endpoint</span>
                  </summary>
                  {s.endpoints.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
                      {s.endpoints.map((e) => (
                        <li key={`${e.method}:${e.url}`}>
                          <span className="font-semibold">{e.method}</span> <span className="font-mono">{e.url}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-xs text-slate-600">Không trích được endpoint từ file service này.</div>
                  )}
                </details>
              ))}
            </div>
          </div>
        ) : null}

        {importedComponents.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Các component chính (đọc để hiểu UI)</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {importedComponents.map((name) => {
                const importSource = imports.find((it) => it.spec.includes(name))?.source ?? ''
                return (
                  <li key={name}>
                    <span className="font-semibold">{name}</span>: {explainImportedComponent(name, importSource)}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {screenComponents.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-900">Component mà screen đang dùng (theo import)</div>
            <div className="mt-1 text-xs text-slate-600">
              Gợi ý: mở các file này trước để hiểu screen được compose từ đâu.
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {screenComponents.map((it) => (
                <li key={`${it.name}:${it.source}`}>
                  <span className="font-semibold">{it.name}</span>{' '}
                  <span className="text-slate-500">→</span>{' '}
                  <span className="font-mono text-slate-800">{it.resolvedFile || it.source}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-3">
          <CodeSection
            title="Xem đoạn import + phần đầu file"
            meta={`${entry.file} (L1-L60)`}
            explanation="Đoạn này cho biết file phụ thuộc gì và bắt đầu khai báo component như thế nào."
            code={sliceLines(entry.raw, 1, 60)}
          />
          <CodeSection
            title="Xem đoạn return(...) (JSX) thường là nơi hiểu UI nhanh nhất"
            meta={`${entry.file} (quanh return, tự động tìm)`}
            explanation={
              returnLine
                ? `Gợi ý: return(...) bắt đầu khoảng dòng ${returnLine}.`
                : 'Không tìm thấy return(...) theo pattern phổ biến, hãy mở toàn bộ file.'
            }
            code={returnLine ? sliceLines(entry.raw, Math.max(1, returnLine - 3), returnLine + 90) : sliceLines(entry.raw, 1, 120)}
          />
          <CodeSection title="Xem toàn bộ file" meta={entry.file} code={String(entry.raw ?? '').trimEnd()} />
        </div>
      </div>
    </details>
  )
}

export default function FeatureKnowledge() {
  const [q, setQ] = useState('')
  const [feature, setFeature] = useState('all')
  const [kind, setKind] = useState('all')

  const srcIndex = useMemo(() => {
    return import.meta.glob('/src/**/*.{js,jsx,ts,tsx}')
  }, [])

  const rawFeatureFiles = useMemo(() => {
    const pages = import.meta.glob('/src/features/**/pages/**/*.{js,jsx,ts,tsx}', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
    return pages
  }, [])

  const rawComponentFolderFiles = useMemo(() => {
    const files = import.meta.glob('/src/features/**/components/**/*.{js,jsx,ts,tsx}', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
    return files
  }, [])

  const rawServiceFiles = useMemo(() => {
    const files = import.meta.glob('/src/services/**/*.{js,ts}', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
    return files
  }, [])

  const entries = useMemo(() => {
    return Object.entries(rawFeatureFiles)
      .map(([vitePath, raw]) => {
        const file = normalizeVitePath(vitePath)
        const afterFeatures = file.split('src/features/')[1] ?? ''
        const featureName = afterFeatures.split('/')[0] || 'unknown'
        const afterPages = afterFeatures.split('/pages/')[1] ?? ''
        const entryKind = afterPages.includes('/') ? 'component' : 'screen'
        const baseName = afterPages.split('/').slice(-1)[0] || file.split('/').slice(-1)[0]
        const title = baseName.replace(/\.(jsx|tsx|js|ts)$/i, '')
        return {
          id: file,
          title,
          file,
          feature: featureName,
          kind: entryKind,
          area: 'pages',
          raw,
        }
      })
      .sort((a, b) => a.file.localeCompare(b.file))
  }, [rawFeatureFiles])

  const componentFolderEntries = useMemo(() => {
    return Object.entries(rawComponentFolderFiles)
      .map(([vitePath, raw]) => {
        const file = normalizeVitePath(vitePath)
        const afterFeatures = file.split('src/features/')[1] ?? ''
        const featureName = afterFeatures.split('/')[0] || 'unknown'
        const afterComponents = afterFeatures.split('/components/')[1] ?? ''
        const baseName = afterComponents.split('/').slice(-1)[0] || file.split('/').slice(-1)[0]
        const title = baseName.replace(/\.(jsx|tsx|js|ts)$/i, '')
        return {
          id: file,
          title,
          file,
          feature: featureName,
          kind: 'component',
          area: 'components',
          raw,
        }
      })
      .sort((a, b) => a.file.localeCompare(b.file))
  }, [rawComponentFolderFiles])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (feature !== 'all' && e.feature !== feature) return false
      if (kind !== 'all' && e.kind !== kind) return false
      return matchesQuery(e, q)
    })
  }, [entries, feature, kind, q])

  const breakdownByFeature = useMemo(() => {
    const map = new Map()
    const add = (featureId, key, entry) => {
      const id = featureId || 'unknown'
      if (!map.has(id)) map.set(id, { pages: [], components: [] })
      map.get(id)[key].push(entry)
    }
    for (const e of entries) add(e.feature, 'pages', e)
    for (const e of componentFolderEntries) add(e.feature, 'components', e)

    const out = []
    for (const [featureId, group] of map.entries()) {
      out.push({
        featureId,
        pages: group.pages,
        components: group.components,
      })
    }
    out.sort((a, b) => a.featureId.localeCompare(b.featureId))
    return out
  }, [componentFolderEntries, entries])

  const componentsByFeature = useMemo(() => {
    const map = new Map()
    for (const e of entries) {
      if (e.kind !== 'screen') continue
      const featureId = e.feature || 'unknown'
      if (!map.has(featureId)) map.set(featureId, new Map())
      const featureMap = map.get(featureId)

      const comps = resolveComponentsFromRaw({ entryFile: e.file, raw: e.raw, srcIndex })
      for (const c of comps) {
        const key = c.resolvedFile || c.source
        if (!featureMap.has(key)) {
          featureMap.set(key, { name: c.name, target: c.target })
        }
      }
    }

    const out = {}
    for (const [featureId, featureMap] of map.entries()) {
      out[featureId] = Array.from(featureMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    }
    return out
  }, [entries, srcIndex])

  const filteredComponentsByFeature = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return componentsByFeature
    const out = {}
    for (const [featureId, list] of Object.entries(componentsByFeature)) {
      out[featureId] = list.filter((it) => `${it.name} ${it.target}`.toLowerCase().includes(query))
    }
    return out
  }, [componentsByFeature, q])

  const componentFeatureIds = useMemo(() => {
    return Object.keys(componentsByFeature).sort((a, b) => a.localeCompare(b))
  }, [componentsByFeature])

  const componentCountByFeature = useMemo(() => {
    const out = {}
    for (const [featureId, list] of Object.entries(componentsByFeature)) {
      out[featureId] = list.length
    }
    return out
  }, [componentsByFeature])

  const countsByFeature = useMemo(() => {
    return entries.reduce((acc, e) => {
      const key = e.feature || 'unknown'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }, [entries])

  const featureOptions = useMemo(() => {
    const ids = Array.from(new Set(entries.map((e) => e.feature).filter(Boolean))).sort((a, b) => a.localeCompare(b))
    return [{ id: 'all', label: 'Tất cả' }, ...ids.map((id) => ({ id, label: formatFeatureLabel(id) }))]
  }, [entries])

  const countsByKind = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        const key = e.kind || 'unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      { all: entries.length }
    )
  }, [entries])

  const kindOptions = useMemo(() => {
    return [
      { id: 'all', label: 'Tất cả' },
      { id: 'screen', label: 'Screen' },
      { id: 'component', label: 'Component' },
    ]
  }, [])

  const foundations = useMemo(
    () => [
      {
        title: 'Routing: AppRoutes.jsx',
        meta: 'src/app/routes/AppRoutes.jsx',
        explanation:
          'Toàn bộ màn hình được mount qua Route. Các route cần login/role sẽ được bọc ProtectedRoute. Khi muốn thêm page mới: thêm PATHS → lazyPages → AppRoutes.',
        code: sliceLines(appRoutesRaw, 1, 120),
      },
      {
        title: 'Guard theo token/role: ProtectedRoute.jsx',
        meta: 'src/app/auth/ProtectedRoute.jsx',
        explanation:
          'Nếu thiếu token/user trong sessionStorage thì redirect về login. Nếu role không thuộc allowed roles thì redirect sang unauthorized.',
        code: sliceLines(protectedRouteRaw, 1, 60),
      },
      {
        title: 'Layout theo role: RoleLayout.jsx',
        meta: 'src/shared/layout/RoleLayout.jsx',
        explanation:
          'RoleLayout nhận sidebar/navbar/footer qua props và render children ở giữa. Đây là ví dụ quan trọng về "composition" trong React.',
        code: sliceLines(roleLayoutRaw, 1, 80),
      },
      {
        title: 'HTTP client: axios + interceptor',
        meta: 'src/services/http/client.js',
        explanation:
          'Đây là “đầu vào” của mọi request API. DEV dùng Vite proxy (/api) nên baseURL="". Interceptor tự gắn Bearer token (trừ login/register), xử lý FormData để upload ảnh, và chuẩn hoá lỗi thành ApiError.',
        code: sliceLines(clientRaw, 1, 55),
      },
      {
        title: 'Chuẩn hoá error: ApiError',
        meta: 'src/services/http/ApiError.js',
        explanation:
          'Thay vì throw object lạ, project chuẩn hoá lỗi về ApiError(message, { status, data, url }). UI thường chỉ cần dùng err.message.',
        code: sliceLines(apiErrorRaw, 1, 9),
      },
      {
        title: 'Chuẩn hoá response: unwrapApiResponse',
        meta: 'src/services/http/unwrapApiResponse.js',
        explanation:
          'Backend đôi khi wrap payload dưới key result. Helper này lấy data.result nếu có, còn không thì trả data để service/UI không cần quan tâm format response.',
        code: sliceLines(unwrapApiResponseRaw, 1, 4),
      },
      {
        title: 'Toast/notify: Provider + hook',
        meta: 'src/shared/ui/NotifyProvider.jsx + src/shared/hooks/useNotify.js',
        explanation:
          'Pattern dùng chung để show toast: bọc app bằng <NotifyProvider>, rồi gọi const notify = useNotify(); notify.success/error hoặc notify.promise(promise, opts).',
        code: `${sliceLines(notifyProviderRaw, 90, 148)}\n\n${sliceLines(useNotifyRaw, 1, 8)}`,
      },
      {
        title: 'Toast/notify: helper notifyPromise',
        meta: 'src/notifications/notifyCore.js',
        explanation:
          'Helper này giúp UI hiển thị loading → success/error theo vòng đời của một promise (thường dùng khi submit form hoặc gọi API).',
        code: sliceLines(notifyCoreRaw, 1, 47),
      },
    ],
    []
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Project Knowledge · Feature Pages</h1>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="underline underline-offset-4" to={PATHS.home}>
            Home
          </Link>
          <Link className="underline underline-offset-4" to={PATHS.dev.apiKnowledge}>
            API Knowledge
          </Link>
          <Link className="underline underline-offset-4" to={PATHS.dev.apiTest}>
            API Test
          </Link>
        </div>
      </div>

      <div className="mt-2 text-sm text-slate-600">
        Trang này tổng hợp kiến thức về các screen/component trong <span className="font-mono">src/features/**/pages</span>,
        kèm cách đọc code theo hướng "người mới học React".
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">Kiến thức nền (bắt buộc hiểu trước)</div>
        <div className="mt-1 text-sm text-slate-600">
          Nếu bạn hiểu 3 khối này, bạn sẽ lần ra được hầu hết cách các page trong features hoạt động.
        </div>
        <div className="mt-4 grid gap-3">
          {foundations.map((b) => (
            <CodeSection key={b.title} title={b.title} meta={b.meta} explanation={b.explanation} code={b.code} />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">Checklist học React theo project này</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Component = function trả về JSX. JSX là "cú pháp giống HTML" nhưng thực ra là JavaScript.</li>
          <li>Props = input của component. Parent truyền props xuống child để cấu hình/đổ dữ liệu.</li>
          <li>State = dữ liệu thay đổi theo tương tác. Khi state đổi, component render lại.</li>
          <li>Effect = phần chạy "ngoài render" như fetch API, đồng bộ, timer.</li>
          <li>Composition = parent ghép các child component (ví dụ RoleLayout nhận sidebar/navbar/footer).</li>
        </ul>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">Giải thích code theo feature (pages + components)</div>
        <div className="mt-1 text-sm text-slate-600">
          Ví dụ với <span className="font-mono">admin</span>: xem lần lượt folder <span className="font-mono">pages</span> và{' '}
          <span className="font-mono">components</span>. Các feature khác làm tương tự.
        </div>
        <div className="mt-4 grid gap-3">
          {breakdownByFeature
            .filter((g) => feature === 'all' || g.featureId === feature)
            .map((g) => {
              const pagesFiltered = g.pages.filter((e) => matchesQuery(e, q))
              const componentsFiltered = g.components.filter((e) => matchesQuery(e, q))
              return (
                <details key={g.featureId} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-slate-900">
                    {formatFeatureLabel(g.featureId)} · pages {pagesFiltered.length}/{g.pages.length} · components{' '}
                    {componentsFiltered.length}/{g.components.length}
                  </summary>

                  <div className="mt-4 grid gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold text-slate-900">Cách đọc feature này</div>
                      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                        <li>Vào folder pages: đọc các screen trước (file nằm trực tiếp trong pages).</li>
                        <li>Mỗi screen sẽ import các component/layout/ui/service: xem phần “Imports”.</li>
                        <li>Nếu feature có folder components: đọc các component đó để hiểu UI con/tái sử dụng.</li>
                        <li>Từ screen: xem nhanh đoạn return(...) để nắm bố cục UI.</li>
                      </ol>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-900">Folder pages</div>
                      <div className="mt-3 grid gap-3">
                        {(pagesFiltered.length ? pagesFiltered : g.pages).map((e) => (
                          <FeatureEntry key={e.id} entry={e} srcIndex={srcIndex} rawServiceFiles={rawServiceFiles} />
                        ))}
                        {!g.pages.length ? <div className="mt-2 text-sm text-slate-600">Không có file pages.</div> : null}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-slate-900">Folder components</div>
                      <div className="mt-3 grid gap-3">
                        {(componentsFiltered.length ? componentsFiltered : g.components).map((e) => (
                          <FeatureEntry key={e.id} entry={e} srcIndex={srcIndex} rawServiceFiles={rawServiceFiles} />
                        ))}
                        {!g.components.length ? (
                          <div className="mt-2 text-sm text-slate-600">Feature này chưa có folder components.</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </details>
              )
            })}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">Components theo feature</div>
        <div className="mt-1 text-sm text-slate-600">
          Tổng hợp từ các import trong screen (không phải scan toàn bộ codebase).
        </div>
        {feature === 'all' ? (
          <div className="mt-4 grid gap-3">
            {componentFeatureIds.map((fid) => {
              const list = filteredComponentsByFeature[fid] || []
              const total = componentCountByFeature[fid] || 0
              return (
                <details key={fid} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-slate-900">
                    {formatFeatureLabel(fid)} ({list.length}/{total})
                  </summary>
                  {list.length ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {list.map((it) => (
                        <li key={`${it.name}:${it.target}`}>
                          <span className="font-semibold">{it.name}</span>{' '}
                          <span className="text-slate-500">→</span>{' '}
                          <span className="font-mono text-slate-800">{it.target}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-3 text-sm text-slate-600">Không có component khớp filter/search hiện tại.</div>
                  )}
                </details>
              )
            })}
          </div>
        ) : (
          <div className="mt-4">
            {(() => {
              const list = filteredComponentsByFeature[feature] || []
              const total = componentCountByFeature[feature] || 0
              return (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {formatFeatureLabel(feature)} ({list.length}/{total})
                  </div>
                  {list.length ? (
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {list.map((it) => (
                        <li key={`${it.name}:${it.target}`}>
                          <span className="font-semibold">{it.name}</span>{' '}
                          <span className="text-slate-500">→</span>{' '}
                          <span className="font-mono text-slate-800">{it.target}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-sm text-slate-600">Không có component khớp filter/search hiện tại.</div>
                  )}
                </div>
              )
            })()}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-slate-900">Danh sách file trong features</div>
          <div className="mt-1 text-sm text-slate-600">
            Đang hiển thị: <span className="font-semibold text-slate-800">{filtered.length}</span> / {entries.length}
          </div>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên file, component, hook..."
          className="h-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="mr-2 text-sm font-semibold text-slate-700">Filter feature:</div>
        {featureOptions.map((opt) => {
          const active = feature === opt.id
          const count = opt.id === 'all' ? entries.length : countsByFeature[opt.id] || 0
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFeature(opt.id)}
              className={
                active
                  ? 'rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white'
                  : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200'
              }
            >
              {opt.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="mr-2 text-sm font-semibold text-slate-700">Filter loại:</div>
        {kindOptions.map((opt) => {
          const active = kind === opt.id
          const count = countsByKind[opt.id] || 0
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setKind(opt.id)}
              className={
                active
                  ? 'rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white'
                  : 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200'
              }
            >
              {opt.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.map((e) => (
          <FeatureEntry key={e.id} entry={e} srcIndex={srcIndex} rawServiceFiles={rawServiceFiles} />
        ))}
      </div>
    </div>
  )
}
