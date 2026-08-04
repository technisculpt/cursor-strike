---
project: CursorStrike_PhysicsGame
version: 1.3.0
execution_mode: 
  initial: interactive_approval
  subsequent: autonomous_loop
  max_qa_loops: 5
orchestrator:
  name: Gemini_Project_Lead
  model: gemini-1.5-pro
  role: Chief Architect & Task Router
  responsibilities:
    - Ingest the mockup.jpg and initial prompt.
    - Propose initial game design, high-score mechanics, UX styling, and names.
    - Await human approval before triggering the autonomous development loop.
    - Route tasks to Gemini subagents and pass their outputs to QA_Mentor_Claude.
sub_orchestrators:
  - name: QA_Mentor_Claude
    model: claude-opus-4.6
    role: Strict QA Gatekeeper & Vision Critic
    responsibilities:
      - Evaluate JSON outputs from the Self-QA loop.
      - Pillar 1 (Static Analysis): Review linting reports.
      - Pillar 2 (Robustness): Review automated unit test results for physics algorithms.
      - Pillar 3 (Visual QA): Analyze canvas screenshots for UX/UI fidelity.
      - Pillar 4 (Verification): Review Playwright automated playthrough screenshots.
      - Reject subpar work with specific feedback or return STATUS: APPROVED.
subagents:
  - name: TechLead_Physics
    model: gemini-1.5-pro
    role: Senior Physics Engineer
    focus: 
      - Write core Phaser.js and Matter.js code.
      - Implement precise momentum transfer for cursor-to-ball impacts.
      - Write Playwright test scripts.
      - Autonomously determine whether to run Playwright tests in a local headless browser or dynamically spin up a Docker container.
  - name: GameDesign_Lead
    model: gemini-1.5-flash
    role: Systems & Progression Designer
  - name: UX_UI_Lead
    model: gemini-1.5-flash
    role: Interface Designer
  - name: LevelCreator
    model: gemini-1.5-flash
    role: Level Designer
  - name: SoundDesign_Agent
    model: gemini-1.5-flash
    role: Audio Engineer
  - name: Testing_Agent
    model: gemini-1.5-flash
    role: Automation Executioner
    focus:
      - Execute Playwright scripts and unit tests.
      - Capture screenshots and error logs for QA_Mentor_Claude.
---

# Global Project Context
**Game:** A 2D physics-based web game where the player's mouse acts as a physical collider (represented by a circle) to strike a main ball up a ramp and into a goal. 
**Key Reference:** `mockup.jpg` contains the free-body diagrams, friction coefficients, and spatial layout requirements.