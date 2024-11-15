var stat = false;

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
    }
    if (request.msg_type != "SET") {
        return;
    }
    stat = request.lock_stat;
    console.log("stat: ", stat);
});

window.addEventListener('beforeunload', StopQuit);