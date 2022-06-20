/**
 * General utilities
 * - Function shortcuts
 */

const utils = function () {
  /**
   * helper function to see if an object containsKeys a key
   * @param {Object} object Any object
   * @param {string} str Name of the key to find
   * @returns {boolean} true if containsKeys, false if does not or is not an object
   */
  this.containsKeys = (object, str) => {
    return !(Object.keys(object).indexOf(str) === -1);
  };

  /**
   * Lazy get type
   * @param {*} value Value
   * @returns {string} Array for array, Function for function, `typeof` for other types
   */
  this.getType = function (value) {
    if (typeof value === "object" && Array.isArray(value)) {
      return "Array";
    }
    if (value instanceof Function) {
      return "Function";
    }
    return typeof value;
  };

  /**
   * Shortcut for Object.keys`
   * @param {object} obj Object
   * @returns {Array<string>} list of keys
   */
  this.keys = (obj) => {
    return Object.keys(obj);
  };

  /**
   * Check if array is empty
   * @param {Array} arr Array
   * @returns {boolean} true if length == 0
   */
  this.isEmpty = (arr) => {
    this.typeCheck(`isEmpty expects type of`, "Array", arr);
    return arr.length === 0;
  };

  /**
   * Shortcut to check if array of strings contains a value
   * @param {Array} arr array
   * @param {*} value Value to check
   * @returns {boolean} true if array contains value
   */
  this.contains = (arr, value) => {
    // this.typeCheck("contains expects type", "Array", arr);
    // this.arrTypeCheck(`contains expects all entries to be`, "string", arr);
    return arr.indexOf(value) !== -1;
  };

  /**
   * Checks to see if any instances of sting from one array are found in another
   * @param {Array} sourceArr Array to compare against
   * @param {Array} arr Array to search for
   * @returns {boolean} If any instance is found
   */
  this.containsAny = (sourceArr, arr) => {
    this.typeCheck("contains expects type", "Array", arr);
    this.typeCheck("contains expects type", "Array", sourceArr);
    this.arrTypeCheck(`contains expects all entries to be`, "string", arr);
    this.arrTypeCheck(
      `contains expects all entries to be`,
      "string",
      sourceArr
    );
    let found = false;
    arr.forEach((entry) => {
      if (this.contains(sourceArr, entry)) {
        found = true;
      }
    });
    return found;
  };

  /**
   * Test to see if an object has needed keys
   * @param {Object} value Value to check
   * @param {Array<string>} keys Keys to check for
   * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
   * @returns {boolean} True if all params match
   */
  this.keyTest = (value, keys, strict) => {
    if (strict && Object.keys(value).length !== keys.length) return false;
    let allKeysFound = true;
    keys.forEach((key) => {
      if (!this.containsKeys(value, key)) allKeysFound = false;
    });
    return allKeysFound;
  };

  /**
   * Checks a value type
   * @param {string} message Display message
   * @param {string} type Expected type
   * @param {*} value value to test
   * @throws When type is not found
   */
  this.typeCheck = (message, type, value) => {
    if (this.getType(value) !== type) {
      throw new Error(`${message} ${type} got ${this.getType(value)}`);
    }
  };

  /**
   * Check an objet for correct keys
   * @param {string} message Display message
   * @param {Object} value Value to check
   * @param {Array<string>} keys Keys to check for
   * @param {boolean?} strict Check to ensure only keys are present, otherwise non-present keys are ok
   * @throws if keys do not match
   */
  this.keyCheck = (message, value, keys, strict) => {
    if (!this.keyTest(value, keys, strict))
      throw new Error(
        `${message}${strict ? ` ${keys.length} keys` : ""} ${JSON.stringify(
          keys
        )} got ${JSON.stringify(this.keys(value))}`
      );
  };

  /** Check if array length is 0
   * @param {string} message Display message
   * @param {Array} arr Array
   * @throws if array is empty
   */
  this.emptyCheck = (message, arr) => {
    this.typeCheck(`emptyCheck expects type of`, "Array", arr);
    if (this.isEmpty(arr)) {
      throw new Error(`${message} got 0`);
    }
  };

  /**
   * Check all items in an array for a specific type
   * @param {string} message Display message
   * @param {string} type type to check
   * @param {*} arr Array to check
   * @throws if types of each item in the array do not match
   */
  this.arrTypeCheck = (message, type, arr) => {
    this.typeCheck(`arrTypeCheck expects arr to be`, "Array", arr); // Array check
    let types = [], // list of types
      allMatch = true; // all match
    // For each item
    arr.forEach((entry) => {
      let entryType = this.getType(entry); // Get type
      types.push(entryType); // add to list
      if (entryType !== type) allMatch = false; // if doesn't match, all match becomes false
    });
    if (!allMatch) {
      throw new Error(`${message} type ${type} got ${JSON.stringify(types)}`);
    }
  };

  /**
   * Test to see if an array of strings contains a value
   * @param {string} message Display Message
   * @param {Array} arr array
   * @param {string} value Value to check
   * @throws If array oes not contain value
   */
  this.containsCheck = (message, arr, value) => {
    if (!this.contains(arr, value)) {
      throw new Error(`${message} got ${value}`);
    }
  };

  /**
   * Shortcut for JSON.stringify(obj, null, 2)
   * @param {Object} obj Object to return
   * @returns {string} prettified json string
   */
  this.prettyJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  /**
   * Shortcut for Object.keys(object).forEach(i=>{})
   * @param {Object} obj Object to call
   * @param {eachKeyCallback} callback Callback function to run
   */
  this.eachKey = (obj, callback) => {
    this.typeCheck(
      `eachKey expects the the first argument to be type`,
      "object",
      obj
    );
    this.typeCheck(`eachKey expects callback to be type`, "Function", callback);
    Object.keys(obj).forEach((i) => callback(i));
  };

  /**
   * Eachkey Callback
   * @callback eachKeyCallback
   * @param {string} key Key to check values against
   */

  /**
   * Search through an array of objects and finds the longest length of a string key value
   * @param {Array<Object>} arr  Array of objects
   * @param {string} field field name
   * @returns {number} The length of the longest string
   */
  this.longestKeyValue = (arr, field) => {
    let longest = field.length; // Initialize longest as name of field
    // For each entry in the array
    arr.forEach((entry) => {
      if (entry[field]) {
        // get length of current entry
        let strLength = entry[field].length;
        // If it's longer than longest, update longest
        if (strLength > longest) {
          longest = strLength;
        }
      }
    });
    // return number of characters
    return longest;
  };
  /**
   * Remove trailing spaces from the end of a string
   * @param {string} str The string to have spaces removed from
   * @returns {string} The string with no trailing spaces
   */
  this.removeTrailingSpaces = function (str) {
    let splitStr = str.split("");
    while (splitStr[splitStr.length - 1] === " ") {
      splitStr.pop();
    }
    return splitStr.join("");
  };

  /**
   * Match the length of a string
   * @param {string} str The string that will match the legnth of the longest
   * @param {number} longest The length to match to
   * @param {string} alternateCharacter Use another character instad of spaces
   * @returns {string} string matching length
   */

  this.matchLength = (str, longest, alternateCharacter) => {
    this.typeCheck("matchLength expects str to be type", "string", str);
    this.typeCheck("matchLength expects longest to be type", "number", longest);
    this.typeCheck(
      "matchLength expects alternateCharacter to be type",
      "string",
      alternateCharacter ? alternateCharacter : ""
    );
    let newStr = str;
    if (newStr.length < longest) {
      while (newStr.length < longest) {
        // While the string is less than the longest, add a space or a dash
        newStr += alternateCharacter ? alternateCharacter : " ";
      }
    } else {
      // If the string is greater than the length, remove letters until it matches longest
      let split = newStr.split("");
      while (split.length > longest) {
        split.pop();
      }
      newStr = split.join("");
    }
    return newStr;
  };

  /**
   * Constructor to allow for easier and more readable text templates
   * @param {string} str template string
   */
  this.textTemplate = function (str) {
    this.template = str;
    this.str = str;
    this.templateArgs = [];
    // Split at chatacter before dollar sign
    str.split(/[^\$A-Z_]/g).forEach((substr) => {
      // remove trailing characters
      let capsOnly = substr.replace(/(?<=\$[A-Z_]+)[^A-Z_]+/g, "");
      // Push if matches valid template value
      if (capsOnly.match(/\$[A-Z_]/g)) this.templateArgs.push(capsOnly);
    });

    /**
     * Fill all values in order
     * @param  {...string} values List of string values
     */
    this.fill = function (...values) {
      for (let i = 0; i < values.length; i++) {
        this.str = this.str.replace(this.templateArgs[i], values[i]);
      }
      return this.str;
    };

    /**
     * Set a value and return the text
     * @param {string} key Template key
     * @param {string} value String value to set
     * @returns {string}
     */
    this.set = function (key, value) {
      this.str = this.str.replace(key, value);
      return this.str;
    };

    /**
     * Set a value and return the text template
     * @param {string} key Template key
     * @param {string} value String value to set
     * @returns {textTemplate}
     */
    this.setx = function (key, value) {
      this.set(key, value);
      return this;
    };

    /**
     * Create a clone of the text template
     * @returns {textTemplate} Text teplate object
     */
    this.clone = function () {
      let newUtils = new utils();
      return new newUtils.textTemplate(this.template);
    };
  };

  /**
   * Create a string from data
   * @param {*} data Data to get string, cannot be string
   * @returns {string} stringified data
   */
  this.tostring = (data) => {
    let dataType = this.getType(data);
    if (dataType === "Function") return data.toString();
    if (dataType === "Array" || dataType === "object")
      return this.prettyJSON(data);
    else return `${data}`;
  };

  /**
   * Center a string with
   * @param {string} str String to be centered
   * @param {string} length length for centered string to match
   * @param {string} anchor A single anchor character to replace first and last character in matched string
   * @param {string} alternateCharacter Center string in a character other than space
   * @returns {string} centered string
   */
  this.centerString = (str, length, anchor, alternateCharacter) => {
    this.typeCheck("centerString expects str to be type", "string", str);
    this.typeCheck("centerString expects length to be type", "number", length);
    // Throw error if anchor is not single character or false
    if (anchor?.length !== 1 && anchor != false && anchor != undefined) {
      throw new Error(
        `center string expects anchor to be a single character or false.`
      );
    }
    // Throw error if alternate charater is not undefined or length > 1
    if (alternateCharacter?.length !== 1 && alternateCharacter !== undefined) {
      throw new Error(
        `center string expects alternateCharacter to be a single character.`
      );
    }
    // Throw error if string is greater than length -2 if using anchor
    // or length if no anchor
    if (
      (anchor && str.length > length - 2) ||
      (!anchor && str.length > length)
    ) {
      throw new Error(
        `centerString expects length of str "${str}" (${
          str.length
        }) to be less than length ${anchor ? "without anchor " : ""}(${
          anchor ? length - 2 : length
        })`
      );
    }
    // Str to array
    let splitStr = str.split("");
    // Set space str max for anchor and without
    let spaceStrMax = anchor ? length - 2 : length;
    // Override space with alternate character if provided
    let addCharacter = alternateCharacter ? alternateCharacter : " ";
    // While length of split string is less than the max
    // if length is even add character to back, otherwise add to front
    while (splitStr.length < spaceStrMax) {
      if (splitStr.length % 2 === 0) {
        splitStr.push(addCharacter);
      } else {
        splitStr.unshift(addCharacter);
      }
    }
    if (anchor) {
      // Anchor style return
      return `${anchor}${splitStr.join("")}${anchor}`;
    }
    // Regular return
    return splitStr.join("");
  };

  /**
   * Capitalize the first letter of a string
   * @param {string} str String to capitalize
   * @returns {string} Capitalized string
   */
  this.capitalize = (str) => {
    this.typeCheck(`capitalize expects str value to be`, "string", str);
    let splitStr = str.split("");
    splitStr[0] = splitStr[0].toUpperCase();
    return splitStr.join("");
  };

  /**
   * Split and rejoin a string
   * @param {string} str String to split and rejoin
   * @param {RegExp} removeRegex Regular expression to remove from string
   * @param {string} splitStr String where the result will be split
   * @param {string} joinStr String to rejoin when complete
   * @param {?string} resplit Optional character to split string into array
   * @returns {string} Rejoined string
   */
  this.splitAndRejoin = (str, removeRegex, splitStr, joinStr, resplit) => {
    let replacedString = str
      .replace(removeRegex, "")
      .split(splitStr)
      .join(joinStr);
    return resplit ? replacedString.split(resplit) : replacedString;
  };

  /**
   * What if HCL distinct but in node
   * @param {Array<string>} arr Strings to check
   * @returns {Array<string>} array with only distinct string elements
   */
  this.distinct = (arr) => {
    this.typeCheck("distinct expects type", "Array", arr);
    this.arrTypeCheck(
      "distinct expects type of all elements to be",
      "string",
      arr
    );
    let distinctArr = [];
    arr.forEach((item) => {
      if (!this.contains(distinctArr, item)) {
        distinctArr.push(item);
      }
    });
    return distinctArr;
  };

  /**
   * Check if all elements in an array are distinct
   * @param {Array<string>} arr Strings to check
   * @returns {boolean} true if all distinct, false if not
   */
  this.allDistinct = (arr) => {
    return arr.length === this.distinct(arr).length
  }

  /**
   * Test for invalid or duplicate required flags
   * @param {Object} aliases key map of key with allowed synonyms
   * @param  {...any} commandArgs List of arguments
   */
  this.flagTest = (command, aliases, ...commandArgs) => {
    let flagMap = {};
    commandArgs.forEach((flag) => {
      if (flag.indexOf("-") === 0) {
        if (!this.containsKeys(aliases, flag)) {
          throw `Invalid flag ${flag} for command ${command}`;
        }
        if (!this.containsKeys(flagMap, flag)) {
          flagMap[flag] = flag;
          flagMap[aliases[flag]] = flag;
        } else {
          throw `Invalid flag ${flag} for command ${command}`;
        }
      }
    });
    let requiredKeys = [];
    this.eachKey(aliases, (key) => {
      if (key.indexOf("?") !== 0) requiredKeys.push(key);
    });
    if (requiredKeys.length !== this.keys(flagMap).length) {
      let errString = `Missing flags from ${command}`;
      this.eachKey(aliases, (alias) => {
        if (alias.indexOf("--") !== -1) {
          errString += ` ${alias}`;
        }
      });
      throw errString;
    }
  };
  /**
   * Get actions from a verb object
   * @param {Object} action action
   * @param {Array} action.requiredFlags Flags required by the action
   * @param {Array} action.optionalFlags Optional flags
   * @param {Object} tags tags object
   * @returns {Object} Aliases for the verb
   */
  this.getVerbActions = (action, tags) => {
    let flags = action.requiredFlags;
    let requiredFlags = {};
    this.eachKey(tags, (tag) => {
      if (this.contains(flags, tag)) {
        requiredFlags[tags[tag][0]] = tags[tag][1];
        requiredFlags[tags[tag][1]] = tags[tag][0];
      }
    });
    if (this.containsKeys(action, "optionalFlags")) {
      action.optionalFlags.forEach((optionalFlag) => {
        let firstTagValue = `?${optionalFlag?.allowMultiple ? "*" : ""}${
          tags[optionalFlag.name][0]
        }`;
        let secondTagValue = `?${optionalFlag?.allowMultiple ? "*" : ""}${
          tags[optionalFlag.name][1]
        }`;
        requiredFlags[firstTagValue] = secondTagValue;
        requiredFlags[secondTagValue] = firstTagValue;
      });
    }
    return requiredFlags;
  };

  /**
   * Replace optional flags from command args to denote multiple and optional flags
   * @param {Object} action action
   * @param {Array} action.requiredFlags Flags required by the action
   * @param {?Array} action.optionalFlags Optional flags
   * @param {Object} tags tags object
   * @param  {...any} commandArgs List of arguments
   * @returns {Array<string} Modified list of commang args
   */
  this.replaceOptionalFlags = (action, tags, ...commandArgs) => {
    let flagList = commandArgs; // Command args as array
    let optionalArguments = []; // Optional args
    let multiArguments = []; // Multiple arguments
    let replacedFlags = []; // list of flags to return replaced
    // If contains optional flags
    if (this.containsKeys(action, "optionalFlags")) {
      // For each optional flag
      action.optionalFlags.forEach((flag) => {
        // Add to optional list
        optionalArguments = optionalArguments.concat(tags[flag.name]);
        if (flag?.allowMultiple) {
          // If multiple arguments, add to multi
          multiArguments = multiArguments.concat(tags[flag.name]);
        }
      });
      // For each argument
      flagList.forEach((flag) => {
        // if it is optional
        if (this.contains(optionalArguments, flag)) {
          // Replace first - with ?*- if multiple and ?- if not
          replacedFlags.push(
            flag.replace(
              /-/i,
              `?${this.contains(multiArguments, flag) ? "*" : ""}-`
            )
          );
        } else {
          replacedFlags.push(flag);
        }
      });
      return replacedFlags;
    } else {
      return commandArgs;
    }
  };

  /**
   * Create key value pairs from list of command arguments
   * @param {string} command name of command
   * @param {Array} action.requiredFlags Flags required by the action
   * @param {?Array} action.optionalFlags Optional flags
   * @param {Object} tags key value pair of tags
   * @param  {...any} commandArgs command line arguments
   * @returns {Object} object containing key value pairs of params from tags
   */
  this.flagValues = (command, action, tags, ...commandArgs) => {
    // Get aliases
    let aliases = this.getVerbActions(action, tags);

    // Get list of flags
    let flagList = this.replaceOptionalFlags(action, tags, ...commandArgs);
    // Test for incorrect data
    this.flagTest(command, aliases, ...flagList);
    // Object to return
    let flagData = {};
    // create an object where each tag is converted to tag name for data
    let tagToName = {};
    this.eachKey(tags, (key) => {
      tags[key].forEach((alias) => (tagToName[alias] = key));
    });
    //create an array to check if flag names do match if they have no matching value
    let noMatchingValueFlagNames = [];
    action.optionalFlags.forEach((flag) => {
      if (flag?.noMatchingValue) {
        noMatchingValueFlagNames.push(tags[flag.name].join("|"));
      }
    });
    //create a regular expression for the no matching flag names
    let noMatchingValueRegex = new RegExp(
      `\\?(${noMatchingValueFlagNames.join("|")})`
    );

    // While flags still exist in list
    while (flagList.length > 0) {
      let flag = flagList.shift(); // Flag
      let flagName = tagToName[flag.replace(/(\?|\*)/g, "")];
      //if not a * and does not require a matching value we set flagData at the flagName to true
      if (flag.indexOf("*") === -1 && flag.match(noMatchingValueRegex)) {
        flagData[flagName] = true;
      } else {
        let flagValue = flagList.shift(); // Flag Value
        // Replace ? and * for optional flags
        if (flag.indexOf("*") === -1) {
          // if not multiple, set to flag value
          flagData[flagName] = flagValue;
        } else {
          if (this.containsKeys(flagData, flagName)) {
            // Add to existing array
            flagData[flagName].push(flagValue);
          } else {
            // Create new array
            flagData[flagName] = [flagValue];
          }
        }
      }
    }
    return flagData;
  };
};

module.exports = new utils();
