# Contributing to SmartShine

## Branch Workflow

We use a **main → develop → feature** branching strategy.

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only. Never push directly. |
| `develop` | Integration branch. All features merge here first. |
| `feature/*` | Individual feature work, branched from `develop`. |

### Step-by-step

**1. Always start from the latest develop:**
```bash
git checkout develop
git pull origin develop
```

**2. Create your feature branch:**
```bash
git checkout -b feature/your-feature-name
# Examples:
# feature/booking-form
# feature/payment-momo
# feature/worker-dashboard
```

**3. Work and commit often:**
```bash
git add .
git commit -m "feat: add booking form with time slot validation"
```

**4. Push your branch:**
```bash
git push -u origin feature/your-feature-name
```

**5. Open a Pull Request on GitHub:**
- Base: `develop`
- Compare: `feature/your-feature-name`
- Add a description of what you built
- Request at least 1 teammate review

**6. After approval, merge and delete the branch.**

---

## Commit Message Format

Use short, descriptive messages with a prefix:

```
feat: add OTP verification flow
fix: correct time slot conflict validation
style: update navbar mobile layout
refactor: extract payment logic to service layer
docs: update API endpoint table in README
```

---

## Task Assignments

| Teammate | Area |
|----------|------|
| **Croix** | Backend APIs, AI/recommendation module |
| **Sandrine** | Frontend React pages, UI/UX |
| **Billy** | MoMo payments, Africa's Talking SMS, WebSocket |

---

## Rules

- Never push directly to `main` or `develop`
- Always use feature branches
- Write descriptive commit messages
- Test your changes before pushing
- Never commit `.env` — use `.env.example` for new variables
- Run `python manage.py check` before pushing backend changes
- Run `npm run build` before pushing frontend changes to confirm no build errors
