/**
 * Code wrapper utilities for Judge0 submissions.
 *
 * Judge0 expects complete programs that read from stdin and write to stdout.
 * These wrappers take the user's solution function and wrap it with I/O code
 * so the user only needs to implement the algorithm, not the I/O handling.
 *
 * Supports problems 1-10. For unsupported problems, user code is returned as-is.
 */

type WrapperFn = (userCode: string) => string;

interface ProblemWrappers {
  [language: string]: WrapperFn;
}

// =====================================================================
// Problem 1: Two Sum
// Input:  "2,7,11,15\n9"   Output: "0,1"
// =====================================================================

const twoSumWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${userCode}

// --- Platform I/O Wrapper ---
const __lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const __nums = __lines[0].split(',').map(Number);
const __target = parseInt(__lines[1]);
const __result = twoSum(__nums, __target);
console.log(__result.join(','));
`,

  python: (userCode) =>
`import sys

${userCode}

# --- Platform I/O Wrapper ---
__input = sys.stdin.read().strip().split('\\n')
__nums = list(map(int, __input[0].split(',')))
__target = int(__input[1])
__sol = Solution()
__result = __sol.twoSum(__nums, __target)
print(','.join(map(str, __result)))
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${userCode}

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] numsStr = br.readLine().trim().split(",");
        int[] nums = new int[numsStr.length];
        for (int i = 0; i < numsStr.length; i++) nums[i] = Integer.parseInt(numsStr[i].trim());
        int target = Integer.parseInt(br.readLine().trim());
        Solution sol = new Solution();
        int[] result = sol.twoSum(nums, target);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < result.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(result[i]);
        }
        System.out.println(sb.toString());
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${userCode}

int main() {
    char __line[10000];
    fgets(__line, sizeof(__line), stdin);
    int __nums[10000], __numsSize = 0;
    char *__tok = strtok(__line, ",\\n");
    while (__tok) {
        __nums[__numsSize++] = atoi(__tok);
        __tok = strtok(NULL, ",\\n");
    }
    char __tLine[100];
    fgets(__tLine, sizeof(__tLine), stdin);
    int __target = atoi(__tLine);
    int __returnSize;
    int *__result = twoSum(__nums, __numsSize, __target, &__returnSize);
    for (int i = 0; i < __returnSize; i++) {
        if (i > 0) printf(",");
        printf("%d", __result[i]);
    }
    printf("\\n");
    free(__result);
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    string __line;
    getline(cin, __line);
    vector<int> __nums;
    stringstream __ss(__line);
    string __tok;
    while (getline(__ss, __tok, ',')) __nums.push_back(stoi(__tok));
    int __target;
    cin >> __target;
    Solution sol;
    vector<int> result = sol.twoSum(__nums, __target);
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) cout << ",";
        cout << result[i];
    }
    cout << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 2: Valid Parentheses
// Input:  "()"   Output: "true" or "false"
// =====================================================================

const validParenthesesWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${userCode}

// --- Platform I/O Wrapper ---
const __input = require('fs').readFileSync(0, 'utf8').trim();
const __result = isValid(__input);
console.log(__result.toString());
`,

  python: (userCode) =>
`import sys

${userCode}

# --- Platform I/O Wrapper ---
__input = sys.stdin.read().strip()
__sol = Solution()
__result = __sol.isValid(__input)
print(str(__result).lower())
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${userCode}

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        Solution sol = new Solution();
        boolean result = sol.isValid(s);
        System.out.println(result);
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

${userCode}

int main() {
    char __s[10001];
    fgets(__s, sizeof(__s), stdin);
    __s[strcspn(__s, "\\n")] = 0;
    bool __result = isValid(__s);
    printf("%s\\n", __result ? "true" : "false");
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <string>
#include <stack>
using namespace std;

${userCode}

int main() {
    string __s;
    getline(cin, __s);
    Solution sol;
    bool result = sol.isValid(__s);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
`,
};

// =====================================================================
// Helper: Linked-list boilerplate per language
// Used by problems 3, 4, 7, 19
// =====================================================================

const linkedListHelpers = {
  javascript: `
// --- Linked List Node ---
class ListNode {
    constructor(val = 0, next = null) { this.val = val; this.next = next; }
}
function __buildList(csv) {
    if (!csv || csv.trim() === '') return null;
    const vals = csv.split(',').map(Number);
    let head = new ListNode(vals[0]);
    let cur = head;
    for (let i = 1; i < vals.length; i++) { cur.next = new ListNode(vals[i]); cur = cur.next; }
    return head;
}
function __printList(head) {
    const parts = [];
    while (head) { parts.push(head.val); head = head.next; }
    return parts.join(',');
}
`,
  python: `
# --- Linked List Node ---
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def __buildList(csv):
    if not csv or csv.strip() == '':
        return None
    vals = list(map(int, csv.split(',')))
    head = ListNode(vals[0])
    cur = head
    for v in vals[1:]:
        cur.next = ListNode(v)
        cur = cur.next
    return head

def __printList(head):
    parts = []
    while head:
        parts.append(str(head.val))
        head = head.next
    return ','.join(parts)
`,
  java: `
class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
`,
  javaHelpers: `
    static ListNode buildList(String csv) {
        if (csv == null || csv.trim().isEmpty()) return null;
        String[] parts = csv.split(",");
        ListNode head = new ListNode(Integer.parseInt(parts[0].trim()));
        ListNode cur = head;
        for (int i = 1; i < parts.length; i++) {
            cur.next = new ListNode(Integer.parseInt(parts[i].trim()));
            cur = cur.next;
        }
        return head;
    }
    static String printList(ListNode head) {
        StringBuilder sb = new StringBuilder();
        while (head != null) {
            if (sb.length() > 0) sb.append(",");
            sb.append(head.val);
            head = head.next;
        }
        return sb.toString();
    }
`,
  c: `
struct ListNode {
    int val;
    struct ListNode *next;
};
struct ListNode* __buildList(const char* csv) {
    if (!csv || csv[0] == '\\0' || csv[0] == '\\n') return NULL;
    struct ListNode *head = NULL, *tail = NULL;
    char buf[10000];
    strncpy(buf, csv, sizeof(buf)-1); buf[sizeof(buf)-1] = 0;
    char *tok = strtok(buf, ",\\n");
    while (tok) {
        struct ListNode *n = (struct ListNode*)malloc(sizeof(struct ListNode));
        n->val = atoi(tok); n->next = NULL;
        if (!head) head = tail = n; else { tail->next = n; tail = n; }
        tok = strtok(NULL, ",\\n");
    }
    return head;
}
void __printList(struct ListNode* head) {
    int first = 1;
    while (head) {
        if (!first) printf(",");
        printf("%d", head->val); first = 0;
        head = head->next;
    }
}
`,
  cpp: `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *n) : val(x), next(n) {}
};
ListNode* __buildList(const string& csv) {
    if (csv.empty()) return nullptr;
    ListNode *head = nullptr, *tail = nullptr;
    stringstream ss(csv);
    string tok;
    while (getline(ss, tok, ',')) {
        ListNode* n = new ListNode(stoi(tok));
        if (!head) head = tail = n; else { tail->next = n; tail = n; }
    }
    return head;
}
string __printList(ListNode* head) {
    string res;
    while (head) {
        if (!res.empty()) res += ",";
        res += to_string(head->val);
        head = head->next;
    }
    return res;
}
`,
};

// =====================================================================
// Problem 3: Merge Two Sorted Lists
// Input:  "1,2,4\n1,3,4"   Output: "1,1,2,3,4,4"
// =====================================================================

const mergeTwoListsWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${linkedListHelpers.javascript}
${userCode}

// --- Platform I/O Wrapper ---
const __lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const __l1 = __buildList(__lines[0] || '');
const __l2 = __buildList(__lines[1] || '');
const __result = mergeTwoLists(__l1, __l2);
console.log(__printList(__result));
`,

  python: (userCode) =>
`import sys

${linkedListHelpers.python}
${userCode}

# --- Platform I/O Wrapper ---
__lines = sys.stdin.read().strip().split('\\n')
__l1 = __buildList(__lines[0] if len(__lines) > 0 else '')
__l2 = __buildList(__lines[1] if len(__lines) > 1 else '')
__sol = Solution()
__result = __sol.mergeTwoLists(__l1, __l2)
print(__printList(__result))
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${linkedListHelpers.java}

${userCode}

class Main {
${linkedListHelpers.javaHelpers}
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine(); if (line1 == null) line1 = "";
        String line2 = br.readLine(); if (line2 == null) line2 = "";
        ListNode l1 = buildList(line1.trim());
        ListNode l2 = buildList(line2.trim());
        Solution sol = new Solution();
        ListNode result = sol.mergeTwoLists(l1, l2);
        System.out.println(printList(result));
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${linkedListHelpers.c}

${userCode}

int main() {
    char __line1[10000] = "", __line2[10000] = "";
    if (fgets(__line1, sizeof(__line1), stdin)) __line1[strcspn(__line1, "\\n")] = 0;
    if (fgets(__line2, sizeof(__line2), stdin)) __line2[strcspn(__line2, "\\n")] = 0;
    struct ListNode *l1 = __buildList(__line1);
    struct ListNode *l2 = __buildList(__line2);
    struct ListNode *result = mergeTwoLists(l1, l2);
    __printList(result);
    printf("\\n");
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <string>
#include <sstream>
using namespace std;

${linkedListHelpers.cpp}

${userCode}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    ListNode* l1 = __buildList(line1);
    ListNode* l2 = __buildList(line2);
    Solution sol;
    ListNode* result = sol.mergeTwoLists(l1, l2);
    cout << __printList(result) << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 4: Add Two Numbers
// Input:  "2,4,3\n5,6,4"   Output: "7,0,8"
// =====================================================================

const addTwoNumbersWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${linkedListHelpers.javascript}
${userCode}

// --- Platform I/O Wrapper ---
const __lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const __l1 = __buildList(__lines[0] || '');
const __l2 = __buildList(__lines[1] || '');
const __result = addTwoNumbers(__l1, __l2);
console.log(__printList(__result));
`,

  python: (userCode) =>
`import sys

${linkedListHelpers.python}
${userCode}

# --- Platform I/O Wrapper ---
__lines = sys.stdin.read().strip().split('\\n')
__l1 = __buildList(__lines[0] if len(__lines) > 0 else '')
__l2 = __buildList(__lines[1] if len(__lines) > 1 else '')
__sol = Solution()
__result = __sol.addTwoNumbers(__l1, __l2)
print(__printList(__result))
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${linkedListHelpers.java}

${userCode}

class Main {
${linkedListHelpers.javaHelpers}
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine(); if (line1 == null) line1 = "";
        String line2 = br.readLine(); if (line2 == null) line2 = "";
        ListNode l1 = buildList(line1.trim());
        ListNode l2 = buildList(line2.trim());
        Solution sol = new Solution();
        ListNode result = sol.addTwoNumbers(l1, l2);
        System.out.println(printList(result));
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${linkedListHelpers.c}

${userCode}

int main() {
    char __line1[10000] = "", __line2[10000] = "";
    if (fgets(__line1, sizeof(__line1), stdin)) __line1[strcspn(__line1, "\\n")] = 0;
    if (fgets(__line2, sizeof(__line2), stdin)) __line2[strcspn(__line2, "\\n")] = 0;
    struct ListNode *l1 = __buildList(__line1);
    struct ListNode *l2 = __buildList(__line2);
    struct ListNode *result = addTwoNumbers(l1, l2);
    __printList(result);
    printf("\\n");
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <string>
#include <sstream>
using namespace std;

${linkedListHelpers.cpp}

${userCode}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    ListNode* l1 = __buildList(line1);
    ListNode* l2 = __buildList(line2);
    Solution sol;
    ListNode* result = sol.addTwoNumbers(l1, l2);
    cout << __printList(result) << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 5: Longest Substring Without Repeating Characters
// Input:  "abcabcbb"   Output: "3"
// =====================================================================

const longestSubstringWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${userCode}

// --- Platform I/O Wrapper ---
const __input = require('fs').readFileSync(0, 'utf8').trim();
const __result = lengthOfLongestSubstring(__input);
console.log(__result);
`,

  python: (userCode) =>
`import sys

${userCode}

# --- Platform I/O Wrapper ---
__input = sys.stdin.read().strip()
__sol = Solution()
print(__sol.lengthOfLongestSubstring(__input))
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${userCode}

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        Solution sol = new Solution();
        System.out.println(sol.lengthOfLongestSubstring(s));
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${userCode}

int main() {
    char __s[50001];
    fgets(__s, sizeof(__s), stdin);
    __s[strcspn(__s, "\\n")] = 0;
    printf("%d\\n", lengthOfLongestSubstring(__s));
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <string>
#include <unordered_set>
#include <unordered_map>
using namespace std;

${userCode}

int main() {
    string s;
    getline(cin, s);
    Solution sol;
    cout << sol.lengthOfLongestSubstring(s) << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 6: Container With Most Water
// Input:  "1,8,6,2,5,4,8,3,7"   Output: "49"
// =====================================================================

const containerWaterWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${userCode}

// --- Platform I/O Wrapper ---
const __input = require('fs').readFileSync(0, 'utf8').trim();
const __height = __input.split(',').map(Number);
console.log(maxArea(__height));
`,

  python: (userCode) =>
`import sys

${userCode}

# --- Platform I/O Wrapper ---
__input = sys.stdin.read().strip()
__height = list(map(int, __input.split(',')))
__sol = Solution()
print(__sol.maxArea(__height))
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${userCode}

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] parts = br.readLine().trim().split(",");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i].trim());
        Solution sol = new Solution();
        System.out.println(sol.maxArea(height));
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${userCode}

int main() {
    char __line[100000];
    fgets(__line, sizeof(__line), stdin);
    int __h[100000], __n = 0;
    char *__tok = strtok(__line, ",\\n");
    while (__tok) { __h[__n++] = atoi(__tok); __tok = strtok(NULL, ",\\n"); }
    printf("%d\\n", maxArea(__h, __n));
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;

${userCode}

int main() {
    string line;
    getline(cin, line);
    vector<int> height;
    stringstream ss(line);
    string tok;
    while (getline(ss, tok, ',')) height.push_back(stoi(tok));
    Solution sol;
    cout << sol.maxArea(height) << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 7: Merge k Sorted Lists
// Input:  "1,4,5\n1,3,4\n2,6" (one list per line)   Output: "1,1,2,3,4,4,5,6"
// =====================================================================

const mergeKListsWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${linkedListHelpers.javascript}
${userCode}

// --- Platform I/O Wrapper ---
const __raw = require('fs').readFileSync(0, 'utf8').trim();
const __lines = __raw === '' ? [] : __raw.split('\\n');
const __lists = __lines.map(l => __buildList(l));
const __result = mergeKLists(__lists);
console.log(__printList(__result));
`,

  python: (userCode) =>
`import sys

${linkedListHelpers.python}
${userCode}

# --- Platform I/O Wrapper ---
__raw = sys.stdin.read().strip()
__lines = __raw.split('\\n') if __raw else []
__lists = [__buildList(l) for l in __lines]
__sol = Solution()
__result = __sol.mergeKLists(__lists)
print(__printList(__result))
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${linkedListHelpers.java}

${userCode}

class Main {
${linkedListHelpers.javaHelpers}
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<ListNode> lists = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null && !line.isEmpty()) {
            lists.add(buildList(line.trim()));
        }
        Solution sol = new Solution();
        ListNode[] arr = lists.toArray(new ListNode[0]);
        ListNode result = sol.mergeKLists(arr);
        System.out.println(printList(result));
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${linkedListHelpers.c}

${userCode}

int main() {
    struct ListNode* __lists[1000];
    int __k = 0;
    char __line[10000];
    while (fgets(__line, sizeof(__line), stdin)) {
        __line[strcspn(__line, "\\n")] = 0;
        if (__line[0] == '\\0') break;
        __lists[__k++] = __buildList(__line);
    }
    int __returnSize;
    struct ListNode* result = mergeKLists(__lists, __k, &__returnSize);
    __printList(result);
    printf("\\n");
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <queue>
using namespace std;

${linkedListHelpers.cpp}

${userCode}

int main() {
    vector<ListNode*> lists;
    string line;
    while (getline(cin, line)) {
        if (line.empty()) break;
        lists.push_back(__buildList(line));
    }
    Solution sol;
    ListNode* result = sol.mergeKLists(lists);
    cout << __printList(result) << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 8: Trapping Rain Water
// Input:  "0,1,0,2,1,0,1,3,2,1,2,1"   Output: "6"
// =====================================================================

const trappingRainWaterWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${userCode}

// --- Platform I/O Wrapper ---
const __input = require('fs').readFileSync(0, 'utf8').trim();
const __height = __input.split(',').map(Number);
console.log(trap(__height));
`,

  python: (userCode) =>
`import sys

${userCode}

# --- Platform I/O Wrapper ---
__input = sys.stdin.read().strip()
__height = list(map(int, __input.split(',')))
__sol = Solution()
print(__sol.trap(__height))
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${userCode}

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String[] parts = br.readLine().trim().split(",");
        int[] height = new int[parts.length];
        for (int i = 0; i < parts.length; i++) height[i] = Integer.parseInt(parts[i].trim());
        Solution sol = new Solution();
        System.out.println(sol.trap(height));
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${userCode}

int main() {
    char __line[100000];
    fgets(__line, sizeof(__line), stdin);
    int __h[100000], __n = 0;
    char *__tok = strtok(__line, ",\\n");
    while (__tok) { __h[__n++] = atoi(__tok); __tok = strtok(NULL, ",\\n"); }
    printf("%d\\n", trap(__h, __n));
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <stack>
using namespace std;

${userCode}

int main() {
    string line;
    getline(cin, line);
    vector<int> height;
    stringstream ss(line);
    string tok;
    while (getline(ss, tok, ',')) height.push_back(stoi(tok));
    Solution sol;
    cout << sol.trap(height) << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 9: Median of Two Sorted Arrays
// Input:  "1,3\n2"   Output: "2.00000"
// =====================================================================

const medianTwoArraysWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${userCode}

// --- Platform I/O Wrapper ---
const __lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const __nums1 = __lines[0] ? __lines[0].split(',').map(Number) : [];
const __nums2 = __lines[1] ? __lines[1].split(',').map(Number) : [];
const __result = findMedianSortedArrays(__nums1, __nums2);
console.log(__result.toFixed(5));
`,

  python: (userCode) =>
`import sys

${userCode}

# --- Platform I/O Wrapper ---
__lines = sys.stdin.read().strip().split('\\n')
__nums1 = list(map(int, __lines[0].split(','))) if __lines[0] else []
__nums2 = list(map(int, __lines[1].split(','))) if len(__lines) > 1 and __lines[1] else []
__sol = Solution()
__result = __sol.findMedianSortedArrays(__nums1, __nums2)
print(f"{__result:.5f}")
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${userCode}

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine().trim();
        String line2 = br.readLine().trim();
        int[] nums1 = line1.isEmpty() ? new int[0] : Arrays.stream(line1.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        int[] nums2 = line2.isEmpty() ? new int[0] : Arrays.stream(line2.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        Solution sol = new Solution();
        double result = sol.findMedianSortedArrays(nums1, nums2);
        System.out.printf("%.5f%n", result);
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

${userCode}

int main() {
    char __line1[10000] = "", __line2[10000] = "";
    fgets(__line1, sizeof(__line1), stdin);
    fgets(__line2, sizeof(__line2), stdin);
    __line1[strcspn(__line1, "\\n")] = 0;
    __line2[strcspn(__line2, "\\n")] = 0;
    int __n1[10000], __s1 = 0, __n2[10000], __s2 = 0;
    if (__line1[0]) { char *t = strtok(__line1, ","); while(t) { __n1[__s1++]=atoi(t); t=strtok(NULL,","); } }
    if (__line2[0]) { char *t = strtok(__line2, ","); while(t) { __n2[__s2++]=atoi(t); t=strtok(NULL,","); } }
    double result = findMedianSortedArrays(__n1, __s1, __n2, __s2);
    printf("%.5f\\n", result);
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <iomanip>
#include <algorithm>
using namespace std;

${userCode}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    vector<int> nums1, nums2;
    if (!line1.empty()) { stringstream ss(line1); string t; while(getline(ss,t,',')) nums1.push_back(stoi(t)); }
    if (!line2.empty()) { stringstream ss(line2); string t; while(getline(ss,t,',')) nums2.push_back(stoi(t)); }
    Solution sol;
    double result = sol.findMedianSortedArrays(nums1, nums2);
    cout << fixed << setprecision(5) << result << endl;
    return 0;
}
`,
};

// =====================================================================
// Problem 10: Regular Expression Matching
// Input:  "aa\na"   Output: "false"
// =====================================================================

const regexMatchWrappers: ProblemWrappers = {
  javascript: (userCode) =>
`${userCode}

// --- Platform I/O Wrapper ---
const __lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');
const __s = __lines[0];
const __p = __lines[1];
console.log(isMatch(__s, __p).toString());
`,

  python: (userCode) =>
`import sys

${userCode}

# --- Platform I/O Wrapper ---
__lines = sys.stdin.read().strip().split('\\n')
__s = __lines[0]
__p = __lines[1]
__sol = Solution()
print(str(__sol.isMatch(__s, __p)).lower())
`,

  java: (userCode) =>
`import java.util.*;
import java.io.*;

${userCode}

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        String p = br.readLine().trim();
        Solution sol = new Solution();
        System.out.println(sol.isMatch(s, p));
    }
}
`,

  c: (userCode) =>
`#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

${userCode}

int main() {
    char __s[100], __p[100];
    fgets(__s, sizeof(__s), stdin); __s[strcspn(__s, "\\n")] = 0;
    fgets(__p, sizeof(__p), stdin); __p[strcspn(__p, "\\n")] = 0;
    printf("%s\\n", isMatch(__s, __p) ? "true" : "false");
    return 0;
}
`,

  cpp: (userCode) =>
`#include <iostream>
#include <string>
#include <vector>
using namespace std;

${userCode}

int main() {
    string s, p;
    getline(cin, s);
    getline(cin, p);
    Solution sol;
    cout << (sol.isMatch(s, p) ? "true" : "false") << endl;
    return 0;
}
`,
};

// =====================================================================
// Helper: Binary tree boilerplate per language
// Used by problems 14, 17
// =====================================================================

const binaryTreeHelpers = {
  javascript: `
class TreeNode {
    constructor(val, left, right) {
        this.val = (val === undefined ? 0 : val);
        this.left = (left === undefined ? null : left);
        this.right = (right === undefined ? null : right);
    }
}
function __buildBT(s) {
    if (!s || !s.trim()) return null;
    const vals = s.split(',');
    if (!vals.length || vals[0] === 'null') return null;
    const root = new TreeNode(parseInt(vals[0]));
    const q = [root]; let i = 1;
    while (q.length && i < vals.length) {
        const node = q.shift();
        if (i < vals.length) { if (vals[i] !== 'null') { node.left = new TreeNode(parseInt(vals[i])); q.push(node.left); } i++; }
        if (i < vals.length) { if (vals[i] !== 'null') { node.right = new TreeNode(parseInt(vals[i])); q.push(node.right); } i++; }
    }
    return root;
}
function __printBT(root) {
    if (!root) return '';
    const res = [], q = [root];
    while (q.length) { const n = q.shift(); if (n) { res.push(String(n.val)); q.push(n.left); q.push(n.right); } else res.push('null'); }
    while (res.length && res[res.length - 1] === 'null') res.pop();
    return res.join(',');
}
`,
  python: `
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def __buildBT(s):
    if not s or not s.strip():
        return None
    vals = s.split(',')
    if not vals or vals[0] == 'null':
        return None
    root = TreeNode(int(vals[0]))
    q = deque([root]); i = 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals):
            if vals[i] != 'null':
                node.left = TreeNode(int(vals[i]))
                q.append(node.left)
            i += 1
        if i < len(vals):
            if vals[i] != 'null':
                node.right = TreeNode(int(vals[i]))
                q.append(node.right)
            i += 1
    return root

def __printBT(root):
    if not root:
        return ''
    res = []
    q = deque([root])
    while q:
        n = q.popleft()
        if n:
            res.append(str(n.val))
            q.append(n.left)
            q.append(n.right)
        else:
            res.append('null')
    while res and res[-1] == 'null':
        res.pop()
    return ','.join(res)
`,
  java: `
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
`,
  javaHelpers: `
    static TreeNode buildBT(String s) {
        if (s == null || s.trim().isEmpty()) return null;
        String[] vals = s.split(",");
        if (vals.length == 0 || vals[0].trim().equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(vals[0].trim()));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode node = q.poll();
            if (i < vals.length) { if (!vals[i].trim().equals("null")) { node.left = new TreeNode(Integer.parseInt(vals[i].trim())); q.add(node.left); } i++; }
            if (i < vals.length) { if (!vals[i].trim().equals("null")) { node.right = new TreeNode(Integer.parseInt(vals[i].trim())); q.add(node.right); } i++; }
        }
        return root;
    }
    static String printBT(TreeNode root) {
        if (root == null) return "";
        List<String> res = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n != null) { res.add(String.valueOf(n.val)); q.add(n.left); q.add(n.right); }
            else res.add("null");
        }
        while (!res.isEmpty() && res.get(res.size()-1).equals("null")) res.remove(res.size()-1);
        return String.join(",", res);
    }
`,
  c: `
struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};
struct TreeNode* __newTN(int v) {
    struct TreeNode* n = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    n->val = v; n->left = n->right = NULL; return n;
}
struct TreeNode* __buildBT(const char* s) {
    if (!s || s[0] == '\\0' || s[0] == '\\n') return NULL;
    char buf[50000]; strncpy(buf, s, sizeof(buf)-1); buf[sizeof(buf)-1] = 0;
    char* tokens[10000]; int cnt = 0;
    char* t = strtok(buf, ","); while (t) { tokens[cnt++] = t; t = strtok(NULL, ","); }
    if (cnt == 0 || strcmp(tokens[0], "null") == 0) return NULL;
    struct TreeNode** q = (struct TreeNode**)malloc(sizeof(struct TreeNode*)*cnt);
    struct TreeNode* root = __newTN(atoi(tokens[0]));
    q[0] = root; int fr = 0, bk = 1, i = 1;
    while (fr < bk && i < cnt) {
        struct TreeNode* nd = q[fr++];
        if (i < cnt) { if (strcmp(tokens[i],"null")!=0) { nd->left = __newTN(atoi(tokens[i])); q[bk++] = nd->left; } i++; }
        if (i < cnt) { if (strcmp(tokens[i],"null")!=0) { nd->right = __newTN(atoi(tokens[i])); q[bk++] = nd->right; } i++; }
    }
    free(q); return root;
}
void __printBTHelper(struct TreeNode* root) {
    if (!root) { return; }
    struct TreeNode* q[20000]; char* res[20000]; int rc = 0, fr = 0, bk = 0;
    q[bk++] = root;
    while (fr < bk) {
        struct TreeNode* n = q[fr++];
        if (n) { char* s = (char*)malloc(20); sprintf(s, "%d", n->val); res[rc++] = s; q[bk++] = n->left; q[bk++] = n->right; }
        else { res[rc++] = strdup("null"); }
    }
    while (rc > 0 && strcmp(res[rc-1], "null") == 0) { free(res[rc-1]); rc--; }
    for (int i = 0; i < rc; i++) { if (i > 0) printf(","); printf("%s", res[i]); free(res[i]); }
}
`,
  cpp: `
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {}
};
TreeNode* __buildBT(const string& s) {
    if (s.empty()) return nullptr;
    vector<string> vals;
    stringstream ss(s); string tok;
    while (getline(ss, tok, ',')) vals.push_back(tok);
    if (vals.empty() || vals[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(vals[0]));
    queue<TreeNode*> q; q.push(root); int i = 1;
    while (!q.empty() && i < (int)vals.size()) {
        TreeNode* node = q.front(); q.pop();
        if (i < (int)vals.size()) { if (vals[i] != "null") { node->left = new TreeNode(stoi(vals[i])); q.push(node->left); } i++; }
        if (i < (int)vals.size()) { if (vals[i] != "null") { node->right = new TreeNode(stoi(vals[i])); q.push(node->right); } i++; }
    }
    return root;
}
string __printBT(TreeNode* root) {
    if (!root) return "";
    vector<string> res;
    queue<TreeNode*> q; q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        if (n) { res.push_back(to_string(n->val)); q.push(n->left); q.push(n->right); }
        else res.push_back("null");
    }
    while (!res.empty() && res.back() == "null") res.pop_back();
    string out;
    for (int i = 0; i < (int)res.size(); i++) { if (i > 0) out += ","; out += res[i]; }
    return out;
}
`,
};

// =====================================================================
// Problem 11: Maximum Subarray
// Input: "-2,1,-3,4,-1,2,1,-5,4"  Output: "6"
// =====================================================================

const maxSubarrayWrappers: ProblemWrappers = {
  javascript: (u) => `${u}\nconst __n=require('fs').readFileSync(0,'utf8').trim().split(',').map(Number);console.log(maxSubArray(__n));`,
  python: (u) => `import sys\n${u}\nprint(Solution().maxSubArray(list(map(int,sys.stdin.read().strip().split(',')))))`,
  java: (u) => `import java.util.*;\nimport java.io.*;\n${u}\nclass Main{public static void main(String[] a)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(System.in));String[] p=br.readLine().trim().split(",");int[] n=new int[p.length];for(int i=0;i<p.length;i++)n[i]=Integer.parseInt(p[i].trim());System.out.println(new Solution().maxSubArray(n));}}`,
  c: (u) => `#include<stdio.h>\n#include<stdlib.h>\n#include<string.h>\n${u}\nint main(){char l[500000];fgets(l,sizeof(l),stdin);int n[100000],sz=0;char*t=strtok(l,",\\n");while(t){n[sz++]=atoi(t);t=strtok(NULL,",\\n");}printf("%d\\n",maxSubArray(n,sz));return 0;}`,
  cpp: (u) => `#include<iostream>\n#include<vector>\n#include<string>\n#include<sstream>\n#include<climits>\nusing namespace std;\n${u}\nint main(){string l;getline(cin,l);vector<int>n;stringstream ss(l);string t;while(getline(ss,t,','))n.push_back(stoi(t));Solution s;cout<<s.maxSubArray(n)<<endl;return 0;}`,
};

// =====================================================================
// Problem 12: Climbing Stairs
// Input: "3"  Output: "3"
// =====================================================================

const climbingStairsWrappers: ProblemWrappers = {
  javascript: (u) => `${u}\nconst __n=parseInt(require('fs').readFileSync(0,'utf8').trim());console.log(climbStairs(__n));`,
  python: (u) => `import sys\n${u}\nprint(Solution().climbStairs(int(sys.stdin.read().strip())))`,
  java: (u) => `import java.util.*;\nimport java.io.*;\n${u}\nclass Main{public static void main(String[] a)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(System.in));System.out.println(new Solution().climbStairs(Integer.parseInt(br.readLine().trim())));}}`,
  c: (u) => `#include<stdio.h>\n${u}\nint main(){int n;scanf("%d",&n);printf("%d\\n",climbStairs(n));return 0;}`,
  cpp: (u) => `#include<iostream>\nusing namespace std;\n${u}\nint main(){int n;cin>>n;Solution s;cout<<s.climbStairs(n)<<endl;return 0;}`,
};

// =====================================================================
// Problem 13: 3Sum
// Input: "-1,0,1,2,-1,-4"  Output: "-1,-1,2;-1,0,1"
// =====================================================================

const threeSumWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __nums=__input.split(',').map(Number);
const __res=threeSum(__nums);
__res.forEach(t=>t.sort((a,b)=>a-b));
__res.sort((a,b)=>{for(let i=0;i<3;i++){if(a[i]!==b[i])return a[i]-b[i];}return 0;});
console.log(__res.map(t=>t.join(',')).join(';'));
`,
  python: (u) => `import sys
${u}
__nums=list(map(int,sys.stdin.read().strip().split(',')))
__res=Solution().threeSum(__nums)
__res=[sorted(t) for t in __res]
__res.sort()
print(';'.join(','.join(map(str,t)) for t in __res))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String[] p=br.readLine().trim().split(",");
int[] nums=new int[p.length];for(int i=0;i<p.length;i++)nums[i]=Integer.parseInt(p[i].trim());
Solution sol=new Solution();
List<List<Integer>> res=sol.threeSum(nums);
for(List<Integer> t:res)Collections.sort(t);
res.sort((x,y)->{for(int i=0;i<Math.min(x.size(),y.size());i++){int c=Integer.compare(x.get(i),y.get(i));if(c!=0)return c;}return Integer.compare(x.size(),y.size());});
StringBuilder sb=new StringBuilder();
for(int i=0;i<res.size();i++){if(i>0)sb.append(";");List<Integer> t=res.get(i);for(int j=0;j<t.size();j++){if(j>0)sb.append(",");sb.append(t.get(j));}}
System.out.println(sb);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int __cmp(const void*a,const void*b){const int*x=*(const int**)a,*y=*(const int**)b;for(int i=0;i<3;i++){if(x[i]!=y[i])return x[i]-y[i];}return 0;}
int main(){char l[500000];fgets(l,sizeof(l),stdin);int nums[100000],sz=0;char*t=strtok(l,",\\n");while(t){nums[sz++]=atoi(t);t=strtok(NULL,",\\n");}
int rs;int** rcs;int** res=threeSum(nums,sz,&rs,&rcs);
qsort(res,rs,sizeof(int*),__cmp);
for(int i=0;i<rs;i++){if(i>0)printf(";");for(int j=0;j<rcs[i][0];j++){if(j>0)printf(",");printf("%d",res[i][j]);}free(res[i]);free(rcs[i]);}
if(rs>0)printf("\\n");free(res);free(rcs);return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
#include<algorithm>
using namespace std;
${u}
int main(){string l;getline(cin,l);vector<int>nums;stringstream ss(l);string t;while(getline(ss,t,','))nums.push_back(stoi(t));
Solution sol;auto res=sol.threeSum(nums);
for(auto&v:res)sort(v.begin(),v.end());
sort(res.begin(),res.end());
for(int i=0;i<(int)res.size();i++){if(i>0)cout<<";";for(int j=0;j<(int)res[i].size();j++){if(j>0)cout<<",";cout<<res[i][j];}}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 14: Binary Tree Level Order Traversal
// Input: "3,9,20,null,null,15,7"  Output: "3;9,20;15,7"
// =====================================================================

const levelOrderWrappers: ProblemWrappers = {
  javascript: (u) => `${binaryTreeHelpers.javascript}
${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __root=__buildBT(__input);
const __res=levelOrder(__root);
console.log(__res.map(lv=>lv.join(',')).join(';'));
`,
  python: (u) => `import sys
${binaryTreeHelpers.python}
${u}
__input=sys.stdin.read().strip()
__root=__buildBT(__input)
__res=Solution().levelOrder(__root)
print(';'.join(','.join(map(str,lv)) for lv in __res) if __res else '')
`,
  java: (u) => `import java.util.*;
import java.io.*;
${binaryTreeHelpers.java}
${u}
class Main{
${binaryTreeHelpers.javaHelpers}
public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String line=br.readLine();if(line==null)line="";
TreeNode root=buildBT(line.trim());
Solution sol=new Solution();
List<List<Integer>> res=sol.levelOrder(root);
StringBuilder sb=new StringBuilder();
for(int i=0;i<res.size();i++){if(i>0)sb.append(";");List<Integer> lv=res.get(i);for(int j=0;j<lv.size();j++){if(j>0)sb.append(",");sb.append(lv.get(j));}}
System.out.println(sb);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${binaryTreeHelpers.c}
${u}
int main(){char l[50000]="";fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
struct TreeNode* root=__buildBT(l);
int rs;int** rcs;int** res=levelOrder(root,&rs,&rcs);
for(int i=0;i<rs;i++){if(i>0)printf(";");for(int j=0;j<rcs[i][0];j++){if(j>0)printf(",");printf("%d",res[i][j]);}}
if(rs>0)printf("\\n");return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
#include<queue>
using namespace std;
${binaryTreeHelpers.cpp}
${u}
int main(){string l;getline(cin,l);
TreeNode* root=__buildBT(l);
Solution sol;auto res=sol.levelOrder(root);
for(int i=0;i<(int)res.size();i++){if(i>0)cout<<";";for(int j=0;j<(int)res[i].size();j++){if(j>0)cout<<",";cout<<res[i][j];}}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 15: Word Search
// Input: "ABCE,SFCS,ADEE\nABCCED"  Output: "true"
// =====================================================================

const wordSearchWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __lines=require('fs').readFileSync(0,'utf8').trim().split('\\n');
const __board=__lines[0].split(',').map(r=>[...r]);
const __word=__lines[1];
console.log(exist(__board,__word).toString());
`,
  python: (u) => `import sys
${u}
__lines=sys.stdin.read().strip().split('\\n')
__board=[list(r) for r in __lines[0].split(',')]
__word=__lines[1]
print(str(Solution().exist(__board,__word)).lower())
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String[] rows=br.readLine().trim().split(",");
char[][] board=new char[rows.length][];
for(int i=0;i<rows.length;i++)board[i]=rows[i].toCharArray();
String word=br.readLine().trim();
System.out.println(new Solution().exist(board,word));}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<stdbool.h>
${u}
int main(){char l1[10000],l2[10000];fgets(l1,sizeof(l1),stdin);l1[strcspn(l1,"\\n")]=0;fgets(l2,sizeof(l2),stdin);l2[strcspn(l2,"\\n")]=0;
char* rows[100];int nr=0;char*t=strtok(l1,",");while(t){rows[nr++]=t;t=strtok(NULL,",");}
char** board=(char**)malloc(nr*sizeof(char*));int* cs=(int*)malloc(nr*sizeof(int));
for(int i=0;i<nr;i++){board[i]=rows[i];cs[i]=strlen(rows[i]);}
printf("%s\\n",exist(board,nr,cs,l2)?"true":"false");free(board);free(cs);return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
using namespace std;
${u}
int main(){string l1,l2;getline(cin,l1);getline(cin,l2);
vector<vector<char>> board;stringstream ss(l1);string tok;
while(getline(ss,tok,',')){board.push_back(vector<char>(tok.begin(),tok.end()));}
Solution sol;cout<<(sol.exist(board,l2)?"true":"false")<<endl;return 0;}
`,
};

// =====================================================================
// Problem 16: Word Ladder
// Input: "hit\ncog\nhot,dot,dog,lot,log,cog"  Output: "5"
// =====================================================================

const wordLadderWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __lines=require('fs').readFileSync(0,'utf8').trim().split('\\n');
const __wl=__lines[2].split(',');
console.log(ladderLength(__lines[0],__lines[1],__wl));
`,
  python: (u) => `import sys
${u}
__lines=sys.stdin.read().strip().split('\\n')
__wl=__lines[2].split(',')
print(Solution().ladderLength(__lines[0],__lines[1],__wl))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String bw=br.readLine().trim(),ew=br.readLine().trim();
String[] wds=br.readLine().trim().split(",");
List<String> wl=new ArrayList<>(Arrays.asList(wds));
System.out.println(new Solution().ladderLength(bw,ew,wl));}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int main(){char bw[20],ew[20],wline[50000];fgets(bw,sizeof(bw),stdin);bw[strcspn(bw,"\\n")]=0;
fgets(ew,sizeof(ew),stdin);ew[strcspn(ew,"\\n")]=0;
fgets(wline,sizeof(wline),stdin);wline[strcspn(wline,"\\n")]=0;
char* wl[5000];int wc=0;char*t=strtok(wline,",");while(t){wl[wc++]=t;t=strtok(NULL,",");}
printf("%d\\n",ladderLength(bw,ew,wl,wc));return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
#include<queue>
#include<unordered_set>
using namespace std;
${u}
int main(){string bw,ew,wline;getline(cin,bw);getline(cin,ew);getline(cin,wline);
vector<string> wl;stringstream ss(wline);string t;while(getline(ss,t,','))wl.push_back(t);
Solution sol;cout<<sol.ladderLength(bw,ew,wl)<<endl;return 0;}
`,
};

// =====================================================================
// Problem 17: Serialize and Deserialize Binary Tree
// Input: "1,2,3,null,null,4,5"  Output: "1,2,3,null,null,4,5"
// =====================================================================

const serializeDeserializeWrappers: ProblemWrappers = {
  javascript: (u) => `${binaryTreeHelpers.javascript}
${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __root=__buildBT(__input);
const __codec=new Codec();
const __ser=__codec.serialize(__root);
const __des=__codec.deserialize(__ser);
console.log(__printBT(__des));
`,
  python: (u) => `import sys
${binaryTreeHelpers.python}
${u}
__input=sys.stdin.read().strip()
__root=__buildBT(__input)
__codec=Codec()
__ser=__codec.serialize(__root)
__des=__codec.deserialize(__ser)
print(__printBT(__des))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${binaryTreeHelpers.java}
${u}
class Main{
${binaryTreeHelpers.javaHelpers}
public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String line=br.readLine();if(line==null)line="";
TreeNode root=buildBT(line.trim());
Codec codec=new Codec();
String ser=codec.serialize(root);
TreeNode des=codec.deserialize(ser);
System.out.println(printBT(des));}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${binaryTreeHelpers.c}
${u}
int main(){char l[50000]="";fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
struct TreeNode* root=__buildBT(l);
char* ser=serialize(root);
struct TreeNode* des=deserialize(ser);
__printBTHelper(des);printf("\\n");return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
#include<queue>
using namespace std;
${binaryTreeHelpers.cpp}
${u}
int main(){string l;getline(cin,l);
TreeNode* root=__buildBT(l);
Codec codec;
string ser=codec.serialize(root);
TreeNode* des=codec.deserialize(ser);
cout<<__printBT(des)<<endl;return 0;}
`,
};

// =====================================================================
// Problem 18: LRU Cache
// Input: "2\nput 1 1\nput 2 2\nget 1\n..."  Output: "1,-1,-1,3,4"
// =====================================================================

const lruCacheWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __lines=require('fs').readFileSync(0,'utf8').trim().split('\\n');
const __cache=new LRUCache(parseInt(__lines[0]));
const __results=[];
for(let i=1;i<__lines.length;i++){
  const p=__lines[i].split(' ');
  if(p[0]==='put')__cache.put(parseInt(p[1]),parseInt(p[2]));
  else if(p[0]==='get')__results.push(__cache.get(parseInt(p[1])));
}
console.log(__results.join(','));
`,
  python: (u) => `import sys
${u}
__lines=sys.stdin.read().strip().split('\\n')
__cache=LRUCache(int(__lines[0]))
__results=[]
for __line in __lines[1:]:
    __parts=__line.split()
    if __parts[0]=='put':
        __cache.put(int(__parts[1]),int(__parts[2]))
    elif __parts[0]=='get':
        __results.append(str(__cache.get(int(__parts[1]))))
print(','.join(__results))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
int cap=Integer.parseInt(br.readLine().trim());
LRUCache cache=new LRUCache(cap);
List<String> results=new ArrayList<>();
String line;
while((line=br.readLine())!=null&&!line.isEmpty()){
String[] p=line.trim().split(" ");
if(p[0].equals("put"))cache.put(Integer.parseInt(p[1]),Integer.parseInt(p[2]));
else if(p[0].equals("get"))results.add(String.valueOf(cache.get(Integer.parseInt(p[1]))));
}
System.out.println(String.join(",",results));}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int main(){int cap;scanf("%d\\n",&cap);
LRUCache* cache=lRUCacheCreate(cap);
char line[256];int resArr[100000],rc=0;
while(fgets(line,sizeof(line),stdin)){
line[strcspn(line,"\\n")]=0;if(!line[0])break;
if(strncmp(line,"put",3)==0){int k,v;sscanf(line+4,"%d %d",&k,&v);lRUCachePut(cache,k,v);}
else if(strncmp(line,"get",3)==0){int k;sscanf(line+4,"%d",&k);resArr[rc++]=lRUCacheGet(cache,k);}
}
for(int i=0;i<rc;i++){if(i>0)printf(",");printf("%d",resArr[i]);}
if(rc>0)printf("\\n");lRUCacheFree(cache);return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<string>
#include<sstream>
#include<vector>
#include<unordered_map>
#include<list>
using namespace std;
${u}
int main(){string line;getline(cin,line);int cap=stoi(line);
LRUCache cache(cap);
vector<int> results;
while(getline(cin,line)){
if(line.empty())break;
istringstream iss(line);string op;iss>>op;
if(op=="put"){int k,v;iss>>k>>v;cache.put(k,v);}
else if(op=="get"){int k;iss>>k;results.push_back(cache.get(k));}
}
for(int i=0;i<(int)results.size();i++){if(i>0)cout<<",";cout<<results[i];}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 19: Reverse Linked List
// Input: "1,2,3,4,5"  Output: "5,4,3,2,1"
// =====================================================================

const reverseLinkedListWrappers: ProblemWrappers = {
  javascript: (u) => `${linkedListHelpers.javascript}
${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __head=__buildList(__input);
const __res=reverseList(__head);
console.log(__printList(__res));
`,
  python: (u) => `import sys
${linkedListHelpers.python}
${u}
__input=sys.stdin.read().strip()
__head=__buildList(__input)
__res=Solution().reverseList(__head)
print(__printList(__res))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${linkedListHelpers.java}
${u}
class Main{
${linkedListHelpers.javaHelpers}
public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String line=br.readLine();if(line==null)line="";
ListNode head=buildList(line.trim());
ListNode res=new Solution().reverseList(head);
System.out.println(printList(res));}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${linkedListHelpers.c}
${u}
int main(){char l[50000]="";fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
struct ListNode* head=__buildList(l);
struct ListNode* res=reverseList(head);
__printList(res);printf("\\n");return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<string>
#include<sstream>
using namespace std;
${linkedListHelpers.cpp}
${u}
int main(){string l;getline(cin,l);
ListNode* head=__buildList(l);
Solution sol;
ListNode* res=sol.reverseList(head);
cout<<__printList(res)<<endl;return 0;}
`,
};

// =====================================================================
// Problem 20: Best Time to Buy and Sell Stock
// Input: "7,1,5,3,6,4"  Output: "5"
// =====================================================================

const buyAndSellStockWrappers: ProblemWrappers = {
  javascript: (u) => `${u}\nconst __n=require('fs').readFileSync(0,'utf8').trim().split(',').map(Number);console.log(maxProfit(__n));`,
  python: (u) => `import sys\n${u}\nprint(Solution().maxProfit(list(map(int,sys.stdin.read().strip().split(',')))))`,
  java: (u) => `import java.util.*;\nimport java.io.*;\n${u}\nclass Main{public static void main(String[] a)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(System.in));String[] p=br.readLine().trim().split(",");int[] n=new int[p.length];for(int i=0;i<p.length;i++)n[i]=Integer.parseInt(p[i].trim());System.out.println(new Solution().maxProfit(n));}}`,
  c: (u) => `#include<stdio.h>\n#include<stdlib.h>\n#include<string.h>\n${u}\nint main(){char l[500000];fgets(l,sizeof(l),stdin);int n[100000],sz=0;char*t=strtok(l,",\\n");while(t){n[sz++]=atoi(t);t=strtok(NULL,",\\n");}printf("%d\\n",maxProfit(n,sz));return 0;}`,
  cpp: (u) => `#include<iostream>\n#include<vector>\n#include<string>\n#include<sstream>\nusing namespace std;\n${u}\nint main(){string l;getline(cin,l);vector<int>n;stringstream ss(l);string t;while(getline(ss,t,','))n.push_back(stoi(t));Solution s;cout<<s.maxProfit(n)<<endl;return 0;}`,
};

// =====================================================================
// Problem 21: Rotate Image
// Input: "1,2,3;4,5,6;7,8,9"  Output: "7,4,1;8,5,2;9,6,3"
// =====================================================================

const rotateImageWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __m=__input.split(';').map(r=>r.split(',').map(Number));
rotate(__m);
console.log(__m.map(r=>r.join(',')).join(';'));
`,
  python: (u) => `import sys
${u}
__input=sys.stdin.read().strip()
__m=[list(map(int,r.split(','))) for r in __input.split(';')]
Solution().rotate(__m)
print(';'.join(','.join(map(str,r)) for r in __m))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String[] rows=br.readLine().trim().split(";");
int n=rows.length;int[][] m=new int[n][];
for(int i=0;i<n;i++){String[] c=rows[i].split(",");m[i]=new int[c.length];for(int j=0;j<c.length;j++)m[i][j]=Integer.parseInt(c[j].trim());}
new Solution().rotate(m);
StringBuilder sb=new StringBuilder();
for(int i=0;i<n;i++){if(i>0)sb.append(";");for(int j=0;j<m[i].length;j++){if(j>0)sb.append(",");sb.append(m[i][j]);}}
System.out.println(sb);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int main(){char l[50000];fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
char* rowStrs[100];int nr=0;char*t=strtok(l,";");while(t){rowStrs[nr++]=t;t=strtok(NULL,";");}
int** m=(int**)malloc(nr*sizeof(int*));int* cs=(int*)malloc(nr*sizeof(int));
for(int i=0;i<nr;i++){
  char tmp[5000];strcpy(tmp,rowStrs[i]);
  int vals[100],vc=0;char*t2=strtok(tmp,",");while(t2){vals[vc++]=atoi(t2);t2=strtok(NULL,",");}
  m[i]=(int*)malloc(vc*sizeof(int));cs[i]=vc;for(int j=0;j<vc;j++)m[i][j]=vals[j];
}
rotate(m,nr,cs);
for(int i=0;i<nr;i++){if(i>0)printf(";");for(int j=0;j<cs[i];j++){if(j>0)printf(",");printf("%d",m[i][j]);}free(m[i]);}
printf("\\n");free(m);free(cs);return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
using namespace std;
${u}
int main(){string l;getline(cin,l);
vector<vector<int>> m;stringstream ss(l);string row;
while(getline(ss,row,';')){vector<int>r;stringstream rs(row);string v;while(getline(rs,v,','))r.push_back(stoi(v));m.push_back(r);}
Solution sol;sol.rotate(m);
for(int i=0;i<(int)m.size();i++){if(i>0)cout<<";";for(int j=0;j<(int)m[i].size();j++){if(j>0)cout<<",";cout<<m[i][j];}}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 22: Group Anagrams
// Input: "eat,tea,tan,ate,nat,bat"  Output: "bat;nat,tan;ate,eat,tea"
// =====================================================================

const groupAnagramsWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __strs=__input?__input.split(','):[''];
const __res=groupAnagrams(__strs);
__res.forEach(g=>g.sort());
__res.sort((a,b)=>a[0].localeCompare(b[0]));
console.log(__res.map(g=>g.join(',')).join(';'));
`,
  python: (u) => `import sys
${u}
__input=sys.stdin.read().strip()
__strs=__input.split(',') if __input else ['']
__res=Solution().groupAnagrams(__strs)
__res=[sorted(g) for g in __res]
__res.sort(key=lambda g:g[0])
print(';'.join(','.join(g) for g in __res))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String line=br.readLine().trim();
String[] strs=line.isEmpty()?new String[]{""}:line.split(",");
Solution sol=new Solution();
List<List<String>> res=sol.groupAnagrams(strs);
for(List<String> g:res)Collections.sort(g);
res.sort((x,y)->x.get(0).compareTo(y.get(0)));
StringBuilder sb=new StringBuilder();
for(int i=0;i<res.size();i++){if(i>0)sb.append(";");List<String>g=res.get(i);for(int j=0;j<g.size();j++){if(j>0)sb.append(",");sb.append(g.get(j));}}
System.out.println(sb);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int __cmpStr(const void*a,const void*b){return strcmp(*(const char**)a,*(const char**)b);}
int __cmpGrp(const void*a,const void*b){return strcmp((*(const char***)a)[0],(*(const char***)b)[0]);}
int main(){char l[100000];fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
char* strs[10000];int sc=0;
if(l[0]=='\\0'){strs[0]="";sc=1;}else{char*t=strtok(l,",");while(t){strs[sc++]=t;t=strtok(NULL,",");}}
int rs;int** rcs;
char*** res=groupAnagrams(strs,sc,&rs,rcs);
for(int i=0;i<rs;i++)qsort(res[i],rcs[i][0],sizeof(char*),__cmpStr);
qsort(res,rs,sizeof(char**),__cmpGrp);
for(int i=0;i<rs;i++){if(i>0)printf(";");for(int j=0;j<rcs[i][0];j++){if(j>0)printf(",");printf("%s",res[i][j]);}}
printf("\\n");return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
#include<algorithm>
#include<unordered_map>
using namespace std;
${u}
int main(){string l;getline(cin,l);
vector<string> strs;
if(l.empty())strs.push_back("");
else{stringstream ss(l);string t;while(getline(ss,t,','))strs.push_back(t);}
Solution sol;auto res=sol.groupAnagrams(strs);
for(auto&g:res)sort(g.begin(),g.end());
sort(res.begin(),res.end(),[](const vector<string>&a,const vector<string>&b){return a[0]<b[0];});
for(int i=0;i<(int)res.size();i++){if(i>0)cout<<";";for(int j=0;j<(int)res[i].size();j++){if(j>0)cout<<",";cout<<res[i][j];}}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 23: Jump Game
// Input: "2,3,1,1,4"  Output: "true"
// =====================================================================

const jumpGameWrappers: ProblemWrappers = {
  javascript: (u) => `${u}\nconst __n=require('fs').readFileSync(0,'utf8').trim().split(',').map(Number);console.log(canJump(__n).toString());`,
  python: (u) => `import sys\n${u}\nprint(str(Solution().canJump(list(map(int,sys.stdin.read().strip().split(','))))).lower())`,
  java: (u) => `import java.util.*;\nimport java.io.*;\n${u}\nclass Main{public static void main(String[] a)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(System.in));String[] p=br.readLine().trim().split(",");int[] n=new int[p.length];for(int i=0;i<p.length;i++)n[i]=Integer.parseInt(p[i].trim());System.out.println(new Solution().canJump(n));}}`,
  c: (u) => `#include<stdio.h>\n#include<stdlib.h>\n#include<string.h>\n#include<stdbool.h>\n${u}\nint main(){char l[500000];fgets(l,sizeof(l),stdin);int n[100000],sz=0;char*t=strtok(l,",\\n");while(t){n[sz++]=atoi(t);t=strtok(NULL,",\\n");}printf("%s\\n",canJump(n,sz)?"true":"false");return 0;}`,
  cpp: (u) => `#include<iostream>\n#include<vector>\n#include<string>\n#include<sstream>\nusing namespace std;\n${u}\nint main(){string l;getline(cin,l);vector<int>n;stringstream ss(l);string t;while(getline(ss,t,','))n.push_back(stoi(t));Solution s;cout<<(s.canJump(n)?"true":"false")<<endl;return 0;}`,
};

// =====================================================================
// Problem 24: Find First and Last Position
// Input: "5,7,7,8,8,10\n8"  Output: "3,4"
// =====================================================================

const searchRangeWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __lines=require('fs').readFileSync(0,'utf8').trim().split('\\n');
const __nums=__lines[0]?__lines[0].split(',').map(Number):[];
const __target=parseInt(__lines[1]);
const __res=searchRange(__nums,__target);
console.log(__res.join(','));
`,
  python: (u) => `import sys
${u}
__lines=sys.stdin.read().strip().split('\\n')
__nums=list(map(int,__lines[0].split(','))) if __lines[0] else []
__target=int(__lines[1])
__res=Solution().searchRange(__nums,__target)
print(','.join(map(str,__res)))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String line1=br.readLine().trim();
int[] nums=line1.isEmpty()?new int[0]:Arrays.stream(line1.split(",")).mapToInt(s->Integer.parseInt(s.trim())).toArray();
int target=Integer.parseInt(br.readLine().trim());
int[] res=new Solution().searchRange(nums,target);
System.out.println(res[0]+","+res[1]);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int main(){char l[500000];fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
int nums[100000],sz=0;
if(l[0]){char*t=strtok(l,",");while(t){nums[sz++]=atoi(t);t=strtok(NULL,",");}}
char tl[100];fgets(tl,sizeof(tl),stdin);int target=atoi(tl);
int rs;int* res=searchRange(nums,sz,target,&rs);
printf("%d,%d\\n",res[0],res[1]);free(res);return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
using namespace std;
${u}
int main(){string l1,l2;getline(cin,l1);getline(cin,l2);
vector<int>nums;if(!l1.empty()){stringstream ss(l1);string t;while(getline(ss,t,','))nums.push_back(stoi(t));}
int target=stoi(l2);
Solution sol;auto res=sol.searchRange(nums,target);
cout<<res[0]<<","<<res[1]<<endl;return 0;}
`,
};

// =====================================================================
// Problem 25: Unique Paths
// Input: "3\n7"  Output: "28"
// =====================================================================

const uniquePathsWrappers: ProblemWrappers = {
  javascript: (u) => `${u}\nconst __l=require('fs').readFileSync(0,'utf8').trim().split('\\n');console.log(uniquePaths(parseInt(__l[0]),parseInt(__l[1])));`,
  python: (u) => `import sys\n${u}\n__l=sys.stdin.read().strip().split('\\n')\nprint(Solution().uniquePaths(int(__l[0]),int(__l[1])))`,
  java: (u) => `import java.util.*;\nimport java.io.*;\n${u}\nclass Main{public static void main(String[] a)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(System.in));int m=Integer.parseInt(br.readLine().trim()),n=Integer.parseInt(br.readLine().trim());System.out.println(new Solution().uniquePaths(m,n));}}`,
  c: (u) => `#include<stdio.h>\n${u}\nint main(){int m,n;scanf("%d",&m);scanf("%d",&n);printf("%d\\n",uniquePaths(m,n));return 0;}`,
  cpp: (u) => `#include<iostream>\nusing namespace std;\n${u}\nint main(){int m,n;cin>>m>>n;Solution s;cout<<s.uniquePaths(m,n)<<endl;return 0;}`,
};

// =====================================================================
// Problem 26: Permutations
// Input: "1,2,3"  Output: "1,2,3;1,3,2;2,1,3;2,3,1;3,1,2;3,2,1"
// =====================================================================

const permutationsWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __nums=__input.split(',').map(Number);
const __res=permute(__nums);
__res.sort((a,b)=>{for(let i=0;i<a.length;i++){if(a[i]!==b[i])return a[i]-b[i];}return 0;});
console.log(__res.map(p=>p.join(',')).join(';'));
`,
  python: (u) => `import sys
${u}
__nums=list(map(int,sys.stdin.read().strip().split(',')))
__res=Solution().permute(__nums)
__res.sort()
print(';'.join(','.join(map(str,p)) for p in __res))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String[] p=br.readLine().trim().split(",");
int[] nums=new int[p.length];for(int i=0;i<p.length;i++)nums[i]=Integer.parseInt(p[i].trim());
Solution sol=new Solution();
List<List<Integer>> res=sol.permute(nums);
res.sort((x,y)->{for(int i=0;i<Math.min(x.size(),y.size());i++){int c=Integer.compare(x.get(i),y.get(i));if(c!=0)return c;}return Integer.compare(x.size(),y.size());});
StringBuilder sb=new StringBuilder();
for(int i=0;i<res.size();i++){if(i>0)sb.append(";");List<Integer>t=res.get(i);for(int j=0;j<t.size();j++){if(j>0)sb.append(",");sb.append(t.get(j));}}
System.out.println(sb);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int __cmpPerm(const void*a,const void*b){const int*x=*(const int**)a,*y=*(const int**)b;int len=3;for(int i=0;i<len;i++){if(x[i]!=y[i])return x[i]-y[i];}return 0;}
int main(){char l[10000];fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
int nums[20],sz=0;char*t=strtok(l,",");while(t){nums[sz++]=atoi(t);t=strtok(NULL,",");}
int rs;int** rcs;int** res=permute(nums,sz,&rs,&rcs);
qsort(res,rs,sizeof(int*),__cmpPerm);
for(int i=0;i<rs;i++){if(i>0)printf(";");for(int j=0;j<rcs[i][0];j++){if(j>0)printf(",");printf("%d",res[i][j]);}}
printf("\\n");return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
#include<algorithm>
using namespace std;
${u}
int main(){string l;getline(cin,l);
vector<int>nums;stringstream ss(l);string t;while(getline(ss,t,','))nums.push_back(stoi(t));
Solution sol;auto res=sol.permute(nums);
sort(res.begin(),res.end());
for(int i=0;i<(int)res.size();i++){if(i>0)cout<<";";for(int j=0;j<(int)res[i].size();j++){if(j>0)cout<<",";cout<<res[i][j];}}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 27: Minimum Path Sum
// Input: "1,3,1;1,5,1;4,2,1"  Output: "7"
// =====================================================================

const minPathSumWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __grid=__input.split(';').map(r=>r.split(',').map(Number));
console.log(minPathSum(__grid));
`,
  python: (u) => `import sys
${u}
__input=sys.stdin.read().strip()
__grid=[list(map(int,r.split(','))) for r in __input.split(';')]
print(Solution().minPathSum(__grid))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String[] rows=br.readLine().trim().split(";");
int[][] grid=new int[rows.length][];
for(int i=0;i<rows.length;i++){String[] c=rows[i].split(",");grid[i]=new int[c.length];for(int j=0;j<c.length;j++)grid[i][j]=Integer.parseInt(c[j].trim());}
System.out.println(new Solution().minPathSum(grid));}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int main(){char l[50000];fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
char* rowStrs[200];int nr=0;char*t=strtok(l,";");while(t){rowStrs[nr++]=t;t=strtok(NULL,";");}
int** g=(int**)malloc(nr*sizeof(int*));int* cs=(int*)malloc(nr*sizeof(int));
for(int i=0;i<nr;i++){char tmp[5000];strcpy(tmp,rowStrs[i]);int vals[200],vc=0;char*t2=strtok(tmp,",");while(t2){vals[vc++]=atoi(t2);t2=strtok(NULL,",");}g[i]=(int*)malloc(vc*sizeof(int));cs[i]=vc;for(int j=0;j<vc;j++)g[i][j]=vals[j];}
printf("%d\\n",minPathSum(g,nr,cs));return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
using namespace std;
${u}
int main(){string l;getline(cin,l);
vector<vector<int>> grid;stringstream ss(l);string row;
while(getline(ss,row,';')){vector<int>r;stringstream rs(row);string v;while(getline(rs,v,','))r.push_back(stoi(v));grid.push_back(r);}
Solution sol;cout<<sol.minPathSum(grid)<<endl;return 0;}
`,
};

// =====================================================================
// Problem 28: Palindrome Partitioning
// Input: "aab"  Output: "a,a,b;aa,b"
// =====================================================================

const palindromePartitionWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __res=partition(__input);
__res.sort((a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++){if(a[i]!==b[i])return a[i]<b[i]?-1:1;}return a.length-b.length;});
console.log(__res.map(p=>p.join(',')).join(';'));
`,
  python: (u) => `import sys
${u}
__input=sys.stdin.read().strip()
__res=Solution().partition(__input)
__res.sort()
print(';'.join(','.join(p) for p in __res))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String s=br.readLine().trim();
Solution sol=new Solution();
List<List<String>> res=sol.partition(s);
res.sort((x,y)->{for(int i=0;i<Math.min(x.size(),y.size());i++){int c=x.get(i).compareTo(y.get(i));if(c!=0)return c;}return Integer.compare(x.size(),y.size());});
StringBuilder sb=new StringBuilder();
for(int i=0;i<res.size();i++){if(i>0)sb.append(";");List<String>p=res.get(i);for(int j=0;j<p.size();j++){if(j>0)sb.append(",");sb.append(p.get(j));}}
System.out.println(sb);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int main(){char s[20];fgets(s,sizeof(s),stdin);s[strcspn(s,"\\n")]=0;
int rs;int** rcs;
char*** res=partition(s,&rs,rcs);
for(int i=0;i<rs;i++){if(i>0)printf(";");for(int j=0;j<rcs[i][0];j++){if(j>0)printf(",");printf("%s",res[i][j]);}}
printf("\\n");return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<algorithm>
using namespace std;
${u}
int main(){string s;getline(cin,s);
Solution sol;auto res=sol.partition(s);
sort(res.begin(),res.end());
for(int i=0;i<(int)res.size();i++){if(i>0)cout<<";";for(int j=0;j<(int)res[i].size();j++){if(j>0)cout<<",";cout<<res[i][j];}}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 29: Merge Intervals
// Input: "1,3;2,6;8,10;15,18"  Output: "1,6;8,10;15,18"
// =====================================================================

const mergeIntervalsWrappers: ProblemWrappers = {
  javascript: (u) => `${u}
const __input=require('fs').readFileSync(0,'utf8').trim();
const __intervals=__input.split(';').map(s=>s.split(',').map(Number));
const __res=merge(__intervals);
console.log(__res.map(i=>i.join(',')).join(';'));
`,
  python: (u) => `import sys
${u}
__input=sys.stdin.read().strip()
__intervals=[list(map(int,s.split(','))) for s in __input.split(';')]
__res=Solution().merge(__intervals)
print(';'.join(','.join(map(str,i)) for i in __res))
`,
  java: (u) => `import java.util.*;
import java.io.*;
${u}
class Main{public static void main(String[] a)throws Exception{
BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
String[] parts=br.readLine().trim().split(";");
int[][] intervals=new int[parts.length][2];
for(int i=0;i<parts.length;i++){String[] c=parts[i].split(",");intervals[i][0]=Integer.parseInt(c[0].trim());intervals[i][1]=Integer.parseInt(c[1].trim());}
int[][] res=new Solution().merge(intervals);
StringBuilder sb=new StringBuilder();
for(int i=0;i<res.length;i++){if(i>0)sb.append(";");sb.append(res[i][0]).append(",").append(res[i][1]);}
System.out.println(sb);}}
`,
  c: (u) => `#include<stdio.h>
#include<stdlib.h>
#include<string.h>
${u}
int main(){char l[50000];fgets(l,sizeof(l),stdin);l[strcspn(l,"\\n")]=0;
char* prs[10000];int pc=0;char*t=strtok(l,";");while(t){prs[pc++]=t;t=strtok(NULL,";");}
int** ivs=(int**)malloc(pc*sizeof(int*));int* ics=(int*)malloc(pc*sizeof(int));
for(int i=0;i<pc;i++){ivs[i]=(int*)malloc(2*sizeof(int));ics[i]=2;sscanf(prs[i],"%d,%d",&ivs[i][0],&ivs[i][1]);}
int rs;int** rcs;int** res=merge(ivs,pc,ics,&rs,&rcs);
for(int i=0;i<rs;i++){if(i>0)printf(";");printf("%d,%d",res[i][0],res[i][1]);}
printf("\\n");return 0;}
`,
  cpp: (u) => `#include<iostream>
#include<vector>
#include<string>
#include<sstream>
#include<algorithm>
using namespace std;
${u}
int main(){string l;getline(cin,l);
vector<vector<int>> ivs;stringstream ss(l);string p;
while(getline(ss,p,';')){vector<int>iv;stringstream ps(p);string v;while(getline(ps,v,','))iv.push_back(stoi(v));ivs.push_back(iv);}
Solution sol;auto res=sol.merge(ivs);
for(int i=0;i<(int)res.size();i++){if(i>0)cout<<";";cout<<res[i][0]<<","<<res[i][1];}
cout<<endl;return 0;}
`,
};

// =====================================================================
// Problem 30: N-Queens (count solutions)
// Input: "4"  Output: "2"
// =====================================================================

const nQueensWrappers: ProblemWrappers = {
  javascript: (u) => `${u}\nconst __n=parseInt(require('fs').readFileSync(0,'utf8').trim());console.log(totalNQueens(__n));`,
  python: (u) => `import sys\n${u}\nprint(Solution().totalNQueens(int(sys.stdin.read().strip())))`,
  java: (u) => `import java.util.*;\nimport java.io.*;\n${u}\nclass Main{public static void main(String[] a)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(System.in));System.out.println(new Solution().totalNQueens(Integer.parseInt(br.readLine().trim())));}}`,
  c: (u) => `#include<stdio.h>\n${u}\nint main(){int n;scanf("%d",&n);printf("%d\\n",totalNQueens(n));return 0;}`,
  cpp: (u) => `#include<iostream>\nusing namespace std;\n${u}\nint main(){int n;cin>>n;Solution s;cout<<s.totalNQueens(n)<<endl;return 0;}`,
};

// =====================================================================
// Wrapper Registry
// =====================================================================

const wrapperRegistry: Record<number, ProblemWrappers> = {
  1: twoSumWrappers,
  2: validParenthesesWrappers,
  3: mergeTwoListsWrappers,
  4: addTwoNumbersWrappers,
  5: longestSubstringWrappers,
  6: containerWaterWrappers,
  7: mergeKListsWrappers,
  8: trappingRainWaterWrappers,
  9: medianTwoArraysWrappers,
  10: regexMatchWrappers,
  11: maxSubarrayWrappers,
  12: climbingStairsWrappers,
  13: threeSumWrappers,
  14: levelOrderWrappers,
  15: wordSearchWrappers,
  16: wordLadderWrappers,
  17: serializeDeserializeWrappers,
  18: lruCacheWrappers,
  19: reverseLinkedListWrappers,
  20: buyAndSellStockWrappers,
  21: rotateImageWrappers,
  22: groupAnagramsWrappers,
  23: jumpGameWrappers,
  24: searchRangeWrappers,
  25: uniquePathsWrappers,
  26: permutationsWrappers,
  27: minPathSumWrappers,
  28: palindromePartitionWrappers,
  29: mergeIntervalsWrappers,
  30: nQueensWrappers,
};

import { generateWrapper, FunctionMeta } from './wrapperGenerator';

/**
 * Wraps user code with I/O handling for Judge0 submission.
 *
 * Resolution order:
 *   1. Hand-written wrapper from the registry (problems 1-30)
 *   2. Auto-generated wrapper from `functionMeta` (Firebase / new problems)
 *   3. Return code as-is
 */
export const wrapCode = (
  code: string,
  language: string,
  problemId: number,
  functionMeta?: FunctionMeta,
): string => {
  // 1. Try the hand-written registry (existing problems 1-30)
  const problemWrappers = wrapperRegistry[problemId];
  if (problemWrappers) {
    const wrapper = problemWrappers[language];
    if (wrapper) return wrapper(code);
  }

  // 2. Try generic wrapper from function metadata
  if (functionMeta) {
    return generateWrapper(code, language, functionMeta);
  }

  // 3. Fallback — return code as-is
  return code;
};
