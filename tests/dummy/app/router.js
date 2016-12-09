import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({ // jscs:ignore disallowDirectPropertyAccess
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
});

export default Router;
