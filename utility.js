var map = function(arr,func) {
	var newArray = [];
	for (var i=0; i<arr.length;i++) {
		newArray.push(func(arr[i]));
	}
	return newArray;
};

var objectKeys = function(item){
	keyArray = [];
	for (var key in item) {
		keyArray.push(key);
	}
	return keyArray;
}

// From Douglas Crockford - Remedial Javascript
// http://javascript.crockford.com/remedial.html
if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

var filter = function(arr,func){
	var output = [];
	for (var i=0; i<arr.length;i++) {
		var result = func(arr[i]);
		result ? output.push(arr[i]) : false;
	}
	return output;
}

var reduce = function(arr,start,func) {
	var startValue = start;
	for (var i=0;i<arr.length;i++) {
		startValue = func(startValue,arr[i]);
	}
	return startValue;
}