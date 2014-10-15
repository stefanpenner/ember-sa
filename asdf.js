var esprima = require('esprima');
var estraverse = require('estraverse');
var fs = require('fs');

var callExpressions = {
  'controllerFor': true,
  'modelFor': true
};

var lookups = {
  controllerFor: 'controller',
  modelFor: 'model',
  find: 'model',
  lookup: 'lookup',
  render: 'template'
};

var expectedFactorys = [];
var handlers = {
  'CallExpression': callExpression,
  'ObjectExpression': objectExpression
};

var file; // TODO: local
function objectExpression(node) {
  // actually check type
  var type = 'controller';

  node.properties.forEach(function(property) {
    if (property.key.name !== 'needs') { return; }
    var mechanism = 'needs';

    (property.value.elements || []).forEach(function(element) {
      var name = element.value;
      var loc = element.loc;

      expectedFactorys.push({
        mechanism: mechanism,
        type: type,
        name: name,
        file: file,
        loc: loc
      });
    });
  });
}

function callExpression(node) {
  var name;
  var loc;
  var callee = node.callee;
  if (!callee) { return; }
  var mechanism = callee.name || (callee.property && callee.property.name);

  if (mechanism === 'inject' || mechanism === 'registry' || mechanism === 'lookup' || mechanism === 'lookupFactory') {

    var argument = node.arguments[0];

    if (argument.type !== 'literal')  { return; }

    fullName = argument.value.split(':');
    name = fullName[0];
    type = fullName[1];
    loc = node.loc;

    expectedFactorys.push({
      mechanism: mechanism,
      type: type,
      name: name,
      file: file,
      loc: loc
    });

    if (arguments.length > 1) {
      fullName = node.arguments[2].value.split(':');
      name = fullName[0];
      type = fullName[1];
      loc = node.loc;

      expectedFactorys.push({
        mechanism: mechanism,
        type: type,
        name: name,
        file: file,
        loc: loc
      });
    }
  } else if (callee.type === 'MemberExpression') {
    var type = lookups[mechanism];

    if (type && node.arguments[0]) {

      name = node.arguments[0].value;
      loc = node.loc;

      expectedFactorys.push({
        mechanism: mechanism,
        type: type,
        name: name,
        file: file,
        loc: loc
      });
    }
  }
}

console.log('running....');

var files = [], fullNames = [];
for (var i = 2, l = process.argv.length; i < l; i ++) {
  var file;
  file = process.argv[i];
  if (/\.js$/.test(file)) {
    extractFullnames(file);
  }
  fullNames.push(reverseFullName(file));
}

function reverseFullName(path) {
  path = path.match(/app\/(.*)\.(?:js|hbs)/)[1];
  var split = path.split('/');

  var pluralizedType = split.shift();
  var type = pluralizedType.replace(/s$/,'');
  var name = split.join('/');
  var fullName = type + ':' + name;

  return {
    type: type,
    fullName: fullName,
    name: name
  };
}

function extractFullnames(filename) {
  file = filename;
  var ast = esprima.parse(fs.readFileSync(filename), {
   loc: true,
   raw: true
  });

  estraverse.traverse(ast, {
    enter: function(node){
      var handler = handlers[node.type];
      if(handler) { handler(node); }
    }
  });
}

var Table = new require('cli-table');
var table = new Table({
  head: ['File', 'Line', 'via', 'fullName', 'satisfied']
});

function get(property) {
  return function(obj) {
    return obj[property];
  };
}

function satisfied(fullName) {
  return !!~fullNames.map(get('fullName')).indexOf(fullName);
}

expectedFactorys.forEach(function(expected){
  var fullName = expected.type + ':' + expected.name;

  table.push([
    expected.file,
    expected.loc.start.line,
    expected.mechanism,
    fullName,
    satisfied(fullName)
  ]);
});

console.log(table.toString());
