import { ProjectList } from './components/project-list'
import { Project } from './types'

const projects: Project[] = [
  {
    title: "Raspberry Pi Camera Web Stream",
    year: "2024",
    githubUrl: "https://github.com/yourusername/raspberry-pi-camera",
    tags: ["Raspberry Pi", "Python", "Web Stream"]
  },
  {
    title: "Machine Learning Explained With Analogies",
    year: "2024",
    githubUrl: "https://github.com/yourusername/ml-analogies",
    tags: ["PyTorch", "Machine Learning", "Python"]
  }
]

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <h1>Projects</h1>
      <ProjectList projects={projects} />
    </div>
  )
}