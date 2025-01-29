import { ProjectList } from '@/components/features/projects/project-list'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

export const revalidate = 3600 // Revalidate every hour

export default async function ProjectsPage() {
  const supabase = createClient()
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('date', { ascending: false })

  if (!projects) return null

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      <ProjectList projects={projects} />
    </div>
  )
}

