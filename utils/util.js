function formatToday(date) {
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return [month, day].map(formatNumber).join("/");
}

function formatYesterday(date) {
	date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return [month, day].map(formatNumber).join("/");
}

function formatTime(date) {
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();

	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();

	return (
		[year, month, day].map(formatNumber).join("/") +
		" " +
		[hour, minute, second].map(formatNumber).join(":")
	);
}

function formatNumber(n) {
	n = n.toString();
	return n[1] ? n : "0" + n;
}

module.exports = {
	formatTime: formatTime,
	formatToday: formatToday,
	formatYesterday: formatYesterday
};
