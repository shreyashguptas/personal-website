import Image from 'next/image'
import Link from 'next/link'

interface ContentItem {
  title: string
  date: string
  author?: string
  link: string
}

const projects: ContentItem[] = [
  {
    title: "Raspberry Pi Camera Web Stream",
    date: "2024",
    link: "/projects/raspberry-pi-camera"
  },
  {
    title: "Machine Learning Explained With Analogies",
    date: "2024",
    link: "/projects/machine-learning-analogies"
  },
  {
    title: "Credit Card Fraud Detection",
    date: "2024",
    link: "/projects/credit-card-fraud"
  }
]

const readings: ContentItem[] = [
  {
    title: "Truths",
    date: "2024",
    author: "Vivek Ramaswamy",
    link: "/readings/truths"
  },
  {
    title: "100M$ Leads",
    date: "2024",
    author: "Alex Hormozi",
    link: "/readings/100m-leads"
  },
  {
    title: "Basic Economics, Fifth Edition",
    date: "2024",
    author: "Thomas Sowell",
    link: "/readings/basic-economics"
  }
]

const blogs: ContentItem[] = [
  {
    title: "Too Many Project Ideas, Too Little Time?",
    date: "Nov 9, 2024",
    link: "/blog/project-ideas"
  },
  {
    title: "The Hidden Value of Coding",
    date: "Sep 13, 2024",
    link: "/blog/hidden-value-coding"
  },
  {
    title: "Talk to AI about your Business",
    date: "Aug 30, 2024",
    link: "/blog/ai-business"
  }
]

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <h2>Introduction</h2>
        <p className="text-lg text-muted-foreground">
          As Associate Director at the University of Arkansas, I lead analytics for student-serving organizations. 
          I&apos;m constantly critiquing my knowledge of technical skills, economics, and business then consistently 
          learning and applying. I then find time to lift weights, run, bike and eat a lot of homemade sourdough pizza.
        </p>
        <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
          <Image
            src="/bridge-photo.jpg"
            alt="Person walking on a suspension bridge in a forest"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-12">
        <section>
          <h2 className="mb-6">Projects</h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <Link 
                key={project.title}
                href={project.link}
                className="block group"
              >
                <div className="space-y-1">
                  <h3 className="font-medium group-hover:text-gray-600">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{project.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6">Reading</h2>
          <div className="space-y-4">
            {readings.map((reading) => (
              <Link 
                key={reading.title}
                href={reading.link}
                className="block group"
              >
                <div className="space-y-1">
                  <h3 className="font-medium group-hover:text-gray-600">
                    {reading.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {reading.author}
                  </p>
                  <p className="text-sm text-muted-foreground">{reading.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6">Blogs</h2>
          <div className="space-y-4">
            {blogs.map((blog) => (
              <Link 
                key={blog.title}
                href={blog.link}
                className="block group"
              >
                <div className="space-y-1">
                  <h3 className="font-medium group-hover:text-gray-600">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{blog.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

