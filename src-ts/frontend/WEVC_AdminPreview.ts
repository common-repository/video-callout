// import WEVC_VideoCallout from "./WEVC_VideoCallout";
// import { wevcPayload } from "./WEVC_VideoCallout";

class WEVC_AdminPreview {
	// previews for admin
	// window corner
	// closer
	static instance: WEVC_AdminPreview;
	selected: number = 0;
	active: number = -1;
	tabs: Array<HTMLHeadingElement>;
	static make() {
		let elements = Array.from(document.querySelectorAll('[data-wevc-preview]'));
		//let self = WEVC_AdminPreview.instance;
		let self = new WEVC_AdminPreview('wevideopopup_');
		for (let i = 0; i < elements.length; i++) {
			//new WEVC_AdminPreview(<HTMLParagraphElement> elements[i]);
			self.bindTo(<HTMLParagraphElement>elements[i]);
		};
		// make acordion
		// we-vc-admin
		self.tabs = Array.from(document.querySelectorAll('.we-vc-admin h2'));
		for (var i = 0; i < self.tabs.length; i++) {
			//new WEVC_AdminPreview(<HTMLParagraphElement> elements[i]);
			self.bindTab(<HTMLHeadingElement>self.tabs[i], i);
		};
		let frequency_period = document.getElementById('wevideopopup_frequency_period');
		// WEVC_AdminPreview.instance.syncTabs();
		frequency_period.addEventListener('change', self.frequencyChange.bind(self));
		self.frequencyChange();
	}
	static makeMeta() {
		let self = new WEVC_AdminPreview('wevideopopup_');

		let watchInput = <HTMLInputElement>document.getElementById(self.prefix + 'video_id');
		let vpMore = document.getElementById('we-vp-more');
		let vpClear = document.getElementById('we-vp-clear');
		watchInput.addEventListener('input', function (evt) {
			if(this.value !== ''){
				vpMore.style.display = "block";
				vpMore.style.display = "block";
				vpClear.style.display = "block";
			}else{
				vpMore.style.display = "none";
				vpClear.style.display = "none";
			}
		});
		let doInput = function (){
			const event = new Event('input');
			watchInput.dispatchEvent(event);
		}

		vpClear.addEventListener('click', function (evt) {
			watchInput.value = '';
			doInput();
		});
		doInput();
// 	window.addEventListener('DOMContentLoaded', (event) => {
 		WEVC_InputDefaultReset.make();
		 let frequency_period = document.getElementById('wevideopopup_frequency_period');
		 // WEVC_AdminPreview.instance.syncTabs();
		 frequency_period.addEventListener('change', self.frequencyChange.bind(self));
		 self.frequencyChange();

// 	});
	}
	frequencyChange() {
		let frequency_period = <HTMLSelectElement>document.getElementById('wevideopopup_frequency_period');
		let frequency_range = <HTMLInputElement>document.getElementById('wevideopopup_frequency_range');
		//let prefix = <HTMLSpanElement>document.getElementById('wevideopopup_help_prefix_frequency_range');
		let suffix = <HTMLSpanElement>document.getElementById('wevideopopup_help_suffix_frequency_range');
		if(frequency_period && frequency_range) {
			// value isnt relavent realy... implied by index
			let idx = frequency_period.selectedIndex;
			if (idx === 0) {
				frequency_range.setAttribute('disabled', '');
				//prefix.style.display = 'none';
				suffix.innerText = '';
			} else {
				frequency_range.removeAttribute('disabled');
				//prefix.style.display = 'inline';
				let opts = frequency_range.getAttribute('data-periods').split("|");
				suffix.innerText = opts[idx-1];
			}
		}
	}
	static launch() {
		if (! WEVC_AdminPreview.instance) {
			new WEVC_AdminPreview('wevideopopup_');
		}
		WEVC_AdminPreview.instance.doLaunch();
	}
	//element:HTMLElement;
	view?: WEVC_VideoCallout;
	payload?: wevcPayload;
	prefix: string;
	bindTo(element: HTMLElement) {
		element.addEventListener('click', this.doLaunch.bind(this));

	}
	bindTab(element: HTMLHeadingElement, index: number) {
		element.setAttribute('data-index', index.toString());
		element.addEventListener('click', this.toggleTab.bind(this));
	}
	toggleTab(e: Event) {
		let target = <HTMLHeadingElement>e.target;
		this.selected = parseInt(target.getAttribute('data-index') ?? '');
		if (this.active !== this.selected) {
			if (this.active > -1) {
				this.tabs[this.active].classList.remove('active');
			}
			this.active = this.selected;
			// could we use "active" state - pure css?
			if (this.tabs[this.active].classList.contains('active')) {
				this.tabs[this.active].classList.remove('active');
			} else {
				this.tabs[this.active].classList.add('active');
			}
		} else {
			this.tabs[this.active].classList.remove('active');
			this.selected = -1;
			this.active = -1;
		}
	}

	constructor(prefix: string) {
		this.prefix = prefix;
		WEVC_AdminPreview.instance = this;
		this.tabs = [];
	}
	sync() {
		this.payload = {
			id: '',
			key: '',
			type: 'preview',
			autoplay: false,
			mute: true,
			frequency: 0,
			frequency_period: 0,
			frequency_range: 0,
			delay: 0,
			site_url: '',
			plugin_url: '',
			promo: '',
			modal_click_close: false,
			extra_classes: '',
			controls: false,
			autohide: false,
			starttime: '0',
			styles: {
				"window": {
					"position": this.getRadio('pin'),
					"modal": this.getCheckbox('modal-window'),
					"background": this.getInput('modal-background'),
					"showblur": this.getCheckbox('modal-has-blur'),
					"blur": this.getInput('modal-blur'),
					"class": this.getInput('custom-class'),
					"z-index": this.getInput('z-index')
				},
				"frame": {
					"width": this.getInput('width'),
					"height": this.getInput('height'),
					"margin": this.getInput('margin'),
					"padding": this.getInput('padding'),
					"shadow": {
						"show": this.getCheckbox('frame-has-shadow'),
						"hoffset": this.getInput('shadow-hoffset'),
						"voffset": this.getInput('shadow-voffset'),
						"blur": this.getInput('shadow-blur'),
						"color": this.getInput('shadow-color')
					},
					"background": this.getInput('background')
				},
				"closer": {
					"show": this.getCheckbox('close-show'),
					"size": this.getInput('close-btn-size'),
					"background": this.getInput('close-btn-background'),
					"color": this.getInput('close-btn-foreground'),
					"content": '&times;',
					"shadow": {
						"show": this.getCheckbox('close-has-shadow'),
						"hoffset": this.getInput('close-shadow-hoffset'),
						"voffset": this.getInput('close-shadow-voffset'),
						"blur": this.getInput('close-shadow-blur'),
						"color": this.getInput('close-shadow-color')
					}
				}
			}
		}
	}

	getRadio(name: string) {
		name = this.prefix + name;
		let radio = <any>document.querySelector('input[name="' + name + '"]:checked');
		if (!radio) {
			return '';
		}
		return radio.value;
	}
	getCheckbox(name: string) {
		name = this.prefix + name;
		let cbx = <any>document.querySelector('input[name="' + name + '"]');
		if (!cbx) {
			return false;
		}
		return cbx.checked;
	}
	getInput(name: string) {
		name = this.prefix + name;
		let input = <any>document.querySelector('input[name="' + name + '"]');
		if (!input) {
			return '';
		}
		return input.type === 'number' ? parseInt(input.value) : input.value
	}
	doLaunch() {
		this.sync();
		WEVC_VideoCallout.GetAdminPreview(this.payload);
		// if (!this.view && this.payload) {
		// 	this.view = new WEVC_VideoCallout(this.payload);
		// } else if (this.view && this.payload) {
		// 	this.view.data = this.payload;
		// }
		// if (this.view) {
		// 	this.view.reset();
		// 	this.view.begin();
		// }
		//use WEVC_VideoCallout to launch a preview!
	}


}