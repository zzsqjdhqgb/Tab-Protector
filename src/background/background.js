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

async function ChangeContentScript(tab) {
    await chrome.tabs.sendMessage(tab, {
        msg_type: "SWITCH"
    });
}

async function SetContentScript(tab) {
    await chrome.tabs.sendMessage(tab, {
        msg_type: "SET"
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
function PopupFail(msg) {
    console.log("fail");
    fail_chan.postMessage({ msg: msg });
}

async function ConnectTab() {
    let tab = await GetCurTabId();
    let res = await ConnectContentScript(tab);
    if (res) return true;
    PopupFail("无法锁定");
    return false;
}

async function GetTabStat() {
    let tab = await GetCurTabId();
    await SetContentScript(tab)
}

async function ChangeTabStat() {
    let tab = await GetCurTabId();
    await ChangeContentScript(tab);
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.msg_type != "CHANGE") {
        return;
    }
    try {
        if (!await ConnectTab()) return;
        await ChangeTabStat();
    } catch {
        PopupFail("未知错误");
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.msg_type != "QUERY") {
        return;
    }
    try {
        if (!await ConnectTab()) return;
        await GetTabStat();
    } catch {
        PopupFail("未知错误");
    }
});