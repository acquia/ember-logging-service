import { test, module } from 'qunit';
import setupLoggingService from 'ember-logging-service/instance-initializers/setup-logging-service';
import Logger from 'ember-logging-service/services/logger';

module('Unit | Instance Initializers | setup-logging-service');

test('it configures the logger', function(assert) {
  assert.expect(4);

  let environmentMock = {
    environment: 'unit-testing',
    'ember-logging-service': {
      events: {
        test: {
          MY_EVENT: 'my-event'
        }
      }
    }
  };
  let logger = Logger.create();
  let instanceMock = {
    lookup(factoryName) {
      assert.equal(factoryName, 'service:logger', 'The logger is requested');
      return logger;
    }
  };

  setupLoggingService(instanceMock, environmentMock);
  assert.equal(logger.get('currentEnvironment'), 'unit-testing', 'The current environment is set up.');
  assert.deepEqual(logger.get('events'), environmentMock['ember-logging-service'].events, 'Event constants are created.');
  assert.deepEqual(logger.get('tags'), { test: 'test' }, 'Tag constants are created.');
});
