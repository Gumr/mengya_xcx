/**
 * Created by ujun on 2017/8/17.
 * 这里重新封装了导航方法，navigate、redirect、switchTab、reLaunch分别对应着微信的导航方法，
 * 与微信提供的API不通过的是，这里参数data里面的path是静态配置，即app.json文件的页面路径；
 * params为链接查询参数；
 * @example
 * navigate({
 *      path:'pages/index/index',
 *      params:{
 *          id:123
 *      }
 * });//跳转到index页面，index页面的options可以读取到id。
 *
 */

let CURRENT_ROUTE = "";

export function navigate(data = {}) {
	return route(data, "navigateTo");
}

export function redirect(data = {}) {
	return route(data, "redirectTo");
}

export function switchTab(data = {}) {
	return route(data, "switchTab");
}

export function reLaunch(data = {}) {
	return route(data, "reLaunch");
}

function joinPath(index, url) {
	let str = "";
	for (let i = 0; i < index - 1; i++) {
		str += "../";
	}
	return str + url;
}

function route(data, method) {
	try {
		const length = getCurrentPages().length;
		const currentRoute = getCurrentPages()[length - 1].route;
		if (currentRoute === CURRENT_ROUTE) {
			//防止在同一个tick内导航到同一页面；
			return;
		}
		CURRENT_ROUTE = currentRoute;
		clearCurrent();
		if (data.path === currentRoute) {
			return;
		}
		const pathIndex = currentRoute.split("/").length;
		const path = joinPath(pathIndex, data.path);
		const url = joinParams(data.params, path);
		const obj = { ...data, url };
		wx[method].call(null, obj);
	} catch (e) {
		console.log(e);
	}
}

function joinParams(params, url) {
	if (!params) {
		return url;
	}
	let keys = Object.keys(params);
	let finalUrl = "";
	if (keys.length === 0) {
		return url;
	} else {
		if (url.indexOf("?") === -1) {
			finalUrl = keys.reduce((url, key) => {
				return url + key + "=" + params[key] + "&";
			}, url + "?");
		} else {
			if (url.endsWith("?")) {
				finalUrl = keys.reduce((url, key) => {
					return url + key + "=" + params[key] + "&";
				}, url);
			} else {
				if (url.endsWith("&")) {
					finalUrl = keys.reduce((url, key) => {
						return url + key + "=" + params[key] + "&";
					}, url);
				} else {
					finalUrl = keys.reduce((url, key) => {
						return url + key + "=" + params[key] + "&";
					}, url + "&");
				}
			}
		}
	}
	return finalUrl.endsWith("&")
		? finalUrl.slice(0, finalUrl.length - 1)
		: finalUrl;
}

function clearCurrent() {
	setTimeout(() => {
		CURRENT_ROUTE = "";
	}, 0);
}
