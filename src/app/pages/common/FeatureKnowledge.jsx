import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PATHS } from '../../routes/paths.js'

import protectedRouteRaw from '../../auth/ProtectedRoute.jsx?raw'
import roleLayoutRaw from '../../../shared/layout/RoleLayout.jsx?raw'
import appRoutesRaw from '../../routes/AppRoutes.jsx?raw'

function normalizeVitePath(p) {
  return String(p || '').replace(/^\/src\//, 'src/')
}

function sliceLines(raw, from, to) {
  const lines = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
  const start = Math.max(1, Number(from) || 1)
  const end = Math.max(start, Number(to) || start)
  return lines.slice(start - 1, end).join('\n').trimEnd()
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

function FeatureEntry({ entry }) {
  const imports = useMemo(() => parseImports(entry.raw), [entry.raw])
  const importedComponents = useMemo(() => extractImportedComponentNames(imports), [imports])
  const hooks = useMemo(() => extractHooks(entry.raw), [entry.raw])
  const returnLine = useMemo(() => findReturnLine(entry.raw), [entry.raw])

  return (
    <details className="rounded-3xl border border-slate-200 bg-white p-5">
      <summary className="cursor-pointer select-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">{entry.title}</div>
            <div className="mt-1 text-sm text-slate-600">{entry.file}</div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {FEATURE_LABEL[entry.feature] ?? entry.feature}
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

  const rawFeatureFiles = useMemo(() => {
    const pages = import.meta.glob('/src/features/**/pages/**/*.jsx', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
    return pages
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
        const title = baseName.replace(/\.jsx$/i, '')
        return {
          id: file,
          title,
          file,
          feature: featureName,
          kind: entryKind,
          raw,
        }
      })
      .sort((a, b) => a.file.localeCompare(b.file))
  }, [rawFeatureFiles])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return entries.filter((e) => {
      if (feature !== 'all' && e.feature !== feature) return false
      if (kind !== 'all' && e.kind !== kind) return false
      if (!query) return true
      const hay = `${e.title} ${e.file} ${String(e.raw ?? '')}`.toLowerCase()
      return hay.includes(query)
    })
  }, [entries, feature, kind, q])

  const featureOptions = useMemo(
    () => [
      { id: 'all', label: 'Tất cả' },
      { id: 'auth', label: 'Auth' },
      { id: 'home', label: 'Home' },
      { id: 'citizen', label: 'Citizen' },
      { id: 'collector', label: 'Collector' },
      { id: 'enterprise', label: 'Enterprise' },
      { id: 'admin', label: 'Admin' },
    ],
    []
  )

  const kindOptions = useMemo(
    () => [
      { id: 'all', label: 'Tất cả' },
      { id: 'screen', label: 'Screen' },
      { id: 'component', label: 'Component' },
    ],
    []
  )

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
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="mr-2 text-sm font-semibold text-slate-700">Filter loại:</div>
        {kindOptions.map((opt) => {
          const active = kind === opt.id
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
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6 grid gap-4">
        {filtered.map((e) => (
          <FeatureEntry key={e.id} entry={e} />
        ))}
      </div>
    </div>
  )
}
