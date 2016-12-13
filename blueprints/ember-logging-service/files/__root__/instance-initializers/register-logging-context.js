/**
 * Provides application-specific context about the application and user at
 * the time of an event.
 */
export default {
  name: 'register-logging-context',
  after: 'ember-logging-service',
  initialize(applicationInstance) {
    let logger = applicationInstance.lookup('service:logger');

    // Override the following with your own callbacks.  These callbacks are
    // executed each time an event is triggered so cache appropriately.
    // The callbacks are called without parameters and should return a POJO
    // object of name/value configuration data.
    let applicationContextCallback = () => {
        return {};
    };
    let userContextCallback = () => {
        return {};
    };

    // Register the application and user context with the logger service.
    logger.registerApplicationContextCallback('application', applicationContextCallback);
    logger.registerUserContextCallback('application', userContextCallback);
  }
};
