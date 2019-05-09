// pages/habitStore/index.js
import HabitService from "../../serivce/HabitService";
import UserService from "../../serivce/UserService";
const habitService = new HabitService();
const userService = new UserService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		userInfo: "",
		gender: "她", //0女，1男
		id: 0,
		habitList: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		let userId = options.id;
		this.setData({
			id: userId,
			isShare: options.share ? options.share : 0
		});
		userService
			.getOtherUserInfo(userId)
			.then(userInfo => {
				this.setData({
					userInfo,
					gender:
						userService.getUserId() == userInfo.id
							? "我"
							: userInfo.gender == 1
								? "他"
								: "她"
				});
				wx.setNavigationBarTitle({
					title: userInfo.nickname + "的归档习惯"
				});
			})
			.catch(err => {
				console.log(err);
			});

		habitService.getUserStoreHabitList(this.data.id).then(data => {
			this.setData({ habitList: data });
		});
	},

	clickHabit(e) {
		let id = e.currentTarget.dataset.id;
		let days = e.currentTarget.dataset.days;
		wx.navigateTo({
			url:
				"../mindUser/feed?id=" + id + "&day=" + days + "&user=" + this.data.id
		});
		var app = getApp();
		app.aldstat.sendEvent("点击用户主页习惯", {
			页面: "用户主页"
		});
	},

	pressHabit(e) {
		if (this.data.gender != "我") {
			return;
		}
		let habitId = e.currentTarget.dataset.id;
		const _this = this;
		wx.showModal({
			title: "恢复坚持习惯",
			content: "恢复坚持习惯后，习惯会重新进入坚持列表继续坚持，确定恢复吗？",
			success: res => {
				if (res.cancel) {
					_this.handleTakeOutHabit(habitId);
				} else if (res.confirm) {
					console.log("用户点击取消");
				}
			},
			cancelColor: "#4aa3dd",
			cancelText: "恢复",
			confirmText: "取消",
			confirmColor: "#666666"
		});
	},

	/**
	 * 点击删除习惯事件
	 */
	handleTakeOutHabit(habitId) {
		habitService
			.takeOutHabit(habitId)
			.then(data => {
				wx.showToast({
					title: "恢复成功，请到习惯列表查看！",
					icon: "none",
					duration: 2000
				});
				const list = this.data.habitList.filter(item => item.id !== habitId);
				this.setData({
					habitList: list
				});
			})
			.catch(err => {
				wx.showToast({
					title: "恢复失败！",
					icon: "fail",
					duration: 2000
				});
			});
	}
});
