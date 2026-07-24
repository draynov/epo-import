<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:epo-api-rules -->
# EPO API Integration Rules

## Sync Endpoint Pattern
- Send records **one-by-one in a loop**, NOT as JSON array with `data` field
- Each request: `token`, `portfolio`, `users`, `cmd`, + record fields
- Use `URLSearchParams` for form encoding
- NO `Authorization` header - token goes in body
- Check response: `'Message' in data` (success) or `'Error' in data` (failure)

## UI Icons
- **ALWAYS use inline SVG** in JSX for icons
- **NEVER use PNG images** for UI icons
- Inline SVG advantages: scalable, small size, no HTTP requests, easy Tailwind styling
- Examples: sync spinner, checkmarks, error X - all inline SVG
<!-- END:epo-api-rules -->
