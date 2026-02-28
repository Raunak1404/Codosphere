/**
 * Generic code wrapper & starter code generator.
 *
 * Instead of hand-writing ~100 lines of I/O wrapper per problem per language,
 * problems can declare a `FunctionMeta` object describing their function
 * signature.  This module auto-generates stdin/stdout wrappers and starter
 * code templates for all five supported languages.
 *
 * Supported parameter / return types:
 *   int, float, string, boolean,
 *   int[], float[], string[],
 *   int[][]
 *
 * Input convention (stdin):
 *   – Each parameter occupies one line.
 *   – Arrays are comma-separated.
 *   – 2-D arrays use `;` between rows, `,` within a row.
 *
 * Output convention (stdout):
 *   – Same serialisation as input for arrays.
 *   – Booleans printed as lowercase "true"/"false".
 */

// ─── Public interfaces ──────────────────────────────────────────────

export interface ParamDef {
  name: string;
  type:
    | 'int'
    | 'float'
    | 'string'
    | 'boolean'
    | 'int[]'
    | 'float[]'
    | 'string[]'
    | 'int[][]';
}

export interface FunctionMeta {
  /** Function / method name (e.g. "twoSum") */
  name: string;
  /** Ordered list of input parameters */
  params: ParamDef[];
  /** Return type */
  returnType:
    | 'int'
    | 'float'
    | 'string'
    | 'boolean'
    | 'int[]'
    | 'float[]'
    | 'string[]'
    | 'int[][]'
    | 'void';
  /** Class name for OOP languages (default "Solution") */
  className?: string;
}

// ─── Entry points ───────────────────────────────────────────────────

/**
 * Wrap user code with stdin-parsing + stdout-formatting so that it
 * becomes a full program ready for Judge0.
 */
export function generateWrapper(
  userCode: string,
  language: string,
  meta: FunctionMeta,
): string {
  switch (language) {
    case 'javascript':
      return genJS(userCode, meta);
    case 'python':
      return genPython(userCode, meta);
    case 'java':
      return genJava(userCode, meta);
    case 'c':
      return genC(userCode, meta);
    case 'cpp':
      return genCpp(userCode, meta);
    default:
      return userCode;
  }
}

/**
 * Generate a language-appropriate starter template from function metadata.
 */
export function generateStarterCode(
  language: string,
  meta: FunctionMeta,
): string {
  switch (language) {
    case 'javascript':
      return starterJS(meta);
    case 'python':
      return starterPython(meta);
    case 'java':
      return starterJava(meta);
    case 'c':
      return starterC(meta);
    case 'cpp':
      return starterCpp(meta);
    default:
      return '';
  }
}

// =====================================================================
//  JavaScript
// =====================================================================

function genJS(userCode: string, meta: FunctionMeta): string {
  const lines: string[] = [
    userCode,
    '',
    '// --- Platform I/O Wrapper ---',
    "const __lines = require('fs').readFileSync(0, 'utf8').trim().split('\\n');",
  ];

  meta.params.forEach((p, i) => {
    lines.push(`const ${p.name} = ${jsRead(p.type, `__lines[${i}]`)};`);
  });

  const args = meta.params.map((p) => p.name).join(', ');

  if (meta.returnType === 'void') {
    lines.push(`${meta.name}(${args});`);
  } else {
    lines.push(`const __result = ${meta.name}(${args});`);
    lines.push(jsWrite(meta.returnType));
  }

  return lines.join('\n');
}

function jsRead(type: string, expr: string): string {
  switch (type) {
    case 'int':
      return `parseInt(${expr})`;
    case 'float':
      return `parseFloat(${expr})`;
    case 'string':
      return expr;
    case 'boolean':
      return `(${expr} === 'true')`;
    case 'int[]':
      return `${expr}.replace(/[\\[\\]\\s]/g,'').split(',').map(Number)`;
    case 'float[]':
      return `${expr}.replace(/[\\[\\]\\s]/g,'').split(',').map(Number)`;
    case 'string[]':
      return `${expr}.replace(/[\\[\\]]/g,'').split(',')`;
    case 'int[][]':
      return `${expr}.replace(/[\\[\\]]/g,'').split(';').map(r => r.split(',').map(Number))`;
    default:
      return expr;
  }
}

function jsWrite(type: string): string {
  switch (type) {
    case 'int':
    case 'float':
    case 'string':
      return 'console.log(__result);';
    case 'boolean':
      return 'console.log(String(__result));';
    case 'int[]':
    case 'float[]':
      return "console.log(__result.join(','));";
    case 'string[]':
      return "console.log(__result.join(','));";
    case 'int[][]':
      return "console.log(__result.map(r => r.join(',')).join(';'));";
    default:
      return 'console.log(__result);';
  }
}

function starterJS(meta: FunctionMeta): string {
  const params = meta.params.map((p) => p.name).join(', ');
  const jsdoc = meta.params
    .map((p) => ` * @param {${jsDocType(p.type)}} ${p.name}`)
    .join('\n');
  const retDoc = ` * @return {${jsDocType(meta.returnType)}}`;

  return `/**\n${jsdoc}\n${retDoc}\n */\nfunction ${meta.name}(${params}) {\n  // Your solution here\n}`;
}

function jsDocType(type: string): string {
  switch (type) {
    case 'int':
      return 'number';
    case 'float':
      return 'number';
    case 'string':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'int[]':
      return 'number[]';
    case 'float[]':
      return 'number[]';
    case 'string[]':
      return 'string[]';
    case 'int[][]':
      return 'number[][]';
    case 'void':
      return 'void';
    default:
      return '*';
  }
}

// =====================================================================
//  Python
// =====================================================================

function genPython(userCode: string, meta: FunctionMeta): string {
  const cls = meta.className || 'Solution';
  const lines: string[] = [
    'import sys',
    '',
    userCode,
    '',
    '# --- Platform I/O Wrapper ---',
    "__lines = sys.stdin.read().strip().split('\\n')",
  ];

  meta.params.forEach((p, i) => {
    lines.push(`${p.name} = ${pyRead(p.type, `__lines[${i}]`)}`);
  });

  const args = meta.params.map((p) => p.name).join(', ');

  if (meta.returnType === 'void') {
    lines.push(`${cls}().${meta.name}(${args})`);
  } else {
    lines.push(`__result = ${cls}().${meta.name}(${args})`);
    lines.push(pyWrite(meta.returnType));
  }

  return lines.join('\n');
}

function pyRead(type: string, expr: string): string {
  // Strip brackets/spaces so both "[1, 2, 3]" and "1,2,3" work
  const stripped = `${expr}.replace('[','').replace(']','').strip()`;
  switch (type) {
    case 'int':
      return `int(${expr})`;
    case 'float':
      return `float(${expr})`;
    case 'string':
      return expr;
    case 'boolean':
      return `(${expr} == 'true')`;
    case 'int[]':
      return `list(map(int, ${stripped}.split(',')))`;
    case 'float[]':
      return `list(map(float, ${stripped}.split(',')))`;
    case 'string[]':
      return `${stripped}.split(',')`;
    case 'int[][]':
      return `[list(map(int, r.split(','))) for r in ${stripped}.split(';')]`;
    default:
      return expr;
  }
}

function pyWrite(type: string): string {
  switch (type) {
    case 'int':
    case 'float':
    case 'string':
      return 'print(__result)';
    case 'boolean':
      return 'print(str(__result).lower())';
    case 'int[]':
    case 'float[]':
      return "print(','.join(map(str, __result)))";
    case 'string[]':
      return "print(','.join(__result))";
    case 'int[][]':
      return "print(';'.join(','.join(map(str, r)) for r in __result))";
    default:
      return 'print(__result)';
  }
}

function pyTypeHint(type: string): string {
  switch (type) {
    case 'int':
      return 'int';
    case 'float':
      return 'float';
    case 'string':
      return 'str';
    case 'boolean':
      return 'bool';
    case 'int[]':
      return 'list[int]';
    case 'float[]':
      return 'list[float]';
    case 'string[]':
      return 'list[str]';
    case 'int[][]':
      return 'list[list[int]]';
    case 'void':
      return 'None';
    default:
      return 'Any';
  }
}

function starterPython(meta: FunctionMeta): string {
  const params = meta.params
    .map((p) => `${p.name}: ${pyTypeHint(p.type)}`)
    .join(', ');

  return `class ${meta.className || 'Solution'}:\n    def ${meta.name}(self, ${params}) -> ${pyTypeHint(meta.returnType)}:\n        # Your solution here\n        pass`;
}

// =====================================================================
//  Java
// =====================================================================

function genJava(userCode: string, meta: FunctionMeta): string {
  const cls = meta.className || 'Solution';
  const lines: string[] = [
    'import java.util.*;',
    'import java.io.*;',
    '',
    userCode,
    '',
    'class Main {',
    '    public static void main(String[] args) throws Exception {',
    '        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));',
  ];

  meta.params.forEach((p) => {
    javaRead(p).forEach((l) => lines.push('        ' + l));
  });

  const argList = meta.params.map((p) => p.name).join(', ');

  if (meta.returnType === 'void') {
    lines.push(`        new ${cls}().${meta.name}(${argList});`);
  } else {
    const jrt = javaTypeName(meta.returnType);
    lines.push(
      `        ${jrt} __result = new ${cls}().${meta.name}(${argList});`,
    );
    javaWrite(meta.returnType).forEach((l) => lines.push('        ' + l));
  }

  lines.push('    }');
  lines.push('}');
  return lines.join('\n');
}

function javaTypeName(type: string): string {
  switch (type) {
    case 'int':
      return 'int';
    case 'float':
      return 'double';
    case 'string':
      return 'String';
    case 'boolean':
      return 'boolean';
    case 'int[]':
      return 'int[]';
    case 'float[]':
      return 'double[]';
    case 'string[]':
      return 'String[]';
    case 'int[][]':
      return 'int[][]';
    case 'void':
      return 'void';
    default:
      return 'Object';
  }
}

function javaRead(p: ParamDef): string[] {
  const lines: string[] = [];
  switch (p.type) {
    case 'int':
      lines.push(`int ${p.name} = Integer.parseInt(br.readLine().trim());`);
      break;
    case 'float':
      lines.push(
        `double ${p.name} = Double.parseDouble(br.readLine().trim());`,
      );
      break;
    case 'string':
      lines.push(`String ${p.name} = br.readLine().trim();`);
      break;
    case 'boolean':
      lines.push(
        `boolean ${p.name} = Boolean.parseBoolean(br.readLine().trim());`,
      );
      break;
    case 'int[]':
      lines.push(
        `String __${p.name}Raw = br.readLine().trim().replaceAll("[\\\\[\\\\]\\\\s]", "");`,
      );
      lines.push(
        `String[] __${p.name}Parts = __${p.name}Raw.split(",");`,
      );
      lines.push(`int[] ${p.name} = new int[__${p.name}Parts.length];`);
      lines.push(
        `for (int __i = 0; __i < __${p.name}Parts.length; __i++) ${p.name}[__i] = Integer.parseInt(__${p.name}Parts[__i].trim());`,
      );
      break;
    case 'float[]':
      lines.push(
        `String __${p.name}Raw = br.readLine().trim().replaceAll("[\\\\[\\\\]\\\\s]", "");`,
      );
      lines.push(
        `String[] __${p.name}Parts = __${p.name}Raw.split(",");`,
      );
      lines.push(`double[] ${p.name} = new double[__${p.name}Parts.length];`);
      lines.push(
        `for (int __i = 0; __i < __${p.name}Parts.length; __i++) ${p.name}[__i] = Double.parseDouble(__${p.name}Parts[__i].trim());`,
      );
      break;
    case 'string[]':
      lines.push(`String[] ${p.name} = br.readLine().trim().replaceAll("[\\\\[\\\\]]", "").split(",");`);
      break;
    case 'int[][]':
      lines.push(
        `String[] __${p.name}Rows = br.readLine().trim().replaceAll("[\\\\[\\\\]]", "").split(";");`,
      );
      lines.push(
        `int[][] ${p.name} = new int[__${p.name}Rows.length][];`,
      );
      lines.push(`for (int __i = 0; __i < __${p.name}Rows.length; __i++) {`);
      lines.push(
        `    String[] __cols = __${p.name}Rows[__i].split(",");`,
      );
      lines.push(`    ${p.name}[__i] = new int[__cols.length];`);
      lines.push(
        `    for (int __j = 0; __j < __cols.length; __j++) ${p.name}[__i][__j] = Integer.parseInt(__cols[__j].trim());`,
      );
      lines.push(`}`);
      break;
    default:
      lines.push(`String ${p.name} = br.readLine().trim();`);
  }
  return lines;
}

function javaWrite(type: string): string[] {
  switch (type) {
    case 'int':
    case 'float':
    case 'string':
    case 'boolean':
      return ['System.out.println(__result);'];
    case 'int[]':
    case 'float[]': {
      return [
        'StringBuilder __sb = new StringBuilder();',
        'for (int __i = 0; __i < __result.length; __i++) { if (__i > 0) __sb.append(","); __sb.append(__result[__i]); }',
        'System.out.println(__sb.toString());',
      ];
    }
    case 'string[]':
      return ['System.out.println(String.join(",", __result));'];
    case 'int[][]': {
      return [
        'StringBuilder __sb = new StringBuilder();',
        'for (int __i = 0; __i < __result.length; __i++) {',
        '    if (__i > 0) __sb.append(";");',
        '    for (int __j = 0; __j < __result[__i].length; __j++) { if (__j > 0) __sb.append(","); __sb.append(__result[__i][__j]); }',
        '}',
        'System.out.println(__sb.toString());',
      ];
    }
    default:
      return ['System.out.println(__result);'];
  }
}

function javaParamType(type: string): string {
  // For method signatures in starter code
  switch (type) {
    case 'int':
      return 'int';
    case 'float':
      return 'double';
    case 'string':
      return 'String';
    case 'boolean':
      return 'boolean';
    case 'int[]':
      return 'int[]';
    case 'float[]':
      return 'double[]';
    case 'string[]':
      return 'String[]';
    case 'int[][]':
      return 'int[][]';
    default:
      return 'Object';
  }
}

function javaDefaultReturn(type: string): string {
  switch (type) {
    case 'int':
      return '0';
    case 'float':
      return '0.0';
    case 'string':
      return '""';
    case 'boolean':
      return 'false';
    case 'int[]':
      return 'new int[0]';
    case 'float[]':
      return 'new double[0]';
    case 'string[]':
      return 'new String[0]';
    case 'int[][]':
      return 'new int[0][0]';
    case 'void':
      return '';
    default:
      return 'null';
  }
}

function starterJava(meta: FunctionMeta): string {
  const cls = meta.className || 'Solution';
  const params = meta.params
    .map((p) => `${javaParamType(p.type)} ${p.name}`)
    .join(', ');
  const retType = javaTypeName(meta.returnType);
  const defaultRet = javaDefaultReturn(meta.returnType);
  const retStatement =
    meta.returnType === 'void' ? '' : `\n        return ${defaultRet};`;

  return `class ${cls} {\n    public ${retType} ${meta.name}(${params}) {\n        // Your solution here${retStatement}\n    }\n}`;
}

// =====================================================================
//  C
// =====================================================================

function genC(userCode: string, meta: FunctionMeta): string {
  const lines: string[] = [
    '#include <stdio.h>',
    '#include <stdlib.h>',
    '#include <string.h>',
    '#include <stdbool.h>',
    '',
    userCode,
    '',
    'int main() {',
  ];

  // Build param reading + call
  const callArgs: string[] = [];

  meta.params.forEach((p) => {
    cRead(p, callArgs).forEach((l) => lines.push('    ' + l));
  });

  // For array returns, add returnSize parameter
  if (
    meta.returnType === 'int[]' ||
    meta.returnType === 'float[]' ||
    meta.returnType === 'string[]'
  ) {
    lines.push('    int __returnSize;');
    callArgs.push('&__returnSize');
  }

  const argStr = callArgs.join(', ');

  if (meta.returnType === 'void') {
    lines.push(`    ${meta.name}(${argStr});`);
  } else {
    const cret = cReturnType(meta.returnType);
    lines.push(`    ${cret} __result = ${meta.name}(${argStr});`);
    cWrite(meta.returnType).forEach((l) => lines.push('    ' + l));
  }

  lines.push('    return 0;');
  lines.push('}');
  return lines.join('\n');
}

function cRead(p: ParamDef, callArgs: string[]): string[] {
  const lines: string[] = [];
  switch (p.type) {
    case 'int':
      lines.push(`int ${p.name};`);
      lines.push(`scanf("%d", &${p.name});`);
      callArgs.push(p.name);
      break;
    case 'float':
      lines.push(`double ${p.name};`);
      lines.push(`scanf("%lf", &${p.name});`);
      callArgs.push(p.name);
      break;
    case 'boolean':
      lines.push(`char __${p.name}Str[10];`);
      lines.push(`scanf("%s", __${p.name}Str);`);
      lines.push(
        `bool ${p.name} = (strcmp(__${p.name}Str, "true") == 0);`,
      );
      callArgs.push(p.name);
      break;
    case 'string':
      lines.push(`char ${p.name}[100001];`);
      lines.push(`fgets(${p.name}, sizeof(${p.name}), stdin);`);
      lines.push(`${p.name}[strcspn(${p.name}, "\\n")] = 0;`);
      callArgs.push(p.name);
      break;
    case 'int[]':
      lines.push(`char __${p.name}Line[100001];`);
      lines.push(
        `fgets(__${p.name}Line, sizeof(__${p.name}Line), stdin);`,
      );
      lines.push(`__${p.name}Line[strcspn(__${p.name}Line, "\\n")] = 0;`);
      // Strip brackets: remove [ ] characters
      lines.push(`{ char *__s = __${p.name}Line, *__d = __${p.name}Line; while (*__s) { if (*__s != '[' && *__s != ']' && *__s != ' ') *__d++ = *__s; __s++; } *__d = 0; }`);
      lines.push(`int ${p.name}[100000], ${p.name}Size = 0;`);
      lines.push(
        `char *__${p.name}Tok = strtok(__${p.name}Line, ",");`,
      );
      lines.push(`while (__${p.name}Tok) {`);
      lines.push(
        `    ${p.name}[${p.name}Size++] = atoi(__${p.name}Tok);`,
      );
      lines.push(`    __${p.name}Tok = strtok(NULL, ",");`);
      lines.push(`}`);
      callArgs.push(p.name);
      callArgs.push(`${p.name}Size`);
      break;
    case 'string[]':
      lines.push(`char __${p.name}Line[100001];`);
      lines.push(
        `fgets(__${p.name}Line, sizeof(__${p.name}Line), stdin);`,
      );
      lines.push(`__${p.name}Line[strcspn(__${p.name}Line, "\\n")] = 0;`);
      lines.push(`char *${p.name}[10000];`);
      lines.push(`int ${p.name}Size = 0;`);
      lines.push(
        `char *__${p.name}Tok = strtok(__${p.name}Line, ",");`,
      );
      lines.push(`while (__${p.name}Tok) {`);
      lines.push(
        `    ${p.name}[${p.name}Size++] = __${p.name}Tok;`,
      );
      lines.push(`    __${p.name}Tok = strtok(NULL, ",");`);
      lines.push(`}`);
      callArgs.push(p.name);
      callArgs.push(`${p.name}Size`);
      break;
    default:
      lines.push(`char ${p.name}[100001];`);
      lines.push(`fgets(${p.name}, sizeof(${p.name}), stdin);`);
      lines.push(`${p.name}[strcspn(${p.name}, "\\n")] = 0;`);
      callArgs.push(p.name);
  }
  return lines;
}

function cReturnType(type: string): string {
  switch (type) {
    case 'int':
      return 'int';
    case 'float':
      return 'double';
    case 'string':
      return 'char*';
    case 'boolean':
      return 'bool';
    case 'int[]':
      return 'int*';
    case 'float[]':
      return 'double*';
    case 'string[]':
      return 'char**';
    default:
      return 'int';
  }
}

function cWrite(type: string): string[] {
  switch (type) {
    case 'int':
      return ['printf("%d\\n", __result);'];
    case 'float':
      return ['printf("%g\\n", __result);'];
    case 'string':
      return ['printf("%s\\n", __result);'];
    case 'boolean':
      return ['printf("%s\\n", __result ? "true" : "false");'];
    case 'int[]':
      return [
        'for (int __i = 0; __i < __returnSize; __i++) {',
        '    if (__i > 0) printf(",");',
        '    printf("%d", __result[__i]);',
        '}',
        'printf("\\n");',
      ];
    case 'float[]':
      return [
        'for (int __i = 0; __i < __returnSize; __i++) {',
        '    if (__i > 0) printf(",");',
        '    printf("%g", __result[__i]);',
        '}',
        'printf("\\n");',
      ];
    case 'string[]':
      return [
        'for (int __i = 0; __i < __returnSize; __i++) {',
        '    if (__i > 0) printf(",");',
        '    printf("%s", __result[__i]);',
        '}',
        'printf("\\n");',
      ];
    default:
      return ['printf("%d\\n", __result);'];
  }
}

function cParamSignature(p: ParamDef): string {
  // C function signature parameter
  switch (p.type) {
    case 'int':
      return `int ${p.name}`;
    case 'float':
      return `double ${p.name}`;
    case 'string':
      return `char* ${p.name}`;
    case 'boolean':
      return `bool ${p.name}`;
    case 'int[]':
      return `int* ${p.name}, int ${p.name}Size`;
    case 'float[]':
      return `double* ${p.name}, int ${p.name}Size`;
    case 'string[]':
      return `char** ${p.name}, int ${p.name}Size`;
    default:
      return `char* ${p.name}`;
  }
}

function cDefaultReturn(type: string): string {
  switch (type) {
    case 'int':
      return '0';
    case 'float':
      return '0.0';
    case 'string':
      return 'NULL';
    case 'boolean':
      return 'false';
    case 'int[]':
      return 'NULL';
    case 'float[]':
      return 'NULL';
    case 'string[]':
      return 'NULL';
    default:
      return '0';
  }
}

function starterC(meta: FunctionMeta): string {
  const params = meta.params.map((p) => cParamSignature(p)).join(', ');
  const retType = cReturnType(meta.returnType);

  // For array returns, add returnSize out-parameter
  let extraParam = '';
  if (
    meta.returnType === 'int[]' ||
    meta.returnType === 'float[]' ||
    meta.returnType === 'string[]'
  ) {
    extraParam = params ? ', int* returnSize' : 'int* returnSize';
  }

  const allParams = params + extraParam;
  const defaultRet = cDefaultReturn(meta.returnType);
  const retStatement =
    meta.returnType === 'void' ? '' : `\n    return ${defaultRet};`;

  return `${retType} ${meta.name}(${allParams}) {\n    // Your solution here${retStatement}\n}`;
}

// =====================================================================
//  C++
// =====================================================================

function genCpp(userCode: string, meta: FunctionMeta): string {
  const cls = meta.className || 'Solution';
  const lines: string[] = [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    '#include <sstream>',
    '#include <algorithm>',
    'using namespace std;',
    '',
    userCode,
    '',
    'int main() {',
  ];

  meta.params.forEach((p) => {
    cppRead(p).forEach((l) => lines.push('    ' + l));
  });

  const args = meta.params.map((p) => p.name).join(', ');

  if (meta.returnType === 'void') {
    lines.push(`    ${cls} __sol;`);
    lines.push(`    __sol.${meta.name}(${args});`);
  } else {
    lines.push(`    ${cls} __sol;`);
    lines.push(`    auto __result = __sol.${meta.name}(${args});`);
    cppWrite(meta.returnType).forEach((l) => lines.push('    ' + l));
  }

  lines.push('    return 0;');
  lines.push('}');
  return lines.join('\n');
}

function cppRead(p: ParamDef): string[] {
  const lines: string[] = [];
  switch (p.type) {
    case 'int':
      lines.push(`int ${p.name};`);
      lines.push(`cin >> ${p.name}; cin.ignore();`);
      break;
    case 'float':
      lines.push(`double ${p.name};`);
      lines.push(`cin >> ${p.name}; cin.ignore();`);
      break;
    case 'boolean':
      lines.push(`string __${p.name}Str;`);
      lines.push(`getline(cin, __${p.name}Str);`);
      lines.push(
        `bool ${p.name} = (__${p.name}Str == "true");`,
      );
      break;
    case 'string':
      lines.push(`string ${p.name};`);
      lines.push(`getline(cin, ${p.name});`);
      break;
    case 'int[]':
      lines.push(`string __${p.name}Line;`);
      lines.push(`getline(cin, __${p.name}Line);`);
      lines.push(`__${p.name}Line.erase(remove_if(__${p.name}Line.begin(), __${p.name}Line.end(), [](char c){ return c=='[' || c==']' || c==' '; }), __${p.name}Line.end());`);
      lines.push(`vector<int> ${p.name};`);
      lines.push(`{ stringstream __ss(__${p.name}Line); string __tok;`);
      lines.push(
        `  while (getline(__ss, __tok, ',')) ${p.name}.push_back(stoi(__tok)); }`,
      );
      break;
    case 'float[]':
      lines.push(`string __${p.name}Line;`);
      lines.push(`getline(cin, __${p.name}Line);`);
      lines.push(`__${p.name}Line.erase(remove_if(__${p.name}Line.begin(), __${p.name}Line.end(), [](char c){ return c=='[' || c==']' || c==' '; }), __${p.name}Line.end());`);
      lines.push(`vector<double> ${p.name};`);
      lines.push(`{ stringstream __ss(__${p.name}Line); string __tok;`);
      lines.push(
        `  while (getline(__ss, __tok, ',')) ${p.name}.push_back(stod(__tok)); }`,
      );
      break;
    case 'string[]':
      lines.push(`string __${p.name}Line;`);
      lines.push(`getline(cin, __${p.name}Line);`);
      lines.push(`__${p.name}Line.erase(remove(__${p.name}Line.begin(), __${p.name}Line.end(), '['), __${p.name}Line.end());`);
      lines.push(`__${p.name}Line.erase(remove(__${p.name}Line.begin(), __${p.name}Line.end(), ']'), __${p.name}Line.end());`);
      lines.push(`vector<string> ${p.name};`);
      lines.push(`{ stringstream __ss(__${p.name}Line); string __tok;`);
      lines.push(
        `  while (getline(__ss, __tok, ',')) ${p.name}.push_back(__tok); }`,
      );
      break;
    case 'int[][]':
      lines.push(`string __${p.name}Line;`);
      lines.push(`getline(cin, __${p.name}Line);`);
      lines.push(`vector<vector<int>> ${p.name};`);
      lines.push(`{ stringstream __rowSS(__${p.name}Line); string __row;`);
      lines.push(`  while (getline(__rowSS, __row, ';')) {`);
      lines.push(
        `    vector<int> __r; stringstream __cs(__row); string __v;`,
      );
      lines.push(
        `    while (getline(__cs, __v, ',')) __r.push_back(stoi(__v));`,
      );
      lines.push(`    ${p.name}.push_back(__r);`);
      lines.push(`  } }`);
      break;
    default:
      lines.push(`string ${p.name};`);
      lines.push(`getline(cin, ${p.name});`);
  }
  return lines;
}

function cppWrite(type: string): string[] {
  switch (type) {
    case 'int':
      return ['cout << __result << endl;'];
    case 'float':
      return ['cout << __result << endl;'];
    case 'string':
      return ['cout << __result << endl;'];
    case 'boolean':
      return ['cout << (__result ? "true" : "false") << endl;'];
    case 'int[]':
    case 'float[]':
      return [
        'for (size_t __i = 0; __i < __result.size(); __i++) {',
        '    if (__i > 0) cout << ",";',
        '    cout << __result[__i];',
        '}',
        'cout << endl;',
      ];
    case 'string[]':
      return [
        'for (size_t __i = 0; __i < __result.size(); __i++) {',
        '    if (__i > 0) cout << ",";',
        '    cout << __result[__i];',
        '}',
        'cout << endl;',
      ];
    case 'int[][]':
      return [
        'for (size_t __i = 0; __i < __result.size(); __i++) {',
        '    if (__i > 0) cout << ";";',
        '    for (size_t __j = 0; __j < __result[__i].size(); __j++) {',
        '        if (__j > 0) cout << ",";',
        '        cout << __result[__i][__j];',
        '    }',
        '}',
        'cout << endl;',
      ];
    default:
      return ['cout << __result << endl;'];
  }
}

function cppTypeName(type: string): string {
  switch (type) {
    case 'int':
      return 'int';
    case 'float':
      return 'double';
    case 'string':
      return 'string';
    case 'boolean':
      return 'bool';
    case 'int[]':
      return 'vector<int>';
    case 'float[]':
      return 'vector<double>';
    case 'string[]':
      return 'vector<string>';
    case 'int[][]':
      return 'vector<vector<int>>';
    case 'void':
      return 'void';
    default:
      return 'auto';
  }
}

function cppDefaultReturn(type: string): string {
  switch (type) {
    case 'int':
      return '0';
    case 'float':
      return '0.0';
    case 'string':
      return '""';
    case 'boolean':
      return 'false';
    case 'int[]':
      return '{}';
    case 'float[]':
      return '{}';
    case 'string[]':
      return '{}';
    case 'int[][]':
      return '{}';
    default:
      return '{}';
  }
}

function starterCpp(meta: FunctionMeta): string {
  const cls = meta.className || 'Solution';
  const params = meta.params
    .map((p) => `${cppTypeName(p.type)}& ${p.name}`)
    .join(', ');
  const retType = cppTypeName(meta.returnType);
  const defaultRet = cppDefaultReturn(meta.returnType);
  const retStatement =
    meta.returnType === 'void' ? '' : `\n        return ${defaultRet};`;

  return `class ${cls} {\npublic:\n    ${retType} ${meta.name}(${params}) {\n        // Your solution here${retStatement}\n    }\n};`;
}
