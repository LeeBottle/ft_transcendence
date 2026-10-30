_This project has been created as part of the 42 curriculum by byeolee, hjang, sanghul2._

# ft_transcendence

---

## 1. Description

### 1.1 Project Overview
ft_transcendence is a real-time 3D multiplayer web platform that reimagines the classic dice board game Yacht Dice with modern web technologies.

Users can enjoy dynamic 3D dice roll animations in the browser via Three.js, compete in real-time multiplayer matches with up to 4 concurrent players via WebSockets (Socket.io), and challenge an intelligent AI opponent driven by mathematical expected value calculations. Furthermore, the platform integrates a secure JWT and bcrypt password encryption authentication pipeline, an interactive slider puzzle captcha for bot prevention, match history tracking and global leaderboards, a gamified title unlock and equipping system, and a Windows 98 retro-themed collaborative whiteboard.

---

### 1.2 Team Information

The project was developed by a team of three members. Each member took on a primary leadership responsibility as Product Owner (PO), Project Manager (PM), or Technical Lead, while all members actively contributed as Full-Stack Developers across the frontend and backend.

#### 1) sanghul2
- Assigned Role: PO (Product Owner) / Full-Stack Developer
- Responsibilities:
  - Product Vision & System Scoping: Defined overall product vision, user journey, system boundaries, and initial architectural scaffolding.
  - Authentication & Security UX (feature-auth domain):
    - Designed and implemented the secure NestJS Passport and JWT authentication/authorization pipeline.
    - Implemented bcryptjs one-way salted password hashing and validation DTOs.
    - Created an interactive slider puzzle captcha (PuzzleCaptcha.tsx) for bot protection and enhanced user onboarding.
  - User Profile & Gamification (Titles) System:
    - Designed database models and UI workflows for unlocking and equipping titles (TitlesPage.tsx, TitleUnlockModal.tsx, ProfilePage.tsx).
  - Retro Collaborative Whiteboard:
    - Built the Windows 98-themed real-time collaborative canvas (Win98Canvas.tsx, DrawingPage.tsx, drawing.gateway.ts) including socket gateway and client canvas.
  - Documentation Lead:
    - Authored over 20 standard technical specification documents in doc/ covering APIs, system architecture, game logic, websockets, and database schemas.

#### 2) byeolee
- Assigned Role: PM (Project Manager / Scrum Master) / Full-Stack Game Architect & Developer
- Responsibilities:
  - Milestone Planning & Schedule Tracking: Formulated sprint cycles, defined project milestones, managed GitHub issues and Kanban board, and eliminated development blockers.
  - Real-Time Game Domain (Yachat domain):
    - Architected and implemented the core Yacht Dice real-time game engine.
    - Built the NestJS WebSocket gateway (yacht.gateway.ts) managing room state machines, turn progression, and action synchronization.
    - Developed the scoring engine (yacht.score.ts, yachtScore.ts) supporting all 12 official categories and upper bonus (35 points) calculation.
  - 3D Graphics & Interactive UI:
    - Implemented 3D dice rendering, physical tumbling animations, and deterministic settlement via Three.js and React Three Fiber (Dice3DCanvas.tsx).
    - Built the responsive scoreboard UI (YachtBoard.tsx) and lobby/room management pages (LobbyPage.tsx, GameMakePage.tsx, GameRoomPage.tsx).
  - Intelligent AI Engine (yacht.ai.ts):
    - Engineered the AI opponent system supporting three difficulty levels (NOVICE, INTERMEDIATE, MASTER) using probabilistic expected value calculations.

#### 3) hjang
- Assigned Role: Tech Lead (Technical Lead / Architect) / Database & DevOps Lead / Full-Stack Developer
- Responsibilities:
  - Initial PoC & Architectural Baseline (hjang_fullstack lead):
    - Developed the initial full-stack proof-of-concept verifying Docker Desktop, PostgreSQL, NestJS, and React communication pipelines.
    - Established modular system architecture, directory layouts, and coding conventions.
  - Database Modernization & Optimization:
    - Upgraded the database engine from PostgreSQL 15 to the latest PostgreSQL 16 (postgres:16-alpine).
    - Configured Korean Standard Timezone (TZ=Asia/Seoul, PGTZ=Asia/Seoul) and ensured query stability.
    - Unified multi-branch database schemas into a single, cohesive Prisma ORM 5 schema (schema.prisma).
  - Infrastructure & DevOps Orchestration:
    - Structured Nginx reverse proxy configuration (port 8080) and enabled one-command container orchestration (docker compose up --build).
    - Integrated Cloudflare Tunnel (cloudflared) for seamless remote testing and peer evaluation.
    - Standardized line-ending (CRLF/LF) handling and optimized Docker build caching.
  - Match History & Global Leaderboard:
    - Designed MatchHistory and MatchParticipant persistence models and built ranking/statistics APIs and UI components (RankingPage.tsx, MatchHistoryPage.tsx).

---

### 1.3 Project Management

#### Work Organization
- Domain-Driven Division of Labor:
  - Work was split into focused domains: authentication/security/scoping (sanghul2), game engine/3D graphics/sockets (byeolee), and infrastructure/database/PoC (hjang) to eliminate early bottlenecks.
- Staged Merge Strategy:
  - Following independent branch validation, the team executed a structured step-by-step merge guideline (merge.txt) covering database engine upgrade, schema consolidation, backend module linking, and frontend route unification.

#### Management Tools
- GitHub:
  - GitHub Issues: Tracked feature requirements, bug reports, and refactoring tasks.
  - GitHub Projects / Milestones: PM (byeolee) established sprint milestones.
  - GitHub Pull Requests & Code Review: Code updates required at least one peer review before merging into the main branch.

#### Communication Channels
- GitHub Communication (Issues, PR Comments, Discussions):
  - Documented technical decisions, architecture proposals, and bug root causes directly within issue and PR threads for permanent traceability.
- Slack:
  - Handled asynchronous messaging, daily standups, GitHub webhook activity notifications, and real-time screen-sharing scrum meetings.

---

### 1.4 Directory Structure & File Architecture

The complete directory tree of the project is organized as follows:

```text
merge/
├── .env.example                  # Environment variable template (DB, JWT, Ports, etc.)
├── .env                          # Local environment variable file (Ignored by Git)
├── docker-compose.yml            # Container orchestration for 5 services (DB, Back, Front, Nginx, Tunnel)
├── Makefile                      # Make targets for up, down, re, and clean commands
├── start.sh                      # Container bootstrap helper shell script
├── nginx/
│   └── default.conf              # Nginx reverse proxy and routing configuration (Port 80 -> 8080)
│
├── backend/                      # NestJS backend application
│   ├── Dockerfile                # Backend container build instructions
│   ├── package.json              # Backend dependencies (NestJS 10, Prisma 5, Socket.io, bcryptjs)
│   ├── tsconfig.json             # TypeScript compiler configuration
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma ORM data modeling schema
│   │   └── seed.ts               # Test dummy user seeding script (users a, b, c, d)
│   └── src/
│       ├── main.ts               # Application entry point (CORS, global pipes, port binding)
│       ├── app.module.ts         # Root module aggregating AuthModule, YachtModule, PrismaModule
│       ├── app.controller.ts     # Health check endpoint
│       ├── drawing.gateway.ts    # Real-time Win98 whiteboard WebSocket Gateway
│       ├── prisma/
│       │   ├── prisma.module.ts  # Global PrismaService provider module
│       │   └── prisma.service.ts # PrismaClient lifecycle service
│       ├── auth/                 # User authentication and titles domain
│       │   ├── auth.module.ts    # JwtModule and Passport dependency injection
│       │   ├── auth.controller.ts# REST endpoints for signup, login, titles, and profile updates
│       │   ├── auth.service.ts   # Business logic (Password hashing, JWT issuance, title validation)
│       │   └── dto/              # Request payload validation DTOs
│       │       ├── signup.dto.ts
│       │       ├── login.dto.ts
│       │       ├── claim-title.dto.ts
│       │       └── update-title.dto.ts
│       └── Yacht/                # Core Yacht Dice game domain
│           ├── yacht.module.ts   # Yacht game module definition
│           ├── yacht.controller.ts# REST endpoints for room CRUD, readiness, in-game actions, and stats
│           ├── yacht.service.ts  # Room state machine, turn orchestration, and match persistence
│           ├── yacht.gateway.ts  # Real-time in-game synchronization WebSocket Gateway
│           ├── yacht.score.ts    # Pure scoring functions for 12 categories and upper bonus
│           └── yacht.ai.ts       # 3-level AI engine (NOVICE, INTERMEDIATE, MASTER)
│
├── frontend/                     # React 18 + Vite frontend application
│   ├── Dockerfile                # Frontend container build instructions
│   ├── package.json              # Frontend dependencies (React 18, Vite, Three.js, R3F, Tailwind)
│   ├── vite.config.ts            # Vite bundler configuration (Port 5173, host exposed)
│   ├── tailwind.config.js        # Tailwind CSS theme and styling configuration
│   └── src/
│       ├── main.tsx              # DOM rendering entry point (React DOM)
│       ├── App.tsx               # Client-side router and navigation guards
│       ├── index.css             # Tailwind base styles and retro styling rules
│       ├── context/
│       │   └── ThemeContext.tsx  # Application theme state context
│       ├── components/           # Reusable UI components
│       │   ├── Navbar.tsx        # Top navigation bar (Session state, equipped title)
│       │   ├── PuzzleCaptcha.tsx # Interactive jigsaw puzzle slider captcha
│       │   ├── TitleUnlockModal.tsx # Celebration popup modal for newly unlocked titles
│       │   └── Win98Canvas.tsx   # Windows 98-styled collaborative drawing canvas
│       ├── pages/                # Route view pages
│       │   ├── HomePage.tsx      # Main landing dashboard
│       │   ├── LoginPage.tsx     # Login view with integrated slider captcha
│       │   ├── SignupPage.tsx    # User registration view
│       │   ├── ProfilePage.tsx   # User profile and account management view
│       │   ├── TitlesPage.tsx    # Title compendium and achievement unlocking view
│       │   ├── DrawingPage.tsx   # Win98 collaborative whiteboard view
│       │   ├── MatchHistoryPage.tsx# Player match history log view
│       │   └── RankingPage.tsx   # Global leaderboard ranking view
│       └── Yacht/                # Yacht Dice game client components
│           ├── Dice3DCanvas.tsx  # Three.js 3D dice physics and rendering canvas
│           ├── YachtBoard.tsx    # 12-category interactive scoreboard table
│           ├── LobbyPage.tsx     # Game room lobby main view
│           ├── LobbyRoomChoice.tsx# Room selection and filtering component
│           ├── GameMakePage.tsx  # Room creation modal (Privacy, slots, AI levels)
│           ├── GameRoomPage.tsx  # Waiting room and active game view
│           └── yachtScore.ts     # Client-side instant score preview helper
│
└── doc/                          # Technical specification documents
    ├── API_SPECIFICATION.md      # REST API documentation
    ├── ARCHITECTURE.md           # System architecture diagrams and guidelines
    ├── DATABASE_SCHEMA.md        # Relational schema and index design
    ├── GAME_LOGIC_SPECIFICATION.md# Official Yacht Dice calculation rules
    ├── WEBSOCKET_SPECIFICATION.md# WebSocket event payload protocols
    ├── TECH_STACK_BACKEND.md     # Backend technology selection rationale
    ├── TECH_STACK_FRONTEND.md    # Frontend technology selection rationale
    └── TECH_STACK_DEVOPS.md      # DevOps and infrastructure configuration report
```

---

### 1.5 Technical Stack

#### Frontend
- React 18 & TypeScript:
  - Provides modular component reusability and end-to-end type safety for complex game state machines.
- Vite:
  - Ensures ultra-fast Hot Module Replacement (HMR) and optimized production bundles.
- Tailwind CSS:
  - Enables utility-first styling for responsive layouts, modal overlays, and nostalgic retro UI themes.
- Three.js & @react-three/fiber:
  - Powers in-browser 3D dice rendering, camera frustum controls, and quaternion rotational physics.
- Socket.io Client (socket.io-client):
  - Manages bidirectional, low-latency WebSocket communication for the game lobby, in-game turns, and whiteboard strokes.

#### Backend
- NestJS 10 / 11 Framework:
  - Structures server logic into modular domains (AuthModule, YachtModule, PrismaModule) for maintainability and scalability.
- WebSocket Gateway (@nestjs/websockets, Socket.io):
  - Handles room-based broadcasting, turn timer events, dice roll updates, and whiteboard streaming.
- Passport & JWT (@nestjs/jwt, @nestjs/passport):
  - Enforces stateless, token-based authentication and route authorization guards.
- Bcrypt (bcryptjs):
  - Protects user passwords through one-way salted hashing.

#### Database & ORM
- PostgreSQL 16 (postgres:16-alpine):
  - Tech Lead (hjang) introduced the latest PostgreSQL 16 engine for enhanced transaction durability and query performance, synchronized to Asia/Seoul timezone.
- Prisma ORM 5:
  - Generates type-safe database queries, automates relational migrations, and simplifies entity relationship modeling.

#### Infrastructure & DevOps
- Docker & Docker Compose:
  - Orchestrates postgres, backend, frontend, nginx, and tunnel containers via a single command.
- Nginx (Reverse Proxy, Port 8080):
  - Acts as the primary entrance for client traffic, serving frontend assets and reverse-proxying REST endpoints (/api) and WebSocket handshakes (/socket.io).
- Cloudflare Tunnel (cloudflared):
  - Enables secure external ingress for remote peer evaluation without requiring local router port forwarding.

---

### 1.6 Database Schema

#### 1) Entity Relationships (ERD Summary)
```text
[User] 1 ──────── 0..* [MatchParticipant] * ──────── 1 [MatchHistory]
  │
  └─────── 0..* (Host/Participant in Room)
```

#### 2) Entities & Attributes

##### User (User Entity)
- id (String, UUID, PK): Unique user identifier
- email (String, Unique): Login email address
- password (String): Bcrypt-hashed password
- nickname (String, Unique): In-game display name
- avatar (String?, Default: "🤖"): User avatar icon
- title (String?, Default: "Novice Slider"): Primary unlocked title
- equippedTitle (String?, Default: "Novice Slider"): Currently displayed title
- unlockedTitles (String?): Comma-separated list of all unlocked titles
- isTitleSeen (Boolean, Default: false): Flag indicating if newly unlocked title popup has been seen
- createdAt / updatedAt (DateTime): Creation and modification timestamps

##### Room (Game Room & Slot Entity)
- id (String, UUID, PK): Game room identifier
- title (String): Room display title
- hostNickname (String): Room owner nickname
- password (String?): Optional password for private rooms
- isPublic (Boolean, Default: true): Public/Private room toggle
- currentPlayers (Int, Default: 1): Active player count
- maxPlayers (Int, Default: 2): Maximum capacity (2 to 4 players)
- isGameStart (Boolean, Default: false): Match active indicator
- slot1Ready ~ slot4Ready (Boolean): Slot ready states
- slot2Open ~ slot4Open (Boolean): Slot open/closed states
- slot2IsAi ~ slot4IsAi (Boolean): Slot AI occupancy flag
- slot2AiLevel ~ slot4AiLevel (String, Default: "NOVICE"): AI difficulty (NOVICE | INTERMEDIATE | MASTER)
- slot2Nick ~ slot4Nick (String?): Occupant player nickname

##### MatchHistory (Match Summary Entity)
- id (String, UUID, PK): Unique match record identifier
- roomId (String): Associated room identifier
- roomTitle (String): Room title at match time
- gameType (String, Default: "MULTI"): Match type (MULTI | SINGLE_AI)
- totalRounds (Int, Default: 12): Total rounds played
- winnerNickname (String): Winner nickname
- winnerScore (Int): Winner final score
- playedAt (DateTime, Default: now()): Match completion timestamp

##### MatchParticipant (Participant Result Entity)
- id (String, UUID, PK): Record identifier
- matchId (String, FK ➔ MatchHistory.id): Match reference key
- nickname (String): Participant nickname
- isAi (Boolean): Participant AI flag
- rank (Int): Final placement (1st, 2nd, etc.)
- totalScore (Int): Final total score

---

### 1.7 Features List & Deep Dive

The following table summarizes all implemented features. Detailed rules, technologies, and code structures are documented in the subsequent sub-sections.

| Category | Feature Name | Owner | Summary Description |
| :--- | :--- | :--- | :--- |
| Auth/Security | Signup & Login | sanghul2 | JWT token issuance, bcrypt password hashing, duplicate validation |
| Auth/Security | Slider Puzzle Captcha | sanghul2 | Canvas-based jigsaw puzzle slider for interactive bot prevention |
| Profile/Gamification | Profile & Titles | sanghul2 | Avatar customization, title unlocking conditions, celebration modals |
| Collaboration | Win98 Shared Whiteboard | sanghul2 | Retro Windows 98 style whiteboard, real-time multi-client brush synchronization |
| Game Core | 3D Dice Rolling | byeolee | Three.js/@react-three/fiber 3D dice physics, tumbling and stop determination |
| Game Core | 12 Category Score Engine | byeolee | Official Yacht scoring calculation and 35-point upper bonus logic |
| Game Room | Lobby & Room Management | byeolee | Public/private rooms, 2-4 slots, password protection, readiness synchronization |
| Game AI | Expected Value AI Engine | byeolee | NOVICE, INTERMEDIATE, MASTER AI opponent with probabilistic decision-making |
| Infrastructure | PostgreSQL 16 Upgrade | hjang | Modernized DB engine to 16-alpine, Asia/Seoul timezone synchronization |
| Infrastructure | Docker & Nginx Ingress | hjang | Single-command compose orchestration, reverse proxy routing, tunnel support |
| Stats/Records | Match History & Ranking | hjang | Match persistence, win rate/average score calculation, global leaderboard |

---

#### 1.7.1 Authentication & Security
- Mechanism & Operation:
  - During registration, email format, minimum password length, and nickname uniqueness are validated by AuthService.
  - Passwords are encrypted using bcryptjs with 10 salt rounds before storage in the PostgreSQL User table.
  - Upon successful login, the server issues a stateless JWT containing user credentials (sub: user.id, email, nickname). Clients store the token in localStorage and attach it as a Bearer token in the Authorization header.
- Technologies:
  - NestJS, Passport, @nestjs/jwt, bcryptjs, class-validator
- Code Structure:
  - backend/src/auth/auth.controller.ts: post signup, post login, get me
  - backend/src/auth/auth.service.ts: signup(), login(), validateUser()
  - backend/src/auth/dto/signup.dto.ts, login.dto.ts
  - frontend/src/pages/SignupPage.tsx, LoginPage.tsx

#### 1.7.2 Interactive Slider Puzzle Captcha
- Rules & Operation:
  - An interactive captcha operates during authentication to block automated scripts while providing an engaging user experience.
  - Using the HTML5 Canvas 2D API, a jigsaw puzzle piece cutout (concave) is dynamically carved out from the background image at a random coordinate (x: 100-300px, y: 30-150px) using cubic Bezier curves (bezierCurveTo).
  - Simultaneously, the matching puzzle piece (convex) is rendered onto a separate movable canvas layer.
  - The user drags a slider bar via mouse or touch events to slide the puzzle piece into the cutout.
  - Verification Rule: When the slider is released, the horizontal position is evaluated. The captcha passes only if the offset from the target x-coordinate is within 5 pixels (Math.abs(sliderX - targetX) <= 5).
  - Completing the captcha triggers unlocking of the "Novice Slider" title.
- Technologies:
  - React, HTML5 Canvas 2D Context, CSS Drag Event Handlers
- Code Structure:
  - frontend/src/components/PuzzleCaptcha.tsx
  - frontend/src/pages/LoginPage.tsx

#### 1.7.3 Profile & Title Gamification System
- Rules & System Architecture:
  - Title progression is managed through three distinct states:
    - Primary title (`title`): Initial title granted upon account registration (Default: '초급 슬라이더')
    - Currently equipped active title (`equippedTitle`): Displayed in real time on the navbar, user profile, and leaderboard rankings
    - Comma-delimited list of unlocked titles (`unlockedTitles`): Stores all earned achievement titles (comma-separated string)
  - Full Title Roster Implemented in Project (7 Titles):
    - Novice Slider (`SLIDER_BEGINNER`): Granted upon account creation and initial puzzle captcha verification
    - Yacht Master (`YACHT_MASTER`): Unlocked upon scoring the highest Yacht combination (5 matching dice, 50 pts) in a match
    - First Victory (`FIRST_VICTORY`): Unlocked upon winning 1st place in a multiplayer match (2+ players) or opponent forfeit
    - Win Streak (`WIN_STREAK`): Unlocked upon securing a 3-match win streak (1st place in 3 consecutive matches)
    - AI Breaker (`AI_BREAKER`): Unlocked upon winning 1st place in a match containing AI opponents
    - Speed Runner (`SPEED_RUNNER`): Unlocked in real time upon solving the login slider puzzle captcha within 3 seconds
    - Street Artist (`PICASSO`): Unlocked upon reaching 20+ drawing strokes on the Windows 98 collaborative whiteboard
  - Unlocking & Equipping Interactions:
    - Unlocking a new title sets `isTitleSeen` to `false`, displaying a celebration confetti canvas modal (`TitleUnlockModal.tsx`) on subsequent login with an immediate equip option
    - The title compendium page (`TitlesPage.tsx`) presents all title requirements, unlock status, and allows users to equip or unequip owned titles at any time
- Technologies:
  - Prisma Client transactions, Tailwind CSS modal components, HTML5 Canvas Confetti animation
- Code Structure:
  - backend/src/auth/auth.service.ts: claimTitle(), updateTitle(), updateProfile(), getMe()
  - backend/src/auth/dto/claim-title.dto.ts, update-title.dto.ts
  - backend/src/Yacht/yacht.service.ts: grantTitleToUser(), archiveGameMatch(), handlePlayerDisconnectOrForfeit()
  - frontend/src/pages/TitlesPage.tsx: Full title compendium (ALL_TITLES) and real-time equip UI
  - frontend/src/components/TitleUnlockModal.tsx: Celebration popup modal for unlocked titles
  - frontend/src/pages/LoginPage.tsx: Speed Runner unlock trigger
  - frontend/src/components/Win98Canvas.tsx: Street Artist unlock trigger

#### 1.7.4 Windows 98-Themed Collaborative Whiteboard
- Rules & Synchronization:
  - Faithfully recreates the classic Windows 98 Paint canvas for real-time collaborative drawing.
  - Users select tools (pencil, eraser), palette colors, and line widths (1 to 30px).
  - Mouse movements emit coordinate tuples (x0, y0, x1, y1) with color and stroke width via the drawing:stroke event.
  - The server (DrawingGateway) validates boundaries (0-800 x 0-450) and broadcasts strokes to all other connected peers.
  - A server-side ring buffer retains the most recent 5,000 strokes in memory, dispatching them to newly joined clients upon connection (drawing:init).
  - Canvas clearing (drawing:clear) synchronizes canvas resets across all participants.
- Technologies:
  - NestJS WebSocketGateway, Socket.io Server/Client, HTML5 Canvas
- Code Structure:
  - backend/src/drawing.gateway.ts
  - frontend/src/components/Win98Canvas.tsx
  - frontend/src/pages/DrawingPage.tsx

#### 1.7.5 Three.js 3D Dice Graphics & Physics
- Synchronization & Rendering:
  - Renders 5 dice as 3D meshes using WebGL via Three.js and React Three Fiber (@react-three/fiber).
  - Clicking the roll button imparts randomized angular velocity vectors and 3-axis tumbling rotations.
  - Uses deterministic client-server synchronization to eliminate state divergence:
    - The backend calculates and commits the roll outcomes (5 integers between 1 and 6) and transmits the payload.
    - The client-side 3D engine computes target quaternions so the designated face lands pointing toward the camera, smoothly interpolating (Slerp) to the final orientation.
  - Users click dice to toggle their hold/keep status, visually raising or lowering the dice on the canvas.
- Technologies:
  - Three.js, @react-three/fiber, @react-three/drei
- Code Structure:
  - frontend/src/Yacht/Dice3DCanvas.tsx

#### 1.7.6 Yacht Dice 12-Category Scoring Engine
- Game Rules & Scoring Formulas:
  - A full match spans 12 rounds. Each player must fill one category per round; recorded categories cannot be modified.
  - Turn Flow: Players receive an initial roll followed by up to 2 rerolls (3 rolls total per turn). Held dice are retained while unheld dice are rerolled.
  - 12 Official Categories:
    1. Aces (Ones): Sum of dice showing 1 (Max 5)
    2. Twos: Sum of dice showing 2 (Max 10)
    3. Threes: Sum of dice showing 3 (Max 15)
    4. Fours: Sum of dice showing 4 (Max 20)
    5. Fives: Sum of dice showing 5 (Max 25)
    6. Sixes: Sum of dice showing 6 (Max 30)
    - Upper Bonus: If the upper section (Aces through Sixes) totals 63 or more, a 35-point bonus is awarded.
    7. Choice: Sum of all 5 dice (Max 30)
    8. 4 of a Kind: At least 4 matching dice; scores sum of all 5 dice
    9. Full House: 3 matching dice of one value and 2 of another; scores sum of all 5 dice
    10. Small Straight: 4 sequential dice (1-2-3-4, 2-3-4-5, 3-4-5-6); fixed 15 points
    11. Large Straight: 5 sequential dice (1-2-3-4-5, 2-3-4-5-6); fixed 30 points
    12. Yacht: All 5 dice matching; fixed 50 points
- Technologies:
  - Pure TypeScript calculation modules
- Code Structure:
  - backend/src/Yacht/yacht.score.ts: calculateScore(), isValidScore()
  - frontend/src/Yacht/yachtScore.ts: Client-side instant preview helper
  - frontend/src/Yacht/YachtBoard.tsx: Interactive score sheet UI

#### 1.7.7 Game Room & Multiplayer State Machine
- Slot & Room Management:
  - Room creators configure room title, visibility (public/private), password protection, and slot capacity (2 to 4 slots) with optional AI players and difficulties.
  - The host occupies slot 1. Slots 2 through 4 can be opened for human players or assigned to AI bots.
  - Ready Enforcement: All non-host participants must set their status to Ready before the host can trigger game start.
  - Turn State Machine:
    - Tracks currentTurnPlayer index.
    - Monitors round count (1 to 12) and remaining rolls (rollsLeft: defaults to 3).
    - Advances turns upon scoring and cycles through rounds until round 12 concludes.
    - Triggers match persistence and winner resolution upon match end.
- Technologies:
  - NestJS WebSocketGateway, Room-scoped Socket.io broadcasting, REST API
- Code Structure:
  - backend/src/Yacht/yacht.controller.ts, yacht.service.ts, yacht.gateway.ts
  - frontend/src/Yacht/LobbyPage.tsx, GameMakePage.tsx, GameRoomPage.tsx

#### 1.7.8 3-Level Intelligent AI Opponent Engine
- Difficulty Levels & Algorithms:
  - NOVICE:
    - Follows simple heuristics (keeping majority dice) with a deliberate degree of randomness.
    - Selects the lowest-scoring valid category or sacrifices lower-value categories when blanking.
  - INTERMEDIATE:
    - Actively tracks progress toward the upper bonus (63 points) by prioritizing high-value upper categories.
    - Detects straight sequences (e.g., 3 consecutive values) and retains them during rerolls.
  - MASTER:
    - Computes mathematical Expected Values (EV) across all 7,776 possible dice roll permutations (6^5).
    - Weighs potential score distributions against remaining open categories and reroll opportunities.
    - Factors in weighted probabilities for attaining the +35 upper bonus, making optimal keep and category selection choices.
- Technologies:
  - Pure TypeScript heuristic and probability expectation engine
- Code Structure:
  - backend/src/Yacht/yacht.ai.ts: YachtAiEngine class (decideKeep(), decideCategory())

#### 1.7.9 Match History & Global Leaderboard
- Persistence & Analytics:
  - At match conclusion, YachtService.finishGame() runs a Prisma transaction creating a MatchHistory record and snapshots all player placements in MatchParticipant.
  - Individual profile views query total matches, wins, win rates (%), and average scores in real time.
  - The global leaderboard aggregates all participants, ranking players by total wins and top scores with display badges and active titles.
- Technologies:
  - PostgreSQL 16 aggregation queries, Prisma ORM
- Code Structure:
  - backend/src/Yacht/yacht.service.ts: getUserMatchStats(), getLeaderboardRanking()
  - frontend/src/pages/MatchHistoryPage.tsx, RankingPage.tsx

---

### 1.8 Modules & Score Calculation

The project implements modules totaling 23 points, significantly exceeding the mandatory 14-point threshold.

| Category | Module Type | Module Name | Pts | Implementation & Selection Rationale | Owner |
| :--- | :--- | :--- | :---: | :--- | :--- |
| Web | Major | Frontend & Backend Frameworks | 2 | React 18 (Vite) frontend and NestJS 10/11 backend for clean separation and modularity | hjang, byeolee, sanghul2 |
| Web | Major | Real-Time Features via WebSockets | 2 | Socket.io game turn orchestration and whiteboard stroke broadcasting | byeolee, sanghul2 |
| Web | Major | User Interaction System | 2 | Lobby room interactions, profile inspect, online presence, and room joins | sanghul2, byeolee |
| Web | Minor | Database ORM | 1 | Prisma ORM 5 for full type safety, schema migrations, and relational modeling | hjang |
| Web | Minor | Real-Time Collaborative Features | 1 | Windows 98-themed collaborative canvas for live multi-user whiteboard sharing | sanghul2 |
| Gaming/UX | Major | Complete Web-Based Game | 2 | Authentic Yacht Dice game with 12 official categories and full 12-round matches | byeolee |
| Gaming/UX | Major | Remote Players | 2 | Latency-resilient turn timers and state synchronization for remote gameplay | byeolee |
| Gaming/UX | Major | Multiplayer Support (3+ Players) | 2 | Expandable 2 to 4 player slot architecture allowing concurrent group play | byeolee |
| Gaming/UX | Major | Advanced 3D Graphics via Three.js | 2 | 3D dice meshes, quaternion rotational tumbling, shadows, and physics via Three.js | byeolee |
| Gaming/UX | Minor | Game Customization Options | 1 | Configurable capacity (2-4), private room passwords, and custom AI slot levels | byeolee |
| Gaming/UX | Minor | Gamification System | 1 | Condition-based title unlocks, captcha rewards, and global leaderboard rankings | sanghul2, hjang |
| AI | Major | AI Game Opponent | 2 | Mathematical expected value AI opponent across 3 configurable difficulty tiers | byeolee |
| User Mgmt | Major | Standard User Management & Auth | 2 | JWT sessions, bcrypt hashing, profile customization, and avatar selections | sanghul2 |
| User Mgmt | Minor | Game Statistics & Match History | 1 | Relational match logs, win-rate analytics, and leaderboard integrations | hjang |

- Total Earned Score: 23 points (9 Major modules × 2 pts = 18 pts / 5 Minor modules × 1 pt = 5 pts)
- Fully satisfies the mandatory 14-point requirement and achieves the maximum 5 bonus points.

---

### 1.9 Individual Contributions

#### 1) sanghul2 (PO / Full-Stack Developer)
- Detailed Contributions:
  - Defined product vision, user journey, and backlog requirements.
  - Implemented JWT authentication guards and bcrypt password hashing.
  - Designed and created the interactive slider puzzle captcha (PuzzleCaptcha.tsx).
  - Built the title unlock and equipping system (TitlesPage.tsx, TitleUnlockModal.tsx).
  - Developed the Windows 98 real-time collaborative whiteboard (Win98Canvas.tsx, drawing.gateway.ts).
  - Authored over 20 standard documentation specifications in doc/.
- Challenges & Solutions:
  - Challenge: Traditional text captchas offered poor UX and were vulnerable to OCR bypass.
  - Solution: Engineered an HTML5 Canvas 2D jigsaw puzzle generator with Bezier curves, verifying alignment within a strict ±5px tolerance to balance security and usability.

#### 2) byeolee (PM / Full-Stack Game Architect & Developer)
- Detailed Contributions:
  - Defined sprint milestones, managed GitHub issues/Kanban, and coordinated team deadlines.
  - Architected the Yacht Dice game engine (yacht.gateway.ts, yacht.service.ts, yacht.score.ts).
  - Implemented 3D dice physics and tumbling animations via Three.js (Dice3DCanvas.tsx).
  - Created the 12-category score calculation sheet (YachtBoard.tsx).
  - Built the 2-4 player room state machine and lobby flows (GameMakePage.tsx, GameRoomPage.tsx).
  - Designed the 3-level AI engine using mathematical expected value algorithms (yacht.ai.ts).
- Challenges & Solutions:
  - Challenge: Network latency caused animation finishing times to desynchronize from server score evaluations in 4-player matches.
  - Solution: Adopted a deterministic synchronization pattern where the backend confirms and broadcasts final values first, while client dice smoothly slerp to target orientations.

#### 3) hjang (Tech Lead / Database & DevOps Lead / Full-Stack Developer)
- Detailed Contributions:
  - Created the initial full-stack proof-of-concept (hjang_fullstack) validating Docker, NestJS, and React.
  - Spearheaded upgrading the database to PostgreSQL 16 (postgres:16-alpine) with Asia/Seoul timezone synchronization.
  - Consolidated divergent branch schemas into a unified Prisma schema (schema.prisma).
  - Orchestrated Nginx reverse proxy routing and single-command Docker Compose automation.
  - Designed MatchHistory and MatchParticipant persistence models and built ranking/stats pages (MatchHistoryPage.tsx, RankingPage.tsx).
- Challenges & Solutions:
  - Challenge: Discrepancies between PostgreSQL 15, Windows, and Linux environments caused timezone shifts and container line-ending (CRLF) failures.
  - Solution: Explicitly pinned Asia/Seoul timezone across Compose configurations, enforced LF line endings via Git attributes, and documented a structured migration guideline (merge.txt).

---

## 2. API & WebSocket Specifications

### 2.1 REST API Specification
All endpoints are reverse-proxied through Nginx on port 8080 or accessible directly on backend port 3000.

| Method | Endpoint | Headers / Payload | Response | Description |
| :--- | :--- | :--- | :--- | :--- |
| POST | /auth/signup | { email, password, nickname } | { message, user } | Registers new user account with hashed password |
| POST | /auth/login | { email, password } | { accessToken, user } | Authenticates user and issues JWT token |
| GET | /auth/me | Authorization: Bearer {token} | User object | Fetches current authenticated user profile |
| GET | /auth/user/:nickname | - | User object | Retrieves public user details by nickname |
| POST | /auth/claim-title | { title, nickname } | { message, user } | Registers an earned title when conditions are met |
| PATCH | /auth/title | { title, nickname } | { message, user } | Equips or swaps active displayed title |
| PATCH | /auth/profile | { nickname, avatar, newPassword } | { message, user } | Updates profile avatar, nickname, or password |
| POST | /yacht/rooms | { title, isPublic, password, slots }| Created Room object | Creates a new game room (2-4 slots, AI slots) |
| GET | /yacht/rooms | - | Room[] array | Lists all currently active game rooms |
| GET | /yacht/rooms/:id | - | Room object | Fetches specific room details and slot status |
| POST | /yacht/rooms/:id/join | { nickname } | Updated Room object | Enters an open slot in the room |
| POST | /yacht/rooms/:id/leave| { nickname } | { message } | Leaves the current game room |
| POST | /yacht/rooms/:id/ready| { nickname } | { slot, isReady } | Toggles participant readiness state |
| GET | /yacht/rooms/:id/game | - | GameState object | Retrieves active game board and turn data |
| POST | /yacht/rooms/:id/game/start | - | GameState object | Triggers match start (Host only) |
| POST | /yacht/rooms/:id/game/roll | { nickname, held: boolean[] } | { dice, rollsLeft } | Rolls unheld dice and decrements roll count |
| POST | /yacht/rooms/:id/game/hold | { nickname, held: boolean[] } | { held } | Updates held dice states |
| POST | /yacht/rooms/:id/game/score| { nickname, category } | GameState object | Records category score and passes turn |
| GET | /yacht/matches/user/:nickname | - | { totalMatches, wins, winRate, history } | Queries player match logs and win rate |
| GET | /yacht/ranking | - | LeaderboardUser[] | Fetches global rankings sorted by wins/scores |

### 2.2 WebSocket Events

#### 1) Collaborative Whiteboard (DrawingGateway)
- Connection URL: ws://localhost:8080/socket.io
- drawing:init (Server ➔ Client): Dispatches cached 5,000 recent brush strokes to newly connected client
- drawing:stroke (Client ➔ Server): Transmits new brush stroke tuple (x0, y0, x1, y1, color, width)
- drawing:stroke (Server ➔ Broadcast): Broadcasts received stroke to all other active peers
- drawing:clear (Client ➔ Server ➔ Broadcast): Clears canvas simultaneously across all clients

#### 2) Yacht Dice Match (YachtGateway)
- yacht:room_updated: Broadcasts slot updates, joins, leaves, and ready toggles
- yacht:game_started: Announces match start and initializes first round
- yacht:dice_rolled: Synchronizes dice values and remaining roll count
- yacht:turn_changed: Notifies players of turn transitions
- yacht:game_finished: Announces round 12 completion and final rankings

---

## 3. Evaluator's Guide (5-Minute Quick Pass)

This scenario guides evaluators through a complete verification pass in under 5 minutes.

### 3.1 Initial Checks
1. Browser: Launch Google Chrome and press F12 to open the Developer Tools Console tab.
2. Zero Console Errors Policy: Confirm that no red errors (uncaught exceptions) appear throughout testing.

### 3.2 Step-by-Step Verification Scenario
1. Launch Project with Single Command:
   - Run `docker compose up --build` in the terminal and verify all 5 containers start cleanly.
   - Navigate to `http://localhost:8080` in Chrome.
2. Registration & Slider Captcha Test:
   - Click Signup in the navigation bar and register a test user.
   - Navigate to Login, enter credentials, and drag the puzzle slider into position.
   - Confirm successful authentication upon alignment within tolerance.
3. Title Unlock & Profile Inspection:
   - Verify the "Novice Slider" celebration modal appears after initial login.
   - Visit Profile and Titles to inspect avatar selection and title equipping.
4. Room Creation & AI Opponent Configuration:
   - Navigate to Lobby and click Create Room.
   - Select a 2-player capacity, assign Slot 2 to an AI Opponent with MASTER difficulty, and create the room.
5. 3D Dice Gameplay:
   - Start the match and observe 3D dice physics and tumbling animations.
   - Click dice to hold/keep them and perform rerolls (up to 3 rolls per turn).
   - Select a category (e.g., Aces, Choice, Yacht) on the scoreboard to record points and advance the turn to the AI.
   - Observe the MASTER AI calculating expected values, rolling, and filling its category.
6. Match History & Leaderboard Verification:
   - Complete the match (or inspect existing records) in Match History.
   - Check the Ranking page to verify updated win rates and rankings.
7. Collaborative Whiteboard Test:
   - Open a secondary browser tab at `http://localhost:8080`.
   - Navigate to Drawing in both tabs and verify strokes drawn in one tab broadcast in real time to the other.

---

## 4. Instructions

### 4.1 Prerequisites
- Docker Desktop (Windows / macOS) or Docker Engine & Docker Compose (Linux)
- Git
- Web Browser: Latest stable version of Google Chrome

### 4.2 Environment Configuration
Duplicate the `.env.example` file at repository root to create `.env`:

```bash
cp .env.example .env
```

Example `.env` configuration:
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=transcendence
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/transcendence?schema=public

# Backend
PORT=3000
JWT_SECRET=super_secret_jwt_key_ft_transcendence_2026

# Timezone
TZ=Asia/Seoul
PGTZ=Asia/Seoul
```

### 4.3 Execution
The application is fully containerized and boots using a single command:

```bash
docker compose up --build
```

To run containers in detached mode:
```bash
docker compose up -d --build
```

To stop containers:
```bash
docker compose down
```

### 4.4 Access & Verification
- Web Application Ingress: http://localhost:8080 (Served via Nginx reverse proxy)
- Backend Direct Ingress (Optional): http://localhost:3000
- PostgreSQL Direct Port (Optional): localhost:5432

---

## 5. Troubleshooting Guide

### 5.1 Port Conflicts (8080, 3000, 5432)
- Symptom: Containers fail to bind with `bind: address already in use`.
- Cause: A local web server, Node.js process, or PostgreSQL daemon is holding the port.
- Solution:
  ```bash
  # Check listening processes on Windows
  netstat -ano | findstr 8080
  netstat -ano | findstr 5432
  # Terminate conflicting PID or modify port mappings in docker-compose.yml
  ```

### 5.2 Clean Database Reset
- Symptom: Database schema migration mismatch or stale test data.
- Solution:
  ```bash
  # Stop containers and destroy volumes
  docker compose down -v
  # Rebuild and start cleanly
  docker compose up --build
  ```

### 5.3 Windows Line Endings (CRLF vs LF)
- Symptom: Scripts fail inside Linux containers with `\r: command not found`.
- Solution:
  - Configure Git: `git config --global core.autocrlf false`
  - In VS Code, verify the bottom-right status bar shows LF for `start.sh`, `Dockerfile`, and `nginx/default.conf`.

---

## 6. Resources

### 6.1 Documentation & References
- NestJS Documentation: https://docs.nestjs.com
- Prisma ORM Documentation: https://www.prisma.io/docs
- Three.js & React Three Fiber: https://threejs.org, https://docs.pmnd.rs/react-three-fiber
- Socket.io Documentation: https://socket.io/docs/v4
- Tailwind CSS: https://tailwindcss.com/docs
- Official Yacht Dice Game Rules: Classic Yacht scoring formulas and category guidelines

### 6.2 AI Usage Disclosure
In compliance with 42 curriculum regulations (Chapter I: AI Instructions), the use of AI tools in this project is disclosed as follows:

- English Translation & Documentation:
  - AI tools were utilized to assist in translating the project subject (en.subject.pdf), technical documentation, and README into English, as well as reviewing terminology.
  - All generated translations were thoroughly reviewed, corrected, and verified by team members to ensure total alignment with project requirements.
