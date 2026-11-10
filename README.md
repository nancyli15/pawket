### PROJECT STRUCTURE
```
pawket/
├── app/                    # screens and API endpoints 
│   ├── layout.tsx              # frame shared by every page
│   └── page.tsx                # home page
├── lib/                    # library: the app's logic and data definitions
│   └── ledger/                 # logic for trades in, positions and gains out
│       ├── types.ts                # defines types within the ledger
│       ├── positions.ts            # calculations to turn trades into positions
│       ├── positions.test.ts       
│       ├── value.ts                # adds market value and unrealized gain into position
│       └── value.test.ts
├── public/                 # images and icons
├── AGENTS.md               # note for AI tools: read the Next.js docs first
├── CLAUDE.md               # rules for Claude in this project
└── package.json            # dependencies and commands 
```