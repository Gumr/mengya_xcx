// pages/shareFt/share.js
import UserService from "../../serivce/UserService";
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		habitId: 0,
		habitName: "",
		imageData: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			habitId: options.habitId
		});
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		wx.showLoading({
			title: "生成中..."
		});
		const userService = new UserService();
		userService
			.getGroupQRCode(this.data.habitId)
			.then(data => {
				this.setData({
					imageData: data
				});
				habitService
					.getHabit(this.data.habitId)
					.then(data => {
						this.setData({
							habitName: data.name
						});
						this.drawCard();
					})
					.catch(err => {});
			})
			.catch(err => {
				console.log(err);
			});
	},
	getImageBack: function(path, cb) {
		wx.getImageInfo({
			src: path,
			success: res => {
				cb(res);
			},
			fail() {
				wx.hideLoading();
			}
		});
	},

	drawCard: function() {
		console.log("start");
		let userInfo = habitService.getUserInfo();
		const winWidth = wx.getSystemInfoSync().windowWidth;
		const height = wx.getSystemInfoSync().windowHeight;
		const habitName = "#" + this.data.habitName + "#";
		var ratio = winWidth / 750;
		const ctx = wx.createCanvasContext("shareCanvas");
		console.log(this.data.imageData);
		var _this = this;
		this.getImageBack(this.data.imageData, function(res) {
			ctx.setFillStyle("#ffffff");
			ctx.fillRect(0, 0, 680 * ratio, 680 * ratio);

			// 二维码
			ctx.drawImage(
				res.path,
				150 * ratio,
				166 * ratio,
				380 * ratio,
				380 * ratio
			);

			//习惯名字
			ctx.setTextAlign("center"); // 文字居中
			ctx.setFillStyle("#1f82d2"); // 文字颜色：黑色
			ctx.setFontSize(36 * ratio); // 文字字号：22px
			ctx.fillText(habitName, 340 * ratio, 80 * ratio);

			ctx.setFillStyle("#444444"); // 文字颜色：黑色
			ctx.setFontSize(28 * ratio); // 文字字号：22px
			ctx.fillText("邀请你加入一起坚持", 340 * ratio, 134 * ratio);

			ctx.setFillStyle("#444444"); // 文字颜色：黑色
			ctx.setFontSize(28 * ratio); // 文字字号：22px
			ctx.fillText("微信长按或扫码进入", 340 * ratio, 600 * ratio);

			ctx.setFillStyle("#666666"); // 文字颜色：黑色
			ctx.setFontSize(24 * ratio); // 文字字号：22px
			ctx.fillText("萌芽习惯·小程序·遇见更好的自己", 340 * ratio, 645 * ratio);
			ctx.draw();
			wx.hideLoading();
		});
	},
	saveCard: function() {
		var that = this;
		wx.showLoading({
			title: "保存中..."
		});
		const winWidth = wx.getSystemInfoSync().windowWidth;
		var ratio = winWidth / 750;
		wx.canvasToTempFilePath({
			x: 0,
			y: 0,
			width: 680 * ratio,
			height: 680 * ratio,
			destWidth: 1000,
			destHeight: 1000,
			canvasId: "shareCanvas",
			success: function(res) {
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: function() {
						wx.hideLoading();
						wx.showToast({
							title: "已保存到相册",
							icon: "none",
							duration: 2000
						});
					},
					fail: function() {
						wx.hideLoading();
					}
				});
			}
		});
	}
});
