import { assign } from '@ember/polyfills';
import { isArray } from '@ember/array';
import Service from '@ember/service';
import { typeOf, isEmpty } from '@ember/utils';

export default Service.extend({

  /**
   * The current build environment for the application.  This is set by
   * the application instance initializer.
   * @property currentEnvironment
   * @type {String}
   * @public
   */
  currentEnvironment: null,

  /**
   * All registered events in a map indexed by tag.  Within each tag the event
   * key is a machine-readable value to be used in code when triggering the
   * event while the value is the human-readable value sent with the event.
   * @property events
   * @type {Object}
   * @public
   */
  events: null,

  /**
   * All of the available tag options for events.
   * @property tag
   * @type {Object}
   * @public
   */
  tags: null,

  /**
   * All of the available severity levels for an event.
   * @property level
   * @type {Object}
   * @public
   */
  levels: null,

  /**
   * A mapping of consumers to their callback
   * @property _callbackMap
   * @type {Object}
   * @private
   */
  _callbackMap: null,

  /**
   * A mapping of levels, tags, and listening consumers
   * @property _consumerMap
   * @type {Object}
   * @private
   */
  _consumerMap: null,

  /**
   * Application context callbacks mapped by consumer.
   * @property _applicationContextMap
   * @type {Object}
   * @private
   */
  _applicationContextMap: null,

  /**
   * User context callbacks mapped by consumer.
   * @property _userContextMap
   * @type {Object}
   * @private
   */
  _userContextMap: null,

  /**
   * Override the init function to set up the consumer map.
   * @method  init
   * @public
   */
  init() {
    this._super(...arguments);
    this.events = {};
    this.tags = {};
    this.levels = {
      info: 'info',
      warning: 'warning',
      error: 'error'
    };
    this._consumerMap = {};
    this._callbackMap = {};
    this._applicationContextMap = {};
    this._userContextMap = {};

    // Set up the levels for consumer listener map.
    let levels = Object.keys(this.levels);
    let map = {};
    levels.forEach((level) => {
      map[level] = {};
    });
    this._consumerMap = map;
  },

  /**
   * Registers a consumer of logging events.  Consumers listen to a combination
   * of environments, tags, and levels.  All three must be matched in order for
   * the callback to be fired.
   * @method  registerConsumer
   * @public
   * @param  {String}         consumerId         A unique identifier for the
   *                                             consumer
   * @param  {Function|Array} callback           Callback to be executed when
   *                                             event matches criteria. Can be
   *                                             either a single function, or an
   *                                             array where the first item is
   *                                             the callback function and the
   *                                             second item is the scope for
   *                                             'this' within the function.
   *                                             Callback should expect
   *                                             callback(event, context)
   * @param  {Mixed}          levels             A string or array of levels to
   *                                             listen to.
   * @param  {Mixed}          tags               A string or array of tags to
   *                                             listen to, one of this.tags.
   * @param  {Mixed}          environments       Optionally limit the consumer
   *                                             to a single environment
   *                                             (string) or a list of
   *                                             environments (array).  If not
   *                                             present, the consumer will be
   *                                             active for the current
   *                                             environment.  If passed: one of
   *                                             development, test, production
   * @param  {Function}       applicationContext An optional application context
   *                                             callback which will be executed
   *                                             without parameters and should
   *                                             return an object of contextual
   *                                             information to pass with each
   *                                             event
   * @param  {Function}       userContext        An optional user context
   *                                             callback which will be executed
   *                                             without parameters and should
   *                                             return an object of contextual
   *                                             information to pass with each
   *                                             event
   */
  registerConsumer(consumerId, callback, levels, tags, environments, applicationContext, userContext) {
    // Convert strings parameters to an array.
    levels = isArray(levels) ? levels : [levels];
    tags = isArray(tags) ? tags : [tags];
    // If environment is specified, then limit the consumer to the requested
    // environment(s).
    if (environments) {
      environments = isArray(environments) ? environments : [environments];
      // Check if the consumer is registering for the current environment.
      if (environments.indexOf(this.get('currentEnvironment')) === -1) {
        return;
      }
    }
    // Build consumerMap and callbackMap.
    this.registerTags(tags);
    let consumerMap = assign({}, this.get('_consumerMap'));
    let callbackMap = assign({}, this.get('_callbackMap'));
    levels.forEach((level) => {
      if (this.levels.hasOwnProperty(level)) {
        tags.forEach((tag) => {
          consumerMap[level][tag].push(consumerId);
        });
      }
    });
    callbackMap[consumerId] = callback;
    this.set('_consumerMap', consumerMap);
    this.set('_callbackMap', callbackMap);

    // Add context callbacks.
    if (applicationContext) {
      this.registerApplicationContextCallback(consumerId, applicationContext);
    }
    if (userContext) {
      this.registerUserContextCallback(consumerId, userContext);
    }
  },

  /**
   * Removes a consumer and all of its callback listeners.
   * @method  unregisterConsumer
   * @public
   * @param  {String}   consumerId   A unique identifier for the consumer
   */
  unregisterConsumer(consumerId) {
    let consumerMap = assign({}, this.get('_consumerMap'));
    let callbackMap = assign({}, this.get('_callbackMap'));
    let applicationContextMap = assign({}, this.get('_applicationContextMap'));
    let userContextMap = assign({}, this.get('_userContextMap'));
    let levels = Object.keys(consumerMap);
    levels.forEach((level) => {
      let tags = Object.keys(consumerMap[level]);
      tags.forEach((tag) => {
        let consumers = consumerMap[level][tag];
        let found = consumers.indexOf(consumerId);
        if (found >= 0) {
          consumers.splice(found, 1);
        }
      });
    });
    delete callbackMap[consumerId];
    delete applicationContextMap[consumerId];
    delete userContextMap[consumerId];
    this.set('_consumerMap', consumerMap);
    this.set('_callbackMap', callbackMap);
    this.set('_applicationContextMap', applicationContextMap);
    this.set('_userContextMap', userContextMap);
  },

  /**
   * Registers a callback that will provide application context.
   * @method  registerApplicationContextCallback
   * @public
   * @param  {string}         id       A unique identifier for the provider.
   * @param  {Function|Array} callback A callback or array acceptable by
   *                                   _executeCallback
   */
  registerApplicationContextCallback(id, callback) {
    let map = assign({}, this._applicationContextMap);
    map[id] = callback;
    this.set('_applicationContextMap', map);
  },

  /**
   * Registers a callback that will provide user context.
   * @method  registerUserContextCallback
   * @public
   * @param  {string}         id       A unique identifier for the provider.
   * @param  {Function|Array} callback A callback or array acceptable by
   *                                   _executeCallback
   */
  registerUserContextCallback(id, callback) {
    let map = assign({}, this._userContextMap);
    map[id] = callback;
    this.set('_userContextMap', map);
  },

  /**
   * Allows registration of valid tags.  Tags group events in such a way that
   * consumers can choose to listen for.
   * @method registerTags
   * @public
   * @param  {Array} tags  An array of tag names.
   */
  registerTags(tags) {
    let loggerTags = this.get('tags');
    let levels = Object.keys(this.get('levels'));
    let map = assign({}, this.get('_consumerMap'));
    levels.forEach((level) => {
      if (this.levels.hasOwnProperty(level)) {
        tags.forEach((tag) => {
          if (!map[level].hasOwnProperty(tag)) {
            map[level][tag] = [];
          }
          loggerTags[tag] = tag;
        });
      }
    });
    this.set('tags', loggerTags);
    this.set('_consumerMap', map);
  },

  /**
   * Allows the registration of events to listen for.  Adding events to the
   * logger means that they are available for lookup by accessing
   * logger.get('events.eventType.MACHINE_EVENT_NAME') in order to keep code
   * constant even when event names are adjusted.
   *
   * Any tags included in the event object are added to the registered tags.
   *
   * @method  registerEvents
   * @public
   * @param  {Object} events  An object that is keyed by tags.  Within each tag
   *                          is an object of events with the keys as the
   *                          machine-readable name and the value as the human
   *                          readable event name sent when the event is
   *                          triggered.
   */
  registerEvents(events) {
    let tags = Object.keys(events);
    let logEvents = this.get('events') || {};
    this.registerTags(tags);
    tags.forEach((tag) => {
      logEvents[tag] = logEvents[tag] || {};
      logEvents[tag] = assign(logEvents[tag], events[tag]);
    });
    this.set('events', logEvents);
  },

  /**
   * Sends an informational event to all consumers.
   * @method  info
   * @public
   * @param  {String} tag       The tag for this type of event
   * @param  {String} eventName Name of the event
   * @param  {Object} eventData Additional data associated with the event.
   */
  info(tag, eventName, eventData = {}) {
    this._sendEvent(this.levels.info, tag, eventName, eventData);
  },

  /**
   * Sends a warning event to all consumers.
   * @method  warning
   * @public
   * @param  {String} tag       The tag for this type of event
   * @param  {String} eventName Name of the event
   * @param  {Object} eventData Additional data associated with the event.
   */
  warning(tag, eventName, eventData = {}) {
    this._sendEvent(this.levels.warning, tag, eventName, eventData);
  },

  /**
   * Sends an error event to all consumers.
   * @method  error
   * @public
   * @param  {String} tag       The tag for this type of event
   * @param  {String} eventName Name of the event
   * @param  {Object} eventData Additional data associated with the event.
   */
  error(tag, eventName, eventData = {}) {
    this._sendEvent(this.levels.error, tag, eventName, eventData);
  },

  /**
   * Sends an event to all listening consumers.
   * @method  _sendEvent
   * @private
   * @param  {String} level     The event level/severity
   * @param  {String} tag       The tag for this type of event
   * @param  {String} eventName Name of the event
   * @param  {Object} eventData Additional data associated with the event.
   */
  _sendEvent(level, tag, eventName, eventData) {
    let callbacks = this._getCallbacks(level, tag);
    if (isEmpty(callbacks)) {
      return;
    }
    let event = {
      name: eventName,
      type: tag,
      level,
      metadata: eventData
    };
    let context = {
      application: this._getApplicationContext(),
      user: this._getUserContext()
    };
    callbacks.forEach((callback) => {
      if (callback) {
        this._executeCallback(callback, event, context);
      }
    });
  },

  /**
   * Helper function to retrieve a list of callbacks for a specific tag and
   * level.
   * @method  _getCallbacks
   * @private
   * @param  {String} level     The level/severity
   * @param  {String} tag       The tag to get callbacks for
   * @return {Array}            An array of callback methods.
   */
  _getCallbacks(level, tag) {
    let map = assign({}, this.get('_consumerMap'));
    let consumers = (map[level] && map[level][tag]) ? map[level][tag] : [];
    return consumers.map((consumerId) => {
      return this.getWithDefault(`_callbackMap.${consumerId}`, null);
    });
  },

  /**
   * Helper function to return the application context at the time an event
   * occurs.
   * @method _getApplicationContext
   * @private
   * @return {Object} The application context
   */
  _getApplicationContext() {
    let context = {};
    let map = assign({}, this.get('_applicationContextMap'));
    let ids = Object.keys(map);
    ids.forEach((id) => {
      context = assign(context, this._executeCallback(map[id]));
    });
    return context;
  },

  /**
   * Helper function to return the user context at the time an event
   * occurs.
   * @method  _getUserContext
   * @private
   * @return {Object} The user context
   */
  _getUserContext() {
    let context = {};
    let map = assign({}, this.get('_userContextMap'));
    let ids = Object.keys(map);
    ids.forEach((id) => {
      context = assign(context, this._executeCallback(map[id]));
    });
    return context;
  },

  /**
   * Helper function to execute a callback.  The callback can either be
   * a function or an array where the first item is the function and the second
   * is the scope.
   * @method _executeCallback
   * @private
   * @param {Function|Array} callback   The callback structure to execute.
   * @param {Array}          args       Any arguments to pass to the function
   * @return {Any} The result of the callback
   */
  _executeCallback(callback, ...args) {
    let func = callback;
    let scope = this;
    if (isArray(callback)) {
      [func, scope] = callback;
    }
    if (typeOf(func) !== 'function') {
      return;
    }
    return func.apply(scope, args);
  }
});
