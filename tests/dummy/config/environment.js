/* eslint-env node */
'use strict';

module.exports = function(environment) {
  const ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    'ember-logging-service': {
      enabled: true,
      errorsEnabled: true,
      events: {
        user: {
          LOGGED_IN: 'Logged In',
          LOGGED_OUT: 'Logged Out'
        },
        navigation: {
          CREATE_TAB: 'Create Tab',
          RULES_TAB: 'Rules Tab',
          SLOTS_TAB: 'Slots Tab',
          CONTENT_TAB: 'Content Tab',
          SLOT_ISOLATION: 'Slot Isolation',
          MAIN_MENU: 'Main Menu'
        },
        interaction: {
          FILTER_DELETED: 'Filter Deleted',
          RULE_CREATED: 'Rule Created',
          RULE_UPDATED: 'Rule Updated',
          RULE_DELETED: 'Rule Deleted',
          RULE_PREVIEW: 'Rule Preview',
          RULE_VIEW_MODE: 'Rule View Mode',
          RULE_PUBLISHED: 'Rule Published',
          RULE_UNPUBLISHED: 'Rule Unpublished',
          SLOT_NEW: 'New Slot',
          SLOT_CREATED: 'Slot Created',
          SLOT_UPDATED: 'Slot Updated',
          SLOT_DELETED: 'Slot Deleted',
          HELP: 'Help Triggered',
          SLOT_HIGHLIGHTING_ON: 'Slot Highlighting On',
          SLOT_HIGHLIGHTING_OFF: 'Slot Highlighting Off',
          RULE_PRIORITY: 'Rule Priority',
          CONTENT_SEARCH: 'Content Search',
          RULE_SEARCH: 'Rule Search',
          SEGMENT_CHANGE: 'Set Active Segment',
          SIDEBAR_OPEN: 'Sidebar Opened',
          SIDEBAR_CLOSE: 'Sidebar Closed'
        },
        error: {
          ERROR: 'Error'
        }
      }
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  return ENV;
};
