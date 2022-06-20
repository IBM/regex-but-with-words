const { assert } = require("chai");
const {
  keyCheck,
  emptyCheck,
  arrTypeCheck,
  containsCheck,
  containsAny,
  flagTest,
  prettyJSON,
  getVerbActions,
  tostring,
  centerString,
  capitalize,
  splitAndRejoin,
  distinct,
  replaceOptionalFlags,
  flagValues,
  allDistinct,
} = require("../lib/utils");
const utils = require("../lib/utils");

describe("utils", () => {
  describe("eachKey", () => {
    let eachKey = utils.eachKey;
    it("should correctly run eachKey", () => {
      let testData = [];
      eachKey({ test: "test" }, (key) => testData.push(key));
      assert.deepEqual(testData, ["test"], "it should return correct data");
    });
  });
  describe("containsKeys", () => {
    let containsKeys = utils.containsKeys;
    it("should return true if key exists in object", () => {
      assert.isTrue(containsKeys({ test: true }, "test"));
    });
    it("should return false if key does not exist in object", () => {
      assert.isTrue(containsKeys({ test: true }, "test"));
    });
  });
  describe("getType", () => {
    let getType = utils.getType;
    it("should return array if is array", () => {
      assert.deepEqual(getType([]), "Array", "should retun corrct value");
    });
    it("should return Function if is Function", () => {
      assert.deepEqual(
        getType(getType),
        "Function",
        "should retun corrct value"
      );
    });
    it("should return typeof if is not function or Array", () => {
      assert.deepEqual(getType({}), "object", "should retun corrct value");
    });
  });
  describe("keys", () => {
    it("should return correct keys", () => {
      let keys = utils.keys;
      assert.deepEqual(
        keys({ test: true }),
        ["test"],
        "should return correct keys"
      );
    });
  });
  describe("isEmpty", () => {
    let isEmpty = utils.isEmpty;
    it("should return false if not empty", () => {
      assert.deepEqual(isEmpty(["test"]), false, "should return correct keys");
    });
  });
  describe("keyTest", () => {
    let keyTest = utils.keyTest;
    it("should return false if strict and number of keys don't match", () => {
      assert.isFalse(
        keyTest(
          {
            test: true,
            bad: "frog",
          },
          ["test"],
          true
        ),
        "should be false"
      );
    });
    it("should return false if strict and missing key", () => {
      assert.isFalse(
        keyTest(
          {
            test: true,
            bad: "frog",
          },
          ["test", "test-2"]
        ),
        "should be false"
      );
    });
    it("should return true if all match", () => {
      assert.isTrue(
        keyTest(
          {
            test: true,
          },
          ["test"]
        ),
        "should be true"
      );
    });
  });
  describe("contains", () => {
    let contains = utils.contains;
    it("should return true if item in array", () => {
      assert.isTrue(contains(["test"], "test"), "should be true");
    });
    it("should return false if item not in array", () => {
      assert.isFalse(contains(["test"], "frog"), "should be true");
    });
  });
  describe("typeCheck", () => {
    it("should throw a error with the correct message if value is wrong type", () => {
      assert.throws(() => {
        utils.typeCheck("uh oh", "number", "string");
      }, "uh oh number got string");
    });
  });
  describe("keyCheck", () => {
    it("should throw an error if strict check fails", () => {
      assert.throws(() => {
        keyCheck("uh oh", { frog: true, foo: "baz" }, ["frog"], true);
      }, 'uh oh 1 keys ["frog"] got ["frog","foo"]');
    });
    it("should throw an error if non strict check fails", () => {
      assert.throws(() => {
        keyCheck("uh oh", { foo: "baz" }, ["frog"]);
      }, 'uh oh ["frog"] got ["foo"]');
    });
    it("should not throw if everything is fine", () => {
      assert.doesNotThrow(() => {
        keyCheck("uh oh", { foo: "baz" }, ["foo"]);
      }, 'uh oh ["frog"] got ["foo"]');
    });
  });
  describe("emptyCheck", () => {
    it("should throw an error if length is not 0", () => {
      assert.throws(() => {
        emptyCheck("should got 0", []);
      }, "should got 0");
    });
    it("should not throw an error if length is 0", () => {
      assert.doesNotThrow(() => {
        emptyCheck("should got 0", ["a"]);
      }, "should got 0");
    });
  });
  describe("arrTypeCheck", () => {
    assert.throws(() => {
      arrTypeCheck("should", "string", [1, 2, 3, 4]);
    }, `should type string got ["number","number","number","number"]`);
  });
  describe("containsCheck", () => {
    it("should throw error if not in array", () => {
      assert.throws(() => {
        containsCheck("should", ["frog", "string", "egg"], "4");
      }, "should got 4");
    });
    it("should not throw error if in array", () => {
      assert.doesNotThrow(() => {
        containsCheck("should", ["frog", "string", "egg"], "egg");
      }, "should got 4");
    });
  });
  describe("containsAny", () => {
    it("should return false if no overlapping entries", () => {
      let actualData = containsAny(["a"], ["b"]);
      assert.isFalse(actualData, "should be false");
    });
    it("should return true if overlapping keys", () => {
      let actualData = containsAny(["b"], ["b"]);
      assert.isTrue(actualData, "should be true");
    });
  });
  describe("textTemplate", () => {
    let textTemplate = utils.textTemplate;
    const resourceTemplate = `tfx.resource(\n  "$RESOURCE_NAME",\n  "$RESOURCE_ADDRESS",\n$VALUES\n),`;
    it("should get all the args from a string teplate and set as templateArgs", () => {
      let expectedData = ["$RESOURCE_NAME", "$RESOURCE_ADDRESS", "$VALUES"];
      let actualData = new textTemplate(resourceTemplate).templateArgs;
      assert.deepEqual(actualData, expectedData, "should have correct array");
    });
    describe("fill", () => {
      it("should fill the template variable values", () => {
        let expectedData = `tfx.resource(\n  "yes",\n  "hi",\nhello\n),`;
        let actualData = new textTemplate(resourceTemplate).fill(
          "yes",
          "hi",
          "hello"
        );
        assert.deepEqual(
          actualData,
          expectedData,
          "It should return filled in template"
        );
      });
    });
    describe("set", () => {
      it("should replace a value and return the object", () => {
        let expectedData = `tfx.resource(\n  "$RESOURCE_NAME",\n  "$RESOURCE_ADDRESS",\nhi\n),`;
        let actualData = new textTemplate(resourceTemplate).set(
          "$VALUES",
          "hi"
        );
        assert.deepEqual(
          actualData,
          expectedData,
          "should return string template"
        );
      });
    });
    describe("setx", () => {
      it("should run set and return this to chain", () => {
        let expectedData = `tfx.resource(\n  "$RESOURCE_NAME",\n  "$RESOURCE_ADDRESS",\nhi\n),`;
        let actualData = new textTemplate(resourceTemplate).setx(
          "$VALUES",
          "hi"
        ).str;
        assert.deepEqual(
          actualData,
          expectedData,
          "should return string template"
        );
      });
    });
    describe("clone", () => {
      it("should create a new instance of the textTemplate instance", () => {
        let original = new textTemplate(resourceTemplate);
        let cloneTemplate = original.clone();
        assert.deepEqual(original.str, cloneTemplate.str, "it should copy");
      });
      it("should not change the original when the clone is changed", () => {
        let original = new textTemplate(resourceTemplate);
        let cloneTemplate = original.clone();
        cloneTemplate.set("$VALUES", "frog");
        assert.notDeepEqual(original.str, cloneTemplate.str, "it should copy");
      });
    });
  });
  describe("prettyJSON", () => {
    it("should return the correct json data", () => {
      let obj = { key: "value" };
      assert.deepEqual(
        prettyJSON(obj),
        JSON.stringify(obj, null, 2),
        "it should return correctly formated data"
      );
    });
  });
  describe("matchLength", () => {
    it("should add spaces to the length of a string until it is the same as the number passed", () => {
      let matchedString = utils.matchLength("test", 17);
      assert.deepEqual(
        matchedString.length,
        17,
        "It should contain 17 characters"
      );
    });
    it("should remove chatacters until the string is the same length as the number passed if the number is smaller", () => {
      let matchedString = utils.matchLength("test", 1);
      assert.deepEqual(matchedString, "t", "It should return one characer");
    });
    it("should return dashes if `alternateCharacter` is -", () => {
      let matchedString = utils.matchLength("", 5, "-");
      assert.deepEqual(matchedString, "-----", "It should return 5 dashes");
    });
    it("should return a matching number of spaces if the string is null", () => {
      let matchedString = utils.matchLength("", 1);
      assert.deepEqual(matchedString, " ", "It should return one characer");
    });
  });
  describe("removeTrailingSpaces", () => {
    it("should remove spaces from the end of a string", () => {
      let testString = "test    ";
      let expectedString = "test";
      let actualString = utils.removeTrailingSpaces(testString);
      assert.deepEqual(
        actualString,
        expectedString,
        "It should return the string with no spaces at the end"
      );
    });
    it("should not remove chatacters if spaces are absent", () => {
      let testString = "test";
      let expectedString = "test";
      let actualString = utils.removeTrailingSpaces(testString);
      assert.deepEqual(
        actualString,
        expectedString,
        "It should return the string with no spaces at the end"
      );
    });
  });
  describe("longestKeyValue", () => {
    const testData = [
      {
        test: "test",
        testEntry: "testEntry",
        longTestEntry: "longTestEntry",
      },
      {
        test: "1",
        testEntry: "2",
        longTestEntry: "3",
      },
      {
        test: "aVeryLongTestEntry",
        noValueLengthTest: "",
      },
    ];
    it("Should correctly return the longest value for a single entry", () => {
      let longest = utils.longestKeyValue(testData, "test");
      assert.deepEqual(
        longest,
        18,
        "It should correctly count the number of chatacters"
      );
    });
    it("Should return the length of the key if the longest entry is shorter than the key name length", () => {
      let longest = utils.longestKeyValue(testData, "noValueLengthTest");
      assert.deepEqual(longest, 17, "It should be equal to the length `17`");
    });
  });
  describe("tostring", () => {
    it("should return string if function", () => {
      let expectedData = (() => {}).toString();
      let actualData = tostring(() => {});
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
    it("should return string if object", () => {
      let expectedData = prettyJSON({ key: "value" });
      let actualData = tostring({ key: "value" });
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
    it("should return string if array", () => {
      let expectedData = prettyJSON(["foo"]);
      let actualData = tostring(["foo"]);
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
    it("should return string if bool or number", () => {
      let expectedData = "2";
      let actualData = tostring(2);
      assert.deepEqual(
        actualData,
        expectedData,
        "should return correct string"
      );
    });
  });
  describe("centerString", () => {
    it("should throw if anchor is provided and length is not one", () => {
      let task = () => {
        centerString("frog", 12, "mp");
      };
      assert.throws(
        task,
        "center string expects anchor to be a single character or false."
      );
    });
    it("should not throw if anchor is false", () => {
      let task = () => {
        centerString("frog", 12, false);
      };
      assert.doesNotThrow(
        task,
        "center string expects anchor to be a single character or false."
      );
    });
    it("should throw if alternateCharacter is provided and length is not one", () => {
      let task = () => {
        centerString("frog", 12, false, "no");
      };
      assert.throws(
        task,
        "center string expects alternateCharacter to be a single character."
      );
    });
    it("should not throw if alternateCharacter is not provided", () => {
      let task = () => {
        centerString("frog", 12, false);
      };
      assert.doesNotThrow(
        task,
        "center string expects alternateCharacter to be a single character."
      );
    });
    it("should throw an error if string length is greater than length to match", () => {
      let task = () => {
        centerString("frog", 2);
      };
      assert.throws(
        task,
        `centerString expects length of str "frog" (4) to be less than length (2)`
      );
    });
    it("should throw an error if string length is greater than length - 2 to match with anchor", () => {
      let task = () => {
        centerString("frog", 4, "$");
      };
      assert.throws(
        task,
        `centerString expects length of str "frog" (4) to be less than length without anchor (2)`
      );
    });
    it("should return string with anchor", () => {
      assert.deepEqual(
        centerString("f", 5, "g"),
        "g f g",
        "it should return correct string"
      );
    });
    it("should return string with anchor and alternate character", () => {
      assert.deepEqual(
        centerString("f", 5, "g", "*"),
        "g*f*g",
        "it should return correct string"
      );
    });
  });
  describe("capitalize", () => {
    it("should capitalize a word", () => {
      assert.deepEqual(capitalize("frog"), "Frog", "it should capitalize");
    });
  });
  describe("splitAndRejoin", () => {
    it("should split and rejoin", () => {
      let actualData = splitAndRejoin("one two three", "ee", " ", "**");
      let expectedData = "one**two**thr";
      assert.deepEqual(actualData, expectedData, "it should rejoin");
    });
    it("should split and rejoin and split", () => {
      let actualData = splitAndRejoin("one two three", "ee", " ", "**", "**");
      let expectedData = ["one", "two", "thr"];
      assert.deepEqual(actualData, expectedData, "it should rejoin");
    });
  });
  describe("distinct", () => {
    it("should return only distinct strings", () => {
      let actualData = distinct(["one", "two", "one"]);
      let expectedData = ["one", "two"];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("flagTest", () => {
    it("should throw an error if duplicate flags are found", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "-h": "--help",
            "--help": "-h",
          },
          "-h",
          "-h"
        );
      };
      assert.throws(task, "Invalid flag -h for command help");
    });
    it("should throw an error if a flag is used with a synonym multiple times", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "-h": "--help",
            "--help": "-h",
          },
          "-h",
          "--help"
        );
      };
      assert.throws(task, "Invalid flag --help for command help");
    });
    it("should throw an error if a flag is not found in aliases", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "-h": "--help",
            "--help": "-h",
          },
          "-h",
          "-f"
        );
      };
      assert.throws(task, "Invalid flag -f");
    });
    it("should not throw an error if reading an argument that does not have at least one hyphen", () => {
      let task = () => {
        flagTest(
          "help",
          {
            "--in": "-i",
            "-i": "--in",
          },
          "--in",
          "filePath"
        );
      };
      assert.doesNotThrow(task);
    });
    it("should throw an error if all needed flags are not provided", () => {
      let task = () => {
        flagTest(
          "help",
          { "--in": "-i", "-i": "--in", "-o": "--out", "--out": "-o" },
          "--in",
          "./filePath"
        );
      };
      assert.throws(task, "Missing flags from help --in --out");
    });
    it("should not throw an error if an optional flag is passed", () => {
      let task = () => {
        flagTest(
          "plan",
          getVerbActions(
            {
              requiredFlags: ["in", "out", "type"],
              optionalFlags: [
                {
                  name: "tfvar",
                  allowMultiple: true,
                },
              ],
            },
            {
              help: ["-h", "--help"],
              in: ["-i", "--in"],
              out: ["-o", "--out"],
              type: ["-t", "--type"],
              tfvar: ["-v", "--tf-var"],
            }
          ),
          "-i",
          "./in-file-path/",
          "-o",
          "./out-file.test.js",
          "-t",
          "tfx",
          "-v",
          "testVar1=true",
          "-v",
          'testVar2="true"'
        );
        assert.doesNotThrow(task);
      };
    });
  });
  describe("getVerbActions", () => {
    it("should return correct alias map for a verb", () => {
      let plan = {
        requiredFlags: ["in", "out", "type"],
      };
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        // extract -in path -out path -type tfx | yaml
      };
      let expectedData = {
        "-i": "--in",
        "--in": "-i",
        "-o": "--out",
        "--out": "-o",
        "-t": "--type",
        "--type": "-t",
      };
      let actualData = getVerbActions(plan, tags);
      assert.deepEqual(expectedData, actualData);
    });
    it("should remove optional flags with no needed key values", () => {
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        shallow: ["-s", "--shallow"],
        // extract -in path -out path -type tfx | yaml
      };
    });
    it("should return correct alias map for a verb with optional multiple tags", () => {
      let plan = {
        requiredFlags: ["in", "out", "type"],
        optionalFlags: [
          {
            name: "tfvar",
            allowMultiple: true,
          },
        ],
      };
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        tfvar: ["-v", "--tf-var"],
        // extract -in path -out path -type tfx | yaml
      };
      let expectedData = {
        "-i": "--in",
        "--in": "-i",
        "-o": "--out",
        "--out": "-o",
        "-t": "--type",
        "--type": "-t",
        "?*-v": "?*--tf-var",
        "?*--tf-var": "?*-v",
      };
      let actualData = getVerbActions(plan, tags);
      assert.deepEqual(expectedData, actualData);
    });
    it("should return correct alias map for a verb with optional tags", () => {
      let plan = {
        requiredFlags: ["in", "out", "type"],
        optionalFlags: [
          {
            name: "tfvar",
          },
        ],
      };
      let tags = {
        help: ["-h", "--help"],
        in: ["-i", "--in"],
        out: ["-o", "--out"],
        type: ["-t", "--type"],
        tfvar: ["-v", "--tf-var"],
        // extract -in path -out path -type tfx | yaml
      };
      let expectedData = {
        "-i": "--in",
        "--in": "-i",
        "-o": "--out",
        "--out": "-o",
        "-t": "--type",
        "--type": "-t",
        "?-v": "?--tf-var",
        "?--tf-var": "?-v",
      };
      let actualData = getVerbActions(plan, tags);
      assert.deepEqual(expectedData, actualData);
    });
  });
  describe("containsAny", () => {
    it("should return false if no overlapping entries", () => {
      let actualData = containsAny(["a"], ["b"]);
      assert.isFalse(actualData, "should be false");
    });
    it("should return true if overlapping keys", () => {
      let actualData = containsAny(["b"], ["b"]);
      assert.isTrue(actualData, "should be true");
    });
  });
  describe("replaceOptionalFlags", () => {
    it("should return command if none optional flags", () => {
      let actualData = replaceOptionalFlags(
        { requiredFlags: ["one"] },
        {},
        "hi"
      );
      assert.deepEqual(actualData, ["hi"], "it should return commands");
    });
    it("should replace optional flags that do not accept multiple arguments", () => {
      let actualData = replaceOptionalFlags(
        {
          optionalFlags: [
            {
              name: "optional",
            },
          ],
        },
        {
          optional: ["-o", "--ooo"],
        },
        "-o",
        "frog"
      );
      let expectedData = ["?-o", "frog"];
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("flagValues", () => {
    it("should return key value pair of flag values", () => {
      let actualData = flagValues(
        "plan",
        {
          requiredFlags: ["in", "out", "type"],
          optionalFlags: [
            {
              name: "tfvars",
              allowMultiple: true,
            },
          ],
        },
        {
          help: ["-h", "--help"],
          in: ["-i", "--in"],
          out: ["-o", "--out"],
          type: ["-t", "--type"],
          tfvars: ["-v", "--tf-var"],
        },
        "-i",
        "./in-file-path/",
        "-o",
        "./out-file.test.js",
        "-t",
        "tfx",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"'
      );
      let expectedData = {
        in: "./in-file-path/",
        out: "./out-file.test.js",
        type: "tfx",
        tfvars: ["testVar1=true", 'testVar2="true"'],
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should not assign a value to optional flags with no matching key = true", () => {
      let expectedData = {
        in: "./in-file-path/",
        out: "./out-file.test.js",
        type: "tfx",
        tfvars: ["testVar1=true", 'testVar2="true"'],
        shallow: true,
      };
      let actualData = flagValues(
        "plan",
        {
          requiredFlags: ["in", "out", "type"],
          optionalFlags: [
            {
              name: "tfvars",
              allowMultiple: true,
            },
            {
              name: "shallow",
              noMatchingValue: true,
            },
          ],
        },
        {
          help: ["-h", "--help"],
          in: ["-i", "--in"],
          out: ["-o", "--out"],
          type: ["-t", "--type"],
          tfvars: ["-v", "--tf-var"],
          shallow: ["-s", "--shallow"],
        },
        "-i",
        "./in-file-path/",
        "-o",
        "./out-file.test.js",
        "-s",
        "-t",
        "tfx",
        "-v",
        "testVar1=true",
        "-v",
        'testVar2="true"'
      );
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
  });
  describe("allDistinct", () => {
    it("should return true if all distinct and false if not", () => {
      let dist = ["a","b", "c"]
      let not = ["a","a", "c"]
      assert.isTrue(allDistinct(dist))
      assert.isFalse(allDistinct(not))
    })
  })
});
