const { containsKeys, contains, textTemplate } = require("./utils");
const functonTemplate = new textTemplate(`.$METHOD((exp) => { $CHAIN })`);
const regexButWithWords = require("./expressions");

const verbose = function () {
  // List of direct conversions
  this.regexTokenFunctions = {
    "\\d": "digit",
    "\\D": "notDigit",
    ".": "any",
    "\\s": "whitespace",
    "\\S": "notWhitespace",
    "\\n": "newline",
    "\\t": "tab",
    "\\w": "word",
    "\\W": "notWord",
    "?": "lazy",
    "*": "anyNumber",
    "|": "or",
    "+": "oneOrMore",
    $: "stringEnd",
    "^": "stringBegin",
    "\\n": "newline",
    "\\t": "tab",
  };

  /**
   * Get the name of a range token from the map
   * @param {string} token regexp token literal
   * @returns {string} verbose name
   */
  this.rangeTokenName = (token) => {
    return "." + this.regexTokenFunctions[token] + "(";
  };

  /**
   * Get a range after a token
   * @param {Array<string>} arr Array from which to get range
   * @returns {string} Range as function parameters
   */
  this.getRange = (arr) => {
    let addRange = ""; // range to add
    if (arr[0] === "{") {
      // If the first element is a non-escaped {
      arr.shift(); // shift off
      while (arr[0] !== "}") {
        // Add characters until end token
        addRange += arr.shift();
      }
      // remove end token
      arr.shift();
    }
    // Return range split with ", "
    return addRange.split(",").join(", ");
  };

  /**
   * Handles the parsing of regular expression string literals
   * @param {str} nextStr String to parse
   * @param {Array<string>} splitSource Regex source list
   * @returns {string} parsed string literall
   */
  this.handleStringLiteral = (nextStr, splitSource) => {
    let literal = `.literal("${nextStr.replace(/\\(?!\()/g, "")}`; // Initialize function with unmatching escaped characters replaced
    let literallyFinished = false; // Is finished
    if (splitSource[0] === "{") {
      // If the literal has a range, return the range as params
      literal += '", ' + this.getRange(splitSource);
    } else {
      while (
        splitSource.length > 0 && // still tokens
        !containsKeys(this.regexTokenFunctions, splitSource[0]) && // is not a token function
        !literallyFinished // and is not finished
      ) {
        if (
          (splitSource.length > 1 && splitSource[1] === "{") || // if range is next
          contains(["[", "("], splitSource[0]) || // if set or group is next
          (splitSource[1] === "?" && splitSource[0] !== "\\") || // if next char is lazy
          containsKeys(
            // if the next two characters are a valid escape sequence
            this.regexTokenFunctions,
            splitSource[0] + splitSource[1]
          )
        ) {
          // finished is true if split source has more than one value and the first one is a range
          literallyFinished = true;
        } else {
          // otherwise add next character
          let nextCharacter =splitSource.shift()
          if(nextCharacter === "\\") nextCharacter += splitSource.shift()
          literal += nextCharacter.replace(/\\(?!["`'])/g, "");
        }
      }
      literal += `"`; // add close quote
    }
    return literal.replace(/(?<=\(".*)"(?=.*\")/g, '\\"'); // return literal
  };

  /**
   * Check if something is a group
   * @param {str} nextStr String to check
   * @returns {boolean} True if is false if is not
   */
  this.isGroup = (nextStr) => {
    if (nextStr === "(") {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Handle the creation of groups within exp
   * @param {str} openGlyph Opening of group
   * @param {Array<string>} splitSource split regex source
   * @returns {string} Formatted group
   */
  this.handleGroup = (openGlyph, splitSource) => {
    let group = functonTemplate.clone(), // Create new function string template
      chainArr = [], // Array to use as chain
      methodMap = {
        // Map of group method to opener
        "(": "group",
        "(?=": "look.ahead",
        "(?!": "negativeLook.ahead",
        "(?<=": "look.behind",
        "(?<!": "negativeLook.behind",
      };
    group.set("$METHOD", methodMap[openGlyph]); // Set template method
    let unclosedSubGroups = 0; // unclosed subgroups
    let done = false; // is done
    do {
      let nextChar = splitSource.shift();
      if (nextChar === "\\") nextChar += splitSource.shift(); // get escaped characters
      if (nextChar === "(") {
        unclosedSubGroups++; // if next character is ( add one to unclosed groups
      } else if (nextChar === ")" && unclosedSubGroups > 0) {
        unclosedSubGroups--; // if there is an open group and the next character is ) subtract from unclosed groups
      }
      chainArr.push(nextChar); // add to chain
      if (splitSource[0] === ")" && unclosedSubGroups === 0) done = true; // if the next character is a ) and 0 unclosed groups, done
    } while (!done);

    // Recursively run wordify on chain characters
    let chainExpression = this.wordify(new RegExp(chainArr.join("")), true);
    splitSource.shift(); // Remove close
    group.set("$CHAIN", chainExpression); // set chain
    return group.str; // return string
  };

  /**
   * Create a set from regular expression
   * @param {Array<string>} splitSource  splitSource Regex source list
   * @returns {string} set string
   */
  this.handleSet = (splitSource) => {
    let setList = []; // list to return
    if (splitSource[0] === "^") {
      // If carrot is next arg, negated set
      splitSource.shift();
      setList.push(`.negatedSet("`);
    } else {
      setList.push(`.set("`);
    }
    while (splitSource[0] !== "]") {
      let nextChar = splitSource.shift();
      if (nextChar === "\\") nextChar += splitSource.shift();
      setList.push(nextChar);
    }
    splitSource.shift();
    let functionNeeded = false;
    ["\\s", "\\S", "\\d", "\\D", "\\w", "\\W", "\\t", "\\n"].forEach(
      (glyph) => {
        if (contains(setList, glyph)) functionNeeded = true;
      }
    );
    if (functionNeeded) {
      // If a functions is needed, create a new function template and wordify setlist
      let listFn = functonTemplate.clone(),
        setListRegexp = new RegExp(setList.join("").replace(/\.\w+\("/g, "")); // join setlist and replace declaration at beginning
      return listFn.fill("set", this.wordify(setListRegexp, true));
    } else {
      return `${setList
        .join("")
        .replace(/\\(?!")/g, "") // replace escapes in front of characters that are not quotes
        .replace(/(?<!\()\"/g, '\\"')}")`; // replace contained quotes with escaped ones
    }
  };

  /**
   * Change regular expression into regular expression but with words
   * @param {RegExp} regexp Regular expression
   * @param {boolean=} subexp is a subexpression from a regular expression prevents returning `done()`
   * @returns {string} Stringified regexp but with words
   */
  this.wordify = (regexp, subexp) => {
    let sourceString = regexp.source, // Regex source between / and /
      nextStr, // Next string to evaluate from regex
      wordString = "exp", // return text, starts with `exp`
      expArr = []; // expression array

    let splitSource = sourceString.split(""); // regex source split into individual characters

    function shiftNext() {
      nextStr += splitSource.shift();
    }

    // While there are still characters
    while (splitSource.length > 0) {
      nextStr = splitSource.shift(); // Store next character
      if (nextStr === "\\") shiftNext(); // add following element to next character if escaped
      // if nextStr is a regex token
      if (containsKeys(this.regexTokenFunctions, nextStr)) {
        // if is escape character
        let tokenStr =
          this.rangeTokenName(nextStr) + this.getRange(splitSource) + ")"; // Get token name and range
        expArr.push(tokenStr); // add to expression array
      } else if (this.isGroup(nextStr, splitSource[0])) {
        // If is a group
        if (splitSource[0] === "?") shiftNext(); // Add ? for lookahead and lookbehind
        if (splitSource[0] === "=" || splitSource[0] === "!") {
          shiftNext(); // add characters for lookahead and negative lookahead
        } else if (splitSource[0] === "<") {
          shiftNext(); // add characters for lookbehind
          shiftNext();
        }
        expArr.push(this.handleGroup(nextStr, splitSource)); // add group
      } else if (nextStr === "[") {
        expArr.push(this.handleSet(splitSource)); // add sets
      } else {
        // otherwise use string literal
        expArr.push(`${this.handleStringLiteral(nextStr, splitSource)})`);
      }
    }
    // add expression arr to wordstring. if not sub expression, add done
    wordString += expArr.join("") + (subexp ? "" : `.done("${regexp.flags}")`);
    return wordString; // return string
  };

  /**
   * Space out regexButWithWords outputs
   * @param {string} str stringified function calls
   * @returns {string} spaced out string
   */
  this.spaceItOut = function (str) {
    let splitStr = str.split(
      new regexButWithWords().look
        .behind((exp) => {
          exp.literal("exp").or().literal(")");
        })
        .literal(".") // . character behind exp or )
        .or()
        .look.behind("{") 
        .whitespace() // whitespace character between { and exp
        .look.ahead("exp")
        .or()
        .look.behind(")")
        .whitespace() // whitespace character between ) and }
        .look.ahead("}")
        .done("g")
    );
    let spaceCount = 2; // number of spaces to indend
    let returnString = splitStr.shift(); // shift first string exp to start return string
    /**
     * Add spaces
     * @param {number} count number of spaces
     * @returns {string} string with number of spaces added
     */
    function spacer(count) {
      let spaces = "";
      while (spaces.length < count) {
        spaces += " ";
      }
      return spaces;
    }

    // while still strings
    while (splitStr.length > 0) {
      let isExp = splitStr[0] === "exp"; // is expression if starts with `exp`
      let isClose = splitStr[0] === "})"; // is close if end of function
      if (isClose) spaceCount -= 4; // subtract 4 if close
      if (isExp) spaceCount += 2; // add two spaces is is expression
      returnString +=
        "\n" + // add newline to return string
        spacer(spaceCount) + // add spaces
        (isExp || isClose ? "" : ".") + // if is expression or is closed, add "" otherwise add . to chain
        splitStr.shift(); // shift off last element
      if (isExp) spaceCount += 2; // add two spaces number if expression
    }
    return returnString; // return string
  };

  this.toString = (regexp) => {
    return this.spaceItOut(this.wordify(regexp))
  }
};

module.exports = new verbose();
