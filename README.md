### PROJECT STRUCTURE
pawket/
├── app/                    # screens and API endpoints (the face and front door)
│   ├── layout.tsx          #
│   └── page.tsx            #
├── lib/                    # the app's logic and data definitions (the brain)
│   └── ledger/             # trades in, positions and gains out
│       ├── types.ts        # what a Trade and a Position look like
│       ├── positions.ts    # turns trades into positions
│       └── positions.test.ts  # checks the maths with known examples
├── public/                 # images and icons
├── AGENTS.md               # note for AI tools: read the Next.js docs first
├── CLAUDE.md               # rules for Claude in this project
└── package.json            # dependencies and commands (npm test, npm run dev)