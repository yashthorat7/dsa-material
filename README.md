# DSA Notes & Sheets

<p align="center">
  <img src="assets/images/cover.png" alt="DSA Notes & Sheets" width="650">
</p>

A battle-tested DSA handbook distilled from **1,000+ LeetCode problems**, unifying the best of **Striver's SDE Sheet**, **NeetCode 150**, and actual interview patterns from top Indian and global tech giants.

<p align="center">
  <a href="https://dummy-dsa.vercel.app">
    <button><strong>OPEN DIGITAL BOOK</strong></button>
  </a>
</p>

<p align="center">
  <strong>OR</strong>
</p>

<p align="center">
  <a href="docs/index.md"><button>Index</button></a>
  &nbsp;&nbsp;
  <a href="docs/problems.md"><button>Problem Sheet</button></a>
  &nbsp;&nbsp;
  <a href="docs/cheatsheet.md"><button>Cheat Sheet</button></a>
</p>

---

## Why This Exists

Most interview prep falls into two traps: dry theory with no actionable code, or bloated 500+ problem lists filled with duplicate patterns and broken video links.

This handbook filters the noise down to **150 essential problems**, cross-curated from **Striver's SDE Sheet**, **NeetCode 150**, and actual interview sets from top Indian and global tech companies (Amazon, Flipkart, Google, Microsoft, Zoho, Swiggy, Paytm, and TCS).

Every breakdown provides:
- **Multi-Approach Solutions**: From brute force intuition to optimal C++ implementations.
- **Invariant Analysis**: Why an algorithm works, not just how to memorize it.
- **Edge-Case Traps**: Common pitfalls and testcases that break naive logic.
- **Video Walkthroughs**: 100% verified, embedded YouTube explanations for every single problem.

---

## Key Highlights

- **Smart Problem Tracker**: An interactive web dashboard with progress stats, category breakdowns, and company tag filters synced locally.
- **34 Theory Chapters**: Deep dives into complexity bounds, bit manipulation, tree DFS/BFS, advanced graph algorithms, and dynamic programming optimizations.
- **Master Cheat Sheet**: Quick C++ reference containing copy-pasteable templates for Binary Search, Monotonic Stack, Dijkstra, DSU, and Tries.
- **Zero-Build SPA**: Pure client-side markdown reader with KaTeX math rendering, Prism syntax highlighting, and dark/light themes.

---

## 30-Day Sprint

A focused 4-week roadmap to build pattern recognition quickly:

- **Week 1 (Days 1–7)**: Arrays, Hashing, Two Pointers, Sliding Window & Linked Lists
- **Week 2 (Days 8–14)**: Binary Search on Answer, Monotonic Stacks, Binary Trees & Heaps
- **Week 3 (Days 15–21)**: Backtracking, Graph BFS/DFS, Topological Sort & Tries
- **Week 4 (Days 22–28)**: 1D/2D Dynamic Programming, Knapsack, Greedy Intervals & Bit Manipulation
- **Days 29–30**: Revision queue review and timed mock problems

---

## The 30-Minute Rule

- **0–20 min**: Break down constraints, draw state spaces, and trace edge cases on paper.
- **20–30 min**: If stuck, review the solution note to identify the core invariant and watch the video.
- **30+ min**: Close all notes and write the optimal implementation from scratch.

---

## Running Locally

No installation or build steps required:

```bash
# Node.js
npx serve .

# Python
python -m http.server 8000
```

Open `http://localhost:3000` or `http://localhost:8000` in any browser.

---

## Project Structure

```text
dsa-notes/
├── index.html          # SPA reader & problem tracker
├── assets/             # Scripts, styles, icons, and theme tokens
└── docs/
    ├── index.md        # 34 chapter directory & topic guide
    ├── cheatsheet.md   # Master C++ reference & algorithmic templates
    ├── problems.md     # 150-problem sheet categorized by pattern & company
    ├── problems.json   # Structured dataset for tracker filters
    ├── chapters/       # Detailed theory notes (Chapters 1–34)
    └── solutions/      # 150 problem breakdowns with embedded videos
```

---

## Acknowledgments

- **Striver (take U forward)** for the SDE Sheet and clear algorithmic pedagogy.
- **NeetCode** for pattern-first problem breakdowns.
- **LeetCode** for the core problem platform.

---

If you find this repository helpful, please consider leaving a star on GitHub.


