// #region Tokenization

/** Token enumerator. */
enum Token {
  /** End-of-Setence. */
  EOS,

  /** Value assignment operator. */
  OPERATOR_ASSIGN,

  /** Integer value invocation. */
  LITERAL_INTEGER,

  /** Variable value signature clause. */
  KEYWORD_VAR,
  /** Constant value signature clause. */
  KEYWORD_CONST,

  /** Identification invocation. */
  IDENTIFIER,
}

/**
 * RegExp template function.
 *
 * @param s - RegExp complement.
 * @returns - Complete expression.
 */
const r = (s: string): RegExp => new RegExp(`^(${s})\\s*`);

/**
 * Token-to-Expression mapping.
 *
 * Assigns a {@link RegExp} to a {@link Token}, which
 * is used in the LA process.
 */
const tokenMatches: Record<Token, RegExp> = {
  [Token.EOS]: r(";"),

  [Token.OPERATOR_ASSIGN]: r("="),

  [Token.KEYWORD_VAR]: r("var"),
  [Token.KEYWORD_CONST]: r("const"),

  [Token.LITERAL_INTEGER]: r("\\d+"),

  [Token.IDENTIFIER]: r("[_a-zA-Z]\\w*"),
};

/**
 * Represents the most matching {@link Token} on the
 * input string during the LA phase, along with the
 * matching content.
 */
type ResolvedToken = [content: string, token: Token];

/**
 * Special error what may happen on the Lexical
 * Analysis process.
 */
class TokenError extends Error {
  /**
   * The tokens that were resolved before the error
   * occurred.
   */
  resolved: ResolvedToken[];

  /**
   * Creates a TokenError.
   *
   * @param message - The error message/reason.
   * @param tokens - The resolved tokens.
   * @param options - Extra options.
   */
  constructor(
    message: string,
    tokens: ResolvedToken[],
    options?: ErrorOptions,
  ) {
    super(message, options);

    this.resolved = tokens;
  }
}

// #region Lexical Analysis

/**
 * It transforms a text input into a list of tokens
 * that break the sentences into more easily
 * understandable parts.
 *
 * @throws TokenError - when an error occurs in the
 * interpretation of symbols.
 *
 * @param source - Source code for tokenization.
 * @returns - A sequence of tokens that represent the
 * source code.
 */
function tokenize(source: string): ResolvedToken[] {
  const tokenized: ResolvedToken[] = [];

  let pointer = 0;

  while (source.length > 0) {
    let found: [Token, RegExpMatchArray] | null = null;

    for (const [token, exp] of Object.entries(tokenMatches)) {
      const match = source.match(exp);

      if (match === null) continue;

      found = [token as unknown as Token, match];
      break;
    }

    if (found === null) {
      const fragment = JSON
        .stringify(source.slice(0, 3))
        .slice(1, -1);

      throw new TokenError(
        `Unknown symbol at ${pointer} "${fragment}".`,
        tokenized
      );
    }

    const [token, match] = found;
    const content = match[1] ?? match[0];

    const length = match[0].length;

    pointer += length;
    source = source.slice(length);

    tokenized.push([content, token]);
  }

  return tokenized;
}

// #region Flush

const sourceCode = "var x = 10; const y = 2;";
console.log(tokenize(sourceCode));
