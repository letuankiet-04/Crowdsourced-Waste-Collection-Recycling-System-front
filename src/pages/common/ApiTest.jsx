import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildStoredUserFromToken, login, logout, register } from '../../api/auth.js'
import { getCitizenDashboard } from '../../api/citizen.js'
import { getCollectorDashboard, getMyCollectionTasks } from '../../api/collector.js'
import { getEnterpriseRequests } from '../../api/enterprise.js'
import { PATHS } from '../../routes/paths.js'

export default function ApiTest() {
  const apiBaseUrl = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080', [])
  const [values, setValues] = useState({
    name: 'Test User',
    email: '',
    password: '',
  })
  const [pending, setPending] = useState(false)
  const [output, setOutput] = useState('')

  function handleChange(field) {
    return (e) => {
      const next = e.target.value
      setValues((prev) => ({ ...prev, [field]: next }))
    }
  }

  function print(label, payload) {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)
    setOutput(`${label}\n${text}`)
  }

  async function handleLogin() {
    setPending(true)
    try {
      const res = await login({ email: values.email.trim(), password: values.password })
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(buildStoredUserFromToken(res.token)))
      print('LOGIN OK', res)
    } catch (err) {
      print('LOGIN ERROR', { message: err?.message || String(err) })
    } finally {
      setPending(false)
    }
  }

  async function handleRegister() {
    setPending(true)
    try {
      const res = await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(buildStoredUserFromToken(res.token)))
      print('REGISTER OK', res)
    } catch (err) {
      print('REGISTER ERROR', { message: err?.message || String(err) })
    } finally {
      setPending(false)
    }
  }

  async function handleLogout() {
    setPending(true)
    try {
      await logout()
      print('LOGOUT OK', { status: 204 })
    } catch (err) {
      print('LOGOUT ERROR', { message: err?.message || String(err) })
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setPending(false)
    }
  }

  async function handleCitizenDashboard() {
    setPending(true)
    try {
      const res = await getCitizenDashboard()
      print('CITIZEN DASHBOARD OK', res)
    } catch (err) {
      print('CITIZEN DASHBOARD ERROR', { message: err?.message || String(err) })
    } finally {
      setPending(false)
    }
  }

  async function handleCollectorDashboard() {
    setPending(true)
    try {
      const res = await getCollectorDashboard()
      print('COLLECTOR DASHBOARD OK', res)
    } catch (err) {
      print('COLLECTOR DASHBOARD ERROR', { message: err?.message || String(err) })
    } finally {
      setPending(false)
    }
  }

  async function handleCollectorTasks() {
    setPending(true)
    try {
      const res = await getMyCollectionTasks()
      print('COLLECTOR TASKS OK', res)
    } catch (err) {
      print('COLLECTOR TASKS ERROR', { message: err?.message || String(err) })
    } finally {
      setPending(false)
    }
  }

  async function handleEnterpriseRequests() {
    setPending(true)
    try {
      const res = await getEnterpriseRequests()
      print('ENTERPRISE REQUESTS OK', res)
    } catch (err) {
      print('ENTERPRISE REQUESTS ERROR', { message: err?.message || String(err) })
    } finally {
      setPending(false)
    }
  }

  function showStored() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    print('LOCAL STORAGE', { token, user: user ? JSON.parse(user) : null })
  }

  function clearStored() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    print('CLEARED', { ok: true })
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">API Test</h1>
        <div className="flex gap-3 text-sm">
          <Link className="underline underline-offset-4" to={PATHS.auth.login}>
            Auth
          </Link>
          <Link className="underline underline-offset-4" to={PATHS.home}>
            Home
          </Link>
        </div>
      </div>

      <div className="mt-2 text-sm text-slate-600">
        Backend base URL: <span className="font-mono text-slate-800">{apiBaseUrl}</span>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Seeded users (email / password): citizen@test.com / citizen123 · collector@test.com / collector123 · enterprise@test.com /
          enterprise123 · admin@test.com / admin123
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="test_name">
            Name (register)
          </label>
          <input
            id="test_name"
            className="h-11 rounded-xl border border-slate-200 px-3 text-slate-900"
            value={values.name}
            onChange={handleChange('name')}
            disabled={pending}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="test_email">
            Email
          </label>
          <input
            id="test_email"
            className="h-11 rounded-xl border border-slate-200 px-3 text-slate-900"
            value={values.email}
            onChange={handleChange('email')}
            disabled={pending}
            type="email"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="test_password">
            Password
          </label>
          <input
            id="test_password"
            className="h-11 rounded-xl border border-slate-200 px-3 text-slate-900"
            value={values.password}
            onChange={handleChange('password')}
            disabled={pending}
            type="password"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleLogin()}
          >
            Login
          </button>
          <button
            type="button"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleRegister()}
          >
            Register
          </button>
          <button
            type="button"
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleLogout()}
          >
            Logout
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleCitizenDashboard()}
          >
            Citizen dashboard
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleCollectorDashboard()}
          >
            Collector dashboard
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleCollectorTasks()}
          >
            Collector tasks
          </button>
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={pending}
            onClick={() => void handleEnterpriseRequests()}
          >
            Enterprise requests
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60"
            disabled={pending}
            onClick={showStored}
          >
            Show localStorage
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-60"
            disabled={pending}
            onClick={clearStored}
          >
            Clear localStorage
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-slate-800">Output</div>
        <pre className="mt-2 max-h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">
          {output || 'No output yet.'}
        </pre>
      </div>
    </div>
  )
}
