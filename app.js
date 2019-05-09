//app.js
const aldstat = require("./utils/ald-stat.js");

function createLockController() {
	const data = {
		prevent: false,
		isOpen: false
	};
	return {
		lockApp: function() {
			if (data.prevent) {
				return;
			}
			data.isOpen = false;
		},
		unlockApp: function() {
			data.isOpen = true;
		},
		preventLock: function() {
			data.prevent = true;
		},
		allowLock: function() {
			data.prevent = false;
		},
		appNeedUnlock: function() {
			const userInfo = this.getUserInfo();
			return (
				userInfo.id &&
				(userInfo.private_pwd && userInfo.private_pwd.length > 16) &&
				!data.isOpen
			);
		}
	};
}

const appConfig = {
	onLaunch: function() {
		var that = this;
		wx.getSystemInfo({
			success: function(res) {
				that.isIos = res.platform == "ios" ? true : false;
			}
		});
	},
	onHide: function() {
		this.lockApp();
	},
	getUserInfo: function(cb) {
		return wx.getStorageSync("userInfo") || {};
	},
	getLoginStatus: function() {
		return Boolean(this.getUserInfo().openid);
	},
	updateUserInfo: function(userInfo) {
		return wx.setStorageSync("userInfo", userInfo);
	},
	globalData: {
		hasUnlock: false,
		userInfo: null,
		habitList: []
	},
	isIos: false
};

App({ ...appConfig, ...createLockController() });
