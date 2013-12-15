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

  if (callee.type === 'MemberExpression') {
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
    } else if (mechanism === 'inject' || mechanism === 'registry') {

      fullName = node.arguments[0].value.split(':');
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
  }
}


console.log('running....');

for (var i = 2, l = process.argv.length; i < l; i ++) {
  extractFullnames(process.argv[i]);
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
  head: ['File', 'Line', 'via', 'fullName']
});

expectedFactorys.forEach(function(expected){
  table.push([
    expected.file,
    expected.loc.start.line,
    expected.mechanism,
    expected.type + ':' + expected.name
  ]);
});

console.log(table.toString());
