# Resume Integration

This directory contains your resume information that will be integrated into the AI chat system.

## How to Use

1. **Edit the resume**: Open `resume.md` and replace the placeholder content with your actual information
2. **Update regularly**: Change the `lastUpdated` field in the front matter when you update your resume
3. **Rebuild**: Run `npm run build:index` to regenerate the embeddings with your resume data

## Resume Format

The resume should be in Markdown format with the following front matter:

```yaml
---
title: "Your Name - Resume"
type: "resume"
lastUpdated: "YYYY-MM-DD"
---
```

## What Gets Embedded

- **Work Experience**: Job titles, companies, durations, achievements
- **Technical Skills**: Programming languages, frameworks, tools
- **Education**: Degrees, institutions, graduation dates
- **Certifications**: Professional certifications and dates
- **Projects**: Notable projects and achievements

## AI Chat Integration

Once embedded, the AI can answer questions about:

- "What companies have you worked for?"
- "What's your experience with Python?"
- "What's your educational background?"
- "What skills do you have in web development?"
- "How long were you at Company X?"

## File Structure

```
_resume/
├── resume.md          # Your actual resume content
└── README.md          # This documentation file
```

## Updating Your Resume

1. Edit `resume.md` with your new information
2. Update the `lastUpdated` field
3. Run `npm run build:index` to regenerate embeddings
4. The AI will now have access to your updated information

## Tips for Better AI Responses

- Use clear, structured formatting
- Include specific dates and durations
- List concrete achievements and responsibilities
- Use consistent terminology for skills and technologies
- Keep information current and accurate
