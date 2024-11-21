import { ProjectList } from './components/project-list'
import { projects } from './data'

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <h1>Projects</h1>
      <ProjectList projects={projects} />
    </div>
  )
}

