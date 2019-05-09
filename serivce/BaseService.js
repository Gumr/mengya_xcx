/**
 * Created by ujun on 2017/5/31.
 */
import { navigate } from "../utils/router";

export default class BaseService {
	constructor() {
		this.app = getApp();
	}

	/**
	 * 处理响应
	 * @param res
	 * @return {Promise.<*>}
	 */
	handleRespond(res) {
		return res.status === 0 ? Promise.resolve(res.data) : Promise.reject(res);
	}

	/**
	 * 处理网络请求错误
	 */
	handleError(err) {
		wx.showModal({
			title: "请求失败",
			content: err.errMsg || err.msg || "请求失败",
			showCancel: false
		});
	}

	getUserInfo() {
		return this.app.getUserInfo();
	}

	getUserId() {
		return this.getUserInfo().id;
	}
}
