import { createClient } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Supabase</h1>

      <pre>
        {JSON.stringify(
          {
            error,
            data,
          },
          null,
          2
        )}
      </pre>
    </div>
  )
}