'use client'

import { useEffect } from 'react'
import { Section } from './components/section'
import { sections } from './data'

export default function AboutMe() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto pt-16 px-8">
        <h1 className="text-3xl font-bold">About me</h1>
        <div className="my-8" />
        <h1 className="text-5xl font-dull text-stone-600 mb-6">
          A glimpse into my adventures and experiences
        </h1>
      </div>
      
      {sections.map((section, index) => (
        <Section key={index} section={section} index={index} />
      ))}
    </div>
  )
}
