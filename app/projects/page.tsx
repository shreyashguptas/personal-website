import { ProjectList } from '@/components/features/projects/project-list'
import { getAllProjects } from '@/lib/supabase'
import { loadMoreProjects } from './actions'

// Force dynamic rendering for fresh data
export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const initialData = await getAllProjects(1)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      <ProjectList 
        initialProjects={initialData.projects}
        hasMore={initialData.hasMore}
        onLoadMore={loadMoreProjects}
      />
    </div>
  )
}

