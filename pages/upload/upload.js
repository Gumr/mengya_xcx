import WeCropper from "../../utils/we-cropper.js";
import OssService from "../../serivce/OssService";
import UserService from "../../serivce/UserService";
const userService = new UserService();

const device = wx.getSystemInfoSync();
const width = device.windowWidth;
const height = device.windowHeight - 50;

Page({
	data: {
		cropperOpt: {
			id: "cropper",
			width,
			height,
			scale: 2.5,
			zoom: 8,
			withRadio: false,
			cut: {
				x: (width - 300) / 2,
				y: (height - 300) / 2,
				width: 300,
				height: 300
			}
		}
	},
	touchStart(e) {
		this.wecropper.touchStart(e);
	},
	touchMove(e) {
		this.wecropper.touchMove(e);
	},
	touchEnd(e) {
		this.wecropper.touchEnd(e);
	},
	getCropperImage() {
		this.wecropper.getCropperImage(avatar => {
			if (avatar) {
				//  获取到裁剪后的图片
				wx.showLoading({
					title: "上传中..."
				});
				const ossService = new OssService();
				ossService
					.uploadFile(avatar)
					.then(ossPath => {
						userService
							.updateUserAvatar(ossPath)
							.then(userInfo => {
								wx.hideLoading();
								console.log(ossPath);
								wx.showToast({
									title: "头像更新成功",
									icon: "none",
									duration: 2000
								});
								setTimeout(() => {
									wx.navigateBack({
										delta: 1
									});
								}, 1500);
							})
							.catch(err => {
								console.log(err);
								wx.showToast({
									title: "文件上传失败",
									icon: "warn",
									duration: 2000
								});
							});
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
			} else {
				wx.showToast({
					title: "文件上传失败",
					icon: "warn",
					duration: 2000
				});
			}
		});
	},
	uploadTap() {
		const self = this;
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
			success(res) {
				const src = res.tempFilePaths[0];
				//  获取裁剪图片资源后，给data添加src属性及其值

				self.wecropper.pushOrign(src);
			}
		});
	},
	onLoad(option) {
		const { cropperOpt } = this.data;
		console.log(option);
		if (option.src) {
			cropperOpt.src = option.src;
			new WeCropper(cropperOpt)
				.on("ready", ctx => {
					console.log(`wecropper is ready for work!`);
				})
				.on("beforeImageLoad", ctx => {
					console.log(`before picture loaded, i can do something`);
					console.log(`current canvas context:`, ctx);
					wx.showToast({
						title: "上传中",
						icon: "loading",
						duration: 20000
					});
				})
				.on("imageLoad", ctx => {
					console.log(`picture loaded`);
					console.log(`current canvas context:`, ctx);
					wx.hideToast();
				})
				.on("beforeDraw", (ctx, instance) => {
					console.log(`before canvas draw,i can do something`);
					console.log(`current canvas context:`, ctx);
				})
				.updateCanvas();
		}
	}
});
