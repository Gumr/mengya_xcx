// components/get_user_info.js
import { throttle } from "../utils/throttle";
import WxService from "../serivce/WxService";
import LoginService from "../serivce/LoginService";

const app = getApp();

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		payload: {
			type: null,
			value: null
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		isLogin: true
	},

	ready: function() {
		//已经登陆了不再受用getUserinfo接口，这个微信有点慢
		this.setData({
			isLogin: app.getLoginStatus()
		});
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		handleUserInfo: function(e) {
			const wxService = new WxService();
			const loginService = new LoginService();
			const userInfo = loginService.getUserInfo();
			if (userInfo && userInfo.openid) {
				this.triggerEvent("onLoginSuccess", {
					userInfo,
					payload: this.data.payload
				});
				return;
			}
			if (e.detail.errMsg != "getUserInfo:ok") {
				wx.showModal({
					title: "授权失败",
					content: "请重新操作",
					showCancel: false,
					onConfirm: () => {
						this.triggerEvent("onLoginFail", {});
					}
				});
			} else {
				const { userInfo } = e.detail;
				console.log(userInfo);
				wx.showLoading({
					title: "登陆中"
				});
				wxService
					.getCode()
					.then(code => loginService.getOpenId(code))
					.then(({ openid }) => {
						return loginService.loginWithWeChat(
							openid,
							userInfo.nickName,
							userInfo.gender, //性别 0：未知、1：男、2：女
							userInfo.avatarUrl,
							userInfo.province,
							userInfo.city,
							userInfo.country
						);
					})
					.then(userInfo => {
						wx.hideLoading();
						app.updateUserInfo(userInfo);
						this.triggerEvent("onLoginSuccess", {
							userInfo,
							payload: this.data.payload
						});
					})
					.catch(err => {
						console.log(err);
						wx.hideLoading();
						this.triggerEvent("onLoginFail", { err });
					});
			}
		},
		handleTap: function() {
			const loginService = new LoginService();
			const userInfo = loginService.getUserInfo();
			this.triggerEvent("onLoginSuccess", {
				userInfo,
				payload: this.data.payload
			});
		}
	}
});
