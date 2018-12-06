const axios = require('axios');

const {
  WATCHMEN_SLACK_NOTIFICATION_URL,
  WATCHMEN_SLACK_NOTIFICATION_EVENTS,
  WATCHMEN_SLACK_NOTIFICATION_CHANNEL,
  WATCHMEN_SLACK_NOTIFICATION_USERNAME,
  WATCHMEN_SLACK_NOTIFICATION_ICON_EMOJI
} = process.env;

const notifications = WATCHMEN_SLACK_NOTIFICATION_EVENTS.split(',');
console.log(`Slack notifications are turned on for: ${notifications}`);

const defaultOptions = {
  channel: WATCHMEN_SLACK_NOTIFICATION_CHANNEL || '#general',
  username: WATCHMEN_SLACK_NOTIFICATION_USERNAME || 'Watchmen',
  icon_emoji: WATCHMEN_SLACK_NOTIFICATION_ICON_EMOJI || ':mega:'
};

const friendlyNames = {
  'latency-warning': 'Latency Warning',
  'new-outage': 'New Outage',
  'current-outage': 'Current Outage',
  'service-back': 'Service Back',
  'service-error': 'Service Error',
  'service-ok': 'Service OK'
};

const handleEvent = (eventName) => {
  return (service) => {
    if (notifications.indexOf(eventName) === -1) {
      return;
    }

    const text = `[${friendlyNames[eventName]}] on ${service.name} ${service.url}`;
    const options = {
      text: text
    };

    axios.post(WATCHMEN_SLACK_NOTIFICATION_URL, Object.assign(defaultOptions, options));
  };
};

const SlackPlugin = watchmen => {
  watchmen.on('latency-warning', handleEvent('latency-warning'));
  watchmen.on('new-outage', handleEvent('new-outage'));
  watchmen.on('current-outage', handleEvent('current-outage'));
  watchmen.on('service-back', handleEvent('service-back'));
  watchmen.on('service-error', handleEvent('service-error'));
  watchmen.on('service-ok', handleEvent('service-ok'));
};

module.exports = SlackPlugin;
