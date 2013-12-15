export default Ember.Controller.extend({
  needs:  ['foo', 'bar'],

  actions: {
    somethingCrazy: function() {
      this.store.find('boo/bar/baz');
    }
  }
});
