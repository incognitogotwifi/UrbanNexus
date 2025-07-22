// Extract key parts of the evaljs.js file for West Law functionality
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

// Basic implementation for West Law compatibility
return {
  Environment: Environment,
  Arguments: Arguments,
  Return: Return,
  Break: Break,
  Continue: Continue
};

})();