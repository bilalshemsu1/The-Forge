import { storage } from './storage.js';

export const SEED_PROBLEMS = [
  {
    "id": "sys-gw-01",
    "category": "System Design",
    "difficulty": 7,
    "title": "Distributed LLM Gateway Router & Provider Failover",
    "prompt": "Design a high-throughput class-based OOP AI Gateway system that routes requests across multiple provider LLM APIs (OpenAI, Anthropic, Gemini). Implement exponential backoff retry policies, provider health monitoring, and weighted round-robin load balancing under 1,000 req/min traffic spikes.",
    "details": {
      "inputFormat": "Gateway initialization object containing array of provider configurations.",
      "outputFormat": "Routed response object or structured failover error payload.",
      "constraints": "Gateway latency overhead < 15ms\nSupport 1,000 req/min concurrency\nAutomatic 429/5xx retry failover",
      "sampleInput": "{\n  \"model\": \"gpt-4o\",\n  \"messages\": [{\"role\": \"user\", \"content\": \"hello\"}]\n}",
      "sampleOutput": "{\n  \"provider\": \"anthropic\",\n  \"status\": 200,\n  \"data\": \"Hello!\"\n}"
    },
    "language": "javascript",
    "starterCode": "class LLMGatewayOrchestrator {\n  constructor(providers) {\n    this.providers = providers;\n  }\n\n  async routeRequest(payload) {\n    // Implement failover routing across providers\n  }\n}",
    "hints": [
      "Class-based OOP architecture with standard Provider interface.",
      "Catch HTTP 429 / 5xx errors and trigger immediate failover to next healthy provider.",
      "Use a circular iterator or weighted score scheduler."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "fastify",
      "node-js",
      "llm-gateway",
      "oop",
      "system-design"
    ],
    "source": "Cloud Architecture Specs"
  },
  {
    "id": "dbg-wallet-02",
    "category": "Debugging",
    "difficulty": 6,
    "title": "Concurrent Ledger Wallet Credit Race Condition",
    "prompt": "In a high-concurrency payment engine, parallel student API requests to start a timed exam result in duplicate wallet balance deductions. Debug the transaction boundary to ensure strict atomic credit deductions under concurrent load.",
    "details": {
      "inputFormat": "`userId` string, `examId` string, `db` connection instance.",
      "outputFormat": "Atomic deduction of 1 credit and return created exam session object.",
      "constraints": "Prevent negative wallet balance\nHandle up to 100 concurrent requests per user",
      "sampleInput": "{\"userId\": \"usr_102\", \"examId\": \"exam_math_01\"}",
      "sampleOutput": "{\"sessionCreated\": true, \"creditsLeft\": 4}"
    },
    "language": "javascript",
    "starterCode": "async function startWeeklyExam(userId, examId, db) {\n  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });\n  if (user.credits < 1) throw new Error('Insufficient credits');\n  await db.update(users).set({ credits: user.credits - 1 }).where(eq(users.id, userId));\n  return createExamSession(userId, examId);\n}",
    "hints": [
      "Non-atomic read-then-write creates a TOCTOU race condition under high concurrency.",
      "Use PostgreSQL row-level locks (SELECT FOR UPDATE) or atomic decrements.",
      "Wrap balance check and session initialization inside an explicit SQL transaction."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"credits\": 1, \"concurrentReqs\": 5}",
        "expectedOutput": "{\"successCount\": 1, \"creditsRemaining\": 0}"
      }
    ],
    "tags": [
      "postgresql",
      "race-condition",
      "concurrency",
      "drizzle-orm"
    ],
    "source": "FinTech Ledger Audit Log"
  },
  {
    "id": "alg-fefo-03",
    "category": "Algorithms",
    "difficulty": 6,
    "title": "FEFO (First-Expired, First-Out) Warehouse Inventory Allocator",
    "prompt": "An enterprise ERP warehouse must allocate product batches for outgoing sales using First-Expired, First-Out (FEFO) order logic. Write an algorithm `allocateBatches(requiredQty, batches)` that returns exact batch allocations and flags low-stock alerts when total remaining inventory drops below reorder thresholds.",
    "details": {
      "inputFormat": "`requiredQty` integer, `batchList` array of batch objects `{id, qty, exp}`.",
      "outputFormat": "Object `{ allocated: [{batchId, qty}], lowStockAlert: boolean }`.",
      "constraints": "Batch exp dates formatted as YYYY-MM-DD\nO(B log B) time complexity",
      "sampleInput": "{\n  \"req\": 15,\n  \"batches\": [\n    {\"id\": \"B1\", \"qty\": 10, \"exp\": \"2026-10-01\"},\n    {\"id\": \"B2\", \"qty\": 20, \"exp\": \"2026-09-15\"}\n  ]\n}",
      "sampleOutput": "{\n  \"allocated\": [{\"id\": \"B2\", \"qty\": 15}]\n}"
    },
    "language": "javascript",
    "starterCode": "function allocateBatches(requiredQty, batchList, reorderThreshold) {\n  // Sort batches by expiry date ascending\n  // Deduct requiredQty across active unexpired batches\n  // Return { allocated: [{batchId, qty}], lowStockAlert: boolean }\n}",
    "hints": [
      "Sort active batches by expiry timestamp ascending before iterating.",
      "Ignore batches where expiry_date <= current_date.",
      "Sum remaining batch quantities after allocation to trigger low-stock alert."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"req\": 15, \"batches\": [{\"id\": \"B1\", \"qty\": 10, \"exp\": \"2026-10-01\"}, {\"id\": \"B2\", \"qty\": 20, \"exp\": \"2026-09-15\"}]}",
        "expectedOutput": "{\"allocated\":[{\"id\":\"B2\",\"qty\":15}]}"
      }
    ],
    "tags": [
      "erp",
      "fefo",
      "algorithms",
      "inventory"
    ],
    "source": "Supply Chain ERP Benchmarks"
  },
  {
    "id": "rec-rag-04",
    "category": "Read & Reconstruct",
    "difficulty": 7,
    "title": "Vector Database Document Chunking & Overlap Engine",
    "prompt": "Reconstruct the sliding-window sentence-aware text chunking algorithm used for embedding large documentation PDFs into a vector search database. Ensure chunks preserve sentence boundaries without clipping tokens abruptly.",
    "details": {
      "inputFormat": "`text` string, `max_chunk_tokens` integer, `overlap_tokens` integer.",
      "outputFormat": "Array of chunk strings with overlapping sentence boundaries.",
      "constraints": "Preserve sentence integrity\nToken boundary < max_chunk_tokens",
      "sampleInput": "\"High performance vector search databases require sentence-aware chunking...\"",
      "sampleOutput": "[\"Chunk 1 text...\", \"Chunk 2 text...\"]"
    },
    "language": "python",
    "starterCode": "def chunk_document_rag(text, max_chunk_tokens=250, overlap_tokens=50):\n    # Reconstruct sentence-aware overlapping chunker\n    pass",
    "hints": [
      "Split text into sentences using punctuation regex before grouping tokens.",
      "Maintain a rolling token counter that includes overlap_tokens from previous chunk.",
      "Ensure every chunk stays under max_chunk_tokens boundary."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "rag",
      "vector-search",
      "text-chunking",
      "ai-ml"
    ],
    "source": "Vector Search Infrastructure Specs"
  },
  {
    "id": "rev-rbac-05",
    "category": "Reverse Engineering",
    "difficulty": 5,
    "title": "Bitmask Role-Based Access Control (RBAC) Security Engine",
    "prompt": "A high-performance security module packs user permissions into a 16-bit integer bitmask. Reconstruct the decode & authorization evaluation logic `evaluatePermission(roleMask, requiredPermission)`.",
    "details": {
      "inputFormat": "`roleMask` integer, `requiredPermission` bit flag integer.",
      "outputFormat": "Boolean `true` if permitted, `false` otherwise.",
      "constraints": "Bitwise 16-bit evaluation\nAdmin bit (1<<4) overrides all checks",
      "sampleInput": "{\"roleMask\": 17, \"perm\": 1}",
      "sampleOutput": "true"
    },
    "language": "javascript",
    "starterCode": "const PERMISSIONS = { READ: 1<<0, WRITE: 1<<1, DELETE: 1<<2, AUDIT: 1<<3, ADMIN: 1<<4 };\nfunction evaluatePermission(roleMask, requiredPermission) {\n  // Implement bitwise check\n}",
    "hints": [
      "Use bitwise AND operator: (roleMask & requiredPermission) === requiredPermission.",
      "Check if ADMIN (1 << 4) automatically grants all lower permissions."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"roleMask\": 17, \"perm\": 1}",
        "expectedOutput": "true"
      }
    ],
    "tags": [
      "security",
      "bitmask",
      "rbac"
    ],
    "source": "Kernel Access Control Specs"
  },
  {
    "id": "dbg-stream-06",
    "category": "Debugging",
    "difficulty": 5,
    "title": "High-Volume Webhook Event Loop Deadlock Debugger",
    "prompt": "When thousands of client webhooks post updates concurrently, the event loop latency spikes to 4,000ms causing API timeouts. Debug the async stream processing queue to achieve immediate response times.",
    "details": {
      "inputFormat": "HTTP request body payload from external webhook.",
      "outputFormat": "Immediate 200 OK response with background worker queue dispatch.",
      "constraints": "Response latency < 50ms\nZero dropped events",
      "sampleInput": "{\"event_id\": 10023, \"payload\": {\"type\": \"user.signup\"}}",
      "sampleOutput": "{\"status\": \"ok\"}"
    },
    "language": "javascript",
    "starterCode": "async function handleWebhook(req, reply) {\n  const payload = req.body;\n  const cleanedData = cleanDataSync(payload);\n  await db.insert(events).values(cleanedData);\n  reply.send({ status: 'ok' });\n}",
    "hints": [
      "Avoid running synchronous CPU-heavy regex data cleaning on main Fastify thread.",
      "Offload data processing to background worker queue.",
      "Return 200 OK immediately to webhooks."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "fastify",
      "event-loop",
      "node-js",
      "webhooks"
    ],
    "source": "Event Stream Infrastructure"
  },
  {
    "id": "cp-01",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Segment Tree with Lazy Propagation Range Updates",
    "prompt": "Implement a Segment Tree supporting O(log N) point queries, range sum queries, and range addition updates using lazy propagation.",
    "details": {
      "inputFormat": "Array A of N integers, Q queries: update(l, r, val) or query(l, r).",
      "outputFormat": "Return array of query range sum results.",
      "constraints": "1 <= N, Q <= 2*10^5\n1 <= val <= 10^9\nTime Limit: 1.5s",
      "sampleInput": "{\"arr\": [1, 3, 5, 7, 9, 11], \"queries\": [{\"type\": \"update\", \"l\": 1, \"r\": 3, \"val\": 3}, {\"type\": \"query\", \"l\": 1, \"r\": 3}]}",
      "sampleOutput": "[24]"
    },
    "language": "python",
    "starterCode": "class SegmentTreeLazy:\n    def __init__(self, arr):\n        self.n = len(arr)\n        # Build segment tree with lazy arrays\n        pass\n\n    def update_range(self, l, r, val):\n        pass\n\n    def query_range(self, l, r):\n        pass",
    "hints": [
      "Push lazy tags to children before descending into subtrees.",
      "Build array size as 4*N."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"arr\":[1,3,5]}",
        "expectedOutput": "[9]"
      }
    ],
    "tags": [
      "competitive-programming",
      "segment-tree",
      "data-structures"
    ]
  },
  {
    "id": "cp-02",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Heavy-Light Decomposition (HLD) on Trees",
    "prompt": "Decompose a rooted tree into heavy and light paths to answer sub-tree and path update/query operations in O(log^2 N) time.",
    "details": {
      "inputFormat": "Tree adjacency list, node weights, Q path query queries.",
      "outputFormat": "Array of path maximum weights.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s",
      "sampleInput": "{\"edges\": [[0,1],[1,2]], \"weights\": [5, 10, 2], \"query\": [0, 2]}",
      "sampleOutput": "[10]"
    },
    "language": "python",
    "starterCode": "def heavy_light_decomposition(edges, weights, queries):\n    # Reconstruct HLD decomposition\n    pass",
    "hints": [
      "Heavy child has the largest subtree size.",
      "Combine HLD with Segment Tree over flattened segment array."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "competitive-programming",
      "hld",
      "trees"
    ]
  },
  {
    "id": "cp-03",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Convex Hull Trick (CHT) Dynamic Programming",
    "prompt": "Optimize 1D dynamic programming transitions of the form DP[i] = min_{j < i} (DP[j] + m_j * x_i + c_j) using monotonic line slopes.",
    "details": {
      "inputFormat": "Array of query x values and line parameters (m, c).",
      "outputFormat": "Array of minimum values for each query x.",
      "constraints": "1 <= N <= 2*10^5\nTime Limit: 1.0s",
      "sampleInput": "{\"lines\": [[-2, 5], [1, 2]], \"x\": [3, 5]}",
      "sampleOutput": "[-1, 7]"
    },
    "language": "python",
    "starterCode": "class ConvexHullTrick:\n    def __init__(self):\n        self.lines = []\n\n    def add_line(self, m, c):\n        pass\n\n    def query(self, x):\n        pass",
    "hints": [
      "Keep lines sorted by decreasing slope.",
      "Remove redundant lines using cross-product intersection formula."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"x\":[1]}",
        "expectedOutput": "[3]"
      }
    ],
    "tags": [
      "competitive-programming",
      "cht",
      "dp-optimization"
    ]
  },
  {
    "id": "cp-04",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Fast Fourier Transform (FFT) Polynomial Multiplication",
    "prompt": "Multiply two degree-N polynomials A(x) and B(x) in O(N log N) time using complex root-of-unity Cooley-Tukey FFT.",
    "details": {
      "inputFormat": "Coefficients array A and B.",
      "outputFormat": "Coefficients array C of product polynomial A * B.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 1.5s",
      "sampleInput": "{\"A\": [1, 2], \"B\": [3, 4]}",
      "sampleOutput": "[3, 10, 8]"
    },
    "language": "javascript",
    "starterCode": "function multiplyPolynomialsFFT(A, B) {\n  // Implement Cooley-Tukey FFT\n}",
    "hints": [
      "Pad array length to next power of 2.",
      "Use bit-reversal permutation for in-place transform."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"A\":[1,2],\"B\":[3,4]}",
        "expectedOutput": "[3,10,8]"
      }
    ],
    "tags": [
      "competitive-programming",
      "fft",
      "math"
    ]
  },
  {
    "id": "cp-05",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Z-Algorithm Pattern Matcher",
    "prompt": "Construct the Z-array Z[i] representing the longest common prefix between S and the suffix of S starting at i in O(N) linear time.",
    "details": {
      "inputFormat": "String S of length N.",
      "outputFormat": "Z-array of integers.",
      "constraints": "1 <= |S| <= 10^6\nTime Limit: 0.5s",
      "sampleInput": "\"aabcaabxaa\"",
      "sampleOutput": "[0, 1, 0, 0, 3, 1, 0, 0, 2, 1]"
    },
    "language": "python",
    "starterCode": "def compute_z_array(s):\n    # Construct linear time Z-array\n    pass",
    "hints": [
      "Maintain Z-box interval [L, R].",
      "Reuse computed Z-values when i <= R."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"aaaa\"",
        "expectedOutput": "[0,3,2,1]"
      }
    ],
    "tags": [
      "competitive-programming",
      "z-algorithm",
      "strings"
    ]
  },
  {
    "id": "cp-06",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Aho-Corasick Automaton Multi-Pattern Search",
    "prompt": "Build an Aho-Corasick trie with failure links to locate all occurrences of a dictionary of K patterns in text T in O(|T| + sum(|P_i|)).",
    "details": {
      "inputFormat": "Text string T, dictionary array P of pattern strings.",
      "outputFormat": "Map of pattern string to list of starting indices in T.",
      "constraints": "1 <= |T| <= 10^5\n1 <= sum(|P_i|) <= 5*10^4",
      "sampleInput": "{\"text\": \"ahishers\", \"patterns\": [\"he\", \"she\", \"his\", \"hers\"]}",
      "sampleOutput": "{\"he\": [4], \"she\": [3], \"his\": [1], \"hers\": [4]}"
    },
    "language": "javascript",
    "starterCode": "class AhoCorasick {\n  constructor(patterns) {\n    // Build Trie and BFS failure links\n  }\n\n  searchInText(text) {\n    // Multi-pattern search\n  }\n}",
    "hints": [
      "Use BFS queue to set failure links for depth > 1.",
      "Follow dictionary output links during traversal."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "competitive-programming",
      "aho-corasick",
      "trie"
    ]
  },
  {
    "id": "cp-07",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Mo's Algorithm Offline Range Query Scheduler",
    "prompt": "Answer Q offline range queries on array A in O((N + Q) * sqrt(N)) by ordering queries in sqrt-blocks.",
    "details": {
      "inputFormat": "Array A, Q range query pairs [L, R].",
      "outputFormat": "Array of query results in original input order.",
      "constraints": "1 <= N, Q <= 10^5\nBlock size B = sqrt(N)",
      "sampleInput": "{\"arr\": [1, 2, 1, 3, 2], \"queries\": [[0, 2], [1, 4]]}",
      "sampleOutput": "[2, 3]"
    },
    "language": "python",
    "starterCode": "def mos_algorithm(arr, queries):\n    # Sort queries by (L // block_size, R)\n    pass",
    "hints": [
      "Sort queries by (L / B, R) where B = ceil(N / sqrt(Q)).",
      "Maintain pointer movement count."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"arr\":[1,2,1]}",
        "expectedOutput": "[2]"
      }
    ],
    "tags": [
      "competitive-programming",
      "mos-algorithm",
      "offline-queries"
    ]
  },
  {
    "id": "cp-08",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Centroid Decomposition of Trees",
    "prompt": "Divide-and-conquer on a tree by finding centroid vertices whose removal leaves no connected component larger than N/2.",
    "details": {
      "inputFormat": "Tree adjacency list of N nodes.",
      "outputFormat": "Parent array of the Centroid Tree.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 1.5s",
      "sampleInput": "{\"edges\": [[0,1],[1,2],[1,3]]}",
      "sampleOutput": "[1, -1, 1, 1]"
    },
    "language": "python",
    "starterCode": "def centroid_decomposition(edges):\n    # Reconstruct centroid tree hierarchy\n    pass",
    "hints": [
      "Recalculate subtree sizes in current active subgraph.",
      "Centroid is vertex with all subtree sizes <= component_size / 2."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "competitive-programming",
      "centroid-decomposition",
      "trees"
    ]
  },
  {
    "id": "cp-09",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Modular Multiplicative Inverse & Sieve Combinatorics",
    "prompt": "Compute N choose K modulo 10^9 + 7 in O(1) time after O(N) precomputation using Fermat's Little Theorem and Factorial Inverse Sieve.",
    "details": {
      "inputFormat": "Q queries containing (N, K).",
      "outputFormat": "Array of (N choose K) % (10^9 + 7).",
      "constraints": "1 <= N <= 10^6\nMOD = 10^9 + 7",
      "sampleInput": "{\"queries\": [[5, 2], [10, 3]]}",
      "sampleOutput": "[10, 120]"
    },
    "language": "javascript",
    "starterCode": "function precomputeCombinatorics(maxN, MOD = 1000000007) {\n  // Precompute fact and invFact arrays\n  return function nCr(n, r) {\n    // O(1) combinations query\n  };\n}",
    "hints": [
      "invFact[N] = modInverse(fact[N], MOD).",
      "Work backwards from N down to 0: invFact[i-1] = (invFact[i] * i) % MOD."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"queries\":[[5,2]]}",
        "expectedOutput": "[10]"
      }
    ],
    "tags": [
      "competitive-programming",
      "number-theory",
      "combinatorics"
    ]
  },
  {
    "id": "cp-10",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Manacher's Algorithm Linear Palindrome Finder",
    "prompt": "Find the longest palindromic substring in O(N) linear time using Manacher's palindrome expansion radius array.",
    "details": {
      "inputFormat": "String S of length N.",
      "outputFormat": "Longest palindromic substring.",
      "constraints": "1 <= |S| <= 10^6\nTime Limit: 0.5s",
      "sampleInput": "\"babad\"",
      "sampleOutput": "\"bab\""
    },
    "language": "python",
    "starterCode": "def manacher_longest_palindrome(s):\n    # Implement Manacher O(N) algorithm\n    pass",
    "hints": [
      "Transform string with boundary separators (e.g. #a#b#a#).",
      "Maintain current palindrome center C and right boundary R."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"cbbd\"",
        "expectedOutput": "\"bb\""
      }
    ],
    "tags": [
      "competitive-programming",
      "manachers-algorithm",
      "strings"
    ]
  },
  {
    "id": "cp-11",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Link-Cut Tree Dynamic Forest Operations",
    "prompt": "Maintain a dynamic forest of trees supporting link(u, v), cut(u, v), and path query operations in O(log N) amortized time using Splay Trees.",
    "details": {
      "inputFormat": "Forest operation list: link, cut, query.",
      "outputFormat": "Results array for connectivity/path queries.",
      "constraints": "1 <= N, Q <= 10^5",
      "sampleInput": "{\"ops\": [[\"link\", 0, 1], [\"query\", 0, 1]]}",
      "sampleOutput": "[true]"
    },
    "language": "python",
    "starterCode": "class LinkCutTree:\n    # Implement Splay-based Link-Cut Tree\n    pass",
    "hints": [
      "Preferred paths form splay trees.",
      "Access(u) makes root-to-u path a preferred path."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "competitive-programming",
      "link-cut-tree",
      "advanced-ds"
    ]
  },
  {
    "id": "cp-12",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Matrix Exponentiation Recurrence Solver",
    "prompt": "Compute the N-th term of a linear recurrence relation in O(K^3 log N) time using fast matrix binary exponentiation.",
    "details": {
      "inputFormat": "Transition matrix M (K x K), initial vector V, target step N.",
      "outputFormat": "Scalar answer modulo 10^9 + 7.",
      "constraints": "1 <= K <= 100\n1 <= N <= 10^18",
      "sampleInput": "{\"M\": [[1, 1], [1, 0]], \"V\": [1, 0], \"N\": 10}",
      "sampleOutput": "55"
    },
    "language": "javascript",
    "starterCode": "function matrixPow(M, N, MOD = 1000000007) {\n  // Implement O(K^3 log N) matrix binary exponentiation\n}",
    "hints": [
      "Use binary exponentiation: M^N = M^(N/2) * M^(N/2).",
      "Initialize base identity matrix for N = 0."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"N\": 10}",
        "expectedOutput": "55"
      }
    ],
    "tags": [
      "competitive-programming",
      "matrix-exponentiation",
      "math"
    ]
  },
  {
    "id": "cp-13",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Suffix Automaton (SAM) String Engine",
    "prompt": "Build the Suffix Automaton of string S with 2N-1 states and 3N-2 transitions to count distinct substrings in O(N) time.",
    "details": {
      "inputFormat": "String S.",
      "outputFormat": "Total count of distinct substrings.",
      "constraints": "1 <= |S| <= 10^5",
      "sampleInput": "\"abacaba\"",
      "sampleOutput": "21"
    },
    "language": "python",
    "starterCode": "class SuffixAutomaton:\n    def __init__(self, s):\n        # Construct SAM in linear time\n        pass\n\n    def count_distinct_substrings(self):\n        pass",
    "hints": [
      "Each state represents an equivalence class of endpos sets.",
      "Total substrings = sum(len[u] - len[link[u]])."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"aba\"",
        "expectedOutput": "5"
      }
    ],
    "tags": [
      "competitive-programming",
      "suffix-automaton",
      "strings"
    ]
  },
  {
    "id": "cp-14",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Euler Tour Technique (ETT) Subtree Range Queries",
    "prompt": "Flatten a tree into a 1D array using DFS entry/exit times to transform subtree queries into segment tree range queries.",
    "details": {
      "inputFormat": "Tree edges, initial node values, Q subtree update/query operations.",
      "outputFormat": "Subtree sum query results.",
      "constraints": "1 <= N, Q <= 10^5",
      "sampleInput": "{\"edges\": [[0,1],[0,2]], \"values\": [10, 20, 30], \"query_subtree\": 0}",
      "sampleOutput": "60"
    },
    "language": "python",
    "starterCode": "def euler_tour_flatten(edges, values, queries):\n    # Record tin[u] and tout[u] to query segment tree\n    pass",
    "hints": [
      "tin[u] to tout[u] range in segment tree corresponds to subtree at u.",
      "Single DFS traversal generates entry/exit timestamps."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"query_subtree\": 0}",
        "expectedOutput": "60"
      }
    ],
    "tags": [
      "competitive-programming",
      "euler-tour",
      "trees"
    ]
  },
  {
    "id": "cp-15",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Min-Cost Max-Flow (MCMF) Successive Shortest Path",
    "prompt": "Find the maximum flow with minimum cost from source S to sink T in a flow network using SPFA or Dijkstra with potentials.",
    "details": {
      "inputFormat": "Graph edges with capacity and unit cost.",
      "outputFormat": "Object `{ maxFlow: number, minCost: number }`.",
      "constraints": "1 <= V <= 500\n1 <= E <= 5000",
      "sampleInput": "{\"edges\": [{\"u\": 0, \"v\": 1, \"cap\": 10, \"cost\": 2}, {\"u\": 1, \"v\": 2, \"cap\": 5, \"cost\": 1}], \"S\": 0, \"T\": 2}",
      "sampleOutput": "{\"maxFlow\": 5, \"minCost\": 15}"
    },
    "language": "javascript",
    "starterCode": "function minCostMaxFlow(graph, S, T) {\n  // Implement Successive Shortest Path MCMF\n}",
    "hints": [
      "Use Johnson potentials to ensure non-negative edge weights for Dijkstra.",
      "Augment flow along shortest path in residual graph."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"S\":0,\"T\":2}",
        "expectedOutput": "{\"maxFlow\":5,\"minCost\":15}"
      }
    ],
    "tags": [
      "competitive-programming",
      "mcmf",
      "graphs"
    ]
  },
  {
    "id": "cp-16",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Treap (Cartesian Tree) Implicit Treap Split/Merge",
    "prompt": "Implement a randomized Treap supporting O(log N) split by key/size, merge, and dynamic array range insertions.",
    "details": {
      "inputFormat": "Sequence of array insertions and range reverse operations.",
      "outputFormat": "Final array state after ops.",
      "constraints": "1 <= N <= 10^5",
      "sampleInput": "{\"arr\": [1, 2, 3, 4], \"reverse_range\": [1, 2]}",
      "sampleOutput": "[1, 3, 2, 4]"
    },
    "language": "python",
    "starterCode": "class TreapNode:\n    # Implement Treap with implicit key split & merge\n    pass",
    "hints": [
      "Maintain subtree size and random priority.",
      "Use lazy propagation tags for range reversals."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "competitive-programming",
      "treap",
      "data-structures"
    ]
  },
  {
    "id": "cp-17",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Divide and Conquer DP Optimization",
    "prompt": "Optimize DP state transitions DP[i][j] = min_{k < j} (DP[i-1][k] + C(k, j)) in O(K * N log N) when optimal split point opt(i, j) is monotonic.",
    "details": {
      "inputFormat": "Array of elements and partition count K.",
      "outputFormat": "Minimum total partition cost.",
      "constraints": "1 <= N <= 5000\n1 <= K <= 800",
      "sampleInput": "{\"arr\": [1, 5, 2, 8, 3], \"K\": 2}",
      "sampleOutput": "8"
    },
    "language": "python",
    "starterCode": "def divide_and_conquer_dp(arr, K):\n    # Implement D&C DP optimization\n    pass",
    "hints": [
      "opt(i, j-1) <= opt(i, j) <= opt(i, j+1).",
      "Compute middle element dp(i, mid) first then recurse on left and right bounds."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"K\": 2}",
        "expectedOutput": "8"
      }
    ],
    "tags": [
      "competitive-programming",
      "dp-optimization",
      "algorithms"
    ]
  },
  {
    "id": "cp-18",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "3D Spatial Sweep-Line Convex Hull",
    "prompt": "Compute the 3D Convex Hull of N spatial points in O(N log N) using a sweep-line algorithm.",
    "details": {
      "inputFormat": "Array of 3D points [x, y, z].",
      "outputFormat": "List of triangular faces [p1, p2, p3].",
      "constraints": "4 <= N <= 5000",
      "sampleInput": "{\"points\": [[0,0,0], [1,0,0], [0,1,0], [0,0,1]]}",
      "sampleOutput": "4"
    },
    "language": "python",
    "starterCode": "def convex_hull_3d(points):\n    # Reconstruct 3D convex hull faces\n    pass",
    "hints": [
      "Check orientation using 4x4 determinant of point coordinates.",
      "Maintain horizon of visible facets."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "competitive-programming",
      "geometry",
      "sweep-line"
    ]
  },
  {
    "id": "cp-19",
    "category": "Competitive Programming",
    "difficulty": 7,
    "title": "Gaussian Elimination modulo 2 (Bitset XOR System)",
    "prompt": "Solve a system of N linear XOR equations with N variables over GF(2) in O(N^3 / 64) time using 64-bit bitset operations.",
    "details": {
      "inputFormat": "System of bitmask rows and target vector.",
      "outputFormat": "Solution bitmask or -1 if inconsistent.",
      "constraints": "1 <= N <= 2000",
      "sampleInput": "{\"matrix\": [1, 2, 3], \"target\": [1, 0, 1]}",
      "sampleOutput": "[1, 0, 0]"
    },
    "language": "javascript",
    "starterCode": "function solveXORGaussian(matrix, target) {\n  // Bitset row reduction\n}",
    "hints": [
      "Use Bitwise XOR (^) to eliminate pivot bits.",
      "Swap pivot rows to maximize rank."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"matrix\":[1]}",
        "expectedOutput": "[1]"
      }
    ],
    "tags": [
      "competitive-programming",
      "gaussian-elimination",
      "math"
    ]
  },
  {
    "id": "cp-20",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Dominator Tree Construction (Lengauer-Tarjan)",
    "prompt": "Build the Dominator Tree of a directed graph from root entry in O(E log V) time using Lengauer-Tarjan semi-dominator evaluation.",
    "details": {
      "inputFormat": "Directed graph edges, root node.",
      "outputFormat": "Immediate Dominator (idom) parent array.",
      "constraints": "1 <= V, E <= 10^5",
      "sampleInput": "{\"edges\": [[0,1],[0,2],[1,3],[2,3]], \"root\": 0}",
      "sampleOutput": "[-1, 0, 0, 0]"
    },
    "language": "python",
    "starterCode": "def lengauer_tarjan_dominators(edges, root):\n    # Construct Lengauer-Tarjan Dominator Tree\n    pass",
    "hints": [
      "DFS tree order determines semi-dominators sdom(v).",
      "Use Disjoint Set Union with path compression to evaluate minimum sdom on path."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "competitive-programming",
      "dominator-tree",
      "graphs"
    ]
  },
  {
    "id": "beg-01",
    "category": "Algorithms",
    "difficulty": 1,
    "title": "Array Sum & Average Calculator",
    "prompt": "Given an array of integers, compute the total sum and floating-point average.",
    "details": {
      "inputFormat": "Array of integers `nums`.",
      "outputFormat": "Object `{ sum: number, avg: number }`.",
      "constraints": "1 <= N <= 1000",
      "sampleInput": "[1, 2, 3, 4, 5]",
      "sampleOutput": "{\"sum\": 15, \"avg\": 3.0}"
    },
    "language": "javascript",
    "starterCode": "function computeSumAndAvg(nums) {\n  // Compute sum and average\n}",
    "hints": [
      "Sum all elements using a loop or reduce.",
      "Divide total sum by nums.length."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[1,2,3,4,5]",
        "expectedOutput": "{\"sum\":15,\"avg\":3}"
      }
    ],
    "tags": [
      "beginner",
      "array",
      "math"
    ]
  },
  {
    "id": "beg-02",
    "category": "Algorithms",
    "difficulty": 1,
    "title": "Reverse String Character Buffer",
    "prompt": "Write a function `reverseString(s)` that reverses an input string in-place or using pointer manipulation.",
    "details": {
      "inputFormat": "String `s`.",
      "outputFormat": "Reversed string.",
      "constraints": "1 <= |s| <= 10^4",
      "sampleInput": "\"hello\"",
      "sampleOutput": "\"olleh\""
    },
    "language": "python",
    "starterCode": "def reverseString(s):\n    return s[::-1]",
    "hints": [
      "Use two pointers starting at opposite ends.",
      "In Python, slice with step -1 or reversed()."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"hello\"",
        "expectedOutput": "\"olleh\""
      }
    ],
    "tags": [
      "beginner",
      "string",
      "pointers"
    ]
  },
  {
    "id": "beg-03",
    "category": "Algorithms",
    "difficulty": 1,
    "title": "FizzBuzz Sequence Generator",
    "prompt": "Return an array of string representations of numbers from 1 to N with FizzBuzz rules.",
    "details": {
      "inputFormat": "Integer N.",
      "outputFormat": "Array of string elements.",
      "constraints": "1 <= N <= 100",
      "sampleInput": "15",
      "sampleOutput": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\",\"Fizz\",\"7\",\"8\",\"Fizz\",\"Buzz\",\"11\",\"Fizz\",\"13\",\"14\",\"FizzBuzz\"]"
    },
    "language": "javascript",
    "starterCode": "function fizzBuzz(n) {\n  // Generate FizzBuzz sequence\n}",
    "hints": [
      "Check i % 15 === 0 first before i % 3 or i % 5."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "3",
        "expectedOutput": "[\"1\",\"2\",\"Fizz\"]"
      }
    ],
    "tags": [
      "beginner",
      "logic"
    ]
  },
  {
    "id": "beg-04",
    "category": "Algorithms",
    "difficulty": 2,
    "title": "Palindrome String Verifier",
    "prompt": "Check whether an alphanumeric string is a palindrome, ignoring non-alphanumeric characters and case.",
    "details": {
      "inputFormat": "String `s`.",
      "outputFormat": "Boolean true/false.",
      "constraints": "1 <= |s| <= 10^5",
      "sampleInput": "\"A man, a plan, a canal: Panama\"",
      "sampleOutput": "true"
    },
    "language": "python",
    "starterCode": "def isPalindrome(s):\n    cleaned = ''.join(c.lower() for c in s if c.isalnum())\n    return cleaned == cleaned[::-1]",
    "hints": [
      "Filter out non-alphanumeric characters.",
      "Convert to lower case before checking equality."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"race a car\"",
        "expectedOutput": "false"
      }
    ],
    "tags": [
      "easy",
      "string",
      "two-pointers"
    ]
  },
  {
    "id": "beg-05",
    "category": "Algorithms",
    "difficulty": 2,
    "title": "Two Sum Hash Map Lookup",
    "prompt": "Find indices of the two numbers in an array that add up to a target integer in O(N) time.",
    "details": {
      "inputFormat": "Array `nums`, integer `target`.",
      "outputFormat": "Array `[index1, index2]`.",
      "constraints": "2 <= N <= 10^4",
      "sampleInput": "{\"nums\": [2, 7, 11, 15], \"target\": 9}",
      "sampleOutput": "[0, 1]"
    },
    "language": "javascript",
    "starterCode": "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n}",
    "hints": [
      "Use a hash map to store seen values and their array indices.",
      "Check if complement (target - num) exists in hash map."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"nums\":[2,7,11,15],\"target\":9}",
        "expectedOutput": "[0,1]"
      }
    ],
    "tags": [
      "easy",
      "hash-map",
      "array"
    ]
  },
  {
    "id": "beg-06",
    "category": "Algorithms",
    "difficulty": 2,
    "title": "Valid Parentheses Stack Checker",
    "prompt": "Determine if an input string containing '()', '{}', and '[]' has valid bracket matching order.",
    "details": {
      "inputFormat": "String `s`.",
      "outputFormat": "Boolean true/false.",
      "constraints": "1 <= |s| <= 10^4",
      "sampleInput": "\"()[]{}\"",
      "sampleOutput": "true"
    },
    "language": "python",
    "starterCode": "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top: return False\n        else:\n            stack.append(char)\n    return not stack",
    "hints": [
      "Push opening brackets to stack.",
      "Pop and match top of stack when encountering a closing bracket."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"(]\"",
        "expectedOutput": "false"
      }
    ],
    "tags": [
      "easy",
      "stack",
      "strings"
    ]
  },
  {
    "id": "beg-07",
    "category": "Algorithms",
    "difficulty": 2,
    "title": "Find Maximum Subarray Sum (Kadane)",
    "prompt": "Find the contiguous subarray with the largest sum and return its sum.",
    "details": {
      "inputFormat": "Array of integers `nums`.",
      "outputFormat": "Integer maximum sum.",
      "constraints": "1 <= N <= 10^5",
      "sampleInput": "[-2,1,-3,4,-1,2,1,-5,4]",
      "sampleOutput": "6"
    },
    "language": "javascript",
    "starterCode": "function maxSubArray(nums) {\n  let maxSoFar = nums[0], currMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currMax = Math.max(nums[i], currMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currMax);\n  }\n  return maxSoFar;\n}",
    "hints": [
      "Kadane's algorithm: currMax = max(nums[i], currMax + nums[i])."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[-2,1,-3,4,-1,2,1,-5,4]",
        "expectedOutput": "6"
      }
    ],
    "tags": [
      "easy",
      "dp",
      "kadane"
    ]
  },
  {
    "id": "beg-08",
    "category": "Algorithms",
    "difficulty": 3,
    "title": "Binary Search Integer Logarithm",
    "prompt": "Search for a target value in a sorted integer array in O(log N) logarithmic time.",
    "details": {
      "inputFormat": "Sorted array `nums`, target `target`.",
      "outputFormat": "Index integer or -1 if not found.",
      "constraints": "1 <= N <= 10^5",
      "sampleInput": "{\"nums\": [-1,0,3,5,9,12], \"target\": 9}",
      "sampleOutput": "4"
    },
    "language": "python",
    "starterCode": "def binarySearch(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1",
    "hints": [
      "Maintain low and high pointers.",
      "mid = low + (high - low) // 2."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"nums\":[-1,0,3,5,9,12],\"target\":9}",
        "expectedOutput": "4"
      }
    ],
    "tags": [
      "easy-mid",
      "binary-search"
    ]
  },
  {
    "id": "beg-09",
    "category": "Algorithms",
    "difficulty": 3,
    "title": "Merge Two Sorted Arrays",
    "prompt": "Merge two sorted integer arrays into a single sorted array.",
    "details": {
      "inputFormat": "Two sorted arrays `arr1`, `arr2`.",
      "outputFormat": "Single merged sorted array.",
      "constraints": "0 <= N, M <= 10^4",
      "sampleInput": "{\"arr1\": [1, 3, 5], \"arr2\": [2, 4, 6]}",
      "sampleOutput": "[1, 2, 3, 4, 5, 6]"
    },
    "language": "javascript",
    "starterCode": "function mergeSortedArrays(arr1, arr2) {\n  let res = [], i = 0, j = 0;\n  while (i < arr1.length && j < arr2.length) {\n    if (arr1[i] < arr2[j]) res.push(arr1[i++]);\n    else res.push(arr2[j++]);\n  }\n  return res.concat(arr1.slice(i)).concat(arr2.slice(j));\n}",
    "hints": [
      "Use two pointers i and j.",
      "Append smaller element and advance corresponding pointer."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"arr1\":[1,3,5],\"arr2\":[2,4,6]}",
        "expectedOutput": "[1,2,3,4,5,6]"
      }
    ],
    "tags": [
      "easy-mid",
      "sorting",
      "two-pointers"
    ]
  },
  {
    "id": "beg-10",
    "category": "Algorithms",
    "difficulty": 3,
    "title": "Anagram Frequency Counter",
    "prompt": "Determine if string `t` is an anagram of string `s` using character frequency counting.",
    "details": {
      "inputFormat": "Strings `s` and `t`.",
      "outputFormat": "Boolean true/false.",
      "constraints": "1 <= |s|, |t| <= 5*10^4",
      "sampleInput": "{\"s\": \"anagram\", \"t\": \"nagaram\"}",
      "sampleOutput": "true"
    },
    "language": "python",
    "starterCode": "def isAnagram(s, t):\n    if len(s) != len(t): return False\n    count = {}\n    for char in s: count[char] = count.get(char, 0) + 1\n    for char in t:\n        if char not in count or count[char] == 0: return False\n        count[char] -= 1\n    return True",
    "hints": [
      "If lengths differ, return false immediately.",
      "Count character frequencies with hash map."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"s\":\"rat\",\"t\":\"car\"}",
        "expectedOutput": "false"
      }
    ],
    "tags": [
      "easy-mid",
      "strings",
      "hash-table"
    ]
  },
  {
    "id": "beg-11",
    "category": "Algorithms",
    "difficulty": 3,
    "title": "Climbing Stairs Fibonacci DP",
    "prompt": "You are climbing a staircase with N steps. Each time you take 1 or 2 steps. How many distinct ways can you reach the top?",
    "details": {
      "inputFormat": "Integer N.",
      "outputFormat": "Integer ways.",
      "constraints": "1 <= N <= 45",
      "sampleInput": "3",
      "sampleOutput": "3"
    },
    "language": "javascript",
    "starterCode": "function climbStairs(n) {\n  if (n <= 2) return n;\n  let first = 1, second = 2;\n  for (let i = 3; i <= n; i++) {\n    let third = first + second;\n    first = second;\n    second = third;\n  }\n  return second;\n}",
    "hints": [
      "dp[i] = dp[i-1] + dp[i-2].",
      "Optimize space to O(1) using two variables."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "3",
        "expectedOutput": "3"
      }
    ],
    "tags": [
      "easy-mid",
      "dp",
      "fibonacci"
    ]
  },
  {
    "id": "beg-12",
    "category": "Algorithms",
    "difficulty": 3,
    "title": "Move Zeroes to End of Array",
    "prompt": "Move all 0's to the end of an array while maintaining the relative order of non-zero elements.",
    "details": {
      "inputFormat": "Array `nums`.",
      "outputFormat": "Modified array.",
      "constraints": "1 <= N <= 10^4",
      "sampleInput": "[0, 1, 0, 3, 12]",
      "sampleOutput": "[1, 3, 12, 0, 0]"
    },
    "language": "python",
    "starterCode": "def moveZeroes(nums):\n    lastNonZero = 0\n    for i in range(len(nums)):\n        if nums[i] != 0:\n            nums[lastNonZero], nums[i] = nums[i], nums[lastNonZero]\n            lastNonZero += 1\n    return nums",
    "hints": [
      "Maintain lastNonZeroPointer.",
      "Swap non-zero elements forward."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[0,1,0,3,12]",
        "expectedOutput": "[1,3,12,0,0]"
      }
    ],
    "tags": [
      "easy-mid",
      "two-pointers"
    ]
  },
  {
    "id": "beg-13",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Longest Common Prefix Finder",
    "prompt": "Write a function to find the longest common prefix string among an array of strings.",
    "details": {
      "inputFormat": "Array of strings `strs`.",
      "outputFormat": "String prefix.",
      "constraints": "1 <= |strs| <= 200",
      "sampleInput": "[\"flower\",\"flow\",\"flight\"]",
      "sampleOutput": "\"fl\""
    },
    "language": "javascript",
    "starterCode": "function longestCommonPrefix(strs) {\n  if (!strs.length) return '';\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    while (strs[i].indexOf(prefix) !== 0) {\n      prefix = prefix.substring(0, prefix.length - 1);\n      if (!prefix) return '';\n    }\n  }\n  return prefix;\n}",
    "hints": [
      "Take first string as initial prefix.",
      "Trim prefix until all strings match starting prefix."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[\"flower\",\"flow\",\"flight\"]",
        "expectedOutput": "\"fl\""
      }
    ],
    "tags": [
      "intermediate",
      "strings"
    ]
  },
  {
    "id": "beg-14",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Rotate Array k Steps",
    "prompt": "Rotate an array to the right by K steps, where K is non-negative.",
    "details": {
      "inputFormat": "Array `nums`, integer `k`.",
      "outputFormat": "Rotated array.",
      "constraints": "1 <= N <= 10^5",
      "sampleInput": "{\"nums\": [1, 2, 3, 4, 5, 6, 7], \"k\": 3}",
      "sampleOutput": "[5, 6, 7, 1, 2, 3, 4]"
    },
    "language": "python",
    "starterCode": "def rotateArray(nums, k):\n    n = len(nums)\n    k %= n\n    return nums[-k:] + nums[:-k]",
    "hints": [
      "k = k % N.",
      "Reverse entire array, then reverse first K elements, then remaining."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"nums\":[1,2,3,4,5,6,7],\"k\":3}",
        "expectedOutput": "[5,6,7,1,2,3,4]"
      }
    ],
    "tags": [
      "intermediate",
      "array"
    ]
  },
  {
    "id": "beg-15",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Product of Array Except Self",
    "prompt": "Return an array `output` such that `output[i]` is equal to the product of all elements of `nums` except `nums[i]` in O(N) time without division.",
    "details": {
      "inputFormat": "Array `nums`.",
      "outputFormat": "Array of products.",
      "constraints": "2 <= N <= 10^5",
      "sampleInput": "[1, 2, 3, 4]",
      "sampleOutput": "[24, 12, 8, 6]"
    },
    "language": "javascript",
    "starterCode": "function productExceptSelf(nums) {\n  const n = nums.length;\n  const res = new Array(n).fill(1);\n  let left = 1, right = 1;\n  for (let i = 0; i < n; i++) { res[i] *= left; left *= nums[i]; }\n  for (let i = n - 1; i >= 0; i--) { res[i] *= right; right *= nums[i]; }\n  return res;\n}",
    "hints": [
      "Compute prefix products in forward pass.",
      "Multiply by suffix products in backward pass."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[1,2,3,4]",
        "expectedOutput": "[24,12,8,6]"
      }
    ],
    "tags": [
      "intermediate",
      "prefix-sum"
    ]
  },
  {
    "id": "beg-16",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Group Anagrams Hash Map Bucket",
    "prompt": "Group an array of strings into anagram sets.",
    "details": {
      "inputFormat": "Array of strings `strs`.",
      "outputFormat": "Nested array of grouped anagrams.",
      "constraints": "1 <= N <= 10^4",
      "sampleInput": "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
      "sampleOutput": "[[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]"
    },
    "language": "python",
    "starterCode": "def groupAnagrams(strs):\n    from collections import defaultdict\n    ans = defaultdict(list)\n    for s in strs:\n        ans[tuple(sorted(s))].append(s)\n    return list(ans.values())",
    "hints": [
      "Use sorted string as hash map key.",
      "Collect matching anagrams into list buckets."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "intermediate",
      "hash-map",
      "strings"
    ]
  },
  {
    "id": "beg-17",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Subarray Sum Equals K (Prefix Hash)",
    "prompt": "Find total number of continuous subarrays whose sum equals K.",
    "details": {
      "inputFormat": "Array `nums`, integer `k`.",
      "outputFormat": "Integer total count.",
      "constraints": "1 <= N <= 2*10^4",
      "sampleInput": "{\"nums\": [1, 1, 1], \"k\": 2}",
      "sampleOutput": "2"
    },
    "language": "javascript",
    "starterCode": "function subarraySum(nums, k) {\n  let count = 0, sum = 0;\n  const map = new Map([[0, 1]]);\n  for (let num of nums) {\n    sum += num;\n    if (map.has(sum - k)) count += map.get(sum - k);\n    map.set(sum, (map.get(sum) || 0) + 1);\n  }\n  return count;\n}",
    "hints": [
      "Maintain running prefix sum.",
      "Look up (currSum - k) in hash map."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"nums\":[1,1,1],\"k\":2}",
        "expectedOutput": "2"
      }
    ],
    "tags": [
      "intermediate",
      "prefix-sum",
      "hash-map"
    ]
  },
  {
    "id": "beg-18",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Longest Substring Without Repeating Characters",
    "prompt": "Find the length of the longest substring without repeating characters using sliding window.",
    "details": {
      "inputFormat": "String `s`.",
      "outputFormat": "Integer length.",
      "constraints": "0 <= |s| <= 5*10^4",
      "sampleInput": "\"abcabcbb\"",
      "sampleOutput": "3"
    },
    "language": "python",
    "starterCode": "def lengthOfLongestSubstring(s):\n    charMap = {}\n    left = maxLen = 0\n    for right in range(len(s)):\n        if s[right] in charMap:\n            left = max(left, charMap[s[right]] + 1)\n        charMap[s[right]] = right\n        maxLen = max(maxLen, right - left + 1)\n    return maxLen",
    "hints": [
      "Maintain left and right window pointers.",
      "Store last seen index of each character."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"abcabcbb\"",
        "expectedOutput": "3"
      }
    ],
    "tags": [
      "intermediate",
      "sliding-window",
      "strings"
    ]
  },
  {
    "id": "beg-19",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Container With Most Water Two Pointers",
    "prompt": "Find two vertical lines that together with x-axis forms a container that holds the most water.",
    "details": {
      "inputFormat": "Array of heights `height`.",
      "outputFormat": "Maximum water area integer.",
      "constraints": "2 <= N <= 10^5",
      "sampleInput": "[1,8,6,2,5,4,8,3,7]",
      "sampleOutput": "49"
    },
    "language": "javascript",
    "starterCode": "function maxArea(height) {\n  let l = 0, r = height.length - 1, maxA = 0;\n  while (l < r) {\n    let area = Math.min(height[l], height[r]) * (r - l);\n    maxA = Math.max(maxA, area);\n    if (height[l] < height[r]) l++;\n    else r--;\n  }\n  return maxA;\n}",
    "hints": [
      "Two pointers starting at left = 0, right = N - 1.",
      "Move pointer with smaller height inwards."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[1,8,6,2,5,4,8,3,7]",
        "expectedOutput": "49"
      }
    ],
    "tags": [
      "intermediate",
      "two-pointers"
    ]
  },
  {
    "id": "beg-20",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Search in Rotated Sorted Array",
    "prompt": "Search for a target value in a sorted array that has been rotated at an unknown pivot in O(log N) time.",
    "details": {
      "inputFormat": "Rotated sorted array `nums`, integer `target`.",
      "outputFormat": "Index integer or -1.",
      "constraints": "1 <= N <= 5000",
      "sampleInput": "{\"nums\": [4,5,6,7,0,1,2], \"target\": 0}",
      "sampleOutput": "4"
    },
    "language": "python",
    "starterCode": "def searchRotated(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target: return mid\n        if nums[low] <= nums[mid]:\n            if nums[low] <= target < nums[mid]: high = mid - 1\n            else: low = mid + 1\n        else:\n            if nums[mid] < target <= nums[high]: low = mid + 1\n            else: high = mid - 1\n    return -1",
    "hints": [
      "One half (left or right) is always strictly sorted.",
      "Check if target lies within sorted half."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"nums\":[4,5,6,7,0,1,2],\"target\":0}",
        "expectedOutput": "4"
      }
    ],
    "tags": [
      "intermediate",
      "binary-search"
    ]
  },
  {
    "id": "beg-21",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Find First and Last Position of Element in Sorted Array",
    "prompt": "Find the starting and ending position of a given target value in a sorted array in O(log N) time.",
    "details": {
      "inputFormat": "Sorted array `nums`, integer `target`.",
      "outputFormat": "Array `[start, end]`.",
      "constraints": "0 <= N <= 10^5",
      "sampleInput": "{\"nums\": [5,7,7,8,8,10], \"target\": 8}",
      "sampleOutput": "[3, 4]"
    },
    "language": "javascript",
    "starterCode": "function searchRange(nums, target) {\n  const findBound = (isFirst) => {\n    let l = 0, r = nums.length - 1, ans = -1;\n    while (l <= r) {\n      let mid = Math.floor((l + r) / 2);\n      if (nums[mid] === target) {\n        ans = mid;\n        if (isFirst) r = mid - 1;\n        else l = mid + 1;\n      } else if (nums[mid] < target) l = mid + 1;\n      else r = mid - 1;\n    }\n    return ans;\n  };\n  return [findBound(true), findBound(false)];\n}",
    "hints": [
      "Run two binary searches: one for lower bound, one for upper bound."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"nums\":[5,7,7,8,8,10],\"target\":8}",
        "expectedOutput": "[3,4]"
      }
    ],
    "tags": [
      "intermediate",
      "binary-search"
    ]
  },
  {
    "id": "beg-22",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Find Peak Element",
    "prompt": "A peak element is an element that is strictly greater than its neighbors. Find a peak element index in O(log N) time.",
    "details": {
      "inputFormat": "Array of integers `nums`.",
      "outputFormat": "Peak index integer.",
      "constraints": "1 <= N <= 1000",
      "sampleInput": "[1, 2, 3, 1]",
      "sampleOutput": "2"
    },
    "language": "python",
    "starterCode": "def findPeakElement(nums):\n    low, high = 0, len(nums) - 1\n    while low < high:\n        mid = (low + high) // 2\n        if nums[mid] > nums[mid + 1]: high = mid\n        else: low = mid + 1\n    return low",
    "hints": [
      "Binary search: if nums[mid] < nums[mid+1], a peak lies to the right."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[1,2,3,1]",
        "expectedOutput": "2"
      }
    ],
    "tags": [
      "intermediate",
      "binary-search"
    ]
  },
  {
    "id": "beg-23",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Min Stack Constant O(1) Operations",
    "prompt": "Design a stack that supports push, pop, top, and retrieving the minimum element in O(1) constant time.",
    "details": {
      "inputFormat": "Stack operation list.",
      "outputFormat": "Array of returned values.",
      "constraints": "-2^31 <= val <= 2^31 - 1",
      "sampleInput": "[\"push\", -2, \"push\", 0, \"push\", -3, \"getMin\", \"pop\", \"top\", \"getMin\"]",
      "sampleOutput": "[-3, 0, -2]"
    },
    "language": "javascript",
    "starterCode": "class MinStack {\n  constructor() {\n    this.stack = [];\n    this.minStack = [];\n  }\n  push(val) {\n    this.stack.push(val);\n    const currMin = this.minStack.length ? Math.min(val, this.minStack[this.minStack.length - 1]) : val;\n    this.minStack.push(currMin);\n  }\n  pop() { this.stack.pop(); this.minStack.pop(); }\n  top() { return this.stack[this.stack.length - 1]; }\n  getMin() { return this.minStack[this.minStack.length - 1]; }\n}",
    "hints": [
      "Maintain a parallel minStack storing running minimums."
    ],
    "evalMode": "ai-graded",
    "tags": [
      "intermediate",
      "stack",
      "data-structures"
    ]
  },
  {
    "id": "beg-24",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Spiral Matrix Order Traversal",
    "prompt": "Given an M x N matrix, return all elements of the matrix in spiral order.",
    "details": {
      "inputFormat": "2D matrix array.",
      "outputFormat": "1D array of spiral elements.",
      "constraints": "1 <= M, N <= 10",
      "sampleInput": "[[1,2,3],[4,5,6],[7,8,9]]",
      "sampleOutput": "[1,2,3,6,9,8,7,4,5]"
    },
    "language": "python",
    "starterCode": "def spiralOrder(matrix):\n    res = []\n    top, bottom = 0, len(matrix) - 1\n    left, right = 0, len(matrix[0]) - 1\n    while top <= bottom and left <= right:\n        for i in range(left, right + 1): res.append(matrix[top][i])\n        top += 1\n        for i in range(top, bottom + 1): res.append(matrix[i][right])\n        right -= 1\n        if top <= bottom:\n            for i in range(right, left - 1, -1): res.append(matrix[bottom][i])\n            bottom -= 1\n        if left <= right:\n            for i in range(bottom, top - 1, -1): res.append(matrix[i][left])\n            left += 1\n    return res",
    "hints": [
      "Maintain top, bottom, left, right boundary pointers."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[[1,2,3],[4,5,6],[7,8,9]]",
        "expectedOutput": "[1,2,3,6,9,8,7,4,5]"
      }
    ],
    "tags": [
      "intermediate",
      "matrix"
    ]
  },
  {
    "id": "beg-25",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Rotate Image 90 Degrees In-Place",
    "prompt": "Rotate an N x N 2D matrix by 90 degrees clockwise in-place.",
    "details": {
      "inputFormat": "N x N 2D array.",
      "outputFormat": "Rotated 2D array.",
      "constraints": "1 <= N <= 20",
      "sampleInput": "[[1,2],[3,4]]",
      "sampleOutput": "[[3,1],[4,2]]"
    },
    "language": "javascript",
    "starterCode": "function rotateMatrix(matrix) {\n  const n = matrix.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = i; j < n; j++) {\n      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];\n    }\n  }\n  for (let i = 0; i < n; i++) matrix[i].reverse();\n  return matrix;\n}",
    "hints": [
      "First transpose the matrix (swap row & column indices).",
      "Then reverse each row horizontally."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[[1,2],[3,4]]",
        "expectedOutput": "[[3,1],[4,2]]"
      }
    ],
    "tags": [
      "intermediate",
      "matrix"
    ]
  },
  {
    "id": "beg-26",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Word Pattern Key Mapper",
    "prompt": "Given a pattern and a string s, find if s follows the same pattern bijectively.",
    "details": {
      "inputFormat": "String `pattern`, string `s`.",
      "outputFormat": "Boolean true/false.",
      "constraints": "1 <= |pattern| <= 300",
      "sampleInput": "{\"pattern\": \"abba\", \"s\": \"dog cat cat dog\"}",
      "sampleOutput": "true"
    },
    "language": "python",
    "starterCode": "def wordPattern(pattern, s):\n    words = s.split()\n    if len(pattern) != len(words): return False\n    p2w, w2p = {}, {}\n    for p, w in zip(pattern, words):\n        if p in p2w and p2w[p] != w: return False\n        if w in w2p and w2p[w] != p: return False\n        p2w[p] = w\n        w2p[w] = p\n    return True",
    "hints": [
      "Use two hash maps to check bi-directional bijection."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"pattern\":\"abba\",\"s\":\"dog cat cat dog\"}",
        "expectedOutput": "true"
      }
    ],
    "tags": [
      "intermediate",
      "hash-map",
      "strings"
    ]
  },
  {
    "id": "beg-27",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Longest Consecutive Sequence Hash Set",
    "prompt": "Given an unsorted array of integers, find the length of the longest consecutive elements sequence in O(N) time.",
    "details": {
      "inputFormat": "Array `nums`.",
      "outputFormat": "Integer length.",
      "constraints": "0 <= N <= 10^5",
      "sampleInput": "[100, 4, 200, 1, 3, 2]",
      "sampleOutput": "4"
    },
    "language": "javascript",
    "starterCode": "function longestConsecutive(nums) {\n  const set = new Set(nums);\n  let maxLen = 0;\n  for (let num of set) {\n    if (!set.has(num - 1)) {\n      let curr = num, len = 1;\n      while (set.has(curr + 1)) { curr++; len++; }\n      maxLen = Math.max(maxLen, len);\n    }\n  }\n  return maxLen;\n}",
    "hints": [
      "Convert array to Hash Set.",
      "Only start counting sequence if (num - 1) is NOT in set."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[100,4,200,1,3,2]",
        "expectedOutput": "4"
      }
    ],
    "tags": [
      "intermediate",
      "hash-set"
    ]
  },
  {
    "id": "beg-28",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Coin Change Minimum Count DP",
    "prompt": "Find the fewest number of coins needed to make up a target amount.",
    "details": {
      "inputFormat": "Array `coins`, integer `amount`.",
      "outputFormat": "Fewest coins integer or -1.",
      "constraints": "1 <= coins.length <= 12",
      "sampleInput": "{\"coins\": [1, 2, 5], \"amount\": 11}",
      "sampleOutput": "3"
    },
    "language": "python",
    "starterCode": "def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for coin in coins:\n        for x in range(coin, amount + 1):\n            dp[x] = min(dp[x], dp[x - coin] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
    "hints": [
      "dp[i] = min(dp[i], dp[i - coin] + 1).",
      "Initialize dp array with infinity."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"coins\":[1,2,5],\"amount\":11}",
        "expectedOutput": "3"
      }
    ],
    "tags": [
      "intermediate",
      "dp"
    ]
  },
  {
    "id": "beg-29",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "House Robber Max Value DP",
    "prompt": "You are planning to rob houses along a street. Adjacent houses have security systems. Return maximum money you can rob.",
    "details": {
      "inputFormat": "Array `nums`.",
      "outputFormat": "Maximum money integer.",
      "constraints": "1 <= N <= 100",
      "sampleInput": "[2, 7, 9, 3, 1]",
      "sampleOutput": "12"
    },
    "language": "javascript",
    "starterCode": "function rob(nums) {\n  let prev1 = 0, prev2 = 0;\n  for (let num of nums) {\n    let tmp = Math.max(prev1, prev2 + num);\n    prev2 = prev1;\n    prev1 = tmp;\n  }\n  return prev1;\n}",
    "hints": [
      "dp[i] = max(dp[i-1], dp[i-2] + nums[i])."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "[2,7,9,3,1]",
        "expectedOutput": "12"
      }
    ],
    "tags": [
      "intermediate",
      "dp"
    ]
  },
  {
    "id": "beg-30",
    "category": "Algorithms",
    "difficulty": 4,
    "title": "Decode Ways String Partitioning DP",
    "prompt": "A message containing letters A-Z is encoded to numbers '1'-'26'. Return the number of ways to decode it.",
    "details": {
      "inputFormat": "String `s`.",
      "outputFormat": "Number of ways integer.",
      "constraints": "1 <= |s| <= 100",
      "sampleInput": "\"226\"",
      "sampleOutput": "3"
    },
    "language": "python",
    "starterCode": "def numDecodings(s):\n    if not s or s[0] == '0': return 0\n    dp = [0] * (len(s) + 1)\n    dp[0] = dp[1] = 1\n    for i in range(2, len(s) + 1):\n        if s[i-1] != '0': dp[i] += dp[i-1]\n        two_digit = int(s[i-2:i])\n        if 10 <= two_digit <= 26: dp[i] += dp[i-2]\n    return dp[len(s)]",
    "hints": [
      "Check single digit valid (1-9) and two digits valid (10-26)."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "\"226\"",
        "expectedOutput": "3"
      }
    ],
    "tags": [
      "intermediate",
      "dp",
      "strings"
    ]
  },
  {
    "id": "alg-comp-100",
    "category": "Algorithms",
    "difficulty": 5,
    "title": "Subset Sum Bitset Acceleration",
    "prompt": "Reconstruct and optimize Subset Sum Bitset Acceleration under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Subset Sum Bitset Acceleration.",
      "outputFormat": "Validated output structure or computed result for Subset Sum Bitset Acceleration.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_subset_sum_bitset_acceleration(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-101",
    "category": "Competitive Programming",
    "difficulty": 6,
    "title": "Longest Palindromic Subsequence Space Opt",
    "prompt": "Reconstruct and optimize Longest Palindromic Subsequence Space Opt under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Longest Palindromic Subsequence Space Opt.",
      "outputFormat": "Validated output structure or computed result for Longest Palindromic Subsequence Space Opt.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_longest_palindromic_subsequence_space_opt(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-102",
    "category": "System Design",
    "difficulty": 7,
    "title": "Matrix Chain Multiplication & Parenthesization",
    "prompt": "Reconstruct and optimize Matrix Chain Multiplication & Parenthesization under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Matrix Chain Multiplication & Parenthesization.",
      "outputFormat": "Validated output structure or computed result for Matrix Chain Multiplication & Parenthesization.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_matrix_chain_multiplication___parenthesization(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-103",
    "category": "Debugging",
    "difficulty": 8,
    "title": "Damerau-Levenshtein Edit Distance Engine",
    "prompt": "Reconstruct and optimize Damerau-Levenshtein Edit Distance Engine under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Damerau-Levenshtein Edit Distance Engine.",
      "outputFormat": "Validated output structure or computed result for Damerau-Levenshtein Edit Distance Engine.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_damerau_levenshtein_edit_distance_engine(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-104",
    "category": "Reverse Engineering",
    "difficulty": 5,
    "title": "TSP Shortest Tour via Held-Karp Bitmask DP",
    "prompt": "Reconstruct and optimize TSP Shortest Tour via Held-Karp Bitmask DP under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for TSP Shortest Tour via Held-Karp Bitmask DP.",
      "outputFormat": "Validated output structure or computed result for TSP Shortest Tour via Held-Karp Bitmask DP.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_tsp_shortest_tour_via_held_karp_bitmask_dp(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-105",
    "category": "Read & Reconstruct",
    "difficulty": 6,
    "title": "Multi-Constraint 0/1 Knapsack Engine",
    "prompt": "Reconstruct and optimize Multi-Constraint 0/1 Knapsack Engine under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Multi-Constraint 0/1 Knapsack Engine.",
      "outputFormat": "Validated output structure or computed result for Multi-Constraint 0/1 Knapsack Engine.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_multi_constraint_0_1_knapsack_engine(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-106",
    "category": "Algorithms",
    "difficulty": 7,
    "title": "Tree Maximum Weighted Independent Set",
    "prompt": "Reconstruct and optimize Tree Maximum Weighted Independent Set under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Tree Maximum Weighted Independent Set.",
      "outputFormat": "Validated output structure or computed result for Tree Maximum Weighted Independent Set.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_tree_maximum_weighted_independent_set(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-107",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Knuth Quadrangle Optimal BST",
    "prompt": "Reconstruct and optimize Knuth Quadrangle Optimal BST under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Knuth Quadrangle Optimal BST.",
      "outputFormat": "Validated output structure or computed result for Knuth Quadrangle Optimal BST.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_knuth_quadrangle_optimal_bst(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-108",
    "category": "System Design",
    "difficulty": 5,
    "title": "Wildcard Parentheses Validity Matcher",
    "prompt": "Reconstruct and optimize Wildcard Parentheses Validity Matcher under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Wildcard Parentheses Validity Matcher.",
      "outputFormat": "Validated output structure or computed result for Wildcard Parentheses Validity Matcher.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_wildcard_parentheses_validity_matcher(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-109",
    "category": "Debugging",
    "difficulty": 6,
    "title": "3-String Longest Common Subsequence",
    "prompt": "Reconstruct and optimize 3-String Longest Common Subsequence under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for 3-String Longest Common Subsequence.",
      "outputFormat": "Validated output structure or computed result for 3-String Longest Common Subsequence.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_3_string_longest_common_subsequence(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-110",
    "category": "Reverse Engineering",
    "difficulty": 7,
    "title": "Minimum Difference Subset Partitioning",
    "prompt": "Reconstruct and optimize Minimum Difference Subset Partitioning under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Minimum Difference Subset Partitioning.",
      "outputFormat": "Validated output structure or computed result for Minimum Difference Subset Partitioning.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_minimum_difference_subset_partitioning(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-111",
    "category": "Read & Reconstruct",
    "difficulty": 8,
    "title": "Maximum Subarray Sum with Element Deletion",
    "prompt": "Reconstruct and optimize Maximum Subarray Sum with Element Deletion under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Maximum Subarray Sum with Element Deletion.",
      "outputFormat": "Validated output structure or computed result for Maximum Subarray Sum with Element Deletion.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_maximum_subarray_sum_with_element_deletion(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-112",
    "category": "Algorithms",
    "difficulty": 5,
    "title": "Burst Balloons Max Coin Interval DP",
    "prompt": "Reconstruct and optimize Burst Balloons Max Coin Interval DP under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Burst Balloons Max Coin Interval DP.",
      "outputFormat": "Validated output structure or computed result for Burst Balloons Max Coin Interval DP.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_burst_balloons_max_coin_interval_dp(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-113",
    "category": "Competitive Programming",
    "difficulty": 6,
    "title": "Word Break II Sentence Reconstruction",
    "prompt": "Reconstruct and optimize Word Break II Sentence Reconstruction under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Word Break II Sentence Reconstruction.",
      "outputFormat": "Validated output structure or computed result for Word Break II Sentence Reconstruction.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_word_break_ii_sentence_reconstruction(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-114",
    "category": "System Design",
    "difficulty": 7,
    "title": "Interleaving String Multi-Pointer Matching",
    "prompt": "Reconstruct and optimize Interleaving String Multi-Pointer Matching under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Interleaving String Multi-Pointer Matching.",
      "outputFormat": "Validated output structure or computed result for Interleaving String Multi-Pointer Matching.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_interleaving_string_multi_pointer_matching(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-115",
    "category": "Debugging",
    "difficulty": 8,
    "title": "Tarjan Strongly Connected Components (SCC)",
    "prompt": "Reconstruct and optimize Tarjan Strongly Connected Components (SCC) under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Tarjan Strongly Connected Components (SCC).",
      "outputFormat": "Validated output structure or computed result for Tarjan Strongly Connected Components (SCC).",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_tarjan_strongly_connected_components__scc_(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-116",
    "category": "Reverse Engineering",
    "difficulty": 5,
    "title": "Dinic Maximum Network Flow Engine",
    "prompt": "Reconstruct and optimize Dinic Maximum Network Flow Engine under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Dinic Maximum Network Flow Engine.",
      "outputFormat": "Validated output structure or computed result for Dinic Maximum Network Flow Engine.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_dinic_maximum_network_flow_engine(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-117",
    "category": "Read & Reconstruct",
    "difficulty": 6,
    "title": "Hierholzer Eulerian Circuit Construction",
    "prompt": "Reconstruct and optimize Hierholzer Eulerian Circuit Construction under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Hierholzer Eulerian Circuit Construction.",
      "outputFormat": "Validated output structure or computed result for Hierholzer Eulerian Circuit Construction.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_hierholzer_eulerian_circuit_construction(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-118",
    "category": "Algorithms",
    "difficulty": 7,
    "title": "Johnson All-Pairs Shortest Path Reweighting",
    "prompt": "Reconstruct and optimize Johnson All-Pairs Shortest Path Reweighting under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Johnson All-Pairs Shortest Path Reweighting.",
      "outputFormat": "Validated output structure or computed result for Johnson All-Pairs Shortest Path Reweighting.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_johnson_all_pairs_shortest_path_reweighting(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-119",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Prim Min Spanning Tree with Fibonacci Heap",
    "prompt": "Reconstruct and optimize Prim Min Spanning Tree with Fibonacci Heap under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Prim Min Spanning Tree with Fibonacci Heap.",
      "outputFormat": "Validated output structure or computed result for Prim Min Spanning Tree with Fibonacci Heap.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_prim_min_spanning_tree_with_fibonacci_heap(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-120",
    "category": "System Design",
    "difficulty": 5,
    "title": "Kahn Topological Sort & Cycle Detector",
    "prompt": "Reconstruct and optimize Kahn Topological Sort & Cycle Detector under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Kahn Topological Sort & Cycle Detector.",
      "outputFormat": "Validated output structure or computed result for Kahn Topological Sort & Cycle Detector.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_kahn_topological_sort___cycle_detector(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-121",
    "category": "Debugging",
    "difficulty": 6,
    "title": "Hopcroft-Karp Bipartite Matching",
    "prompt": "Reconstruct and optimize Hopcroft-Karp Bipartite Matching under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Hopcroft-Karp Bipartite Matching.",
      "outputFormat": "Validated output structure or computed result for Hopcroft-Karp Bipartite Matching.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_hopcroft_karp_bipartite_matching(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-122",
    "category": "Reverse Engineering",
    "difficulty": 7,
    "title": "2-SAT Boolean Satisfiability Solver",
    "prompt": "Reconstruct and optimize 2-SAT Boolean Satisfiability Solver under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for 2-SAT Boolean Satisfiability Solver.",
      "outputFormat": "Validated output structure or computed result for 2-SAT Boolean Satisfiability Solver.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_2_sat_boolean_satisfiability_solver(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-123",
    "category": "Read & Reconstruct",
    "difficulty": 8,
    "title": "LCA Binary Lifting Ancestor Table",
    "prompt": "Reconstruct and optimize LCA Binary Lifting Ancestor Table under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for LCA Binary Lifting Ancestor Table.",
      "outputFormat": "Validated output structure or computed result for LCA Binary Lifting Ancestor Table.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_lca_binary_lifting_ancestor_table(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-124",
    "category": "Algorithms",
    "difficulty": 5,
    "title": "Tarjan Bridge & Cut Vertex Detection",
    "prompt": "Reconstruct and optimize Tarjan Bridge & Cut Vertex Detection under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Tarjan Bridge & Cut Vertex Detection.",
      "outputFormat": "Validated output structure or computed result for Tarjan Bridge & Cut Vertex Detection.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_tarjan_bridge___cut_vertex_detection(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-125",
    "category": "Competitive Programming",
    "difficulty": 6,
    "title": "Segment Tree Range Sum with Lazy Propagation",
    "prompt": "Reconstruct and optimize Segment Tree Range Sum with Lazy Propagation under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Segment Tree Range Sum with Lazy Propagation.",
      "outputFormat": "Validated output structure or computed result for Segment Tree Range Sum with Lazy Propagation.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_segment_tree_range_sum_with_lazy_propagation(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-126",
    "category": "System Design",
    "difficulty": 7,
    "title": "Fenwick Tree Range Sum & Point Update",
    "prompt": "Reconstruct and optimize Fenwick Tree Range Sum & Point Update under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Fenwick Tree Range Sum & Point Update.",
      "outputFormat": "Validated output structure or computed result for Fenwick Tree Range Sum & Point Update.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_fenwick_tree_range_sum___point_update(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-127",
    "category": "Debugging",
    "difficulty": 8,
    "title": "Trie Prefix Search with Wildcards",
    "prompt": "Reconstruct and optimize Trie Prefix Search with Wildcards under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Trie Prefix Search with Wildcards.",
      "outputFormat": "Validated output structure or computed result for Trie Prefix Search with Wildcards.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_trie_prefix_search_with_wildcards(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-128",
    "category": "Reverse Engineering",
    "difficulty": 5,
    "title": "Disjoint Set Union (DSU) Compression",
    "prompt": "Reconstruct and optimize Disjoint Set Union (DSU) Compression under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Disjoint Set Union (DSU) Compression.",
      "outputFormat": "Validated output structure or computed result for Disjoint Set Union (DSU) Compression.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_disjoint_set_union__dsu__compression(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-129",
    "category": "Read & Reconstruct",
    "difficulty": 6,
    "title": "Probabilistic Skip List Search Engine",
    "prompt": "Reconstruct and optimize Probabilistic Skip List Search Engine under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Probabilistic Skip List Search Engine.",
      "outputFormat": "Validated output structure or computed result for Probabilistic Skip List Search Engine.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_probabilistic_skip_list_search_engine(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-130",
    "category": "Algorithms",
    "difficulty": 7,
    "title": "Suffix Array & LCP Construction",
    "prompt": "Reconstruct and optimize Suffix Array & LCP Construction under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Suffix Array & LCP Construction.",
      "outputFormat": "Validated output structure or computed result for Suffix Array & LCP Construction.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_suffix_array___lcp_construction(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-131",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "Min-Max Heap Dual Priority Queue",
    "prompt": "Reconstruct and optimize Min-Max Heap Dual Priority Queue under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Min-Max Heap Dual Priority Queue.",
      "outputFormat": "Validated output structure or computed result for Min-Max Heap Dual Priority Queue.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_min_max_heap_dual_priority_queue(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-132",
    "category": "System Design",
    "difficulty": 5,
    "title": "Persistent Segment Tree Version Queries",
    "prompt": "Reconstruct and optimize Persistent Segment Tree Version Queries under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Persistent Segment Tree Version Queries.",
      "outputFormat": "Validated output structure or computed result for Persistent Segment Tree Version Queries.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_persistent_segment_tree_version_queries(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-133",
    "category": "Debugging",
    "difficulty": 6,
    "title": "Bloom Filter Multi-Hash Estimator",
    "prompt": "Reconstruct and optimize Bloom Filter Multi-Hash Estimator under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Bloom Filter Multi-Hash Estimator.",
      "outputFormat": "Validated output structure or computed result for Bloom Filter Multi-Hash Estimator.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_bloom_filter_multi_hash_estimator(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-134",
    "category": "Reverse Engineering",
    "difficulty": 7,
    "title": "Count-Min Sketch Stream Frequency Estimator",
    "prompt": "Reconstruct and optimize Count-Min Sketch Stream Frequency Estimator under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Count-Min Sketch Stream Frequency Estimator.",
      "outputFormat": "Validated output structure or computed result for Count-Min Sketch Stream Frequency Estimator.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_count_min_sketch_stream_frequency_estimator(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-135",
    "category": "Read & Reconstruct",
    "difficulty": 8,
    "title": "Recursive Descent Math AST Compiler",
    "prompt": "Reconstruct and optimize Recursive Descent Math AST Compiler under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Recursive Descent Math AST Compiler.",
      "outputFormat": "Validated output structure or computed result for Recursive Descent Math AST Compiler.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_recursive_descent_math_ast_compiler(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-136",
    "category": "Algorithms",
    "difficulty": 5,
    "title": "Shunting-Yard Infix to RPN Converter",
    "prompt": "Reconstruct and optimize Shunting-Yard Infix to RPN Converter under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Shunting-Yard Infix to RPN Converter.",
      "outputFormat": "Validated output structure or computed result for Shunting-Yard Infix to RPN Converter.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_shunting_yard_infix_to_rpn_converter(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-137",
    "category": "Competitive Programming",
    "difficulty": 6,
    "title": "Memory Allocator Free-List Coalescing (malloc)",
    "prompt": "Reconstruct and optimize Memory Allocator Free-List Coalescing (malloc) under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Memory Allocator Free-List Coalescing (malloc).",
      "outputFormat": "Validated output structure or computed result for Memory Allocator Free-List Coalescing (malloc).",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_memory_allocator_free_list_coalescing__malloc_(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-138",
    "category": "System Design",
    "difficulty": 7,
    "title": "Virtual Memory 2-Level Page Table Translation",
    "prompt": "Reconstruct and optimize Virtual Memory 2-Level Page Table Translation under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Virtual Memory 2-Level Page Table Translation.",
      "outputFormat": "Validated output structure or computed result for Virtual Memory 2-Level Page Table Translation.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_virtual_memory_2_level_page_table_translation(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-139",
    "category": "Debugging",
    "difficulty": 8,
    "title": "Banker Deadlock Safety Algorithm",
    "prompt": "Reconstruct and optimize Banker Deadlock Safety Algorithm under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Banker Deadlock Safety Algorithm.",
      "outputFormat": "Validated output structure or computed result for Banker Deadlock Safety Algorithm.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_banker_deadlock_safety_algorithm(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-140",
    "category": "Reverse Engineering",
    "difficulty": 5,
    "title": "Preemptive SRTF CPU Scheduler",
    "prompt": "Reconstruct and optimize Preemptive SRTF CPU Scheduler under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Preemptive SRTF CPU Scheduler.",
      "outputFormat": "Validated output structure or computed result for Preemptive SRTF CPU Scheduler.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_preemptive_srtf_cpu_scheduler(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-141",
    "category": "Read & Reconstruct",
    "difficulty": 6,
    "title": "Thompson NFA Regular Expression Matcher",
    "prompt": "Reconstruct and optimize Thompson NFA Regular Expression Matcher under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Thompson NFA Regular Expression Matcher.",
      "outputFormat": "Validated output structure or computed result for Thompson NFA Regular Expression Matcher.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_thompson_nfa_regular_expression_matcher(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-142",
    "category": "Algorithms",
    "difficulty": 7,
    "title": "Chaitin-Briggs Register Allocation Graph Color",
    "prompt": "Reconstruct and optimize Chaitin-Briggs Register Allocation Graph Color under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Chaitin-Briggs Register Allocation Graph Color.",
      "outputFormat": "Validated output structure or computed result for Chaitin-Briggs Register Allocation Graph Color.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_chaitin_briggs_register_allocation_graph_color(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-143",
    "category": "Competitive Programming",
    "difficulty": 8,
    "title": "SHA-256 Block Compression Round Engine",
    "prompt": "Reconstruct and optimize SHA-256 Block Compression Round Engine under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for SHA-256 Block Compression Round Engine.",
      "outputFormat": "Validated output structure or computed result for SHA-256 Block Compression Round Engine.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_sha_256_block_compression_round_engine(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-144",
    "category": "System Design",
    "difficulty": 5,
    "title": "RSA Fast Modular Exponentiation",
    "prompt": "Reconstruct and optimize RSA Fast Modular Exponentiation under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for RSA Fast Modular Exponentiation.",
      "outputFormat": "Validated output structure or computed result for RSA Fast Modular Exponentiation.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_rsa_fast_modular_exponentiation(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "system-design",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-145",
    "category": "Debugging",
    "difficulty": 6,
    "title": "AES State Matrix SubBytes & ShiftRows",
    "prompt": "Reconstruct and optimize AES State Matrix SubBytes & ShiftRows under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for AES State Matrix SubBytes & ShiftRows.",
      "outputFormat": "Validated output structure or computed result for AES State Matrix SubBytes & ShiftRows.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_aes_state_matrix_subbytes___shiftrows(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "debugging",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-146",
    "category": "Reverse Engineering",
    "difficulty": 7,
    "title": "Diffie-Hellman Key Exchange Verification",
    "prompt": "Reconstruct and optimize Diffie-Hellman Key Exchange Verification under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Diffie-Hellman Key Exchange Verification.",
      "outputFormat": "Validated output structure or computed result for Diffie-Hellman Key Exchange Verification.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_diffie_hellman_key_exchange_verification(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "reverse-engineering",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-147",
    "category": "Read & Reconstruct",
    "difficulty": 8,
    "title": "Consistent Hash Ring Key Remapping",
    "prompt": "Reconstruct and optimize Consistent Hash Ring Key Remapping under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Consistent Hash Ring Key Remapping.",
      "outputFormat": "Validated output structure or computed result for Consistent Hash Ring Key Remapping.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_consistent_hash_ring_key_remapping(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "read-&-reconstruct",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-148",
    "category": "Algorithms",
    "difficulty": 5,
    "title": "Cyclic Redundancy Check CRC32 Engine",
    "prompt": "Reconstruct and optimize Cyclic Redundancy Check CRC32 Engine under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Cyclic Redundancy Check CRC32 Engine.",
      "outputFormat": "Validated output structure or computed result for Cyclic Redundancy Check CRC32 Engine.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "python",
    "starterCode": "def solve_cyclic_redundancy_check_crc32_engine(data):\n    # Write optimal solution\n    pass",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "algorithms",
      "algorithm",
      "computing"
    ]
  },
  {
    "id": "alg-comp-149",
    "category": "Competitive Programming",
    "difficulty": 6,
    "title": "Base58Check Encoding & Decoding Scheme",
    "prompt": "Reconstruct and optimize Base58Check Encoding & Decoding Scheme under strict memory and time bounds. Your implementation must satisfy formal edge cases and handle high-volume data streams cleanly.",
    "details": {
      "inputFormat": "Standard JSON payload containing input parameters for Base58Check Encoding & Decoding Scheme.",
      "outputFormat": "Validated output structure or computed result for Base58Check Encoding & Decoding Scheme.",
      "constraints": "1 <= N <= 10^5\nTime Limit: 2.0s\nMemory Limit: 256 MB\nTarget Complexity: O(N log N) or optimal",
      "sampleInput": "{\n  \"inputData\": [1, 5, 10, 20],\n  \"target\": 15\n}",
      "sampleOutput": "{\n  \"success\": true,\n  \"result\": 15\n}"
    },
    "language": "javascript",
    "starterCode": "function solve_base58check_encoding___decoding_scheme(data) {\n  // Write optimal solution\n}",
    "hints": [
      "Consider optimal dynamic programming state or graph traversal layout.",
      "Ensure proper memory bounds and base condition handling."
    ],
    "evalMode": "exact-test",
    "tests": [
      {
        "input": "{\"inputData\": [1,5,10,20]}",
        "expectedOutput": "{\"success\": true}"
      }
    ],
    "tags": [
      "competitive-programming",
      "algorithm",
      "computing"
    ]
  }
];

export const problemBank = {
  getAllProblems() {
    const customProblems = storage.get('custom_problems', []);
    return [...SEED_PROBLEMS, ...customProblems];
  },

  getProblemById(id) {
    const all = this.getAllProblems();
    return all.find(p => p.id === id) || null;
  },

  filterProblems({ category, difficulty, searchTag, userRating }) {
    let list = this.getAllProblems();

    if (category && category !== 'all') {
      list = list.filter(p => p.category === category);
    }

    if (difficulty && difficulty !== 'all') {
      const diffNum = parseInt(difficulty, 10);
      list = list.filter(p => p.difficulty === diffNum);
    }

    if (searchTag && searchTag.trim() !== '') {
      const tagLower = searchTag.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(tagLower) ||
        p.tags.some(t => t.toLowerCase().includes(tagLower))
      );
    }

    if (userRating) {
      list.sort((a, b) => {
        const aRating = a.difficulty * 150 + 400;
        const bRating = b.difficulty * 150 + 400;
        const targetRating = userRating + 150;
        const aDist = Math.abs(aRating - targetRating);
        const bDist = Math.abs(bRating - targetRating);
        return aDist - bDist;
      });
    }

    return list;
  },

  getSuggestedProblem(ratings = {}) {
    const all = this.getAllProblems();
    const history = storage.get('attempt_history', []);
    const solvedIds = new Set(history.filter(h => h.solved).map(h => h.problemId));
    const unsolved = all.filter(p => !solvedIds.has(p.id));
    const candidates = unsolved.length > 0 ? unsolved : all;

    candidates.sort((a, b) => {
      const catA = a.category || 'algorithm';
      const catB = b.category || 'algorithm';
      const ratingA = (ratings[catA] || 1000) + 150;
      const ratingB = (ratings[catB] || 1000) + 150;
      const diffA = Math.abs((a.difficulty * 150 + 400) - ratingA);
      const diffB = Math.abs((b.difficulty * 150 + 400) - ratingB);
      return diffA - diffB;
    });

    return candidates[0] || all[0];
  },

  saveCustomProblem(problemData) {
    const customProblems = storage.get('custom_problems', []);
    if (!problemData.id) {
      problemData.id = 'imp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    }
    const existingIndex = customProblems.findIndex(p => p.id === problemData.id);
    if (existingIndex >= 0) {
      customProblems[existingIndex] = problemData;
    } else {
      customProblems.push(problemData);
    }
    storage.set('custom_problems', customProblems);
    return problemData;
  }
};
