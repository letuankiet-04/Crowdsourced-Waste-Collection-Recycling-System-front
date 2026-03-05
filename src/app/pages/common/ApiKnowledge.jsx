import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PATHS } from '../../routes/paths.js'

import clientRaw from '../../../services/http/client.js?raw'
import apiErrorRaw from '../../../services/http/ApiError.js?raw'
import unwrapApiResponseRaw from '../../../services/http/unwrapApiResponse.js?raw'

import authServiceRaw from '../../../services/auth.service.js?raw'
import animatedAuthRaw from '../../../features/auth/pages/AnimatedAuth.jsx?raw'
import apiTestRaw from './ApiTest.jsx?raw'
import sidebarLogoutButtonRaw from '../../../shared/layout/sidebar/SidebarLogoutButton.jsx?raw'
import collectorNavbarRaw from '../../../features/collector/components/navigation/CollectorNavbar.jsx?raw'
import enterpriseNavbarRaw from '../../../features/enterprise/components/navigation/EnterpriseNavbar.jsx?raw'
import userProfileRaw from '../../../shared/components/user/UserProfile.jsx?raw'

import citizenServiceRaw from '../../../services/citizen.service.js?raw'
import pointWalletRaw from '../../../features/citizen/components/dashboard/PointWallet.jsx?raw'
import pointHistoryRaw from '../../../features/citizen/pages/PointHistory.jsx?raw'
import citizenReportDetailRaw from '../../../features/citizen/pages/Citizen_ReportDetail.jsx?raw'
import recentReportsRaw from '../../../features/citizen/components/dashboard/RecentReports.jsx?raw'

import reportsServiceRaw from '../../../services/reports.service.js?raw'
import createReportFormRaw from '../../../features/citizen/components/reports/CreateReportForm.jsx?raw'
import citizenReportsRaw from '../../../features/citizen/pages/Citizen_Reports.jsx?raw'

import collectorServiceRaw from '../../../services/collector.service.js?raw'
import collectorTasksRaw from '../../../features/collector/pages/Collector_Tasks.jsx?raw'
import collectorReportDetailRaw from '../../../features/collector/pages/Collector_ReportDetail.jsx?raw'
import collectorDashboardRaw from '../../../features/collector/pages/Collector_Dashboard.jsx?raw'
import collectorHistoryRaw from '../../../features/collector/pages/Collector_History.jsx?raw'
import collectReportDialogRaw from '../../../components/collector/CollectReportDialog.jsx?raw'

import enterpriseServiceRaw from '../../../services/enterprise.service.js?raw'
import enterpriseReportsRaw from '../../../features/enterprise/pages/Enterprise_Reports.jsx?raw'
import enterpriseReportDetailRaw from '../../../features/enterprise/pages/Enterprise_ReportDetail.jsx?raw'
import enterpriseDashboardRaw from '../../../features/enterprise/pages/Enterprise_Dashboard.jsx?raw'
import enterpriseActiveCollectorRaw from '../../../features/enterprise/pages/Enterprise_ActiveCollector.jsx?raw'
import enterpriseAdminPanelRaw from '../../../features/enterprise/pages/Enterprise_AdminPanel.jsx?raw'

import notificationsServiceRaw from '../../../services/notifications.js?raw'
import notificationBellRaw from '../../../shared/ui/NotificationBell.jsx?raw'

import adminServiceRaw from '../../../services/admin.service.js?raw'
import adminUserManagementRaw from '../../../features/admin/pages/Admin_UserManagement.jsx?raw'

import rewardsServiceRaw from '../../../services/rewards.service.js?raw'
import imageUploaderRaw from '../../../shared/ui/ImageUploader.jsx?raw'
import useImagePreviewsRaw from '../../../shared/hooks/useImagePreviews.js?raw'
import confirmDialogRaw from '../../../shared/ui/ConfirmDialog.jsx?raw'
import goongMapPickerRaw from '../../../shared/components/maps/GoongMapPicker.jsx?raw'
import goongMapViewRaw from '../../../shared/components/maps/GoongMapView.jsx?raw'
import reportLocationCardRaw from '../../../shared/layout/ReportLocationCard.jsx?raw'
import reportPhotosCardRaw from '../../../shared/layout/ReportPhotosCard.jsx?raw'
import wasteItemsTableRaw from '../../../shared/ui/WasteItemsTable.jsx?raw'
import wasteTypesRaw from '../../../shared/constants/wasteTypes.js?raw'

const ACTOR_LABEL = {
  auth: 'Auth',
  citizen: 'Citizen',
  collector: 'Collector',
  enterprise: 'Enterprise',
  admin: 'Admin',
  notifications: 'Notifications',
  external: 'External',
}

function sliceLines(raw, from, to) {
  const lines = String(raw ?? '').replace(/\r\n/g, '\n').split('\n')
  const start = Math.max(1, Number(from) || 1)
  const end = Math.max(start, Number(to) || start)
  return lines.slice(start - 1, end).join('\n').trimEnd()
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

function ApiEntry({ entry }) {
  const serviceTitle = entry.serviceTitle ?? 'Xem code chính'
  const callTitlePrefix = entry.callTitlePrefix ?? 'Xem code nơi được dùng'
  return (
    <details className="rounded-3xl border border-slate-200 bg-white p-5">
      <summary className="cursor-pointer select-none">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">{entry.title}</div>
            <div className="mt-1 text-sm text-slate-600">{entry.request}</div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{entry.group}</div>
            {(Array.isArray(entry.actors) ? entry.actors : []).map((a) => (
              <div key={a} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {ACTOR_LABEL[a] ?? a}
              </div>
            ))}
          </div>
        </div>
      </summary>

      {entry.logic?.length ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {entry.logic.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 grid gap-3">
        <CodeSection
          title={serviceTitle}
          meta={`${entry.service.file} (L${entry.service.from}-L${entry.service.to})`}
          explanation={entry.service.explain}
          code={sliceLines(entry.service.raw, entry.service.from, entry.service.to)}
        />
        {entry.calls.map((c) => (
          <CodeSection
            key={`${c.file}:${c.from}:${c.to}`}
            title={`${callTitlePrefix}: ${c.label}`}
            meta={`${c.file} (L${c.from}-L${c.to})`}
            explanation={c.explain}
            code={sliceLines(c.raw, c.from, c.to)}
          />
        ))}
      </div>
    </details>
  )
}

export default function ApiKnowledge() {
  const [q, setQ] = useState('')
  const [actor, setActor] = useState('all')

  const actorOptions = useMemo(
    () => [
      { id: 'all', label: 'Tất cả' },
      { id: 'citizen', label: 'Citizen' },
      { id: 'collector', label: 'Collector' },
      { id: 'enterprise', label: 'Enterprise' },
      { id: 'admin', label: 'Admin' },
      { id: 'auth', label: 'Auth' },
      { id: 'notifications', label: 'Notifications' },
      { id: 'external', label: 'External' },
    ],
    []
  )

  const entries = useMemo(
    () => [
      {
        id: 'ui.images.flow',
        group: 'UI Patterns',
        title: 'Ảnh: chọn → preview → upload → hiển thị',
        request: 'ImageUploader + FormData(images) + report.images/collectedImages',
        actors: ['citizen', 'collector'],
        logic: [
          'UI chọn ảnh bằng <input type="file"> trong ImageUploader, validate type/size, rồi trả File[] về parent qua onFilesChange.',
          'Preview dùng URL.createObjectURL(file) (blob URL) trong hook useImagePreviews; có revokeObjectURL khi remove/unmount để tránh leak.',
          'Khi submit, payload chứa images: File[]; service build FormData và append nhiều lần key "images".',
          'Axios request interceptor xoá Content-Type khi data là FormData để axios tự set multipart boundary.',
          'Sau khi backend lưu, UI render ảnh bằng chuỗi URL/path từ report.images / report.collectedImages.',
        ],
        serviceTitle: 'Xem code chính: chọn ảnh + trả File[]',
        service: {
          file: 'src/shared/ui/ImageUploader.jsx',
          raw: imageUploaderRaw,
          from: 34,
          to: 74,
          explain: 'useImagePreviews quản lý items { file, url }; effect bắn onFilesChange(File[]) và onItemsChange(items) khi items đổi.',
        },
        callTitlePrefix: 'Xem code liên quan',
        calls: [
          {
            label: 'Hook tạo preview + cleanup blob URL',
            file: 'src/shared/hooks/useImagePreviews.js',
            raw: useImagePreviewsRaw,
            from: 1,
            to: 68,
            explain: 'addFiles/replaceFiles tạo URL.createObjectURL, removeAt/clear/unmount revokeObjectURL.',
          },
          {
            label: 'UI preview + thumbnail + remove',
            file: 'src/shared/ui/ImageUploader.jsx',
            raw: imageUploaderRaw,
            from: 76,
            to: 135,
            explain: 'active.url dùng cho ảnh preview; items[idx].url cho thumbnails.',
          },
          {
            label: 'Citizen create report: lấy File[] từ ImageUploader',
            file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
            raw: createReportFormRaw,
            from: 304,
            to: 313,
            explain: 'onFilesChange={setImages} đưa File[] vào state images.',
          },
          {
            label: 'Citizen create report: đưa images vào payload submit',
            file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
            raw: createReportFormRaw,
            from: 225,
            to: 255,
            explain: 'payload.images = File[]; createReport()/updateReport() nhận payload.',
          },
          {
            label: 'Citizen reports service: build FormData(images)',
            file: 'src/services/reports.service.js',
            raw: reportsServiceRaw,
            from: 14,
            to: 32,
            explain: 'append "images" cho từng File; kèm latitude/longitude/address/description/categoryIds/quantities.',
          },
          {
            label: 'Axios interceptor: FormData không set Content-Type thủ công',
            file: 'src/services/http/client.js',
            raw: clientRaw,
            from: 15,
            to: 31,
            explain: 'Nếu tự set Content-Type multipart sẽ mất boundary và backend có thể không parse được.',
          },
          {
            label: 'Hiển thị ảnh từ URL backend trả về',
            file: 'src/shared/layout/ReportPhotosCard.jsx',
            raw: reportPhotosCardRaw,
            from: 1,
            to: 56,
            explain: 'Render trực tiếp <img src={src}> từ report.images/collectedImages.',
          },
        ],
      },
      {
        id: 'ui.confirmDialog.pattern',
        group: 'UI Patterns',
        title: 'ConfirmDialog: xác nhận hành động (delete/accept/start/submit)',
        request: 'ConfirmDialog (portal + lock scroll) + pattern confirmConfig',
        actors: ['citizen', 'collector', 'enterprise'],
        logic: [
          'ConfirmDialog là modal dùng createPortal(document.body), click backdrop để close, có nút Cancel/Confirm.',
          'Khi open=true, dialog lock body scroll và tự unlock khi đóng/unmount.',
          'Pattern đơn giản: boolean open + onConfirm thực thi action (Citizen remove report).',
          'Pattern linh hoạt: confirmConfig lưu title/description/confirmText/action để dùng chung 1 dialog (Collector update status).',
          'Nên close dialog trước rồi mới chạy action để UI phản hồi nhanh và tránh double submit.',
        ],
        serviceTitle: 'Xem code chính: ConfirmDialog',
        service: {
          file: 'src/shared/ui/ConfirmDialog.jsx',
          raw: confirmDialogRaw,
          from: 1,
          to: 70,
          explain: 'useEffect(lockBodyScroll) khi open; createPortal render overlay + buttons.',
        },
        callTitlePrefix: 'Xem code nơi dùng',
        calls: [
          {
            label: 'Citizen remove report',
            file: 'src/features/citizen/pages/Citizen_ReportDetail.jsx',
            raw: citizenReportDetailRaw,
            from: 246,
            to: 288,
            explain: 'Remove Report mở confirm; onConfirm gọi deleteReport(reportId) rồi navigate.',
          },
          {
            label: 'Collector accept/start/confirm collected (confirmConfig)',
            file: 'src/features/collector/pages/Collector_ReportDetail.jsx',
            raw: collectorReportDetailRaw,
            from: 227,
            to: 348,
            explain: 'Các button setConfirmConfig({ title, description, action }) và ConfirmDialog chạy action sau khi đóng.',
          },
          {
            label: 'Collector submit collection report (confirm trước submit)',
            file: 'src/components/collector/CollectReportDialog.jsx',
            raw: collectReportDialogRaw,
            from: 380,
            to: 410,
            explain: 'Submit Report mở confirmOpen; onConfirm chạy handleSubmitConfirmed.',
          },
        ],
      },
      {
        id: 'ui.maps.goong',
        group: 'UI Patterns',
        title: 'Map picker + preview (Goong) + reverse geocode (Nominatim)',
        request: 'GoongMapPicker / GoongMapView + coords {lat,lng} + address lookup',
        actors: ['external', 'citizen', 'collector'],
        logic: [
          'Map picker (GoongMapPicker) init map 1 lần, click map phát onChange({ lat, lng }).',
          'Citizen create report: khi chọn GPS/map, UI gọi Nominatim reverse để fill address; khi nhập address, UI gọi Nominatim search để ra coords.',
          'Map preview (GoongMapView) nhận points=[{ coords:{lat,lng}, label }], vẽ marker, fitBounds và có nút Reset.',
          'Token map lấy từ import.meta.env.VITE_GOONG_MAPTILES_KEY; thiếu token thì render warning.',
        ],
        serviceTitle: 'Xem code chính: map picker (click → coords)',
        service: {
          file: 'src/shared/components/maps/GoongMapPicker.jsx',
          raw: goongMapPickerRaw,
          from: 1,
          to: 103,
          explain: 'map.on("click") lấy e.lngLat và notifyChange({lat,lng}); effect khác sync marker theo value.',
        },
        callTitlePrefix: 'Xem code liên quan',
        calls: [
          {
            label: 'Citizen create report: MapPicker + reverse geocode',
            file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
            raw: createReportFormRaw,
            from: 356,
            to: 427,
            explain: 'onChange(c) setCoords(c) rồi fetch Nominatim reverse để cập nhật address.',
          },
          {
            label: 'Map preview (fitBounds + markers)',
            file: 'src/shared/components/maps/GoongMapView.jsx',
            raw: goongMapViewRaw,
            from: 1,
            to: 124,
            explain: 'safePoints normalize lat/lng; effect vẽ markers; resetView fitBounds/zoom.',
          },
          {
            label: 'Report detail: map preview card',
            file: 'src/shared/layout/ReportLocationCard.jsx',
            raw: reportLocationCardRaw,
            from: 1,
            to: 49,
            explain: 'Tạo points từ reportedCoords/collectedCoords rồi render <GoongMapView points={points} />.',
          },
        ],
      },
      {
        id: 'citizen.wasteItems.flow',
        group: 'Citizen',
        title: 'Waste Items khi citizen tạo report hoạt động như thế nào',
        request: 'WasteItemsTable → payload(categoryIds/quantities) → FormData → backend categories',
        actors: ['citizen'],
        logic: [
          'UI load waste categories từ API /api/citizen/waste-categories rồi đưa vào WasteItemsTable (dropdown).',
          'WasteItemsTable không cho chọn trùng waste type; mỗi row gồm wasteTypeId + estimatedWeight.',
          'Khi submit, CreateReportForm chuẩn hoá + validate, rồi tạo payload.categoryIds và payload.quantities (mảng string).',
          'reports.service.js build FormData và appendMany(categoryIds/quantities) để backend nhận dạng array qua nhiều lần append cùng key.',
          'Khi edit report, Citizen_ReportDetail map apiReport.categories → editReport.wasteItems để fill lại bảng.',
        ],
        serviceTitle: 'Xem code chính: WasteItemsTable (UI chọn items)',
        service: {
          file: 'src/shared/ui/WasteItemsTable.jsx',
          raw: wasteItemsTableRaw,
          from: 1,
          to: 139,
          explain: 'selectedIds + available filter để tránh chọn trùng; onChange trả array items mới về parent.',
        },
        callTitlePrefix: 'Xem code liên quan',
        calls: [
          {
            label: 'Unit label (kg/can/bottle)',
            file: 'src/shared/constants/wasteTypes.js',
            raw: wasteTypesRaw,
            from: 1,
            to: 28,
            explain: 'formatWasteTypeUnit() map enum unit → label hiển thị.',
          },
          {
            label: 'Citizen create report: tạo payload categoryIds/quantities',
            file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
            raw: createReportFormRaw,
            from: 225,
            to: 255,
            explain: 'cleanedItems map theo categoryOptions; payload.categoryIds/quantities là mảng string.',
          },
          {
            label: 'Reports service: appendMany(categoryIds/quantities)',
            file: 'src/services/reports.service.js',
            raw: reportsServiceRaw,
            from: 4,
            to: 32,
            explain: 'appendMany() append nhiều lần cùng key; buildReprotFormData() đóng gói toàn bộ payload.',
          },
          {
            label: 'Citizen edit flow: map categories → wasteItems (Update Details)',
            file: 'src/features/citizen/pages/Citizen_ReportDetail.jsx',
            raw: citizenReportDetailRaw,
            from: 212,
            to: 242,
            explain: 'navigate createReport với state.editReport.wasteItems để CreateReportForm fill dữ liệu.',
          },
        ],
      },
      {
        id: 'citizen.points.flow',
        group: 'Citizen',
        title: 'Điểm citizen sau khi collector submit collection report',
        request: 'GET /api/citizen/rewards/history → sum item.point (FE) | side-effect tính điểm ở backend',
        actors: ['citizen', 'collector'],
        logic: [
          'Collector complete (POST /api/collector/collections/{id}/complete) không tự cộng điểm ở FE; nếu có cộng điểm thì là side-effect ở backend.',
          'FE hiển thị điểm bằng cách GET rewards history và tính tổng: totalPoints = sum(item.point).',
          'FE còn tính monthlyPoints theo createdAt và chỉ cộng point > 0 trong tháng hiện tại.',
          'Trang Point History nên render theo field point từ backend; hiện đang có chỗ dùng item.points (dễ hiển thị 0).',
        ],
        serviceTitle: 'Xem code chính: tính tổng điểm từ reward history',
        service: {
          file: 'src/services/rewards.service.js',
          raw: rewardsServiceRaw,
          from: 1,
          to: 33,
          explain: 'getCitizenPoints() GET /rewards/history rồi reduce theo item.point để ra totalPoints/monthlyPoints.',
        },
        callTitlePrefix: 'Xem code nơi dùng',
        calls: [
          {
            label: 'Widget PointWallet fetch totalPoints',
            file: 'src/features/citizen/pages/dashboard_comp/PointWallet.jsx',
            raw: pointWalletRaw,
            from: 1,
            to: 26,
            explain: 'useEffect gọi getCitizenPoints() và setPoints(totalPoints).',
          },
          {
            label: 'Points History UI (chú ý field point/points)',
            file: 'src/features/citizen/pages/PointHistory.jsx',
            raw: pointHistoryRaw,
            from: 162,
            to: 206,
            explain: 'Table render “Points Earned”; nên đọc đúng field backend trả về (service đang dùng item.point).',
          },
          {
            label: 'Collector complete task (tạo dữ liệu cho backend tính điểm)',
            file: 'src/services/collector.service.js',
            raw: collectorServiceRaw,
            from: 56,
            to: 77,
            explain: 'completeCollectorTask() gửi categoryIds/quantities + verificationRate + note + images + coords.',
          },
        ],
      },
      {
        id: 'auth.login',
        group: 'Auth',
        title: 'Đăng nhập',
        request: 'POST /api/auth/login',
        actors: ['auth', 'citizen', 'collector', 'enterprise', 'admin'],
        logic: [
          'UI gọi login() từ auth.service.js để lấy token.',
          'Axios interceptor tự gắn Authorization cho các request khác (trừ login/register).',
          'Response thường được wrap dưới key result nên gọi unwrapApiResponse(data).',
        ],
        service: {
          file: 'src/services/auth.service.js',
          raw: authServiceRaw,
          from: 66,
          to: 71,
          explain:
            'login() gọi axios.post, nhận { data } từ axios, rồi lấy payload thật bằng unwrapApiResponse(data). Nếu không có token thì throw lỗi.',
        },
        calls: [
          {
            label: 'AnimatedAuth.handleLogin',
            file: 'src/features/auth/pages/AnimatedAuth.jsx',
            raw: animatedAuthRaw,
            from: 85,
            to: 116,
            explain:
              'Sau khi login() trả về token, UI lưu token/user vào sessionStorage rồi điều hướng theo role.',
          },
          {
            label: 'ApiTest.handleLogin',
            file: 'src/app/pages/common/ApiTest.jsx',
            raw: apiTestRaw,
            from: 30,
            to: 43,
            explain: 'Trang dev test gọi login() trực tiếp để tiện debug API.',
          },
        ],
      },
      {
        id: 'auth.register',
        group: 'Auth',
        title: 'Đăng ký',
        request: 'POST /api/auth/register',
        actors: ['auth'],
        logic: [
          'UI gọi register() để tạo account và nhận token.',
          'register() map name → fullName theo backend contract.',
          'unwrapApiResponse(data) giúp đồng nhất format response.',
        ],
        service: {
          file: 'src/services/auth.service.js',
          raw: authServiceRaw,
          from: 73,
          to: 82,
          explain:
            'register() gọi /api/auth/register, backend có thể trả { result: {...} } hoặc trả thẳng object; unwrapApiResponse xử lý cả hai.',
        },
        calls: [
          {
            label: 'AnimatedAuth.handleSignup',
            file: 'src/features/auth/pages/AnimatedAuth.jsx',
            raw: animatedAuthRaw,
            from: 118,
            to: 149,
            explain:
              'Luồng tương tự login: lưu token + user vào sessionStorage và điều hướng theo role.',
          },
          {
            label: 'ApiTest.handleRegister',
            file: 'src/app/pages/common/ApiTest.jsx',
            raw: apiTestRaw,
            from: 45,
            to: 62,
            explain: 'Trang dev test gọi register() để tạo user test.',
          },
        ],
      },
      {
        id: 'auth.logout',
        group: 'Auth',
        title: 'Đăng xuất',
        request: 'POST /api/auth/logout',
        actors: ['auth', 'citizen', 'collector', 'enterprise', 'admin'],
        logic: [
          'UI gọi logout() để backend huỷ session/token (tuỳ backend).',
          'Sau đó UI thường xoá token/user trong sessionStorage.',
        ],
        service: {
          file: 'src/services/auth.service.js',
          raw: authServiceRaw,
          from: 84,
          to: 86,
          explain: 'logout() chỉ gọi POST /api/auth/logout (không unwrap vì không cần payload).',
        },
        calls: [
          {
            label: 'SidebarLogoutButton',
            file: 'src/shared/layout/sidebar/SidebarLogoutButton.jsx',
            raw: sidebarLogoutButtonRaw,
            from: 24,
            to: 39,
            explain: 'Nút logout dùng chung cho sidebar, gọi logout() rồi điều hướng về login.',
          },
          {
            label: 'CollectorNavbar',
            file: 'src/features/collector/pages/navbar/CollectorNavbar.jsx',
            raw: collectorNavbarRaw,
            from: 26,
            to: 44,
            explain: 'Navbar collector cũng có nút logout.',
          },
          {
            label: 'EnterpriseNavbar',
            file: 'src/features/enterprise/pages/navbar/EnterpriseNavbar.jsx',
            raw: enterpriseNavbarRaw,
            from: 19,
            to: 36,
            explain: 'Navbar enterprise cũng có nút logout.',
          },
          {
            label: 'ApiTest.handleLogout',
            file: 'src/app/pages/common/ApiTest.jsx',
            raw: apiTestRaw,
            from: 64,
            to: 76,
            explain: 'Trang dev test gọi logout() và xoá sessionStorage.',
          },
        ],
      },
      {
        id: 'auth.updateProfile',
        group: 'Auth',
        title: 'Cập nhật profile',
        request: 'PUT /api/users/profile',
        actors: ['citizen', 'collector', 'enterprise', 'admin'],
        logic: [
          'UI gửi dữ liệu form lên backend.',
          'Service unwrapApiResponse(data) để lấy payload thật (nếu backend wrap result).',
        ],
        service: {
          file: 'src/services/auth.service.js',
          raw: authServiceRaw,
          from: 88,
          to: 91,
          explain: 'updateProfile() PUT /api/users/profile và return unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'UserProfile.handleSave',
            file: 'src/shared/components/user/UserProfile.jsx',
            raw: userProfileRaw,
            from: 86,
            to: 105,
            explain: 'Component gọi updateProfile() rồi cập nhật sessionStorage user.',
          },
        ],
      },
      {
        id: 'citizen.dashboard',
        group: 'Citizen',
        title: 'Citizen dashboard (điểm, thống kê)',
        request: 'Derived: GET /api/citizen/rewards/history → sum(point)',
        actors: ['citizen'],
        logic: [
          'Project hiện không gọi endpoint /api/citizen/dashboard; dashboard được tính từ rewards history.',
          'getCitizenDashboard() là hàm compose: gọi getCitizenPoints() rồi map ra points/rewardPoints/monthlyPoints.',
          'Token được gắn tự động bởi axios interceptor.',
        ],
        service: {
          file: 'src/services/citizen.service.js',
          raw: citizenServiceRaw,
          from: 1,
          to: 6,
          explain: 'Không call API dashboard; chỉ tổng hợp từ getCitizenPoints() (rewards.service.js).',
        },
        calls: [
          {
            label: 'PointWallet.useEffect',
            file: 'src/features/citizen/pages/dashboard_comp/PointWallet.jsx',
            raw: pointWalletRaw,
            from: 12,
            to: 25,
            explain:
              'Widget điểm gọi getCitizenPoints() và hiển thị totalPoints.',
          },
          {
            label: 'ApiTest.handleCitizenDashboard',
            file: 'src/app/pages/common/ApiTest.jsx',
            raw: apiTestRaw,
            from: 78,
            to: 88,
            explain: 'Trang dev test gọi getCitizenDashboard().',
          },
        ],
      },
      {
        id: 'citizen.rewardHistory',
        group: 'Citizen',
        title: 'Lịch sử điểm thưởng',
        request: 'GET /api/citizen/rewards/history?startDate=&endDate=',
        actors: ['citizen'],
        logic: [
          'UI gửi params startDate/endDate (nếu có).',
          'Service gọi rewards history rồi unwrapApiResponse(data); UI render list lịch sử.',
        ],
        service: {
          file: 'src/services/rewards.service.js',
          raw: rewardsServiceRaw,
          from: 4,
          to: 13,
          explain: 'getCitizenPointsHistory() GET /rewards/history; getCitizenRewardHistory() chỉ alias.',
        },
        calls: [
          {
            label: 'PointHistory.useEffect',
            file: 'src/features/citizen/pages/PointHistory.jsx',
            raw: pointHistoryRaw,
            from: 16,
            to: 37,
            explain: 'Page gọi getCitizenPoints() + getCitizenPointsHistory() (re-export từ citizen.service.js).',
          },
        ],
      },
      {
        id: 'reports.getWasteCategories',
        group: 'Reports',
        title: 'Danh sách waste categories',
        request: 'GET /api/citizen/waste-categories',
        actors: ['citizen'],
        logic: ['UI cần categories để user nhập waste items trước khi submit report.'],
        service: {
          file: 'src/services/reports.service.js',
          raw: reportsServiceRaw,
          from: 34,
          to: 37,
          explain: 'getWasteCategories() GET categories và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'CreateReportForm.useEffect load categories',
            file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
            raw: createReportFormRaw,
            from: 73,
            to: 97,
            explain: 'Form load categories khi mount để populate dropdown/table.',
          },
        ],
      },
      {
        id: 'reports.getMyReports',
        group: 'Reports',
        title: 'Danh sách report của citizen',
        request: 'GET /api/citizen/reports',
        actors: ['citizen'],
        logic: [
          'UI gọi getMyReports() để lấy danh sách report.',
          'UI map dữ liệu API → model hiển thị (mapApiReportToUi).',
        ],
        service: {
          file: 'src/services/reports.service.js',
          raw: reportsServiceRaw,
          from: 40,
          to: 43,
          explain: 'Đây là API list report, trả về unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Citizen_Reports.useEffect',
            file: 'src/features/citizen/pages/Citizen_Reports.jsx',
            raw: citizenReportsRaw,
            from: 105,
            to: 122,
            explain:
              'Page load list report khi mount và hiện toast khi lỗi.',
          },
          {
            label: 'Citizen_Reports.Refresh button',
            file: 'src/features/citizen/pages/Citizen_Reports.jsx',
            raw: citizenReportsRaw,
            from: 141,
            to: 159,
            explain: 'User bấm Refresh sẽ gọi lại getMyReports().',
          },
          {
            label: 'RecentReports widget',
            file: 'src/features/citizen/pages/dashboard_comp/RecentReports.jsx',
            raw: recentReportsRaw,
            from: 29,
            to: 46,
            explain: 'Widget dashboard cũng gọi getMyReports() để hiển thị report gần đây.',
          },
        ],
      },
      {
        id: 'reports.getMyReportById',
        group: 'Reports',
        title: 'Chi tiết report của citizen',
        request: 'GET /api/citizen/reports/{id}',
        actors: ['citizen'],
        logic: ['Page detail gọi API lấy report theo id.', 'Kèm gọi API result để lấy kết quả phân loại/điểm (tuỳ backend).'],
        service: {
          file: 'src/services/reports.service.js',
          raw: reportsServiceRaw,
          from: 45,
          to: 48,
          explain: 'getMyReportById(id) GET /api/citizen/reports/:id và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Citizen_ReportDetail useEffect',
            file: 'src/features/citizen/pages/Citizen_ReportDetail.jsx',
            raw: citizenReportDetailRaw,
            from: 25,
            to: 46,
            explain: 'Effect gọi getMyReportById() (và getMyReportResult()) khi vào trang detail.',
          },
        ],
      },
      {
        id: 'reports.getMyReportResult',
        group: 'Reports',
        title: 'Kết quả report của citizen',
        request: 'GET /api/citizen/reports/{id}/result',
        actors: ['citizen'],
        logic: ['Tách endpoint result để backend trả dữ liệu kết quả độc lập với report detail.'],
        service: {
          file: 'src/services/reports.service.js',
          raw: reportsServiceRaw,
          from: 50,
          to: 53,
          explain: 'getMyReportResult(id) GET /result và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Citizen_ReportDetail useEffect',
            file: 'src/features/citizen/pages/Citizen_ReportDetail.jsx',
            raw: citizenReportDetailRaw,
            from: 25,
            to: 46,
            explain: 'Effect gọi getMyReportResult() cùng lúc với getMyReportById().',
          },
        ],
      },
      {
        id: 'reports.createReport',
        group: 'Reports',
        title: 'Tạo report (có upload ảnh)',
        request: 'POST /api/citizen/reports (multipart/form-data)',
        actors: ['citizen'],
        logic: [
          'UI build payload (ảnh, toạ độ, address, items) rồi gọi createReport().',
          'Service chuyển payload → FormData (append images/categoryIds/quantities...).',
          'Interceptor xoá Content-Type khi gặp FormData để axios tự set boundary.',
        ],
        service: {
          file: 'src/services/reports.service.js',
          raw: reportsServiceRaw,
          from: 55,
          to: 59,
          explain:
            'createReport() build FormData và POST lên backend, sau đó unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'CreateReportForm.handleSubmit',
            file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
            raw: createReportFormRaw,
            from: 196,
            to: 270,
            explain:
              'UI validate input, build payload và gọi notify.promise(createReport(payload)) để có toast loading/success/error.',
          },
        ],
      },
      {
        id: 'reports.updateReport',
        group: 'Reports',
        title: 'Cập nhật report (pending)',
        request: 'PUT /api/citizen/reports/{id} (multipart/form-data)',
        actors: ['citizen'],
        logic: ['UI dùng chung form create để edit report pending.', 'Service build FormData tương tự create.'],
        service: {
          file: 'src/services/reports.service.js',
          raw: reportsServiceRaw,
          from: 61,
          to: 65,
          explain: 'updateReport(id) PUT /api/citizen/reports/:id và return unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'CreateReportForm.handleSubmit (edit mode)',
            file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
            raw: createReportFormRaw,
            from: 196,
            to: 270,
            explain: 'Cùng đoạn handler, khi isEdit=true sẽ gọi updateReport(editReport.id, payload).',
          },
        ],
      },
      {
        id: 'reports.deleteReport',
        group: 'Reports',
        title: 'Xoá report',
        request: 'DELETE /api/citizen/reports/{id}',
        actors: ['citizen'],
        logic: ['UI gọi deleteReport() rồi navigate về list sau khi xoá thành công.'],
        service: {
          file: 'src/services/reports.service.js',
          raw: reportsServiceRaw,
          from: 67,
          to: 70,
          explain: 'deleteReport(id) DELETE endpoint và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Citizen_ReportDetail delete handler',
            file: 'src/features/citizen/pages/Citizen_ReportDetail.jsx',
            raw: citizenReportDetailRaw,
            from: 212,
            to: 231,
            explain: 'Handler gọi deleteReport() và báo toast/điều hướng.',
          },
        ],
      },
      {
        id: 'collector.dashboard',
        group: 'Collector',
        title: 'Collector dashboard',
        request: 'GET /api/collector/dashboard',
        actors: ['collector'],
        logic: ['Endpoint dashboard hiện chỉ đang được dùng trong trang dev test.'],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 6,
          to: 9,
          explain: 'getCollectorDashboard() GET /api/collector/dashboard và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'ApiTest.handleCollectorDashboard',
            file: 'src/app/pages/common/ApiTest.jsx',
            raw: apiTestRaw,
            from: 90,
            to: 100,
            explain: 'Trang dev test gọi getCollectorDashboard().',
          },
        ],
      },
      {
        id: 'collector.tasks',
        group: 'Collector',
        title: 'Danh sách task của collector',
        request: 'GET /api/collector/collections/tasks',
        actors: ['collector'],
        logic: [
          'UI gọi getCollectorTasks({ all: true }) để lấy toàn bộ task.',
          'Service gửi query params status/all nếu có.',
        ],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 11,
          to: 17,
          explain: 'getCollectorTasks() là wrapper cho endpoint tasks, trả về unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Collector_Tasks.useEffect',
            file: 'src/features/collector/pages/Collector_Tasks.jsx',
            raw: collectorTasksRaw,
            from: 86,
            to: 103,
            explain:
              'Page load task khi mount, bắt lỗi và show toast.',
          },
          {
            label: 'Collector_Dashboard.useEffect',
            file: 'src/features/collector/pages/Collector_Dashboard.jsx',
            raw: collectorDashboardRaw,
            from: 30,
            to: 47,
            explain: 'Dashboard collector gọi getCollectorTasks() để hiển thị task đang có.',
          },
          {
            label: 'Collector_ReportDetail load',
            file: 'src/features/collector/pages/Collector_ReportDetail.jsx',
            raw: collectorReportDetailRaw,
            from: 32,
            to: 85,
            explain: 'Report detail gọi getCollectorTasks() để tìm task theo id.',
          },
        ],
      },
      {
        id: 'collector.workHistory',
        group: 'Collector',
        title: 'Lịch sử công việc (work history)',
        request: 'GET /api/collector/collections/work_history',
        actors: ['collector'],
        logic: ['Page history gọi API lấy danh sách đã làm, có thể filter status.'],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 19,
          to: 24,
          explain: 'getCollectorWorkHistory() GET /work_history và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Collector_History.useEffect',
            file: 'src/features/collector/pages/Collector_History.jsx',
            raw: collectorHistoryRaw,
            from: 80,
            to: 97,
            explain: 'Page history load dữ liệu từ getCollectorWorkHistory().',
          },
        ],
      },
      {
        id: 'collector.acceptTask',
        group: 'Collector',
        title: 'Collector accept task',
        request: 'POST /api/collector/collections/{requestId}/accept',
        actors: ['collector'],
        logic: [
          'UI gọi acceptCollectorTask(requestId) để nhận task.',
          'Sau khi accept, UI refetch getCollectorTasks() để cập nhật task state.',
        ],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 26,
          to: 29,
          explain: 'acceptCollectorTask() POST lên endpoint accept, trả payload bằng unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Collector_ReportDetail button handler',
            file: 'src/features/collector/pages/Collector_ReportDetail.jsx',
            raw: collectorReportDetailRaw,
            from: 197,
            to: 238,
            explain:
              'Handler gọi acceptCollectorTask() và refetch list tasks để tìm task vừa cập nhật.',
          },
        ],
      },
      {
        id: 'collector.startTask',
        group: 'Collector',
        title: 'Collector start task',
        request: 'POST /api/collector/collections/{requestId}/start',
        actors: ['collector'],
        logic: ['UI gọi startCollectorTask() khi bắt đầu thu gom.', 'Sau đó refetch task để cập nhật status.'],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 31,
          to: 34,
          explain: 'startCollectorTask() POST /start và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Collector_ReportDetail start handler',
            file: 'src/features/collector/pages/Collector_ReportDetail.jsx',
            raw: collectorReportDetailRaw,
            from: 220,
            to: 242,
            explain: 'Button Start Task gọi startCollectorTask() và refetch list.',
          },
        ],
      },
      {
        id: 'collector.markCollected',
        group: 'Collector',
        title: 'Collector mark collected',
        request: 'POST /api/collector/collections/{requestId}/collected',
        actors: ['collector'],
        logic: ['Đánh dấu đã thu gom xong trước khi complete.', 'UI có confirm rồi gọi API.'],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 36,
          to: 39,
          explain: 'markCollectorCollected() POST /collected và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Collector_ReportDetail confirmCollected',
            file: 'src/features/collector/pages/Collector_ReportDetail.jsx',
            raw: collectorReportDetailRaw,
            from: 131,
            to: 144,
            explain: 'Sau khi confirm, handler gọi markCollectorCollected() và cập nhật UI.',
          },
        ],
      },
      {
        id: 'collector.getCreateReport',
        group: 'Collector',
        title: 'Collector lấy data create_report',
        request: 'GET /api/collector/collections/{requestId}/create_report',
        actors: ['collector'],
        logic: ['Backend trả sẵn dữ liệu để collector hoàn tất report/collection.', 'UI gọi khi vào report detail.'],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 51,
          to: 54,
          explain: 'getCollectorCreateReport() GET /create_report và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Collector_ReportDetail load',
            file: 'src/features/collector/pages/Collector_ReportDetail.jsx',
            raw: collectorReportDetailRaw,
            from: 32,
            to: 85,
            explain: 'Load data create_report cùng task/work_history để hiển thị detail.',
          },
        ],
      },
      {
        id: 'collector.completeTask',
        group: 'Collector',
        title: 'Collector complete task (upload ảnh + items)',
        request: 'POST /api/collector/collections/{requestId}/complete (multipart/form-data)',
        actors: ['collector'],
        logic: [
          'UI gửi ảnh + categoryIds + quantities + verificationRate + note + toạ độ.',
          'Service build FormData; interceptor xoá Content-Type để axios tự set boundary.',
        ],
        service: {
          file: 'src/services/collector.service.js',
          raw: collectorServiceRaw,
          from: 56,
          to: 77,
          explain: 'completeCollectorTask() build FormData rồi POST /complete và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Collector_ReportDetail complete flow',
            file: 'src/features/collector/pages/Collector_ReportDetail.jsx',
            raw: collectorReportDetailRaw,
            from: 155,
            to: 170,
            explain: 'Khi submit dialog/flow complete, UI gọi completeCollectorTask().',
          },
        ],
      },
      {
        id: 'enterprise.getReports',
        group: 'Enterprise',
        title: 'Danh sách report phía enterprise',
        request: 'GET /api/enterprise/waste-reports',
        actors: ['enterprise'],
        logic: ['UI load danh sách reports của enterprise và xử lý loading/error.'],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 9,
          to: 12,
          explain: 'getEnterpriseReports() GET dữ liệu và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Enterprise_Reports.useEffect',
            file: 'src/features/enterprise/pages/Enterprise_Reports.jsx',
            raw: enterpriseReportsRaw,
            from: 21,
            to: 39,
            explain: 'Page gọi getEnterpriseReports() khi mount và show toast khi lỗi.',
          },
          {
            label: 'Enterprise_Dashboard.useEffect',
            file: 'src/features/enterprise/pages/Enterprise_Dashboard.jsx',
            raw: enterpriseDashboardRaw,
            from: 25,
            to: 47,
            explain: 'Dashboard enterprise load list report để render summary/list.',
          },
        ],
      },
      {
        id: 'enterprise.getReportById',
        group: 'Enterprise',
        title: 'Enterprise xem chi tiết report',
        request: 'GET /api/enterprise/waste-reports/{id}',
        actors: ['enterprise'],
        logic: ['Page detail gọi API lấy report theo id từ route param.'],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 14,
          to: 18,
          explain: 'getEnterpriseWasteReportById(id) GET endpoint và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Enterprise_ReportDetail load report',
            file: 'src/features/enterprise/pages/Enterprise_ReportDetail.jsx',
            raw: enterpriseReportDetailRaw,
            from: 77,
            to: 100,
            explain: 'Effect load report detail theo id.',
          },
        ],
      },
      {
        id: 'enterprise.acceptReport',
        group: 'Enterprise',
        title: 'Enterprise accept report',
        request: 'POST /api/enterprise/requests/accept/{reportCode}',
        actors: ['enterprise'],
        logic: [
          'UI gọi acceptWasteReport({ reportCode }) để accept report.',
          'Sau khi accept, UI tạo notification cho citizen (createNotification).',
        ],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 20,
          to: 28,
          explain: 'acceptWasteReport() validate reportCode rồi POST accept endpoint.',
        },
        calls: [
          {
            label: 'Enterprise_ReportDetail accept handler',
            file: 'src/features/enterprise/pages/Enterprise_ReportDetail.jsx',
            raw: enterpriseReportDetailRaw,
            from: 299,
            to: 338,
            explain:
              'Handler accept report bằng notify.promise, cập nhật state report và gửi notification cho người tạo report.',
          },
        ],
      },
      {
        id: 'enterprise.rejectReport',
        group: 'Enterprise',
        title: 'Enterprise reject report',
        request: 'POST /api/enterprise/requests/reject/{reportCode}',
        actors: ['enterprise'],
        logic: ['Reject report với reason (optional).', 'UI thường điều hướng về dashboard sau khi reject.'],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 30,
          to: 38,
          explain: 'rejectWasteReport() validate reportCode rồi POST reject endpoint.',
        },
        calls: [
          {
            label: 'Enterprise_ReportDetail reject handler',
            file: 'src/features/enterprise/pages/Enterprise_ReportDetail.jsx',
            raw: enterpriseReportDetailRaw,
            from: 243,
            to: 294,
            explain: 'Handler reject gọi rejectWasteReport() và navigate về dashboard.',
          },
        ],
      },
      {
        id: 'enterprise.getCollectors',
        group: 'Enterprise',
        title: 'Enterprise danh sách collectors',
        request: 'GET /api/enterprise/collectors',
        actors: ['enterprise'],
        logic: ['Dùng để assign collector cho request/report, và hiển thị danh sách active collectors.'],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 59,
          to: 62,
          explain: 'getEnterpriseCollectors() GET /collectors và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Enterprise_ReportDetail load collectors',
            file: 'src/features/enterprise/pages/Enterprise_ReportDetail.jsx',
            raw: enterpriseReportDetailRaw,
            from: 102,
            to: 124,
            explain: 'Load collectors để mở dialog assign.',
          },
          {
            label: 'Enterprise_ActiveCollector useEffect',
            file: 'src/features/enterprise/pages/Enterprise_ActiveCollector.jsx',
            raw: enterpriseActiveCollectorRaw,
            from: 17,
            to: 39,
            explain: 'Trang active collectors load list collectors.',
          },
        ],
      },
      {
        id: 'enterprise.assignCollectorToRequest',
        group: 'Enterprise',
        title: 'Assign collector theo requestId',
        request: 'POST /api/enterprise/requests/{requestId}/assign',
        actors: ['enterprise'],
        logic: ['UI gửi requestId + collectorId để backend assign.', 'Sau khi assign, UI refresh state report/request.'],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 40,
          to: 47,
          explain: 'assignCollectorToRequest() POST /requests/:requestId/assign.',
        },
        calls: [
          {
            label: 'Enterprise_ReportDetail assign handler',
            file: 'src/features/enterprise/pages/Enterprise_ReportDetail.jsx',
            raw: enterpriseReportDetailRaw,
            from: 469,
            to: 495,
            explain: 'Dialog assign gọi assignCollectorToRequest()/assignCollectorByReportCode() tuỳ dữ liệu hiện có.',
          },
        ],
      },
      {
        id: 'enterprise.assignCollectorByReportCode',
        group: 'Enterprise',
        title: 'Assign collector theo reportCode',
        request: 'POST /api/enterprise/requests/reports/{reportCode}/assign-collector',
        actors: ['enterprise'],
        logic: ['Alternative endpoint khi UI có reportCode thay vì requestId.'],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 49,
          to: 57,
          explain: 'assignCollectorByReportCode() POST /assign-collector.',
        },
        calls: [
          {
            label: 'Enterprise_ReportDetail assign handler',
            file: 'src/features/enterprise/pages/Enterprise_ReportDetail.jsx',
            raw: enterpriseReportDetailRaw,
            from: 469,
            to: 495,
            explain: 'Cùng đoạn handler chọn endpoint phù hợp.',
          },
        ],
      },
      {
        id: 'enterprise.createCollector',
        group: 'Enterprise',
        title: 'Tạo collector (admin panel)',
        request: 'POST /api/enterprise/collectors',
        actors: ['enterprise'],
        logic: ['Enterprise admin panel tạo collector mới.', 'UI gửi email/password + thông tin xe/nhân viên.'],
        service: {
          file: 'src/services/enterprise.service.js',
          raw: enterpriseServiceRaw,
          from: 64,
          to: 83,
          explain: 'createCollector() POST /api/enterprise/collectors và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Enterprise_AdminPanel create handler',
            file: 'src/features/enterprise/pages/Enterprise_AdminPanel.jsx',
            raw: enterpriseAdminPanelRaw,
            from: 60,
            to: 126,
            explain: 'Form submit gọi createCollector() và báo toast/alert theo kết quả.',
          },
        ],
      },
      {
        id: 'notifications.getNotifications',
        group: 'Notifications',
        title: 'Lấy danh sách notifications',
        request: 'GET /api/notifications?userId=...',
        actors: ['notifications', 'citizen', 'enterprise'],
        logic: [
          'Service bắt lỗi và trả [] để UI không crash.',
          'UI gọi theo user.id lấy từ sessionStorage.',
        ],
        service: {
          file: 'src/services/notifications.js',
          raw: notificationsServiceRaw,
          from: 8,
          to: 17,
          explain: 'getNotifications() GET list và unwrapApiResponse(data) rồi normalize về array.',
        },
        calls: [
          {
            label: 'NotificationBell.useEffect',
            file: 'src/shared/ui/NotificationBell.jsx',
            raw: notificationBellRaw,
            from: 15,
            to: 21,
            explain: 'Dropdown load notifications khi user thay đổi.',
          },
        ],
      },
      {
        id: 'notifications.markAsRead',
        group: 'Notifications',
        title: 'Đánh dấu notification đã đọc',
        request: 'PATCH /api/notifications/{id}/read',
        actors: ['notifications', 'citizen', 'enterprise'],
        logic: ['UI gọi markAsRead(id) rồi update state cục bộ để UI phản hồi nhanh.'],
        service: {
          file: 'src/services/notifications.js',
          raw: notificationsServiceRaw,
          from: 19,
          to: 27,
          explain: 'markAsRead() PATCH endpoint và fallback { success: false } khi lỗi.',
        },
        calls: [
          {
            label: 'NotificationBell.handleNotificationClick',
            file: 'src/shared/ui/NotificationBell.jsx',
            raw: notificationBellRaw,
            from: 35,
            to: 51,
            explain: 'Click notification sẽ gọi markAsRead() trước khi navigate.',
          },
        ],
      },
      {
        id: 'notifications.createNotification',
        group: 'Notifications',
        title: 'Tạo notification',
        request: 'POST /api/notifications',
        actors: ['notifications', 'enterprise'],
        logic: ['Sau khi enterprise accept/reject report, UI tạo notification cho citizen.'],
        service: {
          file: 'src/services/notifications.js',
          raw: notificationsServiceRaw,
          from: 34,
          to: 40,
          explain: 'createNotification() POST /api/notifications và unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Enterprise_ReportDetail notify flow',
            file: 'src/features/enterprise/pages/Enterprise_ReportDetail.jsx',
            raw: enterpriseReportDetailRaw,
            from: 262,
            to: 294,
            explain: 'Sau khi reject/accept, UI cố gắng gọi createNotification() (try/catch).',
          },
        ],
      },
      {
        id: 'admin.getAccounts',
        group: 'Admin',
        title: 'Admin lấy danh sách account',
        request: 'GET /api/admin/accounts',
        actors: ['admin'],
        logic: ['UI gọi getAdminAccounts() để load bảng user management.'],
        service: {
          file: 'src/services/admin.service.js',
          raw: adminServiceRaw,
          from: 4,
          to: 7,
          explain: 'Trả dữ liệu account từ backend qua unwrapApiResponse(data).',
        },
        calls: [
          {
            label: 'Admin_UserManagement.useEffect',
            file: 'src/features/admin/pages/Admin_UserManagement.jsx',
            raw: adminUserManagementRaw,
            from: 15,
            to: 50,
            explain: 'Page load danh sách account, map dữ liệu và setUsers().',
          },
        ],
      },
      {
        id: 'external.nominatim.search',
        group: 'External',
        title: 'Nominatim search (geocoding theo address)',
        request: 'GET https://nominatim.openstreetmap.org/search?format=jsonv2&q=...',
        actors: ['external', 'citizen', 'collector'],
        logic: ['UI gọi fetch trực tiếp (không qua services) để convert address → lat/lng.'],
        service: {
          file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
          raw: createReportFormRaw,
          from: 272,
          to: 298,
          explain: 'Form citizen lookup address bằng Nominatim khi user nhập address.',
        },
        calls: [
          {
            label: 'CollectReportDialog search',
            file: 'src/components/collector/CollectReportDialog.jsx',
            raw: collectReportDialogRaw,
            from: 57,
            to: 86,
            explain: 'Dialog collector cũng có lookup address bằng Nominatim.',
          },
        ],
      },
      {
        id: 'external.nominatim.reverse',
        group: 'External',
        title: 'Nominatim reverse (lat/lng → address)',
        request: 'GET https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=...&lon=...',
        actors: ['external', 'citizen', 'collector'],
        logic: ['UI gọi fetch reverse geocode khi có toạ độ từ map/GPS.'],
        service: {
          file: 'src/features/citizen/pages/create_report/CreateReportForm.jsx',
          raw: createReportFormRaw,
          from: 368,
          to: 394,
          explain: 'Citizen form reverse geocode để fill address khi pick map/gps.',
        },
        calls: [
          {
            label: 'CollectReportDialog reverse',
            file: 'src/components/collector/CollectReportDialog.jsx',
            raw: collectReportDialogRaw,
            from: 208,
            to: 237,
            explain: 'Collector dialog reverse geocode khi chọn vị trí.',
          },
        ],
      },
    ],
    []
  )

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return entries.filter((e) => {
      if (actor !== 'all') {
        const actors = Array.isArray(e.actors) ? e.actors : []
        if (!actors.includes(actor)) return false
      }
      const hay = [
        e.id,
        e.group,
        e.title,
        e.request,
        ...(Array.isArray(e.actors) ? e.actors : []),
        e.service?.file,
        ...e.calls.map((c) => c.file),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return query ? hay.includes(query) : true
    })
  }, [actor, entries, q])

  const introFlow = useMemo(
    () => [
      {
        title: 'Axios client + interceptor',
        meta: 'src/services/http/client.js',
        explanation:
          'DEV: baseURL = "" để Vite proxy /api sang VITE_API_BASE_URL. PROD: baseURL = VITE_API_BASE_URL. Interceptor tự gắn Bearer token và chuẩn hoá lỗi.',
        code: sliceLines(clientRaw, 4, 52),
      },
      {
        title: 'Chuẩn hoá error (ApiError)',
        meta: 'src/services/http/ApiError.js',
        explanation:
          'Thay vì throw object lạ, project wrap lỗi thành ApiError(message, { status, data, url }). UI thường dùng err.message để hiển thị.',
        code: sliceLines(apiErrorRaw, 1, 9),
      },
      {
        title: 'Vì sao có return unwrapApiResponse(data)?',
        meta: 'src/services/http/unwrapApiResponse.js',
        explanation:
          'Backend đôi khi trả payload dưới dạng { result: ... }. Helper này lấy data.result nếu có, còn không thì trả data. Nhờ vậy UI/service không cần biết response có wrap hay không.',
        code: sliceLines(unwrapApiResponseRaw, 1, 4),
      },
    ],
    []
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Project Knowledge · API & UI</h1>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link className="underline underline-offset-4" to={PATHS.home}>
            Home
          </Link>
          <Link className="underline underline-offset-4" to={PATHS.dev.apiTest}>
            API Test
          </Link>
          <Link className="underline underline-offset-4" to={PATHS.dev.featureKnowledge}>
            Feature Knowledge
          </Link>
        </div>
      </div>

      <div className="mt-2 text-sm text-slate-600">
        Trang này tổng hợp nơi định nghĩa API (services), các UI patterns/hook quan trọng, nơi UI gọi, và giải thích logic.
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-base font-semibold text-slate-900">Luồng gọi API trong project</div>
        <div className="mt-1 text-sm text-slate-600">UI → services/* → axios client → backend (Vite proxy trong DEV)</div>
        <div className="mt-4 grid gap-3">
          {introFlow.map((b) => (
            <CodeSection key={b.title} title={b.title} meta={b.meta} explanation={b.explanation} code={b.code} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-base font-semibold text-slate-900">Danh mục kiến thức (đang dùng)</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên, endpoint, file..."
          className="h-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="mr-2 text-sm font-semibold text-slate-700">Filter actor:</div>
        {actorOptions.map((opt) => {
          const active = actor === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setActor(opt.id)}
              className={
                active
                  ? 'h-9 rounded-full bg-emerald-700 px-4 text-sm font-semibold text-white'
                  : 'h-9 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50'
              }
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4">
        {filtered.map((e) => (
          <ApiEntry key={e.id} entry={e} />
        ))}
        {!filtered.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
            Không tìm thấy API phù hợp.
          </div>
        ) : null}
      </div>
    </div>
  )
}

