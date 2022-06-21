const { assert } = require("chai");
const { wordify, spaceItOut, toString } = require("../lib/verbose");
const verbose = require("../lib/verbose");

describe("verbose", () => {
  describe("rangeTokenName", () => {
    it("should return a named version of token", () => {
      assert.deepEqual(verbose.rangeTokenName("\\d"), ".digit(");
    });
  });
  describe("wordify", () => {
    it("should turn a simple regular expression into a function", () => {
      let actualData = wordify(/\d/g);
      let expectedData = 'exp.digit().done("g")';
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should turn a simple regular expression with {4} into a function", () => {
      let actualData = wordify(/\d{4}/g);
      let expectedData = 'exp.digit(4).done("g")';
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a string literal with a range", () => {
      let actualData = wordify(/frog{4}/g);
      let expectedData = 'exp.literal("fro").literal("g", 4).done("g")';
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a string literal with a minimum and max range", () => {
      let actualData = wordify(/frog{4,5}/g);
      let expectedData = 'exp.literal("fro").literal("g", 4, 5).done("g")';
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a string literal with an improperly escaped character", () => {
      let actualData = wordify(/\p/g);
      let expectedData = 'exp.literal("p").done("g")';
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a string literal with a lazy character", () => {
      let actualData = wordify(/\w?/g);
      let expectedData = 'exp.word().lazy().done("g")';
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a string literal with an asterisk", () => {
      let actualData = wordify(/\w*/g);
      let expectedData = 'exp.word().anyNumber().done("g")';
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a capturing group", () => {
      let actualData = wordify(/(word)/g);
      let expectedData = `exp.group((exp) => { exp.literal("word") }).done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a capturing group within a capturing group", () => {
      let actualData = wordify(/(dr(i|a)nk)/g);
      let expectedData = `exp.group((exp) => { exp.literal("dr").group((exp) => { exp.literal("i").or().literal("a") }).literal("nk") }).done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a capturing group within a capturing group with a set", () => {
      let actualData = wordify(/(dr(i|[ua])nk)/g);
      let expectedData = `exp.group((exp) => { exp.literal("dr").group((exp) => { exp.literal("i").or().set("ua") }).literal("nk") }).done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a character set", () => {
      let actualData = wordify(/[word]/g);
      let expectedData = `exp.set("word").done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a negated character set", () => {
      let actualData = wordify(/[^word]/g);
      let expectedData = `exp.negatedSet("word").done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a negated character set and escape characters", () => {
      let actualData = wordify(/[^\]\?\-word]/g);
      let expectedData = `exp.negatedSet("]?-word").done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a look.ahead", () => {
      let actualData = wordify(/frog(?=mite)/g);
      let expectedData = `exp.literal("frog").look.ahead((exp) => { exp.literal("mite") }).done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a negative lookahead", () => {
      let actualData = wordify(/frog(?!mite)/g);
      let expectedData = `exp.literal("frog").negativeLook.ahead((exp) => { exp.literal("mite") }).done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a look.behind", () => {
      let actualData = wordify(/(?<=mite)frog/g);
      let expectedData = `exp.look.behind((exp) => { exp.literal("mite") }).literal("frog").done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a negative lookahead", () => {
      let actualData = wordify(/(?<!mite)frog/g);
      let expectedData = `exp.negativeLook.behind((exp) => { exp.literal("mite") }).literal("frog").done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should correctly return beginning and end of string", () => {
      let actualData = wordify(/^--?[a-z-]+\s\S+(\s--?[a-z-]+\s\S+)*$/g);
      let expectedData = `exp.stringBegin().literal("-").literal("-").lazy().set("a-z-").oneOrMore().whitespace().notWhitespace().oneOrMore().group((exp) => { exp.whitespace().literal("-").literal("-").lazy().set("a-z-").oneOrMore().whitespace().notWhitespace().oneOrMore() }).anyNumber().stringEnd().done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a literal with whitespace after", () => {
      let actualData = wordify(/="\s/g);
      let expectedData = `exp.literal("=\\"").whitespace().done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return a literal containing an open parenthesis", () => {
      let actualData = wordify(/hello\(/g);
      let expectedData = `exp.literal("hello(").done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return set to have a function if it contains characters other than string", () => {
      let actualData = wordify(/hello[sh\s\w]/g);
      let expectedData = `exp.literal("hello").set((exp) => { exp.literal("sh").whitespace().word() }).done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
    it("should return newline and tab expressions", () => {
      let actualData = wordify(/\n\t/g);
      let expectedData = `exp.newline().tab().done("g")`;
      assert.deepEqual(actualData, expectedData, "it should return data");
    });
  });
  describe("spaceItOut", () => {
    it("should add indentation and spaces to output", () => {
      let expectedData = `exp
  .stringBegin()
  .literal("-")
  .literal("-")
  .lazy()
  .set("a-z-")
  .oneOrMore()
  .whitespace()
  .notWhitespace()
  .oneOrMore()
  .group((exp) => {
    exp
      .whitespace()
      .literal("-")
      .literal("-")
      .lazy()
      .set("a-z-")
      .oneOrMore()
      .whitespace()
      .notWhitespace()
      .oneOrMore()
  })
  .anyNumber()
  .stringEnd()
  .done("g")`;
      let actualData = spaceItOut(
        `exp.stringBegin().literal("-").literal("-").lazy().set("a-z-").oneOrMore().whitespace().notWhitespace().oneOrMore().group((exp) => { exp.whitespace().literal("-").literal("-").lazy().set("a-z-").oneOrMore().whitespace().notWhitespace().oneOrMore() }).anyNumber().stringEnd().done("g")`
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return formatted data"
      );
    });
  });
  describe("toString", () => {
    it("should return formatted text from raw regexp", () => {
      let expectedData = `exp\n  .digit()\n  .done("g")`
      let actualData = toString(/\d/g)
      assert.deepEqual(actualData, expectedData, "it should return correct data")
    })
  })
});
