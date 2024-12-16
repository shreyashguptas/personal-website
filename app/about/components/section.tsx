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
      className={`min-h-[40vh] relative flex items-center justify-center ${index === 0 ? 'mt-0' : 'mt-4'}`}
    >
      <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
        
        <div className="flex flex-col">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-stone-100 rounded-full shrink-0 mt-1">
              <section.Icon className="w-6 h-6 text-stone-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-stone-800">{section.title}</h2>
              <p className="text-base text-stone-600 leading-relaxed max-w-xl mt-2">
                {section.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 