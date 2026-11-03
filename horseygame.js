// This code implements the `-sMODULARIZE` settings by taking the generated
// JS program code (INNER_JS_CODE) and wrapping it in a factory function.

// Single threaded MINIMAL_RUNTIME programs do not need access to
// document.currentScript, so a simple export declaration is enough.
var Horseygame = (() => {
  // When MODULARIZE this JS may be executed later,
  // after document.currentScript is gone, so we save it.
  // In EXPORT_ES6 mode we can just use 'import.meta.url'.
  var _scriptName = globalThis.document?.currentScript?.src;
  return async function(moduleArg = {}) {
    var Module = moduleArg;
// include: shell.js
// include: minimum_runtime_check.js
// end include: minimum_runtime_check.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).
var ENVIRONMENT_IS_WEB = true;

var ENVIRONMENT_IS_WORKER = false;

var ENVIRONMENT_IS_NODE = false;

var ENVIRONMENT_IS_SHELL = false;

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
var programArgs = [];

var thisProgram = "./this.program";

var quit_ = (status, toThrow) => {
  throw toThrow;
};

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = "";

function locateFile(path) {
  if (Module["locateFile"]) {
    return Module["locateFile"](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  try {
    scriptDirectory = new URL(".", _scriptName).href;
  } catch {}
  {
    // include: web_or_worker_shell_read.js
    readAsync = async url => {
      var response = await fetch(url, {
        credentials: "same-origin"
      });
      if (response.ok) {
        return response.arrayBuffer();
      }
      throw new Error(response.status + " : " + response.url);
    };
  }
} else {}

var out = console.log.bind(console);

var err = console.error.bind(console);

// end include: shell.js
// include: preamble.js
// === Preamble library stuff ===
// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html
var wasmBinary;

// Wasm globals
//========================================
// Runtime essentials
//========================================
// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */ function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implementation here for now.
    abort(text);
  }
}

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */ var isFileURI = filename => filename.startsWith("file://");

// include: runtime_common.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
// include: runtime_debug.js
// end include: runtime_debug.js
// Memory management
var runtimeInitialized = false;

// When ALLOW_MEMORY_GROWTH is enabled, the conversion from Wasm
// memory to ArrayBuffer requires some additional logic.
function getMemoryBuffer() {
  return wasmMemory.buffer;
}

function updateMemoryViews() {
  // If we already have a heap that is resizeable/growable buffer we don't
  // need to do anything in updateMemoryViews.
  if (HEAP8?.buffer?.resizable) return;
  var b = getMemoryBuffer();
  HEAP8 = new Int8Array(b);
  HEAP16 = new Int16Array(b);
  Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
  HEAPU16 = new Uint16Array(b);
  Module["HEAP32"] = HEAP32 = new Int32Array(b);
  HEAPU32 = new Uint32Array(b);
  Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
  Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
  HEAP64 = new BigInt64Array(b);
  HEAPU64 = new BigUint64Array(b);
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// end include: runtime_common.js
function preRun() {
  var preRun = Module["preRun"];
  if (preRun) {
    if (typeof preRun == "function") preRun = [ preRun ];
    onPreRuns.push(...preRun);
  }
  // Grow the wasm heap BEFORE the guest reserves its own memory pool, so the pool
  // is sized off a larger heap (?mem=<MB>, default 3072; the wasm allows up to 4 GB).
  try {
    var memMB = +(new URLSearchParams(location.search).get("mem")) || 3072;
    var want = memMB * 1048576;
    if (wasmMemory && wasmMemory.buffer.byteLength < want) growMemory(want);
  } catch (e) {
    console.warn("[web] pre-run heap grow failed", e);
  }
  // Begin ATPRERUNS hooks
  callRuntimeCallbacks(onPreRuns);
}

function initRuntime() {
  runtimeInitialized = true;
  // Begin ATINITS hooks
  if (!Module["noFSInit"] && !FS.initialized) FS.init();
  TTY.init();
  // End ATINITS hooks
  wasmExports["__wasm_call_ctors"]();
  // Begin ATPOSTCTORS hooks
  FS.ignorePermissions = false;
}

function postRun() {
  var postRun = Module["postRun"];
  if (postRun) {
    if (typeof postRun == "function") postRun = [ postRun ];
    onPostRuns.push(...postRun);
  }
  // Begin ATPOSTRUNS hooks
  callRuntimeCallbacks(onPostRuns);
}

/**
 * @param {string|number=} what
 */ function abort(what) {
  Module["onAbort"]?.(what);
  what = `Aborted(${what})`;
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);
  ABORT = true;
  what += ". Build with -sASSERTIONS for more info.";
  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.
  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  // See above, in the meantime, we resort to wasm code for trapping.
  // In case abort() is called before the module is initialized, wasmExports
  // and its exported '__trap' function is not available, in which case we throw
  // a RuntimeError.
  // We trap instead of throwing RuntimeError to prevent infinite-looping in
  // Wasm EH code (because RuntimeError is considered as a foreign exception and
  // caught by 'catch_all'), but in case throwing RuntimeError is fine because
  // the module has not even been instantiated, even less running.
  if (runtimeInitialized) {
    ___trap();
  }
  /** @suppress {checkTypes} */ var e = new WebAssembly.RuntimeError(what);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

var wasmBinaryFile;

function findWasmBinary() {
  return locateFile("horseygame.wasm");
}

function getBinarySync(file) {
  if (readBinary) {
    return readBinary(file);
  }
  // Throwing a plain string here, even though it not normally advisable since
  // this gets turning into an `abort` in instantiateArrayBuffer.
  throw "both async and sync fetching of the wasm failed";
}

async function getWasmBinary(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary) {
    // Fetch the binary using readAsync
    try {
      var response = await readAsync(binaryFile);
      return new Uint8Array(response);
    } catch {}
  }
  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

async function instantiateArrayBuffer(binaryFile, imports) {
  try {
    var binary = await getWasmBinary(binaryFile);
    var instance = await WebAssembly.instantiate(binary, imports);
    return instance;
  } catch (reason) {
    err(`failed to asynchronously prepare wasm: ${reason}`);
    abort(reason);
  }
}

async function instantiateAsync(binary, binaryFile, imports) {
  if (!binary) {
    try {
      var response = fetch(binaryFile, {
        credentials: "same-origin"
      });
      var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
      return instantiationResult;
    } catch (reason) {
      // We expect the most common failure cause to be a bad MIME type for the binary,
      // in which case falling back to ArrayBuffer instantiation should work.
      err(`wasm streaming compile failed: ${reason}`);
      err("falling back to ArrayBuffer instantiation");
    }
  }
  return instantiateArrayBuffer(binaryFile, imports);
}

function getWasmImports() {
  // instrumenting imports is used in asyncify in two ways: to add assertions
  // that check for proper import use, and for JSPI we use them to set up
  // the Promise API on the import side.
  Asyncify.instrumentWasmImports(wasmImports);
  // prepare imports
  var imports = {
    "env": wasmImports,
    "wasi_snapshot_preview1": wasmImports
  };
  return imports;
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
async function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  function receiveInstance(instance) {
    wasmExports = instance.exports;
    wasmExports = Asyncify.instrumentWasmExports(wasmExports);
    wasmExports = applySignatureConversions(wasmExports);
    assignWasmExports(wasmExports);
    updateMemoryViews();
    return wasmExports;
  }
  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    return receiveInstance(result["instance"]);
  }
  var info = getWasmImports();
  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  var instantiateWasm = Module["instantiateWasm"];
  if (instantiateWasm) {
    return new Promise(resolve => {
      instantiateWasm(info, inst => resolve(receiveInstance(inst)));
    });
  }
  wasmBinaryFile ??= findWasmBinary();
  var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
  var exports = receiveInstantiationResult(result);
  return exports;
}

// end include: preamble.js
// Begin JS library code
class ExitStatus {
  name="ExitStatus";
  constructor(status) {
    this.message = `Program terminated with exit(${status})`;
    this.status = status;
  }
}

/** @type {!Int16Array} */ var HEAP16;

/** @type {!Int32Array} */ var HEAP32;

/** not-@type {!BigInt64Array} */ var HEAP64;

/** @type {!Int8Array} */ var HEAP8;

/** @type {!Float32Array} */ var HEAPF32;

/** @type {!Float64Array} */ var HEAPF64;

/** @type {!Uint16Array} */ var HEAPU16;

/** @type {!Uint32Array} */ var HEAPU32;

/** not-@type {!BigUint64Array} */ var HEAPU64;

/** @type {!Uint8Array} */ var HEAPU8;

var callRuntimeCallbacks = callbacks => {
  while (callbacks.length > 0) {
    // Pass the module as the first argument.
    callbacks.shift()(Module);
  }
};

var onPostRuns = [];

var addOnPostRun = cb => onPostRuns.push(cb);

var onPreRuns = [];

var addOnPreRun = cb => onPreRuns.push(cb);

/**
   * @param {number} ptr
   * @param {string} type
   */ function getValue(ptr, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    return HEAP8[ptr >>> 0];

   case "i8":
    return HEAP8[ptr >>> 0];

   case "i16":
    return HEAP16[((ptr) >>> 1) >>> 0];

   case "i32":
    return HEAP32[((ptr) >>> 2) >>> 0];

   case "i64":
    return HEAP64[((ptr) >>> 3) >>> 0];

   case "float":
    return HEAPF32[((ptr) >>> 2) >>> 0];

   case "double":
    return HEAPF64[((ptr) >>> 3) >>> 0];

   case "*":
    return HEAPU32[((ptr) >>> 2) >>> 0];

   default:
    abort(`invalid type for getValue: ${type}`);
  }
}

var noExitRuntime = true;

/**
   * @param {number} ptr
   * @param {number} value
   * @param {string} type
   */ function setValue(ptr, value, type = "i8") {
  if (type.endsWith("*")) type = "*";
  switch (type) {
   case "i1":
    HEAP8[ptr >>> 0] = value;
    break;

   case "i8":
    HEAP8[ptr >>> 0] = value;
    break;

   case "i16":
    HEAP16[((ptr) >>> 1) >>> 0] = value;
    break;

   case "i32":
    HEAP32[((ptr) >>> 2) >>> 0] = value;
    break;

   case "i64":
    HEAP64[((ptr) >>> 3) >>> 0] = BigInt(value);
    break;

   case "float":
    HEAPF32[((ptr) >>> 2) >>> 0] = value;
    break;

   case "double":
    HEAPF64[((ptr) >>> 3) >>> 0] = value;
    break;

   case "*":
    HEAPU32[((ptr) >>> 2) >>> 0] = value;
    break;

   default:
    abort(`invalid type for setValue: ${type}`);
  }
}

var syscallGetVarargI = () => {
  // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
  var ret = HEAP32[((+SYSCALLS.varargs) >>> 2) >>> 0];
  SYSCALLS.varargs += 4;
  return ret;
};

var syscallGetVarargP = syscallGetVarargI;

var PATH = {
  isAbs: path => path.charAt(0) === "/",
  splitPath: filename => {
    var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
    return splitPathRe.exec(filename).slice(1);
  },
  normalizeArray: (parts, allowAboveRoot) => {
    // if the path tries to go above the root, `up` ends up > 0
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var last = parts[i];
      if (last === ".") {
        parts.splice(i, 1);
      } else if (last === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }
    // if the path is allowed to go above the root, restore leading ..s
    if (allowAboveRoot) {
      for (;up; up--) {
        parts.unshift("..");
      }
    }
    return parts;
  },
  normalize: path => {
    var isAbsolute = PATH.isAbs(path), trailingSlash = path.slice(-1) === "/";
    // Normalize the path
    path = PATH.normalizeArray(path.split("/").filter(p => !!p), !isAbsolute).join("/");
    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }
    return (isAbsolute ? "/" : "") + path;
  },
  dirname: path => {
    var result = PATH.splitPath(path), root = result[0], dir = result[1];
    if (!root && !dir) {
      // No dirname whatsoever
      return ".";
    }
    if (dir) {
      // It has a dirname, strip trailing slash
      dir = dir.slice(0, -1);
    }
    return root + dir;
  },
  basename: path => path && path.match(/([^\/]+|\/)\/*$/)[1],
  join: (...paths) => PATH.normalize(paths.join("/")),
  join2: (l, r) => PATH.normalize(l + "/" + r)
};

var initRandomFill = () => view => (crypto.getRandomValues(view), 0);

var randomFill = view => (randomFill = initRandomFill())(view);

var PATH_FS = {
  resolve: (...args) => {
    var resolvedPath = "", resolvedAbsolute = false;
    for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path = (i >= 0) ? args[i] : FS.cwd();
      // Skip empty and invalid entries
      if (typeof path != "string") {
        throw new TypeError("Arguments to path.resolve must be strings");
      } else if (!path) {
        return "";
      }
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = PATH.isAbs(path);
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(p => !!p), !resolvedAbsolute).join("/");
    return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
  },
  relative: (from, to) => {
    from = PATH_FS.resolve(from).slice(1);
    to = PATH_FS.resolve(to).slice(1);
    function trim(arr) {
      var start = 0;
      for (;start < arr.length; start++) {
        if (arr[start] !== "") break;
      }
      var end = arr.length - 1;
      for (;end >= 0; end--) {
        if (arr[end] !== "") break;
      }
      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }
    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));
    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }
    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }
    outputParts = outputParts.concat(toParts.slice(samePartsLength));
    return outputParts.join("/");
  }
};

var UTF8Decoder = globalThis.TextDecoder && new TextDecoder;

/**
   * heapOrArray is either a regular array, or a JavaScript typed array view.
   * @param {number} idx
   * @param {number=} maxBytesToRead
   * @param {boolean=} ignoreNul
   * @return {number}
   */ var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => {
  var maxIdx = idx + maxBytesToRead;
  if (ignoreNul) return maxIdx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on
  // null terminator by itself.
  // As a tiny code save trick, compare idx against maxIdx using a negation,
  // so that maxBytesToRead=undefined/NaN means Infinity.
  while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
  return idx;
};

/**
   * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
   * array that contains uint8 values, returns a copy of that string as a
   * Javascript String object.
   * heapOrArray is either a regular array, or a JavaScript typed array view.
   * @param {number=} idx
   * @param {number=} maxBytesToRead
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */ var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => {
  idx >>>= 0;
  var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
  // When using conditional TextDecoder, skip it for short strings as the overhead of the native call is not worth it.
  if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
  }
  var str = "";
  while (idx < endPtr) {
    // For UTF8 byte structure, see:
    // http://en.wikipedia.org/wiki/UTF-8#Description
    // https://www.ietf.org/rfc/rfc2279.txt
    // https://tools.ietf.org/html/rfc3629
    var u0 = heapOrArray[idx++];
    if (!(u0 & 128)) {
      str += String.fromCharCode(u0);
      continue;
    }
    var u1 = heapOrArray[idx++] & 63;
    if ((u0 & 224) == 192) {
      str += String.fromCharCode(((u0 & 31) << 6) | u1);
      continue;
    }
    var u2 = heapOrArray[idx++] & 63;
    if ((u0 & 240) == 224) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
    }
    if (u0 < 65536) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 65536;
      str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
    }
  }
  return str;
};

var FS_stdin_getChar_buffer = [];

var lengthBytesUTF8 = str => {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
    // unit, not a Unicode code point of the character! So decode
    // UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var c = str.charCodeAt(i);
    // possibly a lead surrogate
    if (c <= 127) {
      len++;
    } else if (c <= 2047) {
      len += 2;
    } else if (c >= 55296 && c <= 57343) {
      len += 4;
      ++i;
    } else {
      len += 3;
    }
  }
  return len;
};

var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
  outIdx >>>= 0;
  // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
  // undefined and false each don't write out any bytes.
  if (!(maxBytesToWrite > 0)) return 0;
  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1;
  // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
    // and https://www.ietf.org/rfc/rfc2279.txt
    // and https://tools.ietf.org/html/rfc3629
    var u = str.codePointAt(i);
    if (u <= 127) {
      if (outIdx >= endIdx) break;
      heap[outIdx++ >>> 0] = u;
    } else if (u <= 2047) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++ >>> 0] = 192 | (u >> 6);
      heap[outIdx++ >>> 0] = 128 | (u & 63);
    } else if (u <= 65535) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++ >>> 0] = 224 | (u >> 12);
      heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
      heap[outIdx++ >>> 0] = 128 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++ >>> 0] = 240 | (u >> 18);
      heap[outIdx++ >>> 0] = 128 | ((u >> 12) & 63);
      heap[outIdx++ >>> 0] = 128 | ((u >> 6) & 63);
      heap[outIdx++ >>> 0] = 128 | (u & 63);
      // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
      // We need to manually skip over the second code unit for correct iteration.
      i++;
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx >>> 0] = 0;
  return outIdx - startIdx;
};

/** @type {function(string, boolean=, number=)} */ var intArrayFromString = (stringy, dontAddNull, length) => {
  var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
};

var FS_stdin_getChar = () => {
  if (!FS_stdin_getChar_buffer.length) {
    var result = null;
    if (globalThis.window?.prompt) {
      // Browser.
      result = window.prompt("Input: ");
      // returns null on cancel
      if (result !== null) {
        result += "\n";
      }
    } else {}
    if (!result) {
      return null;
    }
    FS_stdin_getChar_buffer = intArrayFromString(result, true);
  }
  return FS_stdin_getChar_buffer.shift();
};

var TTY = {
  ttys: [],
  init() {},
  shutdown() {},
  register(dev, ops) {
    TTY.ttys[dev] = {
      input: [],
      output: [],
      ops
    };
    FS.registerDevice(dev, TTY.stream_ops);
  },
  stream_ops: {
    open(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    },
    close(stream) {
      // flush any pending line data
      stream.tty.ops.fsync(stream.tty);
    },
    fsync(stream) {
      stream.tty.ops.fsync(stream.tty);
    },
    read(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0; i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined) break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.atime = Date.now();
      }
      return bytesRead;
    },
    write(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0; i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.mtime = stream.node.ctime = Date.now();
      }
      return i;
    }
  },
  default_tty_ops: {
    get_char(tty) {
      return FS_stdin_getChar();
    },
    put_char(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    fsync(tty) {
      if (tty.output?.length > 0) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    },
    ioctl_tcgets(tty) {
      // typical setting
      return {
        c_iflag: 25856,
        c_oflag: 5,
        c_cflag: 191,
        c_lflag: 35387,
        c_cc: [ 3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
      };
    },
    ioctl_tcsets(tty, optional_actions, data) {
      // currently just ignore
      return 0;
    },
    ioctl_tiocgwinsz(tty) {
      return [ 24, 80 ];
    }
  },
  default_tty1_ops: {
    put_char(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0) tty.output.push(val);
      }
    },
    fsync(tty) {
      if (tty.output?.length > 0) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    }
  }
};

var mmapAlloc = size => {
  abort();
};

var MEMFS = {
  ops_table: null,
  mount(mount) {
    return MEMFS.createNode(null, "/", 16895, 0);
  },
  createNode(parent, name, mode, dev) {
    if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
      // not supported
      throw new FS.ErrnoError(63);
    }
    MEMFS.ops_table ||= {
      dir: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr,
          lookup: MEMFS.node_ops.lookup,
          mknod: MEMFS.node_ops.mknod,
          rename: MEMFS.node_ops.rename,
          unlink: MEMFS.node_ops.unlink,
          rmdir: MEMFS.node_ops.rmdir,
          readdir: MEMFS.node_ops.readdir,
          symlink: MEMFS.node_ops.symlink
        },
        stream: {
          llseek: MEMFS.stream_ops.llseek
        }
      },
      file: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr
        },
        stream: {
          llseek: MEMFS.stream_ops.llseek,
          read: MEMFS.stream_ops.read,
          write: MEMFS.stream_ops.write,
          mmap: MEMFS.stream_ops.mmap,
          msync: MEMFS.stream_ops.msync
        }
      },
      link: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr,
          readlink: MEMFS.node_ops.readlink
        },
        stream: {}
      },
      chrdev: {
        node: {
          getattr: MEMFS.node_ops.getattr,
          setattr: MEMFS.node_ops.setattr
        },
        stream: FS.chrdev_stream_ops
      }
    };
    var node = FS.createNode(parent, name, mode, dev);
    if (FS.isDir(node.mode)) {
      node.node_ops = MEMFS.ops_table.dir.node;
      node.stream_ops = MEMFS.ops_table.dir.stream;
      node.contents = {};
    } else if (FS.isFile(node.mode)) {
      node.node_ops = MEMFS.ops_table.file.node;
      node.stream_ops = MEMFS.ops_table.file.stream;
      // The actual number of bytes used in the typed array, as opposed to
      // contents.length which gives the whole capacity.
      node.usedBytes = 0;
      // The byte data of the file is stored in a typed array.
      // Note: typed arrays are not resizable like normal JS arrays are, so
      // there is a small penalty involved for appending file writes that
      // continuously grow a file similar to std::vector capacity vs used.
      node.contents = MEMFS.emptyFileContents ??= new Uint8Array(0);
    } else if (FS.isLink(node.mode)) {
      node.node_ops = MEMFS.ops_table.link.node;
      node.stream_ops = MEMFS.ops_table.link.stream;
    } else if (FS.isChrdev(node.mode)) {
      node.node_ops = MEMFS.ops_table.chrdev.node;
      node.stream_ops = MEMFS.ops_table.chrdev.stream;
    }
    node.atime = node.mtime = node.ctime = Date.now();
    // add the new node to the parent
    if (parent) {
      parent.contents[name] = node;
      parent.atime = parent.mtime = parent.ctime = node.atime;
    }
    return node;
  },
  getFileDataAsTypedArray(node) {
    return node.contents.subarray(0, node.usedBytes);
  },
  expandFileStorage(node, newCapacity) {
    var prevCapacity = node.contents.length;
    if (prevCapacity >= newCapacity) return;
    // No need to expand, the storage was already large enough.
    // Don't expand strictly to the given requested limit if it's only a very
    // small increase, but instead geometrically grow capacity.
    // For small filesizes (<1MB), perform size*2 geometric increase, but for
    // large sizes, do a much more conservative size*1.125 increase to avoid
    // overshooting the allocation cap by a very large margin.
    var CAPACITY_DOUBLING_MAX = 1024 * 1024;
    newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>> 0);
    if (prevCapacity) newCapacity = Math.max(newCapacity, 256);
    // At minimum allocate 256b for each file when expanding.
    var oldContents = MEMFS.getFileDataAsTypedArray(node);
    node.contents = new Uint8Array(newCapacity);
    // Allocate new storage.
    node.contents.set(oldContents);
  },
  resizeFileStorage(node, newSize) {
    if (node.usedBytes == newSize) return;
    var oldContents = node.contents;
    node.contents = new Uint8Array(newSize);
    // Allocate new storage.
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
    // Copy old data over to the new storage.
    node.usedBytes = newSize;
  },
  node_ops: {
    getattr(node) {
      var attr = {};
      // device numbers reuse inode numbers.
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.atime);
      attr.mtime = new Date(node.mtime);
      attr.ctime = new Date(node.ctime);
      // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
      //       but this is not required by the standard.
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    },
    setattr(node, attr) {
      for (const key of [ "mode", "atime", "mtime", "ctime" ]) {
        if (attr[key] != null) {
          node[key] = attr[key];
        }
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    },
    lookup(parent, name) {
      // This error may happen quite a bit. To avoid overhead we reuse it (and
      // suffer a lack of stack info).
      if (!MEMFS.doesNotExistError) {
        MEMFS.doesNotExistError = new FS.ErrnoError(44);
        /** @suppress {checkTypes} */ MEMFS.doesNotExistError.stack = "<generic error, no stack>";
      }
      throw MEMFS.doesNotExistError;
    },
    mknod(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    },
    rename(old_node, new_dir, new_name) {
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {}
      if (new_node) {
        if (FS.isDir(old_node.mode)) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
        FS.hashRemoveNode(new_node);
      }
      // do the internal rewiring
      delete old_node.parent.contents[old_node.name];
      new_dir.contents[new_name] = old_node;
      old_node.name = new_name;
      new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now();
    },
    unlink(parent, name) {
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    },
    rmdir(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    },
    readdir(node) {
      return [ ".", "..", ...Object.keys(node.contents) ];
    },
    symlink(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    },
    readlink(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    }
  },
  stream_ops: {
    read(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes) return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      buffer.set(contents.subarray(position, position + size), offset);
      return size;
    },
    write(stream, buffer, offset, length, position, canOwn) {
      // If the buffer is located in main memory (HEAP), and if
      // memory can grow, we can't hold on to references of the
      // memory buffer, as they may get invalidated. That means we
      // need to copy its contents.
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length) return 0;
      var node = stream.node;
      node.mtime = node.ctime = Date.now();
      if (canOwn) {
        node.contents = buffer.subarray(offset, offset + length);
        node.usedBytes = length;
      } else if (node.usedBytes === 0 && position === 0) {
        // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
        node.contents = buffer.slice(offset, offset + length);
        node.usedBytes = length;
      } else {
        MEMFS.expandFileStorage(node, position + length);
        // Use typed array write which is available.
        node.contents.set(buffer.subarray(offset, offset + length), position);
        node.usedBytes = Math.max(node.usedBytes, position + length);
      }
      return length;
    },
    llseek(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    },
    mmap(stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      // Only make a new copy when MAP_PRIVATE is specified.
      if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
        // We can't emulate MAP_SHARED when the file is not backed by the
        // buffer we're mapping to (e.g. the HEAP buffer).
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        if (contents) {
          // Try to avoid unnecessary slices.
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(contents, position, position + length);
            }
          }
          HEAP8.set(contents, ptr >>> 0);
        }
      }
      return {
        ptr,
        allocated
      };
    },
    msync(stream, buffer, offset, length, mmapFlags) {
      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      // should we check if bytesWritten and length are the same?
      return 0;
    }
  }
};

var FS_modeStringToFlags = str => {
  if (typeof str != "string") return str;
  var flagModes = {
    "r": 0,
    "r+": 2,
    "w": 512 | 64 | 1,
    "w+": 512 | 64 | 2,
    "a": 1024 | 64 | 1,
    "a+": 1024 | 64 | 2
  };
  var flags = flagModes[str];
  if (typeof flags == "undefined") {
    throw new Error(`Unknown file open mode: ${str}`);
  }
  return flags;
};

var FS_fileDataToTypedArray = data => {
  if (typeof data == "string") {
    data = intArrayFromString(data, true);
  }
  if (!data.subarray) {
    data = new Uint8Array(data);
  }
  return data;
};

var FS_getMode = (canRead, canWrite) => {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
};

var asyncLoad = async url => {
  var arrayBuffer = await readAsync(url);
  return new Uint8Array(arrayBuffer);
};

var FS_createDataFile = (...args) => FS.createDataFile(...args);

var getUniqueRunDependency = id => id;

var dependenciesPromise = null;

var resolveRunDependencies = async () => dependenciesPromise;

var runDependencies = 0;

var dependenciesPromiseResolve = null;

var removeRunDependency = id => {
  runDependencies--;
  Module["monitorRunDependencies"]?.(runDependencies);
  if (!runDependencies) {
    dependenciesPromiseResolve();
  }
};

var addRunDependency = id => {
  if (!runDependencies) {
    dependenciesPromise = new Promise(resolve => dependenciesPromiseResolve = resolve);
  }
  runDependencies++;
  Module["monitorRunDependencies"]?.(runDependencies);
};

var preloadPlugins = [];

var FS_handledByPreloadPlugin = async (byteArray, fullname) => {
  // Ensure plugins are ready.
  if (typeof Browser != "undefined") Browser.init();
  for (var plugin of preloadPlugins) {
    if (plugin["canHandle"](fullname)) {
      return plugin["handle"](byteArray, fullname);
    }
  }
  // If no plugin handled this file then return the original/unmodified
  // byteArray.
  return byteArray;
};

var FS_preloadFile = async (parent, name, url, canRead, canWrite, dontCreateFile, canOwn, preFinish) => {
  // TODO we should allow people to just pass in a complete filename instead
  // of parent and name being that we just join them anyways
  var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency(`cp ${fullname}`);
  // might have several active requests for the same fullname
  addRunDependency(dep);
  try {
    var byteArray = url;
    if (typeof url == "string") {
      byteArray = await asyncLoad(url);
    }
    byteArray = await FS_handledByPreloadPlugin(byteArray, fullname);
    preFinish?.();
    if (!dontCreateFile) {
      FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
    }
  } finally {
    removeRunDependency(dep);
  }
};

var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
  FS_preloadFile(parent, name, url, canRead, canWrite, dontCreateFile, canOwn, preFinish).then(onload).catch(onerror);
};

var FS = {
  root: null,
  mounts: [],
  devices: {},
  streams: [],
  nextInode: 1,
  nameTable: null,
  currentPath: "/",
  initialized: false,
  ignorePermissions: true,
  filesystems: null,
  syncFSRequests: 0,
  ErrnoError: class {
    name="ErrnoError";
    // We set the `name` property to be able to identify `FS.ErrnoError`
    // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
    // - when using PROXYFS, an error can come from an underlying FS
    // as different FS objects have their own FS.ErrnoError each,
    // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
    // we'll use the reliable test `err.name == "ErrnoError"` instead
    constructor(errno) {
      this.errno = errno;
    }
  },
  FSStream: class {
    shared={};
    get object() {
      return this.node;
    }
    set object(val) {
      this.node = val;
    }
    get isRead() {
      return (this.flags & 2097155) !== 1;
    }
    get isWrite() {
      return (this.flags & 2097155) !== 0;
    }
    get isAppend() {
      return (this.flags & 1024);
    }
    get flags() {
      return this.shared.flags;
    }
    set flags(val) {
      this.shared.flags = val;
    }
    get position() {
      return this.shared.position;
    }
    set position(val) {
      this.shared.position = val;
    }
  },
  FSNode: class {
    node_ops={};
    stream_ops={};
    readMode=292 | 73;
    writeMode=146;
    mounted=null;
    constructor(parent, name, mode, rdev) {
      if (!parent) {
        parent = this;
      }
      this.parent = parent;
      this.mount = parent.mount;
      this.id = FS.nextInode++;
      this.name = name;
      this.mode = mode;
      this.rdev = rdev;
      this.atime = this.mtime = this.ctime = Date.now();
    }
    get read() {
      return (this.mode & this.readMode) === this.readMode;
    }
    set read(val) {
      val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
    }
    get write() {
      return (this.mode & this.writeMode) === this.writeMode;
    }
    set write(val) {
      val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
    }
    get isFolder() {
      return FS.isDir(this.mode);
    }
    get isDevice() {
      return FS.isChrdev(this.mode);
    }
    // The per-inode readiness wait-queue. The node carries a Set of listener
    // entries {cb}; producers (SOCKFS, PIPEFS) call notifyListeners on a
    // readiness transition, and poll()/epoll consume it. It lives on the node
    // (not the fd) so dup'd fds share one queue. Only nodes that derive real
    // readiness (sockets, pipes, and an epoll's own node) ever use this -
    // always-ready types (regular files, ttys) never register or notify.
    addListener(cb, exclusive = false) {
      var entry = {
        cb,
        exclusive
      };
      var listeners = (this.listeners ??= new Set);
      listeners.add(entry);
      return {
        listeners,
        entry
      };
    }
    notifyListeners(flags) {
      // Iterates the set without copying, which is safe ONLY under a
      // load-bearing contract that every internal listener must honour:
      //   1. A listener must not run user code synchronously (a poll waiter only
      //      resolves a Promise; an epoll registration only re-lists +
      //      re-notifies; the epoll callback only schedules a tick). User code
      //      runs on a later tick, never inside this loop.
      //   2. A listener may delete entries only from ITS OWN waiter, never from
      //      a sibling node's set that may be mid-iteration. (Deleting an entry
      //      of the set being iterated here is fine - a Set tolerates removal of
      //      a not-yet-visited entry mid-iteration; mutating a *different* node's
      //      set is fine because that set is not being iterated.)
      // Violating either gives silently skipped wakeups that are near-impossible
      // to reproduce. Any new producer/listener must preserve it.
      if (!this.listeners) return;
      // Fire every non-exclusive listener. Among EPOLLEXCLUSIVE registrations
      // (one fd watched by several epolls) wake only one, rotating round-robin
      // per node, to avoid a thundering herd. (Only epoll registrations are ever
      // exclusive; poll waiters and a node's own consumers are not.)
      var excl;
      for (var entry of this.listeners) {
        if (entry.exclusive) (excl ||= []).push(entry); else entry.cb(flags);
      }
      if (excl) {
        var i = (this.exclTurn || 0) % excl.length;
        this.exclTurn = i + 1;
        excl[i].cb(flags);
      }
    }
  },
  lookupPath(path, opts = {}) {
    if (!path) {
      throw new FS.ErrnoError(44);
    }
    opts.follow_mount ??= true;
    if (!PATH.isAbs(path)) {
      path = FS.cwd() + "/" + path;
    }
    // limit max consecutive symlinks to SYMLOOP_MAX.
    linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
      // split the absolute path
      var parts = path.split("/").filter(p => !!p);
      // start at the root
      var current = FS.root;
      var current_path = "/";
      for (var i = 0; i < parts.length; i++) {
        var islast = (i === parts.length - 1);
        if (islast && opts.parent) {
          // stop resolving
          break;
        }
        if (parts[i] === ".") {
          continue;
        }
        if (parts[i] === "..") {
          current_path = PATH.dirname(current_path);
          if (FS.isRoot(current)) {
            path = current_path + "/" + parts.slice(i + 1).join("/");
            // We're making progress here, don't let many consecutive ..'s
            // lead to ELOOP
            nlinks--;
            continue linkloop;
          } else {
            current = current.parent;
          }
          continue;
        }
        current_path = PATH.join2(current_path, parts[i]);
        try {
          current = FS.lookupNode(current, parts[i]);
        } catch (e) {
          // if noent_okay is true, suppress a ENOENT in the last component
          // and return an object with an undefined node. This is needed for
          // resolving symlinks in the path when creating a file.
          if ((e?.errno === 44) && islast && opts.noent_okay) {
            return {
              path: current_path
            };
          }
          throw e;
        }
        // jump to the mount's root node if this is a mountpoint
        if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
          current = current.mounted.root;
        }
        // by default, lookupPath will not follow a symlink if it is the final path component.
        // setting opts.follow = true will override this behavior.
        if (FS.isLink(current.mode) && (!islast || opts.follow)) {
          if (!current.node_ops.readlink) {
            throw new FS.ErrnoError(52);
          }
          var link = current.node_ops.readlink(current);
          if (!PATH.isAbs(link)) {
            link = PATH.dirname(current_path) + "/" + link;
          }
          path = link + "/" + parts.slice(i + 1).join("/");
          continue linkloop;
        }
      }
      return {
        path: current_path,
        node: current
      };
    }
    throw new FS.ErrnoError(32);
  },
  getPath(node) {
    var path;
    while (true) {
      if (FS.isRoot(node)) {
        var mount = node.mount.mountpoint;
        if (!path) return mount;
        return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
      }
      path = path ? `${node.name}/${path}` : node.name;
      node = node.parent;
    }
  },
  hashName(parentid, name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
    }
    return ((parentid + hash) >>> 0) % FS.nameTable.length;
  },
  hashAddNode(node) {
    var hash = FS.hashName(node.parent.id, node.name);
    node.name_next = FS.nameTable[hash];
    FS.nameTable[hash] = node;
  },
  hashRemoveNode(node) {
    var hash = FS.hashName(node.parent.id, node.name);
    if (FS.nameTable[hash] === node) {
      FS.nameTable[hash] = node.name_next;
    } else {
      var current = FS.nameTable[hash];
      while (current) {
        if (current.name_next === node) {
          current.name_next = node.name_next;
          break;
        }
        current = current.name_next;
      }
    }
  },
  lookupNode(parent, name) {
    var errCode = FS.mayLookup(parent);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    var hash = FS.hashName(parent.id, name);
    for (var node = FS.nameTable[hash]; node; node = node.name_next) {
      var nodeName = node.name;
      if (node.parent.id === parent.id && nodeName === name) {
        return node;
      }
    }
    // if we failed to find it in the cache, call into the VFS
    return FS.lookup(parent, name);
  },
  createNode(parent, name, mode, rdev) {
    var node = new FS.FSNode(parent, name, mode, rdev);
    FS.hashAddNode(node);
    return node;
  },
  destroyNode(node) {
    FS.hashRemoveNode(node);
  },
  isRoot(node) {
    return node === node.parent;
  },
  isMountpoint(node) {
    return !!node.mounted;
  },
  isFile(mode) {
    return (mode & 61440) === 32768;
  },
  isDir(mode) {
    return (mode & 61440) === 16384;
  },
  isLink(mode) {
    return (mode & 61440) === 40960;
  },
  isChrdev(mode) {
    return (mode & 61440) === 8192;
  },
  isBlkdev(mode) {
    return (mode & 61440) === 24576;
  },
  isFIFO(mode) {
    return (mode & 61440) === 4096;
  },
  isSocket(mode) {
    return (mode & 49152) === 49152;
  },
  flagsToPermissionString(flag) {
    var perms = [ "r", "w", "rw" ][flag & 3];
    if ((flag & 512)) {
      perms += "w";
    }
    return perms;
  },
  nodePermissions(node, perms) {
    if (FS.ignorePermissions) {
      return 0;
    }
    // return 0 if any user, group or owner bits are set.
    if (perms.includes("r") && !(node.mode & 292)) {
      return 2;
    }
    if (perms.includes("w") && !(node.mode & 146)) {
      return 2;
    }
    if (perms.includes("x") && !(node.mode & 73)) {
      return 2;
    }
    return 0;
  },
  mayLookup(dir) {
    if (!FS.isDir(dir.mode)) return 54;
    var errCode = FS.nodePermissions(dir, "x");
    if (errCode) return errCode;
    if (!dir.node_ops.lookup) return 2;
    return 0;
  },
  mayCreate(dir, name) {
    if (!FS.isDir(dir.mode)) {
      return 54;
    }
    try {
      var node = FS.lookupNode(dir, name);
      return 20;
    } catch (e) {}
    return FS.nodePermissions(dir, "wx");
  },
  mayDelete(dir, name, isdir) {
    var node;
    try {
      node = FS.lookupNode(dir, name);
    } catch (e) {
      return e.errno;
    }
    var errCode = FS.nodePermissions(dir, "wx");
    if (errCode) {
      return errCode;
    }
    if (isdir) {
      if (!FS.isDir(node.mode)) {
        return 54;
      }
      if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
        return 10;
      }
    } else if (FS.isDir(node.mode)) {
      return 31;
    }
    return 0;
  },
  mayOpen(node, flags) {
    if (!node) {
      return 44;
    }
    if (FS.isLink(node.mode)) {
      return 32;
    }
    var mode = FS.flagsToPermissionString(flags);
    if (FS.isDir(node.mode)) {
      // opening for write
      // TODO: check for O_SEARCH? (== search for dir only)
      if (mode !== "r" || (flags & (512 | 64))) {
        return 31;
      }
    }
    return FS.nodePermissions(node, mode);
  },
  checkOpExists(op, err) {
    if (!op) {
      throw new FS.ErrnoError(err);
    }
    return op;
  },
  MAX_OPEN_FDS: 4096,
  nextfd() {
    for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
      if (!FS.streams[fd]) {
        return fd;
      }
    }
    throw new FS.ErrnoError(33);
  },
  getStreamChecked(fd) {
    var stream = FS.getStream(fd);
    if (!stream) {
      throw new FS.ErrnoError(8);
    }
    return stream;
  },
  getStream: fd => FS.streams[fd],
  createStream(stream, fd = -1) {
    // clone it, so we can return an instance of FSStream
    stream = Object.assign(new FS.FSStream, stream);
    if (fd == -1) {
      fd = FS.nextfd();
    }
    stream.fd = fd;
    FS.streams[fd] = stream;
    return stream;
  },
  closeStream(fd) {
    FS.streams[fd] = null;
  },
  dupStream(origStream, fd = -1) {
    var stream = FS.createStream(origStream, fd);
    stream.stream_ops?.dup?.(stream);
    return stream;
  },
  doSetAttr(stream, node, attr) {
    var setattr = stream?.stream_ops.setattr;
    var arg = setattr ? stream : node;
    setattr ??= node.node_ops.setattr;
    FS.checkOpExists(setattr, 63);
    try {
      setattr(arg, attr);
    } catch (e) {
      if (e instanceof RangeError) {
        throw new FS.ErrnoError(22);
      }
      throw e;
    }
  },
  chrdev_stream_ops: {
    open(stream) {
      var device = FS.getDevice(stream.node.rdev);
      // override node's stream ops with the device's
      stream.stream_ops = device.stream_ops;
      // forward the open call
      stream.stream_ops.open?.(stream);
    },
    llseek() {
      throw new FS.ErrnoError(70);
    }
  },
  major: dev => ((dev) >> 8),
  minor: dev => ((dev) & 255),
  makedev: (ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
    FS.devices[dev] = {
      stream_ops: ops
    };
  },
  getDevice: dev => FS.devices[dev],
  getMounts(mount) {
    var mounts = [];
    var check = [ mount ];
    while (check.length) {
      var m = check.pop();
      mounts.push(m);
      check.push(...m.mounts);
    }
    return mounts;
  },
  syncfs(populate, callback) {
    if (typeof populate == "function") {
      callback = populate;
      populate = false;
    }
    FS.syncFSRequests++;
    if (FS.syncFSRequests > 1) {
      err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
    }
    var mounts = FS.getMounts(FS.root.mount);
    var completed = 0;
    function doCallback(errCode) {
      FS.syncFSRequests--;
      return callback(errCode);
    }
    function done(errCode) {
      if (errCode) {
        if (!done.errored) {
          done.errored = true;
          return doCallback(errCode);
        }
        return;
      }
      if (++completed >= mounts.length) {
        doCallback(null);
      }
    }
    // sync all mounts
    for (var mount of mounts) {
      if (mount.type.syncfs) {
        mount.type.syncfs(mount, populate, done);
      } else {
        done(null);
      }
    }
  },
  mount(type, opts, mountpoint) {
    var root = mountpoint === "/";
    var pseudo = !mountpoint;
    var node;
    if (root && FS.root) {
      throw new FS.ErrnoError(10);
    } else if (!root && !pseudo) {
      var lookup = FS.lookupPath(mountpoint, {
        follow_mount: false
      });
      mountpoint = lookup.path;
      // use the absolute path
      node = lookup.node;
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      if (!FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
    }
    var mount = {
      type,
      opts,
      mountpoint,
      mounts: []
    };
    // create a root node for the fs
    var mountRoot = type.mount(mount);
    mountRoot.mount = mount;
    mount.root = mountRoot;
    if (root) {
      FS.root = mountRoot;
    } else if (node) {
      // set as a mountpoint
      node.mounted = mount;
      // add the new mount to the current mount's children
      if (node.mount) {
        node.mount.mounts.push(mount);
      }
    }
    return mountRoot;
  },
  unmount(mountpoint) {
    var lookup = FS.lookupPath(mountpoint, {
      follow_mount: false
    });
    if (!FS.isMountpoint(lookup.node)) {
      throw new FS.ErrnoError(28);
    }
    // destroy the nodes for this mount, and all its child mounts
    var node = lookup.node;
    var mount = node.mounted;
    var mounts = FS.getMounts(mount);
    for (var [hash, current] of Object.entries(FS.nameTable)) {
      while (current) {
        var next = current.name_next;
        if (mounts.includes(current.mount)) {
          FS.destroyNode(current);
        }
        current = next;
      }
    }
    // no longer a mountpoint
    node.mounted = null;
    // remove this mount from the child mounts
    var idx = node.mount.mounts.indexOf(mount);
    node.mount.mounts.splice(idx, 1);
  },
  lookup(parent, name) {
    return parent.node_ops.lookup(parent, name);
  },
  mknod(path, mode, dev) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    var name = PATH.basename(path);
    if (!name) {
      throw new FS.ErrnoError(28);
    }
    if (name === "." || name === "..") {
      throw new FS.ErrnoError(20);
    }
    var errCode = FS.mayCreate(parent, name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.mknod) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.mknod(parent, name, mode, dev);
  },
  statfs(path) {
    return FS.statfsNode(FS.lookupPath(path, {
      follow: true
    }).node);
  },
  statfsStream(stream) {
    // We keep a separate statfsStream function because noderawfs overrides
    // it. In noderawfs, stream.node is sometimes null. Instead, we need to
    // look at stream.path.
    return FS.statfsNode(stream.node);
  },
  statfsNode(node) {
    // NOTE: None of the defaults here are true. We're just returning safe and
    //       sane values. Currently nodefs and rawfs replace these defaults,
    //       other file systems leave them alone.
    var rtn = {
      bsize: 4096,
      frsize: 4096,
      blocks: 1e6,
      bfree: 5e5,
      bavail: 5e5,
      files: FS.nextInode,
      ffree: FS.nextInode - 1,
      fsid: 42,
      flags: 2,
      namelen: 255
    };
    if (node.node_ops.statfs) {
      Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
    }
    return rtn;
  },
  create(path, mode = 438) {
    mode &= 4095;
    mode |= 32768;
    return FS.mknod(path, mode, 0);
  },
  mkdir(path, mode = 511) {
    mode &= 511 | 512;
    mode |= 16384;
    return FS.mknod(path, mode, 0);
  },
  mkdirTree(path, mode) {
    var dirs = path.split("/");
    var d = "";
    for (var dir of dirs) {
      if (!dir) continue;
      if (d || PATH.isAbs(path)) d += "/";
      d += dir;
      try {
        FS.mkdir(d, mode);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
    }
  },
  mkdev(path, mode, dev) {
    if (typeof dev == "undefined") {
      dev = mode;
      mode = 438;
    }
    mode |= 8192;
    return FS.mknod(path, mode, dev);
  },
  symlink(oldpath, newpath) {
    if (!PATH_FS.resolve(oldpath)) {
      throw new FS.ErrnoError(44);
    }
    var lookup = FS.lookupPath(newpath, {
      parent: true
    });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.symlink) {
      throw new FS.ErrnoError(63);
    }
    return parent.node_ops.symlink(parent, newname, oldpath);
  },
  link(oldpath, newpath, flags) {
    var lookup = FS.lookupPath(newpath, {
      parent: true
    });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var newname = PATH.basename(newpath);
    var errCode = FS.mayCreate(parent, newname);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    // Hardlinks are only supported by filesystem backends that provide a
    // `link` node op (e.g. NODERAWFS backed by the host). NODEFS omits it:
    // a host hardlink cannot be confined to the mount root.
    if (!parent.node_ops.link) {
      throw new FS.ErrnoError(34);
    }
    return parent.node_ops.link(parent, newname, oldpath, flags);
  },
  rename(old_path, new_path) {
    var old_dirname = PATH.dirname(old_path);
    var new_dirname = PATH.dirname(new_path);
    var old_name = PATH.basename(old_path);
    var new_name = PATH.basename(new_path);
    // parents must exist
    var lookup, old_dir, new_dir;
    // let the errors from non existent directories percolate up
    lookup = FS.lookupPath(old_path, {
      parent: true
    });
    old_dir = lookup.node;
    lookup = FS.lookupPath(new_path, {
      parent: true
    });
    new_dir = lookup.node;
    if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
    // need to be part of the same mount
    if (old_dir.mount !== new_dir.mount) {
      throw new FS.ErrnoError(75);
    }
    // source must exist
    var old_node = FS.lookupNode(old_dir, old_name);
    // old path should not be an ancestor of the new path
    var relative = PATH_FS.relative(old_path, new_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(28);
    }
    // new path should not be an ancestor of the old path
    relative = PATH_FS.relative(new_path, old_dirname);
    if (relative.charAt(0) !== ".") {
      throw new FS.ErrnoError(55);
    }
    // see if the new path already exists
    var new_node;
    try {
      new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    // early out if nothing needs to change
    if (old_node === new_node) {
      return;
    }
    // we'll need to delete the old entry
    var isdir = FS.isDir(old_node.mode);
    var errCode = FS.mayDelete(old_dir, old_name, isdir);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    // need delete permissions if we'll be overwriting.
    // need create permissions if new doesn't already exist.
    errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!old_dir.node_ops.rename) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
      throw new FS.ErrnoError(10);
    }
    // if we are going to change the parent, check write permissions
    if (new_dir !== old_dir) {
      errCode = FS.nodePermissions(old_dir, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // remove the node from the lookup hash
    FS.hashRemoveNode(old_node);
    // do the underlying fs rename
    try {
      old_dir.node_ops.rename(old_node, new_dir, new_name);
      // update old node (we do this here to avoid each backend
      // needing to)
      old_node.parent = new_dir;
    } catch (e) {
      throw e;
    } finally {
      // add the node back to the hash (in case node_ops.rename
      // changed its name)
      FS.hashAddNode(old_node);
    }
  },
  rmdir(path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, true);
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.rmdir) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.rmdir(parent, name);
    FS.destroyNode(node);
  },
  readdir(path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    var node = lookup.node;
    var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
    return readdir(node);
  },
  unlink(path) {
    var lookup = FS.lookupPath(path, {
      parent: true
    });
    var parent = lookup.node;
    if (!parent) {
      throw new FS.ErrnoError(44);
    }
    var name = PATH.basename(path);
    var node = FS.lookupNode(parent, name);
    var errCode = FS.mayDelete(parent, name, false);
    if (errCode) {
      // According to POSIX, we should map EISDIR to EPERM, but
      // we instead do what Linux does (and we must, as we use
      // the musl linux libc).
      throw new FS.ErrnoError(errCode);
    }
    if (!parent.node_ops.unlink) {
      throw new FS.ErrnoError(63);
    }
    if (FS.isMountpoint(node)) {
      throw new FS.ErrnoError(10);
    }
    parent.node_ops.unlink(parent, name);
    FS.destroyNode(node);
  },
  readlink(path) {
    var lookup = FS.lookupPath(path);
    var link = lookup.node;
    if (!link) {
      throw new FS.ErrnoError(44);
    }
    if (!link.node_ops.readlink) {
      throw new FS.ErrnoError(28);
    }
    return link.node_ops.readlink(link);
  },
  stat(path, dontFollow) {
    var lookup = FS.lookupPath(path, {
      follow: !dontFollow
    });
    var node = lookup.node;
    var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
    return getattr(node);
  },
  fstat(fd) {
    var stream = FS.getStreamChecked(fd);
    var node = stream.node;
    var getattr = stream.stream_ops.getattr;
    var arg = getattr ? stream : node;
    getattr ??= node.node_ops.getattr;
    FS.checkOpExists(getattr, 63);
    return getattr(arg);
  },
  lstat(path) {
    return FS.stat(path, true);
  },
  doChmod(stream, node, mode, dontFollow) {
    FS.doSetAttr(stream, node, {
      mode: (mode & 4095) | (node.mode & ~4095),
      ctime: Date.now(),
      dontFollow
    });
  },
  chmod(path, mode, dontFollow) {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      });
      node = lookup.node;
    } else {
      node = path;
    }
    FS.doChmod(null, node, mode, dontFollow);
  },
  lchmod(path, mode) {
    FS.chmod(path, mode, true);
  },
  fchmod(fd, mode) {
    var stream = FS.getStreamChecked(fd);
    FS.doChmod(stream, stream.node, mode, false);
  },
  doChown(stream, node, dontFollow) {
    FS.doSetAttr(stream, node, {
      timestamp: Date.now(),
      dontFollow
    });
  },
  chown(path, uid, gid, dontFollow) {
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: !dontFollow
      });
      node = lookup.node;
    } else {
      node = path;
    }
    FS.doChown(null, node, dontFollow);
  },
  lchown(path, uid, gid) {
    FS.chown(path, uid, gid, true);
  },
  fchown(fd, uid, gid) {
    var stream = FS.getStreamChecked(fd);
    FS.doChown(stream, stream.node, false);
  },
  doTruncate(stream, node, len) {
    if (FS.isDir(node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!FS.isFile(node.mode)) {
      throw new FS.ErrnoError(28);
    }
    var errCode = FS.nodePermissions(node, "w");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.doSetAttr(stream, node, {
      size: len,
      timestamp: Date.now()
    });
  },
  truncate(path, len) {
    if (len < 0) {
      throw new FS.ErrnoError(28);
    }
    var node;
    if (typeof path == "string") {
      var lookup = FS.lookupPath(path, {
        follow: true
      });
      node = lookup.node;
    } else {
      node = path;
    }
    FS.doTruncate(null, node, len);
  },
  ftruncate(fd, len) {
    var stream = FS.getStreamChecked(fd);
    if (len < 0 || (stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(28);
    }
    FS.doTruncate(stream, stream.node, len);
  },
  utime(path, atime, mtime, dontFollow) {
    var lookup = FS.lookupPath(path, {
      follow: !dontFollow
    });
    FS.doSetAttr(null, lookup.node, {
      atime,
      mtime,
      dontFollow
    });
  },
  open(path, flags, mode = 438) {
    if (path === "") {
      throw new FS.ErrnoError(44);
    }
    flags = FS_modeStringToFlags(flags);
    if ((flags & 64)) {
      mode = (mode & 4095) | 32768;
    } else {
      mode = 0;
    }
    var node;
    var isDirPath;
    if (typeof path == "object") {
      node = path;
    } else {
      isDirPath = path.endsWith("/");
      // noent_okay makes it so that if the final component of the path
      // doesn't exist, lookupPath returns `node: undefined`. `path` will be
      // updated to point to the target of all symlinks.
      var lookup = FS.lookupPath(path, {
        follow: !(flags & 131072),
        noent_okay: true
      });
      node = lookup.node;
      path = lookup.path;
    }
    // perhaps we need to create the node
    var created = false;
    if ((flags & 64)) {
      if (node) {
        // if O_CREAT and O_EXCL are set, error out if the node already exists
        if ((flags & 128)) {
          throw new FS.ErrnoError(20);
        }
      } else if (isDirPath) {
        throw new FS.ErrnoError(31);
      } else {
        // node doesn't exist, try to create it
        // Ignore the permission bits here to ensure we can `open` this new
        // file below. We use chmod below to apply the permissions once the
        // file is open.
        node = FS.mknod(path, mode | 511, 0);
        created = true;
      }
    }
    if (!node) {
      throw new FS.ErrnoError(44);
    }
    // can't truncate a device
    if (FS.isChrdev(node.mode)) {
      flags &= ~512;
    }
    // if asked only for a directory, then this must be one
    if ((flags & 65536) && !FS.isDir(node.mode)) {
      throw new FS.ErrnoError(54);
    }
    // check permissions, if this is not a file we just created now (it is ok to
    // create and write to a file with read-only permissions; it is read-only
    // for later use)
    if (!created) {
      var errCode = FS.mayOpen(node, flags);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
    }
    // do truncation if necessary
    if ((flags & 512) && !created) {
      FS.truncate(node, 0);
    }
    // we've already handled these, don't pass down to the underlying vfs
    flags &= ~(128 | 512 | 131072);
    // register the stream with the filesystem
    var stream = FS.createStream({
      node,
      path: FS.getPath(node),
      // we want the absolute path to the node
      flags,
      seekable: true,
      position: 0,
      stream_ops: node.stream_ops,
      // used by the file family libc calls (fopen, fwrite, ferror, etc.)
      ungotten: [],
      error: false
    });
    // call the new stream's open function
    if (stream.stream_ops.open) {
      stream.stream_ops.open(stream);
    }
    if (created) {
      FS.chmod(node, mode & 511);
    }
    return stream;
  },
  close(stream) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (stream.getdents) stream.getdents = null;
    // free readdir state
    // The fd is going away: wake anything waiting on it (poll/epoll) with
    // POLLNVAL so a blocking wait unblocks and an epoll registration is evicted
    // on its next derive. Only sockets/pipes/epoll ever carry a wait-queue, so
    // for every other stream (incl. nodeless noderawfs stdio) this is a no-op.
    stream.node?.notifyListeners(32);
    try {
      if (stream.stream_ops.close) {
        stream.stream_ops.close(stream);
      }
    } catch (e) {
      throw e;
    } finally {
      FS.closeStream(stream.fd);
    }
    stream.fd = null;
  },
  isClosed(stream) {
    return stream.fd === null;
  },
  llseek(stream, offset, whence) {
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if (!stream.seekable || !stream.stream_ops.llseek) {
      throw new FS.ErrnoError(70);
    }
    if (whence != 0 && whence != 1 && whence != 2) {
      throw new FS.ErrnoError(28);
    }
    stream.position = stream.stream_ops.llseek(stream, offset, whence);
    stream.ungotten = [];
    return stream.position;
  },
  read(stream, buffer, offset, length, position) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.read) {
      throw new FS.ErrnoError(28);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
    if (!seeking) stream.position += bytesRead;
    return bytesRead;
  },
  write(stream, buffer, offset, length, position, canOwn) {
    if (length < 0 || position < 0) {
      throw new FS.ErrnoError(28);
    }
    if (FS.isClosed(stream)) {
      throw new FS.ErrnoError(8);
    }
    if ((stream.flags & 2097155) === 0) {
      throw new FS.ErrnoError(8);
    }
    if (FS.isDir(stream.node.mode)) {
      throw new FS.ErrnoError(31);
    }
    if (!stream.stream_ops.write) {
      throw new FS.ErrnoError(28);
    }
    if (stream.seekable && stream.flags & 1024) {
      // seek to the end before writing in append mode
      FS.llseek(stream, 0, 2);
    }
    var seeking = typeof position != "undefined";
    if (!seeking) {
      position = stream.position;
    } else if (!stream.seekable) {
      throw new FS.ErrnoError(70);
    }
    var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
    if (!seeking) stream.position += bytesWritten;
    return bytesWritten;
  },
  mmap(stream, length, position, prot, flags) {
    // User requests writing to file (prot & PROT_WRITE != 0).
    // Checking if we have permissions to write to the file unless
    // MAP_PRIVATE flag is set. According to POSIX spec it is possible
    // to write to file opened in read-only mode with MAP_PRIVATE flag,
    // as all modifications will be visible only in the memory of
    // the current process.
    if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
      throw new FS.ErrnoError(2);
    }
    if ((stream.flags & 2097155) === 1) {
      throw new FS.ErrnoError(2);
    }
    if (!stream.stream_ops.mmap) {
      throw new FS.ErrnoError(43);
    }
    if (!length) {
      throw new FS.ErrnoError(28);
    }
    return stream.stream_ops.mmap(stream, length, position, prot, flags);
  },
  msync(stream, buffer, offset, length, mmapFlags) {
    if (!stream.stream_ops.msync) {
      return 0;
    }
    return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
  },
  ioctl(stream, cmd, arg) {
    if (!stream.stream_ops.ioctl) {
      throw new FS.ErrnoError(59);
    }
    return stream.stream_ops.ioctl(stream, cmd, arg);
  },
  readFile(path, opts = {}) {
    opts.flags = opts.flags ?? 0;
    opts.encoding = opts.encoding ?? "binary";
    if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
      abort(`Invalid encoding type "${opts.encoding}"`);
    }
    var stream = FS.open(path, opts.flags);
    var stat = FS.stat(path);
    var length = stat.size;
    var buf = new Uint8Array(length);
    FS.read(stream, buf, 0, length, 0);
    if (opts.encoding === "utf8") {
      buf = UTF8ArrayToString(buf);
    }
    FS.close(stream);
    return buf;
  },
  writeFile(path, data, opts = {}) {
    opts.flags = opts.flags ?? 577;
    var stream = FS.open(path, opts.flags, opts.mode);
    data = FS_fileDataToTypedArray(data);
    FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
    FS.close(stream);
  },
  cwd: () => FS.currentPath,
  chdir(path) {
    var lookup = FS.lookupPath(path, {
      follow: true
    });
    if (lookup.node === null) {
      throw new FS.ErrnoError(44);
    }
    if (!FS.isDir(lookup.node.mode)) {
      throw new FS.ErrnoError(54);
    }
    var errCode = FS.nodePermissions(lookup.node, "x");
    if (errCode) {
      throw new FS.ErrnoError(errCode);
    }
    FS.currentPath = lookup.path;
  },
  createDefaultDirectories() {
    FS.mkdir("/tmp");
    FS.mkdir("/home");
    FS.mkdir("/home/web_user");
  },
  createDefaultDevices() {
    // create /dev
    FS.mkdir("/dev");
    // setup /dev/null
    FS.registerDevice(FS.makedev(1, 3), {
      read: () => 0,
      write: (stream, buffer, offset, length, pos) => length,
      llseek: () => 0
    });
    FS.mkdev("/dev/null", FS.makedev(1, 3));
    // setup /dev/tty and /dev/tty1
    // stderr needs to print output using err() rather than out()
    // so we register a second tty just for it.
    TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
    TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
    FS.mkdev("/dev/tty", FS.makedev(5, 0));
    FS.mkdev("/dev/tty1", FS.makedev(6, 0));
    // setup /dev/[u]random
    // use a buffer to avoid overhead of individual crypto calls per byte
    var randomBuffer = new Uint8Array(1024), randomLeft = 0;
    var randomByte = () => {
      if (randomLeft === 0) {
        randomFill(randomBuffer);
        randomLeft = randomBuffer.byteLength;
      }
      return randomBuffer[--randomLeft];
    };
    FS.createDevice("/dev", "random", randomByte);
    FS.createDevice("/dev", "urandom", randomByte);
    // we're not going to emulate the actual shm device,
    // just create the tmp dirs that reside in it commonly
    FS.mkdir("/dev/shm");
    FS.mkdir("/dev/shm/tmp");
  },
  createSpecialDirectories() {
    // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
    // name of the stream for fd 6 (see test_unistd_ttyname)
    FS.mkdir("/proc");
    var proc_self = FS.mkdir("/proc/self");
    FS.mkdir("/proc/self/fd");
    FS.mount({
      mount() {
        var node = FS.createNode(proc_self, "fd", 16895, 73);
        node.stream_ops = {
          llseek: MEMFS.stream_ops.llseek
        };
        node.node_ops = {
          lookup(parent, name) {
            var fd = +name;
            var stream = FS.getStreamChecked(fd);
            var ret = {
              parent: null,
              mount: {
                mountpoint: "fake"
              },
              node_ops: {
                readlink: () => stream.path
              },
              id: fd + 1
            };
            ret.parent = ret;
            // make it look like a simple root node
            return ret;
          },
          readdir() {
            return Array.from(FS.streams.entries()).filter(([k, v]) => v).map(([k, v]) => k.toString());
          }
        };
        return node;
      }
    }, {}, "/proc/self/fd");
  },
  createStandardStreams(input, output, error) {
    // TODO deprecate the old functionality of a single
    // input / output callback and that utilizes FS.createDevice
    // and instead require a unique set of stream ops
    // by default, we symlink the standard streams to the
    // default tty devices. however, if the standard streams
    // have been overwritten we create a unique device for
    // them instead.
    if (input) {
      FS.createDevice("/dev", "stdin", input);
    } else {
      FS.symlink("/dev/tty", "/dev/stdin");
    }
    if (output) {
      FS.createDevice("/dev", "stdout", null, output);
    } else {
      FS.symlink("/dev/tty", "/dev/stdout");
    }
    if (error) {
      FS.createDevice("/dev", "stderr", null, error);
    } else {
      FS.symlink("/dev/tty1", "/dev/stderr");
    }
    // open default streams for the stdin, stdout and stderr devices
    var stdin = FS.open("/dev/stdin", 0);
    var stdout = FS.open("/dev/stdout", 1);
    var stderr = FS.open("/dev/stderr", 1);
  },
  staticInit() {
    FS.nameTable = new Array(4096);
    FS.mount(MEMFS, {}, "/");
    FS.createDefaultDirectories();
    FS.createDefaultDevices();
    FS.createSpecialDirectories();
    FS.filesystems = {
      "MEMFS": MEMFS
    };
  },
  init(input, output, error) {
    FS.initialized = true;
    // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
    input ??= Module["stdin"];
    output ??= Module["stdout"];
    error ??= Module["stderr"];
    FS.createStandardStreams(input, output, error);
  },
  quit() {
    FS.initialized = false;
    // force-flush all streams, so we get musl std streams printed out
    // close all of our streams
    for (var stream of FS.streams) {
      if (stream) {
        FS.close(stream);
      }
    }
  },
  findObject(path, dontResolveLastLink) {
    var ret = FS.analyzePath(path, dontResolveLastLink);
    if (!ret.exists) {
      return null;
    }
    return ret.object;
  },
  analyzePath(path, dontResolveLastLink) {
    // operate from within the context of the symlink's target
    try {
      var lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      });
      path = lookup.path;
    } catch (e) {}
    var ret = {
      isRoot: false,
      exists: false,
      error: 0,
      name: null,
      path: null,
      object: null,
      parentExists: false,
      parentPath: null,
      parentObject: null
    };
    try {
      var lookup = FS.lookupPath(path, {
        parent: true
      });
      ret.parentExists = true;
      ret.parentPath = lookup.path;
      ret.parentObject = lookup.node;
      ret.name = PATH.basename(path);
      lookup = FS.lookupPath(path, {
        follow: !dontResolveLastLink
      });
      ret.exists = true;
      ret.path = lookup.path;
      ret.object = lookup.node;
      ret.name = lookup.node.name;
      ret.isRoot = lookup.path === "/";
    } catch (e) {
      ret.error = e.errno;
    }
    return ret;
  },
  createPath(parent, path, canRead, canWrite) {
    parent = typeof parent == "string" ? parent : FS.getPath(parent);
    var parts = path.split("/").reverse();
    while (parts.length) {
      var part = parts.pop();
      if (!part) continue;
      var current = PATH.join2(parent, part);
      try {
        FS.mkdir(current);
      } catch (e) {
        if (e.errno != 20) throw e;
      }
      parent = current;
    }
    return current;
  },
  createFile(parent, name, properties, canRead, canWrite) {
    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
    var mode = FS_getMode(canRead, canWrite);
    return FS.create(path, mode);
  },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
    var path = name;
    if (parent) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      path = name ? PATH.join2(parent, name) : parent;
    }
    var mode = FS_getMode(canRead, canWrite);
    var node = FS.create(path, mode);
    if (data) {
      data = FS_fileDataToTypedArray(data);
      // make sure we can write to the file
      FS.chmod(node, mode | 146);
      var stream = FS.open(node, 577);
      FS.write(stream, data, 0, data.length, 0, canOwn);
      FS.close(stream);
      FS.chmod(node, mode);
    }
  },
  createDevice(parent, name, input, output) {
    var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
    var mode = FS_getMode(!!input, !!output);
    FS.createDevice.major ??= 64;
    var dev = FS.makedev(FS.createDevice.major++, 0);
    // Create a fake device that a set of stream ops to emulate
    // the old behavior.
    FS.registerDevice(dev, {
      open(stream) {
        stream.seekable = false;
      },
      close(stream) {
        // flush any pending line data
        if (output?.buffer?.length) {
          output(10);
        }
      },
      read(stream, buffer, offset, length, pos) {
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.atime = Date.now();
        }
        return bytesRead;
      },
      write(stream, buffer, offset, length, pos) {
        for (var i = 0; i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.mtime = stream.node.ctime = Date.now();
        }
        return i;
      }
    });
    return FS.mkdev(path, mode, dev);
  },
  forceLoadFile(obj) {
    if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
    if (globalThis.XMLHttpRequest) {
      abort("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
    } else {
      // Command-line.
      try {
        obj.contents = readBinary(obj.url);
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
    }
  },
  createLazyFile(parent, name, url, canRead, canWrite) {
    // Lazy chunked Uint8Array (implements get and length from Uint8Array).
    // Actual getting is abstracted away for eventual reuse.
    class LazyUint8Array {
      lengthKnown=false;
      chunks=[];
      // Loaded chunks. Index is the chunk number
      get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return undefined;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = (idx / this.chunkSize) | 0;
        return this.getter(chunkNum)[chunkOffset];
      }
      setDataGetter(getter) {
        this.getter = getter;
      }
      cacheLength() {
        // Find length
        var xhr = new XMLHttpRequest;
        xhr.open("HEAD", url, false);
        xhr.send(null);
        if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) abort("Couldn't load " + url + ". Status: " + xhr.status);
        var datalength = Number(xhr.getResponseHeader("Content-length"));
        var header;
        var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
        var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
        var chunkSize = 1024 * 1024;
        // Chunk size in bytes
        if (!hasByteServing) chunkSize = datalength;
        // Function to get a range from the remote URL.
        var doXHR = (from, to) => {
          if (from > to) abort(`invalid range (${from}, ${to}) or no bytes requested!`);
          if (to > datalength - 1) abort(`only ${datalength} bytes available! programmer error!`);
          // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
          var xhr = new XMLHttpRequest;
          xhr.open("GET", url, false);
          if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
          // Some hints to the browser that we want binary data.
          xhr.responseType = "arraybuffer";
          if (xhr.overrideMimeType) {
            xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) abort("Couldn't load " + url + ". Status: " + xhr.status);
          if (xhr.response !== undefined) {
            return new Uint8Array(/** @type{Array<number>} */ (xhr.response || []));
          }
          return intArrayFromString(xhr.responseText ?? "", true);
        };
        var lazyArray = this;
        lazyArray.setDataGetter(chunkNum => {
          var start = chunkNum * chunkSize;
          var end = (chunkNum + 1) * chunkSize - 1;
          // including this byte
          end = Math.min(end, datalength - 1);
          // if datalength-1 is selected, this is the last block
          if (typeof lazyArray.chunks[chunkNum] == "undefined") {
            lazyArray.chunks[chunkNum] = doXHR(start, end);
          }
          if (typeof lazyArray.chunks[chunkNum] == "undefined") abort("doXHR failed!");
          return lazyArray.chunks[chunkNum];
        });
        if (usesGzip || !datalength) {
          // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
          chunkSize = datalength = 1;
          // this will force getter(0)/doXHR do download the whole file
          datalength = this.getter(0).length;
          chunkSize = datalength;
          out("LazyFiles on gzip forces download of the whole file when length is accessed");
        }
        this._length = datalength;
        this._chunkSize = chunkSize;
        this.lengthKnown = true;
      }
      get length() {
        if (!this.lengthKnown) {
          this.cacheLength();
        }
        return this._length;
      }
      get chunkSize() {
        if (!this.lengthKnown) {
          this.cacheLength();
        }
        return this._chunkSize;
      }
    }
    if (globalThis.XMLHttpRequest) {
      if (!ENVIRONMENT_IS_WORKER) abort("Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc");
      var lazyArray = new LazyUint8Array;
      var properties = {
        isDevice: false,
        contents: lazyArray
      };
    } else {
      var properties = {
        isDevice: false,
        url
      };
    }
    var node = FS.createFile(parent, name, properties, canRead, canWrite);
    // This is a total hack, but I want to get this lazy file code out of the
    // core of MEMFS. If we want to keep this lazy file concept I feel it should
    // be its own thin LAZYFS proxying calls to MEMFS.
    if (properties.contents) {
      node.contents = properties.contents;
    } else if (properties.url) {
      node.contents = null;
      node.url = properties.url;
    }
    // Add a function that defers querying the file size until it is asked the first time.
    Object.defineProperties(node, {
      usedBytes: {
        get: function() {
          return this.contents.length;
        }
      }
    });
    // override each stream op with one that tries to force load the lazy file first
    var stream_ops = {};
    for (const [key, fn] of Object.entries(node.stream_ops)) {
      stream_ops[key] = (...args) => {
        FS.forceLoadFile(node);
        return fn(...args);
      };
    }
    function writeChunks(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= contents.length) return 0;
      var size = Math.min(contents.length - position, length);
      if (contents.slice) {
        // normal array
        for (var i = 0; i < size; i++) {
          buffer[offset + i] = contents[position + i];
        }
      } else {
        for (var i = 0; i < size; i++) {
          // LazyUint8Array from sync binary XHR
          buffer[offset + i] = contents.get(position + i);
        }
      }
      return size;
    }
    // use a custom read function
    stream_ops.read = (stream, buffer, offset, length, position) => {
      FS.forceLoadFile(node);
      return writeChunks(stream, buffer, offset, length, position);
    };
    // use a custom mmap function
    stream_ops.mmap = (stream, length, position, prot, flags) => {
      FS.forceLoadFile(node);
      var ptr = mmapAlloc(length);
      if (!ptr) {
        throw new FS.ErrnoError(48);
      }
      writeChunks(stream, HEAP8, ptr, length, position);
      return {
        ptr,
        allocated: true
      };
    };
    node.stream_ops = stream_ops;
    return node;
  }
};

/**
   * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
   * emscripten HEAP, returns a copy of that string as a Javascript String object.
   *
   * @param {number} ptr
   * @param {number=} maxBytesToRead - An optional length that specifies the
   *   maximum number of bytes to read. You can omit this parameter to scan the
   *   string until the first 0 byte. If maxBytesToRead is passed, and the string
   *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
   *   string will cut short at that byte index.
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */ var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) => {
  ptr >>>= 0;
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead, ignoreNul) : "";
};

var SYSCALLS = {
  currentUmask: 18,
  calculateAt(dirfd, path, allowEmpty) {
    if (PATH.isAbs(path)) {
      return path;
    }
    // relative path
    var dir;
    if (dirfd === -100) {
      dir = FS.cwd();
    } else {
      var dirstream = SYSCALLS.getStreamFromFD(dirfd);
      dir = dirstream.path;
    }
    if (path.length == 0) {
      if (!allowEmpty) {
        throw new FS.ErrnoError(44);
      }
      return dir;
    }
    return dir + "/" + path;
  },
  writeStat(buf, stat) {
    HEAPU32[((buf) >>> 2) >>> 0] = stat.dev;
    HEAPU32[(((buf) + (4)) >>> 2) >>> 0] = stat.mode;
    HEAPU32[(((buf) + (8)) >>> 2) >>> 0] = stat.nlink;
    HEAPU32[(((buf) + (12)) >>> 2) >>> 0] = stat.uid;
    HEAPU32[(((buf) + (16)) >>> 2) >>> 0] = stat.gid;
    HEAPU32[(((buf) + (20)) >>> 2) >>> 0] = stat.rdev;
    HEAP64[(((buf) + (24)) >>> 3) >>> 0] = BigInt(stat.size);
    HEAP32[(((buf) + (32)) >>> 2) >>> 0] = 4096;
    HEAP32[(((buf) + (36)) >>> 2) >>> 0] = stat.blocks;
    var atime = stat.atime.getTime();
    var mtime = stat.mtime.getTime();
    var ctime = stat.ctime.getTime();
    HEAP64[(((buf) + (40)) >>> 3) >>> 0] = BigInt(Math.floor(atime / 1e3));
    HEAPU32[(((buf) + (48)) >>> 2) >>> 0] = (atime % 1e3) * 1e3 * 1e3;
    HEAP64[(((buf) + (56)) >>> 3) >>> 0] = BigInt(Math.floor(mtime / 1e3));
    HEAPU32[(((buf) + (64)) >>> 2) >>> 0] = (mtime % 1e3) * 1e3 * 1e3;
    HEAP64[(((buf) + (72)) >>> 3) >>> 0] = BigInt(Math.floor(ctime / 1e3));
    HEAPU32[(((buf) + (80)) >>> 2) >>> 0] = (ctime % 1e3) * 1e3 * 1e3;
    HEAP64[(((buf) + (88)) >>> 3) >>> 0] = BigInt(stat.ino);
    return 0;
  },
  writeStatFs(buf, stats) {
    HEAPU32[(((buf) + (4)) >>> 2) >>> 0] = stats.bsize;
    HEAPU32[(((buf) + (60)) >>> 2) >>> 0] = stats.bsize;
    HEAP64[(((buf) + (8)) >>> 3) >>> 0] = BigInt(stats.blocks);
    HEAP64[(((buf) + (16)) >>> 3) >>> 0] = BigInt(stats.bfree);
    HEAP64[(((buf) + (24)) >>> 3) >>> 0] = BigInt(stats.bavail);
    HEAP64[(((buf) + (32)) >>> 3) >>> 0] = BigInt(stats.files);
    HEAP64[(((buf) + (40)) >>> 3) >>> 0] = BigInt(stats.ffree);
    HEAPU32[(((buf) + (48)) >>> 2) >>> 0] = stats.fsid;
    HEAPU32[(((buf) + (64)) >>> 2) >>> 0] = stats.flags;
    // ST_NOSUID
    HEAPU32[(((buf) + (56)) >>> 2) >>> 0] = stats.namelen;
  },
  doMsync(addr, stream, len, flags, offset) {
    if (!FS.isFile(stream.node.mode)) {
      throw new FS.ErrnoError(43);
    }
    if (flags & 2) {
      // MAP_PRIVATE calls need not to be synced back to underlying fs
      return 0;
    }
    var buffer = HEAPU8.subarray(addr >>> 0, addr + len >>> 0);
    FS.msync(stream, buffer, offset, len, flags);
  },
  getStreamFromFD(fd) {
    var stream = FS.getStreamChecked(fd);
    return stream;
  },
  varargs: undefined,
  getStr(ptr) {
    var ret = UTF8ToString(ptr);
    return ret;
  }
};

var INT53_MAX = 9007199254740992;

var INT53_MIN = -9007199254740992;

var bigintToI53Checked = num => (num < INT53_MIN || num > INT53_MAX) ? NaN : Number(num);

function ___syscall_fcntl64(fd, cmd, varargs) {
  varargs >>>= 0;
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (cmd) {
     case 0:
      {
        var arg = syscallGetVarargI();
        if (arg < 0) {
          return -28;
        }
        while (FS.streams[arg]) {
          arg++;
        }
        var newStream;
        newStream = FS.dupStream(stream, arg);
        return newStream.fd;
      }

     case 1:
     case 2:
      return 0;

     // FD_CLOEXEC makes no sense for a single process.
      case 3:
      return stream.flags;

     case 4:
      {
        var arg = syscallGetVarargI();
        var mask = 289792;
        stream.flags = (stream.flags & ~mask) | (arg & mask);
        return 0;
      }

     case 12:
      {
        var arg = syscallGetVarargP();
        var offset = 0;
        // We're always unlocked.
        HEAP16[(((arg) + (offset)) >>> 1) >>> 0] = 2;
        return 0;
      }

     case 13:
     case 14:
      // Pretend that the locking is successful. These are process-level locks,
      // and Emscripten programs are a single process. If we supported linking a
      // filesystem between programs, we'd need to do more here.
      // See https://github.com/emscripten-core/emscripten/issues/23697
      return 0;
    }
    return -28;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_ioctl(fd, op, varargs) {
  varargs >>>= 0;
  SYSCALLS.varargs = varargs;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    switch (op) {
     case 21509:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     case 21505:
      {
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tcgets) {
          var termios = stream.tty.ops.ioctl_tcgets(stream);
          var argp = syscallGetVarargP();
          HEAP32[((argp) >>> 2) >>> 0] = termios.c_iflag || 0;
          HEAP32[(((argp) + (4)) >>> 2) >>> 0] = termios.c_oflag || 0;
          HEAP32[(((argp) + (8)) >>> 2) >>> 0] = termios.c_cflag || 0;
          HEAP32[(((argp) + (12)) >>> 2) >>> 0] = termios.c_lflag || 0;
          for (var i = 0; i < 32; i++) {
            HEAP8[(argp + i) + (17) >>> 0] = termios.c_cc[i] || 0;
          }
          return 0;
        }
        return 0;
      }

     case 21510:
     case 21511:
     case 21512:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     case 21506:
     case 21507:
     case 21508:
      {
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tcsets) {
          var argp = syscallGetVarargP();
          var c_iflag = HEAP32[((argp) >>> 2) >>> 0];
          var c_oflag = HEAP32[(((argp) + (4)) >>> 2) >>> 0];
          var c_cflag = HEAP32[(((argp) + (8)) >>> 2) >>> 0];
          var c_lflag = HEAP32[(((argp) + (12)) >>> 2) >>> 0];
          var c_cc = [];
          for (var i = 0; i < 32; i++) {
            c_cc.push(HEAP8[(argp + i) + (17) >>> 0]);
          }
          return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
            c_iflag,
            c_oflag,
            c_cflag,
            c_lflag,
            c_cc
          });
        }
        return 0;
      }

     case 21519:
      {
        if (!stream.tty) return -59;
        var argp = syscallGetVarargP();
        HEAP32[((argp) >>> 2) >>> 0] = 0;
        return 0;
      }

     case 21520:
      {
        if (!stream.tty) return -59;
        return -28;
      }

     case 21537:
     case 21531:
      {
        var argp = syscallGetVarargP();
        return FS.ioctl(stream, op, argp);
      }

     case 21523:
      {
        // TODO: in theory we should write to the winsize struct that gets
        // passed in, but for now musl doesn't read anything on it
        if (!stream.tty) return -59;
        if (stream.tty.ops.ioctl_tiocgwinsz) {
          var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
          var argp = syscallGetVarargP();
          HEAP16[((argp) >>> 1) >>> 0] = winsize[0];
          HEAP16[(((argp) + (2)) >>> 1) >>> 0] = winsize[1];
        }
        return 0;
      }

     case 21524:
      {
        // TODO: technically, this ioctl call should change the window size.
        // but, since emscripten doesn't have any concept of a terminal window
        // yet, we'll just silently throw it away as we do TIOCGWINSZ
        if (!stream.tty) return -59;
        return 0;
      }

     case 21515:
      {
        if (!stream.tty) return -59;
        return 0;
      }

     default:
      return -28;
    }
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_mkdirat(dirfd, path, mode) {
  path >>>= 0;
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    mode &= ~SYSCALLS.currentUmask;
    FS.mkdir(path, mode, 0);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

function ___syscall_openat(dirfd, path, flags, varargs) {
  path >>>= 0;
  varargs >>>= 0;
  SYSCALLS.varargs = varargs;
  try {
    path = SYSCALLS.getStr(path);
    path = SYSCALLS.calculateAt(dirfd, path);
    var mode = varargs ? syscallGetVarargI() : 0;
    if (flags & 64) {
      mode &= ~SYSCALLS.currentUmask;
    }
    return FS.open(path, flags, mode).fd;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return -e.errno;
  }
}

var __abort_js = () => abort("");

function __gmtime_js(time, tmPtr) {
  time = bigintToI53Checked(time);
  tmPtr >>>= 0;
  var date = new Date(time * 1e3);
  if (isNaN(date.getTime())) {
    return 1;
  }
  HEAP32[((tmPtr) >>> 2) >>> 0] = date.getUTCSeconds();
  HEAP32[(((tmPtr) + (4)) >>> 2) >>> 0] = date.getUTCMinutes();
  HEAP32[(((tmPtr) + (8)) >>> 2) >>> 0] = date.getUTCHours();
  HEAP32[(((tmPtr) + (12)) >>> 2) >>> 0] = date.getUTCDate();
  HEAP32[(((tmPtr) + (16)) >>> 2) >>> 0] = date.getUTCMonth();
  HEAP32[(((tmPtr) + (20)) >>> 2) >>> 0] = date.getUTCFullYear() - 1900;
  HEAP32[(((tmPtr) + (24)) >>> 2) >>> 0] = date.getUTCDay();
  var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
  var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
  HEAP32[(((tmPtr) + (28)) >>> 2) >>> 0] = yday;
  return 0;
}

var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);

var __tzset_js = function(timezone, daylight, std_name, dst_name) {
  timezone >>>= 0;
  daylight >>>= 0;
  std_name >>>= 0;
  dst_name >>>= 0;
  // TODO: Use (malleable) environment variables instead of system settings.
  var currentYear = (new Date).getFullYear();
  var winter = new Date(currentYear, 0, 1);
  var summer = new Date(currentYear, 6, 1);
  var winterOffset = winter.getTimezoneOffset();
  var summerOffset = summer.getTimezoneOffset();
  // Local standard timezone offset. Local standard time is not adjusted for
  // daylight savings.  This code uses the fact that getTimezoneOffset returns
  // a greater value during Standard Time versus Daylight Saving Time (DST).
  // Thus it determines the expected output during Standard Time, and it
  // compares whether the output of the given date the same (Standard) or less
  // (DST).
  var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  // timezone is specified as seconds west of UTC ("The external variable
  // `timezone` shall be set to the difference, in seconds, between
  // Coordinated Universal Time (UTC) and local standard time."), the same
  // as returned by stdTimezoneOffset.
  // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
  HEAPU32[((timezone) >>> 2) >>> 0] = stdTimezoneOffset * 60;
  HEAP32[((daylight) >>> 2) >>> 0] = Number(winterOffset != summerOffset);
  var extractZone = timezoneOffset => {
    // Why inverse sign?
    // Read here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
    var sign = timezoneOffset >= 0 ? "-" : "+";
    var absOffset = Math.abs(timezoneOffset);
    var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
    var minutes = String(absOffset % 60).padStart(2, "0");
    return `UTC${sign}${hours}${minutes}`;
  };
  var winterName = extractZone(winterOffset);
  var summerName = extractZone(summerOffset);
  if (summerOffset < winterOffset) {
    // Northern hemisphere
    stringToUTF8(winterName, std_name, 17);
    stringToUTF8(summerName, dst_name, 17);
  } else {
    stringToUTF8(winterName, dst_name, 17);
    stringToUTF8(summerName, std_name, 17);
  }
};

var _emscripten_get_now = () => performance.now();

var _emscripten_date_now = () => Date.now();

var nowIsMonotonic = 1;

var checkWasiClock = clock_id => clock_id >= 0 && clock_id <= 3;

function _clock_time_get(clk_id, ignored_precision, ptime) {
  ignored_precision = bigintToI53Checked(ignored_precision);
  ptime >>>= 0;
  if (!checkWasiClock(clk_id)) {
    return 28;
  }
  var now;
  // all wasi clocks but realtime are monotonic
  if (clk_id === 0) {
    now = _emscripten_date_now();
  } else if (nowIsMonotonic) {
    now = _emscripten_get_now();
  } else {
    return 52;
  }
  // "now" is in ms, and wasi times are in ns.
  var nsec = Math.round(now * 1e3 * 1e3);
  HEAP64[((ptime) >>> 3) >>> 0] = BigInt(nsec);
  return 0;
}

var readEmAsmArgsArray = [];

var readEmAsmArgs = (sigPtr, buf) => {
  readEmAsmArgsArray.length = 0;
  var ch;
  // Most arguments are i32s, so shift the buffer pointer so it is a plain
  // index into HEAP32.
  while (ch = HEAPU8[sigPtr++ >>> 0]) {
    // Floats are always passed as doubles, so all types except for 'i'
    // are 8 bytes and require alignment.
    var wide = (ch != 105);
    wide &= (ch != 112);
    buf += wide && (buf % 8) ? 4 : 0;
    readEmAsmArgsArray.push(// Special case for pointers under wasm64 or CAN_ADDRESS_2GB mode.
    ch == 112 ? HEAPU32[((buf) >>> 2) >>> 0] : ch == 106 ? HEAP64[((buf) >>> 3) >>> 0] : ch == 105 ? HEAP32[((buf) >>> 2) >>> 0] : HEAPF64[((buf) >>> 3) >>> 0]);
    buf += wide ? 8 : 4;
  }
  return readEmAsmArgsArray;
};

var runEmAsmFunction = (code, sigPtr, argbuf) => {
  var args = readEmAsmArgs(sigPtr, argbuf);
  return ASM_CONSTS[code](...args);
};

function _emscripten_asm_const_int(code, sigPtr, argbuf) {
  code >>>= 0;
  sigPtr >>>= 0;
  argbuf >>>= 0;
  return runEmAsmFunction(code, sigPtr, argbuf);
}

var runtimeKeepaliveCounter = 0;

var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;

var _proc_exit = code => {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    Module["onExit"]?.(code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
};

/** @param {boolean|number=} implicit */ var exitJS = (status, implicit) => {
  EXITSTATUS = status;
  _proc_exit(status);
};

var _exit = exitJS;

var __emscripten_runtime_keepalive_clear = () => {
  noExitRuntime = false;
  runtimeKeepaliveCounter = 0;
};

var _emscripten_force_exit = status => {
  __emscripten_runtime_keepalive_clear();
  _exit(status);
};

var getHeapMax = () => // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
// full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
// for any code that deals with heap sizes, which would require special
// casing all heap size related code to treat 0 specially.
4294901760;

var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;

var growMemory = size => {
  var oldHeapSize = wasmMemory.buffer.byteLength;
  var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
  try {
    // round size grow request up to wasm page size (fixed 64KB per spec)
    wasmMemory.grow(pages);
    // .grow() takes a delta compared to the previous size
    updateMemoryViews();
    return 1;
  } catch (e) {}
};

function _emscripten_resize_heap(requestedSize) {
  requestedSize >>>= 0;
  var oldSize = HEAPU8.length;
  // With multithreaded builds, races can happen (another thread might increase the size
  // in between), so return a failure, and let the caller retry.
  // Memory resize rules:
  // 1.  Always increase heap size to at least the requested size, rounded up
  //     to next page multiple.
  // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
  //     geometrically: increase the heap size according to
  //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
  //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
  // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
  //     linearly: increase the heap size by at least
  //     MEMORY_GROWTH_LINEAR_STEP bytes.
  // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
  //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
  // 4.  If we were unable to allocate as much memory, it may be due to
  //     over-eager decision to excessively reserve due to (3) above.
  //     Hence if an allocation fails, cut down on the amount of excess
  //     growth, in an attempt to succeed to perform a smaller allocation.
  // A limit is set for how much we can grow. We should not exceed that
  // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
  var maxHeapSize = getHeapMax();
  if (requestedSize > maxHeapSize) {
    return false;
  }
  // Loop through potential heap size increases. If we attempt a too eager
  // reservation that fails, cut down on the attempted size and reserve a
  // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
  for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
    // ensure geometric growth
    // but limit overreserving (default to capping at +96MB overgrowth at most)
    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
    var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
    var replacement = growMemory(newSize);
    if (replacement) {
      return true;
    }
  }
  return false;
}

var maybeCStringToJsString = cString => cString > 2 ? UTF8ToString(cString) : cString;

/** @type {Object} */ var specialHTMLTargets = [ 0, document, window ];

var findEventTarget = target => {
  target = maybeCStringToJsString(target);
  var domElement = specialHTMLTargets[target] || document.querySelector(target);
  return domElement;
};

var findCanvasEventTarget = findEventTarget;

function _emscripten_set_canvas_element_size(target, width, height) {
  target >>>= 0;
  var canvas = findCanvasEventTarget(target);
  if (!canvas) return -4;
  canvas.width = width;
  canvas.height = height;
  return 0;
}

var GLctx;

var webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance = ctx => // Closure is expected to be allowed to minify the '.dibvbi' property, so not accessing it quoted.
!!(ctx.dibvbi = ctx.getExtension("WEBGL_draw_instanced_base_vertex_base_instance"));

var webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance = ctx => !!(ctx.mdibvbi = ctx.getExtension("WEBGL_multi_draw_instanced_base_vertex_base_instance"));

var webgl_enable_EXT_polygon_offset_clamp = ctx => !!(ctx.extPolygonOffsetClamp = ctx.getExtension("EXT_polygon_offset_clamp"));

var webgl_enable_EXT_clip_control = ctx => !!(ctx.extClipControl = ctx.getExtension("EXT_clip_control"));

var webgl_enable_WEBGL_polygon_mode = ctx => !!(ctx.webglPolygonMode = ctx.getExtension("WEBGL_polygon_mode"));

var webgl_enable_WEBGL_multi_draw = ctx => // Closure is expected to be allowed to minify the '.multiDrawWebgl' property, so not accessing it quoted.
!!(ctx.multiDrawWebgl = ctx.getExtension("WEBGL_multi_draw"));

var getEmscriptenSupportedExtensions = ctx => {
  // Restrict the list of advertised extensions to those that we actually
  // support.
  var supportedExtensions = [ // WebGL 2 extensions
  "EXT_color_buffer_float", "EXT_conservative_depth", "EXT_disjoint_timer_query_webgl2", "EXT_texture_norm16", "NV_shader_noperspective_interpolation", "WEBGL_clip_cull_distance", // WebGL 1 and WebGL 2 extensions
  "EXT_clip_control", "EXT_color_buffer_half_float", "EXT_depth_clamp", "EXT_float_blend", "EXT_polygon_offset_clamp", "EXT_texture_compression_bptc", "EXT_texture_compression_rgtc", "EXT_texture_filter_anisotropic", "KHR_parallel_shader_compile", "OES_texture_float_linear", "WEBGL_blend_func_extended", "WEBGL_compressed_texture_astc", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_etc1", "WEBGL_compressed_texture_s3tc", "WEBGL_compressed_texture_s3tc_srgb", "WEBGL_debug_renderer_info", "WEBGL_debug_shaders", "WEBGL_lose_context", "WEBGL_multi_draw", "WEBGL_polygon_mode" ];
  // .getSupportedExtensions() can return null if context is lost, so coerce to empty array.
  return ctx.getSupportedExtensions()?.filter(ext => supportedExtensions.includes(ext)) ?? [];
};

var registerPreMainLoop = f => {
  // Does nothing unless $MainLoop is included/used.
  typeof MainLoop != "undefined" && MainLoop.preMainLoop.push(f);
};

var webglBufferSubData = (target, offset, size, data, src = HEAPU8) => {
  GLctx.bufferSubData(target, offset, src.subarray(data, data + size));
};

var GL = {
  counter: 1,
  buffers: [],
  mappedBuffers: {},
  programs: [],
  framebuffers: [],
  renderbuffers: [],
  textures: [],
  shaders: [],
  vaos: [],
  contexts: [],
  offscreenCanvases: {},
  queries: [],
  samplers: [],
  transformFeedbacks: [],
  syncs: [],
  byteSizeByTypeRoot: 5120,
  byteSizeByType: [ 1, 1, 2, 2, 4, 4, 4, 2, 3, 4, 8 ],
  stringCache: {},
  stringiCache: {},
  unpackAlignment: 4,
  unpackRowLength: 0,
  recordError: errorCode => {
    if (!GL.lastError) {
      GL.lastError = errorCode;
    }
  },
  getNewId: table => {
    var ret = GL.counter++;
    for (var i = table.length; i < ret; i++) {
      table[i] = null;
    }
    // Skip over any non-null elements that might have been created by
    // glBindBuffer.
    while (table[ret]) {
      ret = GL.counter++;
    }
    return ret;
  },
  genObject: (n, buffers, createFunction, objectTable) => {
    for (var i = 0; i < n; i++) {
      var buffer = GLctx[createFunction]();
      var id = buffer && GL.getNewId(objectTable);
      if (buffer) {
        buffer.name = id;
        objectTable[id] = buffer;
      } else {
        GL.recordError(1282);
      }
      HEAP32[(((buffers) + (i * 4)) >>> 2) >>> 0] = id;
    }
  },
  MAX_TEMP_BUFFER_SIZE: 2097152,
  numTempVertexBuffersPerSize: 64,
  log2ceilLookup: i => 32 - Math.clz32(i === 0 ? 0 : i - 1),
  generateTempBuffers: (quads, context) => {
    var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
    context.tempVertexBufferCounters1 = [];
    context.tempVertexBufferCounters2 = [];
    context.tempVertexBufferCounters1.length = context.tempVertexBufferCounters2.length = largestIndex + 1;
    context.tempVertexBuffers1 = [];
    context.tempVertexBuffers2 = [];
    context.tempVertexBuffers1.length = context.tempVertexBuffers2.length = largestIndex + 1;
    context.tempIndexBuffers = [];
    context.tempIndexBuffers.length = largestIndex + 1;
    for (var i = 0; i <= largestIndex; ++i) {
      context.tempIndexBuffers[i] = null;
      // Created on-demand
      context.tempVertexBufferCounters1[i] = context.tempVertexBufferCounters2[i] = 0;
      var ringbufferLength = GL.numTempVertexBuffersPerSize;
      context.tempVertexBuffers1[i] = [];
      context.tempVertexBuffers2[i] = [];
      var ringbuffer1 = context.tempVertexBuffers1[i];
      var ringbuffer2 = context.tempVertexBuffers2[i];
      ringbuffer1.length = ringbuffer2.length = ringbufferLength;
      for (var j = 0; j < ringbufferLength; ++j) {
        ringbuffer1[j] = ringbuffer2[j] = null;
      }
    }
    if (quads) {
      // GL_QUAD indexes can be precalculated
      context.tempQuadIndexBuffer = GLctx.createBuffer();
      context.GLctx.bindBuffer(34963, context.tempQuadIndexBuffer);
      var numIndexes = GL.MAX_TEMP_BUFFER_SIZE >> 1;
      var quadIndexes = new Uint16Array(numIndexes);
      var i = 0, v = 0;
      while (1) {
        quadIndexes[i++] = v;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 1;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 2;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 2;
        if (i >= numIndexes) break;
        quadIndexes[i++] = v + 3;
        if (i >= numIndexes) break;
        v += 4;
      }
      context.GLctx.bufferData(34963, quadIndexes, 35044);
      context.GLctx.bindBuffer(34963, null);
    }
  },
  getTempVertexBuffer: sizeBytes => {
    var idx = GL.log2ceilLookup(sizeBytes);
    var ringbuffer = GL.currentContext.tempVertexBuffers1[idx];
    var nextFreeBufferIndex = GL.currentContext.tempVertexBufferCounters1[idx];
    GL.currentContext.tempVertexBufferCounters1[idx] = (GL.currentContext.tempVertexBufferCounters1[idx] + 1) & (GL.numTempVertexBuffersPerSize - 1);
    var vbo = ringbuffer[nextFreeBufferIndex];
    if (vbo) {
      return vbo;
    }
    var prevVBO = GLctx.getParameter(34964);
    ringbuffer[nextFreeBufferIndex] = GLctx.createBuffer();
    GLctx.bindBuffer(34962, ringbuffer[nextFreeBufferIndex]);
    GLctx.bufferData(34962, 1 << idx, 35048);
    GLctx.bindBuffer(34962, prevVBO);
    return ringbuffer[nextFreeBufferIndex];
  },
  getTempIndexBuffer: sizeBytes => {
    var idx = GL.log2ceilLookup(sizeBytes);
    var ibo = GL.currentContext.tempIndexBuffers[idx];
    if (ibo) {
      return ibo;
    }
    var prevIBO = GLctx.getParameter(34965);
    GL.currentContext.tempIndexBuffers[idx] = GLctx.createBuffer();
    GLctx.bindBuffer(34963, GL.currentContext.tempIndexBuffers[idx]);
    GLctx.bufferData(34963, 1 << idx, 35048);
    GLctx.bindBuffer(34963, prevIBO);
    return GL.currentContext.tempIndexBuffers[idx];
  },
  newRenderingFrameStarted: () => {
    if (!GL.currentContext) {
      return;
    }
    var vb = GL.currentContext.tempVertexBuffers1;
    GL.currentContext.tempVertexBuffers1 = GL.currentContext.tempVertexBuffers2;
    GL.currentContext.tempVertexBuffers2 = vb;
    vb = GL.currentContext.tempVertexBufferCounters1;
    GL.currentContext.tempVertexBufferCounters1 = GL.currentContext.tempVertexBufferCounters2;
    GL.currentContext.tempVertexBufferCounters2 = vb;
    var largestIndex = GL.log2ceilLookup(GL.MAX_TEMP_BUFFER_SIZE);
    for (var i = 0; i <= largestIndex; ++i) {
      GL.currentContext.tempVertexBufferCounters1[i] = 0;
    }
  },
  getSource: (shader, count, string, length) => {
    var source = "";
    for (var i = 0; i < count; ++i) {
      var len = length ? HEAPU32[(((length) + (i * 4)) >>> 2) >>> 0] : undefined;
      source += UTF8ToString(HEAPU32[(((string) + (i * 4)) >>> 2) >>> 0], len);
    }
    return source;
  },
  calcBufLength: (size, type, stride, count) => {
    if (stride > 0) {
      return count * stride;
    }
    var typeSize = GL.byteSizeByType[type - GL.byteSizeByTypeRoot];
    return size * typeSize * count;
  },
  usedTempBuffers: [],
  preDrawHandleClientVertexAttribBindings: count => {
    GL.resetBufferBinding = false;
    // TODO: initial pass to detect ranges we need to upload, might not need
    // an upload per attrib
    for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
      var cb = GL.currentContext.clientBuffers[i];
      if (!cb.clientside || !cb.enabled) continue;
      GL.resetBufferBinding = true;
      var size = GL.calcBufLength(cb.size, cb.type, cb.stride, count);
      var buf = GL.getTempVertexBuffer(size);
      GLctx.bindBuffer(34962, buf);
      webglBufferSubData(34962, 0, size, cb.ptr);
      cb.vertexAttribPointerAdaptor.call(GLctx, i, cb.size, cb.type, cb.normalized, cb.stride, 0);
    }
  },
  postDrawHandleClientVertexAttribBindings: () => {
    if (GL.resetBufferBinding) {
      GLctx.bindBuffer(34962, GL.buffers[GLctx.currentArrayBufferBinding]);
    }
  },
  createContext: (/** @type {HTMLCanvasElement} */ canvas, webGLContextAttributes) => {
    // BUG: Workaround Safari WebGL issue: After successfully acquiring WebGL
    // context on a canvas, calling .getContext() will always return that
    // context independent of which 'webgl' or 'webgl2'
    // context version was passed. See:
    //   https://webkit.org/b/222758
    // and:
    //   https://github.com/emscripten-core/emscripten/issues/13295.
    // TODO: Once the bug is fixed and shipped in Safari, adjust the Safari
    // version field in above check.
    if (!canvas.getContextSafariWebGL2Fixed) {
      canvas.getContextSafariWebGL2Fixed = canvas.getContext;
      /** @type {function(this:HTMLCanvasElement, string, (Object|null)=): (Object|null)} */ function fixedGetContext(ver, attrs) {
        var gl = canvas.getContextSafariWebGL2Fixed(ver, attrs);
        return ((ver == "webgl") == (gl instanceof WebGLRenderingContext)) ? gl : null;
      }
      canvas.getContext = fixedGetContext;
    }
    var ctx = canvas.getContext("webgl2", webGLContextAttributes);
    if (!ctx) return 0;
    var handle = GL.registerContext(ctx, webGLContextAttributes);
    return handle;
  },
  registerContext: (ctx, webGLContextAttributes) => {
    // without pthreads a context is just an integer ID
    var handle = GL.getNewId(GL.contexts);
    var context = {
      handle,
      attributes: webGLContextAttributes,
      version: webGLContextAttributes.majorVersion,
      GLctx: ctx
    };
    // Store the created context object so that we can access the context
    // given a canvas without having to pass the parameters again.
    if (ctx.canvas) ctx.canvas.GLctxObject = context;
    GL.contexts[handle] = context;
    if (typeof webGLContextAttributes.enableExtensionsByDefault == "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
      GL.initExtensions(context);
    }
    context.maxVertexAttribs = context.GLctx.getParameter(34921);
    context.clientBuffers = [];
    for (var i = 0; i < context.maxVertexAttribs; i++) {
      context.clientBuffers[i] = {
        enabled: false,
        clientside: false,
        size: 0,
        type: 0,
        normalized: 0,
        stride: 0,
        ptr: 0,
        vertexAttribPointerAdaptor: null
      };
    }
    GL.generateTempBuffers(false, context);
    return handle;
  },
  makeContextCurrent: contextHandle => {
    // Active Emscripten GL layer context object.
    GL.currentContext = GL.contexts[contextHandle];
    // Active WebGL context object.
    Module["ctx"] = GLctx = GL.currentContext?.GLctx;
    return !(contextHandle && !GLctx);
  },
  getContext: contextHandle => GL.contexts[contextHandle],
  deleteContext: contextHandle => {
    if (GL.currentContext === GL.contexts[contextHandle]) {
      GL.currentContext = null;
    }
    if (typeof JSEvents == "object") {
      // Release all JS event handlers on the DOM element that the GL context is
      // associated with since the context is now deleted.
      JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
    }
    // Make sure the canvas object no longer refers to the context object so
    // there are no GC surprises.
    if (GL.contexts[contextHandle]?.GLctx.canvas) {
      GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
    }
    GL.contexts[contextHandle] = null;
  },
  initExtensions: context => {
    // If this function is called without a specific context object, init the
    // extensions of the currently active context.
    context ||= GL.currentContext;
    if (context.initExtensionsDone) return;
    context.initExtensionsDone = true;
    var GLctx = context.GLctx;
    // Detect the presence of a few extensions manually, since the GL interop
    // layer itself will need to know if they exist.
    // Extensions that are available in both WebGL 1 and WebGL 2
    webgl_enable_WEBGL_multi_draw(GLctx);
    webgl_enable_EXT_polygon_offset_clamp(GLctx);
    webgl_enable_EXT_clip_control(GLctx);
    webgl_enable_WEBGL_polygon_mode(GLctx);
    // Extensions that are available from WebGL >= 2 (no-op if called on a WebGL 1 context active)
    webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
    webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
    // On WebGL 2, EXT_disjoint_timer_query is replaced with an alternative
    // that's based on core APIs, and exposes only the queryCounterEXT()
    // entrypoint.
    if (context.version >= 2) {
      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query_webgl2");
    }
    // However, Firefox exposes the WebGL 1 version on WebGL 2 as well and
    // thus we look for the WebGL 1 version again if the WebGL 2 version
    // isn't present. https://bugzil.la/1328882
    if (context.version < 2 || !GLctx.disjointTimerQueryExt) {
      GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
    }
    for (var ext of getEmscriptenSupportedExtensions(GLctx)) {
      // WEBGL_lose_context, WEBGL_debug_renderer_info and WEBGL_debug_shaders
      // are not enabled by default.
      if (!ext.includes("lose_context") && !ext.includes("debug")) {
        // Call .getExtension() to enable that extension permanently.
        GLctx.getExtension(ext);
      }
    }
  }
};

var webglPowerPreferences = [ "default", "low-power", "high-performance" ];

function _emscripten_webgl_do_create_context(target, attributes) {
  target >>>= 0;
  attributes >>>= 0;
  var attr32 = ((attributes) >>> 2);
  var powerPreference = HEAP32[attr32 + (8 >> 2) >>> 0];
  var contextAttributes = {
    "alpha": !!HEAP8[attributes + 0 >>> 0],
    "depth": !!HEAP8[attributes + 1 >>> 0],
    "stencil": !!HEAP8[attributes + 2 >>> 0],
    "antialias": !!HEAP8[attributes + 3 >>> 0],
    "premultipliedAlpha": !!HEAP8[attributes + 4 >>> 0],
    "preserveDrawingBuffer": !!HEAP8[attributes + 5 >>> 0],
    "powerPreference": webglPowerPreferences[powerPreference],
    "failIfMajorPerformanceCaveat": !!HEAP8[attributes + 12 >>> 0],
    "desynchronized": !!HEAP8[attributes + 33 >>> 0],
    // The following are not predefined WebGL context attributes in the WebGL specification, so the property names can be minified by Closure.
    majorVersion: HEAP32[attr32 + (16 >> 2) >>> 0],
    minorVersion: HEAP32[attr32 + (20 >> 2) >>> 0],
    enableExtensionsByDefault: HEAP8[attributes + 24 >>> 0],
    explicitSwapControl: HEAP8[attributes + 25 >>> 0],
    proxyContextToMainThread: HEAP32[attr32 + (28 >> 2) >>> 0],
    renderViaOffscreenBackBuffer: HEAP8[attributes + 32 >>> 0]
  };
  var canvas = findCanvasEventTarget(target);
  if (!canvas) {
    return 0;
  }
  if (contextAttributes.explicitSwapControl) {
    return 0;
  }
  var contextHandle = GL.createContext(canvas, contextAttributes);
  return contextHandle;
}

var _emscripten_webgl_create_context = _emscripten_webgl_do_create_context;

function _emscripten_webgl_enable_extension(contextHandle, extension) {
  contextHandle >>>= 0;
  extension >>>= 0;
  var context = GL.getContext(contextHandle);
  var extString = UTF8ToString(extension);
  if (extString.startsWith("GL_")) extString = extString.slice(3);
  // Allow enabling extensions both with "GL_" prefix and without.
  // Switch-board that pulls in code for all GL extensions, even if those are not used :/
  // Build with -sGL_SUPPORT_SIMPLE_ENABLE_EXTENSIONS=0 to avoid this.
  if (extString == "WEBGL_draw_instanced_base_vertex_base_instance") webgl_enable_WEBGL_draw_instanced_base_vertex_base_instance(GLctx);
  if (extString == "WEBGL_multi_draw_instanced_base_vertex_base_instance") webgl_enable_WEBGL_multi_draw_instanced_base_vertex_base_instance(GLctx);
  if (extString == "WEBGL_multi_draw") webgl_enable_WEBGL_multi_draw(GLctx);
  if (extString == "EXT_polygon_offset_clamp") webgl_enable_EXT_polygon_offset_clamp(GLctx);
  if (extString == "EXT_clip_control") webgl_enable_EXT_clip_control(GLctx);
  if (extString == "WEBGL_polygon_mode") webgl_enable_WEBGL_polygon_mode(GLctx);
  var ext = context.GLctx.getExtension(extString);
  return !!ext;
}

function _emscripten_webgl_do_get_current_context() {
  return GL.currentContext ? GL.currentContext.handle : 0;
}

var _emscripten_webgl_get_current_context = _emscripten_webgl_do_get_current_context;

function _emscripten_webgl_make_context_current(contextHandle) {
  contextHandle >>>= 0;
  var success = GL.makeContextCurrent(contextHandle);
  return success ? 0 : -5;
}

var ENV = {};

var getExecutableName = () => thisProgram;

var getEnvStrings = () => {
  if (!getEnvStrings.strings) {
    // Default values.
    var lang = (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8";
    var env = {
      "USER": "web_user",
      "LOGNAME": "web_user",
      "PATH": "/",
      "PWD": "/",
      "HOME": "/home/web_user",
      "LANG": lang,
      "_": getExecutableName()
    };
    // Apply the user-provided values, if any.
    for (var x in ENV) {
      // x is a key in ENV; if ENV[x] is undefined, that means it was
      // explicitly set to be so. We allow user code to do that to
      // force variables with default values to remain unset.
      if (ENV[x] === undefined) delete env[x]; else env[x] = ENV[x];
    }
    var strings = [];
    for (var x in env) {
      strings.push(`${x}=${env[x]}`);
    }
    getEnvStrings.strings = strings;
  }
  return getEnvStrings.strings;
};

function _environ_get(__environ, environ_buf) {
  __environ >>>= 0;
  environ_buf >>>= 0;
  var bufSize = 0;
  var envp = 0;
  for (var string of getEnvStrings()) {
    var ptr = environ_buf + bufSize;
    HEAPU32[(((__environ) + (envp)) >>> 2) >>> 0] = ptr;
    bufSize += stringToUTF8(string, ptr, Infinity) + 1;
    envp += 4;
  }
  return 0;
}

function _environ_sizes_get(penviron_count, penviron_buf_size) {
  penviron_count >>>= 0;
  penviron_buf_size >>>= 0;
  var strings = getEnvStrings();
  HEAPU32[((penviron_count) >>> 2) >>> 0] = strings.length;
  var bufSize = 0;
  for (var string of strings) {
    bufSize += lengthBytesUTF8(string) + 1;
  }
  HEAPU32[((penviron_buf_size) >>> 2) >>> 0] = bufSize;
  return 0;
}

function _fd_close(fd) {
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.close(stream);
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */ var doReadv = (stream, iov, iovcnt, offset) => {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
    var ptr = HEAPU32[((iov) >>> 2) >>> 0];
    var len = HEAPU32[(((iov) + (4)) >>> 2) >>> 0];
    iov += 8;
    try {
      var curr = FS.read(stream, HEAP8, ptr, len, offset);
    } catch (e) {
      // On a non-blocking stream a subsequent read may would-block after we
      // already gathered data. POSIX readv is a single gather-read: return
      // what we have rather than failing the whole call.
      if (ret > 0 && e instanceof FS.ErrnoError && (e.errno == 6 || e.errno == 6)) {
        break;
      }
      throw e;
    }
    if (curr < 0) return -1;
    ret += curr;
    if (curr < len) break;
    // nothing more to read
    if (typeof offset != "undefined") {
      offset += curr;
    }
  }
  return ret;
};

function _fd_read(fd, iov, iovcnt, pnum) {
  iov >>>= 0;
  iovcnt >>>= 0;
  pnum >>>= 0;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doReadv(stream, iov, iovcnt);
    HEAPU32[((pnum) >>> 2) >>> 0] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

function _fd_seek(fd, offset, whence, newOffset) {
  offset = bigintToI53Checked(offset);
  newOffset >>>= 0;
  try {
    if (isNaN(offset)) return 22;
    var stream = SYSCALLS.getStreamFromFD(fd);
    FS.llseek(stream, offset, whence);
    HEAP64[((newOffset) >>> 3) >>> 0] = BigInt(stream.position);
    if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
    // reset readdir state
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

/** @param {number=} offset */ var doWritev = (stream, iov, iovcnt, offset) => {
  // Gather all iovecs into one contiguous buffer and issue a single
  // FS.write, matching POSIX writev's single gather-write semantics (as
  // __syscall_sendmsg already does). Per-iovec writes fragment a stream
  // socket send into multiple segments, breaking stream byte semantics.
  if (iovcnt == 1) {
    // Single iovec: write directly from HEAP8, no gather buffer needed.
    return FS.write(stream, HEAP8, HEAPU32[((iov) >>> 2) >>> 0], HEAPU32[(((iov) + (4)) >>> 2) >>> 0], offset);
  }
  var total = 0;
  for (var i = 0, p = iov; i < iovcnt; i++, p += 8) {
    total += HEAPU32[(((p) + (4)) >>> 2) >>> 0];
  }
  var view = new Uint8Array(total);
  var voff = 0;
  for (var i = 0; i < iovcnt; i++, iov += 8) {
    var ptr = HEAPU32[((iov) >>> 2) >>> 0];
    var len = HEAPU32[(((iov) + (4)) >>> 2) >>> 0];
    view.set(HEAPU8.subarray(ptr >>> 0, ptr + len >>> 0), voff);
    voff += len;
  }
  return FS.write(stream, view, 0, total, offset);
};

function _fd_write(fd, iov, iovcnt, pnum) {
  iov >>>= 0;
  iovcnt >>>= 0;
  pnum >>>= 0;
  try {
    var stream = SYSCALLS.getStreamFromFD(fd);
    var num = doWritev(stream, iov, iovcnt);
    HEAPU32[((pnum) >>> 2) >>> 0] = num;
    return 0;
  } catch (e) {
    if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
    return e.errno;
  }
}

var _emscripten_glActiveTexture = x0 => GLctx.activeTexture(x0);

var _glActiveTexture = _emscripten_glActiveTexture;

var _emscripten_glAttachShader = (program, shader) => {
  GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
};

var _glAttachShader = _emscripten_glAttachShader;

var _emscripten_glBeginQuery = (target, id) => {
  GLctx.beginQuery(target, GL.queries[id]);
};

var _glBeginQuery = _emscripten_glBeginQuery;

var _emscripten_glBeginTransformFeedback = x0 => GLctx.beginTransformFeedback(x0);

var _glBeginTransformFeedback = _emscripten_glBeginTransformFeedback;

var _emscripten_glBindBuffer = (target, buffer) => {
  // Calling glBindBuffer with an unknown buffer will implicitly create a
  // new one.  Here we bypass `GL.counter` and directly using the ID passed
  // in.
  if (buffer && !GL.buffers[buffer]) {
    var b = GLctx.createBuffer();
    b.name = buffer;
    GL.buffers[buffer] = b;
  }
  if (target == 34962) {
    GLctx.currentArrayBufferBinding = buffer;
  } else if (target == 34963) {
    GLctx.currentElementArrayBufferBinding = buffer;
  }
  if (target == 35051) {
    // In WebGL 2 glReadPixels entry point, we need to use a different WebGL 2
    // API function call when a buffer is bound to
    // GL_PIXEL_PACK_BUFFER_BINDING point, so must keep track whether that
    // binding point is non-null to know what is the proper API function to
    // call.
    GLctx.currentPixelPackBufferBinding = buffer;
  } else if (target == 35052) {
    // In WebGL 2 gl(Compressed)Tex(Sub)Image[23]D entry points, we need to
    // use a different WebGL 2 API function call when a buffer is bound to
    // GL_PIXEL_UNPACK_BUFFER_BINDING point, so must keep track whether that
    // binding point is non-null to know what is the proper API function to
    // call.
    GLctx.currentPixelUnpackBufferBinding = buffer;
  }
  GLctx.bindBuffer(target, GL.buffers[buffer]);
};

var _glBindBuffer = _emscripten_glBindBuffer;

var _emscripten_glBindBufferBase = (target, index, buffer) => {
  GLctx.bindBufferBase(target, index, GL.buffers[buffer]);
};

var _glBindBufferBase = _emscripten_glBindBufferBase;

function _emscripten_glBindBufferRange(target, index, buffer, offset, ptrsize) {
  offset >>>= 0;
  ptrsize >>>= 0;
  GLctx.bindBufferRange(target, index, GL.buffers[buffer], offset, ptrsize);
}

var _glBindBufferRange = _emscripten_glBindBufferRange;

var _emscripten_glBindFramebuffer = (target, framebuffer) => {
  GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
};

var _glBindFramebuffer = _emscripten_glBindFramebuffer;

var _emscripten_glBindRenderbuffer = (target, renderbuffer) => {
  GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
};

var _glBindRenderbuffer = _emscripten_glBindRenderbuffer;

var _emscripten_glBindSampler = (unit, sampler) => {
  GLctx.bindSampler(unit, GL.samplers[sampler]);
};

var _glBindSampler = _emscripten_glBindSampler;

var _emscripten_glBindTexture = (target, texture) => {
  GLctx.bindTexture(target, GL.textures[texture]);
};

var _glBindTexture = _emscripten_glBindTexture;

var _emscripten_glBindVertexArray = vao => {
  GLctx.bindVertexArray(GL.vaos[vao]);
  var ibo = GLctx.getParameter(34965);
  GLctx.currentElementArrayBufferBinding = ibo ? (ibo.name | 0) : 0;
};

var _glBindVertexArray = _emscripten_glBindVertexArray;

var _emscripten_glBlendColor = (x0, x1, x2, x3) => GLctx.blendColor(x0, x1, x2, x3);

var _glBlendColor = _emscripten_glBlendColor;

var _emscripten_glBlendEquationSeparate = (x0, x1) => GLctx.blendEquationSeparate(x0, x1);

var _glBlendEquationSeparate = _emscripten_glBlendEquationSeparate;

var _emscripten_glBlendFuncSeparate = (x0, x1, x2, x3) => GLctx.blendFuncSeparate(x0, x1, x2, x3);

var _glBlendFuncSeparate = _emscripten_glBlendFuncSeparate;

var _emscripten_glBlitFramebuffer = (x0, x1, x2, x3, x4, x5, x6, x7, x8, x9) => GLctx.blitFramebuffer(x0, x1, x2, x3, x4, x5, x6, x7, x8, x9);

var _glBlitFramebuffer = _emscripten_glBlitFramebuffer;

function _emscripten_glBufferData(target, size, data, usage) {
  size >>>= 0;
  data >>>= 0;
  // N.b. here first form specifies a heap subarray, second form an integer
  // size, so the ?: code here is polymorphic. It is advised to avoid
  // randomly mixing both uses in calling code, to avoid any potential JS
  // engine JIT issues.
  GLctx.bufferData(target, data ? HEAPU8.subarray(data >>> 0, data + size >>> 0) : size, usage);
}

var _glBufferData = _emscripten_glBufferData;

function _emscripten_glBufferSubData(target, offset, size, data) {
  offset >>>= 0;
  size >>>= 0;
  data >>>= 0;
  return webglBufferSubData(target, offset, size, data);
}

var _glBufferSubData = _emscripten_glBufferSubData;

var _emscripten_glCheckFramebufferStatus = x0 => GLctx.checkFramebufferStatus(x0);

var _glCheckFramebufferStatus = _emscripten_glCheckFramebufferStatus;

var _emscripten_glClear = x0 => GLctx.clear(x0);

var _glClear = _emscripten_glClear;

function _emscripten_glClearBufferfv(buffer, drawbuffer, value) {
  value >>>= 0;
  GLctx.clearBufferfv(buffer, drawbuffer, HEAPF32, ((value) >>> 2));
}

var _glClearBufferfv = _emscripten_glClearBufferfv;

function _emscripten_glClearBufferiv(buffer, drawbuffer, value) {
  value >>>= 0;
  GLctx.clearBufferiv(buffer, drawbuffer, HEAP32, ((value) >>> 2));
}

var _glClearBufferiv = _emscripten_glClearBufferiv;

function _emscripten_glClearBufferuiv(buffer, drawbuffer, value) {
  value >>>= 0;
  GLctx.clearBufferuiv(buffer, drawbuffer, HEAPU32, ((value) >>> 2));
}

var _glClearBufferuiv = _emscripten_glClearBufferuiv;

var _emscripten_glClearColor = (x0, x1, x2, x3) => GLctx.clearColor(x0, x1, x2, x3);

var _glClearColor = _emscripten_glClearColor;

var _emscripten_glClearDepthf = x0 => GLctx.clearDepth(x0);

var _glClearDepthf = _emscripten_glClearDepthf;

var _emscripten_glClearStencil = x0 => GLctx.clearStencil(x0);

var _glClearStencil = _emscripten_glClearStencil;

var _emscripten_glColorMask = (red, green, blue, alpha) => {
  GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
};

var _glColorMask = _emscripten_glColorMask;

var _emscripten_glCompileShader = shader => {
  GLctx.compileShader(GL.shaders[shader]);
};

var _glCompileShader = _emscripten_glCompileShader;

function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
  data >>>= 0;
  if (true) {
    if (GLctx.currentPixelUnpackBufferBinding || !imageSize) {
      GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data);
      return;
    }
  }
  GLctx.compressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, HEAPU8.subarray(data >>> 0, data + imageSize >>> 0));
}

var _glCompressedTexSubImage2D = _emscripten_glCompressedTexSubImage2D;

function _emscripten_glCompressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data) {
  data >>>= 0;
  if (GLctx.currentPixelUnpackBufferBinding) {
    GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, imageSize, data);
  } else {
    GLctx.compressedTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, HEAPU8, data, imageSize);
  }
}

var _glCompressedTexSubImage3D = _emscripten_glCompressedTexSubImage3D;

function _emscripten_glCopyBufferSubData(x0, x1, x2, x3, x4) {
  x2 >>>= 0;
  x3 >>>= 0;
  x4 >>>= 0;
  return GLctx.copyBufferSubData(x0, x1, x2, x3, x4);
}

var _glCopyBufferSubData = _emscripten_glCopyBufferSubData;

var _emscripten_glCopyTexSubImage2D = (x0, x1, x2, x3, x4, x5, x6, x7) => GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7);

var _glCopyTexSubImage2D = _emscripten_glCopyTexSubImage2D;

var _emscripten_glCreateProgram = () => {
  var id = GL.getNewId(GL.programs);
  var program = GLctx.createProgram();
  // Store additional information needed for each shader program:
  program.name = id;
  // Lazy cache results of
  // glGetProgramiv(GL_ACTIVE_UNIFORM_MAX_LENGTH/GL_ACTIVE_ATTRIBUTE_MAX_LENGTH/GL_ACTIVE_UNIFORM_BLOCK_MAX_NAME_LENGTH)
  program.maxUniformLength = program.maxAttributeLength = program.maxUniformBlockNameLength = 0;
  program.uniformIdCounter = 1;
  GL.programs[id] = program;
  return id;
};

var _glCreateProgram = _emscripten_glCreateProgram;

var _emscripten_glCreateShader = shaderType => {
  var id = GL.getNewId(GL.shaders);
  GL.shaders[id] = GLctx.createShader(shaderType);
  return id;
};

var _glCreateShader = _emscripten_glCreateShader;

var _emscripten_glCullFace = x0 => GLctx.cullFace(x0);

var _glCullFace = _emscripten_glCullFace;

function _emscripten_glDeleteBuffers(n, buffers) {
  buffers >>>= 0;
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((buffers) + (i * 4)) >>> 2) >>> 0];
    var buffer = GL.buffers[id];
    // From spec: "glDeleteBuffers silently ignores 0's and names that do not
    // correspond to existing buffer objects."
    if (!buffer) continue;
    GLctx.deleteBuffer(buffer);
    buffer.name = 0;
    GL.buffers[id] = null;
    if (id == GLctx.currentArrayBufferBinding) GLctx.currentArrayBufferBinding = 0;
    if (id == GLctx.currentElementArrayBufferBinding) GLctx.currentElementArrayBufferBinding = 0;
    if (id == GLctx.currentPixelPackBufferBinding) GLctx.currentPixelPackBufferBinding = 0;
    if (id == GLctx.currentPixelUnpackBufferBinding) GLctx.currentPixelUnpackBufferBinding = 0;
  }
}

var _glDeleteBuffers = _emscripten_glDeleteBuffers;

function _emscripten_glDeleteFramebuffers(n, framebuffers) {
  framebuffers >>>= 0;
  for (var i = 0; i < n; ++i) {
    var id = HEAP32[(((framebuffers) + (i * 4)) >>> 2) >>> 0];
    var framebuffer = GL.framebuffers[id];
    if (!framebuffer) continue;
    // GL spec: "glDeleteFramebuffers silently ignores 0s and names that do not correspond to existing framebuffer objects".
    GLctx.deleteFramebuffer(framebuffer);
    framebuffer.name = 0;
    GL.framebuffers[id] = null;
  }
}

var _glDeleteFramebuffers = _emscripten_glDeleteFramebuffers;

var _emscripten_glDeleteProgram = id => {
  if (!id) return;
  var program = GL.programs[id];
  if (!program) {
    // glDeleteProgram actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteProgram(program);
  program.name = 0;
  GL.programs[id] = null;
};

var _glDeleteProgram = _emscripten_glDeleteProgram;

function _emscripten_glDeleteQueries(n, ids) {
  ids >>>= 0;
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((ids) + (i * 4)) >>> 2) >>> 0];
    var query = GL.queries[id];
    if (!query) continue;
    // GL spec: "unused names in ids are ignored, as is the name zero."
    GLctx.deleteQuery(query);
    GL.queries[id] = null;
  }
}

var _glDeleteQueries = _emscripten_glDeleteQueries;

function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
  renderbuffers >>>= 0;
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((renderbuffers) + (i * 4)) >>> 2) >>> 0];
    var renderbuffer = GL.renderbuffers[id];
    if (!renderbuffer) continue;
    // GL spec: "glDeleteRenderbuffers silently ignores 0s and names that do not correspond to existing renderbuffer objects".
    GLctx.deleteRenderbuffer(renderbuffer);
    renderbuffer.name = 0;
    GL.renderbuffers[id] = null;
  }
}

var _glDeleteRenderbuffers = _emscripten_glDeleteRenderbuffers;

function _emscripten_glDeleteSamplers(n, samplers) {
  samplers >>>= 0;
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((samplers) + (i * 4)) >>> 2) >>> 0];
    var sampler = GL.samplers[id];
    if (!sampler) continue;
    GLctx.deleteSampler(sampler);
    sampler.name = 0;
    GL.samplers[id] = null;
  }
}

var _glDeleteSamplers = _emscripten_glDeleteSamplers;

var _emscripten_glDeleteShader = id => {
  if (!id) return;
  var shader = GL.shaders[id];
  if (!shader) {
    // glDeleteShader actually signals an error when deleting a nonexisting
    // object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteShader(shader);
  GL.shaders[id] = null;
};

var _glDeleteShader = _emscripten_glDeleteShader;

function _emscripten_glDeleteSync(id) {
  id >>>= 0;
  if (!id) return;
  var sync = GL.syncs[id];
  if (!sync) {
    // glDeleteSync signals an error when deleting a nonexisting object, unlike some other GL delete functions.
    GL.recordError(1281);
    return;
  }
  GLctx.deleteSync(sync);
  sync.name = 0;
  GL.syncs[id] = null;
}

var _glDeleteSync = _emscripten_glDeleteSync;

function _emscripten_glDeleteTextures(n, textures) {
  textures >>>= 0;
  for (var i = 0; i < n; i++) {
    var id = HEAP32[(((textures) + (i * 4)) >>> 2) >>> 0];
    var texture = GL.textures[id];
    // GL spec: "glDeleteTextures silently ignores 0s and names that do not
    // correspond to existing textures".
    if (!texture) continue;
    GLctx.deleteTexture(texture);
    texture.name = 0;
    GL.textures[id] = null;
  }
}

var _glDeleteTextures = _emscripten_glDeleteTextures;

var _emscripten_glDepthFunc = x0 => GLctx.depthFunc(x0);

var _glDepthFunc = _emscripten_glDepthFunc;

var _emscripten_glDepthMask = flag => {
  GLctx.depthMask(!!flag);
};

var _glDepthMask = _emscripten_glDepthMask;

var _emscripten_glDepthRangef = (x0, x1) => GLctx.depthRange(x0, x1);

var _glDepthRangef = _emscripten_glDepthRangef;

var _emscripten_glDisable = x0 => GLctx.disable(x0);

var _glDisable = _emscripten_glDisable;

var _emscripten_glDisableVertexAttribArray = index => {
  var cb = GL.currentContext.clientBuffers[index];
  cb.enabled = false;
  GLctx.disableVertexAttribArray(index);
};

var _glDisableVertexAttribArray = _emscripten_glDisableVertexAttribArray;

var _emscripten_glDrawArrays = (mode, first, count) => {
  // bind any client-side buffers
  GL.preDrawHandleClientVertexAttribBindings(first + count);
  GLctx.drawArrays(mode, first, count);
  GL.postDrawHandleClientVertexAttribBindings();
};

var _glDrawArrays = _emscripten_glDrawArrays;

var _emscripten_glDrawArraysInstanced = (mode, first, count, primcount) => {
  GLctx.drawArraysInstanced(mode, first, count, primcount);
};

var _glDrawArraysInstanced = _emscripten_glDrawArraysInstanced;

var tempFixedLengthArray = [];

function _emscripten_glDrawBuffers(n, bufs) {
  bufs >>>= 0;
  var bufArray = tempFixedLengthArray[n];
  for (var i = 0; i < n; i++) {
    bufArray[i] = HEAP32[(((bufs) + (i * 4)) >>> 2) >>> 0];
  }
  GLctx.drawBuffers(bufArray);
}

var _glDrawBuffers = _emscripten_glDrawBuffers;

function _emscripten_glDrawElements(mode, count, type, indices) {
  indices >>>= 0;
  var buf;
  var vertexes = 0;
  if (!GLctx.currentElementArrayBufferBinding) {
    var size = GL.calcBufLength(1, type, 0, count);
    buf = GL.getTempIndexBuffer(size);
    GLctx.bindBuffer(34963, buf);
    webglBufferSubData(34963, 0, size, indices);
    // Calculating vertex count if shader's attribute data is on client side
    if (count > 0) {
      for (var i = 0; i < GL.currentContext.maxVertexAttribs; ++i) {
        var cb = GL.currentContext.clientBuffers[i];
        if (cb.clientside && cb.enabled) {
          let arrayClass;
          switch (type) {
           case 5121:
            arrayClass = Uint8Array;
            break;

           case 5123:
            arrayClass = Uint16Array;
            break;

           case 5125:
            arrayClass = Uint32Array;
            break;

           default:
            GL.recordError(1282);
            return;
          }
          vertexes = new arrayClass(HEAPU8.buffer, indices, count).reduce((max, current) => Math.max(max, current)) + 1;
          break;
        }
      }
    }
    // the index is now 0
    indices = 0;
  }
  // bind any client-side buffers
  GL.preDrawHandleClientVertexAttribBindings(vertexes);
  GLctx.drawElements(mode, count, type, indices);
  GL.postDrawHandleClientVertexAttribBindings(count);
  if (!GLctx.currentElementArrayBufferBinding) {
    GLctx.bindBuffer(34963, null);
  }
}

var _glDrawElements = _emscripten_glDrawElements;

function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
  indices >>>= 0;
  GLctx.drawElementsInstanced(mode, count, type, indices, primcount);
}

var _glDrawElementsInstanced = _emscripten_glDrawElementsInstanced;

var _emscripten_glEnable = x0 => GLctx.enable(x0);

var _glEnable = _emscripten_glEnable;

var _emscripten_glEnableVertexAttribArray = index => {
  var cb = GL.currentContext.clientBuffers[index];
  cb.enabled = true;
  GLctx.enableVertexAttribArray(index);
};

var _glEnableVertexAttribArray = _emscripten_glEnableVertexAttribArray;

var _emscripten_glEndQuery = x0 => GLctx.endQuery(x0);

var _glEndQuery = _emscripten_glEndQuery;

var _emscripten_glEndTransformFeedback = () => GLctx.endTransformFeedback();

var _glEndTransformFeedback = _emscripten_glEndTransformFeedback;

function _emscripten_glFenceSync(condition, flags) {
  var sync = GLctx.fenceSync(condition, flags);
  if (sync) {
    var id = GL.getNewId(GL.syncs);
    sync.name = id;
    GL.syncs[id] = sync;
    return id;
  }
  return 0;
}

var _glFenceSync = _emscripten_glFenceSync;

var _emscripten_glFinish = () => GLctx.finish();

var _glFinish = _emscripten_glFinish;

var _emscripten_glFlush = () => GLctx.flush();

var _glFlush = _emscripten_glFlush;

var _emscripten_glFramebufferRenderbuffer = (target, attachment, renderbuffertarget, renderbuffer) => {
  GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
};

var _glFramebufferRenderbuffer = _emscripten_glFramebufferRenderbuffer;

var _emscripten_glFramebufferTexture2D = (target, attachment, textarget, texture, level) => {
  GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
};

var _glFramebufferTexture2D = _emscripten_glFramebufferTexture2D;

var _emscripten_glFramebufferTextureLayer = (target, attachment, texture, level, layer) => {
  GLctx.framebufferTextureLayer(target, attachment, GL.textures[texture], level, layer);
};

var _glFramebufferTextureLayer = _emscripten_glFramebufferTextureLayer;

var _emscripten_glFrontFace = x0 => GLctx.frontFace(x0);

var _glFrontFace = _emscripten_glFrontFace;

function _emscripten_glGenBuffers(n, buffers) {
  buffers >>>= 0;
  GL.genObject(n, buffers, "createBuffer", GL.buffers);
}

var _glGenBuffers = _emscripten_glGenBuffers;

function _emscripten_glGenFramebuffers(n, ids) {
  ids >>>= 0;
  GL.genObject(n, ids, "createFramebuffer", GL.framebuffers);
}

var _glGenFramebuffers = _emscripten_glGenFramebuffers;

function _emscripten_glGenQueries(n, ids) {
  ids >>>= 0;
  GL.genObject(n, ids, "createQuery", GL.queries);
}

var _glGenQueries = _emscripten_glGenQueries;

function _emscripten_glGenRenderbuffers(n, renderbuffers) {
  renderbuffers >>>= 0;
  GL.genObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
}

var _glGenRenderbuffers = _emscripten_glGenRenderbuffers;

function _emscripten_glGenSamplers(n, samplers) {
  samplers >>>= 0;
  GL.genObject(n, samplers, "createSampler", GL.samplers);
}

var _glGenSamplers = _emscripten_glGenSamplers;

function _emscripten_glGenTextures(n, textures) {
  textures >>>= 0;
  GL.genObject(n, textures, "createTexture", GL.textures);
}

var _glGenTextures = _emscripten_glGenTextures;

function _emscripten_glGenVertexArrays(n, arrays) {
  arrays >>>= 0;
  GL.genObject(n, arrays, "createVertexArray", GL.vaos);
}

var _glGenVertexArrays = _emscripten_glGenVertexArrays;

var _emscripten_glGenerateMipmap = x0 => GLctx.generateMipmap(x0);

var _glGenerateMipmap = _emscripten_glGenerateMipmap;

var __glGetActiveAttribOrUniform = (funcName, program, index, bufSize, length, size, type, name) => {
  program = GL.programs[program];
  var info = GLctx[funcName](program, index);
  if (info) {
    // If an error occurs, nothing will be written to length, size and type and name.
    var numBytesWrittenExclNull = name && stringToUTF8(info.name, name, bufSize);
    if (length) HEAP32[((length) >>> 2) >>> 0] = numBytesWrittenExclNull;
    if (size) HEAP32[((size) >>> 2) >>> 0] = info.size;
    if (type) HEAP32[((type) >>> 2) >>> 0] = info.type;
  }
};

function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
  length >>>= 0;
  size >>>= 0;
  type >>>= 0;
  name >>>= 0;
  return __glGetActiveAttribOrUniform("getActiveAttrib", program, index, bufSize, length, size, type, name);
}

var _glGetActiveAttrib = _emscripten_glGetActiveAttrib;

function _emscripten_glGetAttribLocation(program, name) {
  name >>>= 0;
  return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
}

var _glGetAttribLocation = _emscripten_glGetAttribLocation;

function _emscripten_glGetBufferSubData(target, offset, size, data) {
  offset >>>= 0;
  size >>>= 0;
  data >>>= 0;
  if (!data) {
    // GLES2 specification does not specify how to behave if data is a null pointer. Since calling this function does not make sense
    // if data == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  size && GLctx.getBufferSubData(target, offset, HEAPU8.subarray(data >>> 0, data + size >>> 0));
}

var _glGetBufferSubData = _emscripten_glGetBufferSubData;

var _emscripten_glGetError = () => {
  var error = GLctx.getError() || GL.lastError;
  GL.lastError = 0;
  return error;
};

var _glGetError = _emscripten_glGetError;

function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
  params >>>= 0;
  var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
  if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
    result = result.name | 0;
  }
  HEAP32[((params) >>> 2) >>> 0] = result;
}

var _glGetFramebufferAttachmentParameteriv = _emscripten_glGetFramebufferAttachmentParameteriv;

var writeI53ToI64 = (ptr, num) => {
  HEAPU32[((ptr) >>> 2) >>> 0] = num;
  var lower = HEAPU32[((ptr) >>> 2) >>> 0];
  HEAPU32[(((ptr) + (4)) >>> 2) >>> 0] = (num - lower) / 4294967296;
};

var webglGetExtensions = () => {
  var exts = getEmscriptenSupportedExtensions(GLctx);
  exts = exts.concat(exts.map(e => "GL_" + e));
  return exts;
};

var emscriptenWebGLGet = (name_, p, type) => {
  // Guard against user passing a null pointer.
  // Note that GLES2 spec does not say anything about how passing a null
  // pointer should be treated.  Testing on desktop core GL 3, the application
  // crashes on glGetIntegerv to a null pointer, but better to report an error
  // instead of doing anything random.
  if (!p) {
    GL.recordError(1281);
    return;
  }
  var ret = undefined;
  switch (name_) {
   // Handle a few trivial GLES values
    case 36346:
    // GL_SHADER_COMPILER
    ret = 1;
    break;

   case 36344:
    // GL_SHADER_BINARY_FORMATS
    if (type != 0 && type != 1) {
      GL.recordError(1280);
    }
    // Do not write anything to the out pointer, since no binary formats are
    // supported.
    return;

   case 34814:
   // GL_NUM_PROGRAM_BINARY_FORMATS
    case 36345:
    // GL_NUM_SHADER_BINARY_FORMATS
    ret = 0;
    break;

   case 34466:
    // GL_NUM_COMPRESSED_TEXTURE_FORMATS
    // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete
    // since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be
    // queried for length), so implement it ourselves to allow C++ GLES2
    // code to get the length.
    var formats = GLctx.getParameter(34467);
    ret = formats ? formats.length : 0;
    break;

   case 33309:
    // GL_NUM_EXTENSIONS
    if (GL.currentContext.version < 2) {
      // Calling GLES3/WebGL2 function with a GLES2/WebGL1 context
      GL.recordError(1282);
      return;
    }
    ret = webglGetExtensions().length;
    break;

   case 33307:
   // GL_MAJOR_VERSION
    case 33308:
    // GL_MINOR_VERSION
    if (GL.currentContext.version < 2) {
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;
    }
    ret = name_ == 33307 ? 3 : 0;
    // return version 3.0
    break;
  }
  if (ret === undefined) {
    var result = GLctx.getParameter(name_);
    switch (typeof result) {
     case "number":
      ret = result;
      break;

     case "boolean":
      ret = result ? 1 : 0;
      break;

     case "string":
      GL.recordError(1280);
      // GL_INVALID_ENUM
      return;

     case "object":
      if (result === null) {
        // null is a valid result for some (e.g., which buffer is bound -
        // perhaps nothing is bound), but otherwise can mean an invalid
        // name_, which we need to report as an error
        switch (name_) {
         case 34964:
         // ARRAY_BUFFER_BINDING
          case 35725:
         // CURRENT_PROGRAM
          case 34965:
         // ELEMENT_ARRAY_BUFFER_BINDING
          case 36006:
         // FRAMEBUFFER_BINDING or DRAW_FRAMEBUFFER_BINDING
          case 36007:
         // RENDERBUFFER_BINDING
          case 32873:
         // TEXTURE_BINDING_2D
          case 34229:
         // WebGL 2 GL_VERTEX_ARRAY_BINDING, or WebGL 1 extension OES_vertex_array_object GL_VERTEX_ARRAY_BINDING_OES
          case 36662:
         // COPY_READ_BUFFER_BINDING or COPY_READ_BUFFER
          case 36663:
         // COPY_WRITE_BUFFER_BINDING or COPY_WRITE_BUFFER
          case 35053:
         // PIXEL_PACK_BUFFER_BINDING
          case 35055:
         // PIXEL_UNPACK_BUFFER_BINDING
          case 36010:
         // READ_FRAMEBUFFER_BINDING
          case 35097:
         // SAMPLER_BINDING
          case 35869:
         // TEXTURE_BINDING_2D_ARRAY
          case 32874:
         // TEXTURE_BINDING_3D
          case 36389:
         // TRANSFORM_FEEDBACK_BINDING
          case 35983:
         // TRANSFORM_FEEDBACK_BUFFER_BINDING
          case 35368:
         // UNIFORM_BUFFER_BINDING
          case 34068:
          {
            // TEXTURE_BINDING_CUBE_MAP
            ret = 0;
            break;
          }

         default:
          {
            GL.recordError(1280);
            // GL_INVALID_ENUM
            return;
          }
        }
      } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
        for (var i = 0; i < result.length; ++i) {
          switch (type) {
           case 0:
            HEAP32[(((p) + (i * 4)) >>> 2) >>> 0] = result[i];
            break;

           case 2:
            HEAPF32[(((p) + (i * 4)) >>> 2) >>> 0] = result[i];
            break;

           case 4:
            HEAP8[(p) + (i) >>> 0] = result[i] ? 1 : 0;
            break;
          }
        }
        return;
      } else {
        try {
          ret = result.name | 0;
        } catch (e) {
          GL.recordError(1280);
          // GL_INVALID_ENUM
          err(`GL_INVALID_ENUM in glGet${type}v: Unknown object returned from WebGL getParameter(${name_})! (error: ${e})`);
          return;
        }
      }
      break;

     default:
      GL.recordError(1280);
      // GL_INVALID_ENUM
      err(`GL_INVALID_ENUM in glGet${type}v: Native code calling glGet${type}v(${name_}) and it returns ${result} of type ${typeof (result)}!`);
      return;
    }
  }
  switch (type) {
   case 1:
    writeI53ToI64(p, ret);
    break;

   case 0:
    HEAP32[((p) >>> 2) >>> 0] = ret;
    break;

   case 2:
    HEAPF32[((p) >>> 2) >>> 0] = ret;
    break;

   case 4:
    HEAP8[p >>> 0] = ret ? 1 : 0;
    break;
  }
};

function _emscripten_glGetIntegerv(name_, p) {
  p >>>= 0;
  return emscriptenWebGLGet(name_, p, 0);
}

var _glGetIntegerv = _emscripten_glGetIntegerv;

function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
  length >>>= 0;
  infoLog >>>= 0;
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) HEAP32[((length) >>> 2) >>> 0] = numBytesWrittenExclNull;
}

var _glGetProgramInfoLog = _emscripten_glGetProgramInfoLog;

function _emscripten_glGetProgramiv(program, pname, p) {
  p >>>= 0;
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (program >= GL.counter) {
    GL.recordError(1281);
    return;
  }
  program = GL.programs[program];
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getProgramInfoLog(program);
    if (log === null) log = "(unknown error)";
    HEAP32[((p) >>> 2) >>> 0] = log.length + 1;
  } else if (pname == 35719) {
    if (!program.maxUniformLength) {
      var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
      for (var i = 0; i < numActiveUniforms; ++i) {
        program.maxUniformLength = Math.max(program.maxUniformLength, GLctx.getActiveUniform(program, i).name.length + 1);
      }
    }
    HEAP32[((p) >>> 2) >>> 0] = program.maxUniformLength;
  } else if (pname == 35722) {
    if (!program.maxAttributeLength) {
      var numActiveAttributes = GLctx.getProgramParameter(program, 35721);
      for (var i = 0; i < numActiveAttributes; ++i) {
        program.maxAttributeLength = Math.max(program.maxAttributeLength, GLctx.getActiveAttrib(program, i).name.length + 1);
      }
    }
    HEAP32[((p) >>> 2) >>> 0] = program.maxAttributeLength;
  } else if (pname == 35381) {
    if (!program.maxUniformBlockNameLength) {
      var numActiveUniformBlocks = GLctx.getProgramParameter(program, 35382);
      for (var i = 0; i < numActiveUniformBlocks; ++i) {
        program.maxUniformBlockNameLength = Math.max(program.maxUniformBlockNameLength, GLctx.getActiveUniformBlockName(program, i).length + 1);
      }
    }
    HEAP32[((p) >>> 2) >>> 0] = program.maxUniformBlockNameLength;
  } else {
    HEAP32[((p) >>> 2) >>> 0] = GLctx.getProgramParameter(program, pname);
  }
}

var _glGetProgramiv = _emscripten_glGetProgramiv;

function _emscripten_glGetQueryObjectuiv(id, pname, params) {
  params >>>= 0;
  if (!params) {
    // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  var query = GL.queries[id];
  var param = GLctx.getQueryParameter(query, pname);
  var ret;
  if (typeof param == "boolean") {
    ret = param ? 1 : 0;
  } else {
    ret = param;
  }
  HEAP32[((params) >>> 2) >>> 0] = ret;
}

var _glGetQueryObjectuiv = _emscripten_glGetQueryObjectuiv;

function _emscripten_glGetSamplerParameteriv(sampler, pname, params) {
  params >>>= 0;
  if (!params) {
    // GLES3 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
    // if p == null, issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  HEAP32[((params) >>> 2) >>> 0] = GLctx.getSamplerParameter(GL.samplers[sampler], pname);
}

var _glGetSamplerParameteriv = _emscripten_glGetSamplerParameteriv;

function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
  length >>>= 0;
  infoLog >>>= 0;
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  var numBytesWrittenExclNull = (maxLength > 0 && infoLog) ? stringToUTF8(log, infoLog, maxLength) : 0;
  if (length) HEAP32[((length) >>> 2) >>> 0] = numBytesWrittenExclNull;
}

var _glGetShaderInfoLog = _emscripten_glGetShaderInfoLog;

function _emscripten_glGetShaderiv(shader, pname, p) {
  p >>>= 0;
  if (!p) {
    // GLES2 specification does not specify how to behave if p is a null
    // pointer. Since calling this function does not make sense if p == null,
    // issue a GL error to notify user about it.
    GL.recordError(1281);
    return;
  }
  if (pname == 35716) {
    // GL_INFO_LOG_LENGTH
    var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
    if (log === null) log = "(unknown error)";
    // The GLES2 specification says that if the shader has an empty info log,
    // a value of 0 is returned. Otherwise the log has a null char appended.
    // (An empty string is falsey, so we can just check that instead of
    // looking at log.length.)
    var logLength = log ? log.length + 1 : 0;
    HEAP32[((p) >>> 2) >>> 0] = logLength;
  } else if (pname == 35720) {
    // GL_SHADER_SOURCE_LENGTH
    var source = GLctx.getShaderSource(GL.shaders[shader]);
    // source may be a null, or the empty string, both of which are falsey
    // values that we report a 0 length for.
    var sourceLength = source ? source.length + 1 : 0;
    HEAP32[((p) >>> 2) >>> 0] = sourceLength;
  } else {
    HEAP32[((p) >>> 2) >>> 0] = GLctx.getShaderParameter(GL.shaders[shader], pname);
  }
}

var _glGetShaderiv = _emscripten_glGetShaderiv;

function _emscripten_glGetUniformBlockIndex(program, uniformBlockName) {
  uniformBlockName >>>= 0;
  return GLctx.getUniformBlockIndex(GL.programs[program], UTF8ToString(uniformBlockName));
}

var _glGetUniformBlockIndex = _emscripten_glGetUniformBlockIndex;

/** @suppress {checkTypes} */ var jstoi_q = str => parseInt(str);

/** @noinline */ var webglGetLeftBracePos = name => name.slice(-1) == "]" && name.lastIndexOf("[");

var webglPrepareUniformLocationsBeforeFirstUse = program => {
  var uniformLocsById = program.uniformLocsById, // Maps GLuint -> WebGLUniformLocation
  uniformSizeAndIdsByName = program.uniformSizeAndIdsByName, // Maps name -> [uniform array length, GLuint]
  i, j;
  // On the first time invocation of glGetUniformLocation on this shader program:
  // initialize cache data structures and discover which uniforms are arrays.
  if (!uniformLocsById) {
    // maps GLint integer locations to WebGLUniformLocations
    program.uniformLocsById = uniformLocsById = {};
    // maps integer locations back to uniform name strings, so that we can lazily fetch uniform array locations
    program.uniformArrayNamesById = {};
    var numActiveUniforms = GLctx.getProgramParameter(program, 35718);
    for (i = 0; i < numActiveUniforms; ++i) {
      var u = GLctx.getActiveUniform(program, i);
      var nm = u.name;
      var sz = u.size;
      var lb = webglGetLeftBracePos(nm);
      var arrayName = lb > 0 ? nm.slice(0, lb) : nm;
      // Assign a new location.
      var id = program.uniformIdCounter;
      program.uniformIdCounter += sz;
      // Eagerly get the location of the uniformArray[0] base element.
      // The remaining indices >0 will be left for lazy evaluation to
      // improve performance. Those may never be needed to fetch, if the
      // application fills arrays always in full starting from the first
      // element of the array.
      uniformSizeAndIdsByName[arrayName] = [ sz, id ];
      // Store placeholder integers in place that highlight that these
      // >0 index locations are array indices pending population.
      for (j = 0; j < sz; ++j) {
        uniformLocsById[id] = j;
        program.uniformArrayNamesById[id++] = arrayName;
      }
    }
  }
};

function _emscripten_glGetUniformLocation(program, name) {
  name >>>= 0;
  name = UTF8ToString(name);
  if (program = GL.programs[program]) {
    webglPrepareUniformLocationsBeforeFirstUse(program);
    var uniformLocsById = program.uniformLocsById;
    // Maps GLuint -> WebGLUniformLocation
    var arrayIndex = 0;
    var uniformBaseName = name;
    // Invariant: when populating integer IDs for uniform locations, we must
    // maintain the precondition that arrays reside in contiguous addresses,
    // i.e. for a 'vec4 colors[10];', colors[4] must be at location
    // colors[0]+4.  However, user might call glGetUniformLocation(program,
    // "colors") for an array, so we cannot discover based on the user input
    // arguments whether the uniform we are dealing with is an array. The only
    // way to discover which uniforms are arrays is to enumerate over all the
    // active uniforms in the program.
    var leftBrace = webglGetLeftBracePos(name);
    // If user passed an array accessor "[index]", parse the array index off the accessor.
    if (leftBrace > 0) {
      arrayIndex = jstoi_q(name.slice(leftBrace + 1)) >>> 0;
      // "index]", coerce parseInt(']') with >>>0 to treat "foo[]" as "foo[0]" and foo[-1] as unsigned out-of-bounds.
      uniformBaseName = name.slice(0, leftBrace);
    }
    // Have we cached the location of this uniform before?
    // A pair [array length, GLint of the uniform location]
    var sizeAndId = program.uniformSizeAndIdsByName[uniformBaseName];
    // If a uniform with this name exists, and if its index is within the
    // array limits (if it's even an array), query the WebGLlocation, or
    // return an existing cached location.
    if (sizeAndId && arrayIndex < sizeAndId[0]) {
      arrayIndex += sizeAndId[1];
      // Add the base location of the uniform to the array index offset.
      if ((uniformLocsById[arrayIndex] = uniformLocsById[arrayIndex] || GLctx.getUniformLocation(program, name))) {
        return arrayIndex;
      }
    }
  } else {
    // N.b. we are currently unable to distinguish between GL program IDs that
    // never existed vs GL program IDs that have been deleted, so report
    // GL_INVALID_VALUE in both cases.
    GL.recordError(1281);
  }
  return -1;
}

var _glGetUniformLocation = _emscripten_glGetUniformLocation;

var _emscripten_glLinkProgram = program => {
  program = GL.programs[program];
  GLctx.linkProgram(program);
  // Invalidate earlier computed uniform->ID mappings, those have now become stale
  program.uniformLocsById = 0;
  // Mark as null-like so that glGetUniformLocation() knows to populate this again.
  program.uniformSizeAndIdsByName = {};
};

var _glLinkProgram = _emscripten_glLinkProgram;

var _emscripten_glPixelStorei = (pname, param) => {
  if (pname == 3317) {
    GL.unpackAlignment = param;
  } else if (pname == 3314) {
    GL.unpackRowLength = param;
  }
  GLctx.pixelStorei(pname, param);
};

var _glPixelStorei = _emscripten_glPixelStorei;

var _emscripten_glPolygonOffset = (x0, x1) => GLctx.polygonOffset(x0, x1);

var _glPolygonOffset = _emscripten_glPolygonOffset;

var _emscripten_glReadBuffer = x0 => GLctx.readBuffer(x0);

var _glReadBuffer = _emscripten_glReadBuffer;

var computeUnpackAlignedImageSize = (width, height, sizePerPixel) => {
  function roundedToNextMultipleOf(x, y) {
    return (x + y - 1) & -y;
  }
  var plainRowSize = (GL.unpackRowLength || width) * sizePerPixel;
  var alignedRowSize = roundedToNextMultipleOf(plainRowSize, GL.unpackAlignment);
  return height * alignedRowSize;
};

var colorChannelsInGlTextureFormat = format => {
  // Micro-optimizations for size: map format to size by subtracting smallest
  // enum value (0x1902) from all values first.  Also omit the most common
  // size value (1) from the list, which is assumed by formats not on the
  // list.
  var colorChannels = {
    // 0x1902 /* GL_DEPTH_COMPONENT */ - 0x1902: 1,
    // 0x1906 /* GL_ALPHA */ - 0x1902: 1,
    5: 3,
    6: 4,
    // 0x1909 /* GL_LUMINANCE */ - 0x1902: 1,
    8: 2,
    29502: 3,
    29504: 4,
    // 0x1903 /* GL_RED */ - 0x1902: 1,
    26917: 2,
    26918: 2,
    // 0x8D94 /* GL_RED_INTEGER */ - 0x1902: 1,
    29846: 3,
    29847: 4
  };
  return colorChannels[format - 6402] || 1;
};

var heapObjectForWebGLType = type => {
  // Micro-optimization for size: Subtract lowest GL enum number (0x1400/* GL_BYTE */) from type to compare
  // smaller values for the heap, for shorter generated code size.
  // Also the type HEAPU16 is not tested for explicitly, but any unrecognized type will return out HEAPU16.
  // (since most types are HEAPU16)
  type -= 5120;
  if (type == 0) return HEAP8;
  if (type == 1) return HEAPU8;
  if (type == 2) return HEAP16;
  if (type == 4) return HEAP32;
  if (type == 6) return HEAPF32;
  if (type == 5 || type == 28922 || type == 28520 || type == 30779 || type == 30782) return HEAPU32;
  return HEAPU16;
};

var toTypedArrayIndex = (pointer, heap) => pointer >>> (31 - Math.clz32(heap.BYTES_PER_ELEMENT));

var emscriptenWebGLGetTexPixelData = (type, format, width, height, pixels) => {
  var heap = heapObjectForWebGLType(type);
  var sizePerPixel = colorChannelsInGlTextureFormat(format) * heap.BYTES_PER_ELEMENT;
  var bytes = computeUnpackAlignedImageSize(width, height, sizePerPixel);
  return heap.subarray(toTypedArrayIndex(pixels, heap) >>> 0, toTypedArrayIndex(pixels + bytes, heap) >>> 0);
};

function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
  pixels >>>= 0;
  if (true) {
    if (GLctx.currentPixelPackBufferBinding) {
      GLctx.readPixels(x, y, width, height, format, type, pixels);
      return;
    }
  }
  var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels);
  if (!pixelData) {
    GL.recordError(1280);
    return;
  }
  GLctx.readPixels(x, y, width, height, format, type, pixelData);
}

var _glReadPixels = _emscripten_glReadPixels;

var _emscripten_glRenderbufferStorageMultisample = (x0, x1, x2, x3, x4) => GLctx.renderbufferStorageMultisample(x0, x1, x2, x3, x4);

var _glRenderbufferStorageMultisample = _emscripten_glRenderbufferStorageMultisample;

var _emscripten_glSamplerParameterf = (sampler, pname, param) => {
  GLctx.samplerParameterf(GL.samplers[sampler], pname, param);
};

var _glSamplerParameterf = _emscripten_glSamplerParameterf;

var _emscripten_glSamplerParameteri = (sampler, pname, param) => {
  GLctx.samplerParameteri(GL.samplers[sampler], pname, param);
};

var _glSamplerParameteri = _emscripten_glSamplerParameteri;

var _emscripten_glScissor = (x0, x1, x2, x3) => GLctx.scissor(x0, x1, x2, x3);

var _glScissor = _emscripten_glScissor;

function _emscripten_glShaderSource(shader, count, string, length) {
  string >>>= 0;
  length >>>= 0;
  var source = GL.getSource(shader, count, string, length);
  GLctx.shaderSource(GL.shaders[shader], source);
}

var _glShaderSource = _emscripten_glShaderSource;

var _emscripten_glStencilFuncSeparate = (x0, x1, x2, x3) => GLctx.stencilFuncSeparate(x0, x1, x2, x3);

var _glStencilFuncSeparate = _emscripten_glStencilFuncSeparate;

var _emscripten_glStencilMaskSeparate = (x0, x1) => GLctx.stencilMaskSeparate(x0, x1);

var _glStencilMaskSeparate = _emscripten_glStencilMaskSeparate;

var _emscripten_glStencilOpSeparate = (x0, x1, x2, x3) => GLctx.stencilOpSeparate(x0, x1, x2, x3);

var _glStencilOpSeparate = _emscripten_glStencilOpSeparate;

var _emscripten_glTexParameteri = (x0, x1, x2) => GLctx.texParameteri(x0, x1, x2);

var _glTexParameteri = _emscripten_glTexParameteri;

var _emscripten_glTexStorage2D = (x0, x1, x2, x3, x4) => GLctx.texStorage2D(x0, x1, x2, x3, x4);

var _glTexStorage2D = _emscripten_glTexStorage2D;

var _emscripten_glTexStorage3D = (x0, x1, x2, x3, x4, x5) => GLctx.texStorage3D(x0, x1, x2, x3, x4, x5);

var _glTexStorage3D = _emscripten_glTexStorage3D;

function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
  pixels >>>= 0;
  if (true) {
    if (GLctx.currentPixelUnpackBufferBinding) {
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
      return;
    }
  }
  var pixelData = pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels) : null;
  GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}

var _glTexSubImage2D = _emscripten_glTexSubImage2D;

function _emscripten_glTexSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels) {
  pixels >>>= 0;
  if (GLctx.currentPixelUnpackBufferBinding) {
    GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixels);
  } else if (pixels) {
    var heap = heapObjectForWebGLType(type);
    var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height * depth, pixels);
    GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, pixelData);
  } else {
    GLctx.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, null);
  }
}

var _glTexSubImage3D = _emscripten_glTexSubImage3D;

function _emscripten_glTransformFeedbackVaryings(program, count, varyings, bufferMode) {
  varyings >>>= 0;
  program = GL.programs[program];
  var vars = [];
  for (var i = 0; i < count; i++) vars.push(UTF8ToString(HEAPU32[(((varyings) + (i * 4)) >>> 2) >>> 0]));
  GLctx.transformFeedbackVaryings(program, vars, bufferMode);
}

var _glTransformFeedbackVaryings = _emscripten_glTransformFeedbackVaryings;

var webglGetProgramUniformLocation = (program, location) => {
  if (program) {
    var webglLoc = program.uniformLocsById[location];
    // program.uniformLocsById[location] stores either an integer, or a
    // WebGLUniformLocation.
    // If an integer, we have not yet bound the location, so do it now. The
    // integer value specifies the array index we should bind to.
    if (typeof webglLoc == "number") {
      program.uniformLocsById[location] = webglLoc = GLctx.getUniformLocation(program, program.uniformArrayNamesById[location] + (webglLoc > 0 ? `[${webglLoc}]` : ""));
    }
    // Else an already cached WebGLUniformLocation, return it.
    return webglLoc;
  } else {
    GL.recordError(1282);
  }
};

var webglGetUniformLocation = location => webglGetProgramUniformLocation(GLctx.currentProgram, location);

var _emscripten_glUniform1f = (location, v0) => {
  GLctx.uniform1f(webglGetUniformLocation(location), v0);
};

var _glUniform1f = _emscripten_glUniform1f;

var _emscripten_glUniform1i = (location, v0) => {
  GLctx.uniform1i(webglGetUniformLocation(location), v0);
};

var _glUniform1i = _emscripten_glUniform1i;

var _emscripten_glUniform3ui = (location, v0, v1, v2) => {
  GLctx.uniform3ui(webglGetUniformLocation(location), v0, v1, v2);
};

var _glUniform3ui = _emscripten_glUniform3ui;

var miniTempWebGLFloatBuffers = [];

function _emscripten_glUniform4fv(location, count, value) {
  value >>>= 0;
  if (count <= 72) {
    // avoid allocation when uploading few enough uniforms
    var view = miniTempWebGLFloatBuffers[4 * count];
    // hoist the heap out of the loop for size and for pthreads+growth.
    var heap = HEAPF32;
    value = ((value) >>> 2);
    count *= 4;
    for (var i = 0; i < count; i += 4) {
      var dst = value + i;
      view[i] = heap[dst >>> 0];
      view[i + 1] = heap[dst + 1 >>> 0];
      view[i + 2] = heap[dst + 2 >>> 0];
      view[i + 3] = heap[dst + 3 >>> 0];
    }
  } else {
    var view = HEAPF32.subarray((((value) >>> 2)) >>> 0, ((value + count * 16) >>> 2) >>> 0);
  }
  GLctx.uniform4fv(webglGetUniformLocation(location), view);
}

var _glUniform4fv = _emscripten_glUniform4fv;

var _emscripten_glUniformBlockBinding = (program, uniformBlockIndex, uniformBlockBinding) => {
  program = GL.programs[program];
  GLctx.uniformBlockBinding(program, uniformBlockIndex, uniformBlockBinding);
};

var _glUniformBlockBinding = _emscripten_glUniformBlockBinding;

var _emscripten_glUseProgram = program => {
  program = GL.programs[program];
  GLctx.useProgram(program);
  // Record the currently active program so that we can access the uniform
  // mapping table of that program.
  GLctx.currentProgram = program;
};

var _glUseProgram = _emscripten_glUseProgram;

var _emscripten_glVertexAttrib4f = (x0, x1, x2, x3, x4) => GLctx.vertexAttrib4f(x0, x1, x2, x3, x4);

var _glVertexAttrib4f = _emscripten_glVertexAttrib4f;

var _emscripten_glVertexAttribDivisor = (index, divisor) => {
  GLctx.vertexAttribDivisor(index, divisor);
};

var _glVertexAttribDivisor = _emscripten_glVertexAttribDivisor;

function _emscripten_glVertexAttribIPointer(index, size, type, stride, ptr) {
  ptr >>>= 0;
  var cb = GL.currentContext.clientBuffers[index];
  if (!GLctx.currentArrayBufferBinding) {
    cb.size = size;
    cb.type = type;
    cb.normalized = false;
    cb.stride = stride;
    cb.ptr = ptr;
    cb.clientside = true;
    cb.vertexAttribPointerAdaptor = /** @this {WebGLRenderingContext} */ function(index, size, type, normalized, stride, ptr) {
      this.vertexAttribIPointer(index, size, type, stride, ptr);
    };
    return;
  }
  cb.clientside = false;
  GLctx.vertexAttribIPointer(index, size, type, stride, ptr);
}

var _glVertexAttribIPointer = _emscripten_glVertexAttribIPointer;

function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
  ptr >>>= 0;
  var cb = GL.currentContext.clientBuffers[index];
  if (!GLctx.currentArrayBufferBinding) {
    cb.size = size;
    cb.type = type;
    cb.normalized = normalized;
    cb.stride = stride;
    cb.ptr = ptr;
    cb.clientside = true;
    cb.vertexAttribPointerAdaptor = /** @this {WebGLRenderingContext} */ function(index, size, type, normalized, stride, ptr) {
      this.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    };
    return;
  }
  cb.clientside = false;
  GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}

var _glVertexAttribPointer = _emscripten_glVertexAttribPointer;

var _emscripten_glViewport = (x0, x1, x2, x3) => GLctx.viewport(x0, x1, x2, x3);

var _glViewport = _emscripten_glViewport;

var RXCA = {
  node: null,
  channels: 2
};

function _rxc_js_audio_init(rate, channels) {
  RXCA.node = Module["audioNode"] || null;
  RXCA.channels = channels;
  const ctx = Module["audioContext"];
  if (ctx && ctx.sampleRate !== rate) console.warn(`[audio] game renders at ${rate} Hz, AudioContext runs at ${ctx.sampleRate} Hz`);
  return RXCA.node ? 1 : 0;
}

function _rxc_js_audio_submit(ptr, frames) {
  ptr >>>= 0;
  if (!RXCA.node) return;
  const o = ptr >>> 2;
  // (unsigned: the staging buffer sits above the guest's 2 GB, '>> 2' would go negative)
  const buf = HEAPF32.slice(o, o + frames * RXCA.channels);
  if (Module.__arec) Module.__arec.push(buf.slice());
  // debug capture (tools: set rexcomp.__arec = [] from the console)
  RXCA.node.port.postMessage(buf, [ buf.buffer ]);
}

function _rxc_js_canvas_note(w, h) {
  Module["canvasW"] = w;
  Module["canvasH"] = h;
}

function _rxc_js_canvas_size(wp, hp) {
  wp >>>= 0;
  hp >>>= 0;
  const c = document.getElementById("canvas");
  HEAP32[wp >>> 2 >>> 0] = c.width;
  HEAP32[hp >>> 2 >>> 0] = c.height;
}

function _rxc_js_cursor(v) {
  const c = document.getElementById("canvas");
  if (c) c.style.cursor = v ? "default" : "none";
}

var RXC = {
  cnt: {
    reads: 0,
    fetches: 0,
    fetchKB: 0,
    fetchMs: 0,
    switches: 0,
    sleeps: 0,
    sleepMs: 0,
    yieldMs: 0
  },
  tot: {
    fetches: 0,
    fetchKB: 0,
    fetchMs: 0
  },
  pausedMs: 0,
  manifest: null,
  dirs: null,
  files: [],
  nextFd: 3,
  cache: new Map,
  cacheBytes: 0,
  // on-demand block cache cap: keep this small so the port only holds what the
  // game recently touched instead of the whole data set (override with ?cachemb=N)
  cacheLimit: (() => {
    const mb = +(new URLSearchParams(location.search).get("cachemb"));
    return (mb > 0 ? mb : 64) * 1048576;
  })(),
  overlay: new Map,
  status: s => {
    if (Module["onStatus"]) Module["onStatus"](s); else {
      const el = document.getElementById("status");
      if (el) el.textContent = s;
    }
  },
  log: s => {
    console.log(s);
    if (globalThis.__rxcSink) globalThis.__rxcSink.push(s);
    const el = document.getElementById("log");
    if (el) {
      el.textContent += s + "\n";
      if (el.textContent.length > 2e5) el.textContent = el.textContent.slice(-1e5);
      el.scrollTop = el.scrollHeight;
    }
  },
  noteProgram: k => {
    if (!RXC.progSeen) {
      RXC.progSeen = new Set;
      RXC.progList = [];
      globalThis.__rxcPrograms = RXC.progList;
    }
    if (!RXC.progSeen.has(k)) {
      RXC.progSeen.add(k);
      RXC.progList.push(k);
    }
  },
  norm: p => p.replace(/\//g, "\\").toLowerCase(),
  rel: p => {
    p = RXC.norm(p);
    if (p === "c:\\game" || p === "c:\\game\\") return "";
    return p.startsWith("c:\\game\\") ? p.slice(8) : null;
  },
  base: "",
  chunked: false,
  idb: null,
  persistable: key => (key.startsWith("c:\\users\\") || (Module["persistSave"] === true && key.startsWith("c:\\game\\save\\"))) && !key.includes("\\crashreportclient\\") && !key.endsWith(".log"),
  async loadOverlay() {
    if (typeof indexedDB === "undefined") return;
    try {
      RXC.idb = await new Promise((res, rej) => {
        const r = indexedDB.open("rexcomp", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("files");
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      });
      const tx = RXC.idb.transaction("files", "readonly"), req = tx.objectStore("files").openCursor();
      let n = 0;
      await new Promise(done => {
        req.onsuccess = () => {
          const c = req.result;
          if (!c) return done();
          RXC.overlay.set(c.key, {
            data: new Uint8Array(c.value),
            size: c.value.byteLength
          });
          n++;
          c.continue();
        };
        req.onerror = done;
      });
      if (n) console.log("[web] restored " + n + " saved files from IndexedDB");
    } catch (e) {
      console.warn("[web] IndexedDB unavailable, saves will not persist:", e);
      RXC.idb = null;
    }
  },
  keepDirs(key) {
    if (!RXC.mkdirs) RXC.mkdirs = new Set;
    for (let i = key.lastIndexOf("\\"); i > 2; i = key.lastIndexOf("\\", i - 1)) RXC.mkdirs.add(key.slice(0, i));
    RXC.fsVer++;
  },
  fsVer: 0,
  listCache: new Map,
  capOk() {
    return (RXC.tlate || 0) < 5;
  },
  ioT: 0,
  ioB: 0,
  ioHot: 0,
  noteIO(n) {
    const t = performance.now();
    if (t - RXC.ioT > 250) {
      RXC.ioT = t;
      RXC.ioB = 0;
    }
    RXC.ioB += n;
    if (RXC.ioB > (1 << 20)) RXC.ioHot = t + 500;
  },
  statSync(pathp, sizep, isdirp) {
    const path = UTF8ToString(pathp), key = RXC.norm(path), rel = RXC.rel(path);
    const ov = RXC.overlay.get(key);
    if (ov) {
      HEAPF64[sizep >>> 3 >>> 0] = ov.size;
      HEAP32[isdirp >>> 2 >>> 0] = 0;
      return 1;
    }
    if (RXC.dead && RXC.dead.has(key)) return 0;
    // deleted shipped file: the manifest copy stays hidden
    if (rel !== null) {
      if (rel in RXC.manifest) {
        HEAPF64[sizep >>> 3 >>> 0] = RXC.manifest[rel];
        HEAP32[isdirp >>> 2 >>> 0] = 0;
        return 1;
      }
      if (rel === "" || RXC.dirs.has(rel)) {
        HEAPF64[sizep >>> 3 >>> 0] = 0;
        HEAP32[isdirp >>> 2 >>> 0] = 1;
        return 1;
      }
    }
    for (const k of RXC.overlay.keys()) if (k.startsWith(key + "\\")) {
      HEAPF64[sizep >>> 3 >>> 0] = 0;
      HEAP32[isdirp >>> 2 >>> 0] = 1;
      return 1;
    }
    if (RXC.mkdirs && RXC.mkdirs.has(key)) {
      HEAPF64[sizep >>> 3 >>> 0] = 0;
      HEAP32[isdirp >>> 2 >>> 0] = 1;
      return 1;
    }
    if (/^c:(\\|\\users(\\player(\\appdata(\\local|\\roaming)?|\\documents)?)?|\\windows|\\programdata)?$/.test(key)) {
      HEAPF64[sizep >>> 3 >>> 0] = 0;
      HEAP32[isdirp >>> 2 >>> 0] = 1;
      return 1;
    }
    return 0;
  },
  listSync(dirp) {
    const dir = UTF8ToString(dirp), key = RXC.norm(dir);
    let c = RXC.listCache.get(key);
    if (!c || c.ver !== RXC.fsVer || c.osize !== RXC.overlay.size) {
      const rel = RXC.rel(dir), names = new Set;
      if (rel !== null && RXC.dirs.has(rel)) for (const n of RXC.dirs.get(rel)) names.add(n);
      if (key === "c:" || key === "c:\\") {
        names.add("game");
        names.add("users");
      }
      for (const k of RXC.overlay.keys()) if (k.startsWith(key + "\\")) {
        const rest = k.slice(key.length + 1);
        names.add(rest.split("\\")[0]);
      }
      if (RXC.mkdirs) for (const k of RXC.mkdirs) if (k.startsWith(key + "\\")) {
        const rest = k.slice(key.length + 1);
        names.add(rest.split("\\")[0]);
      }
      if (RXC.dead && RXC.dead.size) for (const n of [ ...names ]) {
        const fk = key + "\\" + n;
        if (RXC.dead.has(fk) && !RXC.overlay.has(fk)) names.delete(n);
      }
      const enc = names.size ? (new TextEncoder).encode([ ...names ].join("\n") + "\0") : null;
      c = {
        ver: RXC.fsVer,
        osize: RXC.overlay.size,
        enc
      };
      RXC.listCache.set(key, c);
    }
    if (!c.enc) return 0;
    const p = _malloc(c.enc.length) >>> 0;
    HEAPU8.set(c.enc, p >>> 0);
    return p;
  },
  persist(key) {
    if (!RXC.idb || !RXC.persistable(key)) return;
    try {
      const ov = RXC.overlay.get(key), st = RXC.idb.transaction("files", "readwrite").objectStore("files");
      if (ov) st.put(ov.data.slice(0, ov.size).buffer, key); else st.delete(key);
    } catch (e) {
      console.warn("[web] persist failed", key, e);
    }
  },
  async ensureManifest() {
    if (RXC.manifest) return;
    await RXC.loadOverlay();
    RXC.base = Module["gameBase"] || "";
    if (RXC.base && !RXC.base.endsWith("/")) RXC.base += "/";
    // manifest.json: {path: size} for Range requests (tools/serve_web.py), or {chunk, files} from `build.py pack`: every
    // file split into game/<path>.<n> chunks of `chunk` bytes, for plain static servers and CDNs (no Range support)
    let m = null;
    for (let attempt = 0; !m; attempt++) {
      try {
        const r = await fetch(RXC.base + "manifest.json", {
          cache: "no-cache"
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        m = await r.json();
      } catch (e) {
        if (attempt >= 5) {
          RXC.status("Cannot load the game data manifest: " + e);
          throw e;
        }
        await new Promise(res => setTimeout(res, 500 * (attempt + 1)));
      }
    }
    // vers: a version per file (build.py pack: the source's mtime) in its chunk URLs, so a re-packed file (the ZCTT
    // archives) is never assembled from chunks the browser cached for the previous version; the manifest is revalidated
    if (m.files) {
      RXC.chunked = true;
      RXC.BLOCK = m.chunk;
      RXC.vers = m.vers || null;
      m = m.files;
    }
    RXC.manifest = m;
    RXC.loadPreload();
    globalThis.__rxcAccess = RXC.access;
    // recorded block order (tools/record_preload.py)
    // debugging: read a file the game wrote, e.g. __rxcReadFile('C:/Users/Player/AppData/Local/HelloNeighbor/Saved/Logs/HelloNeighbor.log')
    globalThis.__rxcReadFile = path => {
      const ov = RXC.overlay.get(RXC.norm(path));
      return ov ? (new TextDecoder).decode(ov.data.subarray(0, ov.size)) : null;
    };
    await RXC.loadPrograms();
    // small; needed before the first shaders are created
    await RXC.loadPatches();
    // patched game assets (tools/patch_assets.py) shadow the originals
    RXC.dirs = new Map;
    RXC.dirs.set("", new Set);
    for (const k of Object.keys(m)) RXC.dirs.get("").add(k.split("\\")[0]);
    for (const k of Object.keys(m)) {
      let d = k;
      while (true) {
        const i = d.lastIndexOf("\\");
        if (i < 0) break;
        const parent = d.slice(0, i), name = d.slice(i + 1);
        if (!RXC.dirs.has(parent)) RXC.dirs.set(parent, new Set);
        RXC.dirs.get(parent).add(name);
        d = parent;
        if (RXC.dirs.has(d) && RXC.dirs.get(d).size > 1) break;
      }
    }
  },
  hop(f) {
    if (!RXC.hopq) {
      RXC.hopq = [];
      RXC.hopc = new MessageChannel;
      RXC.hopc.port1.onmessage = () => {
        const q = RXC.hopq;
        RXC.hopq = [];
        for (const g of q) g();
      };
    }
    RXC.hopq.push(f);
    if (RXC.hopq.length === 1) RXC.hopc.port2.postMessage(0);
  },
  BLOCK: 1048576,
  fetchBlock(rel, b) {
    const key = rel + "#" + b, v = RXC.cache.get(key);
    if (v) {
      if (!(v instanceof Promise)) {
        RXC.cache.delete(key);
        RXC.cache.set(key, v);
      }
      return v;
    }
    const size = RXC.manifest[rel], start = b * RXC.BLOCK, end = Math.min(size, start + RXC.BLOCK) - 1;
    const url = RXC.base + "game/" + rel.split("\\").map(encodeURIComponent).join("/") + (RXC.chunked ? "." + b : "") + (RXC.vers && RXC.vers[rel] ? "?v=" + RXC.vers[rel] : "");
    RXC.cnt.fetches++;
    RXC.cnt.fetchKB += (end - start + 1) >> 10;
    const p = (async () => {
      // a failed read would kill the guest thread: retry forever with backoff. Chrome's HTTP cache can reject a Range
      // request that races another one for the same file (net::ERR_CACHE_OPERATION_NOT_SUPPORTED), so retries bypass it.
      let r, blk;
      for (let attempt = 0; ;attempt++) {
        try {
          r = await fetch(url, RXC.chunked ? {
            cache: attempt ? "no-store" : "default"
          } : {
            headers: {
              Range: `bytes=${start}-${end}`
            },
            cache: attempt ? "no-store" : "default"
          });
          if (!r.ok && r.status !== 206) throw new Error("HTTP " + r.status);
          blk = new Uint8Array(await r.arrayBuffer());
          break;
        } catch (e) {
          if (attempt === 0 || attempt % 10 === 9) console.warn(`[web] fetch ${rel} block ${b} failed (${e && e.message || e}), retrying`);
          await new Promise(res => setTimeout(res, Math.min(2e3, 50 * (1 << Math.min(attempt, 6)))));
        }
      }
      if (!RXC.chunked && r.status === 200 && blk.length > end - start + 1) blk = blk.subarray(start, end + 1);
      // server ignored Range
      RXC.cache.set(key, blk);
      RXC.cacheBytes += blk.length;
      RXC.tot.fetches++;
      RXC.tot.fetchKB += blk.length >> 10;
      if (RXC.cacheBytes > RXC.cacheLimit) RXC.evict();
      return blk;
    })();
    RXC.cache.set(key, p);
    p.catch(() => RXC.cache.delete(key));
    return p;
  },
  evict(keep) {
    for (const [k, v] of RXC.cache) {
      if (v instanceof Promise) continue;
      RXC.cache.delete(k);
      RXC.cacheBytes -= v.length;
      if (RXC.cacheBytes < RXC.cacheLimit * (keep || .7)) break;
    }
  },
  pre: null,
  preIdx: null,
  pi: 0,
  consumed: 0,
  inflight: 0,
  seen: new Set,
  access: [],
  note(rel, b) {
    const key = rel + "#" + b;
    if (!RXC.seen.has(key)) {
      RXC.seen.add(key);
      RXC.access.push(key);
    }
    if (RXC.preIdx) {
      const i = RXC.preIdx.get(key);
      if (i !== undefined && i > RXC.consumed) {
        RXC.consumed = i;
        RXC.pump();
      }
    }
  },
  pump() {
    while (RXC.pre && RXC.inflight < 12 && RXC.pi < RXC.pre.length && RXC.pi <= RXC.consumed + 320) {
      const key = RXC.pre[RXC.pi++], h = key.lastIndexOf("#"), rel = key.slice(0, h), b = +key.slice(h + 1);
      if (!(rel in RXC.manifest) || RXC.cache.has(key)) continue;
      RXC.inflight++;
      RXC.fetchBlock(rel, b).catch(() => {}).finally(() => {
        RXC.inflight--;
        RXC.pump();
      });
    }
  },
  async loadPrograms() {
    if (new URLSearchParams(location.search).has("noprelink")) return;
    try {
      const r = await fetch("programs.json");
      if (!r.ok) return;
      const list = await r.json();
      RXC.pairs = new Map;
      const add = (k, v) => {
        let a = RXC.pairs.get(k);
        if (!a) RXC.pairs.set(k, a = []);
        a.push(v);
      };
      for (const e of list) {
        const [v, p] = e.split(":");
        add("v" + v, p);
        if (p !== "-") add("p" + p, v);
      }
      console.log("[web] pre-link list: " + list.length + " programs");
    } catch (e) {}
  },
  async loadPatches() {
    try {
      const r = await fetch("patches.json", {
        cache: "no-store"
      });
      if (!r.ok) return;
      const list = await r.json();
      await Promise.all(Object.entries(list).map(async ([rel, url]) => {
        const f = await fetch(url, {
          cache: "no-store"
        });
        if (!f.ok) throw new Error(url + " " + f.status);
        const d = new Uint8Array(await f.arrayBuffer());
        RXC.overlay.set("c:\\game\\" + rel, {
          data: d,
          size: d.length
        });
      }));
      console.log("[web] " + Object.keys(list).length + " patched game file(s)");
    } catch (e) {
      console.warn("[web] patches unavailable:", e);
    }
  },
  async loadPreload() {
    // lazy by default: blocks are fetched on demand via readRange(); the recorded
    // prefetch list only runs when explicitly requested with ?preload
    if (!new URLSearchParams(location.search).has("preload")) return;
    try {
      const r = await fetch("preload.json");
      if (!r.ok) return;
      RXC.pre = await r.json();
      RXC.preIdx = new Map(RXC.pre.map((k, i) => [ k, i ]));
      console.log("[web] prefetch list: " + RXC.pre.length + " blocks");
      RXC.pump();
    } catch (e) {}
  },
  readRange(rel, off, n) {
    const size = RXC.manifest[rel];
    if (off >= size) return new Uint8Array(0);
    if (off + n > size) n = size - off;
    const B = RXC.BLOCK, b0 = Math.floor(off / B), b1 = Math.floor((off + n - 1) / B);
    const parts = [];
    let pending = false;
    for (let b = b0; b <= b1; b++) {
      const v = RXC.fetchBlock(rel, b);
      if (v instanceof Promise) pending = true;
      parts.push(v);
      RXC.note(rel, b);
    }
    // sequential-read lookahead: when the game streams through a file (area loads,
    // big assets), the next blocks are usually read within a frame or two — kick
    // them off now so the network latency overlaps with guest processing instead
    // of stalling the frame on each block boundary
    const nBlocks = Math.ceil(size / B);
    for (let b = b1 + 1; b <= Math.min(b1 + 2, nBlocks - 1); b++) {
      RXC.note(rel, b);
      RXC.fetchBlock(rel, b).catch(() => {});
    }
    const assemble = blks => {
      if (b0 === b1) return blks[0].subarray(off - b0 * B, off - b0 * B + n);
      let out;
      try {
        out = new Uint8Array(n);
      } catch (e) {
        RXC.evict(.3);
        out = new Uint8Array(n);
      }
      let done = 0;
      for (let i = 0; i < blks.length && done < n; i++) {
        const s = i === 0 ? off - b0 * B : 0, take = Math.min(n - done, blks[i].length - s);
        if (take <= 0) break;
        out.set(blks[i].subarray(s, s + take), done);
        done += take;
      }
      return done === n ? out : out.subarray(0, done);
    };
    if (!pending) return assemble(parts);
    const tf = performance.now();
    return Promise.all(parts).then(blks => {
      const dt = performance.now() - tf;
      RXC.cnt.fetchMs += dt;
      RXC.tot.fetchMs += dt;
      return assemble(blks);
    });
  },
  // like readRange, but assembles straight into the guest heap at bufp — skips
  // the intermediate Uint8Array allocation + full copy per multi-block read
  readRangeInto(rel, off, n, bufp) {
    const size = RXC.manifest[rel];
    if (off >= size) return 0;
    if (off + n > size) n = size - off;
    const B = RXC.BLOCK, b0 = Math.floor(off / B), b1 = Math.floor((off + n - 1) / B);
    const parts = [];
    let pending = false;
    for (let b = b0; b <= b1; b++) {
      const v = RXC.fetchBlock(rel, b);
      if (v instanceof Promise) pending = true;
      parts.push(v);
      RXC.note(rel, b);
    }
    const nBlocks = Math.ceil(size / B);
    for (let b = b1 + 1; b <= Math.min(b1 + 2, nBlocks - 1); b++) {
      RXC.note(rel, b);
      RXC.fetchBlock(rel, b).catch(() => {});
    }
    const assemble = blks => {
      let done = 0;
      for (let i = 0; i < blks.length && done < n; i++) {
        const s = i === 0 ? off - b0 * B : 0, take = Math.min(n - done, blks[i].length - s);
        if (take <= 0) break;
        HEAPU8.set(blks[i].subarray(s, s + take), bufp + done);
        done += take;
      }
      return done;
    };
    if (!pending) return assemble(parts);
    const tf = performance.now();
    return Promise.all(parts).then(blks => {
      const dt = performance.now() - tf;
      RXC.cnt.fetchMs += dt;
      RXC.tot.fetchMs += dt;
      return assemble(blks);
    });
  }
};

function _rxc_js_file_close(fd) {
  const f = RXC.files[fd];
  if (f && f.dirty) RXC.persist(f.key);
  delete RXC.files[fd];
  return 1;
}

var _rxc_js_file_list = function(dirp) {
  dirp >>>= 0;
  RXC.cnt.lists = (RXC.cnt.lists || 0) + 1;
  RXC.tot.lists = (RXC.tot.lists || 0) + 1;
  if (!RXC.dirs) return RXC.ensureManifest().then(() => RXC.listSync(dirp));
  return RXC.listSync(dirp);
};

_rxc_js_file_list.isAsync = true;

function _rxc_js_file_mkdir(pathp) {
  if (!RXC.mkdirs) RXC.mkdirs = new Set;
  const k = RXC.norm(UTF8ToString(pathp >>> 0));
  if (RXC.mkdirs.has(k)) return 0;
  RXC.mkdirs.add(k);
  RXC.fsVer++;
  return 1;
}

var _rxc_js_file_open = function(pathp, write, create, truncate) {
  pathp >>>= 0;
  const open = () => {
    const path = UTF8ToString(pathp), key = RXC.norm(path), rel = RXC.rel(path);
    let ov = RXC.overlay.get(key);
    const inGame = rel !== null && rel in RXC.manifest && !(RXC.dead && RXC.dead.has(key));
    if (!ov && !inGame && !create) return -1;
    if (truncate) {
      if (ov) {
        ov.data = new Uint8Array(0);
        ov.size = 0;
      } else if (inGame) {
        ov = {
          data: new Uint8Array(0),
          size: 0
        };
        RXC.overlay.set(key, ov);
      }
    }
    const finish = () => {
      const fd = RXC.nextFd++;
      RXC.files[fd] = {
        key,
        rel: inGame ? rel : null,
        ov
      };
      return fd;
    };
    if (!ov && (create || write)) {
      ov = {
        data: new Uint8Array(0),
        size: 0
      };
      if (inGame && !truncate) return (async () => {
        ov.data = (await RXC.readRange(rel, 0, RXC.manifest[rel])).slice();
        ov.size = ov.data.length;
        RXC.overlay.set(key, ov);
        return finish();
      })();
      RXC.overlay.set(key, ov);
    }
    return finish();
  };
  if (!RXC.dirs) return RXC.ensureManifest().then(open);
  return open();
};

_rxc_js_file_open.isAsync = true;

function _rxc_js_file_read_nb(fd, bufp, off, n, donep, resultp) {
  bufp >>>= 0;
  donep >>>= 0;
  resultp >>>= 0;
  const f = RXC.files[fd];
  if (!f) return -1;
  RXC.cnt.reads++;
  RXC.noteIO(n);
  if (f.ov) {
    const end = Math.min(f.ov.size, off + n);
    if (off >= end) return 0;
    HEAPU8.set(f.ov.data.subarray(off, end), bufp >>> 0);
    return end - off;
  }
  const d = RXC.readRangeInto(f.rel, off, n, bufp >>> 0);
  if (!(d instanceof Promise)) return d;
  d.then(len => {
    HEAP32[resultp >>> 2 >>> 0] = len;
    HEAP32[donep >>> 2 >>> 0] = 1;
  }, () => {
    HEAP32[resultp >>> 2 >>> 0] = -1;
    HEAP32[donep >>> 2 >>> 0] = 1;
  });
  return -2;
}

function _rxc_js_file_rename(ap, bp) {
  const a = RXC.norm(UTF8ToString(ap >>> 0)), b = RXC.norm(UTF8ToString(bp >>> 0));
  const ov = RXC.overlay.get(a);
  if (!ov) return 0;
  RXC.keepDirs(a);
  RXC.overlay.delete(a);
  RXC.overlay.set(b, ov);
  RXC.persist(a);
  RXC.persist(b);
  return 1;
}

var _rxc_js_file_stat = function(pathp, sizep, isdirp) {
  pathp >>>= 0;
  sizep >>>= 0;
  isdirp >>>= 0;
  RXC.cnt.stats = (RXC.cnt.stats || 0) + 1;
  RXC.tot.stats = (RXC.tot.stats || 0) + 1;
  if (!RXC.dirs) return RXC.ensureManifest().then(() => RXC.statSync(pathp, sizep, isdirp));
  return RXC.statSync(pathp, sizep, isdirp);
};

_rxc_js_file_stat.isAsync = true;

function _rxc_js_file_truncate(fd, size) {
  const f = RXC.files[fd];
  if (!f || !f.ov) return 0;
  f.ov.size = size;
  f.dirty = true;
  return 1;
}

function _rxc_js_file_unlink(pathp) {
  const path = UTF8ToString(pathp >>> 0), k = RXC.norm(path);
  RXC.keepDirs(k);
  const had = RXC.overlay.delete(k);
  let ok = had ? 1 : 0;
  const rel = RXC.rel(path);
  if (!had && rel !== null && RXC.manifest && rel in RXC.manifest) {
    (RXC.dead || (RXC.dead = new Set)).add(k);
    ok = 1;
  }
  if (ok) RXC.persist(k);
  return ok;
}

function _rxc_js_file_write(fd, bufp, off, n) {
  bufp >>>= 0;
  const f = RXC.files[fd];
  if (!f) return -1;
  f.dirty = true;
  if (!f.ov) {
    f.ov = {
      data: new Uint8Array(0),
      size: 0
    };
    RXC.overlay.set(f.key, f.ov);
  }
  const need = off + n;
  if (need > f.ov.data.length) {
    const nd = new Uint8Array(Math.max(need, f.ov.data.length * 2, 4096));
    nd.set(f.ov.data);
    f.ov.data = nd;
  }
  f.ov.data.set(HEAPU8.subarray(bufp >>> 0, bufp + n >>> 0), off);
  if (need > f.ov.size) f.ov.size = need;
  return n;
}

function _rxc_js_frame_due() {
  const st = RXC.stats, mode = RXC.yieldMode || Module["yieldMode"] || "mc", now = performance.now();
  if (!st || mode !== "cap" || !RXC.framePending || now <= RXC.ioHot || (document.hidden && !RXC.bgRun) || Module["capRunOthers"] === false || !RXC.capOk()) return -1;
  const iv = 1e3 / (+Module["fpsCap"] || 60);
  if (!RXC.capDue) {
    let due = (st.due || now) + iv;
    if (now > due + iv / 2) due = now;
    RXC.capDue = due;
  }
  return RXC.capDue - now;
}

var RXCG = {
  w: null,
  seq: 0,
  qseq: 0,
  done: 0,
  links: 0,
  combos: 0,
  rbDone: 0,
  rbSet: new Set,
  waiters: [],
  fif: 2,
  dead: false,
  qp: 0,
  qcap: 0,
  wake() {
    if (!RXCG.waiters.length) return;
    const keep = [];
    for (const x of RXCG.waiters) {
      if (x.ok()) x.r(0); else keep.push(x);
    }
    RXCG.waiters = keep;
  },
  onmsg(d) {
    if (d.log !== undefined) RXC.log(d.log);
    if (d.wstat) globalThis.__rxcWorker = d.wstat;
    if (d.rb !== undefined) {
      if (d.data.length) HEAPU8.set(d.data, d.addr >>> 0 >>> 0);
      if (d.rb > RXCG.rbDone) {
        RXCG.rbSet.add(d.rb);
        while (RXCG.rbSet.delete(RXCG.rbDone + 1)) RXCG.rbDone++;
      }
    }
    if (d.q) {
      // occlusion results (id, seq, visible) - with a frame ack or on their own
      const n = d.q.length / 3, bytes = d.q.length * 4;
      if (bytes > RXCG.qcap) {
        if (RXCG.qp) _free(RXCG.qp);
        RXCG.qcap = Math.max(bytes * 2, 64 << 10);
        RXCG.qp = _malloc(RXCG.qcap) >>> 0;
      }
      if (n) HEAPU32.set(d.q, RXCG.qp >>> 2 >>> 0);
      for (let i = 1; i < d.q.length; i += 3) if (d.q[i] > RXCG.qseq) RXCG.qseq = d.q[i];
      if (n || d.done !== undefined) Module["_gfxr_results"](RXCG.qp, n, d.done !== undefined ? d.links : RXCG.links, d.done !== undefined ? d.combos : RXCG.combos);
    }
    if (d.done !== undefined) {
      if (d.done > RXCG.done) RXCG.done = d.done;
      RXCG.links = d.links;
      RXCG.combos = d.combos;
      if (d.progs) for (const k of d.progs) RXC.noteProgram(k);
    }
    if (d.lost) {
      window.__rxcLost = true;
      RXC.status("The graphics context was lost (GPU reset). Reload the page to continue.");
    }
    if (d.fatal) {
      console.error("[gfx worker] " + d.fatal);
      RXCG.dead = true;
      RXC.status("graphics worker crashed: " + d.fatal.split("\n")[0]);
    }
    RXCG.wake();
  }
};

function _rxc_js_gfx_fif() {
  return RXCG.fif;
}

function _rxc_js_gfx_mode() {
  const w = Module["gfxWorker"];
  if (!w) return 0;
  RXCG.w = w;
  // default 2 frames in flight: with 1, the engine thread blocks until the gfx
  // worker finishes every frame, so big area-load buffer uploads (hundreds of MB)
  // stall the frame directly. 2 lets the engine run one frame ahead and smooths
  // those hitches (override with ?fif=1)
  RXCG.fif = Math.max(1, +(new URLSearchParams(location.search).get("fif") || 2));
  Module["__gfxmsg"] = RXCG.onmsg;
  const early = Module["__gfxEarly"] || [];
  Module["__gfxEarly"] = [];
  for (const d of early) RXCG.onmsg(d);
  return 1;
}

var RXCG_T0 = performance.timeOrigin;
function _rxc_js_gfx_submit(p, n, frameEnd) {
  p >>>= 0;
  /* heap > 2 GB: pointers arrive signed */ const b = HEAPU8.slice(p, p + n);
  RXCG.w.postMessage({
    cmds: b.buffer,
    seq: ++RXCG.seq,
    t: RXCG_T0 + performance.now()
  }, [ b.buffer ]);
}

var _rxc_js_gfx_wait = function(kind, v, ms) {
  const ok = () => RXCG.dead || (kind === 2 ? RXCG.qseq >= v : kind ? RXCG.rbDone >= v || RXCG.rbSet.has(v) : RXCG.done >= v);
  if (ok()) return 1;
  // time the engine thread waits on the worker, by kind (0 frame backpressure, 1 readback, 2 occlusion query): perf()
  const W = RXC.waits || (RXC.waits = {
    ms: [ 0, 0, 0 ],
    n: [ 0, 0, 0 ]
  }), t0 = performance.now();
  W.n[kind]++;
  return new Promise(r0 => {
    const r = x => {
      W.ms[kind] += performance.now() - t0;
      r0(x);
    };
    const x = {
      ok,
      r: () => r(1)
    };
    RXCG.waiters.push(x);
    if (ms >= 0) {
      const out = () => {
        const i = RXCG.waiters.indexOf(x);
        if (i >= 0) {
          RXCG.waiters.splice(i, 1);
          r(ok() ? 1 : 0);
        }
      };
      // (scheduler.postTask delays are not clamped to 4 ms like nested timeouts)
      if (globalThis.scheduler && scheduler.postTask) scheduler.postTask(out, {
        delay: ms,
        priority: "user-blocking"
      }); else setTimeout(out, ms);
    }
  });
};

_rxc_js_gfx_wait.isAsync = true;

async function _rxc_js_load_image(dest, size) {
  dest >>>= 0;
  try {
    const r = await fetch("image.bin");
    if (!r.ok) return 0;
    const reader = r.body.getReader();
    let off = 0, last = 0;
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      if (off + value.length > size) return 0;
      HEAPU8.set(value, dest + off >>> 0);
      off += value.length;
      if (off - last > (8 << 20)) {
        last = off;
        RXC.status(`downloading image.bin ${(off / 1048576) | 0} / ${(size / 1048576) | 0} MB`);
      }
    }
    return off === size ? 1 : 0;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

_rxc_js_load_image.isAsync = true;

function _rxc_js_log(p) {
  RXC.log(UTF8ToString(p));
}

var RXCMF = {
  list: new Map,
  next: 1,
  capReady: null,
  hooked: false,
  worker: null,
  ensureWorker() {
    if (RXCMF.worker !== null) return RXCMF.worker;
    RXCMF.worker = false;
    if (typeof VideoFrame === "undefined" || typeof Worker === "undefined") return false;
    const code = `const ctxs = new Map();\n        function rgba(vf, w, h) { const k = w + 'x' + h; let c = ctxs.get(k); if (!c) { c = new OffscreenCanvas(w, h).getContext('2d', { willReadFrequently: true, alpha: false }); ctxs.set(k, c); } c.drawImage(vf, 0, 0, w, h); return c.getImageData(0, 0, w, h).data; }\n        function yuv(px, w, h, nv12) {\n          const cw = (w + 1) >> 1, ch = (h + 1) >> 1, o = new Uint8Array(w * h + 2 * cw * ch), ob = w * h;\n          for (let i = 0, n = w * h; i < n; i++) { const r = px[4 * i], g = px[4 * i + 1], b = px[4 * i + 2]; o[i] = ((47 * r + 157 * g + 16 * b + 128) >> 8) + 16; }\n          for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {\n            const x0 = 2 * x, x1 = Math.min(x0 + 1, w - 1), y0 = 2 * y, y1 = Math.min(y0 + 1, h - 1), a = 4 * (y0 * w + x0), b2 = 4 * (y0 * w + x1), c2 = 4 * (y1 * w + x0), d = 4 * (y1 * w + x1);\n            const r = (px[a] + px[b2] + px[c2] + px[d] + 2) >> 2, g = (px[a + 1] + px[b2 + 1] + px[c2 + 1] + px[d + 1] + 2) >> 2, bl = (px[a + 2] + px[b2 + 2] + px[c2 + 2] + px[d + 2] + 2) >> 2;\n            const u = ((-26 * r - 87 * g + 112 * bl + 128) >> 8) + 128, v = ((112 * r - 102 * g - 10 * bl + 128) >> 8) + 128;\n            if (nv12) { o[ob + y * 2 * cw + 2 * x] = u; o[ob + y * 2 * cw + 2 * x + 1] = v; } else { o[ob + y * cw + x] = u; o[ob + cw * ch + y * cw + x] = v; }\n          }\n          return o;\n        }\n        onmessage = async e => {\n          const { id, seq, frame, w, h, fmt, t } = e.data; let out = null, err = null;\n          try {\n            const src = frame.format, vr = frame.visibleRect;\n            if (fmt !== 0 && (src === 'I420' || src === 'NV12' || src === 'I420A') && vr && vr.width === w && vr.height === h) {\n              const tmp = new Uint8Array(frame.allocationSize({ rect: vr })), lay = await frame.copyTo(tmp, { rect: vr });\n              const cw = (w + 1) >> 1, ch = (h + 1) >> 1, ob = w * h; out = new Uint8Array(ob + 2 * cw * ch);\n              for (let y = 0; y < h; y++) out.set(tmp.subarray(lay[0].offset + y * lay[0].stride, lay[0].offset + y * lay[0].stride + w), y * w);\n              if (src === 'NV12') {\n                for (let y = 0; y < ch; y++) { const row = tmp.subarray(lay[1].offset + y * lay[1].stride, lay[1].offset + y * lay[1].stride + 2 * cw);\n                  if (fmt === 1) out.set(row, ob + y * 2 * cw); else for (let x = 0; x < cw; x++) { out[ob + y * cw + x] = row[2 * x]; out[ob + cw * ch + y * cw + x] = row[2 * x + 1]; } }\n              } else {\n                for (let y = 0; y < ch; y++) { const u = tmp.subarray(lay[1].offset + y * lay[1].stride, lay[1].offset + y * lay[1].stride + cw), v = tmp.subarray(lay[2].offset + y * lay[2].stride, lay[2].offset + y * lay[2].stride + cw);\n                  if (fmt === 2) { out.set(u, ob + y * cw); out.set(v, ob + cw * ch + y * cw); } else for (let x = 0; x < cw; x++) { out[ob + y * 2 * cw + 2 * x] = u[x]; out[ob + y * 2 * cw + 2 * x + 1] = v[x]; } }\n              }\n            } else { const px = rgba(frame, w, h); out = fmt === 0 ? new Uint8Array(px.buffer) : yuv(px, w, h, fmt === 1); }\n          } catch (x) { err = String(x && x.message || x); }\n          frame.close();\n          if (out) postMessage({ id, seq, buf: out.buffer, w, h, fmt, t }, [out.buffer]); else postMessage({ id, seq, err });\n        };`;
    try {
      const w = new Worker(URL.createObjectURL(new Blob([ code ], {
        type: "application/javascript"
      })));
      w.onmessage = e => {
        const d = e.data, st = RXCMF.list.get(d.id);
        if (!st) return;
        st.inflight = false;
        if (d.err) {
          if (!st.warned) {
            st.warned = true;
            RXC.log("[mf] frame copy failed: " + d.err);
          }
          return;
        }
        if (d.seq >= st.readySeq) {
          st.ready = d;
          st.readySeq = d.seq;
        }
      };
      RXCMF.worker = w;
    } catch (e) {
      RXC.log("[mf] no frame worker: " + e);
    }
    return RXCMF.worker;
  },
  grab(s, t) {
    if (!s.wantW || s.inflight || s.closed || s.seeking || s.v.readyState < 2) return;
    const w = RXCMF.ensureWorker();
    if (!w) return;
    let vf;
    try {
      vf = new VideoFrame(s.v, {
        timestamp: Math.round(t * 1e6)
      });
    } catch (e) {
      return;
    }
    s.inflight = true;
    s.grabbed = s.frameNo;
    w.postMessage({
      id: s.id,
      seq: ++s.seq,
      frame: vf,
      w: s.wantW,
      h: s.wantH,
      fmt: s.wantFmt,
      t
    }, [ vf ]);
  },
  hook() {
    if (RXCMF.hooked) return;
    RXCMF.hooked = true;
    document.addEventListener("visibilitychange", () => {
      for (const s of RXCMF.list.values()) {
        if (document.hidden) {
          if (!s.v.paused) s.v.pause();
        } else if (s.want) s.v.play().catch(() => {});
      }
    });
  },
  capture(s) {
    const ctx = Module["audioContext"];
    if (!ctx || s.src) return !!s.src;
    if (!RXCMF.capReady) {
      const code = `class RexcompCapture extends AudioWorkletProcessor { constructor() { super(); this.b = new Float32Array(2048); this.n = 0; }\n          process(inputs) { const i = inputs[0]; if (i && i.length) { const L = i[0], R = i[1] || i[0]; for (let k = 0; k < L.length; k++) { this.b[2 * this.n] = L[k]; this.b[2 * this.n + 1] = R[k]; if (++this.n === 1024) { this.port.postMessage(this.b.slice(0)); this.n = 0; } } } return true; } }\n          registerProcessor('rexcomp-capture', RexcompCapture);`;
      RXCMF.capReady = ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([ code ], {
        type: "application/javascript"
      }))).then(() => true, () => false);
    }
    s.src = ctx.createMediaElementSource(s.v);
    s.gain = ctx.createGain();
    s.out = ctx.createGain();
    s.out.gain.value = 0;
    s.src.connect(s.gain);
    RXCMF.capReady.then(ok => {
      if (!ok || s.closed) return;
      s.cap = new AudioWorkletNode(ctx, "rexcomp-capture", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [ 2 ]
      });
      s.cap.port.onmessage = e => {
        if (s.mode !== 1) return;
        s.pcm.push(e.data);
        s.pcmFrames += e.data.length / 2;
        while (s.pcmFrames > ctx.sampleRate * 2 && s.pcm.length > 1) s.pcmFrames -= s.pcm.shift().length / 2;
      };
      s.gain.connect(s.cap);
      s.cap.connect(s.out);
      s.out.connect(ctx.destination);
    });
    return true;
  },
  async open(pathp, bytesp, len, infop) {
    if (typeof document === "undefined") return 0;
    RXCMF.hook();
    let url = null, blobUrl = null, cross = false, what = "media data";
    if (bytesp) blobUrl = URL.createObjectURL(new Blob([ HEAPU8.slice(bytesp, bytesp + len) ])); else {
      if (!RXC.dirs) await RXC.ensureManifest();
      const path = UTF8ToString(pathp), key = RXC.norm(path), rel = RXC.rel(path), ov = RXC.overlay.get(key);
      what = path;
      if (ov) blobUrl = URL.createObjectURL(new Blob([ ov.data.subarray(0, ov.size) ])); else if (rel !== null && rel in RXC.manifest) {
        if (RXC.chunked) blobUrl = URL.createObjectURL(new Blob([ await RXC.readRange(rel, 0, RXC.manifest[rel]) ])); else {
          url = RXC.base + "game/" + rel.split("\\").map(encodeURIComponent).join("/") + (RXC.vers && RXC.vers[rel] ? "?v=" + RXC.vers[rel] : "");
          cross = new URL(url, location.href).origin !== location.origin;
        }
      } else {
        RXC.log("[mf] not in the game data: " + path);
        return 0;
      }
    }
    const v = document.createElement("video");
    v.preload = "auto";
    v.playsInline = true;
    v.muted = true;
    if (cross) v.crossOrigin = "anonymous";
    v.style.cssText = "position:fixed;left:50%;top:50%;width:64px;height:36px;margin:-18px 0 0 -32px;pointer-events:none;z-index:-1";
    document.body.appendChild(v);
    v.src = blobUrl || url;
    const ok = await new Promise(res => {
      v.onloadedmetadata = () => res(true);
      v.onerror = () => res(false);
      setTimeout(() => res(false), 2e4);
    });
    if (!ok) {
      RXC.log("[mf] the browser cannot play " + what + (v.error ? " (" + v.error.message + ")" : " (no metadata after 20 s)"));
      v.removeAttribute("src");
      v.load();
      v.remove();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      return 0;
    }
    const s = {
      v,
      blobUrl,
      frameNo: 0,
      frameTime: -1,
      grabbedT: -1,
      seeking: false,
      ended: false,
      error: false,
      want: false,
      pcm: [],
      pcmFrames: 0,
      mode: 0,
      closed: false,
      seq: 0,
      readySeq: 0,
      ready: null,
      inflight: false,
      grabbed: -1,
      wantW: 0,
      wantH: 0,
      wantFmt: 0
    };
    if (v.requestVideoFrameCallback) {
      const tick = (now, meta) => {
        s.frameNo++;
        s.frameTime = meta.mediaTime;
        RXCMF.grab(s, meta.mediaTime);
        if (!s.closed) v.requestVideoFrameCallback(tick);
      };
      v.requestVideoFrameCallback(tick);
    }
    v.onseeking = () => {
      s.seeking = true;
    };
    v.onseeked = () => {
      s.seeking = false;
      s.ended = false;
      if (v.paused) {
        s.frameNo++;
        s.frameTime = v.currentTime;
      }
    };
    v.onended = () => {
      s.ended = true;
    };
    v.onerror = () => {
      s.error = true;
    };
    const id = RXCMF.next++;
    s.id = id;
    RXCMF.list.set(id, s);
    HEAP32[infop >>> 2 >>> 0] = v.videoWidth | 0;
    HEAP32[(infop + 4) >>> 2 >>> 0] = v.videoHeight | 0;
    HEAPF64[(infop + 8) >>> 3 >>> 0] = isFinite(v.duration) ? v.duration : 0;
    return id;
  },
  route(s) {
    const ctx = Module["audioContext"];
    if (s.mode === 0) {
      s.v.muted = true;
      return;
    }
    if (s.mode === 1) {
      if (RXCMF.capture(s)) {
        s.v.muted = false;
        try {
          s.gain.disconnect(ctx.destination);
        } catch (e) {}
      } else s.v.muted = true;
      return;
    }
    if (s.src) {
      s.v.muted = false;
      try {
        s.gain.connect(ctx.destination);
      } catch (e) {}
    } else s.v.muted = false;
  }
};

function _rxc_js_mf_audio(id, dst, max) {
  dst >>>= 0;
  const s = RXCMF.list.get(id);
  if (!s || s.mode !== 1 || !s.cap) return -1;
  let n = 0;
  while (s.pcm.length && n < max) {
    const b = s.pcm[0], frames = b.length / 2, take = Math.min(frames, max - n);
    HEAPF32.set(take === frames ? b : b.subarray(0, take * 2), (dst >>> 2) + n * 2 >>> 0);
    n += take;
    s.pcmFrames -= take;
    if (take === frames) s.pcm.shift(); else s.pcm[0] = b.subarray(take * 2);
  }
  return n;
}

function _rxc_js_mf_audio_rate() {
  const ctx = Module["audioContext"];
  return ctx ? ctx.sampleRate | 0 : 48e3;
}

var _rxc_js_mf_control = function(id, op, arg) {
  const s = RXCMF.list.get(id);
  if (!s) return;
  const v = s.v;
  switch (op) {
   case 1:
    s.want = true;
    v.playbackRate = arg > 0 ? arg : 1;
    s.ended = false;
    if (!document.hidden) v.play().catch(e => {
      if (!v.muted && e && e.name === "NotAllowedError") {
        v.muted = true;
        v.play().catch(() => {});
      }
    });
    break;

   case 2:
    s.want = false;
    v.pause();
    break;

   case 3:
    s.ended = false;
    s.seeking = true;
    s.pcm = [];
    s.pcmFrames = 0;
    v.currentTime = Math.max(0, arg);
    break;

   case 4:
    if (arg > 0) v.playbackRate = arg;
    break;

   case 5:
    v.volume = Math.max(0, Math.min(1, arg));
    break;

   case 6:
    s.closed = true;
    s.want = false;
    v.pause();
    try {
      if (s.src) s.src.disconnect();
      if (s.cap) s.cap.disconnect();
      if (s.out) s.out.disconnect();
    } catch (e) {}
    v.removeAttribute("src");
    v.load();
    v.remove();
    if (s.blobUrl) URL.revokeObjectURL(s.blobUrl);
    RXCMF.list.delete(id);
    break;

   case 7:
    s.mode = arg | 0;
    RXCMF.route(s);
    break;
  }
};

function _rxc_js_mf_frame(id, dst, w, h, fmt) {
  dst >>>= 0;
  const s = RXCMF.list.get(id);
  if (!s || s.seeking || !w || !h) return -1;
  if (s.wantW !== w || s.wantH !== h || s.wantFmt !== fmt) {
    s.wantW = w;
    s.wantH = h;
    s.wantFmt = fmt;
    s.ready = null;
  }
  const r = s.ready;
  if (!r) {
    if (s.grabbed !== s.frameNo || !s.v.requestVideoFrameCallback) RXCMF.grab(s, s.frameTime >= 0 ? s.frameTime : s.v.currentTime);
    return -1;
  }
  s.ready = null;
  if (r.w !== w || r.h !== h || r.fmt !== fmt) return -1;
  HEAPU8.set(new Uint8Array(r.buf), dst >>> 0);
  return r.t;
}

async function _rxc_js_mf_open(pathp, bytesp, len, infop) {
  try {
    return await RXCMF.open(pathp >>> 0, bytesp >>> 0, len, infop >>> 0);
  } catch (e) {
    RXC.log("[mf] opening media failed: " + (e && e.stack || e));
    return 0;
  }
}

_rxc_js_mf_open.isAsync = true;

function _rxc_js_mf_time(id, flagsp) {
  flagsp >>>= 0;
  const s = RXCMF.list.get(id);
  if (!s) {
    if (flagsp) HEAP32[flagsp >>> 2 >>> 0] = 2;
    return 0;
  }
  const v = s.v, seeking = s.seeking || v.seeking;
  if (flagsp) HEAP32[flagsp >>> 2 >>> 0] = (s.ended && !seeking ? 1 : 0) | (s.error ? 2 : 0) | (!v.paused ? 4 : 0) | (seeking ? 8 : 0);
  return v.currentTime;
}

function _rxc_js_note_program(vsp, psp) {
  RXC.noteProgram(UTF8ToString(vsp) + ":" + UTF8ToString(psp));
}

function _rxc_js_now() {
  return performance.now() - RXC.pausedMs;
}

function _rxc_js_prelink(hashp, isVs, outp, cap) {
  if (!RXC.pairs) return 0;
  const l = RXC.pairs.get((isVs ? "v" : "p") + UTF8ToString(hashp));
  if (!l || !l.length) return 0;
  const txt = l.join("\n");
  if (lengthBytesUTF8(txt) + 1 > cap) return 0;
  stringToUTF8(txt, outp, cap);
  return l.length;
}

function _rxc_js_present(draws, links, combos) {
  const now = performance.now(), last = Module["__lastPresent"], t = RXC.tot, p = RXC.stallPrev || {};
  // frame-time ring (Module.perf() summarises it) + what happened in every frame over 50 ms
  if (last && Module["__presented"]) {
    const P = RXC.perf || (RXC.perf = {
      ft: new Float32Array(8192),
      n: 0,
      slow: []
    });
    const dt = now - last;
    P.ft[P.n++ & 8191] = dt;
    const W = RXC.waits || (RXC.waits = {
      ms: [ 0, 0, 0 ],
      n: [ 0, 0, 0 ]
    }), pw = P.pw || [ 0, 0, 0, 0 ];
    if (dt > 50 && P.slow.length < 2e3) P.slow.push({
      t: Math.round(now),
      ms: Math.round(dt),
      draws: draws - (p.draws || 0),
      links: links - (p.links || 0),
      combos: combos - (p.combos || 0),
      fetches: t.fetches - (p.fetches || 0),
      fetchMs: Math.round(t.fetchMs - (p.fetchMs || 0)),
      wFrame: Math.round(W.ms[0] - pw[0]),
      wQuery: Math.round(W.ms[2] - pw[2]),
      nQuery: W.n[2] - pw[3]
    });
    P.pw = [ W.ms[0], W.ms[1], W.ms[2], W.n[2] ];
    if (!Module["perf"]) Module["perf"] = reset => {
      const Q = RXC.perf, n = Math.min(Q.n, 8192), a = Array.from(Q.ft.subarray(0, n)).sort((x, y) => x - y), q = f => a[Math.min(n - 1, Math.floor(f * n))];
      const r = {
        frames: n,
        avgFps: n ? 1e3 / (a.reduce((s, x) => s + x, 0) / n) : 0,
        p50: q(.5),
        p90: q(.9),
        p99: q(.99),
        max: a[n - 1],
        over33: a.filter(x => x > 33.4).length,
        over50: a.filter(x => x > 50).length,
        over100: a.filter(x => x > 100).length,
        slow: Q.slow.slice(-60)
      };
      if (reset) {
        Q.n = 0;
        Q.slow = [];
      }
      return r;
    };
  }
  if (last && now - last > 150 && Module["__presented"]) console.log(`[${now - last > 1e3 ? "stall" : "hitch"}] ${((now - last) / 1e3).toFixed(2)} s: ${draws - (p.draws || 0)} draws, +${links - (p.links || 0)} programs linked, +${combos - (p.combos || 0)} new shader variants, +${t.fetches - (p.fetches || 0)} fetches (${((t.fetchKB - (p.fetchKB || 0)) / 1024).toFixed(0)} MB, waited ${((t.fetchMs - (p.fetchMs || 0)) / 1e3).toFixed(1)} s)`);
  RXC.stallPrev = {
    draws,
    links,
    combos,
    fetches: t.fetches,
    fetchKB: t.fetchKB,
    fetchMs: t.fetchMs
  };
  RXC.framePending = 1;
  Module["__lastPresent"] = now;
  if (!Module["__presented"]) {
    Module["__presented"] = 1;
    if (Module["onFirstFrame"]) Module["onFirstFrame"]();
  }
}

function _rxc_js_set_title(p) {
  document.title = UTF8ToString(p);
}

var RXCT = {
  th: [],
  lastMacro: 0,
  chan: null,
  q: [],
  macro(fn) {
    if (!RXCT.chan) {
      RXCT.chan = new MessageChannel;
      RXCT.chan.port1.onmessage = () => {
        RXCT.lastMacro = performance.now();
        const q = RXCT.q;
        RXCT.q = [];
        for (const f of q) f();
      };
    }
    RXCT.q.push(fn);
    RXCT.chan.port2.postMessage(0);
  }
};

function _rxc_js_sleep(ms) {
  RXC.cnt.sleeps++;
  RXC.cnt.sleepMs += ms;
  if (RXC.sleepTimer === undefined) {
    const m = new URLSearchParams(location.search).get("sleep");
    RXC.sleepTimer = m === "timer";
    RXC.sleepHop = m === "hop" || (!m && Module["sleepHop"] === true);
  }
  if (RXC.sleepHop && ms < 3) return new Promise(r => RXC.hop(() => {
    RXCT.lastMacro = performance.now();
    r();
  }));
  const done = r => () => {
    RXCT.lastMacro = performance.now();
    r();
  };
  if (RXC.sleepTimer) return new Promise(r => setTimeout(done(r), ms > 0 ? ms : 0));
  if (ms < 1) return new Promise(r => RXC.hop(done(r)));
  // deadline-exact: the main thread runs long wasm slices, so a bare 10 ms timer fires 2-4 ms late and every guest
  // Sleep stretches ~20% (frame pacing sags to ~50 fps, the audio feeder to 0.77x). Sleep all but the last 2 ms on
  // a real timer, then hop to the exact deadline: never early, overshoot bounded by hop granularity.
  const end = performance.now() + ms, wait = ms - 2;
  return new Promise(r => {
    const spin = () => {
      if (performance.now() < end) {
        RXC.hop(spin);
        return;
      }
      RXCT.lastMacro = performance.now();
      r();
    };
    if (globalThis.scheduler && scheduler.postTask) scheduler.postTask(spin, {
      delay: Math.max(0, wait),
      priority: "user-blocking"
    }); else setTimeout(spin, Math.max(0, wait));
  });
}

_rxc_js_sleep.isAsync = true;

var _rxc_js_stack = function() {
  const s = (new Error).stack.split("\n").filter(l => /f_[0-9a-f]+/.test(l)).map(l => (/f_[0-9a-f]+(_body)?/.exec(l) || [ "" ])[0]);
  console.error("[hang] lifted stack: " + s.slice(0, 40).join(" "));
};

function _rxc_js_status(p) {
  RXC.status(UTF8ToString(p));
}

var stackRestore = val => __emscripten_stack_restore(val);

function _rxc_js_thread_switch(from, to, newStackTop) {
  RXC.cnt.switches++;
  const f = RXCT.th[from] || (RXCT.th[from] = {});
  const suspended = new Promise(res => {
    f.resume = res;
  });
  if (newStackTop) {
    // first switch into this thread: start it on a fresh wasm stack once the current one has suspended
    (performance.now() - RXCT.lastMacro > 16 ? RXCT.macro : queueMicrotask)(() => {
      stackRestore(newStackTop);
      const p = Module["_rxc_thread_start"](to);
      if (p && p.catch) p.catch(e => {
        console.error("guest thread " + to + " died:", e);
        RXC.status("guest thread " + to + " crashed: " + e);
        RXC.log("[web] guest thread " + to + " crashed: " + (e && e.stack ? e.stack : e));
      });
    });
  } else {
    const t = RXCT.th[to];
    if (!t || !t.resume) {
      console.error("rxc_js_thread_switch: thread " + to + " is not suspended");
      return suspended;
    }
    const r = t.resume;
    t.resume = null;
    // resolve straight away: the reaction is a microtask, so it runs after this thread has suspended (one hop less
    // than queueMicrotask(r), and the handoff is ~5% of a frame at ~20 switches)
    if (performance.now() - RXCT.lastMacro > 16) RXCT.macro(r); else r();
  }
  return suspended;
}

_rxc_js_thread_switch.isAsync = true;

var RXCV = {
  next: 1,
  map: {}
};

function _rxc_js_vnet_begin(host, port, req, len) {
  host >>>= 0;
  req >>>= 0;
  const id = RXCV.next++, e = RXCV.map[id] = {
    done: false,
    fail: false,
    data: null
  };
  const body = HEAPU8.slice(req, req + len);
  fetch("vnet", {
    method: "POST",
    headers: {
      "X-Vnet-Host": UTF8ToString(host),
      "X-Vnet-Port": String(port)
    },
    body
  }).then(r => r.ok ? r.arrayBuffer() : Promise.reject(new Error("HTTP " + r.status))).then(b => {
    e.data = new Uint8Array(b);
    e.done = true;
  }).catch(err => {
    console.error("[vnet] " + err);
    e.fail = true;
    e.done = true;
  });
  return id;
}

function _rxc_js_vnet_poll(id, outPtr, outLen) {
  outPtr >>>= 0;
  outLen >>>= 0;
  const e = RXCV.map[id];
  if (!e) return -1;
  if (!e.done) return 0;
  delete RXCV.map[id];
  if (e.fail) return -1;
  const p = _malloc(e.data.length || 1) >>> 0;
  HEAPU8.set(e.data, p >>> 0);
  HEAPU32[outPtr >>> 2 >>> 0] = p;
  HEAPU32[outLen >>> 2 >>> 0] = e.data.length;
  return 1;
}

function _rxc_js_yield() {
  // frame statistics for the page: frames, time spent running wasm vs. waiting
  const now = performance.now(), st = RXC.stats || (RXC.stats = {
    t0: now,
    frames: 0,
    busy: 0,
    last: now,
    fstart: now
  });
  const frame = RXC.framePending;
  RXC.framePending = 0;
  st.busy += now - st.last;
  if (frame) st.frames++;
  if (now - st.t0 > 1e3) {
    RXC.fps = st.frames * 1e3 / (now - st.t0);
    RXC.busy = st.busy / (now - st.t0);
    st.t0 = now;
    st.frames = 0;
    st.busy = 0;
    globalThis.__rxcStats = {
      fps: RXC.fps,
      busy: RXC.busy,
      c: RXC.cnt
    };
    RXC.cnt = {
      reads: 0,
      fetches: 0,
      fetchKB: 0,
      fetchMs: 0,
      switches: 0,
      sleeps: 0,
      sleepMs: 0,
      yieldMs: 0
    };
    globalThis.__rxcTot = RXC.tot;
  }
  // ?yield=mc: uncapped - hand the event loop one turn through a MessageChannel (not throttled like timers, keeps
  // running in hidden tabs); ?yield=raf: always vsync through rAF (100 ms fallback); default 'auto': rAF only when the
  // frame's work fit in ~3/4 of a 60 Hz interval - waiting for the next vsync after a 25 ms frame would round it up to
  // 33 ms (30 fps). UE's own frame limiter keeps the uncapped path from running faster than it wants.
  if (RXC.yieldMode === undefined) RXC.yieldMode = new URLSearchParams(location.search).get("yield") || "";
  // ?yield wins (benchmarks), then the page's Vsync button (Module.yieldMode), then uncapped
  const mode = RXC.yieldMode || Module["yieldMode"] || "mc";
  const work = now - st.fstart;
  // hidden tab: pause at this frame boundary until visible again (Chrome throttles hidden timers to ~1/s, so the
  // engine's threads would fall behind and pile up work for the return); the paused span is cut out of the game clock
  if (document.hidden && !RXC.bgRun) {
    if (RXC.bgRun === undefined) {
      RXC.bgRun = new URLSearchParams(location.search).has("bgrun");
      if (RXC.bgRun) return Promise.resolve();
    }
    return new Promise(r => {
      const t0 = performance.now(), ctx = Module["audioContext"];
      console.log("[web] tab hidden: game paused");
      if (ctx && ctx.state === "running") ctx.suspend().catch(() => {});
      const onVis = () => {
        if (document.hidden) return;
        document.removeEventListener("visibilitychange", onVis);
        RXC.pausedMs += performance.now() - t0;
        console.log("[web] tab visible: resumed after " + ((performance.now() - t0) / 1e3).toFixed(1) + " s");
        if (ctx && ctx.state === "suspended" && Module["soundOn"] !== false) ctx.resume().catch(() => {});
        st.last = st.fstart = RXCT.lastMacro = performance.now();
        st.due = 0;
        r();
      };
      document.addEventListener("visibilitychange", onVis);
    });
  }
  if (frame && mode === "cap" && !RXC.capOk()) RXC.tlate *= .99;
  if (mode === "cap" && frame && now > RXC.ioHot && RXC.capOk()) {
    const iv = 1e3 / (+Module["fpsCap"] || 60);
    let due = RXC.capDue || (st.due || now) + iv;
    if (!RXC.capDue && now > due + iv / 2) due = now;
    RXC.capDue = 0;
    st.due = due;
    const L = RXC.capLog || (RXC.capLog = Module["__capLog"] = {
      a: new Float64Array(6 * 1024),
      n: 0
    }), li = (L.n++ & 1023) * 6;
    L.a[li] = now;
    L.a[li + 1] = due;
    L.a[li + 2] = L.a[li + 3] = L.a[li + 4] = 0;
    L.a[li + 5] = RXC.tlate || 0;
    if (due - now > .3) return new Promise(r => {
      const t0 = performance.now();
      const spin = () => {
        if (performance.now() < due - .2) {
          RXC.hop(spin);
          return;
        }
        const t = performance.now();
        L.a[li + 4] = t;
        RXC.cnt.yieldMs += t - t0;
        st.last = st.fstart = RXCT.lastMacro = t;
        r();
      };
      RXC.tlate = Math.min((RXC.tlate || 1) * .995, iv);
      const sleep = due - now - .5 - RXC.tlate;
      L.a[li + 2] = sleep;
      if (sleep < 1) {
        RXC.hop(spin);
        return;
      }
      const want = now + sleep;
      RXC.hop(() => setTimeout(() => {
        const f = performance.now(), o = f - want;
        L.a[li + 3] = f;
        if (o > RXC.tlate) RXC.tlate = o;
        spin();
      }, sleep));
    });
  }
  if (frame) RXC.capDue = 0;
  if (!frame || mode === "mc" || mode === "cap" || (mode === "auto" && work > 12)) {
    if (!RXC.mc) {
      RXC.mc = new MessageChannel;
      RXC.mcq = [];
      RXC.mc.port1.onmessage = () => {
        const q = RXC.mcq;
        RXC.mcq = [];
        for (const f of q) f();
      };
    }
    const t0 = performance.now();
    return new Promise(r => {
      RXC.mcq.push(() => {
        const t = performance.now();
        RXC.cnt.yieldMs += t - t0;
        st.last = RXCT.lastMacro = t;
        if (frame) st.fstart = t;
        r();
      });
      RXC.mc.port2.postMessage(0);
    });
  }
  return new Promise(r => {
    let done = false;
    const go = () => {
      if (!done) {
        done = true;
        st.last = st.fstart = RXCT.lastMacro = performance.now();
        r();
      }
    };
    requestAnimationFrame(go);
    setTimeout(go, 100);
  });
}

_rxc_js_yield.isAsync = true;

var handleException = e => {
  // Certain exception types we do not treat as errors since they are used for
  // internal control flow.
  // 1. ExitStatus, which is thrown by exit()
  // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
  //    that wish to return to JS event loop.
  if (e instanceof ExitStatus || e == "unwind") {
    return EXITSTATUS;
  }
  quit_(1, e);
};

var stackAlloc = sz => __emscripten_stack_alloc(sz);

var stringToUTF8OnStack = str => {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8(str, ret, size);
  return ret;
};

var runAndAbortIfError = func => {
  try {
    return func();
  } catch (e) {
    abort(e);
  }
};

var maybeExit = () => {
  if (!keepRuntimeAlive()) {
    try {
      _exit(EXITSTATUS);
    } catch (e) {
      handleException(e);
    }
  }
};

var callUserCallback = func => {
  if (ABORT) {
    return;
  }
  try {
    return func();
  } catch (e) {
    handleException(e);
  } finally {
    maybeExit();
  }
};

var runtimeKeepalivePush = () => {
  runtimeKeepaliveCounter += 1;
};

var runtimeKeepalivePop = () => {
  runtimeKeepaliveCounter -= 1;
};

var Asyncify = {
  instrumentWasmImports(imports) {
    var importPattern = /^(invoke_.*|__asyncjs__.*)$/;
    for (let [x, original] of Object.entries(imports)) {
      if (typeof original == "function") {
        let isAsyncifyImport = original.isAsync || importPattern.test(x);
        // Wrap async imports with a suspending WebAssembly function.
        if (isAsyncifyImport) {
          imports[x] = original = new WebAssembly.Suspending(original);
        }
      }
    }
  },
  instrumentWasmExports(exports) {
    var exportPattern = /^(main|rxc_thread_start|main|__main_argc_argv)$/;
    Asyncify.asyncExports = new Set;
    var ret = {};
    for (let [x, original] of Object.entries(exports)) {
      if (typeof original == "function") {
        // Wrap all exports with a promising WebAssembly function.
        let isAsyncifyExport = exportPattern.test(x);
        if (isAsyncifyExport) {
          Asyncify.asyncExports.add(original);
          original = Asyncify.makeAsyncFunction(original);
        }
        ret[x] = original;
      } else {
        ret[x] = original;
      }
    }
    return ret;
  },
  asyncExports: null,
  isAsyncExport(func) {
    return Asyncify.asyncExports?.has(func);
  },
  handleAsync: async startAsync => {
    try {
      return await startAsync();
    } finally {}
  },
  handleSleep: startAsync => Asyncify.handleAsync(() => new Promise(startAsync)),
  makeAsyncFunction(original) {
    return WebAssembly.promising(original);
  }
};

var getCFunc = ident => {
  var func = Module["_" + ident];
  // closure exported function
  return func;
};

var writeArrayToMemory = (array, buffer) => {
  HEAP8.set(array, buffer >>> 0);
};

var stackSave = () => _emscripten_stack_get_current();

/**
   * @param {string|null=} returnType
   * @param {Array=} argTypes
   * @param {Array=} args
   * @param {Object=} opts
   */ var ccall = (ident, returnType, argTypes, args, opts) => {
  // For fast lookup of conversion functions
  var toC = {
    "string": str => {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) {
        // null string
        ret = stringToUTF8OnStack(str);
      }
      return ret;
    },
    "array": arr => {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };
  function convertReturnValue(ret) {
    if (returnType === "string") {
      return UTF8ToString(ret);
    }
    if (returnType === "pointer") return ret >>> 0;
    if (returnType === "boolean") return Boolean(ret);
    return ret;
  }
  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func(...cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }
  var asyncMode = opts?.async;
  if (asyncMode) return ret.then(onDone);
  ret = onDone(ret);
  return ret;
};

FS.createPreloadedFile = FS_createPreloadedFile;

FS.preloadFile = FS_preloadFile;

FS.staticInit();

// Signal GL rendering layer that processing of a new frame is about to
// start. This helps it optimize VBO double-buffering and reduce GPU stalls.
registerPreMainLoop(() => GL.newRenderingFrameStarted());

for (let i = 0; i < 32; ++i) tempFixedLengthArray.push(new Array(i));

var miniTempWebGLFloatBuffersStorage = new Float32Array(288);

// Create GL_POOL_TEMP_BUFFERS_SIZE+1 temporary buffers, for uploads of size 0 through GL_POOL_TEMP_BUFFERS_SIZE inclusive
for (/**@suppress{duplicate}*/ var i = 0; i <= 288; ++i) {
  miniTempWebGLFloatBuffers[i] = miniTempWebGLFloatBuffersStorage.subarray(0, i);
}

// End JS library code
// include: postlibrary.js
// This file is included after the automatically-generated JS library code
// but before the wasm module is created.
{
  // Begin ATMODULES hooks
  if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
  if (Module["print"]) out = Module["print"];
  if (Module["printErr"]) err = Module["printErr"];
  // End ATMODULES hooks
  if (Module["arguments"]) programArgs = Module["arguments"];
  if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
  var preInit = Module["preInit"];
  if (preInit) {
    if (typeof preInit == "function") Module["preInit"] = preInit = [ preInit ];
    // Written as a loop so that preInit functions that themselves add more
    // preInit functions.  Is this actually needed?
    while (preInit.length > 0) {
      preInit.shift()();
    }
  }
}

// Begin runtime exports
Module["ENV"] = ENV;

Module["ccall"] = ccall;

Module["UTF8ToString"] = UTF8ToString;

Module["stringToUTF8"] = stringToUTF8;

Module["lengthBytesUTF8"] = lengthBytesUTF8;

// End runtime exports
// Begin JS library exports
// End JS library exports
// end include: postlibrary.js
var ASM_CONSTS = {
  537300960: () => {
    const e = GLctx.getExtension("KHR_parallel_shader_compile");
    if (e && e.maxShaderCompilerThreadsKHR) e.maxShaderCompilerThreadsKHR(4294967295);
  },
  537301108: () => GLctx.getParameter(35376) | 0,
  537301151: () => {
    const n = Module["__passlog"] | 0;
    if (n > 0) {
      Module["__passlog"] = n - 1;
      return 1;
    }
    return 0;
  }
};

// Imports from the Wasm binary.
var _free, _malloc, _emscripten_stack_get_current, __emscripten_stack_restore, _rxc_thread_start, _gfxr_results, _rxc_ev_mouse, _rxc_ev_key, _rxc_ev_mouse_raw, _rxc_raw_mouse_wanted, _rxc_dbg_thrdump, _rxc_ev_char, _rxc_ev_focus, _rxc_ev_resize, _main, ___trap, __emscripten_stack_alloc, memory, __indirect_function_table, wasmMemory;

function assignWasmExports(wasmExports) {
  _free = Module["_free"] = wasmExports["free"];
  _malloc = Module["_malloc"] = wasmExports["malloc"];
  _emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"];
  __emscripten_stack_restore = wasmExports["_emscripten_stack_restore"];
  _rxc_thread_start = Module["_rxc_thread_start"] = wasmExports["rxc_thread_start"];
  _gfxr_results = Module["_gfxr_results"] = wasmExports["gfxr_results"];
  _rxc_ev_mouse = Module["_rxc_ev_mouse"] = wasmExports["rxc_ev_mouse"];
  _rxc_ev_key = Module["_rxc_ev_key"] = wasmExports["rxc_ev_key"];
  _rxc_ev_mouse_raw = Module["_rxc_ev_mouse_raw"] = wasmExports["rxc_ev_mouse_raw"];
  _rxc_raw_mouse_wanted = Module["_rxc_raw_mouse_wanted"] = wasmExports["rxc_raw_mouse_wanted"];
  _rxc_dbg_thrdump = Module["_rxc_dbg_thrdump"] = wasmExports["rxc_dbg_thrdump"];
  _rxc_ev_char = Module["_rxc_ev_char"] = wasmExports["rxc_ev_char"];
  _rxc_ev_focus = Module["_rxc_ev_focus"] = wasmExports["rxc_ev_focus"];
  _rxc_ev_resize = Module["_rxc_ev_resize"] = wasmExports["rxc_ev_resize"];
  _main = Module["_main"] = wasmExports["__main_argc_argv"];
  ___trap = wasmExports["__trap"];
  __emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"];
  memory = wasmMemory = wasmExports["memory"];
  __indirect_function_table = wasmExports["__indirect_function_table"];
}

var wasmImports = {
  /** @export */ __syscall_fcntl64: ___syscall_fcntl64,
  /** @export */ __syscall_ioctl: ___syscall_ioctl,
  /** @export */ __syscall_mkdirat: ___syscall_mkdirat,
  /** @export */ __syscall_openat: ___syscall_openat,
  /** @export */ _abort_js: __abort_js,
  /** @export */ _gmtime_js: __gmtime_js,
  /** @export */ _tzset_js: __tzset_js,
  /** @export */ clock_time_get: _clock_time_get,
  /** @export */ emscripten_asm_const_int: _emscripten_asm_const_int,
  /** @export */ emscripten_date_now: _emscripten_date_now,
  /** @export */ emscripten_force_exit: _emscripten_force_exit,
  /** @export */ emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */ emscripten_set_canvas_element_size: _emscripten_set_canvas_element_size,
  /** @export */ emscripten_webgl_create_context: _emscripten_webgl_create_context,
  /** @export */ emscripten_webgl_enable_extension: _emscripten_webgl_enable_extension,
  /** @export */ emscripten_webgl_get_current_context: _emscripten_webgl_get_current_context,
  /** @export */ emscripten_webgl_make_context_current: _emscripten_webgl_make_context_current,
  /** @export */ environ_get: _environ_get,
  /** @export */ environ_sizes_get: _environ_sizes_get,
  /** @export */ fd_close: _fd_close,
  /** @export */ fd_read: _fd_read,
  /** @export */ fd_seek: _fd_seek,
  /** @export */ fd_write: _fd_write,
  /** @export */ glActiveTexture: _glActiveTexture,
  /** @export */ glAttachShader: _glAttachShader,
  /** @export */ glBeginQuery: _glBeginQuery,
  /** @export */ glBeginTransformFeedback: _glBeginTransformFeedback,
  /** @export */ glBindBuffer: _glBindBuffer,
  /** @export */ glBindBufferBase: _glBindBufferBase,
  /** @export */ glBindBufferRange: _glBindBufferRange,
  /** @export */ glBindFramebuffer: _glBindFramebuffer,
  /** @export */ glBindRenderbuffer: _glBindRenderbuffer,
  /** @export */ glBindSampler: _glBindSampler,
  /** @export */ glBindTexture: _glBindTexture,
  /** @export */ glBindVertexArray: _glBindVertexArray,
  /** @export */ glBlendColor: _glBlendColor,
  /** @export */ glBlendEquationSeparate: _glBlendEquationSeparate,
  /** @export */ glBlendFuncSeparate: _glBlendFuncSeparate,
  /** @export */ glBlitFramebuffer: _glBlitFramebuffer,
  /** @export */ glBufferData: _glBufferData,
  /** @export */ glBufferSubData: _glBufferSubData,
  /** @export */ glCheckFramebufferStatus: _glCheckFramebufferStatus,
  /** @export */ glClear: _glClear,
  /** @export */ glClearBufferfv: _glClearBufferfv,
  /** @export */ glClearBufferiv: _glClearBufferiv,
  /** @export */ glClearBufferuiv: _glClearBufferuiv,
  /** @export */ glClearColor: _glClearColor,
  /** @export */ glClearDepthf: _glClearDepthf,
  /** @export */ glClearStencil: _glClearStencil,
  /** @export */ glColorMask: _glColorMask,
  /** @export */ glCompileShader: _glCompileShader,
  /** @export */ glCompressedTexSubImage2D: _glCompressedTexSubImage2D,
  /** @export */ glCompressedTexSubImage3D: _glCompressedTexSubImage3D,
  /** @export */ glCopyBufferSubData: _glCopyBufferSubData,
  /** @export */ glCopyTexSubImage2D: _glCopyTexSubImage2D,
  /** @export */ glCreateProgram: _glCreateProgram,
  /** @export */ glCreateShader: _glCreateShader,
  /** @export */ glCullFace: _glCullFace,
  /** @export */ glDeleteBuffers: _glDeleteBuffers,
  /** @export */ glDeleteFramebuffers: _glDeleteFramebuffers,
  /** @export */ glDeleteProgram: _glDeleteProgram,
  /** @export */ glDeleteQueries: _glDeleteQueries,
  /** @export */ glDeleteRenderbuffers: _glDeleteRenderbuffers,
  /** @export */ glDeleteSamplers: _glDeleteSamplers,
  /** @export */ glDeleteShader: _glDeleteShader,
  /** @export */ glDeleteSync: _glDeleteSync,
  /** @export */ glDeleteTextures: _glDeleteTextures,
  /** @export */ glDepthFunc: _glDepthFunc,
  /** @export */ glDepthMask: _glDepthMask,
  /** @export */ glDepthRangef: _glDepthRangef,
  /** @export */ glDisable: _glDisable,
  /** @export */ glDisableVertexAttribArray: _glDisableVertexAttribArray,
  /** @export */ glDrawArrays: _glDrawArrays,
  /** @export */ glDrawArraysInstanced: _glDrawArraysInstanced,
  /** @export */ glDrawBuffers: _glDrawBuffers,
  /** @export */ glDrawElements: _glDrawElements,
  /** @export */ glDrawElementsInstanced: _glDrawElementsInstanced,
  /** @export */ glEnable: _glEnable,
  /** @export */ glEnableVertexAttribArray: _glEnableVertexAttribArray,
  /** @export */ glEndQuery: _glEndQuery,
  /** @export */ glEndTransformFeedback: _glEndTransformFeedback,
  /** @export */ glFenceSync: _glFenceSync,
  /** @export */ glFinish: _glFinish,
  /** @export */ glFlush: _glFlush,
  /** @export */ glFramebufferRenderbuffer: _glFramebufferRenderbuffer,
  /** @export */ glFramebufferTexture2D: _glFramebufferTexture2D,
  /** @export */ glFramebufferTextureLayer: _glFramebufferTextureLayer,
  /** @export */ glFrontFace: _glFrontFace,
  /** @export */ glGenBuffers: _glGenBuffers,
  /** @export */ glGenFramebuffers: _glGenFramebuffers,
  /** @export */ glGenQueries: _glGenQueries,
  /** @export */ glGenRenderbuffers: _glGenRenderbuffers,
  /** @export */ glGenSamplers: _glGenSamplers,
  /** @export */ glGenTextures: _glGenTextures,
  /** @export */ glGenVertexArrays: _glGenVertexArrays,
  /** @export */ glGenerateMipmap: _glGenerateMipmap,
  /** @export */ glGetActiveAttrib: _glGetActiveAttrib,
  /** @export */ glGetAttribLocation: _glGetAttribLocation,
  /** @export */ glGetBufferSubData: _glGetBufferSubData,
  /** @export */ glGetError: _glGetError,
  /** @export */ glGetFramebufferAttachmentParameteriv: _glGetFramebufferAttachmentParameteriv,
  /** @export */ glGetIntegerv: _glGetIntegerv,
  /** @export */ glGetProgramInfoLog: _glGetProgramInfoLog,
  /** @export */ glGetProgramiv: _glGetProgramiv,
  /** @export */ glGetQueryObjectuiv: _glGetQueryObjectuiv,
  /** @export */ glGetSamplerParameteriv: _glGetSamplerParameteriv,
  /** @export */ glGetShaderInfoLog: _glGetShaderInfoLog,
  /** @export */ glGetShaderiv: _glGetShaderiv,
  /** @export */ glGetUniformBlockIndex: _glGetUniformBlockIndex,
  /** @export */ glGetUniformLocation: _glGetUniformLocation,
  /** @export */ glLinkProgram: _glLinkProgram,
  /** @export */ glPixelStorei: _glPixelStorei,
  /** @export */ glPolygonOffset: _glPolygonOffset,
  /** @export */ glReadBuffer: _glReadBuffer,
  /** @export */ glReadPixels: _glReadPixels,
  /** @export */ glRenderbufferStorageMultisample: _glRenderbufferStorageMultisample,
  /** @export */ glSamplerParameterf: _glSamplerParameterf,
  /** @export */ glSamplerParameteri: _glSamplerParameteri,
  /** @export */ glScissor: _glScissor,
  /** @export */ glShaderSource: _glShaderSource,
  /** @export */ glStencilFuncSeparate: _glStencilFuncSeparate,
  /** @export */ glStencilMaskSeparate: _glStencilMaskSeparate,
  /** @export */ glStencilOpSeparate: _glStencilOpSeparate,
  /** @export */ glTexParameteri: _glTexParameteri,
  /** @export */ glTexStorage2D: _glTexStorage2D,
  /** @export */ glTexStorage3D: _glTexStorage3D,
  /** @export */ glTexSubImage2D: _glTexSubImage2D,
  /** @export */ glTexSubImage3D: _glTexSubImage3D,
  /** @export */ glTransformFeedbackVaryings: _glTransformFeedbackVaryings,
  /** @export */ glUniform1f: _glUniform1f,
  /** @export */ glUniform1i: _glUniform1i,
  /** @export */ glUniform3ui: _glUniform3ui,
  /** @export */ glUniform4fv: _glUniform4fv,
  /** @export */ glUniformBlockBinding: _glUniformBlockBinding,
  /** @export */ glUseProgram: _glUseProgram,
  /** @export */ glVertexAttrib4f: _glVertexAttrib4f,
  /** @export */ glVertexAttribDivisor: _glVertexAttribDivisor,
  /** @export */ glVertexAttribIPointer: _glVertexAttribIPointer,
  /** @export */ glVertexAttribPointer: _glVertexAttribPointer,
  /** @export */ glViewport: _glViewport,
  /** @export */ rxc_js_audio_init: _rxc_js_audio_init,
  /** @export */ rxc_js_audio_submit: _rxc_js_audio_submit,
  /** @export */ rxc_js_canvas_note: _rxc_js_canvas_note,
  /** @export */ rxc_js_canvas_size: _rxc_js_canvas_size,
  /** @export */ rxc_js_cursor: _rxc_js_cursor,
  /** @export */ rxc_js_file_close: _rxc_js_file_close,
  /** @export */ rxc_js_file_list: _rxc_js_file_list,
  /** @export */ rxc_js_file_mkdir: _rxc_js_file_mkdir,
  /** @export */ rxc_js_file_open: _rxc_js_file_open,
  /** @export */ rxc_js_file_read_nb: _rxc_js_file_read_nb,
  /** @export */ rxc_js_file_rename: _rxc_js_file_rename,
  /** @export */ rxc_js_file_stat: _rxc_js_file_stat,
  /** @export */ rxc_js_file_truncate: _rxc_js_file_truncate,
  /** @export */ rxc_js_file_unlink: _rxc_js_file_unlink,
  /** @export */ rxc_js_file_write: _rxc_js_file_write,
  /** @export */ rxc_js_frame_due: _rxc_js_frame_due,
  /** @export */ rxc_js_gfx_fif: _rxc_js_gfx_fif,
  /** @export */ rxc_js_gfx_mode: _rxc_js_gfx_mode,
  /** @export */ rxc_js_gfx_submit: _rxc_js_gfx_submit,
  /** @export */ rxc_js_gfx_wait: _rxc_js_gfx_wait,
  /** @export */ rxc_js_load_image: _rxc_js_load_image,
  /** @export */ rxc_js_log: _rxc_js_log,
  /** @export */ rxc_js_mf_audio: _rxc_js_mf_audio,
  /** @export */ rxc_js_mf_audio_rate: _rxc_js_mf_audio_rate,
  /** @export */ rxc_js_mf_control: _rxc_js_mf_control,
  /** @export */ rxc_js_mf_frame: _rxc_js_mf_frame,
  /** @export */ rxc_js_mf_open: _rxc_js_mf_open,
  /** @export */ rxc_js_mf_time: _rxc_js_mf_time,
  /** @export */ rxc_js_note_program: _rxc_js_note_program,
  /** @export */ rxc_js_now: _rxc_js_now,
  /** @export */ rxc_js_prelink: _rxc_js_prelink,
  /** @export */ rxc_js_present: _rxc_js_present,
  /** @export */ rxc_js_set_title: _rxc_js_set_title,
  /** @export */ rxc_js_sleep: _rxc_js_sleep,
  /** @export */ rxc_js_stack: _rxc_js_stack,
  /** @export */ rxc_js_status: _rxc_js_status,
  /** @export */ rxc_js_thread_switch: _rxc_js_thread_switch,
  /** @export */ rxc_js_vnet_begin: _rxc_js_vnet_begin,
  /** @export */ rxc_js_vnet_poll: _rxc_js_vnet_poll,
  /** @export */ rxc_js_yield: _rxc_js_yield
};

// Argument name here must shadow the `wasmExports` global so
// that it is recognised by metadce and minify-import-export-names
// passes.
function applySignatureConversions(wasmExports) {
  // First, make a copy of the incoming exports object
  wasmExports = Object.assign({}, wasmExports);
  var makeWrapper_pp = f => a0 => f(a0) >>> 0;
  var makeWrapper_p = f => () => f() >>> 0;
  wasmExports["malloc"] = makeWrapper_pp(wasmExports["malloc"]);
  wasmExports["emscripten_stack_get_current"] = makeWrapper_p(wasmExports["emscripten_stack_get_current"]);
  wasmExports["_emscripten_stack_alloc"] = makeWrapper_pp(wasmExports["_emscripten_stack_alloc"]);
  return wasmExports;
}

// include: postamble.js
// === Auto-generated postamble setup entry stuff ===
async function callMain(args = []) {
  var entryFunction = _main;
  args.unshift(thisProgram);
  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv;
  for (var arg of args) {
    HEAPU32[((argv_ptr) >>> 2) >>> 0] = stringToUTF8OnStack(arg);
    argv_ptr += 4;
  }
  HEAPU32[((argv_ptr) >>> 2) >>> 0] = 0;
  try {
    var ret = entryFunction(argc, argv);
    // The current spec of JSPI returns a promise only if the function suspends
    // and a plain value otherwise. This will likely change:
    // https://github.com/WebAssembly/js-promise-integration/issues/11
    ret = await ret;
    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  } catch (e) {
    return handleException(e);
  }
}

async function run(args = programArgs) {
  preRun();
  if (runDependencies) {
    await resolveRunDependencies();
  }
  var setStatus = Module["setStatus"];
  if (setStatus) {
    setStatus("Running...");
    // Yield to the event loop to allow the browser to paint "Running..."
    await new Promise(resolve => setTimeout(resolve, 1));
    // Then we want to clear the status text, but only after the rest of this function runs.
    setTimeout(setStatus, 1, "");
  }
  if (ABORT) return;
  initRuntime();
  // No ATMAINS hooks
  Module["onRuntimeInitialized"]?.();
  var noInitialRun = Module["noInitialRun"] || false;
  if (!noInitialRun) await callMain(args);
  postRun();
}

var wasmExports;

// In modularize mode the generated code is within a factory function so we
// can use await here (since it's not top-level-await).
wasmExports = await createWasm();

await run();


    return Module;
  };
})();

// Export using a UMD style export, or ES6 exports if selected
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = Horseygame;
  // This default export looks redundant, but it allows TS to import this
  // commonjs style module.
  module.exports.default = Horseygame;
} else if (typeof define === 'function' && define['amd'])
  define([], () => Horseygame);

