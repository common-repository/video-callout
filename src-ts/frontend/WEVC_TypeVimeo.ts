// import WEVC_VideoCallout from "./WEVC_VideoCallout";
class WEVC_TypeVimeo {
	static instance: WEVC_TypeVimeo;
	callOut: WEVC_VideoCallout;
	id: string;
	constructor(callOut: WEVC_VideoCallout) {
		this.callOut = callOut;
		WEVC_TypeVimeo.instance = this;
		// <div id="{$popup_id}" class="wevideopopup youtube{$extra_classes}"{$outer_style}>
		// 	<div{$inner_style}>
		// 		<div class="wevideoplayer youtube"
		// 			id="{$player_id}"
		// 			data-video="{$video_data}"
		// 		></div>
		// 	</div>
		// </div>
		this.id = this.callOut.getFrame();

		if (this.callOut.data && this.callOut.data.delay) {
			this.callOut.hide();
		}
		if (this.callOut.data && this.callOut.data.delay) {
			this.callOut.hide();
		}
		// this.callOut.appendScript(
		// 	`function onYouTubeIframeAPIReady() {
		// 		WEVC_TypeVimeo.instance.init();
		// 	}`);
		this.callOut.loadScript("https://player.vimeo.com/api/player.js");
		//innserstyle was the padding to set aspect - we can detect that instead
		// document.addEventListener('DOMContentLoaded', function() {

		WEVC_TypeVimeo.instance.check();
		// });
	}
	check() {
		if (typeof ((window as any).Vimeo) === 'undefined') {
			setTimeout(function () {
				WEVC_TypeVimeo.instance.check();
			}, 100);
		} else {
			this.init();
		}
	}
	init() {
		if (this.callOut.data) {


			if (!(-1 == this.callOut.data.delay)) {
				setTimeout(
					function () {
						WEVC_TypeVimeo.instance.launch()
					},
					this.callOut.data.delay
				);
			}
		}
	}
	player: any;
	launch() {
		if (this.callOut.data) {
			this.callOut.show();
			// set vimeo props
			// calloutPlayer is the DIV - this.id is its *id*
			// <iframe src="https://player.vimeo.com/video/{video_id}?h={hash_parameter}" width="{video_width}" height="{video_height}" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
			this.callOut.play();
		}
	}
	play() {
		var opts = {
			id: this.callOut.data.id,
			height: this.callOut.data.styles.frame.height,
			width: this.callOut.data.styles.frame.width,
			autoplay: this.callOut.data.autoplay,
			muted: this.callOut.data.mute
		};
		//this.callOut.player.setAttribute('data-vimeo-id', this.callOut.data.id);
		this.player = new (window as any).Vimeo.Player(this.callOut.id_content, opts);
		this.player.setCurrentTime(this.callOut.data.starttime);
		// let div = document.createElement('div');
		// div.setAttribute('data-vimeo-id', this.callOut.data.id);
		// this.callOut.player.appendChild(div);
		// this.player = new (window as any).Vimeo.Player(div);

		//if (this.callOut.data.must_play === false) {
		this.callOut.played();
		//}

	}
}