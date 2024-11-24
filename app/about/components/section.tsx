'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Section as SectionType } from '../types'

interface SectionProps {
  section: SectionType
  index: number
}

export function Section({ section, index }: SectionProps) {
  const ref = useRef(null)

  return (
    <section 
      ref={ref}
      className={`min-h-[50vh] relative flex items-center justify-center ${index === 0 ? 'mt-0' : 'mt-8'}`}
    >
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-stone-100 rounded-full">
              <section.Icon className="w-7 h-7 text-stone-600" />
            </div>
            <h2 className="text-4xl font-bold text-stone-800">{section.title}</h2>
          </div>
          <p className="text-xl text-stone-600 leading-relaxed max-w-xl">
            {section.content}
          </p>
        </div>
        
        <div className="relative w-full aspect-[16/12]">
          <Image
            src={section.image}
            alt={section.title}
            fill
            className="rounded-2xl shadow-lg object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </section>
  )
} 