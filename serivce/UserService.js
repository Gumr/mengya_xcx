import BaseService from "./BaseService";
import { post, get } from "../utils/http";

export default class UserService extends BaseService {
	/**
	 * 用户反馈
	 * @param {string} content
	 * @param {string} email
	 */
	sendFeedback(content, email) {
		return get(
			"/HabitFeedBack/addFeedBack",
			{
				content,
				email,
				user_id: this.getUserId()
			},
			{
				loadingMsg: "发送反馈中"
			}
		).then(this.handleRespond);
	}

	/**
	 * 开通会员
	 * @returns {Promise<ResponseVo>}
	 */
	openVip() {
		return get(
			"/HabitTrade/vipPay",
			{
				user_id: this.getUserId()
			},
			{
				loadingMsg: "请求支付中"
			}
		).then(this.handleRespond);
	}

	/**
	 * 免费开通会员
	 * @returns {Promise<ResponseVo>}
	 */
	freeOpenVip() {
		return get(
			"/HabitTrade/freePay",
			{
				user_id: this.getUserId()
			},
			{
				loadingMsg: "请求支付中"
			}
		).then(this.handleRespond);
	}

	/**
	 * 支付成功回调
	 * @param out_trade_no
	 * @returns {Promise<ResponseVo>}
	 */
	paySuccess(out_trade_no) {
		return get(
			"/HabitTrade/wxPaySuccess",
			{
				out_trade_no,
				user_id: this.getUserId()
			},
			{
				loadingMsg: "请求支付中"
			}
		).then(this.handleRespond);
	}

	/**
	 * 修改用户信息
	 * @param nickname
	 * @param private_pwd
	 * @param email
	 * @param signature
	 * @returns {Promise<ResponseVo>}
	 */
	updateUserInfo(
		nickname = null,
		private_pwd = null,
		email = null,
		signature = null
	) {
		return get(
			"/HabitUser/updateUser",
			{
				nickname,
				private_pwd,
				email,
				signature,
				user_id: this.getUserId()
			},
			{
				noNeedPsw: true
			}
		)
			.then(this.handleRespond)
			.then(data => {
				this.app.updateUserInfo(data); //同步本地
				return data;
			});
	}

	/**
	 * 修改用户头像
	 * @param nickname
	 * @param private_pwd
	 * @param email
	 * @param signature
	 * @returns {Promise<ResponseVo>}
	 */
	updateUserAvatar(avatar_small) {
		return get(
			"/HabitUser/updateAvatar",
			{
				avatar_small,
				user_id: this.getUserId()
			},
			{
				noNeedPsw: true
			}
		)
			.then(this.handleRespond)
			.then(data => {
				this.app.updateUserInfo(data); //同步本地
				return data;
			});
	}

	/**
	 * 获取用户信息
	 */
	getUserInfoFromRemote() {
		return get("/HabitUser/getUserInfo", {
			user_id: this.getUserId()
		})
			.then(this.handleRespond)
			.then(data => {
				this.app.updateUserInfo(data); //同步本地
				return data;
			});
	}

	/**
	 * 获取其他用户信息
	 */
	getOtherUserInfo(targetUserId) {
		return get("/HabitUser/getOtherUserData", {
			user_id: this.getUserId(),
			target_user_id: targetUserId
		}).then(this.handleRespond);
	}

	/**
	 * 搜索用户
	 */
	searchUserByName(name) {
		return get("/HabitUser/searchUserByName", {
			user_id: this.getUserId(),
			name
		}).then(this.handleRespond);
	}

	/**
	 * 设置隐私密码
	 * @param psw
	 * @param email
	 * @returns {Promise<ResponseVo>}
	 */
	setPravitePsw(psw, email) {
		return this.updateUserInfo(null, psw, email);
	}

	/**
	 * 获取邮箱验证码
	 * @returns {Promise<ResponseVo>}
	 */
	fetchVerifyCode() {
		return get(
			"/HabitUser/sendEmail",
			{
				user_id: this.getUserId()
			},
			{
				noNeedPsw: true,
				loadingMsg: "loading"
			}
		).then(this.handleRespond);
	}

	/**
	 * 校验邮箱验证码
	 * @param code
	 * @returns {Promise<ResponseVo>}
	 */
	verifyCode(code) {
		return get(
			"/HabitUser/sendEmail",
			{
				user_id: this.getUserId()
			},
			{
				noNeedPsw: true
			}
		).then(this.handleRespond);
	}

	/**
	 * 获取圈子的二维码
	 */
	getGroupQRCode(habit_id) {
		return get("/HabitUser/getGroupQRCode", {
			habit_id,
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取圈子超过20人的数量
	 */
	getFreeGroupCount(habit_id) {
		return get("/HabitUser/getGroupToFree", {
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取用户消息
	 */
	getUserMsg(num) {
		return get("/HabitUser/getUserMessage", {
			user_id: this.getUserId(),
			num
		}).then(this.handleRespond);
	}

	/**
	 * 获取用户消息数量
	 */
	syncUnReadMsgCount() {
		return get("/HabitUser/getUnReadMsgCount", {
			user_id: this.getUserId()
		})
			.then(this.handleRespond)
			.then(data => {
				if (parseInt(data) > 0) {
					wx.showTabBarRedDot({
						index: 3
					});
				} else {
					wx.hideTabBarRedDot({
						index: 3
					});
				}
				return data;
			});
	}

	/**
	 * 获取萌芽能量
	 */
	getUserEnergy() {
		return get("/HabitUser/getUserEnergy", {
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}

	/**
	 * 获取萌芽能量
	 */
	giveUserEnergy(userObtain, habitId) {
		return get("/HabitUser/giveUserEnergy", {
			user_give: this.getUserId(),
			user_obtain: userObtain,
			habit_id: habitId
		}).then(this.handleRespond);
	}

	/**
	 * 获取萌芽能量
	 */
	getUserEnergyById(userId) {
		return get("/HabitUser/getUserEnergy", {
			user_id: userId
		}).then(this.handleRespond);
	}

	/**
	 * 获取推荐的小程序
	 */
	getUserRecommendMina() {
		return get("/HabitUser/recommendMina", {
			account_type: -1
		}).then(this.handleRespond);
	}

	/**
	 * 关注用户
	 */
	followUser(followUserId) {
		return get("/HabitUser/followUser", {
			user_id: this.getUserId(),
			followed_user_id: followUserId
		}).then(this.handleRespond);
	}

	/**
	 * 取消关注用户
	 */
	cancelFollow(followUserId) {
		return get("/HabitUser/cancelFollow", {
			user_id: this.getUserId(),
			followed_user_id: followUserId
		}).then(this.handleRespond);
	}

	/**
	 * 获取粉丝用户列表
	 */
	getFollowerList(targetUserId, page) {
		return get("/HabitUser/getFollowerList", {
			user_id: this.getUserId(),
			t_user_id: targetUserId,
			page
		}).then(this.handleRespond);
	}

	/**
	 * 获取粉丝用户列表
	 */
	getAttentionList(targetUserId, page) {
		return get("/HabitUser/getAttentionList", {
			user_id: this.getUserId(),
			t_user_id: targetUserId,
			page
		}).then(this.handleRespond);
	}

	/**
	 * 获取banner
	 */
	getBanners() {
		return get("/HabitBanner/getBanners", {
			user_id: this.getUserId()
		}).then(this.handleRespond);
	}
}
