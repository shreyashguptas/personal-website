# Supabase Database Documentation

## Database Schema

### Enums

```sql
CREATE TYPE blog_status AS ENUM ('published', 'draft');
```

### Tables

#### Blogs Table
```sql
CREATE TABLE blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status blog_status DEFAULT 'draft'::blog_status NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION slugify("value" TEXT)
RETURNS TEXT AS $$
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$$ LANGUAGE SQL STRICT IMMUTABLE;

-- Function to generate unique blog slugs
CREATE OR REPLACE FUNCTION generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate a slug if one isn't provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.title);
  END IF;
  
  -- Ensure uniqueness by appending a number if necessary
  WHILE EXISTS(SELECT 1 FROM blogs WHERE slug = NEW.slug AND id != NEW.id) LOOP
    NEW.slug := regexp_replace(NEW.slug, '-\d+$', '');
    NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic slug generation
CREATE TRIGGER generate_blog_slug_trigger
  BEFORE INSERT OR UPDATE OF title
  ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION generate_blog_slug();
```

#### Readings Table
```sql
CREATE TABLE readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  url TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  tags TEXT[] NOT NULL,
  recommendation SMALLINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### Projects Table
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  tags TEXT[] NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  details TEXT NOT NULL,
  pinned BOOLEAN,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## Row Level Security (RLS)

All tables have Row Level Security enabled with specific policies for different operations.

### Blogs Table Policies

```sql
-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON blogs
FOR SELECT USING (status = 'published');

CREATE POLICY "Enable insert for authenticated users only" ON blogs
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON blogs
FOR UPDATE USING (auth.role() = 'authenticated');
```

### Readings Table Policies

```sql
-- Enable RLS
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON readings
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON readings
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON readings
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON readings
FOR DELETE USING (auth.role() = 'authenticated');
```

### Projects Table Policies

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON projects
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON projects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON projects
FOR UPDATE USING (auth.role() = 'authenticated');
```

## Environment Variables

The following environment variables are required for Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## Database Access Patterns

### Public Access
- Read access to published blogs
- Read access to all projects
- Read access to all readings

### Authenticated Access
- Create new blogs, projects, and readings
- Update existing blogs, projects, and readings
- Delete readings (only table with delete policy)
- Access to draft blogs

## Backup and Migration

### Taking Database Backup
1. Navigate to Database → Backups in Supabase Dashboard
2. Click "Create a backup"
3. Download and store the backup file safely

### Restoring from Backup
1. Create a new Supabase project if needed
2. Use the Supabase Dashboard's restore functionality
3. Select the backup file to restore

## Type Definitions

The database types are automatically generated using the Supabase CLI and stored in `lib/supabase/types.ts`. To update types after schema changes:

```bash
supabase gen types typescript --project-id "<project-id>" --schema public > lib/supabase/types.ts
``` 