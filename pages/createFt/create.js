// pages/createFt/create.js
import HabitService from "../../serivce/HabitService";
import { navigate } from "../../utils/router";
const habitService = new HabitService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		input: "",
		createType: "1",
		notice: "",
		isRepair: false,
		needHome: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		//如果不带home参数，则显示回到首页按钮
		this.setData({
			needHome: options.home ? false : true
		});
	},

	/**
	 * 习惯名称输入监听
	 */
	bindTitleInput(e) {
		this.setData({
			input: e.detail.value
		});
	},

	/**
	 * 习惯公告输入监听
	 */
	bindRuleInput(e) {
		this.setData({
			notice: e.detail.value
		});
	},

	/**
	 * 设置7天内补卡变化监听
	 */
	repairChange(e) {
		const changeValue = e.detail.value;
		this.setData({
			isRepair: changeValue ? true : false
		});
	},

	/**
	 * 创建群习惯
	 */
	createGroupHabit() {
		if (this.data.input == "") {
			wx.showToast({
				title: "群打卡名称不能为空",
				icon: "none",
				duration: 2000
			});
			return;
		}
		habitService
			.createGroupHabit(
				this.data.input,
				this.data.createType,
				this.data.notice,
				this.data.isRepair ? 1 : 0
			)
			.then(data => {
				wx.showToast({
					title: "创建习惯群成功",
					icon: "none",
					duration: 2000
				});
				this.setData({
					input: ""
				});
				setTimeout(() => {
					this.backHome();
				}, 2000);
			})
			.catch(err => {
				if (err && err.status === 13005) {
					wx.showModal({
						title: "创建失败",
						content:
							"您目前只能添加5个习惯，您可通过连续签到或者开通高级账号功能解除限制",
						confirmText: "去开通",
						success: res => {
							if (res.confirm) {
								navigate({
									path: "pages/vip/index"
								});
							}
						}
					});
				} else {
					wx.showToast({
						title: err.info || "",
						icon: "fail",
						duration: 2000
					});
				}
			});
	},

	/**
	 * 分享进来，回到首页
	 */
	backHome() {
		wx.switchTab({
			url: "../habit/habit"
		});
	},

	/**
	 * 进入圈子直达服务
	 */
	toDirect(e) {
		let url = "https://mp.weixin.qq.com/s/oMtsNJ9cDMhb4501gdrnIw";
		let title = "萌芽圈子直达服务";
		wx.navigateTo({
			url: "../direct/direct?url=" + url + "&t=" + title
		});
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function() {
		var app = getApp();
		app.aldstat.sendEvent("用户分享", {
			位置: "创建圈子页面",
			按钮: "顶部按钮"
		});
		return {
			title: "我在坚持培养好习惯，期待成长，遇见更好的自己。",
			path: "/pages/habit/habit",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	}
});
