var loadAsset = function(assets,callback){
		var result = {};
		var count = assets.length;
		for(var i=0;i<assets.length;i++){
			assets[i].load(function(name,asset){
				result[name]=asset;
				if( --count === 0)callback(result);
			});
		}
	}

var imageAsset = function(name,url){
		var image = new Image();
		return {
			load:function(callback){
				image.onload = function(){
					callback(name,image);
				};
				image.src = url;
			}
		}
}

var sounds = [
		'fx_rope_swinging_swish_2',
		'fx_punch26',
		'fx_app_game_interactive_alert_tone_016',
		'fx_cartoonish_whip_crack'
	];

sounds.forEach(function(sound){
	var audio = document.getElementById(sound);
	sounds[sound] = audio;
});

var images = {};

loadAsset([
			imageAsset('buildings','image/buildings.jpg'),
			imageAsset('clouds','image/clouds.jpg'),
			imageAsset('floor','image/floor.jpg'),
			imageAsset('sprites','image/sprites.gif'),
			imageAsset('birds','image/birds.gif')
			],
function(assets){
	images = assets;
});