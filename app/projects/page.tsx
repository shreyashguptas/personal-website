import { ProjectList } from './components/project-list'
import { projects } from './data'

export default function ProjectsPage() {
  const pinnedProjects = projects.filter(project => project.pinned);
  const otherProjects = projects.filter(project => !project.pinned);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      
      {pinnedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Pinned Projects</h2>
          <div className="border-y-2 py-6">
            <ProjectList projects={pinnedProjects} />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">All Projects</h2>
        <ProjectList projects={otherProjects} />
      </div>
    </div>
  )
}

