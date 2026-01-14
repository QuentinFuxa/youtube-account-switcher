// Handle main frame navigations
chrome.webNavigation.onBeforeNavigate.addListener(
  function (details) {
    if (details.frameId !== 0) {
      return;
    }

    const url = new URL(details.url);
    const authuser = url.searchParams.get('authuser');
    if (authuser !== '1') {
      url.searchParams.set('authuser', '1');
      chrome.tabs.update(details.tabId, {
        url: url.toString()
      });
    }
  },
  {
    url: [
      { hostSuffix: 'youtube.com' }
    ]
  }
);

// Handle embedded videos (iframes) using declarativeNetRequest
// This adds authuser=1 to YouTube embed URLs
const RULE_ID = 1;

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: [{
      id: RULE_ID,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          transform: {
            queryTransform: {
              addOrReplaceParams: [{ key: 'authuser', value: '1' }]
            }
          }
        }
      },
      condition: {
        urlFilter: '||youtube.com/embed/',
        resourceTypes: ['sub_frame']
      }
    }]
  });
});
