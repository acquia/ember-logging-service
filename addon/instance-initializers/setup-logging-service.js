// Read any configuration values from the environment configuration and set on
// the logging service.
export default function setupLoggingService(instance, config) {
  const addonOptions = config['ember-logging-service'];
  let service;
  if (!addonOptions.enabled) {
    return;
  }

  service = instance.lookup('service:logger');
  service.set('currentEnvironment', config.environment);

  if (addonOptions.events) {
    service.registerEvents(addonOptions.events);
  }
}
