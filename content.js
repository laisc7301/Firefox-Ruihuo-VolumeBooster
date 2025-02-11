const contentDefaultVolumeMultiple = 1;
const defaultAutoUnmuteCheckbox = true;
const defaultloadingDelay = 5000;
const defaultAutoRulesList = "{}";


var gainNodeArr = new Array(0);
var audioContext = new AudioContext();
var nowVolumeMultiple = 1;
var isLoadingComplete = false;


function myPrepare() {


    document.querySelectorAll('audio, video').forEach((media) => {
        // const audioContext = new AudioContext();
        media.muted = false;
        const mediaSource = audioContext.createMediaElementSource(media);
        const gainNode = audioContext.createGain();
        mediaSource.connect(gainNode);
        gainNode.connect(audioContext.destination);
        // gainNode.gain.value = 512; // 设置音量倍数
        // nowVolumeMultiple = 512;
        gainNodeArr.push(gainNode);

        console.log('音量增益插件初始化完成！');
    });


    loadVolumeSet();




}


// 等待 DOM 加载完成后执行
document.addEventListener("DOMContentLoaded", function () {


    chrome.storage.local.get(["loadingDelay"], (data) => {

        if (chrome.runtime.lastError) {
            console.error("读取存储出错：", chrome.runtime.lastError);
        } else {
            if (data) {
                const ld = data.loadingDelay || defaultloadingDelay;
                // console.log("成功加载音量配置：" + ruleList);
                setTimeout(function () {
                    // console.log("网页 DOM 结构已加载，开始执行 myPrepare()");

                    myPrepare();
                    // isLoadingComplete = true;

                }, ld);
                resolve(ruleList);
            } else {
                // console.error("Error loading settings from storage.");
                setTimeout(function () {
                    // console.log("网页 DOM 结构已加载，开始执行 myPrepare()");

                    myPrepare();
                    // isLoadingComplete = true;

                }, defaultloadingDelay);
                resolve(defaultAutoRulesList);
            }
        }
    });





    autoUnmute();
});




// 监听来自 interface.js 的消息
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "setvolume") {
        // 从消息中提取参数
        const volumeMultiple = message.data.volumeMultiple;

        // 调用 content.js 中的函数，并传递参数
        // const result = doSomethingInContent(param1, param2, param3);
        const result = 0;
        setVolume(volumeMultiple);

        // 返回响应
        sendResponse({ success: true, data: result });
    }

    if (message.action === "getvolume") {

        // console.log("aaa+" + nowVolumeMultiple);

        // 返回响应
        sendResponse({ success: true, data: nowVolumeMultiple });
    }

    if (message.action === "getdomain") {

        // 返回响应
        sendResponse({ success: true, data: getDomain() });
    }

    if (message.action === "isloadingcomplete") {



        // 返回响应
        sendResponse({ success: true, data: isLoadingComplete });
    }

    // 保持消息通道打开以异步发送响应
    return true;
});








function setVolume(volumeMultiple) {
    if (!isNaN(parseFloat(volumeMultiple))) {

        for (let i = 0; i < gainNodeArr.length; i++) {
            gainNodeArr[i].gain.value = volumeMultiple;
        }

        console.log('音量已提高至' + volumeMultiple + '倍');
        // setNowVolume(volumeMultiple);
        nowVolumeMultiple = volumeMultiple;

    } else {
        console.log('无效音量值：' + volumeMultiple);
    }
}


function getDomain() {
    let domain1 = window.location.hostname;
    // let domain2 = window.location.port;
    // let domainOut = domain1 + ":" + domain2;
    return domain1;

}



function getAutoRulesList() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["autoRulesList"], (data) => {

            if (chrome.runtime.lastError) {
                console.error("读取存储出错：", chrome.runtime.lastError);
            } else {
                if (typeof data.autoRulesList !== "undefined") {
                    const ruleList = data.autoRulesList || defaultAutoRulesList;
                    // console.log("成功加载音量配置：" + ruleList);
                    resolve(ruleList);
                } else {
                    // console.error("Error loading settings from storage.");
                    resolve(defaultAutoRulesList);
                }
            }
        });
    });
}

async function getAutoRulesListJSON() {
    try {
        const result = await getAutoRulesList(); // 等待 Promise 完成
        const jsonObject = JSON.parse(result);     // 尝试解析 JSON
        return jsonObject;                         // 返回解析后的对象
    } catch (error) {
        console.error("Error in getPopupRulesListJSON:", error);
        throw new Error("Failed to get or parse popup rules list!");
    }
}


function loadVolumeSet() {

    getAutoRulesListJSON().then((autoRulesListJSONObject) => {

        if (Object.hasOwn(autoRulesListJSONObject, getDomain())) {
            if (autoRulesListJSONObject[getDomain()] != 1) {
                setVolume(autoRulesListJSONObject[getDomain()]);
                console.log("vset");

            }
        } else {


            chrome.storage.local.get(["volumeMultiple"], function (data) {

                if (chrome.runtime.lastError) {
                    console.error("读取存储出错：", chrome.runtime.lastError);
                } else {
                    // volumeMultipleInput.value = data.volumeMultiple || defaultVolumeMultiple;
                    // autoRuleListTextarea.value = data.autoRulesList || defaultAutoRulesList;
                    // if (Object.hasOwn(data.autoRulesList, domain)) {
                    // 	rememberDomainCheckbox.checked = true;
                    // } else {
                    // 	rememberDomainCheckbox.checked = false;
                    // }

                    let myVolume = data.volumeMultiple || defaultVolumeMultiple;
                    if (myVolume != 1) {
                        setVolume(myVolume);
                    }



                }

            });


        }

        isLoadingComplete = true;


    });


}


function autoUnmute() {
    // return new Promise((resolve, reject) => {
    chrome.storage.local.get(["ifAutoUnmute"], function (data) {

        if (chrome.runtime.lastError) {
            console.error("读取存储出错：", chrome.runtime.lastError);
        } else {


            let iau = (data.ifAutoUnmute != undefined) ? data.ifAutoUnmute : defaultAutoUnmuteCheckbox;
            if (iau) {
                document.addEventListener("DOMContentLoaded", () => {
                    document.querySelectorAll('video, audio').forEach(media => {
                        media.muted = false;
                        // media.volume = 1.0;

                        // 如果视频被暂停，尝试播放
                        if (media.paused) {
                            media.play().catch(err => console.log("自动播放被阻止:", err));
                        }
                        console.log("aaooo");

                    });
                });
            } else {

            }



        }

    });
    // });
}