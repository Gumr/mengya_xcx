// pages/vip_features/index.js
import { navigate, redirect } from "../../utils/router";

Page({
	data: {
		hasSetPrivate: false
	},
	onLoad: function(options) {
		this.setData({
			hasSetPrivate: options.hasSetPrivate & 1
		});
	},
	switchPrivate: function(e) {
		const { value } = e.detail;
		if (value) {
			navigate({
				path: "pages/private_setting/index"
			});
		} else {
			wx.showModal({
				title: "提示",
				content: "确定取消隐私密码？",
				success: res => {
					if (res.confirm) {
						redirect({
							path: "pages/cancel_private/index"
						});
					} else {
						this.setData({
							hasSetPrivate: true
						});
					}
				}
			});
		}
	}
});
