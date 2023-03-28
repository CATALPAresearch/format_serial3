export const groupBy = (data, key) => {
	var arr = [];
	for (var val in data) {
		arr[data[val][key]] = arr[data[val][key]] || [];
		arr[data[val][key]].push(data[val]);
	}

	if (arr.length > 1) {
		return arr.filter(function (el) {
			return el !== null;
		});
	}
	else {
		return arr;
	}
};
