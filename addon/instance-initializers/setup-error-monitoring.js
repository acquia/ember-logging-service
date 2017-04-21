import Ember from 'ember';

const {
  RSVP,
  testing,
  typeOf
} = Ember;

export default function setupErrorMonitoring(instance, config) {
  let addonConfig = config['ember-logging-service'];
  if (!addonConfig || !addonConfig.errorsEnabled) {
    return;
  }
  let logger = instance.lookup('service:logger');
  logger.registerEvents({
    error: {
      ERROR: 'Error'
    }
  });

  if (testing === true) {
    return;
  }

  Ember.onerror = function(error) {
    logError(error, logger);
  };

  RSVP.on('error', function(error) {
    // An aborted transition propogates an error to RSVP
    // https://github.com/emberjs/ember.js/issues/12505
    if (error.name === 'TransitionAborted') {
      return;
    }
    // Adapter errors trigger both onerror and
    // RSVP.on('error') so no need to handle it here.
    if (error.isAdapterError) {
      return;
    }

    logError(error, logger, config.environment);
  });
}

/**
 * Convert an Ember error type object into a javascript error.
 * @method convertToError
 * @private
 * @param  {Object} error Ember generated error
 * @return {Error}        Javascript error
 */
function convertToError(error) {
  if (typeOf(error) === 'object') {
    let msg = error.responseText || error.message || error.toString();
    let { status } = error;
    error = new Error(msg);
    if (status) {
      error.status = status;
    }
  }
  return error;
}

/**
 * Log an error to the logging service.
 * @method  logError
 * @private
 * @param {Error} error Javascript error object
 * @param {Object} logger optional logger service object
 * @param {String} environment     indicates the current environment
 */
function logError(error, logger, environment) {
  error = convertToError(error);
  // Log to logger if present
  if (logger) {
    logger.error(logger.tags.error, logger.events.error.ERROR, { error });
  }
  // Log to console for anything but production.
  /* eslint-disable no-console */
  if (environment !== 'production') {
    if (console.error) {
      console.error(error);
    } else {
      console.log(error);
    }
  }
  /* eslint-enable no-console */
}
