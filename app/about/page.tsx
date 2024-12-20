'use client'

import { useEffect } from 'react'
import { Section } from './components/section'
import { sections } from './data'

export default function AboutMe() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="space-y-8 mb-12">
      <div>
        <h1 className="text-2xl font-bold mb-4">Personal Life</h1>
      </div>
      
      <div className="space-y-8">
        {sections.map((section, index) => (
          <Section key={index} section={section} index={index} />
        ))}
      </div>
    </div>
  )
}
