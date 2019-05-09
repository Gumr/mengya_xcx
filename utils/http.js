import { navigate } from "../utils/router";
const BASE_V = 182; //代码版本
const BASE_URL = "https://www.xiaeke.com/benmao/index.php/Home"; //正式环境
// const BASE_URL = "http://127.0.0.1/habit-weapp/index.php/Home"; // 本地开发环境

const sideEffect = {
	beforeRequest(options) {
		if (options.hasOwnProperty("loadingMsg")) {
			wx.showLoading({
				title: "" + options.loadingMsg
			});
		}
	},
	afterRequest(options) {
		if (options.hasOwnProperty("loadingMsg")) {
			wx.hideLoading();
		}
	}
};

function filterParams(params) {
	let res = {};
	Object.keys(params).forEach(key => {
		if (params[key] === null || params === undefined) {
			return;
		}
		res[key] = params[key];
	});
	res["vc"] = BASE_V;
	return res;
}

function json2Form(json) {
	var str = [];
	for (var p in json) {
		str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
	}
	return str.join("&");
}

function canRequest(options) {
	const app = getApp();
	return (
		(options.hasOwnProperty("noNeedPsw") && options.noNeedPsw) ||
		!app.appNeedUnlock()
	);
}

function needAuth(options) {
	return !canRequest(options);
}

export function request(method, api, params = {}, options = {}) {
	if (needAuth(options)) {
		navigate({
			path: "pages/unlock/index"
		});
		return Promise.reject({ info: "", status: 99 });
	} else {
		sideEffect.beforeRequest(options);
		params = filterParams(params);
		return new Promise((resolve, reject) => {
			wx.request({
				url: (options.url || BASE_URL) + api,
				data: params,
				method,
				header: {
					"content-type":
						method === "POST"
							? "application/x-www-form-urlencoded"
							: "application/json" // 默认值
				},
				success(res) {
					resolve(res.data);
				},
				fail(e) {
					reject({ info: "网络请求失败" });
				},
				complete() {
					sideEffect.afterRequest(options);
				}
			});
		});
	}
}

export function get(api, params = {}, options = {}) {
	return request("GET", api, params, options);
}

export function post(api, params = {}, options = {}) {
	return request("POST", api, params, options);
}

export function put(api, params = {}, options = {}) {
	return request("PUT", api, params, options);
}
