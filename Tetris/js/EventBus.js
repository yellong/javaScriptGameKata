var EventBus = {
	_events:{},
	on: function(event,callback){
		(EventBus._events[event]||(EventBus._events[event]=[])).push(callback);
	},
	emit: function(event,data){
		var callbacks = EventBus._events[event];
		if(callbacks){
			callbacks.forEach(function(callback){
				callback(data);
			})
		}
	},
	listen: function(){
		var map = {
		    38: 'Up', // Up
		    39: 'Right', // Right
		    40: 'Down', // Down
		    37: 'Left', // Left
		    75: 'Up', // vim keybindings
		    76: 'Right',
		    74: 'Down',
		    72: 'Left',
		    87: 'Up', // W
		    68: 'Right', // D
		    83: 'Down', // S
		    65: 'Left',  // A
		    32: 'Space' //space

		  };

		  document.addEventListener("keydown", function (event) {
		    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
		                    event.shiftKey;
		    var mapped    = map[event.which];

		    if (!modifiers && mapped !== undefined) {
		        event.preventDefault();
		        if(mapped==='Space'){
		        	EventBus.emit('pause',mapped);
		        }else{
		        	EventBus.emit('move', mapped);	
		        }
		    }
		  });

		  document.getElementById('restart').addEventListener('click',function(event){
		  	EventBus.emit('restart');
		  })

	}
}