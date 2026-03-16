import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Phone, UserRound, ArrowLeft, UserPlus, Truck, Car, Building2 } from 'lucide-react'
import { Card, CardBody, CardHeader, CardTitle } from '../../../shared/ui/Card.jsx'
import RoleLayout from '../../../shared/layout/RoleLayout.jsx'
import AdminSidebar from '../components/navigation/Admin_Sidebar.jsx'
import AdminNavbar from '../components/navigation/AdminNavbar.jsx'
import CD_Footer from '../../../shared/layout/CD_Footer.jsx'
import TextField from '../../../shared/ui/TextField.jsx'
import LoadingButton from '../../../shared/ui/LoadingButton.jsx'
import usePasswordVisibility from '../../../shared/hooks/usePasswordVisibility.js'
import useNotify from '../../../shared/hooks/useNotify.js'
import { createAdminAccount } from '../../../services/admin.service.js'
import { PATHS } from '../../../app/routes/paths.js'
import { cn } from '../../../shared/lib/cn.js'

const ALLOWED_ROLES = ['citizen', 'enterprise', 'collector']
const ROLE_LABELS = {
  citizen: 'Citizen',
  enterprise: 'Enterprise',
  collector: 'Collector',
}

const VN_PHONE_REGEX = /^0\d{9}$/

export default function AdminCreateUser() {
  const { role: roleParam } = useParams()
  const navigate = useNavigate()
  const notify = useNotify()
  const role = roleParam?.toLowerCase()
  const isRoleValid = role && ALLOWED_ROLES.includes(role)
  const isCollector = role === 'collector'

  const [values, setValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    enterpriseId: '',
    vehicleType: '',
    vehiclePlate: '',
    password: '',
    confirmPassword: '',
  })
  const passwordVisibility = usePasswordVisibility(false)
  const confirmVisibility = usePasswordVisibility(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function handleChange(field) {
    return (e) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
      if (error) setError('')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (pending || !isRoleValid) return
    const fullName = values.fullName.trim()
    const email = values.email.trim()
    const phone = values.phone.trim()
    const vehicleType = values.vehicleType.trim()
    const vehiclePlate = values.vehiclePlate.trim()
    const enterpriseId = values.enterpriseId.trim()
    const password = values.password

    if (!fullName || !email || !password) {
      setError('Please fill in full name, email, and password.')
      return
    }
    if (isCollector) {
      if (!phone || !vehicleType || !vehiclePlate || !enterpriseId) {
        setError('For collector accounts, phone, enterprise ID, vehicle type and vehicle plate are required.')
        return
      }
      if (!VN_PHONE_REGEX.test(phone)) {
        setError('Please enter a valid Vietnamese phone number (10 digits, starting with 0).')
        return
      }
    } else if (phone && !VN_PHONE_REGEX.test(phone)) {
      setError('Please enter a valid Vietnamese phone number (10 digits, starting with 0), or leave it empty.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setPending(true)
    setError('')
    try {
      const payload = {
        fullName,
        email,
        phone: phone || undefined,
        password,
        role,
      }
      if (isCollector) {
        payload.enterpriseId = enterpriseId
        payload.vehicleType = vehicleType
        payload.vehiclePlate = vehiclePlate
      }
      await createAdminAccount(payload)
      notify.success('Account created', `${ROLE_LABELS[role]} account has been created and is active.`)
      navigate(PATHS.admin.userManagement)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create account. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (!isRoleValid) {
    return (
      <RoleLayout
        sidebar={<AdminSidebar />}
        navbar={<AdminNavbar />}
        footer={<CD_Footer />}
      >
        <div className="max-w-screen-xl mx-auto py-8">
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-gray-600 mb-4">Invalid role. Choose Citizen, Enterprise, or Collector.</p>
              <Link
                to={PATHS.admin.userManagement}
                className="inline-flex items-center gap-2 text-green-600 font-semibold hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to User Management
              </Link>
            </CardBody>
          </Card>
        </div>
      </RoleLayout>
    )
  }

  const accent = 'emerald'
  const roleLabel = ROLE_LABELS[role]

  const identitySection = (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <UserRound className="h-4 w-4 text-slate-700" aria-hidden="true" />
        Identity & Contact
      </div>
      <div className={cn('mt-4 grid gap-4', isCollector && 'sm:grid-cols-2')}>
        <TextField
          id="create_fullName"
          label="Full name"
          autoComplete="name"
          value={values.fullName}
          onChange={handleChange('fullName')}
          placeholder={isCollector ? 'Collector full name' : 'Full name'}
          disabled={pending}
          leftIcon={UserRound}
          accent={accent}
          className={isCollector ? 'sm:col-span-2' : undefined}
        />
        <TextField
          id="create_email"
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange('email')}
          placeholder={isCollector ? 'collector@example.com' : 'you@example.com'}
          disabled={pending}
          leftIcon={Mail}
          accent={accent}
          className={isCollector ? 'sm:col-span-2' : undefined}
        />
        <TextField
          id="create_phone"
          label={isCollector ? 'Phone' : 'Phone (optional)'}
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange('phone')}
          placeholder="09xxxxxxxx"
          disabled={pending}
          leftIcon={Phone}
          accent={accent}
          inputClassName={isCollector ? 'tracking-wide' : undefined}
          className={isCollector ? 'sm:col-span-2' : undefined}
        />
        {isCollector && (
          <TextField
            id="create_enterpriseId"
            label="Enterprise ID"
            autoComplete="off"
            value={values.enterpriseId}
            onChange={handleChange('enterpriseId')}
            placeholder="ID of the enterprise this collector belongs to"
            disabled={pending}
            leftIcon={Building2}
            accent={accent}
            className="sm:col-span-2"
          />
        )}
      </div>
    </div>
  )

  const vehicleSection = isCollector && (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Truck className="h-4 w-4 text-slate-700" aria-hidden="true" />
        Vehicle
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextField
          id="create_vehicleType"
          label="Vehicle type"
          autoComplete="off"
          value={values.vehicleType}
          onChange={handleChange('vehicleType')}
          placeholder="Truck / Van / Car"
          disabled={pending}
          leftIcon={Truck}
          accent={accent}
        />
        <TextField
          id="create_vehiclePlate"
          label="Vehicle plate"
          autoComplete="off"
          value={values.vehiclePlate}
          onChange={handleChange('vehiclePlate')}
          placeholder="66K3-123.45"
          disabled={pending}
          leftIcon={Car}
          accent={accent}
          inputClassName="uppercase tracking-widest"
        />
      </div>
    </div>
  )

  const credentialsSection = (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Lock className="h-4 w-4 text-slate-700" aria-hidden="true" />
        Credentials
      </div>
      {isCollector && (
        <div className="mt-2 text-sm text-slate-600">Minimum password length: 6 characters.</div>
      )}
      <div className={cn('mt-4 grid gap-4', isCollector && 'sm:grid-cols-2')}>
        <TextField
          id="create_password"
          label="Password"
          type={passwordVisibility.visible ? 'text' : 'password'}
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange('password')}
          placeholder="At least 6 characters"
          disabled={pending}
          leftIcon={Lock}
          accent={accent}
          rightSlot={
            <button
              type="button"
              onClick={passwordVisibility.toggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
              aria-label={passwordVisibility.visible ? 'Hide password' : 'Show password'}
              disabled={pending}
            >
              {passwordVisibility.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <TextField
          id="create_confirmPassword"
          label="Confirm password"
          type={confirmVisibility.visible ? 'text' : 'password'}
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange('confirmPassword')}
          placeholder={isCollector ? 'Re-enter the password' : 'Re-enter password'}
          disabled={pending}
          leftIcon={Lock}
          accent={accent}
          rightSlot={
            <button
              type="button"
              onClick={confirmVisibility.toggle}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:ring-2 focus:ring-slate-200"
              aria-label={confirmVisibility.visible ? 'Hide password' : 'Show password'}
              disabled={pending}
            >
              {confirmVisibility.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
      </div>
    </div>
  )

  return (
    <RoleLayout
      sidebar={<AdminSidebar />}
      navbar={<AdminNavbar />}
      footer={<CD_Footer />}
    >
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            to={PATHS.admin.userManagement}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-5 h-5" /> Back to User Management
          </Link>
        </div>

        <Card className={cn('mx-auto', isCollector ? 'max-w-4xl' : 'max-w-lg')}>
          <CardHeader className="border-b border-gray-100 py-6 px-6 sm:px-8">
            <div className="flex items-center gap-3">
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                role === 'citizen' && 'bg-blue-100 text-blue-700',
                role === 'enterprise' && 'bg-indigo-100 text-indigo-700',
                role === 'collector' && 'bg-orange-100 text-orange-700'
              )}>
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl">Create {roleLabel} account</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isCollector
                    ? 'New collector will be active. Fill identity, vehicle and credentials.'
                    : 'New account will be active and ready to use.'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="grid gap-6">
              {isCollector ? (
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                  <div className="grid gap-6">
                    {identitySection}
                    {vehicleSection}
                    {credentialsSection}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:self-start">
                    <div className="text-sm font-semibold text-slate-900">Summary</div>
                    <div className="mt-2 text-sm text-slate-600">
                      This will create a collector login with the provided email and password.
                    </div>
                    <div className="mt-5 grid gap-3 text-sm">
                      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-emerald-600" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">Required</div>
                          <div className="mt-1 text-slate-600">
                            Full name, email, phone, enterprise ID, vehicle type, vehicle plate, password.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-slate-900" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">Tip</div>
                          <div className="mt-1 text-slate-600">
                            Use consistent vehicle plate format (e.g. 49AE-123.45) for easier searching.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {identitySection}
                  {credentialsSection}
                </>
              )}
              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
                  <div className="font-semibold">Please fix the following</div>
                  <div className="mt-1 text-rose-800">{error}</div>
                </div>
              ) : null}
              <div className={cn(
                'flex gap-3 pt-2',
                isCollector && 'flex-col-reverse sm:flex-row sm:items-center sm:justify-between'
              )}>
                <Link
                  to={PATHS.admin.userManagement}
                  className={cn(
                    'inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50',
                    isCollector ? 'w-full sm:w-auto' : 'flex-1'
                  )}
                >
                  Cancel
                </Link>
                <LoadingButton
                  type="submit"
                  loading={pending}
                  accent={accent}
                  className={isCollector ? 'w-full sm:w-auto' : 'flex-1'}
                >
                  Create {roleLabel} account
                </LoadingButton>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </RoleLayout>
  )
}
