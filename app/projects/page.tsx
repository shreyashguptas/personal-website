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

  const pinnedProjects = projects.filter(project => project.pinned)
  const otherProjects = projects.filter(project => !project.pinned)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      
      {pinnedProjects.length > 0 && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-semibold">Featured Projects</h2>
          </div>
          <ProjectList 
            projects={pinnedProjects}
            showImages={true}
            showTags={true}
          />
        </div>
      )}

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-semibold">All Projects</h2>
        </div>
        <ProjectList 
          projects={otherProjects}
          showTags={true}
        />
      </div>
    </div>
  )
}

