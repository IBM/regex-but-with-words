const { assert } = require("chai");
const RegexButWithWords = require("../lib/expressions.js");
const MethodObject = new RegexButWithWords();

describe("firefox and safari compatability testing", () => {
  describe("escapeLiterals", () => {
    let escapeLiterals = MethodObject.escapeLiterals;
    it("should replace a pipe character not following an escape sequence", () => {
      let stringLiteral = "frog|mite";
      let expectedData = "frog\\|mite";
      assert.deepEqual(
        escapeLiterals(stringLiteral),
        expectedData,
        "it should replace the sequence"
      );
    });
  });
});
