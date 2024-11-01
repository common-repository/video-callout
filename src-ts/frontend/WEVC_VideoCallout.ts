// this is just a wrapper to contain the data
// and hook to the correct renderer compoennt

// import WEVC_AdminPreview from "./WEVC_AdminPreview";
// import WEVC_TypePreview from "./WEVC_TypePreview";
// import WEVC_TypeVimeo from "./WEVC_TypeVimeo";
// import WEVC_TypeYouTube from "./WEVC_TypeYouTube";

// type wp  = {
// 	il8n: any;
// }

// declare const { __, _x, _n, _nx } = wp.i18n;

// any universal functions can live here
interface wevcShadow {
	"show": boolean;
	"hoffset": number;
	"voffset": number;
	"blur": number;
	"color": string;
}
interface wevcPayload {
	id: string;
	key: string;
	type: string;
	autoplay: boolean;
	mute: boolean;
	frequency: number;
	frequency_range: number;
	frequency_period: number;
	delay: number;
	site_url: string;
	plugin_url: string;
	promo: string;
	modal_click_close: boolean;
	extra_classes: string;
	controls: boolean; //todo unsuported
	autohide: boolean; //todo unsported
	starttime: string;
	styles: {
		"window": {
			"position": string;
			"modal": boolean;
			"showblur": boolean;
			"blur": number;
			"background": string;
			"class": string;
			"z-index": number;
		};
		"frame": {
			"width": number;
			"height": number;
			"margin": number;
			"padding": number;
			"shadow": wevcShadow,
			"background": string;
		},
		"closer": {
			"show": boolean;
			"size": number;
			"background": string;
			"color": string;
			"content": string;
			"shadow": wevcShadow,
		}
	}
}

class WEVC_VideoCallout {
	static instance: WEVC_VideoCallout;
	public static GetAdminPreview(payload: wevcPayload) {
		if (payload) {
			new WEVC_VideoCallout(payload, true);
		} else {
			console.warn('no data');
		}
	}
	data?: wevcPayload;
	constructor(incomming: wevcPayload, preview?: boolean) {
		// actually - we can init right away!
		if(!preview) {
			preview = false;
		}

		if (WEVC_VideoCallout.instance !== undefined) {
			// could be multiple - but in the current context its one
			// static instance could be an array for instance...
			// console.warn('video-callout can only be created once');
			WEVC_VideoCallout.instance.data = incomming;
			WEVC_VideoCallout.instance.trigger(preview);
		} else {
			this.data = incomming;
			if (this.data.frequency_period && this.data.frequency_range) {
				let frequency = this.data.frequency_range;
				if (this.data.frequency_period > 1) {
					frequency *=60;//mins
				}
				if (this.data.frequency_period > 2) {
					frequency *=60; //hours
				}
				if (this.data.frequency_period > 3) {
					frequency *=24; //days
				}
				this.data.frequency = frequency;
			}
			WEVC_VideoCallout.instance = this;
			this.trigger(preview);
		}
	}
	trigger(preview:boolean) {
		if(preview) {
			this.begin();
		} else {
			if (this.canplay()) {
				if (this.data.delay > 0) {
					window.setTimeout(function () { WEVC_VideoCallout.instance.begin(); }, this.data.delay);
				} else {
					this.begin();
				}
			}
		}
	}
	playerobj: any;
	begin() {
		if (this.data) {
			switch (this.data.type) {
				case "youtube":
					this.playerobj = new WEVC_TypeYouTube(this);
					break;
				case "googleDrive":
						this.playerobj = new WEVC_TypeGoogleDrive(this);
						break;
				case "vimeo":
					this.playerobj = new WEVC_TypeVimeo(this);
					break;
				case "preview":
					this.playerobj = new WEVC_TypePreview(this);
					break;
				default:
					console.warn('unsupported type <' + this.data.type + '>');
			}
		}
	}
	play() {
		let el = document.getElementById(this.id_content);
		// free version - show credit!
		// todo - move this text to the data service - pre-translated
		el.innerHTML = this.data.promo;
		let self = this;
		window.setTimeout(function(){
				el.innerHTML = '';
				if(self.playerobj) {
					self.playerobj.play();
				} else {
					console.warn('no player...');
				}
		},3000);
	}
	player?: HTMLDivElement;
	getPlayer() {
		let el = document.querySelectorAll('.wevideopopup')[0];
		if (el && el.nodeName === 'DIV') {
			this.player = <HTMLDivElement>el;
		}
		return this.player !== null;
	}
	id_content?: string;
	/**
	 * creates the player "frame" and window
	 * controls within which the "player-type" will inject
	 * its content, returns an ID to target the inner part
	 * of the frame (it's content)
	 * @param string
	 * @reurn string
	 */
	getFrame() {
		if (this.data) {
			let id = 'wevp-' + this.data.key;
			this.id_content = 'wevp-content-' + this.data.key;
			let win = document.createElement('div');
			let cstyle = this.data.styles.closer;
			// could create elements - but saves space
			win.innerHTML = '<div class="wevideoplayer"><div id="' + this.id_content + '"></div></div>';
			win.setAttribute('id', id);
			let wstyle = this.data.styles.window;
			let fstyle = this.data.styles.frame;
			// there is no way to close this window - so make it such that
			// any interaction outside the widnow closes it!

			if (
				this.data.styles.window.modal ||
				(!this.data.styles.window.modal && cstyle.show === false) ||
				(this.data.styles.closer.size < 1) ||
				(!this.data.styles.closer.show)
			) {
				let winouter = document.createElement('div');
				winouter.appendChild(win);
				winouter.setAttribute('class', 'wevideopopup ' + this.data.type + ' ' + wstyle.class);
				winouter.setAttribute('style', 'width: 100%; height:100%; top:0; left:0; position: fixed');
				if (!this.data.styles.window.modal) {
					// this is just present to allow the player to be closed!
					this.data.styles.window.background = 'rgba(0,0,0,0)';
				}
				winouter.style.background = this.data.styles.window.background;
				this.player = winouter;
				win.style.position = 'absolute';
				// if closer is present then assume it must be used!
				// QOL... always allow clicking out to close...
				//if ((!cstyle.show) || (this.data.styles.closer.size < 1) || (!this.data.styles.closer.show)) {
					winouter.onclick = function (e) {
						e.preventDefault();
						WEVC_VideoCallout.instance.stop();
						WEVC_VideoCallout.instance.hide();
						return false;
					};
				//}
				win.onclick = function (e) {
					// prevent frame triggering the outer window
					e.stopPropagation();
				}
				// blur modal
				if (this.data.styles.window.showblur){
					const blur = String(this.data.styles.window.blur);
					winouter.style.setProperty("backdrop-filter", "blur("+blur+"px)");
					winouter.style.setProperty("-webkit-backdrop-filter", "blur("+blur+"px)");
				}
			} else {
				win.setAttribute('class', 'wevideopopup ' + this.data.type + ' ' + wstyle.class);
				this.player = win;
			}
			this.player.style.zIndex = String(this.data.styles.window['z-index'] > 0 ? this.data.styles.window['z-index'] : '100000');
			//let win = <HTMLDivElement> this.player.firstChild;
			// first style can be in longhand...
			win.style.height = fstyle.height + 'px'; //(fstyle.height + (fstyle.padding * 2)) + 'px';
			win.style.width = fstyle.width + 'px'; //(fstyle.width + (fstyle.padding * 2)) + 'px';
			win.style.padding = fstyle.padding + "px";
			win.style.margin = fstyle.margin + "px";
			win.style.background = fstyle.background;
			if (this.data.styles.frame.shadow.show) {
				win.style.boxShadow = this.makeBoxShadow(fstyle.shadow);
			}
			if (cstyle.show) {
				let closer = document.createElement('a');
				closer.className = 'wevpcloser';
				closer.innerHTML = cstyle.content;
				closer.style.fontSize = cstyle.size + "px";
				closer.style.fontWeight = '400';
				closer.style.background = cstyle.background;
				closer.style.color = cstyle.color;
				closer.style.height = closer.style.width = cstyle.size + "px";
				closer.href = '#';
				// closer.style.margin = fstyle.padding + 'px';
				if (cstyle.shadow.show) {
					closer.style.boxShadow = this.makeBoxShadow(cstyle.shadow);
				}
				closer.onclick = function (e) {
					e.preventDefault();
					WEVC_VideoCallout.instance.stop();
					WEVC_VideoCallout.instance.hide();
					return false;
				};
				win.appendChild(closer);
			}
			this.setPosition(win);
			this.setPlayer(this.player);
			return this.id_content;
		}
		return '';
	}
	setPosition(win: HTMLDivElement) {
		if (this.data) {
			let pos = this.data.styles.window.position.split('-');
			switch (pos[0]) {
				case "top":
					win.style.top = "0";
					break;
				case "middle":
				case "centre":
					win.style.top = "50%";
					win.style.transform = 'translateY(-50%)';
					break;
				default:
					win.style.bottom = "0";
			}
			switch (pos[1]) {
				case "left":
					win.style.left = "0";
					break;
				case "middle":
				case "centre":
					win.style.right = "50%";
					win.style.transform =
						win.style.transform !== '' ? 'translateY(-50%) translateX(50%)' : 'translateX(50%)';
					break;
				default:
					win.style.right = "0";
			}
		}
	}
	makeBoxShadow(shadow: wevcShadow) {
		let str = shadow.hoffset + "px " + shadow.voffset + "px " + shadow.blur + "px " + shadow.color;
		return str;
	}
	stop() {
		if (this.player) {
			this.player.remove();
		}
		/*
		if (WEVC_TypeYouTube.instance !== undefined) {
			WEVC_TypeYouTube.instance.stop();
		}*/
	}
	reset() {
		while (this.getPlayer()) {
			if (this.player && this.player.parentNode) {
				this.player.parentNode.removeChild(this.player);
			}
			return;
		}
	}
	setPlayer(el: HTMLDivElement) {
		// auto clear!
		this.reset();
		this.player = el;
		document.body.appendChild(this.player);
	}
	loadScript(src: string) {

		let firstScriptTag = document.getElementsByTagName('script')[0];
		let the_script = document.createElement('script');
		the_script.setAttribute('src', src);
		if (firstScriptTag && firstScriptTag.parentNode) {
			firstScriptTag.parentNode.insertBefore(the_script, firstScriptTag);
		}
		// create called by host page on api availability
	}
	appendScript(src: string) {
		let the_script = document.createElement('script');
		let child = document.createTextNode(src);
		the_script.appendChild(child);
		document.body.appendChild(the_script);
	}
	show() {
		// this function is polled by the "type" renderer when its ready to be displayed
		if (this.player) {
			this.player.style.display = 'block';
			window.setTimeout(function () {
				document.querySelectorAll('.wevideopopup')[0].classList.add("show");
			}, 50)
		}
	}
	hide() {
		if (this.player) {
			this.player.style.display = 'none';
		}
	}
	played() {
		// query from document - can only be one popup available
		// if (typeof (this.played[id]) != 'undefined') {
		// 	return;
		// }
		if (this.data && this.data.key) {
			let now = new Date().getTime();
			// todo - calculate frequeny from frequency_period and frequency_range
			let freq = this.data.frequency;
			let expiry_ts = now + (freq * 1000);
			let expiry_date = new Date(expiry_ts);
			let utc = expiry_date.toUTCString();
			let cook = 'wevp_exp_' + this.data.key + "=" + now + "; expires=" + utc;
			document.cookie = cook;
		}
	}
	timeout?:number
	canplay() {
		//let expiry_date = new Date();
		let viewed = this.getViewed();
		if (viewed) {
			let now = new Date().getTime();
			let ms = (this.data.frequency*1000);
			let canplay = now - viewed > ms;
			if (!canplay) {
				// #12918 - doing this makes frequencty a delay... confusing!
				// let next = (now - viewed);
				// next = ms - next;
				// // If longer than a 32bit int, don't bother waiting!!!
				// if (next < 2147483647){
				// 	if (this.timeout) {
				// 		clearTimeout(this.timeout);
				// 	}
				// 	this.timeout = window.setTimeout("WEVC_VideoCallout.instance.begin()", next);
				// }
				return false;
			}
			return true;
			// if we cant play now - you can schedule the next play
			// in the event that the browser remains open...
		}
		return true;
	}
	getViewed() {
		if (this.data && this.data.key) {
			var match = document.cookie.match(new RegExp('(^| )wevp_exp_' + this.data.key + '=([^;]+)'));
			if (match) {
				let dt = + parseInt(match[2]) + this.data.frequency;
				return dt;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
}
