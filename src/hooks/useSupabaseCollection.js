import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Supabase-backed collection with graceful localStorage fallback.
 * Tries a Supabase table; if missing/unavailable, falls back to localStorage
 * (seeded with `seed`). add/update/remove write to Supabase when available.
 */
export function useSupabaseCollection(table, seed = [], opts = {}) {
  const { localKey = `os_${table}`, orderBy = 'id', ascending = true } = opts
  const [rows, setRows] = useState(seed)
  const [dbReady, setDbReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const dbReadyRef = useRef(false)

  const loadLocal = useCallback(() => {
    try { const s = localStorage.getItem(localKey); if (s) return JSON.parse(s) } catch { /* ignore */ }
    return seed
  }, [localKey, seed])

  const saveLocal = useCallback((next) => {
    try { localStorage.setItem(localKey, JSON.stringify(next)) } catch { /* ignore */ }
  }, [localKey])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (supabase) {
        const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending })
        if (!cancelled && !error && Array.isArray(data)) {
          dbReadyRef.current = true; setDbReady(true)
          setRows(data.length ? data : seed); setLoading(false); return
        }
      }
      if (!cancelled) { setRows(loadLocal()); setLoading(false) }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table])

  const add = useCallback(async (row) => {
    if (dbReadyRef.current && supabase) {
      const { data, error } = await supabase.from(table).insert(row).select().single()
      if (!error && data) { setRows(prev => [...prev, data]); return data }
    }
    const local = { id: Date.now(), ...row }
    setRows(prev => { const next = [...prev, local]; saveLocal(next); return next })
    return local
  }, [table, saveLocal])

  const update = useCallback(async (id, patch) => {
    if (dbReadyRef.current && supabase) {
      const { error } = await supabase.from(table).update(patch).eq('id', id)
      if (!error) { setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r)); return }
    }
    setRows(prev => { const next = prev.map(r => r.id === id ? { ...r, ...patch } : r); saveLocal(next); return next })
  }, [table, saveLocal])

  const remove = useCallback(async (id) => {
    if (dbReadyRef.current && supabase) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (!error) { setRows(prev => prev.filter(r => r.id !== id)); return }
    }
    setRows(prev => { const next = prev.filter(r => r.id !== id); saveLocal(next); return next })
  }, [table, saveLocal])

  return { rows, setRows, dbReady, loading, add, update, remove }
}
