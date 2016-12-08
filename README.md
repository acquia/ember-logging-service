# ember-logging-service

This addon provides a general and extensible logging service that can be used
throughout your application.  This addon by itself will provide a basic logging
service that can be used to trigger log events as well as register consumers to
listen for events.

Example consumers include:
* [https://github.com/acquia/ember-logging-amplitude/](Amplitide integration)
* [https://github.com/acquia/ember-logging-bugsnag/](Bugsnag integration)


# Concepts
## Triggering events
The logging service categorizes each event with a 'level' and a 'tag'.  The level
is meant as an indicator of the severity.  Currently the supported levels are:
info, warning, and error.  These values are defined on the "levels" property
of the logger service.  A tag is meant as a general user-defined categorization
of a class of events.

For example, events tracking user behavior could all be tagged with 'user' such
that a user login would be triggered with the level of "info" and the tag of "user".
To trigger this type of event:

`this.get('logger').info('user', 'Log in');`

Similarly, navigation events could be tracked as:
`this.get('logger').info('navigation', 'About')`

Helper functions are provided for each level for logging events.  Each function
can optionally accept additional data to be sent along with the event. 
```
let logger = this.get('service');
logger.info('user', 'Log out');
logger.warn('user', 'Cancelled save');
logger.error('error', 'API authorization error', { status: 403, foo: bar });
```

## Event consumers
Consumers can register with the logging service to listen for any events matching
the a specific combination of event level and event tags.  For example, one
output may only care about error events and handle them accordingly by sending
to Bugsnag or writing to a log.  Other tracking systems may care about user
interaction events for UX analyzation.

A consumer can be registered with the logger by minimally providing an id, a
callback for events, a list of levels, and a list of tags.

For example:
`this.get('logger').registerConsumer('muppets', happyFunc, 'info', ['sesame', 'muppets', monsters']);`

Typically consumers are registered with application instance initializers within
a consumer addon.

When an event is sent to the logger service that matches the level and tag combination
for a consumer, the consumer's callback function is triggered with a structured
event and the context of the application at the time of the event (more below).

The event is structured with the following data:
* name: the name of the event trigger
* type: the tag associated with the event
* level: the severity level (info, warn, error)
* metadata: any additional data passed when the event was triggered

## Application/User Context
The logger service can automatically include application and user context along
with each event.  This is the second parameter sent to the consumer callback
mentioned above.  Because this information is specific to an application, it is
generated by the application that consumes the logger service.  The logger service
allows the registration of one or more application context callbacks and user
context callbacks.  These callbacks are executed with each event to generate
a POJO of contextual information that can be used to provide additional context
to consumers.  For example, it may be useful to provide customer API keys or
the current route within the application to give context to a navigation or 
error event.

Both types of callbacks do not accept any parameters and return a POJO of custom
information.

## Automatic Error Monitoring 
When error handling is turned on, the logging service will automatically monitor
any uncaught Ember or RSVP errors and send them as error level events.

# Configuration

# Developing for ember-logging-service

## Installation

* `git clone git@github.com:acquia/ember-logging-service.git` this repository
* `cd ember-logging-service`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
