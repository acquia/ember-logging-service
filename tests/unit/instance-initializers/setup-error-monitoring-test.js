import { test, module } from 'qunit';
import setupErrorMonitoring from 'ember-logging-service/instance-initializers/setup-error-monitoring';
import Logger from 'ember-logging-service/services/logger';

module('Unit | Instance Initializers | setup-error-monitoring');

// Currently unable to test the actual logging of errors due to issues with
// errors in the testing environment.
// http://raytiley.com/posts/ember-onerror-troll
test('it configures the logger', function(assert) {
  assert.expect(3);

  let environmentMock = {
    environment: 'unit-testing',
    'ember-logging-service': {
      errorsEnabled: true
    }
  };
  let logger = Logger.create();
  let instanceMock = {
    lookup(factoryName) {
      assert.equal(factoryName, 'service:logger', 'The logger is requested');
      return logger;
    }
  };

  setupErrorMonitoring(instanceMock, environmentMock);
  assert.deepEqual(logger.get('events'), { error: { ERROR: 'Error' } }, 'Error event constants are created.');
  assert.deepEqual(logger.get('tags'), { error: 'error' }, 'Error tag constants are created.');
});
