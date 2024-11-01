// import WEVC_VideoCallout from "./WEVC_VideoCallout";
class WEVC_TypePreview {
	static instance:WEVC_TypePreview;
	callOut:WEVC_VideoCallout;
	id:string;
	constructor(callOut:WEVC_VideoCallout) {
		// we only need one instance - this could be a stack
		// i.e. an array of instances and we could fish through
		// the stack on callback
		this.callOut = callOut;
		WEVC_TypePreview.instance = this;
		this.id = this.callOut.getFrame();
		let el = document.getElementById(this.id);
		if (el) {
			el.style.background = 'black';
			el.innerHTML = '<span class="we-vp-watermark dashicons dashicons-format-video"></span>';
			this.launch()
		}
	}
	launch() {
		this.callOut.show();
	}
	stop() {
	}
}