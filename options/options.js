
// 获取 DOM 元素
const volumeMultipleInput = document.getElementsByClassName("volume-multiple-input")[0];
const autoRuleListTextarea = document.getElementsByClassName("auto-rule-list-textarea")[0];
const resetButton = document.getElementsByClassName("reset-button")[0];
const autoUnmuteCheckbox = document.getElementsByClassName("auto-unmute-checkbox")[0];
const loadingDelayInput = document.getElementsByClassName("loading-delay-input")[0];

const optionsTestButton = document.getElementsByClassName("options__test-button")[0];
const optionsTestButton2 = document.getElementsByClassName("options__test2-button")[0];
const optionsTestButton3 = document.getElementsByClassName("options__test3-button")[0];

const defaultVolumeMultiple = 1;
const defaultAutoUnmuteCheckbox = true;
const defaultloadingDelay = 5000;
const defaultAutoRulesList = '{}';


function optionsMyLoad() {
    volumeMultipleInput.addEventListener("input", () => {
        // 保存设置
        chrome.storage.local.set({ volumeMultiple: volumeMultipleInput.value }, function () {
            console.log("设置已保存！");
            // console.log("所有存储的数据22：", volumeMultipleInput.value);
        });
    });

    autoRuleListTextarea.addEventListener("input", () => {
        // 保存设置
        chrome.storage.local.set({ autoRulesList: autoRuleListTextarea.value }, function () {
            console.log("设置已保存！");
        });
    });


    resetButton.addEventListener("click", resetAll);


    autoUnmuteCheckbox.addEventListener("change", () => {
        // 保存设置
        chrome.storage.local.set({ ifAutoUnmute: autoUnmuteCheckbox.checked }, function () {
            console.log("设置已保存！" + autoUnmuteCheckbox.checked);
            // console.log("所有存储的数据22：", volumeMultipleInput.value);
        });

    });

    loadingDelayInput.addEventListener("input", () => {
        // 保存设置
        chrome.storage.local.set({ loadingDelay: loadingDelayInput.value }, function () {
            console.log("设置已保存！");
        });
    });




    chrome.storage.local.get(["volumeMultiple", "autoRulesList", "ifAutoUnmute", "loadingDelay"], function (data) {

        if (chrome.runtime.lastError) {
            console.error("读取存储出错：", chrome.runtime.lastError);
        } else {
            volumeMultipleInput.value = data.volumeMultiple || defaultVolumeMultiple;
            autoRuleListTextarea.value = data.autoRulesList || defaultAutoRulesList;


            let iau = (data.ifAutoUnmute != undefined) ? data.ifAutoUnmute : defaultAutoUnmuteCheckbox;
            autoUnmuteCheckbox.checked = iau;
            // console.log("hhh"+iau);

            loadingDelayInput.value = data.loadingDelay || defaultloadingDelay;

        }

    });


    optionsTestButton.addEventListener("click", () => {
        chrome.storage.local.get(null, function (items) {
            console.log("所有存储的数据：", items);
        });

    });

    optionsTestButton2.addEventListener("click", () => {
        autoUnmuteCheckbox.checked = true;

    });

}


function resetAll() {

    if (confirm("确定要恢复默认吗？")) {
        console.log("用户点击了确定");

        chrome.storage.local.clear(function () {
            if (chrome.runtime.lastError) {
                console.error("清除存储出错：", chrome.runtime.lastError);
            } else {
                console.log("所有 local 存储的数据已清除");
                volumeMultipleInput.value = defaultVolumeMultiple;
                autoRuleListTextarea.value = defaultAutoRulesList;
                autoUnmuteCheckbox.checked = defaultAutoUnmuteCheckbox;
                loadingDelayInput.value = defaultloadingDelay;
            }
        });

    } else {
        console.log("用户点击了取消");
    }



}

optionsMyLoad();