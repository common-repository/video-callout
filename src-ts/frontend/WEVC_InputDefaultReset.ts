class WEVC_InputDefaultReset {
	static make (){
		let elements = Array.from(document.querySelectorAll('[data-wevc-default]'));
		for (var i = 0; i < elements.length; i++) {
			new WEVC_InputDefaultReset(<HTMLInputElement> elements[i]);
		};

	}
	input:HTMLInputElement;
	a:HTMLAnchorElement;
	default:string;
	constructor(input:HTMLInputElement){
		//todo - checkboxes!
		this.input = input;
		this.a = document.createElement('a');
		this.a.setAttribute('style','display: none;background: #8bc34a;padding: 0;border-radius: 15px;width: 19px;height: 19px;color: white;margin: 0px 0 0 3px');
		this.a.setAttribute('title', 'reset to default value');
		this.a.innerHTML = '<span class="dashicons dashicons-undo" style="font-size: 15px;width: 15px;font-size: 16px;margin: 1px 0 0 2px"></span>';
		this.default = this.input.getAttribute('data-wevc-default') ?? '';
		this.input.setAttribute('placeholder', this.default);
		if (this.input.parentElement && this.input.parentElement.lastElementChild) {
			this.insertAfter(this.a, this.input.parentElement.lastElementChild);
		}
		this.sync();
		this.input.addEventListener('input', this.sync.bind(this));
		this.a.addEventListener('click', this.toggle.bind(this));
		//input.addEventListener('change', this.sync);
	}
	toggle() {
		switch (this.input.type) {
			case 'checkbox' :
				this.input.checked = this.default === "checked" ? true : false;
				break;
			default:
				//check if default different from value and show reset if needed
				this.input.value = this.default;
			}
		this.sync();
	}
	sync() {
		switch (this.input.type) {
			case 'checkbox' :
				let defbol = this.default === "checked";
				let show = this.input.checked === defbol;
				if(show){

					this.a.style.display = 'inline-block';
				} else {
					this.a.style.display = 'none';
				}
			break;
			default:
				//check if default different from value and show reset if needed
				if((this.input.value !== '') && (this.input.value !== this.default)) {
					this.a.style.display = 'inline-block';
				} else {
					this.a.style.display = 'none';
				}
		}
	}
	insertAfter(newNode:Element, referenceNode:Element) {
		if (referenceNode.parentNode) {
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}
	}
}

