import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import BrandLogo from '../components/BrandLogo'
import SocialLogin from '../components/SocialLogin'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
    console.log('Registered user:', data.user)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <Link to="/" className="flex items-center" aria-label="RONDA home">
          <BrandLogo size="sm" />
        </Link>

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
          <BrandLogo tone="light" size="lg" className="mb-8" />
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Join Ronda today.
          </h1>
          <p className="text-white/70 text-lg">
            Create an account to start planning smarter journeys across Malaysia.
          </p>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-6 bg-gray-50">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6">Sign up</h2>

            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}

            {success && (
              <p className="text-green-600 text-sm mb-4">
                Account created. Check your email to confirm, then log in.
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-3"
                placeholder="Full name"
                required
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-3"
                placeholder="Email address"
                required
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-3"
                placeholder="Password"
                required
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
                placeholder="Confirm password"
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

            <SocialLogin />

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-[#002472] font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register