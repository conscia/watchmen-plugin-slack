const axios = require('axios');
const moment = require('moment');

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
  return (service, data) => {
    if (notifications.indexOf(eventName) === -1) {
      return;
    }

    let duration;

    if (data.timestamp) {
      duration = moment.duration(+new Date() - data.timestamp, 'seconds');
    }

    axios.post(WATCHMEN_SLACK_NOTIFICATION_URL, Object.assign({
      text: `
        *Event: [${friendlyNames[eventName]}]* 
        *Service: ${service.name}
        *Service URL: ${service.url}
        ${duration ? 'Downtime:* ' + duration.humanize() : ''}
      `
    }, defaultOptions));
  };
};

const SlackPlugin = watchmen => {
  Object.keys(friendlyNames).forEach(eventName => watchmen.on(eventName, handleEvent(eventName)));
};

module.exports = SlackPlugin;
