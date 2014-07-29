
var MEMORY_CACHE = {
	origin: [],
	middle: []
};

exports.storage = function(data, callback){
	MEMORY_CACHE['origin'] = data;
	console.log('[CacheManager]: storage data', data);
	callback(null, data);
};

exports.save = function(name, data, callback){
	var d = {};
	d[ name ] = data;
	MEMORY_CACHE['middle'].push(d);
	console.log('[CacheManager]: save data from: %s', name);
	callback(null, data);
};

exports.load = function(callback, source){
	callback(null, MEMORY_CACHE[ source ]);
};