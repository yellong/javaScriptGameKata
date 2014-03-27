(function(root){

root.Event = {
	on: function(event,callback){
		this.__event = this.__event || {};
		this.__event[event] = this._event[event] || [];
		this.__event[event].push(callback);
	},
	off: function(event,callback){
		if(!event)return this.__event={};
		if(event && !callback)return this.__event[event] && this.__event[event]=[];
		if(event && callback){
			var callbacks = this.__event[event],retain = [];
			if(!callbacks)return;
			callbacks.forEach(function(func){
				if(func!==callback)retain.push(func);
			});
			this.__event[event]=retain;
		}
	},
	trigger: function(event){
		if(!this.__event)return;
		var self = this;
		var args = Array.prototype.slice.call(arguments,1);
		var callbacks = this.__event[event];
		if(callbacks && callbacks.length>0){
			callbacks.forEach(function(callback){
				callback.apply(self.args);
			})
		}
	}
}

root.extend = function(obj){
	Array.prototype.slice.call(arguments,1).forEach(function(source){
		for(var pro in source){
			obj[pro] = source[pro]
		}
	})
	return obj;
}


})(this)
