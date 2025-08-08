# Claude Documentation

This directory contains documentation for working with Claude AI assistants on the PokeBoids project.

## Structure

```
docs/claude/
├── README.md           # This file
├── CLAUDE.md          # Main project context and instructions
└── agents/            # Specialized agent instructions
    └── PHASER_EXPERT.md   # Phaser.js game development expert
```

## Files

### CLAUDE.md
The main context file that provides Claude with essential project information including:
- Project overview and architecture
- Technology stack details
- Code style guidelines
- Important implementation patterns
- Project structure and organization

### agents/PHASER_EXPERT.md
Specialized instructions for Phaser.js game development tasks including:
- Phaser framework expertise
- Project-specific event-driven architecture
- Performance optimization strategies
- Animation and sprite management
- Physics and collision handling

## Usage

When working with Claude on this project:
1. Claude automatically reads `CLAUDE.md` for project context
2. For Phaser-specific tasks, reference the `agents/PHASER_EXPERT.md` instructions
3. Additional specialized agents can be added to the `agents/` directory as needed

## Adding New Agents

To create a new specialized agent:
1. Create a new markdown file in `docs/claude/agents/`
2. Define the agent's role, expertise, and guidelines
3. Include project-specific patterns and best practices
4. Document common tasks and implementation examples