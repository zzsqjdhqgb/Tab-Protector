function UpdatePanel(stat) {
    var lockPanel = document.getElementById('lock-panel');
    var statusText = document.getElementById('status-text');
    if (stat) {
        if (lockPanel.classList.contains('unlocked')) {
            lockPanel.classList.remove('unlocked');
        }
        lockPanel.classList.add('locked');
        statusText.textContent = '已锁定';
    } else {
        if (lockPanel.classList.contains('locked')) {
            lockPanel.classList.remove('locked');
        }
        lockPanel.classList.add('unlocked');
        statusText.textContent = '未锁定';
    }
}

const channel = new BroadcastChannel('background-popup-channel');
channel.onmessage = function(event) {
    UpdatePanel(event.data.stat);
};

const fail_chan = new BroadcastChannel('tell-fail');
fail_chan.onmessage = function(event) {
    console.log("recv fail");
    var lockPanel = document.getElementById('lock-panel');
    var statusText = document.getElementById('status-text');
    let changeBtn = document.getElementById("change_btn");
    lockPanel.style.boxShadow = "0 0 10px #ff0000";
    statusText.style.color = "#ff0000";
    statusText.textContent = "无法锁定";
    changeBtn.style.display = "none"
};

async function Init() {
    chrome.runtime.sendMessage({ msg_type: "QUERY" });
}

async function toggleLock() {
    chrome.runtime.sendMessage({ msg_type: "CHANGE" });
}

window.addEventListener('blur', function() {
    console.log('页面失去焦点');
    window.close();
});

document.getElementById("change_btn").addEventListener("click", toggleLock);
document.addEventListener("DOMContentLoaded", Init);