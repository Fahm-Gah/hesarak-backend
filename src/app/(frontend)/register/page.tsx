'use client'

import React, { useState } from 'react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    fullName: '',
    fatherName: '',
    gender: 'male',
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(
        'https://hesarak-backend-git-cors-fix-matee-safis-projects.vercel.app/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        },
      )

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          name="fatherName"
          placeholder="Father's Name"
          value={formData.fatherName}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '0.5rem' }}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: 'blue' }}>
          Login here
        </a>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <pre style={{ textAlign: 'left', background: '#f0f0f0', padding: '1rem' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
