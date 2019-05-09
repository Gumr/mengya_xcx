import BaseService from "./BaseService";
import { post, get } from "../utils/http";

export default class LoginService extends BaseService {
	/**
	 * 使用openId登陆
	 * @param {string} openid
	 */
	loginWithOpenId(openid) {
		return get("/HabitUser/loginWithOpenId", {
			openid
		}).then(this.handleRespond);
	}

	/**
	 * 获取openid
	 * @param {number} code
	 */
	getOpenId(code) {
		return get("/HabitUser/getWeChatSession", {
			code
		});
	}

	/**
	 * 登陆
	 * @param {*} openid
	 * @param {*} nickname
	 * @param {*} gender
	 * @param {*} avatar_small
	 * @param {*} province
	 * @param {*} city
	 * @param {*} country
	 * @param {*} account_type
	 */
	loginWithWeChat(
		openid,
		nickname,
		gender,
		avatar_small,
		province,
		city,
		country,
		account_type = 1
	) {
		return get("/HabitUser/loginWithWeChat", {
			openid,
			nickname,
			gender, //性别 0：未知、1：男、2：女
			avatar_small,
			province,
			city,
			country,
			account_type
		}).then(this.handleRespond);
	}
}
