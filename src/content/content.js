var stat = false;

function TellPopup(stat) {
    chrome.runtime.sendMessage({
        msg_type: "ANSWER",
        stat: stat
    });
    console.log(stat);
}

function StopQuit(e) {
    if (!stat) return;
    // 设置确认离开的提示信息
    var confirmationMessage = '确定要离开此页面吗？';

    (e || window.event).returnValue = confirmationMessage; // 标准的跨浏览器方式
    return confirmationMessage; // 一些浏览器需要显式返回字符串
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg_type == "CONNECT") {
        sendResponse("OK");
    } else if (request.msg_type == "SET") {
        console.log("TYPE SET");
        TellPopup(stat);
        // return;
    } else if (request.msg_type == "SWITCH") {
        console.log("TYPE SWITCH");
        stat = !stat;
        TellPopup(stat);
    }
    console.log("stat: ", stat);
    console.log("MSG_TYPE: ", request.msg_type);
});

window.addEventListener('beforeunload', StopQuit);