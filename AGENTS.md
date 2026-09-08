# FeniX Master Coding Rules

## Mission

Maintain FeniX as:

- Stable
- Secure
- Responsive
- Fast
- Maintainable
- Scalable
- Premium
- Future-proof

## Before changing code

Always:

1. Inspect the existing architecture.
2. Inspect related files and imports.
3. Understand existing API contracts.
4. Check database/schema assumptions.
5. Check authentication and authorization.
6. Check RLS/security implications.
7. Identify the smallest safe change.
8. Preserve existing working functionality.

Never guess the existing implementation.

## Authentication

Authentication is security-sensitive.

Never:

- Rewrite the authentication system unnecessarily.
- Change existing login/signup function contracts without checking callers.
- Remove auth validation.
- Disable authorization.
- Expose secrets.
- Hardcode Supabase credentials.
- Bypass Supabase RLS.

Before modifying auth:

- Inspect `src/app/login`
- Inspect `src/lib/auth`
- Inspect `src/utils/supabase`
- Inspect middleware
- Inspect auth callback routes

Preserve existing behavior unless the task explicitly requires a behavior change.

## Database

Never invent database columns, tables, relationships, RPC functions, indexes, or policies.

Before changing database-related code:

- Inspect the current database contract.
- Inspect existing types.
- Inspect RLS assumptions.
- Preserve ownership checks.

Prefer database-first changes when a schema change is actually required.

## TypeScript

- Keep strict TypeScript compatibility.
- Do not use `any` to hide type errors.
- Do not weaken types just to make the build pass.
- Reuse existing application types.
- Preserve caller/helper contracts.

## Bug fixing

When a build or test fails:

1. Read the complete error.
2. Find the originating file.
3. Trace the import/call chain.
4. Determine the root cause.
5. Make the smallest safe fix.
6. Run lint.
7. Run type checking/build.
8. Re-check related functionality.
9. Only then prepare a pull request.

Do not repeatedly patch symptoms.

## Dependencies

Do not add a dependency unless:

- It is genuinely necessary.
- The existing stack cannot solve the problem.
- The dependency is maintained.
- It does not introduce unnecessary bundle/security cost.

## UI

Preserve FeniX's:

- Premium identity
- Modern design
- Responsive behavior
- Accessibility
- Performance-conscious animations

Do not introduce unnecessary animation or visual complexity.

## Performance

Avoid:

- unnecessary client components
- unnecessary re-renders
- huge dependencies
- blocking network requests
- oversized images
- duplicated logic

## Security

Never:

- commit secrets
- expose service-role keys
- bypass RLS
- trust client-provided ownership
- weaken authentication
- disable security checks

## Production rule

A fix is not considered complete until:

- TypeScript passes
- Lint passes
- Production build passes
- Existing functionality is preserved
- Security assumptions remain intact

## Git rule

Never push automated fixes directly to `main`.

Use:

`auto-fix/<short-description>`

Then create a Pull Request targeting `main`.

Human approval is required before production merge.

## Scope rule

Do not modify unrelated files.

If the root cause requires multiple files, explain why each file is necessary.

## Final report

Every automated fix must report:

- Root cause
- Files changed
- What was fixed
- Tests/checks executed
- Remaining warnings
- Security considerations
