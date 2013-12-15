 export default Ember.Route.extend({
  setupController: function(controller, model) {
    this.controllerFor('foo').set('model');
    this.controllerFor('bar').set('model');
  },
  model: function() {
    return this.store.find('foo', 1);
  },
  afterModel: function(model) {
    this.modelFor('bro');
  }
});
