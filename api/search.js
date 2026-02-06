import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, mode, filters } = req.body

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  let dbQuery = supabase.from('thumbnails').select('*')

  if (mode === 'text' && query) {
    dbQuery = dbQuery.or(`video_title.ilike.%${query}%,description.ilike.%${query}%`)
  } else if (mode === 'filters') {
    if (filters?.style) dbQuery = dbQuery.eq('stil', filters.style)
    if (filters?.angle) dbQuery = dbQuery.eq('rakurs', filters.angle)
    if (filters?.category) dbQuery = dbQuery.contains('tematika', [filters.category])
  }

  const { data, error } = await dbQuery.limit(50)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ data })
}
