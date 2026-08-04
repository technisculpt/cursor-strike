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
    role: High-Level Consultant & Final QA Gatekeeper
    responsibilities:
      - Final vision sign-off on pre-filtered candidate releases.
      - Evaluate candidate deliverables after Gemini Assistant 2-3 step verification.
      - Enforce high-level visual, physics, and gameplay standards.
  - name: Gemini_PreQA_Checker
    model: gemini-3.6-flash
    role: Intermediary Assistant & Pre-QA Inspector
    responsibilities:
      - Perform 2-3 internal verification and polishing loops with Gemini creator subagents.
      - Inspect code diffs, static analysis, level data contracts, and visual canvas layouts.
      - Package verified candidate releases for QA_Mentor_Claude.
subagents:
  - name: TechLead_Physics
    model: gemini-1.5-pro
    role: Senior Physics Engineer
  - name: Gemini_LevelDesigner
    model: gemini-1.5-flash
    role: Level Architect
  - name: Gemini_UX_UI
    model: gemini-1.5-flash
    role: Interface & Aesthetic Designer
  - name: Gemini_SoundDesigner
    model: gemini-1.5-flash
    role: Web Audio Specialist
  - name: Testing_Agent
    model: gemini-1.5-flash
    role: Automation Executioner
---

# Global Project Context
**Game:** A 2D physics-based web game where the player's mouse acts as a physical collider (represented by a circle) to strike a main ball up a ramp and into a goal. 
**Key Reference:** `mockup.jpg` contains the free-body diagrams, friction coefficients, and spatial layout requirements.