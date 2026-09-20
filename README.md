# DataVerse — Interactive DSA Lab

DataVerse is an interactive learning platform for Data Structures, Algorithms, OOP and DSA concepts.

## V7 Interactive Upgrade

- Step-by-step operation replay with Play / Pause / Previous / Next / speed controls.
- Complexity Spotlight: Time Complexity and Auxiliary Space are highlighted after every operation, with the reason for the complexity.
- More interactive visualizations with hover/click states and clearer pointer labels.
- **Doubly Linked List** module with DATA, PREV and NEXT pointers, insertion, deletion, traversal and reverse.
- Expanded **DS Concepts** area, including Doubly Linked List and interactive concept diagrams.
- Detailed Notes & Revision content for OOP and DSA.
- Module-specific inputs are isolated so values from one module are never reused by another.

## Run locally

### Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:5000`.

### Frontend

In a second terminal:

```bash
cd frontend
npx serve .
```

Open `http://localhost:3000`.

## Project structure

```text
dataverse-v3/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── detailed-notes.json
│   └── notes-data.js
├── .gitignore
└── README.md
```

## Team Git workflow

Use feature branches for module work:

```bash
git checkout -b feature/doubly-linked-list
git add .
git commit -m "Add doubly linked list visualization"
git push -u origin feature/doubly-linked-list
```

Then open a Pull Request into `main`.
