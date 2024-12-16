import { ProjectList } from './components/project-list'
import { projects } from './data'

export default function ProjectsPage() {
  const liveProjects = projects.filter(project => project.pinned);
  const otherProjects = projects.filter(project => !project.pinned);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Projects</h1>
      
      {liveProjects.length > 0 && (
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-semibold">Live Projects</h2>
          </div>
          <ProjectList 
            projects={liveProjects}
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

