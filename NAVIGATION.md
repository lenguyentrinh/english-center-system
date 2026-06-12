# NAVIGATION.md - Documentation Links & Relationships

**Purpose:** Help AI coding agents and developers understand file relationships and navigation paths.

---

## 🗺️ Document Relationship Map

```
ENTRY POINTS (Read First)
    ├── HANDOFF.md (what to build next)
    ├── PROGRESS.md (project history & status)
    └── README.md (project overview)
         │
         ├─→ CLAUDE.md (environment setup)
         ├─→ RULE.md (architectural rules - MUST READ before coding)
         ├─→ AGENTS.md (development workflow)
         └─→ /docs/ (detailed specifications)

SPECIFICATION LAYER
    /docs/
    ├── README.md (navigation hub)
    ├── QUICK_REFERENCE.md (cheat sheet)
    ├── 01-CORE_SPECIFICATION.md (domain model, business rules)
    ├── 02-PLANNING_DOCUMENT.md (roadmap, risks, phases)
    └── 03-ARCHITECTURE_DATAFLOW.md (system design, data flows)

FEATURE SPECIFICATIONS
    /docs/features/
    ├── 01-AUTH_FEATURE.md (FEAT-001: Authentication)
    ├── 02-USER_MANAGEMENT_FEATURE.md (FEAT-002: User & Roles)
    ├── 03-COURSE_MANAGEMENT_FEATURE.md (FEAT-003: Courses)
    ├── 04-ENROLLMENT_FEATURE.md (FEAT-004: Enrollment)
    ├── 05-ATTENDANCE_FEATURE.md (FEAT-005: Attendance)
    ├── 06-TEACHER_MANAGEMENT_FEATURE.md (FEAT-006: Teachers)
    └── 07-STUDENT_MANAGEMENT_FEATURE.md (FEAT-007: Students)

ARCHIVE & HISTORY
    HANDOFF-ARCHIVE/
    ├── README.md (archival strategy)
    ├── HANDOFF-PHASE1-END.md (created at week 8)
    └── HANDOFF-PHASE2-END.md (created at week 16)
```

---

## 📍 Navigation Paths

### For a New Developer Starting

```
1. HANDOFF.md (5 min) ← START HERE
   "What am I building?"
   
2. PROGRESS.md (10 min)
   "What's been done? What's the status?"
   
3. RULE.md (15 min)
   "What rules must I follow?"
   
4. AGENTS.md (10 min)
   "How do I work and structure my work?"
   
5. CLAUDE.md (10 min)
   "How do I set up my environment?"
   
6. /docs/README.md (5 min)
   "Where are the detailed specs?"
   
7. /docs/features/{FEATURE}_FEATURE.md
   "What are the detailed requirements for my feature?"

TIME: ~55 minutes total onboarding
```

### For Implementing a Feature (e.g., Course Management)

```
1. HANDOFF.md → Feature Status Table
   "Is this feature high priority?"
   
2. /docs/features/03-COURSE_MANAGEMENT_FEATURE.md
   "What are the requirements?"
   
3. RULE.md
   "What patterns do I follow?"
   
4. /docs/03-ARCHITECTURE_DATAFLOW.md
   "How does this feature fit in the system?"
   
5. /docs/01-CORE_SPECIFICATION.md → Business Rules section
   "What are the domain rules for courses?"
   
6. Start coding with:
   RULE.md as reference
   Feature doc for requirements
   API contracts from feature doc
```

### For Understanding a Specific Domain (e.g., Enrollment)

```
1. /docs/01-CORE_SPECIFICATION.md → "Enrollment Entity" section
   "What is the data model?"
   
2. /docs/features/04-ENROLLMENT_FEATURE.md
   "What are the business rules?"
   
3. /docs/03-ARCHITECTURE_DATAFLOW.md → "Data Flow" section
   "How does enrollment flow through the system?"
   
4. /docs/02-PLANNING_DOCUMENT.md → Risk Assessment
   "What could go wrong with enrollment?"
```

### For API Design Questions

```
1. /docs/features/{FEATURE}_FEATURE.md → "API Contracts" section
   "What endpoints should exist?"
   
2. /docs/03-ARCHITECTURE_DATAFLOW.md → "API Contract Examples"
   "What format should requests/responses be?"
   
3. RULE.md → "R4: Use DTOs for All API Contracts"
   "What patterns must I follow?"
```

### For Database/Entity Questions

```
1. /docs/01-CORE_SPECIFICATION.md → "Data Models" section
   "What is the entity structure?"
   
2. /docs/03-ARCHITECTURE_DATAFLOW.md → "Entity Relationship Model"
   "How do entities relate?"
   
3. RULE.md → "R3: Extend BaseEntity"
   "What patterns must I follow?"
```

### For Business Rule Questions

```
1. /docs/01-CORE_SPECIFICATION.md → "Business Rules & Constraints"
   "What are the rules?"
   
2. /docs/features/{FEATURE}_FEATURE.md → "Business Rules" section
   "Feature-specific rules?"
   
3. /docs/02-PLANNING_DOCUMENT.md → Risk Assessment
   "What are the edge cases?"
```

---

## 🔗 Cross-References

### HANDOFF.md Links To
- PROGRESS.md (detailed history)
- RULE.md (before coding)
- AGENTS.md (workflow)
- /docs/features/ (feature requirements)

### PROGRESS.md Links To
- HANDOFF.md (next steps)
- RULE.md (architectural decisions)
- /docs/ (detailed specs)
- HANDOFF-ARCHIVE/ (historical context)

### RULE.md Links To
- AGENTS.md (workflow to follow rules)
- /docs/01-CORE_SPECIFICATION.md (business context for rules)
- /docs/features/ (examples of rules in features)

### AGENTS.md Links To
- RULE.md (what rules to follow)
- /docs/features/{FEATURE}_FEATURE.md (example features)
- PROGRESS.md (track work completion)

### /docs/README.md Links To
- /docs/QUICK_REFERENCE.md (quick lookup)
- /docs/01-CORE_SPECIFICATION.md (system design)
- /docs/02-PLANNING_DOCUMENT.md (roadmap)
- /docs/03-ARCHITECTURE_DATAFLOW.md (technical design)
- /docs/features/INDEX.md (features - DELETED, use individual feature docs)
- /docs/features/{FEATURE}_FEATURE.md (each feature)

### /docs/features/{FEATURE}_FEATURE.md Links To
- /docs/01-CORE_SPECIFICATION.md (domain model)
- /docs/03-ARCHITECTURE_DATAFLOW.md (system flows)
- RULE.md (implementation patterns)
- AGENTS.md (development workflow)
- HANDOFF.md (feature status & priority)

### /docs/01-CORE_SPECIFICATION.md Links To
- /docs/02-PLANNING_DOCUMENT.md (roadmap)
- /docs/03-ARCHITECTURE_DATAFLOW.md (ER diagrams)
- /docs/features/ (feature-specific rules)

### /docs/02-PLANNING_DOCUMENT.md Links To
- /docs/01-CORE_SPECIFICATION.md (domain model)
- PROGRESS.md (current status)
- HANDOFF.md (next steps)
- /docs/features/ (feature details)

### /docs/03-ARCHITECTURE_DATAFLOW.md Links To
- /docs/01-CORE_SPECIFICATION.md (entity definitions)
- /docs/features/ (API contract examples)
- RULE.md (architectural patterns)

---

## 🎯 Quick Link Reference

| Need To Know | Go To | Then | Then |
|--------------|-------|------|------|
| What to build next? | HANDOFF.md | → PROGRESS.md | → Feature doc |
| How to code? | RULE.md | → AGENTS.md | → Feature doc |
| Domain rules? | /docs/01-CORE_SPECIFICATION.md | → Feature doc | → RULE.md |
| API design? | Feature doc (API Contracts) | → /docs/03-ARCHITECTURE_DATAFLOW.md | → RULE.md |
| System flow? | /docs/03-ARCHITECTURE_DATAFLOW.md | → Feature doc | → /docs/01-CORE_SPECIFICATION.md |
| Project status? | PROGRESS.md | → HANDOFF.md | → Feature docs |
| Roadmap? | /docs/02-PLANNING_DOCUMENT.md | → HANDOFF.md | → /docs/features/ |
| Environment setup? | CLAUDE.md | → RULE.md | → Start coding |

---

## 📋 File Purposes at a Glance

### Root Level Files (Project Governance)
| File | Purpose | For Whom | Read When |
|------|---------|----------|-----------|
| HANDOFF.md | Current phase priorities & blockers | Next developer | Starting new phase |
| PROGRESS.md | Project history & status | Team leads | Understanding context |
| RULE.md | Architectural rules & patterns | All developers | Before coding |
| AGENTS.md | Development workflow | AI agents & devs | Starting work |
| CLAUDE.md | Environment setup | Developers | Initial setup |
| NAVIGATION.md | This file - link map | Everyone | When lost |

### Docs Layer (Specifications)
| File | Purpose | For Whom | Read When |
|------|---------|----------|-----------|
| /docs/README.md | Navigation hub | Everyone | Starting documentation review |
| /docs/QUICK_REFERENCE.md | Quick lookups | Developers | During coding |
| /docs/01-CORE_SPECIFICATION.md | Domain model & rules | Architects & engineers | Understanding domain |
| /docs/02-PLANNING_DOCUMENT.md | Roadmap & timeline | PMs & tech leads | Planning phases |
| /docs/03-ARCHITECTURE_DATAFLOW.md | System design & flows | Architects | System design questions |

### Feature Layer (Requirements)
| File | Purpose | For Whom | Read When |
|------|---------|----------|-----------|
| /docs/features/{N}-{FEATURE}_FEATURE.md | Feature requirements | Engineers | Implementing feature |

### Archive Layer (History)
| File | Purpose | For Whom | Read When |
|------|---------|----------|-----------|
| HANDOFF-ARCHIVE/README.md | Archive strategy | Everyone | Understanding archival |
| HANDOFF-ARCHIVE/HANDOFF-{PHASE}-END.md | Phase snapshots | Team leads & historians | Learning phase outcomes |

---

## 🔄 Information Flow for AI Agents

### When Agent Needs To Implement Feature X

```
1. Check HANDOFF.md:Feature Status Table
   └─ Get feature priority and estimated time
   
2. Read /docs/features/0X-{FEATURE}_FEATURE.md
   ├─ User Stories (WHAT to build)
   ├─ API Endpoints (INTERFACE)
   ├─ Data Models (STRUCTURE)
   └─ Business Rules (HOW it works)
   
3. Consult RULE.md
   ├─ Module patterns (R1-R2)
   ├─ Entity patterns (R3)
   ├─ DTO patterns (R4-R5)
   ├─ Frontend patterns (R7-R9)
   └─ Naming conventions (R11-R12)
   
4. Check /docs/03-ARCHITECTURE_DATAFLOW.md
   ├─ Module dependencies
   ├─ Data flow diagrams
   └─ API examples
   
5. Reference /docs/01-CORE_SPECIFICATION.md
   ├─ Business rules details
   ├─ Entity relationships
   └─ Validation rules
   
6. Follow AGENTS.md workflow
   ├─ Analyze phase
   ├─ Plan (if needed)
   ├─ Implement
   ├─ Verify
   ├─ Review
   └─ Complete
```

---

## ✅ Validation Checklist for AI Agents

Before writing code, agent should reference:

- [ ] Read HANDOFF.md for feature priority and context
- [ ] Read feature doc for user stories and acceptance criteria
- [ ] Read RULE.md for architectural patterns
- [ ] Check /docs/03-ARCHITECTURE_DATAFLOW.md for system context
- [ ] Validate API contracts match feature doc
- [ ] Validate data models match /docs/01-CORE_SPECIFICATION.md
- [ ] Ensure error handling covers feature doc scenarios
- [ ] Follow AGENTS.md workflow phases
- [ ] Update PROGRESS.md when complete
- [ ] Update HANDOFF.md if blockers found

---

## 🚀 Usage Tips for AI Agents

1. **Always start with HANDOFF.md** - Gives immediate context
2. **Feature doc is your spec** - Everything needed to implement
3. **RULE.md is your guide** - Patterns to follow
4. **Cross-reference carefully** - Each file has See Also links
5. **Update PROGRESS.md** - After each significant work
6. **Note any blockers** - Add to PROGRESS.md and HANDOFF.md

---

## 📞 "Where Is X?" Quick Map

| Question | Answer |
|----------|--------|
| Where are API endpoints? | /docs/features/{FEATURE}_FEATURE.md → API Contracts |
| Where are entity models? | /docs/01-CORE_SPECIFICATION.md → Data Models |
| Where are business rules? | /docs/01-CORE_SPECIFICATION.md + /docs/features/{FEATURE}_FEATURE.md |
| Where is the roadmap? | /docs/02-PLANNING_DOCUMENT.md |
| Where are the patterns? | RULE.md (R1-R20) |
| Where is the workflow? | AGENTS.md (Analyze → Plan → Implement → Verify → Review → Complete) |
| Where is project status? | PROGRESS.md → Completed Work & Pending Work |
| Where are next steps? | HANDOFF.md → Immediate Next Steps |
| Where is the system design? | /docs/03-ARCHITECTURE_DATAFLOW.md |
| Where are the assumptions? | /docs/01-CORE_SPECIFICATION.md → System Assumptions |

---

**Last Updated:** June 12, 2026  
**Status:** Complete linking system for AI agent navigation

All files are now interconnected for seamless AI agent navigation! 🤖
