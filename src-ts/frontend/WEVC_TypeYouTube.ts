// import WEVC_VideoCallout from "./WEVC_VideoCallout";
class WEVC_TypeYouTube {
	static instance: WEVC_TypeYouTube;
	callOut: WEVC_VideoCallout;
	id: string;
	constructor(callOut: WEVC_VideoCallout) {
		// we only need one instance - this could be a stack
		// i.e. an array of instances and we could fish through
		// the stack on callback
		this.callOut = callOut;
		if (!WEVC_TypeYouTube.instance) {
			WEVC_TypeYouTube.instance = this;
		}
		// console.info('youtube', this.callOut.data);
		// <div id="{$popup_id}" class="wevideopopup youtube{$extra_classes}"{$outer_style}>
		// 	<div{$inner_style}>
		// 		<div class="wevideoplayer youtube"
		// 			id="{$player_id}"
		// 			data-video="{$video_data}"
		// 		></div>
		// 	</div>
		// </div>

		this.id = this.callOut.getFrame();
		if (this.callOut.data) {
			if (this.callOut.data.delay) {
				this.callOut.hide();
			}
			if (WEVC_TypeYouTube.instance === this){
				this.callOut.appendScript(
					`function onYouTubeIframeAPIReady() {
					WEVC_TypeYouTube.instance.init();
					}`);
				this.callOut.loadScript("https://www.youtube.com/iframe_api");
			} else {
				WEVC_TypeYouTube.instance.launch();
			}
			//innserstyle was the padding to set aspect - we can detect that instead
		}
	}
	init() {
		if (this.callOut.data) {
			if (!(-1 == this.callOut.data.delay)) {
				setTimeout(
					function () {
						WEVC_TypeYouTube.instance.launch()
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
			this.callOut.play();
		}
	}
	play() {
		let YT = (window as any).YT;
		if(this.player) {
			delete this.player;
		}
		let vars = {
			mute: this.callOut.data.mute ? 1 : 0,
			autoplay: this.callOut.data.autoplay,
			controls: this.callOut.data.controls,
			autohide: this.callOut.data.autohide,
			wmode: 'opaque',
			start: this.callOut.data.starttime,
			origin: this.callOut.data.site_url
		};
		this.player = new YT.Player(
			this.id,
			{
				height: '390',
				width: '640',
				videoId: this.callOut.data.id,
				playerVars: vars,
				events: {
					'onReady': this.onPlayerReady.bind(this)
				  }
			}
			
		);
		this.callOut.played();
	}
	onPlayerReady() {
		if(this.callOut.data.mute){
			this.player.mute();
		} else {
			this.player.unMute();
		}
	}
}