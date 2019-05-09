// pages/makeDayCard/card.js
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		habitId: 0,
		day: 1,
		habitName: "",
		imageData: ""
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			habitId: options.id,
			day: options.day,
			habitName: options.name
		});
		console.log(options);
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {
		wx.showLoading({
			title: "卡片生成中..."
		});
		habitService
			.getCard()
			.then(data => {
				this.setData({
					imageData: data[0].url
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

	randCard: function() {
		wx.showLoading({
			title: "卡片生成中..."
		});
		habitService
			.getRandCard()
			.then(data => {
				this.setData({
					imageData: data[0].url
				});
				this.drawCard();
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
		let userInfo = habitService.getUserInfo();
		const winWidth = wx.getSystemInfoSync().windowWidth;
		const height = wx.getSystemInfoSync().windowHeight;
		const habitName = "#" + this.data.habitName + "#";
		const day = this.data.day;
		let myDate = new Date();
		let month = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月)
		month = month < 10 ? "0" + month : month;
		const date =
			myDate.getDate() < 10 ? "0" + myDate.getDate() : myDate.getDate(); //获取当前日(1-31)
		var ratio = winWidth / 750;
		const ctx = wx.createCanvasContext("shareCanvas");
		var _this = this;
		this.getImageBack(this.data.imageData, function(res) {
			ctx.setFillStyle("#ffffff");
			ctx.fillRect(0, 0, 620 * ratio, 500 * ratio);

			// 卡片
			ctx.drawImage(res.path, 10 * ratio, 10 * ratio, 600 * ratio, 300 * ratio);

			ctx.drawImage(
				"../../images/day_card_bg.png",
				28 * ratio,
				28 * ratio,
				52 * ratio,
				52 * ratio
			);

			//习惯名字
			ctx.setTextAlign("right"); // 文字居中
			ctx.setFillStyle("#ffffff"); // 文字颜色

			ctx.setFontSize(21 * ratio); // 文字字号：22px
			ctx.fillText(month, 56 * ratio, 52 * ratio);
			ctx.fillText(date, 75 * ratio, 73 * ratio);

			ctx.setFontSize(25 * ratio); // 文字字号：22px
			ctx.fillText(habitName, 595 * ratio, 55 * ratio);

			ctx.setFontSize(28 * ratio); // 文字字号：22px
			ctx.fillText("第" + day + "天", 595 * ratio, 97 * ratio);

			ctx.drawImage(
				"../../images/day_card.jpg",
				40 * ratio,
				340 * ratio,
				130 * ratio,
				130 * ratio
			);

			ctx.setFillStyle("#f2bc00"); // 文字颜色：黑色
			ctx.setTextAlign("left");
			ctx.setFontSize(35 * ratio); // 文字字号：22px
			ctx.fillText("#", 270 * ratio, 421 * ratio);

			ctx.setFillStyle("#585858"); // 文字颜色：黑色
			ctx.setFontSize(32 * ratio); // 文字字号：22px
			ctx.setTextAlign("left");
			ctx.fillText("遇见更好的自己", 308 * ratio, 418 * ratio);
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
			width: 620 * ratio,
			height: 500 * ratio,
			destWidth: 1240,
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
