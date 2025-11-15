import { useEffect, useState } from 'react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Hero() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-6">
        <div className="max-w-xl text-white">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Smart Expense Tracker
          </div>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Minimal, modern spending made effortless
          </h1>
          <p className="mt-4 text-slate-300">
            Track expenses, set budgets, and visualize where your money goes — in a clean, distraction-free interface.
          </p>
        </div>
      </div>
    </section>
  )
}

function ExpenseForm({ onAdded }) {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('General')
  const [loading, setLoading] = useState(false)

  async function addExpense(e) {
    e.preventDefault()
    if (!title || !amount) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount: parseFloat(amount), category }),
      })
      if (!res.ok) throw new Error('Failed to add expense')
      setTitle('')
      setAmount('')
      onAdded?.()
    } catch (e) {
      console.error(e)
      alert('Could not add expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={addExpense} className="grid grid-cols-1 gap-3 sm:grid-cols-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What did you buy?"
        className="sm:col-span-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
      />
      <input
        value={amount}
        type="number"
        step="0.01"
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="sm:col-span-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="sm:col-span-1 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
      >
        <option>General</option>
        <option>Food</option>
        <option>Transport</option>
        <option>Shopping</option>
        <option>Bills</option>
      </select>
      <button
        disabled={loading}
        className="sm:col-span-6 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Adding...' : 'Add expense'}
      </button>
    </form>
  )
}

function ExpensesList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/expenses?limit=20`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-800">Recent Expenses</h3>
        <button onClick={load} className="text-sm text-indigo-600 hover:underline">Refresh</button>
      </div>
      {loading ? (
        <div className="py-8 text-center text-slate-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-slate-500">No expenses yet. Add your first one above.</div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between py-3">
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{it.title}</span>
                <span className="text-xs text-slate-500">{it.category}</span>
              </div>
              <span className="font-semibold text-slate-900">${it.amount?.toFixed ? it.amount.toFixed(2) : it.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function App() {
  const [refresh, setRefresh] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Hero />

      <main className="mx-auto -mt-24 max-w-5xl space-y-6 px-6 pb-24">
        <div className="rounded-3xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Quick Add</h2>
          <ExpenseForm onAdded={() => setRefresh((v) => v + 1)} />
        </div>

        <ExpensesList key={refresh} />
      </main>

      <footer className="border-t border-slate-100 bg-white/70 py-6 text-center text-sm text-slate-500 backdrop-blur">
        Built for clarity and control
      </footer>
    </div>
  )
}

export default App
