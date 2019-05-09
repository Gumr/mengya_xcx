/**
 * Created by ujun on 2017/10/30.
 */
export function throttle(fn, time = 500, context) {
	let timer = null;
	return function(...arg) {
		try {
			if (timer) {
				return false;
			} else {
				timer = setTimeout(() => {
					timer = null;
				}, time);
				fn.apply(context || this, arg);
			}
		} catch (e) {
			console.log(e);
		}
	};
}
