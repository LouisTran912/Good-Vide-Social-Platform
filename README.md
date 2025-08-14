## NOTE: This project is currently being developed solely by Louis Tran.

# Good-Vibe Social Platform

A social app that deliberately **filters out negativity and criticism** so people only see **uplifting, supportive, and growth-oriented** content. Think: gratitude posts, small wins, encouragement, and wholesome updates—curated to boost mentality and mental wellness.

---

## 🌈 Idea in a Nutshell

Most platforms reward hot takes and outrage. **Good-Vibe** flips the script:

* **Positive-only feed**: We down-rank or block content with toxicity, attacks, or sarcasm-as-critique.
* **Language cues**: Prompts nudge users toward gratitude, kudos, progress updates, and kind requests.
* **Gentle feedback**: No public “call-outs.” If a post isn’t constructive, we *privately* coach the author with phrasing suggestions.
* **Community norms**: Clear, simple rules: *be kind, be specific, assume good intent.*

> Trade-off: This is not a place for debate or critique. It’s a **mental-wellness first** space.

---

## 🧠 How Positivity Filtering Works (brief)

1. **Pre-publish checks**: A lightweight sentiment/toxicity check plus simple rules (banned phrases, sarcasm markers, all-caps shouting).
2. **Rewrite nudges**: If borderline, we suggest alternative wording before posting.
3. **Post-publish guardrails**: Reports and automated rechecks down-rank or hide content that slips through.
4. **Signals**: Accounts with consistent positivity get small ranking boosts.

*(Implementation can start rule-based, then evolve to ML.)*

---

## 🧰 Tech Stack

**Front end**

* **React Native** (iOS/Android)
* **AWS Cognito** for auth (email/phone; minimal friction)
* **Figma** for rapid prototyping & handoff

**Back end**

* **Fastify** (TypeScript) — lean, fast Node.js server
* **PostgreSQL** — primary relational store
* **Amazon S3** — object storage for images/videos (cost-efficient, CDN-ready)
* **CloudFront** for media CDN, **SNS/SQS/Events** later for async jobs

**Why this stack?**
Minimal moving parts, low baseline cost, scalable paths later (WebSockets, queues, workers) without a full microservices tax.

---

## 🗺️ High-Level Architecture

```
[ React Native App ]
        |
   (Cognito JWT)
        |
   [ Fastify API ]  ---- presigned PUT --->  [ Amazon S3 ]
        |
   [ PostgreSQL ]
```

* Mobile uploads media via **S3 presigned URLs** (cheap + fast)
* API verifies **Cognito JWT** and writes metadata to **Postgres**
* Background job (optional) can re-scan media/text for positivity

---

## 🗂️ Simplified Data Model (minimal)

* **users**: id, cognito\_sub, display\_name, avatar\_url, created\_at
* **posts**: id, user\_id, text, media\_urls\[], positivity\_score, visibility, created\_at
* **reactions**: id, post\_id, user\_id, type (`kudos`, `hug`, `cheer`)
* **comments** (optional): positive-only; same checks as posts
* **reports**: id, target\_type, target\_id, reason, status

---

## 🔐 Security & Privacy (essentials)

* Verify **Cognito tokens** on every request.
* Use **row-level checks** (user owns what they modify).
* Store only what’s needed; keep media public-read via CloudFront or private with signed URLs.
* Log moderation events (auditability).

---

## NOTE: This is currently under sole development by Louis Tran. This is for references only and maybe used for commercial in the future.


