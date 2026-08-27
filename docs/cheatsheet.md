# DSA Master Cheat Sheet

> Comprehensive, ultra-dense algorithmic reference manual with battle-tested C++ templates, mathematical formulas, complexity bounds, and core patterns covering interview problem solving across all major DSA paradigms.

---

## 1. Complexity Analysis & Algorithmic Foundations

### Asymptotic Notation & Mathematical Series

| Notation / Series | Mathematical Formula / Identity | Asymptotic Bound | Practical Role |
| :--- | :--- | :--- | :--- |
| **Big O ($O$)** | $f(n) \le c \cdot g(n) \quad \forall n \ge n_0$ | Upper Ceiling | Worst-case operational guarantee |
| **Big Omega ($\Omega$)** | $f(n) \ge c \cdot g(n) \quad \forall n \ge n_0$ | Lower Floor | Problem baseline difficulty bound |
| **Theta ($\Theta$)** | $c_1 g(n) \le f(n) \le c_2 g(n)$ | Tight Match | Exact upper and lower match |
| **Arithmetic Series** | $\sum_{i=1}^n i = \frac{n(n+1)}{2}$ | $\Theta(n^2)$ | Triangular nested loop iterations |
| **Harmonic Series** | $\sum_{i=1}^n \frac{1}{i} = \ln n + \gamma + O(1/n)$ | $\Theta(\log n)$ | Sieve & prime harmonic bounds |
| **Geometric Series** | $\sum_{i=0}^k r^i = \frac{r^{k+1}-1}{r-1} \quad (r > 1)$ | $\Theta(r^k)$ | Dominated by largest final term |
| **Log Division Step** | $\frac{n}{2^k} = 1 \implies k = \log_2 n$ | $\Theta(\log n)$ | Bisection interval search |

### Master Theorem for Divide & Conquer

For recurrences $T(n) = a T(n/b) + f(n)$ where $a \ge 1, b > 1$, define critical exponent $c_{\text{crit}} = \log_b a$:

- **Case 1 (Leaf Heavy):** If $f(n) = O(n^c)$ where $c < \log_b a \implies T(n) = \Theta(n^{\log_b a})$
- **Case 2 (Balanced):** If $f(n) = \Theta(n^{\log_b a} \log^k n) \implies T(n) = \Theta(n^{\log_b a} \log^{k+1} n)$
- **Case 3 (Root Heavy):** If $f(n) = \Omega(n^c)$ where $c > \log_b a$ and $a f(n/b) \le k f(n) \implies T(n) = \Theta(f(n))$

### Fast Competitive I/O Boilerplate

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
#include <cmath>
using namespace std;

void init_fast_io() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);
}
```

- **Complexity:** `O(1) Setup Time | O(1) Space`

---

## 2. Math, Modular Arithmetic & Number Theory

### Number Theory Reference Matrix

| Algorithm / Concept | Implementation Pattern | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **Safe Modular Subtraction** | `(a % m - b % m + m) % m` | $\Theta(1)$ | $O(1)$ |
| **Binary Exponentiation** | $a^p = (a^2)^{p/2} \cdot a^{p \bmod 2}$ | $O(\log P)$ | $O(1)$ |
| **Trial Division Prime Check**| Check $2, 3$ and $6k \pm 1$ up to $\sqrt{N}$ | $O(\sqrt{N})$ | $O(1)$ |
| **Sieve of Eratosthenes** | Prime multiples starting at $p^2$ | $O(N \log \log N)$ | $O(N)$ bitset |
| **Linear Euler Sieve (SPF)** | Each composite crossed off by its SPF | $\Theta(N)$ | $\Theta(N)$ |
| **Euclidean GCD / LCM** | $\gcd(a, b) = \gcd(b, a \bmod b)$ | $O(\log(\min(a, b)))$ | $O(1)$ |
| **Extended Euclidean** | $a x + b y = \gcd(a, b)$ | $O(\log(\min(a, b)))$ | $O(1)$ |
| **Fermat Modular Inverse** | $a^{-1} \equiv a^{M-2} \pmod M$ (for prime $M$) | $O(\log M)$ | $O(1)$ |
| **Combinatorics $nCr \bmod M$**| $\text{fact}[n] \cdot \text{invFact}[r] \cdot \text{invFact}[n-r] \bmod M$ | $O(1)$ query | $O(N)$ build |

### Modular Arithmetic & Power Templates

```cpp
// 1. Binary Exponentiation: O(log P) Time, O(1) Space
long long power_mod(long long base, long long exp, long long mod) {
    long long res = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) res = (__int128(res) * base) % mod;
        base = (__int128(base) * base) % mod;
        exp >>= 1;
    }
    return res;
}

// 2. Modular Multiplicative Inverse via Fermat's Little Theorem
long long mod_inverse(long long n, long long prime_mod) {
    return power_mod(n, prime_mod - 2, prime_mod);
}

// 3. Greatest Common Divisor & Least Common Multiple
long long gcd_fast(long long a, long long b) {
    while (b) { a %= b; swap(a, b); }
    return a;
}
long long lcm_fast(long long a, long long b) {
    if (a == 0 || b == 0) return 0;
    return (a / gcd_fast(a, b)) * b;
}

// 4. Extended Euclidean Algorithm (Bézout's identity: a*x + b*y = gcd(a,b))
long long ext_gcd(long long a, long long b, long long& x, long long& y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long x1, y1;
    long long g = ext_gcd(b, a % b, x1, y1);
    x = y1;
    y = x1 - y1 * (a / b);
    return g;
}
```

- **Complexity:** `power_mod: O(log P) | gcd_fast: O(log(min(a,b)))` &nbsp;|&nbsp; `$O(1)$ Auxiliary Space`

### Linear Euler Sieve & Smallest Prime Factor (SPF)

```cpp
// Linear Sieve computing SPF array and primes list in O(N) Time
struct LinearSieve {
    int n;
    vector<int> spf, primes;
    LinearSieve(int limit) : n(limit), spf(limit + 1, 0) {
        for (int i = 2; i <= n; ++i) {
            if (spf[i] == 0) { spf[i] = i; primes.push_back(i); }
            for (int p : primes) {
                if (p > spf[i] || i * p > n) break;
                spf[i * p] = p; // Each composite marked by its smallest prime factor
            }
        }
    }
    // Fast O(log X) prime factorization
    vector<pair<int, int>> factorize(int x) {
        vector<pair<int, int>> factors;
        while (x > 1) {
            int p = spf[x], count = 0;
            while (x % p == 0) { count++; x /= p; }
            factors.push_back({p, count});
        }
        return factors;
    }
};
```

- **Complexity:** `Build: Theta(N) Time | Factorize: O(log X) Time` &nbsp;|&nbsp; `O(N) Space`

### Combinatorics & Binomial Coefficients ($nCr \bmod M$)

```cpp
struct Combinatorics {
    int n, mod;
    vector<long long> fact, invFact;
    Combinatorics(int limit, int m) : n(limit), mod(m), fact(limit + 1), invFact(limit + 1) {
        fact[0] = invFact[0] = 1;
        for (int i = 1; i <= n; ++i) fact[i] = (fact[i - 1] * i) % mod;
        invFact[n] = power_mod(fact[n], mod - 2, mod);
        for (int i = n - 1; i >= 1; --i) invFact[i] = (invFact[i + 1] * (i + 1)) % mod;
    }
    long long nCr(int n_val, int r_val) const {
        if (r_val < 0 || r_val > n_val) return 0;
        return fact[n_val] * invFact[r_val] % mod * invFact[n_val - r_val] % mod;
    }
    long long nPr(int n_val, int r_val) const {
        if (r_val < 0 || r_val > n_val) return 0;
        return fact[n_val] * invFact[n_val - r_val] % mod;
    }
};
```

- **Complexity:** `Build: O(N log M) Time | Query: O(1) Time` &nbsp;|&nbsp; `O(N) Space`

---

## 3. Bit Manipulation & Bitmask Techniques

### Core Bitwise Idioms Matrix

| Operation / Trick | C++ Expression | Purpose / Effect |
| :--- | :--- | :--- |
| **Test $k$-th Bit** | `(x & (1ULL << k)) != 0` | Checks if $k$-th bit is 1 |
| **Set $k$-th Bit** | `x \| (1ULL << k)` | Turns $k$-th bit ON |
| **Clear $k$-th Bit** | `x & ~(1ULL << k)` | Turns $k$-th bit OFF |
| **Toggle $k$-th Bit** | `x ^ (1ULL << k)` | Flips $k$-th bit ($0 \leftrightarrow 1$) |
| **Clear Lowest Set Bit** | `n & (n - 1)` | Strips the least significant 1-bit |
| **Extract Lowest Set Bit (LSB)**| `n & (-n)` | Isolates the least significant 1-bit |
| **Power of Two Predicate** | `n > 0 && (n & (n - 1)) == 0` | Returns true iff $n$ is power of 2 |
| **Population Count** | `__builtin_popcountll(n)` | Total set 1-bits in 1 cycle |
| **Count Leading Zeros** | `__builtin_clzll(n)` | Total zero bits before MSB |
| **Count Trailing Zeros** | `__builtin_ctzll(n)` | Number of zero bits after LSB |
| **Submask Enumeration** | `for(int s=m; s>0; s=(s-1)&m)` | Iterates submasks in $O(2^k)$ |

### Production Bit Manipulation Idioms

```cpp
// 1. Bitwise Arithmetic Addition without '+' operator
int bitwise_add(int a, int b) {
    while (b != 0) {
        unsigned int carry = (unsigned int)(a & b) << 1;
        a = a ^ b; // Sum without carry
        b = carry; // Propagate carry
    }
    return a;
}

// 2. Find Single Non-Duplicate in Stream (XOR Parity)
int single_number(const vector<int>& nums) {
    int xor_sum = 0;
    for (int x : nums) xor_sum ^= x;
    return xor_sum;
}

// 3. Find Two Non-Duplicate Elements in Stream (Two Unique Numbers)
pair<int, int> find_two_unique_numbers(const vector<int>& nums) {
    long long xor_all = 0;
    for (int x : nums) xor_all ^= x;
    long long diff_bit = xor_all & (-xor_all); // Isolate lowest differing bit
    int num1 = 0, num2 = 0;
    for (int x : nums) {
        if (x & diff_bit) num1 ^= x;
        else num2 ^= x;
    }
    return {num1, num2};
}

// 4. Enumerate all Subsets of a Bitmask in strictly decreasing order
void process_all_submasks(int mask) {
    for (int sub = mask; sub > 0; sub = (sub - 1) & mask) {
        // 'sub' is guaranteed to be a strict non-empty subset of 'mask'
    }
}
```

- **Complexity:** `Bitwise Add / XOR: O(1) to O(N) Time` &nbsp;|&nbsp; `$O(1)$ Space`

> [!CAUTION]
> Shift operator overflow: In C++, shifting by $\ge 32$ bits on a 32-bit `int` triggers Undefined Behavior. Always use `1ULL << k` for bit positions up to 63.

---

## 4. Arrays, Single-Pass Scans & Prefix Techniques

### Array Operations Reference Matrix

| Technique | Invariant / Formula | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **Kadane's Algorithm** | `curr_max = max(x, curr_max + x)` | $\Theta(N)$ | $O(1)$ |
| **Dutch National Flag** | 3-Way pointer partition (`low, mid, high`) | $\Theta(N)$ | $O(1)$ |
| **3-Step Cyclic Rotation**| `reverse(0, n-1)`, `reverse(0, k-1)`, `reverse(k, n-1)` | $\Theta(N)$ | $O(1)$ |
| **1D Prefix Sum Query** | `pref[r + 1] - pref[l]` | $O(1)$ query | $O(N)$ array |
| **2D Prefix Sum Query** | `pref[r2+1][c2+1] - pref[r1][c2+1] - pref[r2+1][c1] + pref[r1][c1]` | $O(1)$ query | $O(R \cdot C)$ table |
| **Difference Array** | Add `val` at `l`, subtract `val` at `r + 1` | $O(1)$ update | $O(N)$ prefix pass |
| **Next Permutation** | Find pivot `arr[i] < arr[i+1]`, swap with successor, reverse suffix | $\Theta(N)$ | $O(1)$ |

### Kadane, Dutch National Flag & Next Permutation

```cpp
// 1. Kadane's Maximum Contiguous Subarray Sum: Theta(N) Time, O(1) Space
int max_subarray_sum(const vector<int>& nums) {
    int max_so_far = nums[0], current_max = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        current_max = max(nums[i], current_max + nums[i]);
        max_so_far = max(max_so_far, current_max);
    }
    return max_so_far;
}

// 2. Dutch National Flag (3-Way Partitioning: 0s, 1s, 2s): Theta(N) Time, O(1) Space
void sort_colors(vector<int>& nums) {
    int low = 0, mid = 0, high = (int)nums.size() - 1;
    while (mid <= high) {
        if (nums[mid] == 0) swap(nums[low++], nums[mid++]);
        else if (nums[mid] == 1) mid++;
        else swap(nums[mid], nums[high--]);
    }
}

// 3. Next Permutation in Lexicographical Order: Theta(N) Time, O(1) Space
bool next_permutation_custom(vector<int>& nums) {
    int n = nums.size(), i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;
    if (i < 0) { reverse(nums.begin(), nums.end()); return false; }
    int j = n - 1;
    while (nums[j] <= nums[i]) j--;
    swap(nums[i], nums[j]);
    reverse(nums.begin() + i + 1, nums.end());
    return true;
}
```

- **Complexity:** `All single-pass scans: Theta(N) Time` &nbsp;|&nbsp; `$O(1)$ Space`

### 2D Prefix Sum Matrix & Difference Array

```cpp
// 1. 2D Prefix Sum Matrix Query Engine: O(1) Range Queries
class PrefixSum2D {
    vector<vector<long long>> pref;
public:
    PrefixSum2D(const vector<vector<int>>& mat) {
        int R = mat.size(), C = mat[0].size();
        pref.assign(R + 1, vector<long long>(C + 1, 0));
        for (int r = 0; r < R; ++r) {
            for (int c = 0; c < C; ++c) {
                pref[r + 1][c + 1] = mat[r][c] + pref[r + 1][c] + pref[r][c + 1] - pref[r][c];
            }
        }
    }
    // Query sum in subgrid [r1, c1] to [r2, c2] inclusive in O(1)
    long long query(int r1, int c1, int r2, int c2) const {
        return pref[r2 + 1][c2 + 1] - pref[r1][c2 + 1] - pref[r2 + 1][c1] + pref[r1][c1];
    }
};

// 2. 1D Difference Array for O(1) Batch Range Updates
class DifferenceArray {
    vector<long long> diff;
public:
    DifferenceArray(int size) : diff(size + 2, 0) {}
    void add_range(int l, int r, long long val) {
        diff[l] += val;
        diff[r + 1] -= val;
    }
    vector<long long> build() {
        vector<long long> res(diff.size() - 2);
        long long running = 0;
        for (size_t i = 0; i < res.size(); ++i) {
            running += diff[i];
            res[i] = running;
        }
        return res;
    }
};
```

- **Complexity:** `PrefixSum2D: O(1) Query | DifferenceArray: O(1) Update, O(N) Build`

---

## 5. Two Pointers & Sliding Window

### Two Pointers & Window Reference Matrix

| Pattern | Invariant / Transition Condition | Time Complexity | Space |
| :--- | :--- | :--- | :--- |
| **Converging 2-Sum** | `sum < target ? left++ : right--` | $\Theta(N)$ | $O(1)$ |
| **3Sum / K-Sum** | Sort, fix $K-2$ values, converge remaining two | $O(N^{K-1})$ | $O(1)$ |
| **Container Water** | Move pointer with smaller height | $\Theta(N)$ | $O(1)$ |
| **Trapping Rain Water** | Two pointers tracking `left_max` and `right_max` | $\Theta(N)$ | $O(1)$ |
| **Fixed Sliding Window** | Add `arr[r]`, remove `arr[r - k]` | $\Theta(N)$ | $O(1)$ state |
| **Variable Longest Window**| Expand `r`, shrink `l` while invalid | $\Theta(N)$ | $O(\Sigma)$ map |
| **Variable Shortest Goal**| Expand `r`, shrink `l` while valid to minimize | $\Theta(N)$ | $O(1)$ |
| **Exact $K$ Subarrays** | $\text{exact}(K) = \text{atMost}(K) - \text{atMost}(K - 1)$ | $\Theta(N)$ | $O(1)$ |

### Two Pointers: 3Sum & Trapping Rain Water

```cpp
// 1. 3Sum (Unique Triplets summing to 0): O(N^2) Time, O(1) Extra Space
vector<vector<int>> three_sum(vector<int>& nums) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> res;
    int n = nums.size();

    for (int i = 0; i < n - 2; ++i) {
        if (i > 0 && nums[i] == nums[i - 1]) continue; // Skip duplicate anchor
        if (nums[i] > 0) break; // Invariant: all subsequent sums > 0

        int l = i + 1, r = n - 1;
        while (l < r) {
            int sum = nums[i] + nums[l] + nums[r];
            if (sum == 0) {
                res.push_back({nums[i], nums[l], nums[r]});
                while (l < r && nums[l] == nums[l + 1]) l++;
                while (l < r && nums[r] == nums[r - 1]) r--;
                l++; r--;
            } else if (sum < 0) l++;
            else r--;
        }
    }
    return res;
}

// 2. Trapping Rain Water: Theta(N) Time, O(1) Space
int trap_water(const vector<int>& height) {
    int l = 0, r = (int)height.size() - 1;
    int left_max = 0, right_max = 0, water = 0;

    while (l < r) {
        if (height[l] <= height[r]) {
            if (height[l] >= left_max) left_max = height[l];
            else water += left_max - height[l];
            l++;
        } else {
            if (height[r] >= right_max) right_max = height[r];
            else water += right_max - height[r];
            r--;
        }
    }
    return water;
}
```

- **Complexity:** `3Sum: O(N^2) Time | Trapping Water: Theta(N) Time` &nbsp;|&nbsp; `$O(1)$ Auxiliary Space`

### Sliding Window Templates

```cpp
// 1. Longest Substring Without Repeating Characters: Theta(N) Time, O(Sigma) Space
int length_of_longest_substring(const string& s) {
    vector<int> last_pos(256, -1);
    int max_len = 0, left = 0;

    for (int right = 0; right < (int)s.size(); ++right) {
        unsigned char ch = s[right];
        if (last_pos[ch] >= left) {
            left = last_pos[ch] + 1; // Jump past duplicate
        }
        last_pos[ch] = right;
        max_len = max(max_len, right - left + 1);
    }
    return max_len;
}

// 2. Minimum Window Substring (Covering all characters of T): Theta(N + M) Time
string min_window(const string& s, const string& t) {
    vector<int> need(128, 0);
    for (char c : t) need[(unsigned char)c]++;
    int missing = t.size(), start_idx = -1, min_len = 1e9, left = 0;

    for (int right = 0; right < (int)s.size(); ++right) {
        if (need[(unsigned char)s[right]]-- > 0) missing--;

        while (missing == 0) { // Valid window candidate
            if (right - left + 1 < min_len) {
                min_len = right - left + 1;
                start_idx = left;
            }
            if (++need[(unsigned char)s[left++]] > 0) missing++;
        }
    }
    return (start_idx == -1) ? "" : s.substr(start_idx, min_len);
}
```

- **Complexity:** `Both window algorithms: Theta(N) Time` &nbsp;|&nbsp; `$O(\Sigma)$ Auxiliary Space`

---

## 6. Matrix Algorithms & 2D Manipulations

### Matrix Reference Matrix

| Algorithm / Operation | Implementation Formula / Pattern | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **2D Flattened Offset** | `offset = r * NUM_COLS + c` | $\Theta(1)$ | $O(1)$ index mapping |
| **Square Transposition** | `swap(mat[r][c], mat[c][r])` for $c > r$ | $\Theta(N^2)$ | $O(1)$ in-place |
| **Spiral Perimeter Traversal** | 4-boundary contraction (`top, bot, left, right`) | $\Theta(R \cdot C)$ | $O(1)$ output buffer |
| **Diagonal / Anti-Diagonal** | Anti-diagonal: $r + c = k$, Main diagonal: $r - c = d$ | $\Theta(R \cdot C)$ | $O(R + C)$ buckets |
| **90° Clockwise Rotation** | Transpose + Reverse Each Row | $\Theta(N^2)$ | $O(1)$ in-place |
| **90° Counter-Clockwise** | Transpose + Reverse Each Column | $\Theta(N^2)$ | $O(1)$ in-place |
| **Set Matrix Zeroes In-Place** | Use first row and column as marker arrays | $\Theta(R \cdot C)$ | $O(1)$ in-place |
| **Staircase Search (2D Sorted)**| Start Top-Right: `val > target ? c-- : r++` | $O(R + C)$ | $O(1)$ scalar indices |

### Core Matrix Algorithms

```cpp
// 1. In-Place 90-Degree Clockwise Matrix Rotation: Theta(N^2) Time, O(1) Space
void rotate_matrix(vector<vector<int>>& mat) {
    int n = mat.size();
    for (int r = 0; r < n; ++r) {
        for (int c = r + 1; c < n; ++c) swap(mat[r][c], mat[c][r]);
    }
    for (int r = 0; r < n; ++r) reverse(mat[r].begin(), mat[r].end());
}

// 2. Set Matrix Zeroes in O(1) Space: Theta(R * C) Time
void set_zeroes(vector<vector<int>>& mat) {
    int R = mat.size(), C = mat[0].size();
    bool col0_zero = false;

    for (int r = 0; r < R; ++r) {
        if (mat[r][0] == 0) col0_zero = true;
        for (int c = 1; c < C; ++c) {
            if (mat[r][c] == 0) {
                mat[r][0] = 0;
                mat[0][c] = 0;
            }
        }
    }
    for (int r = R - 1; r >= 0; --r) {
        for (int c = C - 1; c >= 1; --c) {
            if (mat[r][0] == 0 || mat[0][c] == 0) mat[r][c] = 0;
        }
        if (col0_zero) mat[r][0] = 0;
    }
}

// 3. Staircase Search on Bi-Dimensionally Sorted Matrix: O(R + C) Time
bool search_matrix(const vector<vector<int>>& mat, int target) {
    if (mat.empty() || mat[0].empty()) return false;
    int r = 0, c = (int)mat[0].size() - 1; // Start Top-Right
    while (r < (int)mat.size() && c >= 0) {
        if (mat[r][c] == target) return true;
        else if (mat[r][c] > target) c--;
        else r++;
    }
    return false;
}
```

- **Complexity:** `Rotate & Zeroes: Theta(R*C) Time | Staircase Search: O(R+C) Time` &nbsp;|&nbsp; `$O(1)$ Space`

---

## 7. Strings & String Matching Algorithms

### String Algorithms Matrix

| Algorithm | Mechanism / Formula | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **SSO Optimization** | Small strings ($\le 15$ bytes) stored on stack | $\Theta(1)$ alloc | $0$ heap bytes |
| **Polynomial Rolling Hash**| $H(s) = \sum s[i] \cdot p^i \bmod M$ | $O(N)$ build, $O(1)$ slice | $O(N)$ powers |
| **KMP Pattern Match** | Failure function / LPS array skips matched prefixes | $\Theta(N + M)$ | $\Theta(M)$ LPS table |
| **Rabin-Karp Search** | Rolling hash comparison with modulo validation | $O(N + M)$ avg | $O(1)$ state |
| **Manacher's Algorithm** | Palindromic radius mirroring across centers | $\Theta(N)$ | $\Theta(N)$ radius array |
| **Palindromic Expansion** | Expand around $2N - 1$ centers ($i$ and $i, i+1$) | $O(N^2)$ worst | $O(1)$ |

### KMP Algorithm & Polynomial Rolling Hash

```cpp
// 1. KMP String Matcher: Theta(N + M) Time, O(M) Space
vector<int> build_lps(const string& pat) {
    int m = pat.size();
    vector<int> lps(m, 0);
    int len = 0, i = 1;
    while (i < m) {
        if (pat[i] == pat[len]) {
            lps[i++] = ++len;
        } else if (len > 0) {
            len = lps[len - 1];
        } else {
            lps[i++] = 0;
        }
    }
    return lps;
}

vector<int> kmp_search(const string& text, const string& pat) {
    vector<int> lps = build_lps(pat), occurrences;
    int n = text.size(), m = pat.size(), i = 0, j = 0;
    while (i < n) {
        if (text[i] == pat[j]) { i++; j++; }
        if (j == m) {
            occurrences.push_back(i - j);
            j = lps[j - 1];
        } else if (i < n && text[i] != pat[j]) {
            if (j > 0) j = lps[j - 1];
            else i++;
        }
    }
    return occurrences;
}

// 2. Double Polynomial Rolling Hash: O(1) Substring Hash Extraction
struct StringHasher {
    int n;
    long long p1 = 31, m1 = 1e9 + 7, p2 = 37, m2 = 1e9 + 9;
    vector<long long> h1, h2, pw1, pw2;
    StringHasher(const string& s) : n(s.size()), h1(n + 1, 0), h2(n + 1, 0), pw1(n + 1, 1), pw2(n + 1, 1) {
        for (int i = 0; i < n; ++i) {
            pw1[i + 1] = (pw1[i] * p1) % m1;
            pw2[i + 1] = (pw2[i] * p2) % m2;
            h1[i + 1] = (h1[i] * p1 + s[i]) % m1;
            h2[i + 1] = (h2[i] * p2 + s[i]) % m2;
        }
    }
    pair<long long, long long> get_hash(int l, int r) const {
        long long hash1 = (h1[r + 1] - h1[l] * pw1[r - l + 1] % m1 + m1) % m1;
        long long hash2 = (h2[r + 1] - h2[l] * pw2[r - l + 1] % m2 + m2) % m2;
        return {hash1, hash2};
    }
};
```

- **Complexity:** `KMP: Theta(N + M) Time | Hash Query: O(1) Time` &nbsp;|&nbsp; `O(N) Space`

---

## 8. Binary Search & Search on Answer Space

### Binary Search Framework Matrix

| Pattern | Invariant / Predicate | Time Complexity | Bounds |
| :--- | :--- | :--- | :--- |
| **Exact Target Lookup** | Closed interval `[low, high]`, `arr[mid] == target` | $O(\log N)$ | Returns index or $-1$ |
| **`lower_bound`** | First position where `arr[i] >= target` | $O(\log N)$ | Range $[0, N]$ |
| **`upper_bound`** | First position where `arr[i] > target` | $O(\log N)$ | Range $[0, N]$ |
| **Rotated Array Min** | If `arr[mid] > arr[high]`, pivot in right half | $O(\log N)$ | $O(1)$ |
| **Search on Answer** | Monotonic predicate $P(x) \in \{0, 1\}$ | $O(\log(\text{Range}) \cdot T_{\text{check}})$ | Minimax optimization |
| **Dual-Array Median** | Partition $X$ and $Y$ such that $\text{left} \le \text{right}$ | $O(\log(\min(N, M)))$ | $O(1)$ |

### Lower/Upper Bound & Search on Answer Templates

```cpp
// 1. Lower Bound Implementation (First index with value >= target): O(log N)
int custom_lower_bound(const vector<int>& arr, int target) {
    int low = 0, high = arr.size();
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] >= target) high = mid;
        else low = mid + 1;
    }
    return low;
}

// 2. Binary Search on Answer Space (Minimax / Feasibility Predicate)
bool is_feasible(long long candidate_rate, const vector<int>& piles, int hours);

long long min_eating_speed(const vector<int>& piles, int h) {
    long long low = 1, high = *max_element(piles.begin(), piles.end()), ans = high;
    while (low <= high) {
        long long mid = low + (high - low) / 2;
        if (is_feasible(mid, piles, h)) {
            ans = mid;         // Record candidate answer
            high = mid - 1;    // Minimize answer: explore left half
        } else {
            low = mid + 1;     // Infeasible: explore right half
        }
    }
    return ans;
}

// 3. Search in Rotated Sorted Array (Distinct Values): O(log N) Time
int search_rotated(const vector<int>& nums, int target) {
    int low = 0, high = (int)nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        if (nums[low] <= nums[mid]) { // Left half sorted
            if (nums[low] <= target && target < nums[mid]) high = mid - 1;
            else low = mid + 1;
        } else { // Right half sorted
            if (nums[mid] < target && target <= nums[high]) low = mid + 1;
            else high = mid - 1;
        }
    }
    return -1;
}
```

- **Complexity:** `All Binary Search: O(log N) Time` &nbsp;|&nbsp; `$O(1)$ Space`

---

## 9. Linked Lists & Fast/Slow Pointer Techniques

### Linked List Reference Matrix

| Operation / Pattern | Invariant / Mechanism | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **In-Place Reversal** | 3-pointer redirection (`prev, curr, next`) | $\Theta(N)$ | $O(1)$ |
| **Find Middle Node** | Slow (1 step), Fast (2 steps) | $\Theta(N)$ | $O(1)$ |
| **Cycle Detection** | Floyd's Tortoise & Hare (`slow == fast`) | $\Theta(N)$ | $O(1)$ |
| **Cycle Entry Point** | Reset `slow = head`, step both at 1x speed | $\Theta(N)$ | $O(1)$ |
| **Reverse $K$-Group** | Count $k$ nodes, reverse interval, link recursively | $\Theta(N)$ | $O(1)$ |
| **Merge 2 Sorted Lists** | Dummy sentinel node, point to smaller value | $\Theta(N + M)$ | $O(1)$ |
| **Copy Random Pointers** | Interleave cloned nodes: $A \to A' \to B \to B'$ | $\Theta(N)$ | $O(1)$ auxiliary |

### Core Linked List Templates

```cpp
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// 1. In-Place Reversal: Theta(N) Time, O(1) Space
ListNode* reverse_list(ListNode* head) {
    ListNode *prev = nullptr, *curr = head;
    while (curr) {
        ListNode* nxt = curr->next;
        curr->next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}

// 2. Floyd's Cycle Detection & Loop Entry Point: Theta(N) Time, O(1) Space
ListNode* detect_cycle(ListNode* head) {
    ListNode *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) { // Cycle detected!
            ListNode* ptr = head;
            while (ptr != slow) {
                ptr = ptr->next;
                slow = slow->next;
            }
            return ptr; // Cycle start node
        }
    }
    return nullptr; // No cycle
}

// 3. Interleaving Deep Copy with Random Pointers: Theta(N) Time, O(1) Space
struct RandomNode {
    int val;
    RandomNode *next, *random;
    RandomNode(int x) : val(x), next(nullptr), random(nullptr) {}
};

RandomNode* copy_random_list(RandomNode* head) {
    if (!head) return nullptr;
    // Step 1: Interleave cloned nodes A -> A' -> B -> B'
    for (RandomNode* curr = head; curr; curr = curr->next->next) {
        RandomNode* copy = new RandomNode(curr->val);
        copy->next = curr->next;
        curr->next = copy;
    }
    // Step 2: Assign random pointers
    for (RandomNode* curr = head; curr; curr = curr->next->next) {
        if (curr->random) curr->next->random = curr->random->next;
    }
    // Step 3: Separate original and cloned lists
    RandomNode* dummy = new RandomNode(0);
    RandomNode* copy_curr = dummy;
    for (RandomNode* curr = head; curr; curr = curr->next) {
        copy_curr->next = curr->next;
        copy_curr = copy_curr->next;
        curr->next = curr->next->next;
    }
    return dummy->next;
}
```

- **Complexity:** `All operations: Theta(N) Time` &nbsp;|&nbsp; `$O(1)$ Auxiliary Space`

---

## 10. Stacks, Queues & Monotonic Structures

### Monotonic Structures Matrix

| Structure / Pattern | Invariant / Monotonicity | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **Next Greater Element** | Decreasing stack (stores indices) | $\Theta(N)$ | $\Theta(N)$ stack |
| **Next Smaller Element** | Increasing stack (stores indices) | $\Theta(N)$ | $\Theta(N)$ stack |
| **Largest Histogram Area** | Increasing stack; pop evaluates width $(i - 1 - \text{top})$ | $\Theta(N)$ | $\Theta(N)$ stack |
| **Sliding Window Max** | Monotonic decreasing deque (front holds max index) | $\Theta(N)$ | $O(K)$ deque |
| **Min Stack in $O(1)$** | Store $\{val, \min\}$ pair or delta encoding | $\Theta(1)$ ops | $O(N)$ stack |
| **Shunting Yard Parser** | Operator precedence stack converts Infix $\to$ Postfix | $\Theta(N)$ | $O(N)$ buffer |

### Monotonic Stack & Deque Templates

```cpp
#include <stack>
#include <deque>

// 1. Next Greater Element: Theta(N) Time, O(N) Space
vector<int> next_greater_element(const vector<int>& nums) {
    int n = nums.size();
    vector<int> nge(n, -1);
    stack<int> st; // Indices with values in strictly decreasing order

    for (int i = 0; i < n; ++i) {
        while (!st.empty() && nums[st.top()] < nums[i]) {
            nge[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }
    return nge;
}

// 2. Largest Rectangle in Histogram: Theta(N) Time, O(N) Space
int largest_rectangle_area(vector<int>& heights) {
    heights.push_back(0); // Sentinel flush
    int n = heights.size(), max_area = 0;
    stack<int> st;

    for (int i = 0; i < n; ++i) {
        while (!st.empty() && heights[st.top()] >= heights[i]) {
            int h = heights[st.top()];
            st.pop();
            int w = st.empty() ? i : (i - 1 - st.top());
            max_area = max(max_area, h * w);
        }
        st.push(i);
    }
    heights.pop_back();
    return max_area;
}

// 3. Monotonic Deque for Sliding Window Maximum: Theta(N) Time, O(K) Space
vector<int> max_sliding_window(const vector<int>& nums, int k) {
    deque<int> dq; // Monotonic decreasing indices
    vector<int> result;

    for (int i = 0; i < (int)nums.size(); ++i) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front(); // Evict out-of-window
        while (!dq.empty() && nums[dq.back()] <= nums[i]) dq.pop_back(); // Maintain monotonicity
        dq.push_back(i);
        if (i >= k - 1) result.push_back(nums[dq.front()]);
    }
    return result;
}
```

- **Complexity:** `Each element pushed/popped at most once: Theta(N) Time` &nbsp;|&nbsp; `O(N) Space`

---

## 11. Trees & Binary Search Trees (BST)

### Trees Reference Matrix

| Algorithm / Traversal | Mechanism / Invariant | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **DFS Traversals** | Pre-order, In-order, Post-order recursion | $\Theta(N)$ | $O(H)$ stack frames |
| **Level-Order BFS** | Queue processing snapshot tiers | $\Theta(N)$ | $O(W)$ max tree width |
| **Tree Diameter** | Post-order computing longest subtree path | $\Theta(N)$ | $O(H)$ stack frames |
| **Lowest Common Ancestor** | Search left & right subtrees for targets $P, Q$ | $\Theta(N)$ | $O(H)$ stack frames |
| **Validate BST** | Check strict range bounds $(\min\_val, \max\_val)$ | $\Theta(N)$ | $O(H)$ stack frames |
| **BST Search / Insertion**| Navigate left if $val < key$ else right | $O(H)$ | $O(1)$ iterative |
| **Serialize / Deserialize**| Pre-order with null markers `#` | $\Theta(N)$ | $\Theta(N)$ string/queue |

### Core Tree Templates

```cpp
struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// 1. Lowest Common Ancestor in Binary Tree: Theta(N) Time, O(H) Space
TreeNode* lowest_common_ancestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* left = lowest_common_ancestor(root->left, p, q);
    TreeNode* right = lowest_common_ancestor(root->right, p, q);
    if (left && right) return root; // p and q found in opposite subtrees
    return left ? left : right;
}

// 2. Validate Binary Search Tree: Theta(N) Time, O(H) Space
bool is_valid_bst(TreeNode* root, long long min_val = -1e18, long long max_val = 1e18) {
    if (!root) return true;
    if (root->val <= min_val || root->val >= max_val) return false;
    return is_valid_bst(root->left, min_val, root->val) &&
           is_valid_bst(root->right, root->val, max_val);
}

// 3. Binary Tree Maximum Path Sum: Theta(N) Time, O(H) Space
int max_path_gain(TreeNode* node, int& max_sum) {
    if (!node) return 0;
    int left_gain = max(0, max_path_gain(node->left, max_sum));
    int right_gain = max(0, max_path_gain(node->right, max_sum));
    max_sum = max(max_sum, node->val + left_gain + right_gain);
    return node->val + max(left_gain, right_gain);
}
```

- **Complexity:** `Tree DFS: Theta(N) Time` &nbsp;|&nbsp; `$O(H) \in [O(\log N), O(N)]$ Stack Space`

---

## 12. Heaps & Priority Queues

### Heap Operations Matrix

| Operation / Pattern | C++ STL Representation | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **Max-Heap (Default)** | `priority_queue<int> max_pq` | $O(\log N)$ push/pop | $O(N)$ |
| **Min-Heap** | `priority_queue<int, vector<int>, greater<int>> min_pq` | $O(\log N)$ push/pop | $O(N)$ |
| **Linear Bottom-Up Build**| `priority_queue<int> pq(arr.begin(), arr.end())` | $\Theta(N)$ linear build | $O(N)$ |
| **Top K Elements** | Min-Heap of size $K$ | $O(N \log K)$ | $O(K)$ |
| **Running Data Median** | Dual Heaps (`max_heap` left, `min_heap` right) | $O(\log N)$ add, $O(1)$ find | $O(N)$ |
| **Merge $K$ Sorted Lists** | Min-Heap storing $\{val, list\_node\_ptr\}$ | $O(N \log K)$ | $O(K)$ |

### Dual-Heap Continuous Median Tracker

```cpp
#include <queue>
using namespace std;

class MedianFinder {
    priority_queue<int> max_left; // Stores smaller half
    priority_queue<int, vector<int>, greater<int>> min_right; // Stores larger half

public:
    void addNum(int num) {
        if (max_left.empty() || num <= max_left.top()) max_left.push(num);
        else min_right.push(num);

        // Rebalance heaps so size difference <= 1
        if (max_left.size() > min_right.size() + 1) {
            min_right.push(max_left.top());
            max_left.pop();
        } else if (min_right.size() > max_left.size()) {
            max_left.push(min_right.top());
            min_right.pop();
        }
    }

    double findMedian() const {
        if (max_left.size() == min_right.size()) {
            return (max_left.top() + min_right.top()) / 2.0;
        }
        return max_left.top();
    }
};
```

- **Complexity:** `addNum: O(log N) Time | findMedian: O(1) Time` &nbsp;|&nbsp; `$O(N)$ Space`

---

## 13. Backtracking & Combinatorial Generation

### Backtracking Strategy Matrix

| Problem / Pattern | Decision State Branching | Complexity Bound | Space Depth |
| :--- | :--- | :--- | :--- |
| **Power Set (Subsets I & II)**| Include / Exclude each element | $O(N \cdot 2^N)$ | $O(N)$ stack |
| **Combination Sum** | Unlimited reuse or single use ($i + 1$) | $O(2^T)$ | $O(T)$ stack |
| **Permutations** | Swap anchor index or visited boolean array | $O(N \cdot N!)$ | $O(N)$ stack |
| **N-Queens Problem** | Place queen row-by-row with diagonal hash checks | $O(N!)$ | $O(N)$ state |
| **Sudoku Solver** | 1-9 placement with row/col/box bitmask validation | $O(9^{empty})$ | $O(81)$ stack |

### Power Set, Permutations & N-Queens

```cpp
// 1. Subsets II (Handling Duplicate Elements): O(N * 2^N) Time
void subsets_backtrack(int start, vector<int>& nums, vector<int>& curr, vector<vector<int>>& res) {
    res.push_back(curr);
    for (int i = start; i < (int)nums.size(); ++i) {
        if (i > start && nums[i] == nums[i - 1]) continue; // Prune duplicate branches
        curr.push_back(nums[i]);
        subsets_backtrack(i + 1, nums, curr, res);
        curr.pop_back(); // Backtrack
    }
}

// 2. N-Queens Solver: O(N!) Time, O(N) Space
void solve_n_queens(int row, int n, vector<string>& board, vector<bool>& cols,
                    vector<bool>& diag1, vector<bool>& diag2, vector<vector<string>>& res) {
    if (row == n) { res.push_back(board); return; }
    for (int col = 0; col < n; ++col) {
        if (cols[col] || diag1[row + col] || diag2[row - col + n - 1]) continue;
        board[row][col] = 'Q';
        cols[col] = diag1[row + col] = diag2[row - col + n - 1] = true;

        solve_n_queens(row + 1, n, board, cols, diag1, diag2, res);

        board[row][col] = '.';
        cols[col] = diag1[row + col] = diag2[row - col + n - 1] = false;
    }
}
```

- **Complexity:** `Subsets: O(N * 2^N) | N-Queens: O(N!) Time` &nbsp;|&nbsp; `O(N) Call Stack Space`

---

## 14. Graph Algorithms & Shortest Paths

### Graph Reference Matrix

| Algorithm | Graph Paradigm | Time Complexity | Auxiliary Space |
| :--- | :--- | :--- | :--- |
| **BFS / DFS** | Adjacency List Traversal | $O(V + E)$ | $O(V)$ queue/stack |
| **Kahn's Topological Sort**| In-Degree reduction queue (detects cycles) | $O(V + E)$ | $O(V)$ in-degree array |
| **Bipartite Coloring** | 2-Color BFS / DFS validation | $O(V + E)$ | $O(V)$ colors |
| **Dijkstra's Algorithm** | Non-negative edge Single-Source Shortest Path | $O((V + E) \log V)$ | $O(V)$ distances |
| **Bellman-Ford Algorithm** | Negative weight edges & negative cycle check | $O(V \cdot E)$ | $O(V)$ distances |
| **Floyd-Warshall** | All-Pairs Shortest Path ($k, i, j$ loops) | $\Theta(V^3)$ | $\Theta(V^2)$ table |
| **Disjoint Set Union (DSU)**| Path compression + Union by rank | $\Theta(\alpha(N)) \approx O(1)$ | $O(V)$ parent array |
| **Kruskal's MST** | Sort edges + DSU union | $O(E \log E)$ | $O(V)$ DSU |

### DSU, Dijkstra & Kahn's Topological Sort

```cpp
#include <vector>
#include <queue>
using namespace std;

// 1. Disjoint Set Union (DSU / Union-Find) with Path Compression & Rank
class DisjointSet {
    vector<int> parent, rank_val;
    int num_components;
public:
    DisjointSet(int n) : parent(n), rank_val(n, 0), num_components(n) {
        for (int i = 0; i < n; ++i) parent[i] = i;
    }
    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // Path compression
    }
    bool unite(int i, int j) {
        int root_i = find(i), root_j = find(j);
        if (root_i == root_j) return false;
        if (rank_val[root_i] < rank_val[root_j]) parent[root_i] = root_j;
        else if (rank_val[root_i] > rank_val[root_j]) parent[root_j] = root_i;
        else { parent[root_j] = root_i; rank_val[root_i]++; }
        num_components--;
        return true;
    }
    int count() const { return num_components; }
};

// 2. Dijkstra's Shortest Path Algorithm: O((V + E) log V)
vector<long long> dijkstra(int start, int n, const vector<vector<pair<int, int>>>& adj) {
    vector<long long> dist(n, 1e18);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue; // Lazy deletion guard

        for (auto const& [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}

// 3. Kahn's In-Degree Topological Sort: O(V + E)
vector<int> topological_sort(int n, const vector<vector<int>>& adj) {
    vector<int> in_degree(n, 0), order;
    for (int u = 0; u < n; ++u) for (int v : adj[u]) in_degree[v]++;
    queue<int> q;
    for (int i = 0; i < n; ++i) if (in_degree[i] == 0) q.push(i);

    while (!q.empty()) {
        int u = q.front(); q.pop();
        order.push_back(u);
        for (int v : adj[u]) if (--in_degree[v] == 0) q.push(v);
    }
    return (order.size() == (size_t)n) ? order : vector<int>{}; // Empty if cycle exists
}
```

- **Complexity:** `Dijkstra: O((V + E) log V) | TopoSort: O(V + E)` &nbsp;|&nbsp; `$O(V)$ Space`

---

## 15. Dynamic Programming

### DP Paradigms Matrix

| Problem Family | State Formulation & Recurrence | Time Complexity | Space Optimization |
| :--- | :--- | :--- | :--- |
| **0/1 Knapsack** | $dp[w] = \max(dp[w], dp[w - wt[i]] + val[i])$ | $O(N \cdot W)$ | $O(W)$ (Reverse inner loop) |
| **Unbounded Knapsack**| $dp[w] = \max(dp[w], dp[w - wt[i]] + val[i])$ | $O(N \cdot W)$ | $O(W)$ (Forward inner loop) |
| **Coin Change (Min)** | $dp[w] = \min(dp[w], dp[w - c] + 1)$ | $O(N \cdot \text{Amount})$ | $O(\text{Amount})$ |
| **LCS (Subsequence)** | Match: $dp[i-1][j-1]+1$, Mismatch: $\max(dp[i-1][j], dp[i][j-1])$ | $O(N \cdot M)$ | $O(\min(N, M))$ (2 rows) |
| **Edit Distance** | Delete, Insert, Replace min $+ 1$ | $O(N \cdot M)$ | $O(\min(N, M))$ |
| **LIS ($O(N \log N)$)** | Patience Sorting via `lower_bound` on tails | $\Theta(N \log N)$ | $\Theta(N)$ |
| **MCM (Interval DP)** | $dp[i][j] = \min_{k}(dp[i][k] + dp[k+1][j] + \text{cost})$ | $O(N^3)$ | $\Theta(N^2)$ |

### Core DP Templates

```cpp
// 1. 0/1 Knapsack with 1D Reverse Loop Space Optimization: O(N * W) Time, O(W) Space
int knapsack_01(int W, const vector<int>& weights, const vector<int>& values) {
    vector<int> dp(W + 1, 0);
    for (size_t i = 0; i < weights.size(); ++i) {
        for (int w = W; w >= weights[i]; --w) { // REVERSE loop prevents reuse
            dp[w] = max(dp[w], dp[w - weights[i]] + values[i]);
        }
    }
    return dp[W];
}

// 2. Longest Common Subsequence (LCS): O(N * M) Time, O(M) Space
int longest_common_subsequence(const string& s1, const string& s2) {
    int n = s1.size(), m = s2.size();
    vector<int> prev(m + 1, 0), curr(m + 1, 0);

    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            if (s1[i - 1] == s2[j - 1]) curr[j] = prev[j - 1] + 1;
            else curr[j] = max(prev[j], curr[j - 1]);
        }
        prev = curr;
    }
    return prev[m];
}

// 3. Longest Increasing Subsequence in O(N log N) via Patience Sorting
int length_of_lis(const vector<int>& nums) {
    vector<int> tails;
    for (int x : nums) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return tails.size();
}

// 4. Matrix Chain Multiplication / Interval DP: O(N^3) Time, O(N^2) Space
int matrix_chain_multiplication(const vector<int>& p) {
    int n = p.size() - 1;
    vector<vector<int>> dp(n, vector<int>(n, 0));

    for (int len = 2; len <= n; ++len) {
        for (int i = 0; i <= n - len; ++i) {
            int j = i + len - 1;
            dp[i][j] = 1e9;
            for (int k = i; k < j; ++k) {
                int cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1];
                dp[i][j] = min(dp[i][j], cost);
            }
        }
    }
    return dp[0][n - 1];
}
```

- **Complexity:** `LIS: Theta(N log N) | Knapsack: O(N*W) | LCS: O(N*M) | MCM: O(N^3)`

---

## 16. Range Query Data Structures (Fenwick & Segment Trees)

### Range Query Comparison Matrix

| Data Structure | Point Update | Range Query | Range Update | Memory Overhead |
| :--- | :--- | :--- | :--- | :--- |
| **Prefix Sum Array** | $O(N)$ | $O(1)$ | $O(N)$ | $\Theta(N)$ flat buffer |
| **Difference Array** | $O(1)$ | $O(N)$ | $O(1)$ | $\Theta(N)$ flat buffer |
| **Fenwick Tree (BIT)** | $O(\log N)$ | $O(\log N)$ (Prefix) | $O(\log N)$ (Point) | $\Theta(N)$ flat buffer (1-based) |
| **Segment Tree** | $O(\log N)$ | $O(\log N)$ (Arbitrary) | $O(\log N)$ (Lazy) | $\Theta(4N)$ tree array |

### Fenwick Tree & Segment Tree Templates

```cpp
// 1. Fenwick Tree (Binary Indexed Tree): O(log N) Point Update & Prefix Query
class FenwickTree {
    int n;
    vector<long long> tree;
public:
    FenwickTree(int size) : n(size), tree(size + 1, 0) {}
    void add(int i, long long delta) {
        for (; i <= n; i += (i & -i)) tree[i] += delta;
    }
    long long query(int i) const {
        long long sum = 0;
        for (; i > 0; i -= (i & -i)) sum += tree[i];
        return sum;
    }
    long long range_query(int l, int r) const { return query(r) - query(l - 1); }
};

// 2. Segment Tree (Range Sum & Point Update): O(log N) Queries & Updates
class SegmentTree {
    int n;
    vector<long long> tree;
    void build(const vector<int>& arr, int node, int l, int r) {
        if (l == r) { tree[node] = arr[l]; return; }
        int mid = l + (r - l) / 2;
        build(arr, 2 * node + 1, l, mid);
        build(arr, 2 * node + 2, mid + 1, r);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }
    void update(int node, int l, int r, int idx, int val) {
        if (l == r) { tree[node] = val; return; }
        int mid = l + (r - l) / 2;
        if (idx <= mid) update(2 * node + 1, l, mid, idx, val);
        else update(2 * node + 2, mid + 1, r, idx, val);
        tree[node] = tree[2 * node + 1] + tree[2 * node + 2];
    }
    long long query(int node, int l, int r, int ql, int qr) const {
        if (ql <= l && r <= qr) return tree[node];
        if (r < ql || l > qr) return 0;
        int mid = l + (r - l) / 2;
        return query(2 * node + 1, l, mid, ql, qr) + query(2 * node + 2, mid + 1, r, ql, qr);
    }
public:
    SegmentTree(const vector<int>& arr) : n(arr.size()), tree(4 * arr.size(), 0) {
        if (n > 0) build(arr, 0, 0, n - 1);
    }
    void update(int idx, int val) { update(0, 0, n - 1, idx, val); }
    long long query(int l, int r) const { return query(0, 0, n - 1, l, r); }
};
```

- **Complexity:** `Fenwick: O(log N) Time, O(N) Space | Segment Tree: O(log N) Time, O(4N) Space`

---

## 17. Greedy & Interval Algorithms

### Interval Algorithms Reference Matrix

| Problem / Pattern | Sorting Comparator | Invariant / Greedy Choice | Time Complexity |
| :--- | :--- | :--- | :--- |
| **Merge Overlapping Intervals** | Sort by `start` time ascending | If `curr.start <= prev.end`, merge ends | $O(N \log N)$ |
| **Activity Selection** | Sort by `end` time ascending | Pick first ending task to leave max room | $O(N \log N)$ |
| **Insert Interval** | 3-phase scan: Left $\to$ Merge overlap $\to$ Right | Linear insertion in sorted list | $\Theta(N)$ |
| **Min Meeting Rooms** | Sort starts & ends independently / Sweep line | Track concurrent overlap counter | $O(N \log N)$ |
| **Jump Game (Reachability)** | Scan forward tracking `max_reachable` index | If `i > max_reachable`, return false | $\Theta(N)$ |

### Interval Merge & Sweep Line Engine

```cpp
// 1. In-Place Overlapping Interval Merging: O(N log N) Time
vector<vector<int>> merge_intervals(vector<vector<int>>& intervals) {
    if (intervals.empty()) return {};
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> merged;
    merged.push_back(intervals[0]);

    for (size_t i = 1; i < intervals.size(); ++i) {
        if (intervals[i][0] <= merged.back()[1]) {
            merged.back()[1] = max(merged.back()[1], intervals[i][1]); // Extend interval
        } else {
            merged.push_back(intervals[i]);
        }
    }
    return merged;
}

// 2. Minimum Meeting Rooms (Sweep Line Event Scanner): O(N log N) Time
int min_meeting_rooms(const vector<vector<int>>& intervals) {
    vector<pair<int, int>> events;
    for (const auto& iv : intervals) {
        events.push_back({iv[0], 1});   // Meeting start (+1 room)
        events.push_back({iv[1], -1});  // Meeting end (-1 room)
    }
    sort(events.begin(), events.end());
    int max_rooms = 0, current_rooms = 0;
    for (const auto& [time, delta] : events) {
        current_rooms += delta;
        max_rooms = max(max_rooms, current_rooms);
    }
    return max_rooms;
}
```

- **Complexity:** `Sorting dominate: O(N log N) Time` &nbsp;|&nbsp; `$O(N)$ Space`

---

## 18. Critical C++ Pitfalls, Language Gotchas & Invariants Matrix

| Category / Domain | Buggy / Fragile Idiom | Safe Idiom | Root Cause / Rationale |
| :--- | :--- | :--- | :--- |
| **Modular Arithmetic** | `(a - b) % m` | `(a - b % m + m) % m` | C++ `%` operator returns negative remainder for negative operands |
| **Midpoint Calculation** | `(low + high) / 2` | `low + (high - low) / 2` | `low + high` overflows $2^{31} - 1$ signed integer limit |
| **Custom Comparator UB** | `bool cmp(a, b) { return a <= b; }` | `bool cmp(a, b) { return a < b; }` | Strict weak ordering mandates irreflexivity: `cmp(x, x) == false` |
| **Bitwise Precedence** | `1 << n - 1` | `(1 << n) - 1` | Subtraction `-` has higher precedence than bit shift `<<` |
| **Bitwise Equality** | `if (x & 1 == 0)` | `if ((x & 1) == 0)` | Equality `==` has higher precedence than bitwise AND `&` |
| **64-bit Shift Truncation**| `1 << 40` | `1ULL << 40` | Literal `1` defaults to 32-bit `int`, triggering undefined behavior |
| **Signed Char Indexing** | `freq[s[i]]++` | `freq[(unsigned char)s[i]]++` | Characters with ASCII $> 127$ cast to negative values causing segfaults |
| **Container Pass-by-Value**| `void solve(vector<int> arr)` | `void solve(const vector<int>& arr)` | Pass-by-value triggers an expensive $O(N)$ heap buffer deep copy |
| **Unsigned Underflow Loop**| `for(unsigned i=n-1; i>=0; i--)`| `for(int i=n-1; i>=0; i--)` | `unsigned int` underflows to $2^{32}-1$, creating an infinite loop |
| **Fenwick Zero Indexing** | `fenwick.add(0, val)` | `fenwick.add(idx + 1, val)` | In Fenwick trees, `0 & -0 == 0`, causing infinite loop in bit navigation |
| **Map Lookup Side-Effect** | `if (my_map[key] == 0)` | `if (my_map.count(key))` | `operator[]` default-inserts missing keys, altering container size |
| **String Append in Loop** | `s = s + ch;` | `s.push_back(ch);` | `s = s + ch` creates a full $O(N)$ duplicate string on every iteration |
