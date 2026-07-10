// ============================================================
// 条件DSL (NPC会話設計書 第4章)
// 会話・手紙・噂・スケジュール例外・辞典解放を全て同一文法で記述する。
// ビルド(ロード)時にASTへコンパイルし、実行時パースは行わない(第4.3節)。
//
// 文法:
//   式     := or式
//   or式   := and式 ('or' and式)*
//   and式  := not式 ('and' not式)*
//   not式  := 'not' not式 | 比較
//   比較   := 項 ((==|!=|>=|<=|>|<|in|has) 項)?
//   項     := 数値 | 識別子 | 関数(引数,...) | '(' 式 ')' | '[' 項,... ']' | '@マクロ'
//
// 識別子解決:
//   time/weather/season/day/hour/location/story → コンテキスト変数
//   関数: aff(A,B) rank(A,B) flag(F) info(I) heard_rumor(R) random(p)
//         built(FAC) taste_score(X) last_reply(X) mutual(A,B) count(C)
//   その他の裸の識別子 → その名前の文字列定数 (NIGHT, RAIN 等の列挙値)
// ============================================================

const CMP_OPS = ['==', '!=', '>=', '<=', '>', '<'];

function tokenize(src) {
  const tokens = [];
  let i = 0;
  const isIdent = c => /[A-Za-z0-9_@.]/.test(c);
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const two = src.slice(i, i + 2);
    if (CMP_OPS.includes(two)) { tokens.push({ t: 'op', v: two }); i += 2; continue; }
    if ('><'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue; }
    if ('()[],'.includes(c)) { tokens.push({ t: c }); i++; continue; }
    if (/[0-9\-]/.test(c)) {
      let j = i + 1;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      tokens.push({ t: 'num', v: parseFloat(src.slice(i, j)) });
      i = j; continue;
    }
    if (isIdent(c)) {
      let j = i;
      while (j < src.length && isIdent(src[j])) j++;
      const word = src.slice(i, j);
      if (word === 'and' || word === 'or' || word === 'not' || word === 'in' || word === 'has') {
        tokens.push({ t: word });
      } else {
        tokens.push({ t: 'ident', v: word });
      }
      i = j; continue;
    }
    throw new Error(`DSL tokenize error at "${src.slice(i, i + 12)}"`);
  }
  return tokens;
}

export function compileCond(src, macros = {}) {
  if (!src || src === 'true') return { eval: () => true, terms: 0, src: src ?? 'true' };
  // マクロ展開 (@name → 定義式)
  let expanded = src;
  for (let pass = 0; pass < 4 && expanded.includes('@'); pass++) {
    expanded = expanded.replace(/@[A-Za-z0-9_]+/g, m =>
      macros[m] !== undefined ? `(${macros[m]})` : (() => { throw new Error(`未定義マクロ ${m}`); })());
  }
  const tokens = tokenize(expanded);
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const expect = (t) => { const tk = next(); if (!tk || tk.t !== t) throw new Error(`DSL: expected ${t} in "${src}"`); return tk; };
  let termCount = 0;

  function parseExpr() { return parseOr(); }
  function parseOr() {
    let left = parseAnd();
    while (peek()?.t === 'or') { next(); const right = parseAnd(); const l = left; left = { k: 'or', l, r: right }; }
    return left;
  }
  function parseAnd() {
    let left = parseNot();
    while (peek()?.t === 'and') { next(); const right = parseNot(); const l = left; left = { k: 'and', l, r: right }; }
    return left;
  }
  function parseNot() {
    if (peek()?.t === 'not') { next(); return { k: 'not', e: parseNot() }; }
    return parseCmp();
  }
  function parseCmp() {
    const left = parseTerm();
    const tk = peek();
    if (tk && (tk.t === 'op' || tk.t === 'in' || tk.t === 'has')) {
      next();
      const right = parseTerm();
      termCount++;
      return { k: 'cmp', op: tk.t === 'op' ? tk.v : tk.t, l: left, r: right };
    }
    termCount++;                       // 裸の真偽項 (flag(X) 等)
    return { k: 'truthy', e: left };
  }
  function parseTerm() {
    const tk = next();
    if (!tk) throw new Error(`DSL: unexpected end in "${src}"`);
    if (tk.t === 'num') return { k: 'lit', v: tk.v };
    if (tk.t === '(') { const e = parseExpr(); expect(')'); return e; }
    if (tk.t === '[') {
      const items = [];
      if (peek()?.t !== ']') {
        items.push(parseTerm());
        while (peek()?.t === ',') { next(); items.push(parseTerm()); }
      }
      expect(']');
      return { k: 'list', items };
    }
    if (tk.t === 'ident') {
      if (peek()?.t === '(') {
        next();
        const args = [];
        if (peek()?.t !== ')') {
          args.push(parseTerm());
          while (peek()?.t === ',') { next(); args.push(parseTerm()); }
        }
        expect(')');
        return { k: 'call', fn: tk.v, args };
      }
      return { k: 'ident', v: tk.v };
    }
    throw new Error(`DSL: unexpected token ${tk.t} in "${src}"`);
  }

  const ast = parseExpr();
  if (pos !== tokens.length) throw new Error(`DSL: trailing tokens in "${src}"`);

  function ev(node, ctx) {
    switch (node.k) {
      case 'or': return ev(node.l, ctx) || ev(node.r, ctx);
      case 'and': return ev(node.l, ctx) && ev(node.r, ctx);
      case 'not': return !ev(node.e, ctx);
      case 'truthy': return !!val(node.e, ctx);
      case 'cmp': {
        const a = val(node.l, ctx), b = val(node.r, ctx);
        switch (node.op) {
          case '==': return a === b;
          case '!=': return a !== b;
          case '>=': return a >= b;
          case '<=': return a <= b;
          case '>': return a > b;
          case '<': return a < b;
          case 'in': return Array.isArray(b) ? b.includes(a) : false;
          case 'has': return Array.isArray(a) ? a.includes(b) : false;
        }
      }
    }
    return false;
  }
  function val(node, ctx) {
    switch (node.k) {
      case 'lit': return node.v;
      case 'list': return node.items.map(n => val(n, ctx));
      case 'ident': {
        const v = node.v;
        if (v in ctx.vars) return ctx.vars[v];
        return v;                       // 列挙値: NIGHT, RAIN, LENNY...
      }
      case 'call': {
        const fn = ctx.fns[node.fn];
        if (!fn) throw new Error(`DSL: 未定義関数 ${node.fn} in "${src}"`);
        return fn(...node.args.map(a => val(a, ctx)));
      }
      default: return ev(node, ctx);
    }
  }

  return { eval: (ctx) => !!ev(ast, ctx), terms: termCount, src };
}
