/* global chrome */

chrome.alarms.onAlarm.addListener((alarm) => {
  alert(`Remember to check out Pull Request: ${alarm.name}`);
});