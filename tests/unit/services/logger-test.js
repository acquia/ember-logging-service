import { module, test } from 'ember-qunit';
import Logger from 'ember-logging-service/services/logger';
import Ember from 'ember';

let service;
module('Unit | Service | logger', {
  beforeEach() {
    service = Logger.create();
    // Shouldn't be necessary but somehow the service isn't fully destroyed
    // after each test.
    service.set('tags', {});
    service.set('events', {});
  },
  afterEach() {
    Ember.run(service, 'destroy');
  }
});

test('it has publicly accessible methods.', function(assert) {
  let methods = [
    'registerConsumer',
    'unregisterConsumer',
    'registerApplicationContextCallback',
    'registerUserContextCallback',
    'registerTags',
    'registerEvents',
    'info',
    'warning',
    'error'
  ];

  assert.expect(methods.length);

  methods.forEach((methodName) => {
    assert.ok(service[methodName], `${methodName} method is accessible.`);
  });
});

test('it can register and unregister a consumer.', function(assert) {
  assert.expect(10);

  service.set('currentEnvironment', 'test');
  service.registerConsumer('grover', 'groverCallback', 'info', 'interaction', 'test', 'appContext', 'userContext');

  let expectedTags = { 'interaction': 'interaction' };
  assert.ok(service._consumerMap.info.interaction.indexOf('grover') >= 0, 'ConsumerID was registered');
  assert.equal(service._callbackMap.grover, 'groverCallback', 'Callback was registered');
  assert.deepEqual(service._applicationContextMap, { 'grover': 'appContext' }, 'Application context callback was registered.');
  assert.deepEqual(service._userContextMap, { 'grover': 'userContext' }, 'User context callback was registered.');
  assert.deepEqual(service.tags, expectedTags, 'Tags are added to logger tags.');
  service.unregisterConsumer('grover');
  assert.notOk(service._consumerMap.info.interaction.indexOf('grover') >= 0, 'ConsumerID was unregistered');
  assert.equal(service._callbackMap.grover, undefined, 'Callback was unregistered');
  assert.notOk(service._applicationContextMap.hasOwnProperty('grover'), 'Application context was unregistered.');
  assert.notOk(service._userContextMap.hasOwnProperty('grover'), 'User context was unregistered.');
  assert.deepEqual(service.tags, expectedTags, 'Tags are not removed with unregistered consumer.');
});

test('it can execute a callback for a registered ConsumerID.', function(assert) {
  assert.expect(6);

  let expectedContext = {
    application: {
      directions: 'how to get to sesame street'
    },
    user: {
      snuffy: 'imaginary friend'
    }
  };
  let happyCallback = (event, context) => {
    assert.ok(true, `Callback for ${event.name} called for level ${event.level} on ${event.type}`);
    assert.deepEqual(context, expectedContext, 'The application context was passed along with the event.');
  };
  let sadCallback = (event) => {
    assert.ok(false, `Callback for ${event.name} called when it shouldn't have been for level ${event.level} on ${event.type}`);
  };
  let applicationContextCallback = () => {
    return { directions: 'how to get to sesame street' };
  };
  let userContextCallback = () => {
    return { snuffy: 'imaginary friend' };
  };
  service.set('currentEnvironment', 'test');
  service.registerConsumer('grover', happyCallback, ['error', 'warning', 'info'], ['interaction', 'user'], 'test');
  service.registerConsumer('oscar', sadCallback, ['error', 'warning', 'info'], 'error', 'test');
  service.registerConsumer('snuffy', sadCallback, ['error', 'warning', 'info'], ['interaction', 'user'], ['production', 'development']);
  service.registerApplicationContextCallback('test', applicationContextCallback);
  service.registerUserContextCallback('test', userContextCallback);

  service.info('interaction', 'Rule Updated');
  service.warning('interaction', 'Rule Updated');
  service.error('user', 'Logged In');
});

test('it can register tags', function(assert) {
  assert.expect(4);

  let tags = ['one-tag', 'two-tag', 'red-tag', 'blue-tag'];
  service.registerTags(tags);

  let expectedMap = {
    info: {
      'one-tag': [],
      'two-tag': [],
      'red-tag': [],
      'blue-tag': []
    },
    warning: {
      'one-tag': [],
      'two-tag': [],
      'red-tag': [],
      'blue-tag': []
    },
    error: {
      'one-tag': [],
      'two-tag': [],
      'red-tag': [],
      'blue-tag': []
    }
  };
  let expectedTags = {
    'one-tag': 'one-tag',
    'two-tag': 'two-tag',
    'red-tag': 'red-tag',
    'blue-tag': 'blue-tag'
  };
  assert.deepEqual(service._consumerMap, expectedMap, 'The consumer map was created with tag options.');
  assert.deepEqual(service.get('tags'), expectedTags, 'The tag constants were created');

  service.registerTags(['little-star']);
  expectedMap.info['little-star'] = [];
  expectedMap.warning['little-star'] = [];
  expectedMap.error['little-star'] = [];
  expectedTags['little-star'] = 'little-star';
  assert.deepEqual(service._consumerMap, expectedMap, 'The consumer map was updated with tag options.');
  assert.deepEqual(service.get('tags'), expectedTags, 'The tag constants were updated');
});

test('it can register events', function(assert) {
  assert.expect(6);

  let events = {
    location: {
      'CAR': 'in a car',
      'GOAT': 'with a goat'
    },
    status: {
      'COULD_NOT': 'could not',
      'WOULD_NOT': 'would not'
    }
  };
  service.registerEvents(events);

  let expectedMap = {
    info: {
      location: [],
      status: []
    },
    warning: {
      location: [],
      status: []
    },
    error: {
      location: [],
      status: []
    }
  };
  let expectedTags = {
    location: 'location',
    status: 'status'
  };
  assert.deepEqual(service._consumerMap, expectedMap, 'The consumer map was created with tag options.');
  assert.deepEqual(service.get('tags'), expectedTags, 'The tag constants were created.');
  assert.deepEqual(service.get('events'), events, 'The event constants were created.');

  service.registerEvents({ actions: { 'EAT_THEM': 'eat them' } });
  expectedMap.info.actions = [];
  expectedMap.warning.actions = [];
  expectedMap.error.actions = [];
  expectedTags.actions = 'actions';
  events.actions = {
    EAT_THEM: 'eat them'
  };
  assert.deepEqual(service._consumerMap, expectedMap, 'The consumer map was updated with tag options.');
  assert.deepEqual(service.get('tags'), expectedTags, 'The tag constants were updated.');
  assert.deepEqual(service.get('events'), events, 'The event constants were updated.');
});
