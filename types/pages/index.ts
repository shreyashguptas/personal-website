import type { LucideIcon } from 'lucide-react'

// Project Types
export interface Project {
  id: string;
  title: string;
  details: string;
  url?: string;
  image?: string;
  tags: string[];
  date: string;
  pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}

// About Page Types
export interface Section {
  title: string;
  content: string;
  image: string;
  Icon: LucideIcon;
  birthDate?: Date;
}

// Environment Types
export interface ProcessEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Base Page Props Types
export interface BasePageProps {
  params: { [key: string]: string | string[] };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Dynamic Page Props for pages with async params
export interface DynamicPageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
} 