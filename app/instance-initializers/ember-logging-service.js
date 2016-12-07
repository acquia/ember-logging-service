import ENV from '../config/environment';
import setupLoggingService from 'ember-logging-service/instance-initializers/setup-logging-service';
import setupErrorMonitoring from 'ember-logging-service/instance-initializers/setup-error-monitoring';

export function initialize(instance) {
  setupLoggingService(instance, ENV);
  setupErrorMonitoring(instance, ENV);
}

export default {
  name: 'ember-logging-service',
  initialize
};
