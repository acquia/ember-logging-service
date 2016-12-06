import ENV from '../config/environment';
import setupLoggingService from 'ember-logging-service/instance-initializers/setup-logging-service';

export function initialize(instance) {
  setupLoggingService(instance, ENV);
}

export default {
  name: 'ember-logging-service',
  initialize
};
