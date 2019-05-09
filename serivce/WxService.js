import BaseService from "./BaseService";

export default class WxService extends BaseService {
	constructor(context) {
		super(context);
	}

	getUserInfo(withCredentials = false) {
		return new Promise((resolve, reject) => {
			wx.getUserInfo({
				withCredentials,
				success: res => {
					resolve(res);
				},
				fail: err => {
					reject("无法获取您的登录信息，请重新授权");
				}
			});
		});
	}

	getCode() {
		return this.login();
	}

	login() {
		return new Promise((resolve, reject) => {
			wx.login({
				success: res => {
					if (res.code) {
						return resolve(res.code);
					} else {
						return reject("微信用户登录失败！");
					}
				}
			});
		});
	}

	getLocation() {
		return new Promise((resolve, reject) => {
			wx.getLocation({
				type: "wgs84",
				success: res => {
					resolve(res);
				},
				fail: res => {
					reject("无法获取您的地理位置，请确保您的微信定位权限已开通");
				}
			});
		});
	}

	/**
	 * 上传文件
	 * @param {string} url
	 * @param {string} filePath
	 * @param {any} formData
	 */
	uploadFile(url, filePath, formData) {
		return new Promise((resolve, reject) => {
			wx.uploadFile({
				url,
				filePath,
				name: "file",
				formData,
				success: function(res) {
					resolve(res);
				},
				fail: function(e) {
					reject({ info: "文件上传失败" });
				}
			});
		});
	}
}
