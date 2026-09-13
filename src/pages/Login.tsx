import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#002472] rounded-full" />
          <span className="font-bold text-lg text-[#002472]">RONDA</span>
        </div>

        <div className="relative">
          <select className="appearance-none border rounded pl-3 pr-10 py-1 text-sm text-gray-600">
            <option>English</option>
            <option>Bahasa Melayu</option>
            <option>中文</option>
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left promotional panel */}
        <div className="hidden md:flex md:w-1/2 bg-[#002472] flex-col justify-center px-16 text-white">
          <span className="inline-block bg-white/10 text-sm px-3 py-1 rounded-full w-fit mb-6">
            RONDA
          </span>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Ronda. Move Smart. Discover More.
          </h1>
          <p className="text-white/70 text-lg">
            Plan your journey across MRT, LRT, KTM, and buses, all in one place.
          </p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-6 bg-gray-50">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6">Sign in to RONDA</h2>

            <form onSubmit={handleSubmit}>
              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-3"
                placeholder="Enter your email address"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
                placeholder="Password"
                required
              />

              <button
                type="submit"
                className="w-full bg-[#002472] text-white py-2 rounded-lg font-semibold hover:opacity-90"
              >
                Continue
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="flex gap-3 justify-center">
              <button
                disabled
                className="w-14 h-11 border rounded-lg flex items-center justify-center bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z" />
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
                  <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.27-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
                </svg>
              </button>

              <button
                disabled
                className="w-14 h-11 border rounded-lg flex items-center justify-center bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/>
                </svg>
              </button>

              <button
                disabled
                className="w-14 h-11 border rounded-lg flex items-center justify-center bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#0A66C2" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45z"/>
                </svg>
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#002472] font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login