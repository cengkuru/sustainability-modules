# CLAUDE.md — MOZ Portal Project Guidance

## 🚨 **Agent Survival Card (Read First)**

### Your Role

- **ROOT** → Orchestrator. May delegate ONE agent per task via `Task(subagent_type=...)`

- **AGENT** → Terminal worker. NO delegation. Tools only.

### 5 Non-Negotiable Rules

1. **NO agent calls from AGENT role** → Return: `REFUSAL: Agent delegation is prohibited. Proceeding with tools only.`

2. **Relative paths only** → Never `/Users/...` or Unicode apostrophes (')
3. **Tests FIRST** → Red → Green → Refactor

4. **Update CHANGELOG immediately** after success (UTC timestamp, files, lines, impact)
5. **Design System for ALL UI** → Check `src/design-system/` first

### Quick Triage

1. **Files touched?** 1-2=Low | 3-5=Medium | 5+=High friction

2. **Know pattern?** No → Use `context-analyzer` first

3. **Category?** UI→`ui-ux-designer` | Backend→`backend-architect` | Testing→`tester`

---

## 1. Role Boundaries

**ROOT:** Call `Task(subagent_type="...")` once per task. No chains.  
**AGENT:** NEVER invoke `Task()` or other agents. Tools only.

**Auto-refuse if:** `Task(`, `subagent_type=`, "invoke agent", `/Users/cengkuru`, Unicode paths

---

## 2. Path Safety

- **USE:** `src/app/file.ts` ✓

- **NEVER:** `/Users/.../src/app/file.ts` ✗

- **VERIFY:** `ls src/app/` before creation

**If files vanish:** `find . -name "filename"` → If phantom folder → STOP

---

## 3. Output Format

```

## Result

[What was done]

## Verification

Files: [list] | Tests: [Y/N] | Confidence: [H/M/L]

## Next Steps

[If any]

```

---

## 4. Design System

1. Check `src/design-system/` → Use if exists

2. Missing? → Create via `ui-ux-designer` → Add to system

3. Use CSS variables from `styles.scss` only

4. WCAG AA required

---

## 5. TDD Workflow

1. Write failing test → 2. Pass it → 3. Refactor → 4. `npm run precommit`

**Coverage:** Unit ≥80% | Integration for critical flows

---

## 6. CHANGELOG Format

```markdown

### [Type] - YYYY-MM-DD HH:MM:SS UTC

- **🔧 Component: Description**
  - **Files**: file.ts (L10-20)
  - **Result**: User impact

```

✨ Added | 🐛 Fixed | 🔧 Changed | 🔒 Security | 🚀 Performance

---

## 7. Context Limits

- **CLAUDE.md** < 37KB

- **CONTEXT.md** < 20KB (update after each session)

---

## 8. Decision Matrix

<!-- ROOT-ONLY:START -->

| Task | Agent | Use When |
|------|-------|----------|
| Complex/unclear | `context-analyzer` | Multi-file, new domains |
| UI/UX | `ui-ux-designer` | Interface, accessibility |
| Backend | `backend-architect` | Firebase, APIs, cloud |
| Standards | `oc4ids-expert` | OC4IDS/CoST/OCDS |
| Testing | `tester` | QA, validation |
| Narratives | `data-storyteller` | Reports, comms |
<!-- ROOT-ONLY:END -->

| Common Task | Action |
|-------------|--------|
| Styling | Use Design System |
| Scripts | Place in `/scripts` |
| Deploy | `firebase deploy --only functions:name` |
| Firestore undefined | Clean with helper below |

---

## 9. Commands

```bash

# Dev

npm start                      # Server

npm run build                  # Production

npm run precommit              # ALL checks

# Test

npm test                       # All

npm run test:watch             # Auto

npm run test:coverage          # Coverage

# Firebase

firebase emulators:start       # Local

firebase deploy --only hosting # Deploy

```

---

## 10. Code Patterns

### Firestore Clean Helper

```typescript
export function cleanFirestoreData<T>(data: T): Partial<T> {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(data as any)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value) && 
          !(value instanceof Date) && !value.seconds) {
        const nested = cleanFirestoreData(value);
        if (Object.keys(nested).length > 0) cleaned[key] = nested;
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

```

### Import Combining

```typescript
// ❌ Wrong
import { onRequest } from 'firebase-functions/v2/https';
import { HttpsError } from 'firebase-functions/v2/https';

// ✅ Correct
import { onRequest, HttpsError } from 'firebase-functions/v2/https';

```

### Observable Loading

```typescript
// ✅ Correct for streams
stream.subscribe({
  next: data => {
    this.loading = false;
    this.data = data;
  },
  error: () => this.loading = false
})

```

---

## 11. Constraints

**Cost:** Deploy functions individually | 128MiB for CRUD | Budget alert $100  
**Performance:** 10MB initial, 6MB lazy | Paginate queries  
**Security:** No keys in code | Validate inputs | Rate limit  

---

## 12. Objectivity

- Correct errors immediately

- Challenge with evidence

- No flattery

- Say "I don't know"
- Truth > agreement

---

## 13. Pro Tips

1. **Surgical precision** - Touch only needed files

2. **Batch small fixes** - One commit, comprehensive CHANGELOG

3. **Update CONTEXT.md** - After EVERY session

4. **Check friction** - Before starting

5. **Test first** - Always

---

## 14. Validation

```bash

# Pre-commit

npm run precommit

# Recursion check

awk '
BEGIN { in_root = 0 }
/<!-- ROOT-ONLY:START -->/ { in_root = 1; next }  

/<!-- ROOT-ONLY:END -->/ { in_root = 0; next }

/Task[(]subagent_type=/ && in_root == 0 { 
  print "ERROR Line " NR; exit 1 
}
END { print "✅ Task() contained" }
' CLAUDE.md

```

---

## Project Structure

```

src/
├── app/
│   ├── public/      # Public features

│   ├── admin/       # Admin panel

│   ├── core/        # Services

│   └── models/      # Data models

├── design-system/   # UI patterns

└── assets/i18n/     # Translations (en.json, pt.json)

scripts/             # All scripts here

```

---

## Key Services

- **AuthService** - Firebase Auth, role-based

- **ProjectService** - Project lifecycle

- **DataService** - OC4IDS transformation

- **StatsServices** - Analytics

---

## Translation Checklist

- [ ] Keys in en.json & pt.json

- [ ] I18nService injected

- [ ] All text uses i18nService.t()
- [ ] No hardcoded strings

---

## Common Mistakes

❌ Code before tests  
❌ Skip CHANGELOG  
❌ Absolute paths  
❌ Deploy all functions  
❌ Hardcode colors  

✅ Test first  
✅ Update CHANGELOG immediately  
✅ Relative paths  
✅ Deploy individually  
✅ Use Design System  

---

**Remember:** Tests first | CHANGELOG immediately | Relative paths only
