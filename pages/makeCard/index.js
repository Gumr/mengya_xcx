// pages/makeCard/index.js
import HabitService from "../../serivce/HabitService";
const habitService = new HabitService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		checkId: 0,
		note: "",
		userInfo: "",
		day: 0,
		habitName: "",
		canvasHeight: 300,
		page: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		this.setData({
			checkId: options.id,
			day: options.day,
			habitName: options.name,
			page: options.page ? options.page : 0
		});
		wx.showLoading({
			title: "图片生成中..."
		});
		this.getNote();
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {},
	backHome: function() {
		wx.switchTab({
			url: "../create/create"
		});
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function(res) {
		return {
			title:
				"我在培养「" +
				this.data.habitName +
				"」习惯，已经坚持" +
				this.data.day +
				"天。",
			path: "/pages/habit/habit",
			success: function(res) {
				// 转发成功
			},
			fail: function(res) {
				// 转发失败
			}
		};
	},
	saveCardShow: function() {
		var _this = this;
		wx.showModal({
			title: "卡片保存",
			content: "预览图会保存到相册，可分享给朋友",
			success: res => {
				if (res.confirm) {
					_this.saveCard();
				} else if (res.cancel) {
					console.log("用户点击取消");
				}
			},
			confirmText: "保存"
		});
	},
	getNote: function() {
		habitService
			.getHabitNote(this.data.checkId)
			.then(data => {
				this.setData({
					note: data,
					userInfo: habitService.getUserInfo()
				});
				this.drawCard();
			})
			.catch(err => {
				if (err && err.info) {
					wx.showModal({
						title: "失败提示",
						content: "生成卡片失败",
						success: res => {
							if (res.confirm) {
								wx.navigateBack();
							} else if (res.cancel) {
								console.log("用户点击取消");
								wx.navigateBack();
							}
						}
					});
				} else {
					wx.showToast({
						title: "生成卡片失败",
						icon: "warn",
						duration: 2000
					});
				}
			});
	},
	getImageBack: function(path, cb) {
		wx.getImageInfo({
			src: path,
			success: res => {
				cb(res);
			}
		});
	},
	drawCard: function() {
		var _this = this;
		const winWidth = wx.getSystemInfoSync().windowWidth;
		const height = wx.getSystemInfoSync().windowHeight;
		const name = this.data.habitName;
		const days = this.data.day;
		const mindNote = this.data.note;
		var addTime = mindNote.add_time + "";
		addTime = addTime.split(" ")[0];
		const pic = mindNote.pic_url;
		const userName = this.data.userInfo.nickname;

		var ratio = winWidth / 750;
		const ctx = wx.createCanvasContext("shareCanvas");

		ctx.setFillStyle("#ffffff");
		ctx.fillRect(0, 0, 750 * ratio, (100 + 51 + 42) * ratio);

		var top = 100;
		// 坚持天数等
		ctx.setTextAlign("right"); // 文字居中
		ctx.setFillStyle("#29a1f7"); // 文字颜色：黑色
		ctx.setFontSize(46 * ratio); // 文字字号：22px
		ctx.fillText("第 " + days + " 天", 700 * ratio, top * ratio);

		top = top + 51;
		ctx.setFillStyle("#666666"); // 文字颜色：黑色
		ctx.setFontSize(28 * ratio); // 文字字号：22px
		ctx.fillText("坚持" + name, 700 * ratio, top * ratio);

		top = top + 40;
		ctx.setFillStyle("#999999"); // 文字颜色：黑色
		ctx.setFontSize(24 * ratio); // 文字字号：22px
		ctx.fillText(addTime, 700 * ratio, top * ratio);

		if (pic != null && pic != "" && pic != undefined) {
			this.getImageBack(pic + "?x-oss-process=image/resize,w_650", function(
				res
			) {
				ctx.setFillStyle("#ffffff");
				ctx.fillRect(
					0,
					top * ratio,
					750 * ratio,
					(top + 45 + res.height) * ratio
				);
				top = top + 45;
				ctx.drawImage(
					res.path,
					50 * ratio,
					top * ratio,
					res.width * ratio,
					res.height * ratio
				);
				top = top + res.height;

				if (
					mindNote.note != null &&
					mindNote.note != null &&
					mindNote.note != undefined
				) {
					var notes = _this.formatString(mindNote.note, 23);
					// notes = notes.reverse();
					var textHeight = 0;
					for (var i in notes) {
						textHeight = textHeight + 38;
					}
					ctx.setFillStyle("#ffffff");
					ctx.fillRect(
						0,
						top * ratio,
						750 * ratio,
						(top + 55 + textHeight) * ratio
					);
					top = top + 55;
					ctx.setTextAlign("left"); // 文字居中
					ctx.setFillStyle("#666666"); // 文字颜色：黑色
					ctx.setFontSize(28 * ratio); // 文字字号：22px

					for (var i in notes) {
						ctx.fillText(notes[i], 50 * ratio, top * ratio, 650 * ratio);
						top = top + 38;
					}
				}

				ctx.setFillStyle("#ffffff");
				ctx.fillRect(0, top * ratio, 750 * ratio, (top + 35 + 175) * ratio);
				top = top + 35;
				ctx.setTextAlign("right");
				ctx.setFillStyle("#999999"); // 文字颜色：黑色
				ctx.setFontSize(24 * ratio); // 文字字号：22px
				ctx.fillText("by" + userName, 700 * ratio, top * ratio);

				const codeTop = top + 55;
				// 底图
				ctx.drawImage(
					"../../images/keep.jpg",
					580 * ratio,
					codeTop * ratio,
					120 * ratio,
					120 * ratio
				);

				ctx.setTextAlign("left");
				ctx.setFillStyle("#999999"); // 文字颜色：黑色
				ctx.setFontSize(23 * ratio); // 文字字号：22px
				ctx.fillText(
					"余生很贵，不懈努力，",
					332 * ratio,
					(codeTop + 49) * ratio
				);
				ctx.fillText(
					"期待遇见更好的自己！",
					332 * ratio,
					(codeTop + 89) * ratio
				);
				ctx.setFillStyle("#cccccc");
				ctx.setFontSize(19 * ratio);
				ctx.fillText("萌芽习惯", 464 * ratio, (codeTop + 120) * ratio);

				_this.setData({
					canvasHeight: (codeTop + 175) * ratio
				});
				//绘制呢称
				ctx.draw();
				wx.hideLoading();
				wx.showToast({
					title: "图片生成成功",
					icon: "none",
					duration: 1600
				});
			});
		} else {
			if (
				mindNote.note != null &&
				mindNote.note != null &&
				mindNote.note != undefined
			) {
				var notes = _this.formatString(mindNote.note, 23);
				// notes = notes.reverse();
				var textHeight = 0;
				for (var i in notes) {
					textHeight = textHeight + 38;
				}
				ctx.setFillStyle("#ffffff");
				ctx.fillRect(
					0,
					top * ratio,
					750 * ratio,
					(top + 55 + textHeight) * ratio
				);
				top = top + 55;
				ctx.setTextAlign("left"); // 文字居中
				ctx.setFillStyle("#666666"); // 文字颜色：黑色
				ctx.setFontSize(28 * ratio); // 文字字号：22px
				for (var i in notes) {
					ctx.fillText(notes[i], 50 * ratio, top * ratio, 650 * ratio);
					top = top + 38;
				}
			}

			ctx.setFillStyle("#ffffff");
			ctx.fillRect(0, top * ratio, 750 * ratio, (top + 35 + 175) * ratio);

			top = top + 35;
			ctx.setTextAlign("right");
			ctx.setFillStyle("#999999"); // 文字颜色：黑色
			ctx.setFontSize(24 * ratio); // 文字字号：22px
			ctx.fillText("by" + userName, 700 * ratio, top * ratio);

			const codeTop = top + 55;
			// 底图
			ctx.drawImage(
				"../../images/keep.jpg",
				580 * ratio,
				codeTop * ratio,
				120 * ratio,
				120 * ratio
			);

			ctx.setTextAlign("left");
			ctx.setFillStyle("#999999"); // 文字颜色：黑色
			ctx.setFontSize(23 * ratio); // 文字字号：22px
			ctx.fillText("余生很贵，不懈努力，", 332 * ratio, (codeTop + 49) * ratio);
			ctx.fillText("期待遇见更好的自己！", 332 * ratio, (codeTop + 89) * ratio);
			ctx.setFillStyle("#cccccc");
			ctx.setFontSize(19 * ratio);
			ctx.fillText("萌芽习惯", 464 * ratio, (codeTop + 120) * ratio);

			_this.setData({
				canvasHeight: (codeTop + 175) * ratio
			});
			//绘制呢称
			ctx.draw();
			wx.hideLoading();
			wx.showToast({
				title: "图片生成成功",
				icon: "none",
				duration: 1600
			});
		}
	},
	saveCard: function() {
		var that = this;
		wx.showLoading({
			title: "保存中..."
		});
		const winWidth = wx.getSystemInfoSync().windowWidth;
		var ratio = winWidth / 750;
		var sHeight = this.data.canvasHeight;
		wx.canvasToTempFilePath({
			x: 0,
			y: 0,
			width: 750 * ratio,
			height: sHeight,
			destWidth: 750 * ratio * 2,
			destHeight: sHeight * 2,
			canvasId: "shareCanvas",
			success: function(res) {
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success: function() {
						wx.hideLoading();
						wx.showToast({
							title: "已保存到相册,去相册查看吧",
							icon: "none",
							duration: 3000
						});
					},
					fail: function() {
						wx.hideLoading();
					}
				});
			}
		});
		var app = getApp();
		const name = this.data.habitName;
		const userName = this.data.userInfo.nickname;
		app.aldstat.sendEvent("保存卡片", {
			习惯名称: name,
			用户名: userName
		});
	},
	formatString: function(result, num) {
		result = result + "";
		var arrayN = result.split(/[\n,]/g);
		var array = new Array();
		for (var j = 0; j < arrayN.length; j++) {
			var str = arrayN[j];
			var len = str.length;
			for (var i = 0; i < str.length / num; i++) {
				var str1 = str.substring(i * num, (i + 1) * num);
				array.push(str1);
			}
		}
		return array;
	}
});
