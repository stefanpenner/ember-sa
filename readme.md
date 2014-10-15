```js
register('foo:bar', Baz);
inject('foo:bar', 'propertyName', 'foo:baz')
needs: 'foo'
modelFor('bar')
controllerFor('bar')
lookup('foo:bar')
render(...)
```
[ ] warn -> validated super in init:
[ ] validate fullNames or names
[ ] notify if malformed
[ ] handle better reporting
[ ] extrapolate if all fullNames can be satisfied by infering the
modules.
  [ ] EAK style es6 modules (on disk)
  [ ] AMD modules + AMD style resolver

[ ] warn for variable in fullName place (or warn for dynamic choice);
[ ] care more about context .store.find vs find etc.

