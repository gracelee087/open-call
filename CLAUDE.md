# ⛔ 최우선 — 대회 규칙 원문 (어기면 제출 무효)

> 출처: https://dev.to/challenges/sanity-2026-09-16 (사용자가 2026-09-20에 페이지 전문을 붙여넣음)
> **이 절은 요약하지 말고 원문 그대로 유지한다.** 판단이 갈리면 여기를 먼저 읽는다.
> 이 파일은 저장소를 리셋하더라도 **삭제하지 않는다.**

## Key Dates

- Contest start: **September 18, 2026**
- Submissions due: **October 04, 2026** — *"Contest entry period ends October 4, 2026 at 11:59 PM PDT."*
  (한국시간 **10월 5일(일) 15:59**)
- Winners announced: **October 22, 2026**
- Prizes: **$2,500 in prizes**

## Path One: Ship an Agent That Queries Real Content

> Build an agent, then point it at a Sanity Context MCP endpoint backed by a Knowledge Base. Any agent framework, hosted anywhere.
>
> Build anything that needs an answer it can't afford to get wrong. A board game companion that knows the errata contradicts the rulebook. A better interface to your favorite open-source docs. A eurorack planner that knows what actually fits in your case. An award-travel agent that untangles which transfer partner story is current. A car repair agent? A camera gear-head compendium? The sky is the limit.
>
> Point Sanity Context at a website, a set of files, or your own Sanity content, and it distills a navigable Knowledge Base your agent reads through MCP. Every entry stays linked to the source it came from. When two sources contradict each other, both claims surface side by side with their sources, and the decision you make carries across future builds. It all lives in your Sanity Dashboard.
>
> **The strongest submissions will show an agent that only works because the content was structured. If a keyword search would have gotten you the same answer, aim higher.**

**Judging Criteria (Path One)**
1. Meaningful use of Sanity Context and structured content
2. Technical implementation and code quality
3. Use of Knowledge Bases
4. Usability

## Path Two: Vibe-Code Something Strange

> Prompt your way to a working app. Any AI-native IDE, Next.js or Astro on the front, Sanity behind it.
>
> This one is judged on the build as much as the result. How deep did you get into Sanity's features? Did you customize the interface? Build a new component to turn videos into gifs? Create a workflow that kicks off an external API call? A rough app with an honest writeup beats a polished one with three sentences.
>
> Bonus points for reaching past the Studio. Two things we'd especially like to see prompted into existence:
>
> - **App SDK**: build a custom app on top of your content, with real-time data and your own interface, instead of another read-only frontend.
> - **Workflows**: model a process (content reviews, translations, and so on) as data next to the content, so an agent can move a draft forward and a person can approve it through the same transitions.
>
> Neither is required. A submission that uses one well will stand out from a pile of blog templates.

**Judging Criteria (Path Two)**
1. Quality and honesty of the build process writeup
2. Functionality of the finished app
3. Thoughtfulness of the schema behind it
4. Creativity and originality

## How To Participate (필수 요건 — 하나라도 빠지면 불완전 제출)

> Publish a post on DEV using the prompt submission templates above and be sure to include the required challenge tag **#sanitychallenge**. You may submit to both paths, but you must create a separate post for each.
>
> If your app requires logging in, please provide testing credentials in your submission and/or instructions on how to best test your application for judges.
>
> **Every submission needs to include your Sanity project ID or a link to a public dataset URL** so the Sanity team can see how you modeled and used your structured content. **Submissions without it may be considered incomplete.**
>
> Optional but encouraged: embed your agent session. Upload a transcript from Claude Code, Gemini CLI, Codex, GitHub Copilot CLI, or Pi, curate or slice the parts worth showing, and drop it straight into your post via the Agent Sessions uploader. **Uploads are unlisted by default, so use the Make Public button** or judges won't be able to open your session — **and check your transcript for keys and sensitive data before publishing.**

## FAQ — 구속력 있는 조항

- **양쪽 Path 제출 가능**하나 **글은 따로** 써야 한다. **같은 Path에 두 번 제출은 불가** (one submission per path).
- 팀은 최대 4명. 협업하면 **DEV 핸들을 제출 글에 적어야** 배지가 나온다. 팀당 글 1개. 상금 분배는 DEV가 하지 않는다.
- **18세 이상**만 참가.
- **언어**: *"Non-english submissions are eligible for a completion badge but not eligible for prizes."*
  → **제출 글은 반드시 영어로 쓴다.** (영어 실력 자체는 심사하지 않는다고 명시)
- **AI 사용 허용**: *"Use of AI is allowed as long as all other rules are followed."*
- **표절**: 오픈소스 차용은 허용되나 변경이 충분히 유의미해야 하고, *"Any non-generic, non-trivial usage of prior work, including open source code must be credited in your submission."*
- 동점이면 DEV 글의 **긍정 반응 수**가 많은 쪽이 이긴다.

## 이 프로젝트의 확정 사항

- **Path One 주력.** Path Two는 착수하지 않는다 (남은 기간에 두 개는 불가능).
- 제출 글 템플릿 헤딩 6개: `## What I Built` · `## Demo` · `## Code` · `## How I Used Sanity` · `## Sanity Project Details` · `## Agent Session`
- **Sanity project ID: `dmar00cc`** · dataset **`production`** (public) · 이름 "Open Call" · 조직 "S. Lee"
  - 공개 조회 URL (심사위원이 직접 쓸 수 있음): `https://dmar00cc.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="event"]`
  - 관리: https://www.sanity.io/manage/project/dmar00cc
  - **제출 글에 반드시 들어가야 한다.** 없으면 incomplete 처리된다.
  - (구 프로젝트 `v5xlf3ku` "FutureGuide"는 2026-09-20 삭제 확인됨 — API 404)
- **조직 ID: `oa9zzr60i`** ("S. Lee") — Context MCP 엔드포인트 주소에 들어간다:
  `https://api.sanity.io/v1/context/organizations/oa9zzr60i/mcp/<ENDPOINT_NAME>`
- ⚠️ **플랜: Growth Trial, 2026-09-20 기준 30일 남음 (≈10/20 만료).**
  심사 기간이 10/22까지라 **심사 도중 플랜이 내려갈 수 있다.** 작업 3에서 확인할 것:
  Free로 내려가도 ① public 데이터셋 조회가 되는가 ② Knowledge Base가 살아 있는가.
  KB가 죽으면 심사 기준 ③ 증거가 통째로 사라진다 → 캡처와 저장된 답변으로 대비한다.
- 저장소는 **제출 전 반드시 public**으로 전환해야 한다. private면 `## Code`가 죽은 링크가 되고 기준 ②를 심사할 수 없다.
- **데모 영상** (2026-09-21 원문 대조로 정함). 프로젝트: `Desktop\open-call-demo` (HyperFrames, 저장소 밖).
  - 내레이션에서 **"Sanity Context MCP"와 Knowledge Base를 이름으로 말한다.** Path One 원문이
    *"point it at a Sanity Context MCP endpoint backed by a Knowledge Base"*이고 기준 ①이 "Sanity Context"다.
  - Knowledge Base가 **무엇으로 만들어졌는지**(웹페이지 + 자체 데이터셋) 보여 준다 — 기준 ③.
  - 인용·수치는 **원문 그대로**: hackathon.com은 *"There is no upcoming hackathons found in 'Europe'"* ("upcoming"을 빼지 않는다).
    Junction을 "biggest"라 하지 않는다(자칭 표현) — 제출 글의 사실(2,000 builders, €100,000)로 말한다.
  - 없는 UI를 만들지 않는다. 화면은 실제 스크린샷·캡처만.
  - 제출 글에 **HyperFrames로 만든 영상임을 표기**한다 (표절 조항: prior work는 credit).

---

# 프로젝트 작업 규칙

- **`HANDOFF.md`에 자동으로 기록하지 않는다.** 사용자가 "이건 넣어"라고 말한 것만 넣는다.
  조사 결과·요약·분석은 기본적으로 **채팅으로만** 답한다. (전역 규칙의 HANDOFF 자동 기록 조항은 이 프로젝트에서 무효)
- 전역 규칙(`~/.claude/CLAUDE.md`)이 계속 적용된다: **계획 먼저, 승인 전엔 건드리지 않는다.**
- 규정·기준이 걸린 판단은 **위 원문 절을 먼저 읽고** 답한다. 기억이나 요약으로 답하지 않는다.
