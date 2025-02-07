import { ProjectList } from '@/components/features/projects/project-list'
import { getAllProjects } from '@/lib/supabase'
import { loadMoreProjects } from './actions'

// Revalidate data every minute in production, but stay dynamic in development
export const revalidate = 60

export default async function ProjectsPage() {
  try {
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
  } catch (error) {
    console.error('Error loading projects:', error)
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Failed to load projects. Please try again later.</p>
      </div>
    )
  }
}

