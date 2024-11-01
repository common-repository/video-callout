/**
 * Plugin Name: Video Callout
 * Plugin URI: https://web-engineer.co.uk/
 * Description: Add pop-up videos to pages & posts via a meta box.
 * Version: 1.0.1
 * Author: Web Engineer
 * Author URI: https://web-engineer.co.uk/
 * License: This work is licensed under a Creative Commons Attribution 4.0 International License.
//  */


// embedded video is in the page as ->
// <div id="wepo_80824617a8962eec7ba55ccf796dfe91" class="wevideopopup youtube POST_CLASS" style="display:block;">
// 	<div style="padding-top:56.25%;">
// 		<div class="wevideoplayer youtube"
// 			id="wepl_80824617a8962eec7ba55ccf796dfe91"
// 			data-video="{&quot;id&quot;:&quot;EngW7tLk6R8&quot;,&quot;type&quot;:&quot;youtube&quot;,&quot;autoplay&quot;:&quot;1&quot;,&quot;mute&quot;:&quot;1&quot;,&quot;frequency&quot;:60,&quot;delay&quot;:0,&quot;site_url&quot;:&quot;http:\/\/localhost&quot;,&quot;must_play&quot;:&quot;1&quot;,&quot;modal&quot;:&quot;1&quot;,&quot;modal_click_close&quot;:true}"
// 		></div>
// 	</div>
// </div>
// <script type="text/javascript">
// 	var weVideoPopupSnippet = function() {
// 		if (typeof(weVideoPopupManager) != 'undefined') {
// 			weVideoPopupManager.init();
// 			return;
// 		}
// 		setTimeout(weVideoPopupSnippet, 200);
// 	};
// 	weVideoPopupSnippet();
// 	function onYouTubeIframeAPIReady() {
// 		weVideoPopupManager.createYouTubePlayers();
// 	}
// </script>



var weVideoPopupManager = {

	yttag: null,
	vmtag: null,
	firstScriptTag: null,
	// move to singleton... only expect one video ever per page/post/view
	// new stuff here
	player: null,  // current player object
	id: null, // id of the video to embed
	// playerObjects: [],
	// players: {
	// 	youtube: [],
	// 	vimeo: []
	// },
	played: {},

	fetchVideoData: function (playerElem) {
		try {
			var video_data = JSON.parse(playerElem.getAttribute('data-video'));
		} catch (e) {
			return false;
		}
		if (typeof (video_data.id) == 'undefined') {
			return false;
		}
		if (typeof (video_data.mute) == 'undefined') {
			video_data.mute = '0';
		}
		if (typeof (video_data.autoplay) == 'undefined') {
			video_data.autoplay = '0';
		}
		if (video_data.autoplay == '1') {
			video_data.mute = '1';
		}
		if (typeof (video_data.controls) == 'undefined') {
			video_data.controls = '1';
		}
		if (typeof (video_data.autohide) == 'undefined') {
			video_data.autohide = '1';
		}
		if (typeof (video_data.site_url) == 'undefined') {
			video_data.site_url = document.location.origin;
		}
		if (typeof (video_data.modal) == 'undefined') {
			video_data.modal = '0';
		}
		video_data.modal = parseInt(video_data.modal);
		return video_data;
	},

	createYouTubePlayers: function () {
		console.info('createYouTubePlayers');
		var players = document.getElementsByClassName('wevideopopup youtube')[0];
		weVideoPopupManager.player = weVideoPopupManager.preparePlayer(players[i]);
		// whats the significance of -1?
		if (!(-1 == weVideoPopupManager.player.videoData.delay)) {
			setTimeout(
				function () { weVideoPopupManager.launchYouTubePlayer()},
				weVideoPopupManager.player.videoData.delay
			);
		}
		// for (var i = 0; i < players.length; i++) {
		// 	var objPlayer = weVideoPopupManager.preparePlayer(players[i]);
		// 	if (-1 == objPlayer.videoData.delay) {
		// 		continue;
		// 	}
		// 	setTimeout(
		// 		function () { weVideoPopupManager.launchYouTubePlayer(objPlayer); },
		// 		objPlayer.videoData.delay
		// 	);
		// }
	},

	launchYouTubePlayer: function () {
		console.info('launchYouTubePlayer');
		this.show(objPlayer);
		this.players.youtube[objPlayer.playerId] = new YT.Player(
			objPlayer.playerId,
			{
				height: '390',
				width: '640',
				videoId: objPlayer.videoData.id,
				playerVars: {
					mute: objPlayer.videoData.mute,
					autoplay: objPlayer.videoData.autoplay,
					controls: objPlayer.videoData.controls,
					autohide: objPlayer.videoData.autohide,
					wmode: 'opaque',
					origin: objPlayer.videoData.site_url
				},
				events: {
					// there is only one possible - so query it!
					'onStateChange': function (e) {
						if (e.data == 1) {
							// console.info("ident", ident);
							weVideoPopupManager.logPlayed();
						}
					}

				}
			}
		);
		if (
			(typeof (objPlayer.videoData.must_play) != 'undefined')
			&& (objPlayer.videoData.must_play == 0)
		) {
			this.logPlayed(objPlayer.playerId);
		}
	},

	createVimeoPlayers: function () {
		if (typeof (Vimeo) == 'undefined') {
			setTimeout(function () { weVideoPopupManager.createVimeoPlayers(); }, 1000);
			return;
		}
		var players = document.getElementsByClassName('wevideopopup vimeo');
		for (var i = 0; i < players.length; i++) {
			var objPlayer = weVideoPopupManager.preparePlayer(players[i]);
			if (-1 == objPlayer.videoData.delay) {
				continue;
			}
			setTimeout(
				function () { weVideoPopupManager.launchVimeoPlayer(objPlayer); },
				objPlayer.videoData.delay
			);
		}
	},

	launchVimeoPlayer: function (objPlayer) {
		this.players.vimeo[objPlayer.playerId] = new Vimeo.Player(document.getElementById(objPlayer.playerId));
		this.players.vimeo[objPlayer.playerId].on(
			'play',
			function () {
				this.logPlayed(objPlayer.playerId);
			}
		);
		if (
			(typeof (objPlayer.videoData.must_play) != 'undefined')
			&& (objPlayer.videoData.must_play == 0)
		) {
			this.logPlayed(objPlayer.playerId);
		}
		this.show(objPlayer);
	},

	show: function (objPlayer) {
		if (objPlayer.popupModal) {
			objPlayer.popupModal.style.display = 'block';
		}
		objPlayer.popupElem.style.display = 'block';
	},

	hide: function (objPlayer) {
		objPlayer.popupElem.style.display = 'none';
		var popupModals = document.getElementsByClassName('wevideopopup_modal');
		for (var i = 0; i < popupModals.length; i++) {
			popupModals[i].style.display = 'none';
		}
	},

	createModal: function (playerObject, closeOnClick) {
		if (playerObject.popupModal !== null) {
			return;
		}
		playerObject.popupModal = document.createElement('div');
		playerObject.popupModal.className = 'wevideopopup_modal';
		if (closeOnClick) {
			playerObject.popupModal.onclick = function () {
				weVideoPopupManager.stopAll();
				weVideoPopupManager.hide(playerObject);
				return;
			}
		}
		playerObject.popupElem.parentNode.insertBefore(
			playerObject.popupModal,
			playerObject.popupElem
		);
	},
	preparePlayer: function (popupElem) {
		var popupId = popupElem.id;
		var playerElem = popupElem.querySelectorAll('.wevideoplayer');
		if (!playerElem.length) {
			popupElem.parentNode.removeChild(popupElem);
			return;
		}
		playerElem = playerElem[0];

		var playerId = playerElem.id;
		var videoData = weVideoPopupManager.fetchVideoData(playerElem);
		if (!videoData) {
			popupElem.parentNode.removeChild(popupElem);
			return;
		}

		var obj = {
			type: (popupElem.className.match(/\bvimeo\b/) ? 'vimeo' : 'youtube'),
			popupModal: null,
			popupElem: popupElem,
			popupId: popupId,
			playerElem: playerElem,
			playerId: playerId,
			videoData: videoData
		};

		if (videoData.modal) {
			this.createModal(obj, videoData.modal_click_close);
		}

		this.playerObjects.push(obj);

		playerCloser = document.createElement('a');
		playerCloser.className = 'wevpcloser';
		playerCloser.innerHTML = '&times;';
		playerCloser.href = '#';
		playerCloser.onclick = function (e) {
			e.preventDefault();
			weVideoPopupManager.stopAll();
			weVideoPopupManager.hide(obj);
			return false;
		};
		obj.playerElem.parentNode.insertBefore(playerCloser, obj.playerElem.nextSibling);

		return obj;
	},

	logPlayed: function () {
		// query from document - can only be one popup available
		var id = $('.wevideoplayer')[0].getAttribute('id');
		// if (typeof (this.played[id]) != 'undefined') {
		// 	return;
		// }
		try {
			var video_data = JSON.parse(document.getElementById(id).getAttribute('data-video'));
		} catch (e) {
			video_data = { frequency: 2592000 };
		}
		var frequency = (typeof (video_data.frequency) != 'undefined')
			? parseInt(video_data.frequency)
			: 2592000;
		var expiry_date = new Date();
		expiry_date.setSeconds(expiry_date.getSeconds() + frequency);
		var cook = id + "=1; expires=" + expiry_date.toUTCString();
		document.cookie = cook
		this.played[id] = true;
		console.info('logPlayed', cook);
	},

	stopAll: function () {
		var youtube_iframes = document.querySelectorAll("iframe.wevideoplayer.youtube");
		for (var i = 0; i < youtube_iframes.length; i++) {
			youtube_iframes[i].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
		}
		for (const [id, player] of Object.entries(this.players.vimeo)) {
			player.pause();
		}
	},

	setPopupStyleProperty: function (name, value, target, popup) {
		if (typeof (popup) == 'undefined') {
			popup = 0;
		}
		if (typeof (this.playerObjects[popup]) == 'undefined') {
			return;
		}
		if (typeof (target) == 'undefined') {
			target = '';
		}
		var elem;
		switch (target) {
			case 'close':
				elem = this.playerObjects[popup].popupElem.getElementsByClassName('wevpcloser')[0];
				break;
			case 'modal':
				elem = this.playerObjects[popup].popupModal;
				break;
			default:
				elem = this.playerObjects[popup].popupElem;
		}
		if (elem) {
			elem.style[name] = value;
		}
	},

	setCustomClasses: function (classes, popup) {
		if (typeof (popup) == 'undefined') {
			popup = 0;
		}
		if (typeof (this.playerObjects[popup]) == 'undefined') {
			return;
		}
		var old_classes = this.playerObjects[popup].popupElem.className.split(' ');
		var new_classes = ('' != classes) ? classes.split(' ') : [];
		for (var i = 0; i < old_classes.length; i++) {
			switch (old_classes[i]) {
				case 'wevideopopup':
				case 'youtube':
				case 'vimeo':
					new_classes.push(old_classes[i]);
					break;
			}
		}
		this.playerObjects[popup].popupElem.className = new_classes.join(' ');
	},

	init: function () {
		// CSP Policy may block these scripts
		this.firstScriptTag = document.getElementsByTagName('script')[0];
		if (document.getElementsByClassName('wevideopopup youtube').length) {
			console.info('append youtube');
			this.yttag = document.createElement('script');
			this.yttag.src = "https://www.youtube.com/iframe_api";
			this.firstScriptTag.parentNode.insertBefore(this.yttag, this.firstScriptTag);
			// create called by host page on api availability
		}
		if (document.getElementsByClassName('wevideopopup vimeo').length) {
			this.vmtag = document.createElement('script');
			this.vmtag.src = "https://player.vimeo.com/api/player.js";
			this.firstScriptTag.parentNode.insertBefore(this.vmtag, this.firstScriptTag);
			weVideoPopupManager.createVimeoPlayers();
		}
	}
}
