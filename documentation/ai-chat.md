## AI Chat ("Ask about me") – Architecture, Security, and Operations

This document explains the end-to-end AI chat feature: how it's built, where to edit it, what data is indexed, security measures, and how to tune/operate it safely.

### Overview

- **Core Functionality**: Inline chat section on the homepage that answers questions about Shreyash using only content on this site (posts + projects + resume).
- **Architecture**: Advanced Retrieval-augmented generation (RAG) with semantic chunking, intelligent content type detection, and enhanced vector search.
- **Content Type Intelligence**: Strong differentiation between projects, blog posts, and resume content with dedicated retrieval pathways.
- **Security Model**: Multi-layered security with comprehensive input validation, XSS protection, rate limiting, and same-origin enforcement.
- **Response Flow**: Server API handles rate limiting, input validation, intelligent retrieval, prompting, and streaming; client never sees API keys.
- **Safety Features**: Multiple guardrails prevent prompt injection, XSS attacks, and out-of-scope answers with structured error handling.

### Key Files and Responsibilities

#### Core Components

- **`scripts/build-embeddings.ts`**
  Advanced build-time indexer with semantic content processing:
  - **Semantic Chunking**: Paragraph-aware chunking that preserves context boundaries
  - **Structure Preservation**: Maintains markdown structure (headers, lists, emphasis) for better retrieval
  - **Universal Metadata**: Adds complete metadata to ALL chunks (prevents content type confusion)
  - **Enhanced Processing**: 2500-character chunks with 400-character overlap for better context
  - **Intelligent Content Limits**: 24,000 characters per source (increased from 16K)
  - **Optimized Output**: Reduced total chunks from 127 → 70 while improving quality
  - Generates embeddings using OpenAI's `text-embedding-3-small` model
  - Creates vector index stored in `src/data/vector-index.json`
  - Handles metadata extraction (dates, technologies, project URLs)

- **`src/lib/rag.ts`**
  Advanced Retrieval-Augmented Generation utilities:
  - Vector index loading with caching and file watching
  - Optimized cosine similarity calculations with early termination
  - Top-K retrieval with heap-based selection for performance
  - **Enhanced Lexical Fallback**: Strong content type boosting (+50 for correct type, -20 penalty for wrong type)
  - **Intelligent Content Type Detection**: Dedicated patterns for project vs blog post vs resume queries
  - Intent detection (latest projects/posts, earliest content, technology queries)
  - Context building with configurable size limits
  - Memory-efficient caching with TTL and size limits

- **`src/lib/rateLimit.ts`**
  Multi-tier rate limiting system:
  - **Production**: Upstash Redis with sliding window (10 requests per 2 minutes)
  - **Development**: Local in-memory fallback with same limits
  - Client identification via IP + User-Agent combination
  - Automatic fallback handling and error recovery
  - Rate limit violation logging and monitoring

- **`src/lib/security.ts`**
  Security monitoring and logging:
  - Structured security event logging
  - Client key sanitization for privacy
  - Suspicious request detection
  - Security event types: rate_limit, cross_origin, validation_failed, etc.

- **`src/lib/prompts.ts`**
  Centralized prompt configuration with enhanced content type awareness:
  - **Enhanced System Prompt**: Explicit content type recognition (projects vs blog posts vs resume)
  - **Content Type Instructions**: Clear guidance for distinguishing between different content types
  - Model selection (currently `gpt-5-mini` - 400B params, 400K context window)
  - Configurable parameters (max tokens up to 128K, context sizes)
  - **Note**: Temperature parameter removed in GPT-5 models
  - **Advanced Embedding Settings**: Semantic chunking, structure preservation, enhanced chunk sizes
  - Retrieval settings (results count, context size per query type)

#### API Layer

- **`src/app/api/chat/route.ts`**
  Main chat API endpoint with enhanced intelligence and security:
  - **Input Validation**: Zod schemas with length limits and content filtering
  - **Security Checks**: Same-origin enforcement, content-type validation, size limits
  - **Rate Limiting**: Integrated with Redis/local rate limiter
  - **Embedding Generation**: Query embedding with timeout protection (30s)
  - **Advanced Intent Detection**: Multi-pattern recognition for project/blog/resume queries
  - **Content Type Prioritization**: Strong preference enforcement for project-only or post-only queries
  - **Fallback Protection**: Retrieves all projects from index if none found in similarity search
  - **Streaming Response**: Real-time token streaming with source attribution
  - **Error Handling**: Structured error responses with user-friendly messages

#### Frontend Components

- **`src/app/_components/inline-chat.tsx`**
  Secure client-side chat interface:
  - **Input Sanitization**: Multi-layer XSS protection and injection prevention
  - **Markdown Rendering**: Safe HTML generation with DOMPurify and custom validation
  - **URL Validation**: Strict URL filtering preventing dangerous protocols
  - **Real-time Streaming**: Token-by-token response rendering
  - **Conversation Management**: History tracking and focus URL persistence
  - **Security Features**: Control character filtering, protocol handler blocking
  - **User Experience**: Auto-focus, keyboard shortcuts, loading states

#### Configuration

- **`.gitignore`**
  Excludes sensitive files: `src/data/vector-index.json`, `.env` files
- **`next.config.js`**
  Build configuration with prebuild embedding generation
- **`package.json`**
  Scripts for development, building, and embedding generation

### Environment Variables

#### Required Variables
- **`OPENAI_API_KEY`** (required): OpenAI API key for embeddings and chat completion. Never quote in `.env` file.
  - Format: `OPENAI_API_KEY=sk-...`
  - Used for: `text-embedding-3-small` (embeddings) and `gpt-5-mini` (chat completion)

#### Optional Variables
- **`UPSTASH_REDIS_REST_URL`** & **`UPSTASH_REDIS_REST_TOKEN`**: Enable production-grade Redis rate limiting
  - If not provided, falls back to local in-memory rate limiting
  - Recommended for production deployments
  - Enables sliding window rate limiting across multiple server instances

#### Build-time Variables
- **`NEXT_PUBLIC_SITE_URL`**: Optional site URL override (defaults to production/development URLs)
  - Format: `https://yourdomain.com` (no trailing slash)
  - Affects URL generation in responses and sitemap

#### Security Considerations
- All environment variables are validated at startup
- API keys never exposed to client-side code
- Rate limiting works independently of environment configuration

### Build and Run

The index is generated before build via `prebuild`:

```bash
npm install
npm run build:index   # optional manual run
npm run dev           # or: npm run build && npm start
```

If `OPENAI_API_KEY` is not set, an empty index is written to allow local builds (answers will be limited).

### Data Ingestion: Content Processing Pipeline

#### Content Sources
The system processes content from three directories:

**`_posts/*.md`** (Blog Posts):
- Front matter fields: `title`, `date`, `excerpt`, `author`
- Content processing: Full markdown content with metadata extraction
- Date parsing: ISO format conversion with validation
- URL generation: `/posts/{slug}` format

**`_projects/*.md`** (Projects):
- Front matter fields: `title`, `date`, `description`, `technologies[]`, `projectUrl` (optional)
- Content processing: Project descriptions and technical details
- Technology tagging: Array of technologies for enhanced retrieval
- URL generation: `/projects#{slug}` format (anchors to project sections)

**`_resume/*.md`** (Resume):
- Front matter fields: `lastUpdated` (optional)
- Content processing: Professional experience, skills, education
- URL generation: `/resume` (single page)

#### Vector Index Structure
Each document is chunked and embedded with the following structure:

```typescript
interface RetrievedDoc {
  id: string;              // Unique identifier: "{type}:{slug}:{chunkIndex}"
  type: "post" | "project" | "resume";
  title: string;           // Document title
  slug: string;            // URL slug
  url: string;             // Full URL path
  text: string;            // Chunked and normalized content
  embedding: number[];     // 1536-dimensional vector (text-embedding-3-small)
  date?: string;           // ISO date string
  lastUpdated?: string;    // Resume update timestamp
  summary?: string;        // Excerpt or description
  technologies?: string[]; // Technology tags (projects only)
  projectUrl?: string;     // External project URL (projects only)
}
```

#### Text Processing & Chunking

**Enhanced Normalization Pipeline:**
1. **Structure Preservation**: Maintains markdown headers, lists, and emphasis for better context
2. **Semantic Chunking**: Paragraph-aware chunking that respects natural content boundaries
3. **Link Preservation**: Convert `[text](url)` to `text` while preserving link text
4. **Universal Metadata**: **ALL chunks** contain complete metadata (prevents content type confusion)

**Metadata Header Format** (added to **EVERY chunk**):
```
Type: {post|project|resume}
Title: {title}
ChunkIndex: {0,1,2,...}
Date: {ISO_date}
Summary: {excerpt|description}
Technologies: {tech1, tech2, ...}  // projects only
ProjectURL: {external_url}        // projects only
LastUpdated: {timestamp}          // resume only

{content_chunk}
```

**Enhanced Embedding Configuration:**
- Model: `text-embedding-3-small` (1536 dimensions)
- Batch size: 64 chunks per API call
- **Chunk size: 2,500 characters** (increased from 1200)
- **Overlap: 400 characters** (increased from 200) 
- **Max content length: 24,000 characters** per source (increased from 16K)
- **Semantic chunking: ENABLED** (paragraph-aware boundaries)
- **Structure preservation: ENABLED** (maintains markdown formatting)
- **Result: 70 total chunks** (reduced from 127 while improving quality)

Regenerate the index after adding/editing posts or projects:

```bash
npm run build:index
```

### Request Processing Flow (Server)

#### Phase 1: Security & Validation
1. **Content-Type Validation**: Ensures `application/json` content type
2. **Request Size Check**: 1MB maximum request size limit
3. **Same-Origin Verification**: Validates request origin matches host header
4. **Input Schema Validation**: Comprehensive Zod validation with security filters
5. **Rate Limiting**: Sliding window rate limit (10 requests per 2 minutes per client)

#### Phase 2: Embedding & Retrieval
6. **Query Embedding**: Generate vector embedding with 30-second timeout
   - Model: `text-embedding-3-small`
   - Pronoun-aware enrichment for follow-up questions
   - Fallback handling for embedding failures

7. **Enhanced Document Retrieval**:
   - **Pronoun Detection**: Identifies follow-up questions ("it", "that", "this", "the post")
   - **Focus URL Priority**: Uses provided `focusUrls` for contextual continuity
   - **Advanced Intent Recognition**: Multi-pattern detection for query types:
     - **Project Queries**: Direct questions ("what projects", "tell me about projects"), numbered requests ("4 projects"), work-related ("projects you worked on/built")
     - **Blog Post Queries**: Blog-specific patterns ("blog posts you wrote", "articles")
     - **Resume Queries**: Career-related ("work experience", "skills", "education")
     - **Technology Queries**: Enhanced retrieval with larger context (5000 chars vs 3500)
     - **Temporal Queries**: Latest/earliest content with proper chronological sorting
   - **Content Type Prioritization**: 
     - **Strong Enforcement**: Project queries get project-only results (up to 10 items)
     - **Fallback Protection**: Retrieves all projects from index if none in similarity results
   - **Vector Search**: Cosine similarity with optimized heap-based selection
   - **Enhanced Lexical Fallback**: Strong content type boosting (+50 for match, -20 penalty for mismatch)
   - **Context Assembly**: Up to 5-10 most relevant documents with intelligent deduplication

#### Phase 3: Context Building & Response Generation
8. **Context Construction**:
   - Technology queries: Larger context (5000 chars) for comprehensive coverage
   - Standard queries: Optimized context (3500 chars)
   - Metadata integration: Title, date, technologies, project URLs
   - Source attribution tracking

9. **Prompt Engineering**:
   - **System Prompt**: Grounding rules, response guidelines, security constraints
   - **User Prompt**: Structured format with context, rules, and question
   - **Response Constraints**: Context-only answers, markdown formatting, link requirements

10. **Streaming Response**:
    - Real-time token streaming via ReadableStream
    - Source attribution via `[[SOURCES]]` JSON markers
    - Timeout protection (60 seconds)
    - Error handling with graceful degradation

#### Response Headers (Diagnostics)
- `x-latency-ms`: Total request processing time
- `x-embed-ms`: Embedding generation time
- `x-retrieve-ms`: Document retrieval time
- `x-model-used`: AI model identifier (`gpt-5-mini`)
- `x-index-size`: Total documents in vector index
- `x-retrieved`: Number of documents retrieved for context

### Frontend Behavior & Security

#### User Interface Features
- **Smart Suggestions**: Context-aware suggestion prompts based on time of day and visitor status
- **Real-time Streaming**: Token-by-token response rendering with loading indicators
- **Conversation Continuity**: Maintains focus URLs for contextual follow-up questions
- **Auto-focus**: Intelligent input focusing with keyboard navigation
- **Responsive Design**: Mobile-optimized chat interface

#### Security Implementation
- **Multi-layer Input Sanitization**:
  - HTML entity encoding for dangerous characters
  - Protocol handler blocking (javascript:, data:, vbscript:, etc.)
  - Control character filtering with Unicode-safe implementation
  - Length validation and excessive whitespace removal

- **Safe Markdown Rendering**:
  - Custom `validateUrl()` function preventing dangerous protocols
  - Comprehensive HTML escaping for all text content
  - DOMPurify integration with strict tag/attribute whitelisting
  - XSS protection for links, formatting, and list items

- **Client-side Validation**:
  - Real-time input filtering preventing injection attempts
  - Keyboard event monitoring for security threats
  - Content validation before API submission

#### Customization Options
- **UI Text**: Edit suggestion prompts, placeholders, and messages in `src/app/_components/inline-chat.tsx`
- **Security Rules**: Modify URL validation patterns and sanitization rules
- **Styling**: Tailwind CSS classes for theme customization
- **Component Location**: Main chat interface in `src/app/page.tsx`

### Security & Guardrails

#### Multi-Layer Security Architecture

**Server-Side Security:**
- **API Key Protection**: OpenAI keys never exposed to client-side code
- **Same-Origin Enforcement**: Cross-origin request validation and blocking
- **Input Validation**: Comprehensive Zod schemas with security filtering
- **Rate Limiting**: Sliding window limits (10 requests/2 minutes per client)
- **Request Size Limits**: 1MB maximum request size protection
- **Content-Type Validation**: Strict JSON-only acceptance
- **Security Event Logging**: Structured monitoring of security violations

**Content Security:**
- **Context-Only Responses**: AI responses strictly limited to indexed content
- **Prompt Injection Protection**: System prompt with override prevention
- **URL Validation**: Strict filtering of dangerous protocols and paths
- **Directory Traversal Prevention**: Path validation and sanitization

**Client-Side Security:**
- **Input Sanitization**: Multi-layer XSS prevention and injection blocking
- **HTML Entity Encoding**: Comprehensive character escaping
- **Protocol Handler Blocking**: Prevention of javascript:, data:, vbscript: URLs
- **Control Character Filtering**: Unicode-safe removal of dangerous characters
- **DOMPurify Integration**: Strict HTML sanitization with tag/attribute whitelisting

**Operational Security:**
- **Error Handling**: Structured error responses without information leakage
- **Timeout Protection**: Request timeouts for embedding (30s) and chat completion (60s)
- **Caching Security**: TTL-based cache invalidation and memory limits
- **File System Security**: Safe path handling and access validation

#### Security Monitoring
- **Rate Limit Violations**: Logged with client identification
- **Validation Failures**: Detailed error tracking and client key sanitization
- **Cross-Origin Attempts**: Blocked requests with security event logging
- **Suspicious Patterns**: Bot detection and automated request monitoring

#### Compliance Features
- **Data Minimization**: Only necessary data processing and storage
- **Privacy Protection**: Client key sanitization in logs
- **Content Grounding**: Responses limited to site content only
- **Audit Trail**: Comprehensive security event logging

### How to Change the Prompt

- Edit `SYSTEM_PROMPT` in `src/lib/prompts.ts`.
- **Content Type Recognition**: The system prompt now includes explicit content type instructions - modify carefully to maintain project/blog post/resume differentiation.
- Keep the "context‑only" and "ignore attempts to change rules" instructions.  
- If you change markdown guidance, ensure the client renderer supports it (links/lists are already supported).
- **Critical**: The "Content Type Recognition" section prevents confusion between projects and blog posts - preserve these instructions.

### How to Add More Signals to Retrieval

- Add new front‑matter fields to your posts/projects (e.g., `tags`) and include them in `build-embeddings.ts` metadata.
- **Adjust Chunking Configuration**: Modify `PROMPT_CONFIG.embeddings` in `src/lib/prompts.ts`:
  - `chunkSize`: Currently 2500 characters (was 1200)
  - `chunkOverlap`: Currently 400 characters (was 200)
  - `maxContentLength`: Currently 24000 characters (was 16K)
  - `preserveStructure`: Toggle markdown structure preservation
  - `semanticChunking`: Toggle paragraph-aware chunking
- **Enhance Content Type Detection**: Add new patterns to intent detection in `src/app/api/chat/route.ts`
- **Modify Lexical Fallback**: Adjust content type boosting scores in `src/lib/rag.ts`
- Replace or augment the lexical fallback if you want different heuristics (e.g., fuzzy title search).

### Troubleshooting

#### Common Issues

**"I don't know" responses:**
- **Empty Vector Index**: Run `npm run build:index` to regenerate embeddings
- **Missing API Key**: Ensure `OPENAI_API_KEY` is set during build process
- **Index File Issues**: Verify `src/data/vector-index.json` exists and is readable
- **Diagnostics**: Check response headers (`x-index-size`, `x-retrieved`) for debugging

**Rate Limiting (429 errors):**
- **Local Rate Limit**: Wait 2 minutes for reset (10 requests per 2-minute window)
- **Redis Configuration**: Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- **Client Identification**: Rate limits apply per IP+User-Agent combination

**Cross-Origin Errors (403 Forbidden):**
- **Development**: Ensure requests come from `http://localhost:3000`
- **Production**: Verify requests originate from your deployed domain
- **CORS Headers**: Check that Origin header matches Host header

**Server Errors (500/502):**
- **API Key Issues**: Verify `OPENAI_API_KEY` is valid and has sufficient credits
- **Model Availability**: Check OpenAI service status for `gpt-5-mini` and `text-embedding-3-small`
- **Timeout Issues**: Embedding requests timeout after 30s, chat completion after 60s
- **Memory Issues**: Vector index loading may fail if system memory is constrained

#### Performance Issues

**Slow Responses:**
- **Optimized Index**: Current index has 70 chunks (reduced from 127) for better efficiency
- **Complex Queries**: Technology and project queries retrieve more results (up to 10-12 vs 5)
- **Embedding Time**: Check `x-embed-ms` header; > 5s may indicate API issues

**High Memory Usage:**
- **Cache Issues**: Vector index cached with 5-minute TTL and 50MB limit
- **Enhanced Content**: Individual documents limited to 24,000 characters (increased from 16K)
- **Optimized Chunking**: 2500-character chunks with 400-character overlap for better context
- **Semantic Efficiency**: Paragraph-aware chunking reduces total chunks while improving quality

### Testing & Development

#### API Testing Examples

```bash
# Basic question about projects
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What machine learning projects has Shreyash worked on?"}'

# Technology-specific query (retrieves more results)
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Tell me about React projects"}'

# Follow-up question with context
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What was it about?","focusUrls":["/projects#captcha-recognition-using-crnn"]}'

# Latest content query
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What is the latest project you worked on?"}'

# Resume/career information
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Tell me about your work experience"}'
```

#### Response Headers for Debugging

```bash
curl -v -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello"}' 2>&1 | grep "x-"
```

Expected headers:
```
x-latency-ms: 1250
x-embed-ms: 450
x-retrieve-ms: 150
x-model-used: gpt-5-mini
x-index-size: 125
x-retrieved: 5
```

### Deployment & Production

#### Build Configuration
- **Prebuild Process**: `npm run build:index` generates vector embeddings before main build
- **Runtime Requirement**: `export const runtime = 'nodejs'` required for file system access
- **Index Storage**: `src/data/vector-index.json` excluded from git (generated at build time)

#### Environment Setup
```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (recommended for production)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Optional (for custom domain)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### Production Security
- **HTTPS Enforcement**: Required for proper same-origin validation
- **Domain Verification**: Ensure requests originate from your deployed domain
- **Rate Limiting**: Configure Redis for production-scale rate limiting
- **Monitoring**: Implement logging for security events and performance metrics

#### Performance Optimization
- **Optimized Index**: Current system maintains 70 chunks (down from 127) with better semantic quality
- **Enhanced Memory Usage**: Vector cache limited to 50MB with 5-minute TTL, improved chunk efficiency
- **Request Timeouts**: 30s for embeddings, 60s for chat completion
- **Batch Processing**: Embeddings processed in batches of 64 for efficiency
- **Semantic Chunking**: Paragraph-aware processing reduces fragmentation while preserving context

### Recent Improvements (Latest Release)

#### Major RAG Quality Enhancements
- **🎯 Content Type Intelligence**: Fixed critical issue where projects and blog posts were confused
  - Added explicit content type recognition to system prompt
  - Enhanced intent detection with multi-pattern recognition
  - Strong content type prioritization in retrieval logic
  - Universal metadata in ALL chunks (prevents type confusion)

#### Vector Index Optimization
- **📈 Semantic Chunking**: Paragraph-aware chunking that respects natural content boundaries
- **📊 Enhanced Configuration**: 
  - Chunk size: 1200 → 2500 characters (+108% context)
  - Overlap: 200 → 400 characters (+100% continuity)
  - Max content: 16K → 24K characters (+50% capture)
- **🗜️ Index Efficiency**: Reduced from 127 → 70 chunks while improving quality
- **🏗️ Structure Preservation**: Maintains markdown headers, lists, and emphasis

#### Intelligent Retrieval
- **🎲 Advanced Intent Detection**: Multi-pattern recognition for project/blog/resume queries
- **🛡️ Fallback Protection**: Retrieves all projects if none found in similarity search
- **⚡ Enhanced Lexical Fallback**: +50 boost for correct content type, -20 penalty for wrong type
- **📈 Project Query Optimization**: Up to 10 project results vs 5 standard results

### Architecture Evolution

#### Current Limitations
- **File-based Index**: Requires rebuild for content updates
- **Memory Constraints**: 50MB cache limit may not scale indefinitely
- **Single-turn Focus**: Limited conversation continuity across sessions

#### Future Enhancements
- **Vector Database**: Migrate to pgvector/Pinecone for dynamic content updates
- **Conversation Memory**: Server-side session management for multi-turn conversations
- **Index Optimization**: Incremental updates instead of full rebuilds
- **Advanced Retrieval**: Hybrid search combining vector and keyword methods
- **Analytics Integration**: Usage tracking and performance monitoring
- **Content Moderation**: Additional safety filters for user-generated content


