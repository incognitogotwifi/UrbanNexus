var evaljs = evaljs || (function () {

function noop() {}

function Arguments() {
  //TODO: add es3 'arguments.callee'?
}

Arguments.prototype.toString = function () {
  return '[object Arguments]';
};

function Return(val) {
  this.value = val;
}

// need something unique to compare a against.
var Break = {};
var Continue = {};

function Environment(scriptmanager, errorCallback) {
  this._scriptmanager = scriptmanager;
  this._curVarStore = createVarStore(null, null);
  this._curDeclarations = {};
  this._boundGen = this._gen.bind(this);
  this._errorCallback = errorCallback;
}

Environment.prototype.setGlobalAndThis = function(global, newThis) {
  this._globalObj = global;
  this._curVarStore.vars = global;
  this._curThis = newThis;
  this._root = newThis;
}

function createVarStore(parent, vars) {
  vars = vars || {};
  return {
    parent: parent,
    vars: vars
  };
}

Environment.prototype.gen = function (node) {
  var resp = this._gen(node);
  addDeclarationsToStore(this._curDeclarations, this._curVarStore);
  this._curDeclarations = {};
  return resp;
};

Environment.prototype.genAndTransferFunctions = function(node, className) {
  this._gen(node);
  this.removeClassFunctions(className);
  this.addClassFunctions(node, className);
};

Environment.prototype.removeClassFunctions = function(className) {
  for (var key in this._globalObj) {
    if ((typeof this._globalObj[key] === "function") && this._globalObj[key].scriptClass == className)
      delete(this._globalObj[key]);
  }
};

Environment.prototype.addClassFunctions = function(declarations, className) {
  for (var key in this._curDeclarations) {
    if (this._curDeclarations.hasOwnProperty(key)) {
      this._globalObj[key] = this._curDeclarations[key]();
      if (this._globalObj[key])
        this._globalObj[key].scriptClass = className;
    }
  }
};

Environment.prototype._gen = function (node) {
  var closure = ({
    BinaryExpression: this._genBinExpr,
    LogicalExpression: this._genBinExpr,
    UnaryExpression: this._genUnaryExpr,
    UpdateExpression: this._genUpdExpr,
    ObjectExpression: this._genObjExpr,
    ArrayExpression: this._genArrExpr,
    CallExpression: this._genCallExpr,
    NewExpression: this._genNewExpr,
    MemberExpression: this._genMemExpr,
    ChainExpression: this._genChainExpr,
    ThisExpression: this._genThisExpr,
    SequenceExpression: this._genSeqExpr,
    Literal: this._genLit,
    Identifier: this._genIdent,
    AssignmentExpression: this._genAssignExpr,
    FunctionDeclaration: this._genFuncDecl,
    VariableDeclaration: this._genVarDecl,
    BlockStatement: this._genProgram,
    Program: this._genProgram,
    ExpressionStatement: this._genExprStmt,
    EmptyStatement: this._genEmptyStmt,
    ReturnStatement: this._genRetStmt,
    FunctionExpression: this._genFuncExpr,
    ArrowFunctionExpression: this._genFuncExpr,
    IfStatement: this._genIfStmt,
    ConditionalExpression: this._genCondStmt,
    ForStatement: this._genLoopStmt,
    WhileStatement: this._genLoopStmt,
    DoWhileStatement: this._genDoWhileStmt,
    ForInStatement: this._genForInStmt,
    ForOfStatement: this._genForOfStmt,
    WithStatement: this._genWithStmt,
    ThrowStatement: this._genThrowStmt,
    TryStatement: this._genTryStmt,
    ContinueStatement: this._genContStmt,
    BreakStatement: this._genBreakStmt,
    SwitchStatement: this._genSwitchStmt,
    AwaitExpression: this._genAwaitStmt,
    TemplateLiteral: this._genTemplateLit,
    SpreadElement: this._genSpreadElement
  }[node.type] || function () {
    console.warn("Not implemented yet: " + node.type);
    return noop;
  }).call(this, node);

  return closure;
};

Environment.prototype._genSpreadElement = function (node) {
  var self = this;
  var arg = this._gen(node.argument);

  return function* () {
    var value = arg();
    if (value && value.next) {
      value = yield* value;
    }
    if (!Array.isArray(value)) {
      self._outputError("Spread operator can only be used with arrays", node);
      return [];
    }
    return value;
  };
};

Environment.prototype._genBinExpr = function (node) {
  var a = this._gen(node.left);
  var b = this._gen(node.right);

  function* callExpr(expr) {
    var result;
    if (expr.constructor.name == 'GeneratorFunction') {
      result = yield* expr();
    } else {
      result = expr();
    }
    return result;
  }

  var cmp = {
    '==': function* () {
      return (yield* callExpr(a)) == (yield* callExpr(b));
    },
    '!=': function* () {
      return (yield* callExpr(a)) != (yield* callExpr(b));
    },
    '===': function* () {
      return (yield* callExpr(a)) === (yield* callExpr(b));
    },
    '!==': function* () {
      return (yield* callExpr(a)) !== (yield* callExpr(b));
    },
    '<': function* () {
      return (yield* callExpr(a)) < (yield* callExpr(b));
    },
    '<=': function* () {
      return (yield* callExpr(a)) <= (yield* callExpr(b));
    },
    '>': function* () {
      return (yield* callExpr(a)) > (yield* callExpr(b));
    },
    '>=': function* () {
      return (yield* callExpr(a)) >= (yield* callExpr(b));
    },
    '<<': function* () {
      return (yield* callExpr(a)) << (yield* callExpr(b));
    },
    '>>': function* () {
      return (yield* callExpr(a)) >> (yield* callExpr(b));
    },
    '>>>': function* () {
      return (yield* callExpr(a)) >>> (yield* callExpr(b));
    },
    '+': function* () {
      return (yield* callExpr(a)) + (yield* callExpr(b));
    },
    '-': function* () {
      return (yield* callExpr(a)) - (yield* callExpr(b));
    },
    '*': function* () {
      return (yield* callExpr(a)) * (yield* callExpr(b));
    },
    '/': function* () {
      return (yield* callExpr(a)) / (yield* callExpr(b));
    },
    '%': function* () {
      return (yield* callExpr(a)) % (yield* callExpr(b));
    },
    '|': function* () {
      return (yield* callExpr(a)) | (yield* callExpr(b));
    },
    '^': function* () {
      return (yield* callExpr(a)) ^ (yield* callExpr(b));
    },
    '&': function* () {
      return (yield* callExpr(a)) & (yield* callExpr(b));
    },
    'in': function* () {
      return (yield* callExpr(a)) in (yield* callExpr(b));
    },
    'instanceof': function* () {
      return (yield* callExpr(a)) instanceof (yield* callExpr(b));
    },
    // logic expressions
    '||': function* () {
      return (yield* callExpr(a)) || (yield* callExpr(b));
    },
    '&&': function* () {
      return (yield* callExpr(a)) && (yield* callExpr(b));
    }
  }[node.operator];

  return function () {
    // FIXME: Convert to yield*
    var iter = cmp();
    var res = iter.next();
    while (!res.done) {
      res = iter.next();
    }
    return res.value;
  };
};

Environment.prototype._genUnaryExpr = function (node) {
  if (node.operator === 'delete') {
    return this._genDelete(node);
  }
  var op = {
    '-': function (a) {
      return -a;
    },
    '+': function (a) {
      return +a;
    },
    '!': function (a) {
      return !a;
    },
    '~': function (a) {
      return ~a;
    },
    'typeof': function (a) {
      return typeof a;
    },
    'void': function (a) {
      return void a;
    }
  }[node.operator];

  var arg = this._gen(node.argument);
  return function* () {
    var a = arg();
    if (a && a.next)
      a = yield* a;
    return op(a);
  };
};

Environment.prototype._genDelete = function (node) {
  var obj = this._genObj(node.argument);
  var attr = this._genName(node.argument);

  return function* () {
    var o = obj();
    if (o && o.next)
      o = yield* o;
    var a = attr();
    if (a && a.next)
      a = yield* a;
    return delete o[a];
  };
};

Environment.prototype._genObjExpr = function (node) {
  //TODO property.kind: don't assume init when it can also be set/get
  var self = this;
  var items = [];
  node.properties.forEach(function (property) {
    // object expression keys are static so can be calculated
    // immediately
    var key = self._objKey(property.key)();
    items.push({
      key: key,
      getVal: self._gen(property.value)
    });
  });

  return function* () {
    var result = {};
    for (var i = 0; i < items.length; i++) {
      var v = items[i].getVal();
      if (v && v.next)
        v = yield* v;
      result[items[i].key] = v;
    }
    return result;
  };
};

Environment.prototype._genArrExpr = function (node) {
  var self = this;
  var items = node.elements.map(self._gen.bind(self));

  return function* () {
    var newitems = [];
    for (var i = 0; i < items.length; i++) {
      var v = items[i]();
      if (v && v.next)
        v = yield* v;
      if (Array.isArray(v) && items[i].constructor.name === 'GeneratorFunction' && node.elements[i].type === 'SpreadElement') {
        newitems.push(...v);
      } else {
        newitems.push(v);
      }
    }
    self._scriptmanager.makeArray(newitems);
    return newitems;
  };
};

Environment.prototype._objKey = function (node) {
  var key;
  if (node.type === 'Identifier') {
    key = node.name;
  } else {
    key = this._gen(node)();
  }

  return function () {
    return key;
  };
};

Environment.prototype._genCallExpr = function (node) {
  var self = this;
  var callee;
  if (node.callee.type === 'MemberExpression') {
    var obj = self._genObj(node.callee);
    var name = self._genName(node.callee);
    callee = function* () {
      var o = obj();
      if (o && o.next)
        o = yield* o;
      var n = name();
      if (n && n.next)
        n = yield* n;

      if (o && !o[n] && (o == self._curThis || o == self._root) && self._globalObj[n])
        return self._globalObj[n].bind(o); // calling this. functions
      if (!o || !o[n] || !o[n].bind) {
        if (node.callee.optional) // ChainExpression
            return undefined;
        self._outputError("Undefined object function: " + self._printObjName(node.callee), node); // n
        return null;
      }
      return o[n].bind(o);
    };
  } else {
    callee = self._gen(node.callee);
  }
  var args = node.arguments.map(self._gen.bind(self));

  return function* () {
    var c = callee();
    if (typeof c === "undefined" || c === null) {
      self._outputError("Undefined script function: " + self._printObjName(node.callee), node);
      return c;
    }

    if (c.next)
      c = yield* c;
    if (!c)
      return c;

    var newargs = [];
    for (var i = 0; i < args.length; i++) {
      var v = args[i]();
      if (v && v.next)
        v = yield* v;
      newargs.push(v);
    }
    var result = c.apply(self._curThis, newargs);

    if (result && result.next)
      result = yield* result;
    return result;
  };
};

Environment.prototype._genNewExpr = function (node) {
  var callee = this._gen(node.callee);
  var args = node.arguments.map(this._boundGen);
  var self = this;

  return function* () {
    var cl = callee();
    if (typeof cl === "undefined" || cl === null) {
      self._outputError("Undefined script class: " + self._printObjName(node.callee), node);
      return cl;
    }

    var newargs = [null];
    for (var i = 0; i < args.length; i++) {
      var v = args[i]();
      if (v && v.next)
        v = yield* v;
      newargs.push(v);
    }
    var newObject = new (Function.prototype.bind.apply(cl, newargs));
    return newObject;
  };
};

Environment.prototype._printObjName = function(node) {
  if (!node)
    return undefined;

  if (node.type === 'Identifier')
    return node.name;

  if (node.type === 'ThisExpression')
    return "this";

  if (node.type === 'MemberExpression' && node.object && node.property)
    return "" + this._printObjName(node.object) + "." + this._printObjName(node.property);

  if (node.type === 'CallExpression' && node.callee)
    return "" + this._printObjName(node.callee) + "()";

  return undefined;
};

Environment.prototype._outputError = function(msg, node, obj) {
  if (obj) {
    var objName = this._printObjName(obj);
    if (objName)
      msg += " (" + objName + ")";
  }
  if (node.loc)
    msg += " at " + node.loc.start.line + ":" + node.loc.start.column;
  if (this._errorCallback)
    this._errorCallback(msg);
};

Environment.prototype._genMemExpr = function (node) {
  var self = this;
  var obj = this._gen(node.object);
  var property = this._memExprProperty(node);
  return function* () {
    var o = obj();
    if (o && o.next)
      o = yield* o;

    var v = property();
    if (v && v.next)
      v = yield* v;

    if (typeof o === "undefined" || o === null) {
        if (node.optional) // ChainExpression
            return undefined;
        self._outputError("Cannot read property '" + v + "' of undefined", node, node.object);
        return o;
    }
    return o[v];
  };
};

Environment.prototype._memExprProperty = function (node) {
  return node.computed ? this._gen(node.property) : this._objKey(node.property);
};

Environment.prototype._genChainExpr = function (node) {
  // return this._genMemExpr(node.expression);
  return this._gen(node.expression);
};

Environment.prototype._genThisExpr = function () {
  var self = this;
  return function () {
    return self._curThis;
  };
};

Environment.prototype._genSeqExpr = function (node) {
  var exprs = node.expressions.map(this._boundGen);
  return function* () {
    var result;
    for (var i = 0; i < exprs.length; i++) {
      var e = exprs[i]();
      if (e && e.next)
        e = yield* e;
      result = e;
    }
    return result;
  };
};

Environment.prototype._genUpdExpr = function (node) {
  var self = this;
  var update = {
    '--true': function (obj, name) {
      return --obj[name];
    },
    '--false': function (obj, name) {
      return obj[name]--;
    },
    '++true': function (obj, name) {
      return ++obj[name];
    },
    '++false': function (obj, name) {
      return obj[name]++;
    }
  }[node.operator + node.prefix];

  var obj = this._genObj(node.argument);
  var name = this._genName(node.argument);
  return function* () {
    yield;
    var o = obj();
    if (o && o.next)
      o = yield* o;
    var n = name();
    if (n && n.next)
      n = yield* n;
    return update(o, n);
  };
};

Environment.prototype._genObj = function (node) {
  if (node.type === 'Identifier') {
    return this._getVarStore.bind(this, node.name);
  } else if (node.type === 'MemberExpression') {
    return this._gen(node.object);
  } else {
    console.warn("Unknown _genObj() type: " + node.type);
    return noop;
  }
};

Environment.prototype._genName = function (node) {
  switch (node.type) {
    case 'Identifier':        return function () { return node.name; };
    case 'MemberExpression':  return this._memExprProperty(node);
    case 'AssignmentPattern': return this._genName(node.left); //TODO: support default values
    default: {
      console.warn("Unknown _genName() type: " + node.type);
      return noop;
    }
  }   
};

Environment.prototype._genLit = function (node) {
  return function () {
    return node.value;
  };
};

Environment.prototype._genIdent = function (node) {
  var self = this;
  return function () {
    return self._getVarStore(node.name)[node.name];
  };
};

Environment.prototype._getVarStore = function (name) {
  var store = this._curVarStore;
  do {
    if (store.vars.hasOwnProperty(name)) {
      return store.vars;
    }
  } while ((store = store.parent));

  // global object as fallback
  return this._globalObj;
};

Environment.prototype._genAssignExpr = function (node) {
  var self = this;
  var setter = {
    '=': function (obj, name, val) {
      return (obj[name] = val);
    },
    '+=': function (obj, name, val) {
      return (obj[name] += val);
    },
    '-=': function (obj, name, val) {
      return (obj[name] -= val);
    },
    '*=': function (obj, name, val) {
      return (obj[name] *= val);
    },
    '/=': function (obj, name, val) {
      return (obj[name] /= val);
    },
    '%=': function (obj, name, val) {
      return (obj[name] %= val);
    },
    '<<=': function (obj, name, val) {
      return (obj[name] <<= val);
    },
    '>>=': function (obj, name, val) {
      return (obj[name] >>= val);
    },
    '>>>=': function (obj, name, val) {
      return (obj[name] >>>= val);
    },
    '|=': function (obj, name, val) {
      return (obj[name] |= val);
    },
    '^=': function (obj, name, val) {
      return (obj[name] ^= val);
    },
    '&=': function (obj, name, val) {
      return (obj[name] &= val);
    }
  }[node.operator];

  if (node.left.type === 'ObjectPattern')
    return this._genAssignObjectDecl(node, setter);
  else if (node.left.type === 'ArrayPattern')
    return this._genAssignArrayDecl(node, setter);

  var obj = this._genObj(node.left);
  var name = this._genName(node.left);
  var val = this._gen(node.right);
  return function* () {
    var o = obj();
    if (o && o.next)
      o = yield* o;
    var n = name();
    if (n && n.next)
      n = yield* n;
    var v = val();
    if (v && v.next)
      v = yield* v;

    if (!o) {
      self._outputError("Cannot access property '" + n + "' of undefined", node, node.left);
      return null;
    }

    return setter(o, n, v);
  };
};

Environment.prototype._genAssignObjectDecl = function (node, setter) {
  // console.log("ObjectPattern: " + JSON.stringify(node, null, 4));

  // Array of assignments, see node.left.properties
  var objs = [], names = [], values = [];
  for (var i = 0; i < node.left.properties.length; i++) {
    objs.push(this._genObj(node.left.properties[i].key));
    names.push(this._genName(node.left.properties[i].key));
    values.push(this._genName(node.left.properties[i].value));
  }
  var valobj = this._gen(node.right);

  return function* () {
    var vobj = valobj();
    if (vobj && vobj.next)
      vobj = yield* vobj;
    if (!vobj) {
      self._outputError("Cannot access properties of undefined", node, node.right);
      return null;
    }

    var result;
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i]();
      if (o && o.next)
        o = yield* o;
      var n = names[i]();
      if (n && n.next)
        n = yield* n;
      var v = values[i]();
      if (v && v.next)
        v = yield* v;

      if (!o) {
        self._outputError("Cannot access property '" + n + "' of undefined", node, node.left.properties[i]);
        continue;
      }

      // console.log("--- check setter:", o, n, vobj, v, vobj[v]);
      result = setter(o, n, vobj[v]); // should only be '='
      if (result && result.next)
        result = yield* result;
    }
    return result;
  };
};

Environment.prototype._genAssignArrayDecl = function (node, setter) {
  // console.log("ArrayPattern: " + JSON.stringify(node, null, 4));

  // Array of assignments, see node.left.elements
  var objs = [], names = [];
  for (var i = 0; i < node.left.elements.length; i++) {
    objs.push(this._genObj(node.left.elements[i]));
    names.push(this._genName(node.left.elements[i]));
  }
  var valobj = this._gen(node.right);

  return function* () {
    var vobj = valobj();
    if (vobj && vobj.next)
      vobj = yield* vobj;
    if (!vobj) {
      self._outputError("Cannot access members of undefined", node, node.right);
      return null;
    }

    var result;
    for (var i = 0; i < objs.length; i++) {
      var o = objs[i]();
      if (o && o.next)
        o = yield* o;
      var n = names[i]();
      if (n && n.next)
        n = yield* n;
      var v = vobj[i];
      if (v && v.next)
        v = yield* v;

      if (!o) {
        self._outputError("Cannot access property '" + n + "' of undefined", node, node.left.elements[i]);
        continue;
      }

      // console.log("--- check setter:", o, n, vobj, vobj[i], v);
      result = setter(o, n, v); // should only be '='
      if (result && result.next)
        result = yield* result;
    }
    return result;
  };
};

Environment.prototype._genFuncDecl = function (node) {
  this._curDeclarations[node.id.name] = this._genFuncExpr(node);
  return function* () {
    return noop;
  };
};

Environment.prototype._genVarDecl = function (node) {
  var assignments = [];
  for (var i = 0; i < node.declarations.length; i++) {
    var decl = node.declarations[i];
    this._curDeclarations[decl.id.name] = noop;
    if (decl.init) {
      assignments.push({
        type: 'AssignmentExpression',
        operator: '=',
        left: decl.id,
        right: decl.init
      });
    }
  }
  return this._gen({
    type: 'BlockStatement',
    body: assignments
  });
};

Environment.prototype._genFuncExpr = function (node) {
  var self = this;

  var oldDeclarations = self._curDeclarations;
  self._curDeclarations = {};
  var body = self._gen(node.body);
  var declarations = self._curDeclarations;
  self._curDeclarations = oldDeclarations;

  // reset var store
  return function () {
    var parent = self._curVarStore;
    return function* () {
      // build arguments object
      var args = new Arguments();
      args.length = arguments.length;
      for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }

      // switch interpreter 'stack'
      var oldStore = self._curVarStore;
      var oldThis = self._curThis;
      self._curVarStore = createVarStore(parent);
      self._curThis = this;

      addDeclarationsToStore(declarations, self._curVarStore);
      self._curVarStore.vars.arguments = args;

      // add function args to var store
      var paramIndex = 0;
      node.params.forEach(function (param) {
        if (param.type === 'RestElement') {
          var restArgs = [];
          for (var j = paramIndex; j < args.length; j++) {
            restArgs.push(args[j]);
          }
          self._curVarStore.vars[param.argument.name] = restArgs;
        } else if (param.type === 'AssignmentPattern') {
          var value = args[paramIndex];
          if (value === undefined) {
            value = self._gen(param.right)();
            if (value && value.next) {
              value = yield* value;
            }
          }
          self._curVarStore.vars[param.left.name] = value;
          paramIndex++;
        } else if (param.type === 'ObjectPattern') {
          var arg = args[paramIndex] || {};
          if (arg && arg.next) {
            arg = yield* arg;
          }
          param.properties.forEach(function (prop) {
            var key = prop.key.name || prop.key.value;
            var value = prop.value;
            if (value.type === 'Identifier') {
              self._curVarStore.vars[value.name] = arg[key];
            } else {
              self._outputError("Nested destructuring not supported yet", node);
            }
          });
          paramIndex++;
        } else {
          self._curVarStore.vars[param.name] = args[paramIndex];
          paramIndex++;
        }
      });

      // run function body
      // var result = yield* body();
      var result; 
      if (body.constructor.name === 'GeneratorFunction') {
        result = yield* body();
      } else {
        result = new Return(body());
      }

      // switch 'stack' back
      self._curThis = oldThis;
      self._curVarStore = oldStore;

      if (result instanceof Return)
        return result.value;
      if (result && typeof result !== "function")
        return result;
    };
  };
};

function addDeclarationsToStore(declarations, varStore, overwrite) {
  for (var key in declarations) {
    if (declarations.hasOwnProperty(key) && (overwrite || !varStore.vars.hasOwnProperty(key))) {
      varStore.vars[key] = declarations[key]();
    }
  }
}

Environment.prototype._genProgram = function (node) {
  var self = this;
  var stmtClosures = node.body.map(function (stmt) {
    return self._gen(stmt);
  });

  return function* () {
    var result;
    for (var i = 0; i < stmtClosures.length; i++) {
      if (!stmtClosures[i]) {
        result = null;
        yield; 
      } else if (stmtClosures[i].constructor.name === 'GeneratorFunction') {
        result = yield* stmtClosures[i]();
        yield;
      } else {
        result = stmtClosures[i]();
        yield;
      }
      if (result === Break || result === Continue || result instanceof Return) {
        break;
      }
    }
    //return last
    return result;
  };
};

Environment.prototype._genExprStmt = function (node) {
  return this._gen(node.expression);
};

Environment.prototype._genEmptyStmt = function () {
  return noop;
};

Environment.prototype._genRetStmt = function (node) {
  var self = this;
  var arg = node.argument ? this._gen(node.argument) : noop;
  return function* () {
    var a = arg();
    if (a && a.next)
      a = yield* a;
    return new Return(a);
  };
};

Environment.prototype._genIfStmt = function (node) {
  var self = this;
  var test = function () {
    return self._gen(node.test)();
  };
  var consequent = this._gen(node.consequent);
  var alternate = node.alternate ? this._gen(node.alternate) : function* () {
    return noop;
  };

  return function* () {
    var t = test();
    if (t && t.next)
      t = yield* t;
    var result = t? consequent() : alternate();
    if (result && result.next)
        result = yield* result;
    return result;
  };
};

Environment.prototype._genCondStmt = function (node) {
  var self = this;
  var test = function () {
    return self._gen(node.test)();
  };
  var consequent = this._gen(node.consequent);
  var alternate = node.alternate ? this._gen(node.alternate) : noop;

  return function* () {
    var t = test();
    if (t && t.next)
      t = yield* t; 
    var result = t? consequent() : alternate();
    if (result && result.next)
        result = yield* result;
    return result;
  };
};

Environment.prototype._genLoopStmt = function (node, body) {
  var self = this;
  var init = node.init ? this._gen(node.init) : function* () {
    return noop;
  };
  var test = node.test ? function* () {
    return self._gen(node.test)();
  } : function* () {
    return true;
  };
  var update = node.update ? this._gen(node.update) : function* () {
    return noop;
  };
  body = body || this._gen(node.body);

  return function* () {
    var resp;
    for (yield* init(); yield* test(); yield* update()) {
      var newResp = yield* body();

      if (newResp === Break) {
        break;
      }
      if (newResp === Continue) {
        continue;
      }
      resp = newResp;
      if (newResp instanceof Return) {
        break;
      }
    }
    return resp;
  };
};

Environment.prototype._genDoWhileStmt = function (node) {
  var body = this._gen(node.body);
  var loop = this._genLoopStmt(node, body);

  return function* () {
    yield* body();
    yield* loop();
  };
};

Environment.prototype._genForInStmt = function (node) {
  var self = this;
  var right = self._gen(node.right);
  var body = self._gen(node.body);

  var left = node.left;
  if (left.type === 'VariableDeclaration') {
    self._curDeclarations[left.declarations[0].id.name] = noop;
    left = left.declarations[0].id;
  }
  return function* () {
    var r = right();
    if (r && r.next)
      r = yield* r;

    var resp;
    for (var x in r) {
      yield* self._genAssignExpr({
        operator: '=',
        left: left,
        right: {
          type: 'Literal',
          value: x
        }
      })();
      var newResp = yield* body();

      if (newResp === Break) {
        break;
      }
      if (newResp === Continue) {
        continue;
      }
      resp = newResp;
      if (newResp instanceof Return) {
        break;
      }
    }
    return resp;
  };
};

Environment.prototype._genForOfStmt = function (node) {
  var self = this;
  var right = self._gen(node.right);
  var body = self._gen(node.body);

  var left = node.left;
  if (left.type === 'VariableDeclaration') {
    self._curDeclarations[left.declarations[0].id.name] = noop;
    left = left.declarations[0].id;
  }
  return function* () {
    var r = right();
    if (r && r.next)
      r = yield* r;

    var resp;
    if (r) for (var x of r) {
      yield* self._genAssignExpr({
        operator: '=',
        left: left,
        right: {
          type: 'Literal',
          value: x
        }
      })();
      var newResp = yield* body();

      if (newResp === Break) {
        break;
      }
      if (newResp === Continue) {
        continue;
      }
      resp = newResp;
      if (newResp instanceof Return) {
        break;
      }
    }
    return resp;
  };
};


Environment.prototype._genWithStmt = function (node) {
  var self = this;
  var obj = self._gen(node.object);
  var body = self._gen(node.body);
  return function* () {
    self._curVarStore = createVarStore(self._curVarStore, obj());
    var result = yield* body();
    self._curVarStore = self._curVarStore.parent;
    return result;
  };
};

Environment.prototype._genThrowStmt = function (node) {
  var arg = this._gen(node.argument);
  return function () {
    throw arg();
  };
};

Environment.prototype._genTryStmt = function (node) {
  var block = this._gen(node.block);
  var handler = this._genCatchHandler(node.handler);
  var finalizer = node.finalizer ? this._gen(node.finalizer) : function (x) {
    return x;
  };

  return function () {
    try {
      return finalizer(block());
    } catch (err) {
      return finalizer(handler(err));
    }
  };
};

Environment.prototype._genCatchHandler = function (node) {
  if (!node) {
    return noop;
  }
  var self = this;
  var body = self._gen(node.body);
  return function (err) {
    var old = self._curVarStore.vars[node.param.name];
    self._curVarStore.vars[node.param.name] = err;
    var resp = body();
    self._curVarStore.vars[node.param.name] = old;

    return resp;
  };
};

Environment.prototype._genContStmt = function () {
  return function () {
    return Continue;
  };
};

Environment.prototype._genBreakStmt = function () {
  return function () {
    return Break;
  };
};

Environment.prototype._genSwitchStmt = function (node) {
  var self = this;

  var discriminant = self._gen(node.discriminant);
  var cases = node.cases.map(function (curCase) {
    return {
      test: curCase.test ? self._gen(curCase.test) : null,
      code: self._genProgram({ body: curCase.consequent })
    };
  });

  return function* () {
    var foundMatch = false;
    var discriminantVal = discriminant();
    if (discriminantVal && discriminantVal.next)
      discriminantVal = yield* discriminantVal;

    var resp, defaultCase;

    for (var i = 0; i < cases.length; i++) {
      var curCase = cases[i];
      if (!foundMatch) {
        if (!curCase.test) {
          defaultCase = curCase;
          continue;
        }
        if (discriminantVal !== curCase.test()) {
          continue;
        }
        foundMatch = true;
      }
      // foundMatch is guaranteed to be true here
      var newResp = yield* curCase.code();
      if (newResp === Break) {
        return resp;
      }
      resp = newResp;
      if (resp === Continue || resp instanceof Return) {
        return resp;
      }
    }
    if (!foundMatch && defaultCase) {
      var newResp = yield* defaultCase.code();
      if (newResp === Break) {
        return resp;
      }
      return newResp;
    }
  };
};

Environment.prototype._genAwaitStmt = function(node) {
  var self = this;
  var func = self._gen(node.argument);

  return function* () {
    var a = func();
    if (a && a.next)
      a = yield* a;
    return a; // no support for callback setter yet
  };
};

Environment.prototype._genTemplateLit = function(node) {
  var expressions = node.expressions.map(this._boundGen);

  var self = this;
  return function* () {
    var res = "";
    for (var i = 0; i < node.quasis.length; i++) {
      res += node.quasis[i].value.raw;
      if (i < expressions.length) {
        var v = expressions[i]();
        if (v && v.next)
          v = yield* v;
        res += v;
      }
    }
    return res;
  };
};

return {
    Environment: Environment
};})();

