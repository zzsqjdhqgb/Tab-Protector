let tabList = {};

// msg_type: "SET"
//     lock_stat : bool
// 
// msg_type: "CHANGE"
//     EMPTY
// 
// msg_type: "QUERY"
//     EMPTY

// let last_cur;
async function GetCurTabId() {
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0].id;
}

async function UpdateContentScript(tab, stat) {
    await chrome.tabs.sendMessage(tab, {
        msg_type: "SET",
        lock_stat: stat
    });
}

async function ConnectContentScript(tab) {
    try {
        let res = await chrome.tabs.sendMessage(tab, {
            msg_type: "CONNECT"
        });
        if (res == "OK") {
            return true;
        }
    } catch {
        return false;
    }
    return false;
}

const fail_chan = new BroadcastChannel('tell-fail');
function PopupFail() {
    console.log("fail");
    fail_chan.postMessage({ msg: "fail" });
}

async function ConnectTab() {
    try {
        let tab = await GetCurTabId();
        if (!tabList.hasOwnProperty(tab)) {
            tabList[tab] = {
                on_lock: false
            };
            // console.log(`[handled] current tab unexist, id: ${tab}`);
            // PopupFail();
            // return false;
        }
        let res = await ConnectContentScript(tab);
        if (res) return true;
        PopupFail();
        return false;
    } catch {
        PopupFail();
        return false;
    }
}

async function GetTabStat() {
    let tab = await GetCurTabId();
    if (!tabList.hasOwnProperty(tab)) {
        console.error(`current tab unexist, id: ${tab}`);
        return;
    }
    await UpdateContentScript(tab, tabList[tab].on_lock);
    return tabList[tab].on_lock;
}

async function ChangeTabStat() {
    let tab = await GetCurTabId();
    if (!tabList.hasOwnProperty(tab)) {
        console.error(`current tab unexist, id: ${tab}`);
        return;
    }
    tabList[tab].on_lock = !tabList[tab].on_lock;
    await UpdateContentScript(tab, tabList[tab].on_lock);
    return tabList[tab].on_lock;
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tabList.hasOwnProperty(tabId)) {
        tabList[tabId] = {
            on_lock: false
        };
    }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    if (tabList.hasOwnProperty(tabId)) {
        delete tabList[tabId];
    }
});

const channel = new BroadcastChannel('background-popup-channel');
function TellPopup(stat) {
    channel.postMessage({ stat: stat });
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.msg_type != "CHANGE") {
        return;
    }
    if (!await ConnectTab()) return;
    let res = await ChangeTabStat();
    console.log("Current status: ", res);
    TellPopup(res);
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.msg_type != "QUERY") {
        return;
    }
    if (!await ConnectTab()) return;
    let res = await GetTabStat();
    console.log("Current status: ", res);
    TellPopup(res);
});