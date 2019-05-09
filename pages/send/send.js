// pages/send/send.js
import HabitService from "../../serivce/HabitService";
import OssService from "../../serivce/OssService";
import { navigate } from "../../utils/router";

const habitService = new HabitService();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		canLook: false,
		content: "",
		imageSrc: "",
		habitId: 0,
		checkId: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		//接收到的是字符串
		this.setData({
			habitId: options.habitId,
			checkId: options.c,
			canLook: options.p == "true" ? false : true
		});
		if (this.data.checkId == 0) {
			wx.showToast({
				title: "请重新进入记录",
				icon: "none",
				duration: 2000
			});
			setTimeout(function() {
				wx.navigateBack();
			}, 2000);
		}
		wx.hideLoading();
	},

	onShow: function() {},

	/**
	 * 记录内容的输入监听
	 */
	contentInput(e) {
		var value = e.detail.value + "";
		this.setData({
			content: value
		});
	},

	/**
	 * 选择图片
	 */
	selectImage() {
		const app = getApp();
		app.preventLock();
		wx.chooseImage({
			count: 1, // 最多可以选择的图片张数，默认9
			sizeType: ["original", "compressed"], // original 原图，compressed 压缩图，默认二者都有
			sourceType: ["album", "camera"], // album 从相册选图，camera 使用相机，默认二者都有
			success: res => {
				// success
				this.setData({
					imageSrc: res.tempFilePaths
				});
			},
			fail: function() {
				// fail
			},
			complete: function() {
				app.allowLock();
			}
		});
	},

	/**
	 * 发送心情，有图片先发送图片到oss
	 */
	onSend() {
		if (this.data.content == "" && this.data.imageSrc == "") {
			wx.showToast({
				title: "发送内容不能空",
				icon: "none",
				duration: 2000
			});
			return;
		}
		wx.showLoading({
			title: "发送中..."
		});
		if (this.data.imageSrc == "") {
			this.addNote();
		} else {
			this.addNoteWithPic();
		}
	},

	/**
	 * 发送心情图片，先发送图片到oss，再发送心情
	 */
	addNoteWithPic() {
		const ossService = new OssService();
		const path = this.data.imageSrc[0];
		ossService
			.uploadFile(path)
			.then(ossPath => {
				this.addNote(ossPath);
			})
			.catch(err => {
				console.log(err);
				wx.hideLoading();
				wx.showToast({
					title: "文件上传失败",
					icon: "warn",
					duration: 2000
				});
			});
	},

	/**
	 * 发送心情
	 */
	addNote(picUrl = "") {
		habitService
			.addRecord(
				this.data.checkId,
				this.data.habitId,
				this.data.content,
				picUrl
			)
			.then(data => {
				wx.hideLoading();
				wx.showToast({
					title: "发送成功,能量+1g",
					icon: "none",
					duration: 2000
				});
				let pages = getCurrentPages();
				let prevPage = pages[pages.length - 2]; //上一个页面
				let info = prevPage.data; //取上页data里的数据也可以修改
				prevPage.setData({
					isRecord: true
				}); //设置数据
				setTimeout(function() {
					wx.navigateBack();
				}, 2000);
			})
			.catch(err => {
				wx.hideLoading();
				wx.showToast({
					title: err.info || "添加失败",
					icon: "warn",
					duration: 2000
				});
			});
	}
});
