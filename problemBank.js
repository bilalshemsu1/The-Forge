import { storage } from './storage.js';

export const SEED_PROBLEMS = [
  // --- SYSTEM DESIGN ---
  {
    id: "sys-001",
    category: "system-design",
    difficulty: 6,
    title: "Distributed Rate Limiter under High Concurrency",
    prompt: `### System Design: Distributed Rate Limiter

#### Scenario
You are designing a distributed rate-limiting service for an API gateway handling **500,000 requests per second** across 50 global gateway nodes. 

#### Constraints & Requirements
1. Limit: **100 requests per minute per IP address**.
2. Precision: Strict enforcement with minimal burst leakage.
3. Latency: Rate limit check must complete in **< 2ms** (p99).
4. Resilience: If the rate limiter cluster fails or experiences a split-brain network partition, requests should fail-open or degrade gracefully without downing the entire API gateway.

#### Problem Task
Compare **Token Bucket**, **Leaking Bucket**, **Fixed Window**, and **Sliding Window Log / Sliding Window Counter**.
1. Which algorithm best balances accuracy, memory efficiency, and execution latency?
2. Design the Redis data structure and atomic evaluation script (e.g. Lua) for your chosen algorithm.
3. Address how your design handles race conditions when multiple nodes execute rate-check for the same client IP concurrently.`,
    language: "python",
    starterCode: `def evaluate_rate_limit(client_ip, request_timestamp, redis_client):
    """
    Implement a Sliding Window Counter or Token Bucket in Python/Lua script logic.
    Returns (allowed: bool, remaining: int, reset_time: int)
    """
    # Write your rate limiter logic or Lua script payload here
    pass
`,
    hints: [
      "Consider what happens when 1,000 requests hit 10 different gateway nodes at the exact same millisecond. Does your memory store support atomic counter increments across nodes?",
      "Evaluate Sliding Window Counter vs Sliding Window Log: Sliding Window Log keeps every timestamp (high memory O(N)). Sliding Window Counter combines past window count + current window count with a weighted ratio.",
      "A Redis Lua script executes atomically on a single Redis master node. MULTI/EXEC or Lua scripts prevent time-of-check to time-of-use (TOCTOU) race conditions."
    ],
    evalMode: "ai-graded",
    tests: [],
    tags: ["system-design", "distributed-systems", "redis", "concurrency"],
    source: "Real-world Infrastructure Design",
    estimatedMinutes: 35
  },
  {
    id: "sys-002",
    category: "system-design",
    difficulty: 4,
    title: "Resilient URL Shortener with Expiration & Analytics",
    prompt: `### System Design: Resilient URL Shortener

#### Requirements
1. Convert long URLs into 7-character base62 short keys (e.g., \`https://sho.rt/aX9kL2z\`).
2. High Read:Write ratio (100:1 read to write). Expected 10M new links per day.
3. Links can have optional expiration dates. Expired links must return HTTP 410.
4. Real-time click telemetry (total clicks, referrer breakdown, country) without increasing read latency.

#### Deliverable
Submit a high-level architecture specifying:
1. Base62 generation strategy (MD5 hash snippet vs Central Counter / KGS - Key Generation Service). How do you guarantee zero collision under concurrent writes?
2. Data storage model (SQL vs NoSQL vs Cache layer).
3. Asynchronous pipeline design for click analytics.`,
    language: "none",
    starterCode: "",
    hints: [
      "If you hash the URL (MD5/SHA256) and take the first 7 characters, what is the collision probability with 100M URLs?",
      "Consider a pre-generated Key Generation Service (KGS) that loads unique random Base62 strings into memory ranges across worker nodes.",
      "For click telemetry, avoid blocking the redirect response on database updates. Use an async messaging queue (Kafka/RabbitMQ) or batching buffer."
    ],
    evalMode: "ai-graded",
    tests: [],
    tags: ["system-design", "hashing", "analytics", "architecture"],
    source: "Classic System Design Challenge",
    estimatedMinutes: 30
  },
  {
    id: "sys-003",
    category: "system-design",
    difficulty: 7,
    title: "Distributed KV Store with Eventual Consistency & Vector Clocks",
    prompt: `### System Design: Distributed Key-Value Store

#### Scenario
Design an eventually-consistent, peer-to-peer distributed Key-Value store modeled after Amazon DynamoDB / Riak.

#### Constraints
1. Cluster size: 100 nodes. Dynamic topology (nodes join/leave).
2. Tuneable Consistency: Configurable Read/Write quorum (N, R, W).
3. Concurrent Conflict Resolution: When concurrent writes occur to the same key on disconnected nodes, how does the system detect and resolve causality conflicts?

#### Task
1. Explain how **Consistent Hashing with Virtual Nodes** avoids massive data migration during topology changes.
2. Formulate the exact **Vector Clock** data structure representation and conflict detection algorithm (concurrent vs causal relationship).
3. Explain how **Read Repair** and **Hinted Handoff** maintain availability during node network partitions.`,
    language: "python",
    starterCode: `class VectorClock:
    def __init__(self, clock_dict=None):
        self.clock = clock_dict or {}

    def increment(self, node_id):
        self.clock[node_id] = self.clock.get(node_id, 0) + 1

    def compare(self, other_clock):
        """
        Returns:
        - "EQUAL" if identical
        - "BEFORE" if self causally preceded other
        - "AFTER" if self causally succeeded other
        - "CONCURRENT" if conflict detected
        """
        # Implement causality comparison logic
        pass
`,
    hints: [
      "When comparing two Vector Clocks V1 and V2: V1 <= V2 if and only if for all nodes k, V1[k] <= V2[k]. What if V1[A] > V2[A] BUT V1[B] < V2[B]?",
      "If neither clock dominates the other across all keys, the events occurred concurrently — generating sibling values that require application-level merge or CRDTs.",
      "Consistent hashing maps both keys and physical nodes onto a 2^32 integer ring. Virtual nodes distribute single physical servers across multiple ring locations to equalize load distribution."
    ],
    evalMode: "ai-graded",
    tests: [],
    tags: ["distributed-systems", "vector-clocks", "consistency", "consensus"],
    source: "Amazon Dynamo Paper",
    estimatedMinutes: 45
  },

  // --- DEBUGGING ---
  {
    id: "dbg-001",
    category: "debugging",
    difficulty: 5,
    title: "Memory Leak & Silent Race Condition in Async Queue",
    prompt: `### Debugging: Async Queue Memory Leak & Race Condition

#### Background
A production microservice uses the following JavaScript async task queue to process batch events. Under high load, memory consumption steadily spikes until the Node process crashes with \`ERR_OUT_OF_MEMORY\`. Furthermore, duplicate event execution occasionally occurs.

#### Broken Code
\`\`\`javascript
class AsyncQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
    this.history = []; // Audit log
  }

  push(task) {
    this.queue.push(task);
    this.history.push(task); // Keeps track of all tasks executed
    this.next();
  }

  async next() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();

    try {
      await task();
    } catch (err) {
      console.error("Task failed", err);
    } finally {
      this.running--;
      this.next();
    }
  }
}
\`\`\`

#### Task
1. Identify the root cause of the memory leak.
2. Identify the race condition or unhandled edge case when \`push()\` is invoked synchronously multiple times in rapid succession.
3. Write the fixed, leak-free \`AsyncQueue\` implementation in JS or Python.`,
    language: "javascript",
    starterCode: `class AsyncQueue {
  constructor(concurrency = 2) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  push(task) {
    // Fix memory leak and concurrency dispatching logic here
    this.queue.push(task);
    this.processNext();
  }

  async processNext() {
    // Fill in fixed logic
  }
}`,
    hints: [
      "Inspect the \`history\` array property. Is items ever purged or bounded?",
      "Look at how \`this.next()\` is called in \`push(task)\`. If \`push()\` is called in a loop 5 times while \`running\` is 0, how many task execution chains are kicked off concurrently?",
      "In \`push()\`, looping or calling \`next()\` without checking \`while (this.running < this.concurrency && this.queue.length > 0)\` allows \`running\` count checks to desynchronize during synchronous push loops."
    ],
    evalMode: "ai-graded",
    tests: [],
    tags: ["debugging", "async", "memory-leak", "javascript", "concurrency"],
    source: "Production Node.js Incident Report",
    estimatedMinutes: 25
  },
  {
    id: "dbg-002",
    category: "debugging",
    difficulty: 6,
    title: "Thundering Herd Cache Invalidation Bug",
    prompt: `### Debugging: Thundering Herd & Cache Stampede

#### Scenario
During peak traffic, invalidating a popular cache key (e.g. homepage user stats) causes database CPU usage to instantly hit 100%, causing cascading HTTP 504 Gateway Timeouts.

#### The Flawed Pattern
\`\`\`python
import time

def get_user_stats(user_id, cache, db):
    cache_key = f"user_stats:{user_id}"
    data = cache.get(cache_key)
    
    if data is None:
        # Cache Miss: Fetch from DB (takes 800ms)
        data = db.query_heavy_user_stats(user_id)
        cache.set(cache_key, data, ttl=60)
        
    return data
\`\`\`

#### Task
1. Analyze why 5,000 concurrent requests during a cache miss overwhelm the DB despite having a cache layer.
2. Implement a robust mitigation strategy: **Mutex / Distributed Lock**, **Probabilistic Early Expiration (XFetch algorithm)**, or **Singleflight request coalescing**.
3. Write Python code implementing Singleflight or Mutex locking with fallback.`,
    language: "python",
    starterCode: `import threading
import time

class CacheFetcher:
    def __init__(self, cache, db):
        self.cache = cache
        self.db = db
        self.locks = {}
        self._guard = threading.Lock()

    def get_user_stats(self, user_id):
        # Implement Singleflight or Mutex locked cache retrieval to prevent Thundering Herd
        pass
`,
    hints: [
      "What happens when 5,000 concurrent threads execute \`if data is None:\` before ANY thread completes \`cache.set(...)\`?",
      "Mutex locking ensures only ONE thread executes the DB query while the remaining 4,999 wait on the lock or poll the cache.",
      "Singleflight pattern registers in-flight promises/futures for active keys, reusing the single pending DB query result for all concurrent callers."
    ],
    evalMode: "ai-graded",
    tests: [],
    tags: ["debugging", "caching", "concurrency", "performance"],
    source: "High Traffic Web Architecture Bug",
    estimatedMinutes: 30
  },
  {
    id: "dbg-003",
    category: "debugging",
    difficulty: 3,
    title: "Off-by-One Ring Buffer Overflow",
    prompt: `### Debugging: Circular Ring Buffer Index Corruption

#### Problem Statement
A high-frequency telemetry system uses a fixed-size Circular Buffer to store incoming sensor readings. However, under full capacity, buffer size reports incorrectly and old readings overwrite unread head data prematurely.

#### Broken Implementation
\`\`\`python
class CircularBuffer:
    def __init__(self, capacity):
        self.capacity = capacity
        self.buffer = [None] * capacity
        self.head = 0
        self.tail = 0
        self.size = 0

    def enqueue(self, item):
        self.buffer[self.tail] = item
        self.tail = (self.tail + 1) % self.capacity
        if self.size < self.capacity:
            self.size += 1
        else:
            self.head = (self.head + 1) % self.capacity

    def dequeue(self):
        if self.size == 0:
            return None
        item = self.buffer[self.head]
        self.buffer[self.head] = None
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return item
\`\`\`

#### Task
Fix the code so that:
- \`solution(actions)\` receives a list of enqueue/dequeue operations and returns the final dequeued output sequence.
- All test cases pass accurately.`,
    language: "python",
    starterCode: `def solution(operations):
    """
    operations: list of tuples like [("enqueue", 10), ("enqueue", 20), ("dequeue", None)]
    Returns list of dequeued values.
    """
    class CircularBuffer:
        def __init__(self, capacity=3):
            self.capacity = capacity
            self.buffer = [None] * capacity
            self.head = 0
            self.tail = 0
            self.size = 0

        def enqueue(self, item):
            self.buffer[self.tail] = item
            self.tail = (self.tail + 1) % self.capacity
            if self.size < self.capacity:
                self.size += 1
            else:
                self.head = (self.head + 1) % self.capacity

        def dequeue(self):
            if self.size == 0:
                return None
            item = self.buffer[self.head]
            self.buffer[self.head] = None
            self.head = (self.head + 1) % self.capacity
            self.size -= 1
            return item

    buf = CircularBuffer(3)
    out = []
    for op, val in operations:
        if op == "enqueue":
            buf.enqueue(val)
        elif op == "dequeue":
            out.append(buf.dequeue())
    return out
`,
    hints: [
      "Trace what happens when capacity is 3 and you enqueue 4 items [1, 2, 3, 4] then dequeue 3 times.",
      "Check whether \`self.head\` advancing when \`self.size == self.capacity\` correctly preserves element ordering.",
      "Ensure that when buffer is full, enqueuing overwrites head and advances head, while size remains bounded at capacity."
    ],
    evalMode: "exact-test",
    tests: [
      {
        input: `[["enqueue", 1], ["enqueue", 2], ["enqueue", 3], ["dequeue", null], ["dequeue", null]]`,
        expectedOutput: `[1, 2]`
      },
      {
        input: `[["enqueue", 10], ["enqueue", 20], ["enqueue", 30], ["enqueue", 40], ["dequeue", null], ["dequeue", null]]`,
        expectedOutput: `[20, 30]`
      }
    ],
    tags: ["debugging", "data-structures", "buffer", "python"],
    source: "Embedded Systems Driver Bug",
    estimatedMinutes: 20
  },

  // --- ALGORITHMS ---
  {
    id: "algo-001",
    category: "algorithm",
    difficulty: 7,
    title: "Gear Arrangement Non-Contiguous Matching (AoC Pattern)",
    prompt: `### Algorithm: Condition Springs & Damaged Gear Arrangement

#### Problem
You are given a damaged condition record string consisting of operational springs (\`.\`), damaged springs (\`#\`), and unknown statuses (\`?\`), followed by a sequence of contiguous damaged spring group lengths.

For example:
- Prompt pattern: \`???.### 1,1,3\`
- The unknown \`?\` characters can be replaced with either \`.\` or \`#\` such that the contiguous blocks of \`#\` match the target array \`[1, 1, 3]\` exactly.

#### Input Format
A JSON object with \`pattern\` (string) and \`groups\` (list of integers).

#### Task
Write a function \`solution(data)\` (or \`run(data)\`) using Memoized Dynamic Programming to return the total count of valid arrangements.`,
    language: "python",
    starterCode: `def solution(data):
    """
    data format: {"pattern": "???.###", "groups": [1, 1, 3]}
    Return total valid arrangement count as int.
    """
    pattern = data["pattern"]
    groups = tuple(data["groups"])
    
    memo = {}

    def count_ways(p_idx, g_idx, current_len):
        # Implement memoized recursive DP
        pass

    return count_ways(0, 0, 0)
`,
    hints: [
      "Naive recursion checking every ? substitution is O(2^N). Top-down Dynamic Programming with memoization keyed by (pattern_index, group_index, current_damaged_block_length) runs in polynomial time.",
      "At each character, handle three cases: '.', '#', and '?'. '?' branches into both '.' and '#'.",
      "Pay attention to base cases: when p_idx reaches the end of string, verify whether all groups were satisfied and current_len matches zero or expected block length."
    ],
    evalMode: "exact-test",
    tests: [
      {
        input: `{"pattern": "???.###", "groups": [1, 1, 3]}`,
        expectedOutput: `1`
      },
      {
        input: `{"pattern": ".??..??...?##.", "groups": [1, 1, 3]}`,
        expectedOutput: `4`
      },
      {
        input: `{"pattern": "?#?#?#?#?#?#?#?", "groups": [1, 3, 1, 6]}`,
        expectedOutput: `1`
      }
    ],
    tags: ["algorithm", "dynamic-programming", "memoization", "advent-of-code"],
    source: "Advent of Code 2023 Day 12 Variant",
    estimatedMinutes: 40
  },
  {
    id: "algo-002",
    category: "algorithm",
    difficulty: 3,
    title: "Special Pythagorean Triplet & Constrained Sum (Project Euler)",
    prompt: `### Algorithm: Special Pythagorean Triplet

#### Background
A Pythagorean triplet is a set of three natural numbers, $a < b < c$, for which:
$$a^2 + b^2 = c^2$$

For example, $3^2 + 4^2 = 9 + 16 = 25 = 5^2$.

#### Problem Task
Given a target integer sum $N$, find the product $a \\times b \\times c$ of the unique Pythagorean triplet for which:
$$a + b + c = N$$

If no such triplet exists for $N$, return $-1$.`,
    language: "javascript",
    starterCode: `function solution(n) {
  // Return a * b * c for a + b + c = n and a^2 + b^2 = c^2
  for (let a = 1; a < n / 3; a++) {
    // Solve for b and c algebraically or iteratively
  }
  return -1;
}
`,
    hints: [
      "Since a + b + c = N, c = N - a - b. Substitute c into a^2 + b^2 = c^2.",
      "a^2 + b^2 = (N - a - b)^2 = N^2 + a^2 + b^2 - 2Na - 2Nb + 2ab. Simplifying gives b = (N^2 - 2Na) / (2N - 2a).",
      "Loop 'a' from 1 to N/3 and check if (N^2 - 2Na) is evenly divisible by (2N - 2a)."
    ],
    evalMode: "exact-test",
    tests: [
      {
        input: `1000`,
        expectedOutput: `31875000`
      },
      {
        input: `12`,
        expectedOutput: `60`
      }
    ],
    tags: ["algorithm", "math", "number-theory", "project-euler"],
    source: "Project Euler Problem 9",
    estimatedMinutes: 20
  },
  {
    id: "algo-003",
    category: "algorithm",
    difficulty: 5,
    title: "Minimum Window Substring with Multi-Frequency Targets",
    prompt: `### Algorithm: Minimum Window Substring

#### Problem Statement
Given two strings \`s\` and \`t\` of lengths \`m\` and \`n\` respectively, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included in the window. If there is no such substring, return the empty string \`""\`.

#### Input Format
JSON object \`{"s": "ADOBECODEBANC", "t": "ABC"}\`.

#### Constraint
Algorithm should run in $O(m + n)$ time complexity.`,
    language: "python",
    starterCode: `def solution(data):
    s = data["s"]
    t = data["t"]
    if not s or not t:
        return ""
        
    # Implement Sliding Window algorithm with character frequency hashmap
    pass
`,
    hints: [
      "Use two pointers (left and right) to form a expanding/contracting sliding window.",
      "Maintain a target character frequency map for 't' and a current window frequency map.",
      "Expand 'right' until all required characters are satisfied, then shrink 'left' to find the minimal valid substring window."
    ],
    evalMode: "exact-test",
    tests: [
      {
        input: `{"s": "ADOBECODEBANC", "t": "ABC"}`,
        expectedOutput: `"BANC"`
      },
      {
        input: `{"s": "a", "t": "a"}`,
        expectedOutput: `"a"`
      },
      {
        input: `{"s": "a", "t": "aa"}`,
        expectedOutput: `""`
      }
    ],
    tags: ["algorithm", "sliding-window", "strings", "hash-table"],
    source: "Classic LeetCode Hard Variant",
    estimatedMinutes: 30
  },

  // --- REVERSE ENGINEERING ---
  {
    id: "rev-001",
    category: "reverse-engineering",
    difficulty: 5,
    title: "Black-Box Cipher Function Inference",
    prompt: `### Reverse Engineering: Infer the Black-Box Transformation

#### Context
You intercepted a legacy obfuscation routine in a binary executable. You do not have the source code, but you observed the input string and output integer mappings:

- \`"A"\` -> \`134\`
- \`"AB"\` -> \`271\`
- \`"ABC"\` -> \`411\`
- \`"hello"\` -> \`1067\`
- \`"forge"\` -> \`1061\`
- \`"a"\` -> \`198\`

#### Objective
Analyze the relationship between characters, positions, bit shifts, or ASCII offsets.
Construct a function \`solution(s)\` that replicates the exact mathematical encoding logic for any input string.`,
    language: "javascript",
    starterCode: `function solution(s) {
  // Infer the transformation logic from observed I/O pairs:
  // "A" (ASCII 65) -> 134
  // "AB" (ASCII 65, 66) -> 271
  // "a" (ASCII 97) -> 198
  
  let acc = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    // Determine mathematical operation applied per character and position
  }
  return acc;
}
`,
    hints: [
      "Compare 'A' (ASCII 65 -> output 134) and 'a' (ASCII 97 -> output 198). What is the multiplier applied to ASCII values? Notice: (65 * 2) + 4 = 134. (97 * 2) + 4 = 198.",
      "Now analyze multi-character input: 'AB': 'A' is at index 0, 'B' is at index 1 (ASCII 66). If 'A' gives 134, 'B' contributes (66 * 2) + 4 + offset? Or does index i add an incremental offset?",
      "Test formula: sum for i=0..len-1 of: (charCodeAt(i) * 2 + 4 + i * 3)."
    ],
    evalMode: "exact-test",
    tests: [
      { input: `"A"`, expectedOutput: `134` },
      { input: `"AB"`, expectedOutput: `271` },
      { input: `"hello"`, expectedOutput: `1067` }
    ],
    tags: ["reverse-engineering", "bit-manipulation", "decoding", "black-box"],
    source: "CTF Reverse Engineering Puzzle",
    estimatedMinutes: 25
  },
  {
    id: "rev-002",
    category: "reverse-engineering",
    difficulty: 6,
    title: "Custom Binary Frame Protocol Packet Decoder",
    prompt: `### Reverse Engineering: Binary Frame Packet Stream

#### Background
A IoT microcontroller transmits binary data encoded as hexadecimal strings. Each packet has a header byte, length byte, payload bytes, and a 1-byte checksum.

Frame Structure:
- Byte 0: Sync Byte (\`0xAA\`)
- Byte 1: Payload Length $L$
- Bytes 2 to $2 + L - 1$: Payload string (ASCII)
- Last Byte: XOR checksum of all payload bytes

#### Input
A hex string representing the binary packet stream, e.g., \`"AA0450494E471C"\`.

#### Task
Write \`solution(hex_str)\` to return a JSON object \`{"valid": true, "payload": "PING"}\` if checksum matches, or \`{"valid": false, "payload": ""}\` if sync byte or checksum fails.`,
    language: "python",
    starterCode: `def solution(hex_str):
    """
    hex_str e.g. "AA0450494E471C"
    Returns {"valid": bool, "payload": str}
    """
    # Convert hex string to byte list and decode frame
    pass
`,
    hints: [
      "Convert hex string into raw byte values: bytes.fromhex(hex_str).",
      "Check if byte 0 equals 0xAA (170 decimal). Read length L from byte 1.",
      "Extract L payload bytes, XOR them together to verify against the final trailing byte."
    ],
    evalMode: "exact-test",
    tests: [
      {
        input: `"AA0450494E471C"`,
        expectedOutput: `{"valid": true, "payload": "PING"}`
      },
      {
        input: `"AA0548454C4C4F00"`,
        expectedOutput: `{"valid": false, "payload": ""}`
      }
    ],
    tags: ["reverse-engineering", "binary-protocol", "hex", "iot"],
    source: "Hardware Firmware Analysis",
    estimatedMinutes: 30
  },

  // --- READ AND RECONSTRUCT ---
  {
    id: "rec-001",
    category: "read-and-reconstruct",
    difficulty: 5,
    title: "Reconstruct LRU-K Cache Eviction Algorithm",
    prompt: `### Read & Reconstruct: LRU-K Cache Eviction Policy

#### Specification Excerpt (O'Neil et al., 1993)
> "The LRU-K algorithm tracks the time of the last $K$ references to a database page. The system computes $BackwardKDistance(p, K) = t - t_{last-K}(p)$, where $t$ is the current time and $t_{last-K}(p)$ is the timestamp of the $K$-th most recent access to page $p$. If a page has been accessed fewer than $K$ times, its $BackwardKDistance$ is treated as $\\infty$. The page with the maximum $BackwardKDistance$ is selected for eviction. If multiple pages have infinite distance, LRU eviction is used among them based on earliest initial reference."

#### Problem Task
Implement an \`LRUKCache(capacity, k)\` class in Python or JavaScript:
- \`get(key)\`: Returns value if present, records access timestamp, else -1.
- \`put(key, value)\`: Inserts/updates value, records access timestamp. If capacity exceeded, evicts the page according to LRU-K specification above.`,
    language: "python",
    starterCode: `class LRUKCache:
    def __init__(self, capacity: int, k: int):
        self.capacity = capacity
        self.k = k
        self.timer = 0
        self.cache = {} # key -> value
        self.history = {} # key -> list of access timestamps

    def get(self, key: int) -> int:
        # Implement LRU-K get logic
        pass

    def put(self, key: int, value: int) -> None:
        # Implement LRU-K put with eviction logic
        pass
`,
    hints: [
      "Maintain a list/deque of access timestamps per key. When length exceeds K, drop the oldest timestamps so only the last K access times remain.",
      "During eviction when capacity is exceeded: identify candidate keys. Calculate t_lastK for each. If history length < K, distance is infinity.",
      "Sort infinity keys by their earliest timestamp (history[0]) to pick the LRU fallback victim."
    ],
    evalMode: "ai-graded",
    tests: [],
    tags: ["read-and-reconstruct", "cache", "lru-k", "database-internals"],
    source: "ACM SIGMOD Paper: The LRU-K Page Replacement Algorithm",
    estimatedMinutes: 35
  },
  {
    id: "rec-002",
    category: "read-and-reconstruct",
    difficulty: 6,
    title: "Reconstruct Token Bucket Traffic Shaper from IETF RFC Spec",
    prompt: `### Read & Reconstruct: Token Bucket Metering (RFC 2697 / RFC 2698)

#### Specification Excerpt
> "The Single Rate Three Color Marker (srTCM) meters an IP packet stream and marks each packet green, yellow, or red. The meter is characterized by three parameters: Committed Information Rate ($CIR$), Committed Burst Size ($CBS$), and Excess Burst Size ($EBS$). Token bucket $C$ fills at rate $CIR$ up to $CBS$. Token bucket $E$ fills at rate $CIR$ when bucket $C$ is full up to $EBS$.
> When a packet of size $B$ arrives at time $t$:
> - If $C(t) - B \\ge 0$: mark **GREEN**, decrement bucket $C$ by $B$.
> - Else if $E(t) - B \\ge 0$: mark **YELLOW**, decrement bucket $E$ by $B$.
> - Else: mark **RED**, buckets remain unchanged."

#### Task
Reconstruct the exact token replenishment and packet marking logic in Python/JS for a series of packet arrival events.`,
    language: "python",
    starterCode: `def solution(data):
    """
    data = {
      "cir": 10, "cbs": 20, "ebs": 20,
      "events": [
        {"time": 0, "size": 15},
        {"time": 1, "size": 10},
        {"time": 2, "size": 25}
      ]
    }
    Returns list of color strings ["GREEN", "YELLOW", "RED"]
    """
    pass
`,
    hints: [
      "Track current token counts C and E, along with last_update_time.",
      "When a packet arrives at time t, calculate elapsed time = t - last_update_time. Replenish tokens added = elapsed * CIR.",
      "First add tokens to bucket C up to max CBS. Overflow tokens (if C is full) go to bucket E up to max EBS."
    ],
    evalMode: "exact-test",
    tests: [
      {
        input: `{"cir": 10, "cbs": 20, "ebs": 20, "events": [{"time": 0, "size": 15}, {"time": 1, "size": 10}, {"time": 2, "size": 25}]}`,
        expectedOutput: `["GREEN", "GREEN", "RED"]`
      }
    ],
    tags: ["read-and-reconstruct", "networking", "traffic-shaping", "rfc"],
    source: "IETF RFC 2697 Spec",
    estimatedMinutes: 35
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

    // Sort by relevance to user's category rating (Growth zone prioritized)
    if (userRating) {
      list.sort((a, b) => {
        const aRating = a.difficulty * 150 + 400;
        const bRating = b.difficulty * 150 + 400;
        
        // Target rating is slightly above user rating (+100 to +250)
        const targetRating = userRating + 150;
        
        const aDist = Math.abs(aRating - targetRating);
        const bDist = Math.abs(bRating - targetRating);
        return aDist - bDist;
      });
    }

    return list;
  },

  getSuggestedProblem(ratings) {
    const all = this.getAllProblems();
    const history = storage.get('attempt_history', []);
    const solvedIds = new Set(history.filter(h => h.solved).map(h => h.problemId));

    // Exclude solved problems if unsolved exist
    const unsolved = all.filter(p => !solvedIds.has(p.id));
    const candidates = unsolved.length > 0 ? unsolved : all;

    // Pick candidate closest to user rating growth zone
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
