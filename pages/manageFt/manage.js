// pages/manageFt/manage.js
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		userList: [],
		id: 0,
		ft_user: 0,
		ft_check: 0,
		currentTab: 0,
		isRepair: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			id: options.id
		});
		this.getHabitGroupUser();
		this.getHabitGroupStatistics();
	},

	getHabitNotice() {
		habitService
			.getHabitNotice(this.data.id)
			.then(data => {
				this.setData({
					isRepair: parseInt(data.repair) == 1 ? true : false
				});
			})
			.catch(err => {});
	},

	toCopyDirect() {
		wx.setClipboardData({
			data: "pages/checkFt/check?scene=" + this.data.id,
			success: function(res) {
				wx.showToast({
					title: "直达路径复制成功",
					icon: "none",
					duration: 2000
				});
			}
		});
	},

	repairChange(e) {
		const changeValue = e.detail.value;
		this.setData({
			isRepair: changeValue ? true : false
		});
		habitService
			.changeHabitRepair(this.data.id, changeValue ? 1 : 0)
			.then(data => {
				wx.showToast({
					title: "修改成功",
					icon: "success",
					duration: 2000
				});
			})
			.catch(err => {
				wx.showToast({
					title: "修改失败,请重试",
					icon: "warn",
					duration: 2000
				});
			});
	},

	swichNav(e) {
		if (this.data.currentTab === e.target.dataset.current) {
			return false;
		} else {
			this.setData({
				currentTab: e.target.dataset.current
			});
		}
		if (this.data.currentTab == 1) {
			this.getHabitNotice();
		}
	},

	romoveGrouper(e) {
		let deleteUserId = e.currentTarget.dataset.user;
		wx.showModal({
			title: "移出圈子成员提示",
			content:
				"移出该圈子成员，他的习惯、打卡记录等内容将会被删除，确定移出该圈子成员吗？",
			confirmText: "确定",
			confirmColor: "#ea2000",
			success: res => {
				if (res.confirm) {
					habitService
						.deleteGroupUser(this.data.id, deleteUserId)
						.then(data => {
							wx.showToast({
								title: "移出成功",
								icon: "none",
								duration: 2000
							});
							this.getHabitGroupUser();
							this.getHabitGroupStatistics();
						})
						.catch(err => {
							wx.showToast({
								title: "操作失败",
								icon: "none",
								duration: 2000
							});
						});
				}
			}
		});
	},

	getHabitGroupStatistics: function() {
		habitService
			.getHabitGroupStatistics(this.data.id, "0")
			.then(data => {
				this.setData({
					ft_user: data[0].u_count,
					ft_check: data[0].c_count
				});
			})
			.catch(err => {});
	},

	getHabitGroupUser: function() {
		habitService
			.getHabitAllGroupUser(this.data.id)
			.then(data => {
				if (data.length > 0) {
					this.setData({
						userList: data
					});
				}
			})
			.catch(err => {});
	},

	toDirect: function(e) {
		let url = "https://mp.weixin.qq.com/s/oMtsNJ9cDMhb4501gdrnIw";
		let title = "萌芽圈子直达服务";
		wx.navigateTo({
			url: "../direct/direct?url=" + url + "&t=" + title
		});
	}
});
