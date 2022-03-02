var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// node_modules/@azizka/router/src/utils.js
var require_utils = __commonJS({
  "node_modules/@azizka/router/src/utils.js"(exports, module2) {
    function trimSlashes3(path) {
      return path.replace(/\/$/, "").replace(/^\//, "");
    }
    function transformURL(url, currentPath, root) {
      const newUrl = url.trim();
      const splits = newUrl.split("?");
      let path = splits[0].trim();
      const query2 = splits[1]?.trim();
      if (!path) {
        path = currentPath;
      } else {
        if (root !== "/") {
          path = path.replace(root, "");
        }
        path = trimSlashes3(path);
      }
      if (!query2) {
        return path;
      }
      return `${path}?${query2}`;
    }
    function parseQuery2(query2) {
      const data = {};
      let search = query2;
      if (query2[0] === "?") {
        search = query2.substring(1);
      }
      search.split("&").forEach((row) => {
        const parts = row.split("=");
        if (parts[0] !== "") {
          const key = decodeURIComponent(parts[0]);
          const value = parts[1] === void 0 ? "1" : parts[1];
          data[key] = value;
        }
      });
      return data;
    }
    function parseRouteRule(route) {
      if (typeof route === "string") {
        const uri = trimSlashes3(route);
        const rule = uri.replace(/([\\\/\-\_\.])/g, "\\$1").replace(/\{[a-zA-Z]+\}/g, "(:any)").replace(/\:any/g, "[\\w\\-\\_\\.]+").replace(/\:word/g, "[a-zA-Z]+").replace(/\:num/g, "\\d+");
        return new RegExp(`^${rule}$`, "i");
      }
      return route;
    }
    module2.exports = {
      trimSlashes: trimSlashes3,
      transformURL,
      parseQuery: parseQuery2,
      parseRouteRule
    };
  }
});

// node_modules/@azizka/router/src/router.js
var require_router = __commonJS({
  "node_modules/@azizka/router/src/router.js"(exports, module2) {
    var { trimSlashes: trimSlashes3, parseRouteRule } = require_utils();
    var Router2 = class {
      routes = [];
      root = "/";
      before;
      page404;
      constructor(options) {
        this.before = options?.before;
        this.page404 = options?.page404;
        if (options?.root) {
          this.root = options.root === "/" ? "/" : `/${trimSlashes3(options.root)}/`;
        }
        if (options?.routes) {
          this.addRoutes(options.routes);
        }
      }
      get rootPath() {
        return this.root;
      }
      addRoutes(routes) {
        for (const route of routes) {
          this.add(route.rule, route.handler, route.options);
        }
      }
      add(rule, handler, options) {
        this.routes.push({
          rule: parseRouteRule(rule),
          handler,
          options
        });
        return this;
      }
      remove(param) {
        this.routes.some((route, i) => {
          if (route.handler === param || route.rule === parseRouteRule(param)) {
            this.routes.splice(i, 1);
            return true;
          }
          return false;
        });
        return this;
      }
      findRoute(currentPath) {
        for (const route of this.routes) {
          const match = currentPath.match(route.rule);
          if (match) {
            return {
              match,
              route
            };
          }
        }
      }
      async processUrl(currentPath, currentQuery, state) {
        const doBreak = await this.before?.({
          fragment: currentPath,
          query: currentQuery,
          state
        });
        if (!doBreak) {
          const found = this.findRoute(currentPath);
          if (!found) {
            await this.page404?.({
              fragment: currentPath,
              query: currentQuery,
              state
            });
          } else {
            found.match.shift();
            const page = {
              fragment: currentPath,
              query: currentQuery,
              match: found.match,
              options: found.route.options,
              state
            };
            await found.route.handler?.(page);
          }
        }
      }
    };
    module2.exports = {
      Router: Router2
    };
  }
});

// node_modules/@azizka/router/src/route-navigator.js
var require_route_navigator = __commonJS({
  "node_modules/@azizka/router/src/route-navigator.js"(exports, module2) {
    var { transformURL, trimSlashes: trimSlashes3, parseQuery: parseQuery2 } = require_utils();
    var RouteNavigator = class {
      router;
      popStateHandler;
      constructor(router) {
        this.router = router;
        this.popStateHandler = () => {
          router.processUrl(this.fragment, this.query, history.state);
        };
      }
      get fragment() {
        let value = decodeURI(location.pathname);
        if (this.router.rootPath !== "/") {
          value = value.replace(this.router.rootPath, "");
        }
        return trimSlashes3(value);
      }
      get query() {
        return parseQuery2(location.search);
      }
      async redirectTo(url, state) {
        const newUrl = transformURL(url, this.fragment, this.router.rootPath);
        history.replaceState(state, "", this.router.rootPath + newUrl);
        const currentPath = this.fragment;
        const currentQuery = this.query;
        await this.router.processUrl(currentPath, currentQuery, state);
      }
      async navigateTo(url, state) {
        const newUrl = transformURL(url, this.fragment, this.router.rootPath);
        history.pushState(state, "", this.router.rootPath + newUrl);
        const currentPath = this.fragment;
        const currentQuery = this.query;
        await this.router.processUrl(currentPath, currentQuery, state);
      }
      refresh() {
        return this.redirectTo(this.fragment + location.search, history.state);
      }
      addUriListener() {
        window.addEventListener("popstate", this.popStateHandler);
      }
      removeUriListener() {
        window.removeEventListener("popstate", this.popStateHandler);
      }
    };
    module2.exports = {
      RouteNavigator
    };
  }
});

// node_modules/@azizka/router/src/mocks/location-mock.js
var require_location_mock = __commonJS({
  "node_modules/@azizka/router/src/mocks/location-mock.js"(exports, module2) {
    var LocationMock = class {
      pathname = "";
      search = "";
    };
    module2.exports = {
      LocationMock
    };
  }
});

// node_modules/@azizka/router/src/mocks/history-mock.js
var require_history_mock = __commonJS({
  "node_modules/@azizka/router/src/mocks/history-mock.js"(exports, module2) {
    var HistoryMock = class {
      location;
      constructor(location2) {
        this.location = location2;
      }
      replaceState(state, data, path) {
        this.changeLocation(path);
      }
      pushState(state, data, path) {
        this.changeLocation(path);
      }
      changeLocation(path) {
        let splits = path?.split?.("?");
        if (splits) {
          this.location.pathname = splits[0];
          if (splits.length > 1) {
            this.location.search = "?" + splits[1];
          }
        }
      }
    };
    module2.exports = {
      HistoryMock
    };
  }
});

// node_modules/@azizka/router/index.js
var require_router2 = __commonJS({
  "node_modules/@azizka/router/index.js"(exports, module2) {
    var { Router: Router2 } = require_router();
    var { RouteNavigator } = require_route_navigator();
    var { trimSlashes: trimSlashes3, transformURL, parseQuery: parseQuery2, parseRouteRule } = require_utils();
    var { LocationMock } = require_location_mock();
    var { HistoryMock } = require_history_mock();
    module2.exports = {
      Router: Router2,
      RouteNavigator,
      trimSlashes: trimSlashes3,
      transformURL,
      parseQuery: parseQuery2,
      parseRouteRule,
      LocationMock,
      HistoryMock
    };
  }
});

// node_modules/ejs/lib/utils.js
var require_utils2 = __commonJS({
  "node_modules/ejs/lib/utils.js"(exports) {
    "use strict";
    var regExpChars = /[|\\{}()[\]^$+*?.]/g;
    exports.escapeRegExpChars = function(string) {
      if (!string) {
        return "";
      }
      return String(string).replace(regExpChars, "\\$&");
    };
    var _ENCODE_HTML_RULES = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&#34;",
      "'": "&#39;"
    };
    var _MATCH_HTML = /[&<>'"]/g;
    function encode_char(c) {
      return _ENCODE_HTML_RULES[c] || c;
    }
    var escapeFuncStr = `var _ENCODE_HTML_RULES = {
      "&": "&amp;"
    , "<": "&lt;"
    , ">": "&gt;"
    , '"': "&#34;"
    , "'": "&#39;"
    }
  , _MATCH_HTML = /[&<>'"]/g;
function encode_char(c) {
  return _ENCODE_HTML_RULES[c] || c;
};
`;
    exports.escapeXML = function(markup) {
      return markup == void 0 ? "" : String(markup).replace(_MATCH_HTML, encode_char);
    };
    exports.escapeXML.toString = function() {
      return Function.prototype.toString.call(this) + ";\n" + escapeFuncStr;
    };
    exports.shallowCopy = function(to, from) {
      from = from || {};
      for (var p in from) {
        to[p] = from[p];
      }
      return to;
    };
    exports.shallowCopyFromList = function(to, from, list) {
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (typeof from[p] != "undefined") {
          to[p] = from[p];
        }
      }
      return to;
    };
    exports.cache = {
      _data: {},
      set: function(key, val) {
        this._data[key] = val;
      },
      get: function(key) {
        return this._data[key];
      },
      remove: function(key) {
        delete this._data[key];
      },
      reset: function() {
        this._data = {};
      }
    };
    exports.hyphenToCamel = function(str) {
      return str.replace(/-[a-z]/g, function(match) {
        return match[1].toUpperCase();
      });
    };
  }
});

// node_modules/ejs/package.json
var require_package = __commonJS({
  "node_modules/ejs/package.json"(exports, module2) {
    module2.exports = {
      name: "ejs",
      description: "Embedded JavaScript templates",
      keywords: [
        "template",
        "engine",
        "ejs"
      ],
      version: "3.1.6",
      author: "Matthew Eernisse <mde@fleegix.org> (http://fleegix.org)",
      license: "Apache-2.0",
      bin: {
        ejs: "./bin/cli.js"
      },
      main: "./lib/ejs.js",
      jsdelivr: "ejs.min.js",
      unpkg: "ejs.min.js",
      repository: {
        type: "git",
        url: "git://github.com/mde/ejs.git"
      },
      bugs: "https://github.com/mde/ejs/issues",
      homepage: "https://github.com/mde/ejs",
      dependencies: {
        jake: "^10.6.1"
      },
      devDependencies: {
        browserify: "^16.5.1",
        eslint: "^6.8.0",
        "git-directory-deploy": "^1.5.1",
        jsdoc: "^3.6.4",
        "lru-cache": "^4.0.1",
        mocha: "^7.1.1",
        "uglify-js": "^3.3.16"
      },
      engines: {
        node: ">=0.10.0"
      },
      scripts: {
        test: "mocha"
      }
    };
  }
});

// node_modules/ejs/lib/ejs.js
var require_ejs = __commonJS({
  "node_modules/ejs/lib/ejs.js"(exports) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var utils = require_utils2();
    var scopeOptionWarned = false;
    var _VERSION_STRING = require_package().version;
    var _DEFAULT_OPEN_DELIMITER = "<";
    var _DEFAULT_CLOSE_DELIMITER = ">";
    var _DEFAULT_DELIMITER = "%";
    var _DEFAULT_LOCALS_NAME = "locals";
    var _NAME = "ejs";
    var _REGEX_STRING = "(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)";
    var _OPTS_PASSABLE_WITH_DATA = [
      "delimiter",
      "scope",
      "context",
      "debug",
      "compileDebug",
      "client",
      "_with",
      "rmWhitespace",
      "strict",
      "filename",
      "async"
    ];
    var _OPTS_PASSABLE_WITH_DATA_EXPRESS = _OPTS_PASSABLE_WITH_DATA.concat("cache");
    var _BOM = /^\uFEFF/;
    exports.cache = utils.cache;
    exports.fileLoader = fs.readFileSync;
    exports.localsName = _DEFAULT_LOCALS_NAME;
    exports.promiseImpl = new Function("return this;")().Promise;
    exports.resolveInclude = function(name, filename, isDir) {
      var dirname = path.dirname;
      var extname = path.extname;
      var resolve = path.resolve;
      var includePath = resolve(isDir ? filename : dirname(filename), name);
      var ext = extname(name);
      if (!ext) {
        includePath += ".ejs";
      }
      return includePath;
    };
    function resolvePaths(name, paths) {
      var filePath;
      if (paths.some(function(v) {
        filePath = exports.resolveInclude(name, v, true);
        return fs.existsSync(filePath);
      })) {
        return filePath;
      }
    }
    function getIncludePath(path2, options) {
      var includePath;
      var filePath;
      var views = options.views;
      var match = /^[A-Za-z]+:\\|^\//.exec(path2);
      if (match && match.length) {
        path2 = path2.replace(/^\/*/, "");
        if (Array.isArray(options.root)) {
          includePath = resolvePaths(path2, options.root);
        } else {
          includePath = exports.resolveInclude(path2, options.root || "/", true);
        }
      } else {
        if (options.filename) {
          filePath = exports.resolveInclude(path2, options.filename);
          if (fs.existsSync(filePath)) {
            includePath = filePath;
          }
        }
        if (!includePath && Array.isArray(views)) {
          includePath = resolvePaths(path2, views);
        }
        if (!includePath && typeof options.includer !== "function") {
          throw new Error('Could not find the include file "' + options.escapeFunction(path2) + '"');
        }
      }
      return includePath;
    }
    function handleCache(options, template) {
      var func;
      var filename = options.filename;
      var hasTemplate = arguments.length > 1;
      if (options.cache) {
        if (!filename) {
          throw new Error("cache option requires a filename");
        }
        func = exports.cache.get(filename);
        if (func) {
          return func;
        }
        if (!hasTemplate) {
          template = fileLoader(filename).toString().replace(_BOM, "");
        }
      } else if (!hasTemplate) {
        if (!filename) {
          throw new Error("Internal EJS error: no file name or template provided");
        }
        template = fileLoader(filename).toString().replace(_BOM, "");
      }
      func = exports.compile(template, options);
      if (options.cache) {
        exports.cache.set(filename, func);
      }
      return func;
    }
    function tryHandleCache(options, data, cb) {
      var result;
      if (!cb) {
        if (typeof exports.promiseImpl == "function") {
          return new exports.promiseImpl(function(resolve, reject) {
            try {
              result = handleCache(options)(data);
              resolve(result);
            } catch (err) {
              reject(err);
            }
          });
        } else {
          throw new Error("Please provide a callback function");
        }
      } else {
        try {
          result = handleCache(options)(data);
        } catch (err) {
          return cb(err);
        }
        cb(null, result);
      }
    }
    function fileLoader(filePath) {
      return exports.fileLoader(filePath);
    }
    function includeFile(path2, options) {
      var opts = utils.shallowCopy({}, options);
      opts.filename = getIncludePath(path2, opts);
      if (typeof options.includer === "function") {
        var includerResult = options.includer(path2, opts.filename);
        if (includerResult) {
          if (includerResult.filename) {
            opts.filename = includerResult.filename;
          }
          if (includerResult.template) {
            return handleCache(opts, includerResult.template);
          }
        }
      }
      return handleCache(opts);
    }
    function rethrow(err, str, flnm, lineno, esc) {
      var lines = str.split("\n");
      var start = Math.max(lineno - 3, 0);
      var end = Math.min(lines.length, lineno + 3);
      var filename = esc(flnm);
      var context = lines.slice(start, end).map(function(line, i) {
        var curr = i + start + 1;
        return (curr == lineno ? " >> " : "    ") + curr + "| " + line;
      }).join("\n");
      err.path = filename;
      err.message = (filename || "ejs") + ":" + lineno + "\n" + context + "\n\n" + err.message;
      throw err;
    }
    function stripSemi(str) {
      return str.replace(/;(\s*$)/, "$1");
    }
    exports.compile = function compile(template, opts) {
      var templ;
      if (opts && opts.scope) {
        if (!scopeOptionWarned) {
          console.warn("`scope` option is deprecated and will be removed in EJS 3");
          scopeOptionWarned = true;
        }
        if (!opts.context) {
          opts.context = opts.scope;
        }
        delete opts.scope;
      }
      templ = new Template(template, opts);
      return templ.compile();
    };
    exports.render = function(template, d, o) {
      var data = d || {};
      var opts = o || {};
      if (arguments.length == 2) {
        utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA);
      }
      return handleCache(opts, template)(data);
    };
    exports.renderFile = function() {
      var args = Array.prototype.slice.call(arguments);
      var filename = args.shift();
      var cb;
      var opts = { filename };
      var data;
      var viewOpts;
      if (typeof arguments[arguments.length - 1] == "function") {
        cb = args.pop();
      }
      if (args.length) {
        data = args.shift();
        if (args.length) {
          utils.shallowCopy(opts, args.pop());
        } else {
          if (data.settings) {
            if (data.settings.views) {
              opts.views = data.settings.views;
            }
            if (data.settings["view cache"]) {
              opts.cache = true;
            }
            viewOpts = data.settings["view options"];
            if (viewOpts) {
              utils.shallowCopy(opts, viewOpts);
            }
          }
          utils.shallowCopyFromList(opts, data, _OPTS_PASSABLE_WITH_DATA_EXPRESS);
        }
        opts.filename = filename;
      } else {
        data = {};
      }
      return tryHandleCache(opts, data, cb);
    };
    exports.Template = Template;
    exports.clearCache = function() {
      exports.cache.reset();
    };
    function Template(text, opts) {
      opts = opts || {};
      var options = {};
      this.templateText = text;
      this.mode = null;
      this.truncate = false;
      this.currentLine = 1;
      this.source = "";
      options.client = opts.client || false;
      options.escapeFunction = opts.escape || opts.escapeFunction || utils.escapeXML;
      options.compileDebug = opts.compileDebug !== false;
      options.debug = !!opts.debug;
      options.filename = opts.filename;
      options.openDelimiter = opts.openDelimiter || exports.openDelimiter || _DEFAULT_OPEN_DELIMITER;
      options.closeDelimiter = opts.closeDelimiter || exports.closeDelimiter || _DEFAULT_CLOSE_DELIMITER;
      options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
      options.strict = opts.strict || false;
      options.context = opts.context;
      options.cache = opts.cache || false;
      options.rmWhitespace = opts.rmWhitespace;
      options.root = opts.root;
      options.includer = opts.includer;
      options.outputFunctionName = opts.outputFunctionName;
      options.localsName = opts.localsName || exports.localsName || _DEFAULT_LOCALS_NAME;
      options.views = opts.views;
      options.async = opts.async;
      options.destructuredLocals = opts.destructuredLocals;
      options.legacyInclude = typeof opts.legacyInclude != "undefined" ? !!opts.legacyInclude : true;
      if (options.strict) {
        options._with = false;
      } else {
        options._with = typeof opts._with != "undefined" ? opts._with : true;
      }
      this.opts = options;
      this.regex = this.createRegex();
    }
    Template.modes = {
      EVAL: "eval",
      ESCAPED: "escaped",
      RAW: "raw",
      COMMENT: "comment",
      LITERAL: "literal"
    };
    Template.prototype = {
      createRegex: function() {
        var str = _REGEX_STRING;
        var delim = utils.escapeRegExpChars(this.opts.delimiter);
        var open = utils.escapeRegExpChars(this.opts.openDelimiter);
        var close = utils.escapeRegExpChars(this.opts.closeDelimiter);
        str = str.replace(/%/g, delim).replace(/</g, open).replace(/>/g, close);
        return new RegExp(str);
      },
      compile: function() {
        var src;
        var fn;
        var opts = this.opts;
        var prepended = "";
        var appended = "";
        var escapeFn = opts.escapeFunction;
        var ctor;
        var sanitizedFilename = opts.filename ? JSON.stringify(opts.filename) : "undefined";
        if (!this.source) {
          this.generateSource();
          prepended += '  var __output = "";\n  function __append(s) { if (s !== undefined && s !== null) __output += s }\n';
          if (opts.outputFunctionName) {
            prepended += "  var " + opts.outputFunctionName + " = __append;\n";
          }
          if (opts.destructuredLocals && opts.destructuredLocals.length) {
            var destructuring = "  var __locals = (" + opts.localsName + " || {}),\n";
            for (var i = 0; i < opts.destructuredLocals.length; i++) {
              var name = opts.destructuredLocals[i];
              if (i > 0) {
                destructuring += ",\n  ";
              }
              destructuring += name + " = __locals." + name;
            }
            prepended += destructuring + ";\n";
          }
          if (opts._with !== false) {
            prepended += "  with (" + opts.localsName + " || {}) {\n";
            appended += "  }\n";
          }
          appended += "  return __output;\n";
          this.source = prepended + this.source + appended;
        }
        if (opts.compileDebug) {
          src = "var __line = 1\n  , __lines = " + JSON.stringify(this.templateText) + "\n  , __filename = " + sanitizedFilename + ";\ntry {\n" + this.source + "} catch (e) {\n  rethrow(e, __lines, __filename, __line, escapeFn);\n}\n";
        } else {
          src = this.source;
        }
        if (opts.client) {
          src = "escapeFn = escapeFn || " + escapeFn.toString() + ";\n" + src;
          if (opts.compileDebug) {
            src = "rethrow = rethrow || " + rethrow.toString() + ";\n" + src;
          }
        }
        if (opts.strict) {
          src = '"use strict";\n' + src;
        }
        if (opts.debug) {
          console.log(src);
        }
        if (opts.compileDebug && opts.filename) {
          src = src + "\n//# sourceURL=" + sanitizedFilename + "\n";
        }
        try {
          if (opts.async) {
            try {
              ctor = new Function("return (async function(){}).constructor;")();
            } catch (e) {
              if (e instanceof SyntaxError) {
                throw new Error("This environment does not support async/await");
              } else {
                throw e;
              }
            }
          } else {
            ctor = Function;
          }
          fn = new ctor(opts.localsName + ", escapeFn, include, rethrow", src);
        } catch (e) {
          if (e instanceof SyntaxError) {
            if (opts.filename) {
              e.message += " in " + opts.filename;
            }
            e.message += " while compiling ejs\n\n";
            e.message += "If the above error is not helpful, you may want to try EJS-Lint:\n";
            e.message += "https://github.com/RyanZim/EJS-Lint";
            if (!opts.async) {
              e.message += "\n";
              e.message += "Or, if you meant to create an async function, pass `async: true` as an option.";
            }
          }
          throw e;
        }
        var returnedFn = opts.client ? fn : function anonymous(data) {
          var include = function(path2, includeData) {
            var d = utils.shallowCopy({}, data);
            if (includeData) {
              d = utils.shallowCopy(d, includeData);
            }
            return includeFile(path2, opts)(d);
          };
          return fn.apply(opts.context, [data || {}, escapeFn, include, rethrow]);
        };
        if (opts.filename && typeof Object.defineProperty === "function") {
          var filename = opts.filename;
          var basename = path.basename(filename, path.extname(filename));
          try {
            Object.defineProperty(returnedFn, "name", {
              value: basename,
              writable: false,
              enumerable: false,
              configurable: true
            });
          } catch (e) {
          }
        }
        return returnedFn;
      },
      generateSource: function() {
        var opts = this.opts;
        if (opts.rmWhitespace) {
          this.templateText = this.templateText.replace(/[\r\n]+/g, "\n").replace(/^\s+|\s+$/gm, "");
        }
        this.templateText = this.templateText.replace(/[ \t]*<%_/gm, "<%_").replace(/_%>[ \t]*/gm, "_%>");
        var self = this;
        var matches = this.parseTemplateText();
        var d = this.opts.delimiter;
        var o = this.opts.openDelimiter;
        var c = this.opts.closeDelimiter;
        if (matches && matches.length) {
          matches.forEach(function(line, index) {
            var closing;
            if (line.indexOf(o + d) === 0 && line.indexOf(o + d + d) !== 0) {
              closing = matches[index + 2];
              if (!(closing == d + c || closing == "-" + d + c || closing == "_" + d + c)) {
                throw new Error('Could not find matching close tag for "' + line + '".');
              }
            }
            self.scanLine(line);
          });
        }
      },
      parseTemplateText: function() {
        var str = this.templateText;
        var pat = this.regex;
        var result = pat.exec(str);
        var arr = [];
        var firstPos;
        while (result) {
          firstPos = result.index;
          if (firstPos !== 0) {
            arr.push(str.substring(0, firstPos));
            str = str.slice(firstPos);
          }
          arr.push(result[0]);
          str = str.slice(result[0].length);
          result = pat.exec(str);
        }
        if (str) {
          arr.push(str);
        }
        return arr;
      },
      _addOutput: function(line) {
        if (this.truncate) {
          line = line.replace(/^(?:\r\n|\r|\n)/, "");
          this.truncate = false;
        }
        if (!line) {
          return line;
        }
        line = line.replace(/\\/g, "\\\\");
        line = line.replace(/\n/g, "\\n");
        line = line.replace(/\r/g, "\\r");
        line = line.replace(/"/g, '\\"');
        this.source += '    ; __append("' + line + '")\n';
      },
      scanLine: function(line) {
        var self = this;
        var d = this.opts.delimiter;
        var o = this.opts.openDelimiter;
        var c = this.opts.closeDelimiter;
        var newLineCount = 0;
        newLineCount = line.split("\n").length - 1;
        switch (line) {
          case o + d:
          case o + d + "_":
            this.mode = Template.modes.EVAL;
            break;
          case o + d + "=":
            this.mode = Template.modes.ESCAPED;
            break;
          case o + d + "-":
            this.mode = Template.modes.RAW;
            break;
          case o + d + "#":
            this.mode = Template.modes.COMMENT;
            break;
          case o + d + d:
            this.mode = Template.modes.LITERAL;
            this.source += '    ; __append("' + line.replace(o + d + d, o + d) + '")\n';
            break;
          case d + d + c:
            this.mode = Template.modes.LITERAL;
            this.source += '    ; __append("' + line.replace(d + d + c, d + c) + '")\n';
            break;
          case d + c:
          case "-" + d + c:
          case "_" + d + c:
            if (this.mode == Template.modes.LITERAL) {
              this._addOutput(line);
            }
            this.mode = null;
            this.truncate = line.indexOf("-") === 0 || line.indexOf("_") === 0;
            break;
          default:
            if (this.mode) {
              switch (this.mode) {
                case Template.modes.EVAL:
                case Template.modes.ESCAPED:
                case Template.modes.RAW:
                  if (line.lastIndexOf("//") > line.lastIndexOf("\n")) {
                    line += "\n";
                  }
              }
              switch (this.mode) {
                case Template.modes.EVAL:
                  this.source += "    ; " + line + "\n";
                  break;
                case Template.modes.ESCAPED:
                  this.source += "    ; __append(escapeFn(" + stripSemi(line) + "))\n";
                  break;
                case Template.modes.RAW:
                  this.source += "    ; __append(" + stripSemi(line) + ")\n";
                  break;
                case Template.modes.COMMENT:
                  break;
                case Template.modes.LITERAL:
                  this._addOutput(line);
                  break;
              }
            } else {
              this._addOutput(line);
            }
        }
        if (self.opts.compileDebug && newLineCount) {
          this.currentLine += newLineCount;
          this.source += "    ; __line = " + this.currentLine + "\n";
        }
      }
    };
    exports.escapeXML = utils.escapeXML;
    exports.__express = exports.renderFile;
    exports.VERSION = _VERSION_STRING;
    exports.name = _NAME;
    if (typeof window != "undefined") {
      window.ejs = exports;
    }
  }
});

// node_modules/@azizka/i18n/src/utils.js
var require_utils3 = __commonJS({
  "node_modules/@azizka/i18n/src/utils.js"(exports, module2) {
    function isObject(obj) {
      const type = typeof obj;
      return type === "function" || type === "object" && !!obj;
    }
    module2.exports = {
      isObject
    };
  }
});

// node_modules/@azizka/i18n/src/translator.js
var require_translator = __commonJS({
  "node_modules/@azizka/i18n/src/translator.js"(exports, module2) {
    var { isObject } = require_utils3();
    var Translator3 = class {
      data;
      globalContext;
      extension;
      constructor() {
        this.resetContext();
      }
      static create(data) {
        const translator = new Translator3();
        translator.add(data);
        return translator;
      }
      translate(text, defaultNumOrFormatting, numOrFormattingOrContext, formattingOrContext) {
        let num = void 0;
        let formatting = void 0;
        let context = this.globalContext;
        if (isObject(defaultNumOrFormatting)) {
          formatting = defaultNumOrFormatting;
          if (isObject(numOrFormattingOrContext)) {
            context = numOrFormattingOrContext;
          }
        } else if (typeof defaultNumOrFormatting === "number") {
          num = defaultNumOrFormatting;
          formatting = numOrFormattingOrContext;
          if (formattingOrContext) {
            context = formattingOrContext;
          }
        } else {
          if (typeof numOrFormattingOrContext === "number") {
            num = numOrFormattingOrContext;
            formatting = formattingOrContext;
          } else {
            formatting = numOrFormattingOrContext;
            if (formattingOrContext) {
              context = formattingOrContext;
            }
          }
        }
        return this.translateText(text, num, formatting, context);
      }
      add(data) {
        if (!this.data) {
          this.data = data;
        } else {
          if (data.values && this.data.values) {
            for (const key of Object.keys(data.values)) {
              this.data.values[key] = data.values[key];
            }
          }
          if (data.contexts && this.data.contexts) {
            for (const context of data.contexts) {
              this.data.contexts.push(context);
            }
          }
        }
      }
      setContext(key, value) {
        his.globalContext[key] = value;
      }
      extend(extension) {
        this.extension = extension;
      }
      clearContext(key) {
        delete this.globalContext[key];
      }
      reset() {
        this.resetData();
        this.resetContext();
      }
      resetData() {
        this.data = {
          values: {},
          contexts: []
        };
      }
      resetContext() {
        this.globalContext = {};
      }
      translateText(text, num, formatting, context) {
        context = context || this.globalContext;
        if (!this.data) {
          return this.useOriginalText("" + text, num, formatting);
        }
        const contextData = this.getContextData(this.data, context);
        let result = null;
        if (contextData) {
          result = this.findTranslation(text, num, formatting, contextData?.values);
        }
        if (result === null) {
          result = this.findTranslation(text, num, formatting, this.data.values);
        }
        if (result === null) {
          result = this.useOriginalText("" + text, num, formatting);
        }
        return result;
      }
      findTranslation(text, num, formatting, data) {
        let value = data?.[text];
        if (value === void 0) {
          return null;
        }
        if (typeof value === "object" && !Array.isArray(value)) {
          if (this.extension) {
            value = "" + this.extension(text, num, formatting, value);
            value = this.applyNumbers(value, num || 0);
            return this.applyFormatting(value, formatting);
          } else {
            return this.useOriginalText("" + text, num, formatting);
          }
        }
        if (num === void 0 && typeof value === "string") {
          return this.applyFormatting(value, formatting);
        } else if (value instanceof Array) {
          for (const triple of value) {
            if (num === void 0 && triple[0] === null && triple[1] === null || num !== void 0 && (triple[0] !== null && num >= triple[0] && (triple[1] === null || num <= triple[1]) || triple[0] === null && triple[1] && num <= triple[1])) {
              const numVal = num || 0;
              const textVal = "" + (triple[2] ?? "");
              const result = this.applyNumbers(textVal, numVal);
              return this.applyFormatting(result, formatting);
            }
          }
        }
        return null;
      }
      applyNumbers(str, num) {
        str = str.replace("-%n", "" + -num);
        str = str.replace("%n", "" + num);
        return str;
      }
      applyFormatting(text, formatting) {
        if (formatting) {
          for (const key of Object.keys(formatting)) {
            const regex = new RegExp(`%{${key}}`, "g");
            text = text.replace(regex, formatting[key]);
          }
        }
        return text;
      }
      getContextData(data, context) {
        if (!data.contexts) {
          return null;
        }
        for (const ctx of data.contexts) {
          let equal = true;
          for (const key of Object.keys(ctx.matches)) {
            const value = ctx.matches[key];
            equal = equal && value === context[key];
            if (!equal)
              break;
          }
          if (equal) {
            return ctx;
          }
        }
        return null;
      }
      useOriginalText(text, num, formatting) {
        if (num === void 0) {
          return this.applyFormatting(text, formatting);
        }
        return this.applyFormatting(text.replace("%n", "" + num), formatting);
      }
    };
    module2.exports = {
      Translator: Translator3
    };
  }
});

// node_modules/@azizka/i18n/index.js
var require_i18n = __commonJS({
  "node_modules/@azizka/i18n/index.js"(exports, module2) {
    var { Translator: Translator3 } = require_translator();
    var { isObject } = require_utils3();
    module2.exports = {
      Translator: Translator3,
      isObject
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _log(message) {
      console.log(`[dotenv][DEBUG] ${message}`);
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function config(options) {
      let dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (options) {
        if (options.path != null) {
          dotenvPath = _resolveHome(options.path);
        }
        if (options.encoding != null) {
          encoding = options.encoding;
        }
      }
      try {
        const parsed = DotenvModule.parse(fs.readFileSync(dotenvPath, { encoding }));
        Object.keys(parsed).forEach(function(key) {
          if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
            process.env[key] = parsed[key];
          } else {
            if (override === true) {
              process.env[key] = parsed[key];
            }
            if (debug) {
              if (override === true) {
                _log(`"${key}" is already defined in \`process.env\` and WAS overwritten`);
              } else {
                _log(`"${key}" is already defined in \`process.env\` and was NOT overwritten`);
              }
            }
          }
        });
        return { parsed };
      } catch (e) {
        if (debug) {
          _log(`Failed to load ${dotenvPath} ${e.message}`);
        }
        return { error: e };
      }
    }
    var DotenvModule = {
      config,
      parse
    };
    module2.exports.config = DotenvModule.config;
    module2.exports.parse = DotenvModule.parse;
    module2.exports = DotenvModule;
  }
});

// src/server/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
var import_http = require("http");

// src/server/app.ts
var import_path = require("path");
var import_router3 = __toESM(require_router2());

// src/server/templates/pages/home-page.ts
var import_ejs = __toESM(require_ejs());

// src/server/templates/pages/home-page.ejs
var home_page_default = '<div data-page="home-page">    \n  <div>\n    Home page, time: <%= data.time %> \n  </div>\n  <br>\n  <button class="btn btn-primary btn-exited" data-button="scroll-top">\n    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">\n      <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>\n    </svg>\n  </button>\n  <div>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n    <br>\n    Lorem ipsum dolor sit amet consectetur adipisicing elit. \n    Repudiandae necessitatibus blanditiis quidem aperiam veritatis \n    laudantium commodi exercitationem beatae, adipisci sed sapiente vero excepturi, \n    veniam minima dolor rem alias optio! Inventore!\n  </div>\n</div>\n';

// src/server/templates/pages/home-page.ts
var home_page_default2 = import_ejs.default.compile(home_page_default);

// src/server/helpers/layout-helpers.ts
var import_i18n2 = __toESM(require_i18n());

// src/server/templates/layouts/default-layout.ts
var import_ejs2 = __toESM(require_ejs());

// src/server/templates/layouts/default-layout.ejs
var default_layout_default = `<!DOCTYPE html>
<html lang="<%= data.lang %>">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= helpers.tr('Catalog of Services') %></title>
  <link rel='icon' type='image/png' href='<%= data.rootLink %>favicon.png'>
  <link rel="stylesheet" href="<%= data.rootLink %>dist/<%= data.version %>/css/main.css">
</head>
<body>
  <div class="splash">
    <div class="loader" data-page="loader-page">
      <div class="loader-container">
        <img src="/favicon.png">
        <div class="loader-container-progress"></div>
      </div>
    </div>
  </div>
  <script>
    const splashElem = document.querySelector('.splash');

    splashElem?.classList.add('splash-open');
  <\/script>
  <% if(data.content) { %> 
    <%- 
      partials[data.content]({
        data: data.contentData,
        partials,
        helpers
      }) 
    %> 
  <% } %>     
  <script src="/dist/<%= data.version %>/js/main.js" type="module"><\/script>
</body>
</html>
`;

// src/server/templates/layouts/default-layout.ts
var default_layout_default2 = import_ejs2.default.compile(default_layout_default);

// src/server/templates/layouts/main-layout.ts
var import_ejs3 = __toESM(require_ejs());

// src/server/templates/layouts/main-layout.ejs
var main_layout_default = `<div data-layout="main-layout">
  <header class="app-bar">
    <div class="app-bar-row">      
      <div class="app-bar-section app-bar-section-fill">
        <div class="search">
          <form method="post">          
            <input 
              type="text" 
              name="search" 
              class="search-input app-bar-title"
              autocomplete="off"
            >
            <svg class="search-icon search-icon-left" viewBox="0 0 16 16">
              <path 
                fill-rule="evenodd" 
                d="
                  M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 
                  4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z
                "
              />
            </svg>
            <svg class="search-icon search-icon-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
              <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
            </svg>
          </form>    
          <div class="search-list"></div>    
        </div>
      </div>
      <div class="app-bar-section app-bar-section-align-start">
        <a 
          data-button="navigation"          
          href="?<%= helpers.toggleQueryParameter(data.query, 'main-layout-navigation') %> "
        >
          <svg class="app-bar-icon" viewBox="0 0 16 16">
            <path 
              fill-rule="evenodd" 
              d="
                M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 
                .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 
                0 1H3a.5.5 0 0 1-.5-.5z
              "
            />
          </svg>          
        </a>
      </div>
      <div class="app-bar-section app-bar-section-align-end">
        <a 
          data-button="search"
          href="?<%= helpers.toggleQueryParameter(data.query, 'main-layout-search') %> "
        >
          <svg class="app-bar-icon" viewBox="0 0 16 16">
            <path 
              d="
                M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 
                1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 
                0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 
                0 0 1-.5-.5z
              "
            />
          </svg>
        </a>
      </div>
    </div>
  </header>
  <aside class="drawer drawer-hoverable <%= data.navigation ? 'drawer-open' : '' %>">
    <div class="drawer-header">
      <a 
        data-button="header-navigation"
        href="?<%= helpers.toggleQueryParameter(data.query, 'main-layout-navigation') %> "
        data-icon="header-navigation-icon"
      >
        <svg  
          class="drawer-header-icon <%= data.navigation ? '' : 'drawer-header-icon-hide' %>" 
          viewBox="0 0 16 16"
          data-icon="header-navigation-icon"
        >
          <path 
            d="
              M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 
              2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z
            "
          />
        </svg>                       
      </a>
    </div>
    <div class="drawer-content">
      <div class="drawer-account-bar">
        <div class="drawer-account-bar-avatar">   
          <% if(data.user) { %>   
            <img 
              src="<%= data.user.photo %>" 
              alt="<%= data.user.name %>"
              class="drawer-account-bar-avatar-photo"
            >
          <% } else { %>
            <svg class="drawer-account-bar-avatar-icon" viewBox="0 0 16 16">
              <path 
                d="
                  M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 
                  0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 
                  10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z
                "
              />
            </svg>
          <% } %> 
        </div>
        <div class="drawer-account-bar-actions">   
          <% if(data.user) { %>   
            <a 
              href="#"
              data-content="user-name"
              style="white-space: nowrap; overflow: hidden;"
            >
              <%= data.user.name %>
            </a>
            <a 
              href="/auth/sign-out?redirect=/<%= data.lang %>/sign-in" 
              data-content="sign-out"
              style="white-space: nowrap; overflow: hidden;"
            >
              <%= helpers.tr('Sign Out') %>
            </a>
          <% } else { %>  
            <a 
              href="/<%= data.lang %>/sign-in" 
              data-content="sign-in-up"
              style="white-space: nowrap; overflow: hidden;"
            >
              <%= helpers.tr('Sign In/Up') %>
            </a>
          <% } %>       
        </div>
      </div>
      <div class="drawer-lang-bar">
        <img 
          src="<%= data.languages[data.lang].image %>" 
          class="drawer-lang-bar-flag"
          data-image="lang"
        >
        <label>
          <input type="checkbox">
          <div class="drawer-lang-bar-current">            
            <span data-content="lang">
              <%= data.languages[data.lang].label %>            
            </span> 
            <svg class="drawer-lang-bar-current-icon" viewBox="0 0 16 16">
              <path 
                fill-rule="evenodd" 
                d="
                  M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 
                  0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 
                  3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z
                "
              />
            </svg>
            <div class="drawer-lang-bar-current-progress"></div>
          </div>
          <div class="list" data-list="lang">
            <a 
              data-list-item="lang-kz"
              class="list-item <%= data.lang === 'kz' ? 'list-item-activated' : '' %>"
              href="/<%= helpers.changeLangPath(data.url, 'kz') %>"
            >
              <img 
                src="/images/flags/kz.svg" 
                class="drawer-lang-bar-flag"
              >
              <%= data.languages['kz'].label %>
            </a>
            <a 
              data-list-item="lang-ru"
              class="list-item <%= data.lang === 'ru' ? 'list-item-activated' : '' %>"
              href="/<%= helpers.changeLangPath(data.url, 'ru') %>"
            >
              <img 
                src="/images/flags/ru.svg" 
                class="drawer-lang-bar-flag"
              >
              <%= data.languages['ru'].label %>
            </a>
            <a 
              data-list-item="lang-en"
              class="list-item <%= data.lang === 'en' ? 'list-item-activated' : '' %>"
              href="/<%= helpers.changeLangPath(data.url, 'en') %>"
            >
              <img 
                src="/images/flags/en.svg" 
                class="drawer-lang-bar-flag"
              >
              <%= data.languages['en'].label %>
            </a>
          </div>
        </label>
      </div>
      <div class="list" data-list="main">
        <a class="list-item list-item-activated">          
          <svg class="list-item-icon" viewBox="0 0 16 16">
            <path 
              d="
                M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 
                1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 
                0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 
                3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 
                .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 
                0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z
              "
            />
          </svg>
          Inbox
        </a>
        <a class="list-item">
          <svg class="list-item-icon" viewBox="0 0 16 16">
            <path 
              fill-rule="evenodd" 
              d="
                M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 
                0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 
                0 0 0 .886-.083l6-15Zm-1.833 1.89.471-1.178-1.178.471L5.93 9.363l.338.215a.5.5 
                0 0 1 .154.154l.215.338 7.494-7.494Z
              "
            />
          </svg>
          Outgoing
        </a>
        <a class="list-item">          
          <svg class="list-item-icon" viewBox="0 0 16 16">
            <path 
              d="
                M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 
                1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 
                1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 
                1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 
                1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 
                2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 
                1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 
                1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 
                1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z
              "
            />
          </svg>
          Settings
        </a>
      </div>
    </div>
  </aside>
  <main id="main-content" class="main-content app-bar-fixed-adjust">
    <% if(data.content) { %> 
      <%- 
        partials[data.content]({
          data: data.contentData,
          partials,
          helpers
        }) 
      %> 
    <% } %> 
  </main>
</div>
`;

// src/server/templates/layouts/main-layout.ts
var main_layout_default2 = import_ejs3.default.compile(main_layout_default);

// src/server/helpers/locale-helpers.ts
var import_i18n = __toESM(require_i18n());

// src/locales/en.ts
var en_default = {
  values: {
    "Catalog of Services": "Catalog of Services",
    "Sign In": "Sign In",
    "Sign Up": "Sign Up",
    "Sign In/Up": "Sign In/Up",
    "Sign Out": "Sign Out",
    "Name": "Name",
    "Password": "Password",
    "Photo": "Photo",
    "Cancel": "Cancel",
    "Or use the service": "Or use the service",
    "Auth service": "Auth service"
  }
};

// src/locales/ru.ts
var ru_default = {
  values: {
    "Catalog of Services": "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0443\u0441\u043B\u0443\u0433",
    "Sign In": "\u0412\u043E\u0439\u0442\u0438",
    "Sign Up": "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F",
    "Sign In/Up": "\u0412\u043E\u0439\u0442\u0438 \u0438\u043B\u0438 \u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F",
    "Sign Out": "\u0412\u044B\u0439\u0442\u0438",
    "Name": "\u0418\u043C\u044F",
    "Password": "\u041F\u0430\u0440\u043E\u043B\u044C",
    "Cancel": "\u041E\u0442\u043C\u0435\u043D\u0430",
    "Photo": "\u0424\u043E\u0442\u043E",
    "Or use the service": "\u0418\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u0441\u0435\u0440\u0432\u0438\u0441",
    "Auth service": "\u0421\u0435\u0440\u0432\u0438\u0441 \u0430\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438"
  }
};

// src/locales/kz.ts
var kz_default = {
  values: {
    "Catalog of Services": "\u049A\u044B\u0437\u043C\u0435\u0442\u0442\u0435\u0440 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u044B",
    "Sign In": "\u041A\u0456\u0440\u0443",
    "Sign Up": "\u0422\u0456\u0440\u043A\u0435\u043B\u0443",
    "Sign In/Up": "\u041A\u0456\u0440\u0443 \u043D\u0435\u043C\u0435\u0441\u0435 \u0422\u0456\u0440\u043A\u0435\u043B\u0443",
    "Sign Out": "\u0428\u044B\u0493\u0443",
    "Name": "\u0410\u0442\u044B",
    "Password": "\u041F\u0430\u0440\u043E\u043B\u044C",
    "Photo": "\u0424\u043E\u0442\u043E",
    "Cancel": "\u0411\u043E\u043B\u0434\u044B\u0440\u043C\u0430\u0443",
    "Or use the service": "\u041D\u0435\u043C\u0435\u0441\u0435 \u0441\u0435\u0440\u0432\u0438\u0441\u0442\u0456 \u049B\u043E\u043B\u0434\u0430\u04A3\u044B\u0437",
    "Auth service": "\u0410\u0443\u0442\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u044F \u0441\u0435\u0440\u0432\u0438\u0441\u0456"
  }
};

// src/server/helpers/locale-helpers.ts
var locale_helpers_default = {
  en: import_i18n.Translator.create(en_default),
  ru: import_i18n.Translator.create(ru_default),
  kz: import_i18n.Translator.create(kz_default)
};

// src/helpers.ts
var import_router = __toESM(require_router2());

// src/globals.ts
var PAGE_ROOT = "/";
var LANGUAGES = {
  kz: {
    image: "/images/flags/kz.svg",
    label: "\u049A\u0430\u0437\u0430\u049B\u0448\u0430"
  },
  ru: {
    image: "/images/flags/ru.svg",
    label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439"
  },
  en: {
    image: "/images/flags/en.svg",
    label: "English"
  }
};
var DEFAULT_LANGUAGE = "kz";

// src/helpers.ts
function getQueryParameters(query2) {
  const parameters = [];
  for (let key of Object.keys(query2)) {
    if (query2[key]) {
      parameters.push(`${key}=${query2[key]}`);
    } else {
      parameters.push(key);
    }
  }
  return parameters.join("&");
}
function setQueryParameter(query2, parameter, value) {
  const data = { ...query2 };
  data[parameter] = value;
  return getQueryParameters(data);
}
function toggleQueryParameter(query2, parameter) {
  const data = { ...query2 };
  if (parameter in data) {
    delete data[parameter];
    return getQueryParameters(data);
  }
  return setQueryParameter(data, parameter, "1");
}
var localeRoute = `(${Object.keys(LANGUAGES).join("|")})?`;
function changeLangPath(url, lang) {
  url = (0, import_router.trimSlashes)(url);
  const langRoute = new RegExp(`^(${Object.keys(LANGUAGES).join("|")})`);
  const index = url.search(langRoute);
  if (index >= 0) {
    return url.replace(langRoute, lang);
  }
  return `${lang}/${url}`;
}

// src/server/helpers/layout-helpers.ts
var layoutHandlersMap = {
  "main-layout": mainLayoutHandler
};
function stringToArray(param) {
  if (param) {
    const array = param.split(",");
    return array.map((item) => item.trim());
  }
  return [];
}
function getLayoutHandlers(layouts) {
  const handlers = [];
  for (const layout of layouts) {
    if (layout in layoutHandlersMap) {
      handlers.push({
        name: layout,
        handler: layoutHandlersMap[layout]
      });
    }
  }
  return handlers;
}
function renderPage(lang, rootLink, version2, page, pageName, pageLayout, data, layoutHandlers, partials, helpers) {
  const translator = lang in locale_helpers_default ? locale_helpers_default[lang] : new import_i18n2.Translator();
  partials = {
    ...partials
  };
  helpers = {
    ...helpers,
    tr: translator.translate.bind(translator)
  };
  data = {
    ...data,
    lang,
    rootLink
  };
  let viewName = pageName;
  let view = pageLayout;
  if (layoutHandlers) {
    for (const handlerInfo of layoutHandlers) {
      const handler = handlerInfo.handler;
      const viewData = handler(page, {
        lang,
        rootLink,
        data,
        helpers,
        partials,
        viewName,
        view
      });
      data = viewData.data;
      helpers = viewData.helpers;
      partials = viewData.partials;
      view = viewData.view;
      viewName = handlerInfo.name;
    }
  }
  if (!page.query.ajax) {
    if (viewName) {
      partials[viewName] = view;
    }
    view = default_layout_default2;
    data = {
      lang,
      rootLink,
      version: version2,
      content: viewName,
      contentData: data
    };
  }
  return view({
    data,
    partials,
    helpers
  });
}
function mainLayoutHandler(page, input) {
  const view = main_layout_default2;
  const lang = input.lang;
  const url = page.fragment;
  const rootLink = input.rootLink;
  input.partials[input.viewName] = input.view;
  const helpers = {
    ...input.helpers,
    toggleQueryParameter,
    changeLangPath
  };
  const navigation = page.query["main-layout-navigation"] === "1";
  const search = page.query["main-layout-search"] === "1";
  const data = {
    lang,
    rootLink,
    navigation,
    search,
    url,
    query: page.query,
    languages: LANGUAGES,
    content: input.viewName,
    contentData: input.data
  };
  return {
    data,
    helpers,
    partials: input.partials,
    view
  };
}

// package.json
var version = "1.0.0";

// src/server/home/routes.ts
var routes_default = [{
  rule: `${localeRoute}/?`,
  async handler(page) {
    if (page.state) {
      const lang = page.match?.[0] || DEFAULT_LANGUAGE;
      const data = {
        time: Date.now()
      };
      if (page.query.ajax && !page.query.init) {
        page.state.response.setHeader("Content-Type", "application/json;charset=UTF-8");
        page.state.response.write(JSON.stringify(data));
      } else {
        const layouts = !page.query.ajax ? ["main-layout"] : stringToArray(page.query.layouts);
        const layoutHandlers = getLayoutHandlers(layouts);
        page.state.response.setHeader("Content-Type", "text/html;charset=UTF-8");
        page.state.response.write(renderPage(lang, PAGE_ROOT, version, page, "home-page", home_page_default2, data, layoutHandlers));
      }
    }
  }
}];

// src/server/templates/pages/sign-in-page.ts
var import_ejs4 = __toESM(require_ejs());

// src/server/templates/pages/sign-in-page.ejs
var sign_in_page_default = `<div data-page="signin-page">
  <div class="main-card">
    <div class="card main-card-body">
      <div class="card-body">
        <h2 
          data-title="main"
          style="text-transform: uppercase; font-weight: lighter;"
        >
          <%= helpers.tr('Sign In') %>
        </h2>
        <form method="post" class="mb-1">
          <div class="form-item mb-1">
            <label class="form-label">            
              <input 
                type="email" 
                name="email" 
                id="email" 
                class="form-control" 
                placeholder="Email*"
                required                
              >          
              <span>
                Email*
              </span>
            </label>          
          </div>
          <div class="form-item mb-1">
            <label class="form-label">
              <input 
                type="password" 
                name="password" 
                id="password" 
                class="form-control" 
                placeholder="<%= helpers.tr('Password') %>*"
                required
              >
              <span 
                id="password-label"
              >
                <%= helpers.tr('Password') %>*
              </span>
            </label>          
          </div>
          <div style="text-align: right;" class="mb-1">
            <a 
              class="btn btn-light" 
              href="<%= data.rootLink %>sign-up" 
              data-button="sign-up"
            >
              <%= helpers.tr('Sign Up') %> 
            </a>
          </div>
          <div style="text-align: right;">
            <button 
              type="submit" 
              class="btn btn-success"
              data-button="sign-in"
            >
              <%= helpers.tr('Sign In') %> 
            </button>
            <a 
              class="btn btn-danger" 
              href="<%= data.rootLink %> "
              data-button="cancel"
            >
              <%= helpers.tr('Cancel') %> 
            </a>
          </div>
        </form>
        <%- 
          partials['auth-service-component']({
            data,
            partials,
            helpers
          })
        %> 
      </div>
    </div>
  </div>  
</div>
`;

// src/server/templates/pages/sign-in-page.ts
var sign_in_page_default2 = import_ejs4.default.compile(sign_in_page_default);

// src/server/templates/components/auth-service-component.ts
var import_ejs5 = __toESM(require_ejs());

// src/server/templates/components/auth-service-component.ejs
var auth_service_component_default = `<h3 
  style="text-transform: uppercase; font-weight: lighter;"
  data-title="auth-service"
>
  <%= helpers.tr('Or use the service') %>
</h3>
<div>
  <a
    href="/auth/service/github?lang=<%= data.lang %>"  
    data-button="auth-service-github" 
    title="GitHub"
  >
    <svg class="main-card-service-icon" viewBox="0 0 16 16">
      <path 
        d="
          M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 
          0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 
          1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 
          0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 
          1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 
          3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 
          8c0-4.42-3.58-8-8-8z
        "
      />
    </svg>    
  </a>
</div>
`;

// src/server/templates/components/auth-service-component.ts
var auth_service_component_default2 = import_ejs5.default.compile(auth_service_component_default);

// src/server/sign-in/routes.ts
var routes_default2 = [{
  rule: `${localeRoute}/?sign-in`,
  async handler(page) {
    if (page.state) {
      const lang = page.match?.[0] || DEFAULT_LANGUAGE;
      const data = {};
      if (page.query.ajax && !page.query.init) {
        page.state.response.setHeader("Content-Type", "application/json;charset=UTF-8");
        page.state.response.write(JSON.stringify(data));
      } else {
        page.state.response.setHeader("Content-Type", "text/html;charset=UTF-8");
        page.state.response.write(renderPage(lang, PAGE_ROOT, version, page, "sign-in-page", sign_in_page_default2, data, void 0, {
          "auth-service-component": auth_service_component_default2
        }));
      }
    }
  }
}];

// src/server/templates/pages/sign-up-page.ts
var import_ejs6 = __toESM(require_ejs());

// src/server/templates/pages/sign-up-page.ejs
var sign_up_page_default = `<div data-page="signup-page">
  <div class="main-card">
    <div class="card main-card-body">
      <div class="card-body">
        <h2 
          data-title="main"
          style="text-transform: uppercase; font-weight: lighter;"
        >
          <%= helpers.tr('Sign Up') %>
        </h2>
        <form method="post" class="mb-1">
          <div class="form-item mb-1">
            <label 
              for="name" 
              class="form-label"            
            >
              <input 
                type="text" 
                name="name" 
                id="name" 
                class="form-control" 
                placeholder="<%= helpers.tr('Name') %>*"
                required
              >
              <span 
                id="name-label"
              >
                <%= helpers.tr('Name') %>*
              </span>            
            </label>          
          </div>
          <div class="form-item mb-1">
            <label 
              for="email" 
              class="form-label"
            >
              <input 
                type="email" 
                name="email" 
                id="email" 
                class="form-control" 
                placeholder="Email*"
                required
              >          
              <span>
                Email*
              </span>
            </label>          
          </div>
          <div class="form-item mb-1">
            <label 
              for="password" 
              class="form-label"            
            >
              <input 
                type="password" 
                name="password" 
                id="password" 
                class="form-control" 
                placeholder="<%= helpers.tr('Password') %>*"
                required
              >
              <span 
                id="password-label"
              >
                <%= helpers.tr('Password') %>* 
              </span>
            </label>          
          </div>
          <div class="form-item mb-1">
            <label 
              for="photo" 
              class="form-label"            
            >
              <input 
                type="text" 
                name="photo" 
                id="photo" 
                class="form-control" 
                placeholder="http://"
              >
              <span 
                id="photo-label"
              >
                <%= helpers.tr('Photo') %>
              </span>
            </label>          
          </div>
          <div style="text-align: right;" class="mb-1">
            <a 
              class="btn btn-light" 
              href="<%= data.rootLink %>sign-in"
              data-button="sign-in"
            >
              <%= helpers.tr('Sign In') %> 
            </a>
          </div>
          <div style="text-align: right;">
            <button 
              type="submit" 
              class="btn btn-success"
              data-button="sign-up"
            >
              <%= helpers.tr('Sign Up') %> 
            </button>
            <a 
              class="btn btn-danger" 
              href="<%= data.rootLink %>"
              data-button="cancel"
            >
              <%= helpers.tr('Cancel') %> 
            </a>
          </div>
        </form>
        <%- 
          partials['auth-service-component']({
            data,
            partials,
            helpers
          })
        %> 
      </div>
    </div>
  </div>  
</div>
`;

// src/server/templates/pages/sign-up-page.ts
var sign_up_page_default2 = import_ejs6.default.compile(sign_up_page_default);

// src/server/sign-up/routes.ts
var routes_default3 = [{
  rule: `${localeRoute}/?sign-up`,
  async handler(page) {
    if (page.state) {
      const lang = page.match?.[0] || DEFAULT_LANGUAGE;
      const data = {};
      if (page.query.ajax && !page.query.init) {
        page.state.response.setHeader("Content-Type", "application/json;charset=UTF-8");
        page.state.response.write(JSON.stringify(data));
      } else {
        page.state.response.setHeader("Content-Type", "text/html;charset=UTF-8");
        page.state.response.write(renderPage(lang, PAGE_ROOT, version, page, "sign-up-page", sign_up_page_default2, data, void 0, {
          "auth-service-component": auth_service_component_default2
        }));
      }
    }
  }
}];

// src/server/auth/handlers/github.ts
var import_https = require("https");
var githubAuthorizeUrl = "https://github.com/login/oauth/authorize";
var github_default = {
  service(page) {
    if (page.state) {
      const params = {
        client_id: process.env.GITHUB_CLIENT_ID || ""
      };
      if (page.query.lang) {
        params.state = page.query.lang;
      }
      const url = `${githubAuthorizeUrl}?${getQueryParameters(params)}`;
      page.state.response.statusCode = 302;
      page.state.response.setHeader("location", encodeURI(url));
    }
  },
  async callback(page) {
    if (page.state) {
      const lang = page.query.state || "";
      const params = JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: page.query.code
      });
      const responseData = await new Promise((resolve) => {
        const buffer = [];
        const req = (0, import_https.request)({
          hostname: "github.com",
          path: "/login/oauth/access_token",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": params.length,
            accept: "application/json"
          }
        }, (res) => {
          res.on("data", (chunk) => buffer.push(chunk));
          res.on("end", () => {
            let data = {};
            try {
              data = JSON.parse(Buffer.concat(buffer).toString());
            } catch {
            }
            resolve(data);
          });
        });
        req.on("error", (err) => resolve(err));
        req.write(params);
        req.end();
      });
      const result = {
        ...responseData
      };
      if (responseData.access_token) {
        const userData = await new Promise((resolve) => {
          const buffer = [];
          const req = (0, import_https.request)({
            hostname: "api.github.com",
            path: "/user",
            method: "GET",
            headers: {
              "User-Agent": page.state?.request.headers["user-agent"] || "",
              Authorization: `token ${responseData.access_token}`
            }
          }, (res) => {
            res.on("data", (chunk) => buffer.push(chunk));
            res.on("end", () => {
              let data = {};
              try {
                data = JSON.parse(Buffer.concat(buffer).toString());
              } catch {
              }
              resolve(data);
            });
          });
          req.on("error", (err) => resolve(err));
          req.end();
        });
        result["user"] = userData;
      } else {
      }
      page.state.response.setHeader("Content-Type", "application/json;charset=UTF-8");
      page.state.response.write(JSON.stringify(result));
    }
  }
};

// src/server/auth/routes.ts
var routes_default4 = [{
  rule: "auth/service/(:word)",
  async handler(page) {
    if (page.state) {
      const name = page.match?.[0];
      switch (name) {
        case "github":
          github_default.service(page);
          break;
      }
    }
  }
}, {
  rule: "auth/callback/(:word)",
  async handler(page) {
    if (page.state) {
      const name = page.match?.[0];
      switch (name) {
        case "github":
          await github_default.callback(page);
          break;
      }
    }
  }
}];

// src/server/helpers.ts
var import_fs = require("fs");
var import_router2 = __toESM(require_router2());
function fragment(path, root) {
  let value = decodeURI(path);
  if (root !== "/") {
    value = value.replace(root, "");
  }
  return (0, import_router2.trimSlashes)(value);
}
function query(search) {
  if (search) {
    return (0, import_router2.parseQuery)(search);
  }
  return {};
}
async function checkStaticResponse(page, path) {
  if (page.state) {
    try {
      const stat = (0, import_fs.lstatSync)(path);
      if (stat.isFile()) {
        const data = (0, import_fs.readFileSync)(path);
        if (path.endsWith(".js")) {
          page.state.response.setHeader("Content-Type", "application/javascript; charset=UTF-8");
        } else if (path.endsWith(".svg")) {
          page.state.response.setHeader("Content-Type", "image/svg+xml");
        } else if (path.endsWith(".png")) {
          page.state.response.setHeader("Content-Type", "image/png");
        } else if (path.endsWith(".css")) {
          page.state.response.setHeader("Content-Type", "text/css; charset=UTF-8");
        }
        page.state.response.write(data);
        return true;
      }
    } catch {
    }
  }
  return false;
}

// src/server/init-environment.ts
var import_dotenv = __toESM(require_main());
import_dotenv.default.config();

// src/server/app.ts
var app = new import_router3.Router({
  root: PAGE_ROOT,
  async page404(page) {
    if (page.state) {
      page.state.response.statusCode = 404;
      page.state.response.setHeader("Content-Type", "text/html;charset=UTF-8");
      page.state.response.write(`${page.state.request.method} ${page.state.request.url} not found`);
    }
  },
  async before(page) {
    if (page.state) {
      const path = (0, import_path.join)(process.cwd(), "public", page.fragment);
      return checkStaticResponse(page, path);
    }
    return false;
  }
});
app.addRoutes(routes_default);
app.addRoutes(routes_default2);
app.addRoutes(routes_default3);
app.addRoutes(routes_default4);
var app_default = app;

// src/server/main.ts
var port = parseInt(process.env.PORT || "3000");
var server = (0, import_http.createServer)((req, res) => {
  const state = {
    request: req,
    response: res
  };
  const splits = req.url?.split("?") || [];
  const currentPath = fragment(splits[0], app_default.rootPath);
  const currentQuery = query(splits[1]);
  app_default.processUrl(currentPath, currentQuery, state).finally(() => res.end());
});
server.listen(port, void 0, void 0, () => {
  console.log(`Server listening on port ${port}`);
});
var main_default = server;
module.exports = __toCommonJS(main_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
/**
 * @file Embedded JavaScript templating engine. {@link http://ejs.co}
 * @author Matthew Eernisse <mde@fleegix.org>
 * @author Tiancheng "Timothy" Gu <timothygu99@gmail.com>
 * @project EJS
 * @license {@link http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0}
 */
