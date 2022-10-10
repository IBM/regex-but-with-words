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
  it("should create ^[a-zA-Z0-9-.,_s]*$ using rbbw", () => {
    let expectedExpression = /^[a-zA-Z0-9-\.,_\s]*$/g;
    let actualExpression = new RegexButWithWords()
      .stringBegin()
      .set("a-zA-Z0-9-.,_\\s")
      .anyNumber()
      .stringEnd()
      .done("g");
    assert.deepEqual(
      actualExpression,
      expectedExpression,
      "it should create correct expression"
    );
  });
  it("should create expression for maskFields with rbbw", () => {
    let expectedExpression =
      /(?:(public_key|tmos_admin_password)\"\s?:\s?\")[^"]+(?=\")/g;
    let actualExpression = new RegexButWithWords().look
      .behind((exp) =>
        exp
          .group((exp) =>
            exp.literal("public_key").or().literal("tmos_admin_password")
          )
          .literal('"')
          .whitespace()
          .lazy()
          .literal(":")
          .whitespace()
          .lazy()
          .literal('"')
      )
      .negatedSet('"')
      .oneOrMore()
      .look.ahead('"')
      .done("g");
    assert.deepEqual(
      actualExpression,
      expectedExpression,
      "it should create correct expression"
    );
  });
  it("should create the name validation expression for slz", () => {
    let expectedExpression = /^[A-z]([a-z0-9-]*[a-z0-9])?$/i;
    let actualExpression = new RegexButWithWords()
      .stringBegin()
      .set("A-z")
      .group((exp) => {
        exp.set("a-z0-9-").anyNumber().set("a-z0-9");
      })
      .lazy()
      .stringEnd()
      .done("i");
    assert.deepEqual(
      actualExpression,
      expectedExpression,
      "it should create correct expression"
    );
  });
  it("should create rbbw for quotes around string snad escaped slashes", () => {
    let actualExpression = new RegexButWithWords().look
      .behind((exp) => {
        exp.whitespace();
      })
      .literal('"')
      .look.ahead((exp) => {
        exp.word();
      })
      .or()
      .look.behind((exp) => {
        exp.word().or().digit().or().literal("]");
      })
      .literal('"')
      .look.ahead((exp) => {
        exp.newline();
      })
      .or()
      .group((exp) => {
        exp.literal("\\", 4);
      })
      .or()
      .look.behind((exp) => exp.literal("-").whitespace())
      .literal('"')
      .done("g");
    let expectedExpression =
      /(?:\s)\"(?=\w)|(?:\w|\d|\])\"(?=\n)|(\\{4})|(?:-\s)\"/g;
    assert.deepEqual(
      actualExpression,
      expectedExpression,
      "it should create correct expression"
    );
  });
});
