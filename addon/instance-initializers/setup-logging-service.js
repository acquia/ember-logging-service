// Read any configuration values from the environment configuration and set on
// the logging service.
export default function setupLogginService(instance, config) {
  let service = instance.lookup('service:logger');

  service.set('currentEnvironment', config.environment);

  let addonOptions = config['ember-logging-service'];
  if (addonOptions.events) {
    service.registerEvents(addonOptions.events);
  }
}
