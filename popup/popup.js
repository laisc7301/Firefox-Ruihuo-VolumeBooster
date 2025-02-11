



const popupX1Button = document.getElementsByClassName("x1-button")[0];
const popupX2Button = document.getElementsByClassName("x2-button")[0];
const popupX4Button = document.getElementsByClassName("x4-button")[0];
const popupX8Button = document.getElementsByClassName("x8-button")[0];
const popupX16Button = document.getElementsByClassName("x16-button")[0];
const popupX32Button = document.getElementsByClassName("x32-button")[0];
const domainSpan = document.getElementsByClassName("domain-span")[0];
const rememberDomainCheckbox = document.getElementsByClassName("remember-domain-checkbox")[0];

const settingsButton = document.getElementsByClassName("settings-button")[0];
const settingsButton2 = document.getElementsByClassName("settings-button-2")[0];

var volumeInput = document.getElementsByClassName("volumeinput")[0];

const defaultVolumeMultiple = 1;
const defaultAutoRulesList = '{}';

var domain = "err0";

function myLoad() {
	popupX1Button.addEventListener("click", () => {
		setVolume(1);
	});
	popupX2Button.addEventListener("click", () => {
		setVolume(2);
	});
	popupX4Button.addEventListener("click", () => {
		setVolume(4);
	});
	popupX8Button.addEventListener("click", () => {
		setVolume(8);
	});
	popupX16Button.addEventListener("click", () => {
		setVolume(16);
	});
	popupX32Button.addEventListener("click", () => {
		setVolume(32);
	});
	volumeInput.addEventListener("input", () => {
		setVolume(volumeInput.value);
	});
	rememberDomainCheckbox.addEventListener("change", rememberDomainCheckboxChange);

	settingsButton.addEventListener("click", () => {
		browser.runtime.openOptionsPage();
	});
	settingsButton2.addEventListener("click", () => {
		browser.runtime.openOptionsPage();
	});








}



function setVolume(myvolume) {


	// 获取当前活动的标签页
	browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
		// 定义要传递的参数
		const params = {
			action: "setvolume",
			data: {

				volumeMultiple: myvolume
			}
		};

		// 发送消息到 content.js，并传递参数
		browser.tabs.sendMessage(tabs[0].id, params).then(response => {
			if (response && response.success) {
				console.log("Received response from content.js:", response.data);
			}
		});
	});

	volumeInput.value = myvolume;


	if (rememberDomainCheckbox.checked) {
		addRuleList(domain, myvolume);
	}




}


function getVolume() {
	browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
		// 定义要传递的参数
		const params = {
			action: "getvolume",
			data: {
			}
		};

		// 发送消息到 content.js，并传递参数
		browser.tabs.sendMessage(tabs[0].id, params).then(response => {
			if (response && response.success) {
				console.log("Received response from content.js:", response.data);
				volumeInput.value = response.data;
			}
		});
	});

}


function getDomain() {


	browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
		// 定义要传递的参数
		const params = {
			action: "getdomain",
			data: {
			}
		};

		// 发送消息到 content.js，并传递参数
		browser.tabs.sendMessage(tabs[0].id, params).then(response => {
			if (response && response.success) {
				console.log("Received response from content.js:", response.data);
				domainSpan.innerHTML = response.data;
				domain = response.data;

				//---
				chrome.storage.local.get(["autoRulesList"], function (data) {

					if (chrome.runtime.lastError) {
						console.error("读取存储出错：", chrome.runtime.lastError);
					} else {
						// volumeMultipleInput.value = data.volumeMultiple || defaultVolumeMultiple;
						// autoRuleListTextarea.value = data.autoRulesList || defaultAutoRulesList;
						let autoRulesListJson = JSON.parse(data.autoRulesList || defaultAutoRulesList);

						if (Object.hasOwn(autoRulesListJson, domain)) {
							rememberDomainCheckbox.checked = true;
							console.log(1111 + "::" + autoRulesListJson[domain]);
							// setVolume(autoRulesListJson[domain]);
							// volumeInput.value = autoRulesListJson[domain];
							// console.log(autoRulesListJson[domain]);


						} else {
							rememberDomainCheckbox.checked = false;
							console.log(data.autoRulesList);
						}
					}

				});





			}
		});
	});

}


function rememberDomainCheckboxChange() {

	if (rememberDomainCheckbox.checked) {
		console.log('复选框已被选中');
		addRuleList(domain, volumeInput.value);

	} else {
		console.log('复选框未被选中');
		deleteRuleList(domain);
	}

}

function getAutoRulesList() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(["autoRulesList"], (data) => {

			if (chrome.runtime.lastError) {
				console.error("读取存储出错：", chrome.runtime.lastError);
			} else {
				if (data) {
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


function setAutoRuleList(myValue) {
	console.log(myValue);
	let autoRulesList = myValue;

	chrome.storage.local.set({ autoRulesList }, () => {
		console.log("音量配置:\n" + autoRulesList);
	});
}

function addRuleList(myDomain, myValue) {
	getAutoRulesListJSON().then((myAutoRulesListJSONObject) => {
		myAutoRulesListJSONObject[myDomain] = myValue;
		setAutoRuleList(JSON.stringify(myAutoRulesListJSONObject));

	});


}

function deleteRuleList(myDomain) {
	getAutoRulesListJSON().then((myAutoRulesListJSONObject) => {
		myAutoRulesListJSONObject[myDomain] = undefined;
		setAutoRuleList(JSON.stringify(myAutoRulesListJSONObject));

	});


}

function getSetting() {
	console.log();

}

function saveSetting() {
	console.log();

}


function myLoad2() {
	getVolume();
	getDomain();
}


myLoad();
myLoad2();







// var myshow = document.getElementById("myshow").addEventListener("click", () => {
// 	showWaitMessage();
// });


function showWaitMessage() {
	document.getElementById('messageBox').style.display = 'block';
	document.getElementById('overlay').style.display = 'block';



}

function hideWaitMessage() {
	document.getElementById('messageBox').style.display = 'none';
	document.getElementById('overlay').style.display = 'none';
}

showWaitMessage();





var waitInterval0 = setInterval(function () { waitInterval() }, 500);
waitInterval();
function waitInterval() {


	browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
		// 定义要传递的参数
		const params = {
			action: "isloadingcomplete",
			data: {
			}
		};

		// 发送消息到 content.js，并传递参数
		browser.tabs.sendMessage(tabs[0].id, params).then(response => {
			if (response && response.success) {
				console.log("112233:", response.data);
				// volumeInput.value = response.data;
				if (response.data == true) {
					console.log(response.data);

					hideWaitMessage();
					clearInterval(waitInterval0);
					getVolume();

				}
			}
		});
	});

}

// hideWaitMessage();