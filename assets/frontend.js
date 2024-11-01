class WEVC_AdminPreview {
    constructor(prefix) {
        this.selected = 0;
        this.active = -1;
        this.prefix = prefix;
        WEVC_AdminPreview.instance = this;
        this.tabs = [];
    }
    static make() {
        let elements = Array.from(document.querySelectorAll('[data-wevc-preview]'));
        let self = new WEVC_AdminPreview('wevideopopup_');
        for (let i = 0; i < elements.length; i++) {
            self.bindTo(elements[i]);
        }
        ;
        self.tabs = Array.from(document.querySelectorAll('.we-vc-admin h2'));
        for (var i = 0; i < self.tabs.length; i++) {
            self.bindTab(self.tabs[i], i);
        }
        ;
        let frequency_period = document.getElementById('wevideopopup_frequency_period');
        frequency_period.addEventListener('change', self.frequencyChange.bind(self));
        self.frequencyChange();
    }
    static makeMeta() {
        let self = new WEVC_AdminPreview('wevideopopup_');
        let watchInput = document.getElementById(self.prefix + 'video_id');
        let vpMore = document.getElementById('we-vp-more');
        let vpClear = document.getElementById('we-vp-clear');
        watchInput.addEventListener('input', function (evt) {
            if (this.value !== '') {
                vpMore.style.display = "block";
                vpMore.style.display = "block";
                vpClear.style.display = "block";
            }
            else {
                vpMore.style.display = "none";
                vpClear.style.display = "none";
            }
        });
        let doInput = function () {
            const event = new Event('input');
            watchInput.dispatchEvent(event);
        };
        vpClear.addEventListener('click', function (evt) {
            watchInput.value = '';
            doInput();
        });
        doInput();
        WEVC_InputDefaultReset.make();
        let frequency_period = document.getElementById('wevideopopup_frequency_period');
        frequency_period.addEventListener('change', self.frequencyChange.bind(self));
        self.frequencyChange();
    }
    frequencyChange() {
        let frequency_period = document.getElementById('wevideopopup_frequency_period');
        let frequency_range = document.getElementById('wevideopopup_frequency_range');
        let suffix = document.getElementById('wevideopopup_help_suffix_frequency_range');
        if (frequency_period && frequency_range) {
            let idx = frequency_period.selectedIndex;
            if (idx === 0) {
                frequency_range.setAttribute('disabled', '');
                suffix.innerText = '';
            }
            else {
                frequency_range.removeAttribute('disabled');
                let opts = frequency_range.getAttribute('data-periods').split("|");
                suffix.innerText = opts[idx - 1];
            }
        }
    }
    static launch() {
        if (!WEVC_AdminPreview.instance) {
            new WEVC_AdminPreview('wevideopopup_');
        }
        WEVC_AdminPreview.instance.doLaunch();
    }
    bindTo(element) {
        element.addEventListener('click', this.doLaunch.bind(this));
    }
    bindTab(element, index) {
        element.setAttribute('data-index', index.toString());
        element.addEventListener('click', this.toggleTab.bind(this));
    }
    toggleTab(e) {
        var _a;
        let target = e.target;
        this.selected = parseInt((_a = target.getAttribute('data-index')) !== null && _a !== void 0 ? _a : '');
        if (this.active !== this.selected) {
            if (this.active > -1) {
                this.tabs[this.active].classList.remove('active');
            }
            this.active = this.selected;
            if (this.tabs[this.active].classList.contains('active')) {
                this.tabs[this.active].classList.remove('active');
            }
            else {
                this.tabs[this.active].classList.add('active');
            }
        }
        else {
            this.tabs[this.active].classList.remove('active');
            this.selected = -1;
            this.active = -1;
        }
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
        };
    }
    getRadio(name) {
        name = this.prefix + name;
        let radio = document.querySelector('input[name="' + name + '"]:checked');
        if (!radio) {
            return '';
        }
        return radio.value;
    }
    getCheckbox(name) {
        name = this.prefix + name;
        let cbx = document.querySelector('input[name="' + name + '"]');
        if (!cbx) {
            return false;
        }
        return cbx.checked;
    }
    getInput(name) {
        name = this.prefix + name;
        let input = document.querySelector('input[name="' + name + '"]');
        if (!input) {
            return '';
        }
        return input.type === 'number' ? parseInt(input.value) : input.value;
    }
    doLaunch() {
        this.sync();
        WEVC_VideoCallout.GetAdminPreview(this.payload);
    }
}
class WEVC_InputDefaultReset {
    constructor(input) {
        var _a;
        this.input = input;
        this.a = document.createElement('a');
        this.a.setAttribute('style', 'display: none;background: #8bc34a;padding: 0;border-radius: 15px;width: 19px;height: 19px;color: white;margin: 0px 0 0 3px');
        this.a.setAttribute('title', 'reset to default value');
        this.a.innerHTML = '<span class="dashicons dashicons-undo" style="font-size: 15px;width: 15px;font-size: 16px;margin: 1px 0 0 2px"></span>';
        this.default = (_a = this.input.getAttribute('data-wevc-default')) !== null && _a !== void 0 ? _a : '';
        this.input.setAttribute('placeholder', this.default);
        if (this.input.parentElement && this.input.parentElement.lastElementChild) {
            this.insertAfter(this.a, this.input.parentElement.lastElementChild);
        }
        this.sync();
        this.input.addEventListener('input', this.sync.bind(this));
        this.a.addEventListener('click', this.toggle.bind(this));
    }
    static make() {
        let elements = Array.from(document.querySelectorAll('[data-wevc-default]'));
        for (var i = 0; i < elements.length; i++) {
            new WEVC_InputDefaultReset(elements[i]);
        }
        ;
    }
    toggle() {
        switch (this.input.type) {
            case 'checkbox':
                this.input.checked = this.default === "checked" ? true : false;
                break;
            default:
                this.input.value = this.default;
        }
        this.sync();
    }
    sync() {
        switch (this.input.type) {
            case 'checkbox':
                let defbol = this.default === "checked";
                let show = this.input.checked === defbol;
                if (show) {
                    this.a.style.display = 'inline-block';
                }
                else {
                    this.a.style.display = 'none';
                }
                break;
            default:
                if ((this.input.value !== '') && (this.input.value !== this.default)) {
                    this.a.style.display = 'inline-block';
                }
                else {
                    this.a.style.display = 'none';
                }
        }
    }
    insertAfter(newNode, referenceNode) {
        if (referenceNode.parentNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
}
class WEVC_TypeGoogleDrive {
    constructor(callOut) {
        this.callOut = callOut;
        if (!WEVC_TypeGoogleDrive.instance) {
            WEVC_TypeGoogleDrive.instance = this;
        }
        this.id = this.callOut.getFrame();
        if (this.callOut.data) {
            if (this.callOut.data.delay) {
                this.callOut.hide();
            }
            if (WEVC_TypeGoogleDrive.instance === this) {
                WEVC_TypeGoogleDrive.instance.init();
            }
            else {
                WEVC_TypeGoogleDrive.instance.launch();
            }
        }
    }
    init() {
        if (this.callOut.data) {
            if (!(-1 == this.callOut.data.delay)) {
                setTimeout(function () {
                    WEVC_TypeGoogleDrive.instance.launch();
                }, this.callOut.data.delay);
            }
        }
    }
    launch() {
        if (this.callOut.data) {
            this.callOut.show();
            this.callOut.play();
        }
    }
    play() {
        let vars = {
            mute: this.callOut.data.mute ? 1 : 0,
            autoplay: this.callOut.data.autoplay,
            controls: this.callOut.data.controls,
            autohide: this.callOut.data.autohide,
            wmode: 'opaque',
            origin: this.callOut.data.site_url,
            start: this.callOut.data.starttime ? '?t=' + this.callOut.data.starttime : ''
        };
        this.player = document.createElement('iframe');
        if (vars.mute)
            this.player.muted = true;
        this.player.setAttribute('controls', "");
        if (vars.autoplay)
            this.player.setAttribute('allow', "autoplay;");
        this.player.setAttribute('width', "100%");
        this.player.setAttribute('height', "100%");
        this.player.setAttribute('src', "https://drive.google.com/file/d/" + this.callOut.data.id + "/preview" + vars.start);
        this.player.setAttribute('type', "video/mp4");
        let textVideoFailure = document.createTextNode("Your browser does not support the video tag.");
        this.player.appendChild(textVideoFailure);
        let target = document.getElementById(this.id);
        if (target)
            target.innerHTML = "";
        target.appendChild(this.player);
        this.callOut.played();
    }
}
class WEVC_TypePreview {
    constructor(callOut) {
        this.callOut = callOut;
        WEVC_TypePreview.instance = this;
        this.id = this.callOut.getFrame();
        let el = document.getElementById(this.id);
        if (el) {
            el.style.background = 'black';
            el.innerHTML = '<span class="we-vp-watermark dashicons dashicons-format-video"></span>';
            this.launch();
        }
    }
    launch() {
        this.callOut.show();
    }
    stop() {
    }
}
class WEVC_TypeVimeo {
    constructor(callOut) {
        this.callOut = callOut;
        WEVC_TypeVimeo.instance = this;
        this.id = this.callOut.getFrame();
        if (this.callOut.data && this.callOut.data.delay) {
            this.callOut.hide();
        }
        if (this.callOut.data && this.callOut.data.delay) {
            this.callOut.hide();
        }
        this.callOut.loadScript("https://player.vimeo.com/api/player.js");
        WEVC_TypeVimeo.instance.check();
    }
    check() {
        if (typeof (window.Vimeo) === 'undefined') {
            setTimeout(function () {
                WEVC_TypeVimeo.instance.check();
            }, 100);
        }
        else {
            this.init();
        }
    }
    init() {
        if (this.callOut.data) {
            if (!(-1 == this.callOut.data.delay)) {
                setTimeout(function () {
                    WEVC_TypeVimeo.instance.launch();
                }, this.callOut.data.delay);
            }
        }
    }
    launch() {
        if (this.callOut.data) {
            this.callOut.show();
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
        this.player = new window.Vimeo.Player(this.callOut.id_content, opts);
        this.player.setCurrentTime(this.callOut.data.starttime);
        this.callOut.played();
    }
}
class WEVC_TypeYouTube {
    constructor(callOut) {
        this.callOut = callOut;
        if (!WEVC_TypeYouTube.instance) {
            WEVC_TypeYouTube.instance = this;
        }
        this.id = this.callOut.getFrame();
        if (this.callOut.data) {
            if (this.callOut.data.delay) {
                this.callOut.hide();
            }
            if (WEVC_TypeYouTube.instance === this) {
                this.callOut.appendScript(`function onYouTubeIframeAPIReady() {
					WEVC_TypeYouTube.instance.init();
					}`);
                this.callOut.loadScript("https://www.youtube.com/iframe_api");
            }
            else {
                WEVC_TypeYouTube.instance.launch();
            }
        }
    }
    init() {
        if (this.callOut.data) {
            if (!(-1 == this.callOut.data.delay)) {
                setTimeout(function () {
                    WEVC_TypeYouTube.instance.launch();
                }, this.callOut.data.delay);
            }
        }
    }
    launch() {
        if (this.callOut.data) {
            this.callOut.show();
            this.callOut.play();
        }
    }
    play() {
        let YT = window.YT;
        if (this.player) {
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
        this.player = new YT.Player(this.id, {
            height: '390',
            width: '640',
            videoId: this.callOut.data.id,
            playerVars: vars,
            events: {
                'onReady': this.onPlayerReady.bind(this)
            }
        });
        this.callOut.played();
    }
    onPlayerReady() {
        if (this.callOut.data.mute) {
            this.player.mute();
        }
        else {
            this.player.unMute();
        }
    }
}
class WEVC_VideoCallout {
    constructor(incomming, preview) {
        if (!preview) {
            preview = false;
        }
        if (WEVC_VideoCallout.instance !== undefined) {
            WEVC_VideoCallout.instance.data = incomming;
            WEVC_VideoCallout.instance.trigger(preview);
        }
        else {
            this.data = incomming;
            if (this.data.frequency_period && this.data.frequency_range) {
                let frequency = this.data.frequency_range;
                if (this.data.frequency_period > 1) {
                    frequency *= 60;
                }
                if (this.data.frequency_period > 2) {
                    frequency *= 60;
                }
                if (this.data.frequency_period > 3) {
                    frequency *= 24;
                }
                this.data.frequency = frequency;
            }
            WEVC_VideoCallout.instance = this;
            this.trigger(preview);
        }
    }
    static GetAdminPreview(payload) {
        if (payload) {
            new WEVC_VideoCallout(payload, true);
        }
        else {
            console.warn('no data');
        }
    }
    trigger(preview) {
        if (preview) {
            this.begin();
        }
        else {
            if (this.canplay()) {
                if (this.data.delay > 0) {
                    window.setTimeout(function () { WEVC_VideoCallout.instance.begin(); }, this.data.delay);
                }
                else {
                    this.begin();
                }
            }
        }
    }
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
        el.innerHTML = this.data.promo;
        let self = this;
        window.setTimeout(function () {
            el.innerHTML = '';
            if (self.playerobj) {
                self.playerobj.play();
            }
            else {
                console.warn('no player...');
            }
        }, 3000);
    }
    getPlayer() {
        let el = document.querySelectorAll('.wevideopopup')[0];
        if (el && el.nodeName === 'DIV') {
            this.player = el;
        }
        return this.player !== null;
    }
    getFrame() {
        if (this.data) {
            let id = 'wevp-' + this.data.key;
            this.id_content = 'wevp-content-' + this.data.key;
            let win = document.createElement('div');
            let cstyle = this.data.styles.closer;
            win.innerHTML = '<div class="wevideoplayer"><div id="' + this.id_content + '"></div></div>';
            win.setAttribute('id', id);
            let wstyle = this.data.styles.window;
            let fstyle = this.data.styles.frame;
            if (this.data.styles.window.modal ||
                (!this.data.styles.window.modal && cstyle.show === false) ||
                (this.data.styles.closer.size < 1) ||
                (!this.data.styles.closer.show)) {
                let winouter = document.createElement('div');
                winouter.appendChild(win);
                winouter.setAttribute('class', 'wevideopopup ' + this.data.type + ' ' + wstyle.class);
                winouter.setAttribute('style', 'width: 100%; height:100%; top:0; left:0; position: fixed');
                if (!this.data.styles.window.modal) {
                    this.data.styles.window.background = 'rgba(0,0,0,0)';
                }
                winouter.style.background = this.data.styles.window.background;
                this.player = winouter;
                win.style.position = 'absolute';
                winouter.onclick = function (e) {
                    e.preventDefault();
                    WEVC_VideoCallout.instance.stop();
                    WEVC_VideoCallout.instance.hide();
                    return false;
                };
                win.onclick = function (e) {
                    e.stopPropagation();
                };
                if (this.data.styles.window.showblur) {
                    const blur = String(this.data.styles.window.blur);
                    winouter.style.setProperty("backdrop-filter", "blur(" + blur + "px)");
                    winouter.style.setProperty("-webkit-backdrop-filter", "blur(" + blur + "px)");
                }
            }
            else {
                win.setAttribute('class', 'wevideopopup ' + this.data.type + ' ' + wstyle.class);
                this.player = win;
            }
            this.player.style.zIndex = String(this.data.styles.window['z-index'] > 0 ? this.data.styles.window['z-index'] : '100000');
            win.style.height = fstyle.height + 'px';
            win.style.width = fstyle.width + 'px';
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
    setPosition(win) {
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
    makeBoxShadow(shadow) {
        let str = shadow.hoffset + "px " + shadow.voffset + "px " + shadow.blur + "px " + shadow.color;
        return str;
    }
    stop() {
        if (this.player) {
            this.player.remove();
        }
    }
    reset() {
        while (this.getPlayer()) {
            if (this.player && this.player.parentNode) {
                this.player.parentNode.removeChild(this.player);
            }
            return;
        }
    }
    setPlayer(el) {
        this.reset();
        this.player = el;
        document.body.appendChild(this.player);
    }
    loadScript(src) {
        let firstScriptTag = document.getElementsByTagName('script')[0];
        let the_script = document.createElement('script');
        the_script.setAttribute('src', src);
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(the_script, firstScriptTag);
        }
    }
    appendScript(src) {
        let the_script = document.createElement('script');
        let child = document.createTextNode(src);
        the_script.appendChild(child);
        document.body.appendChild(the_script);
    }
    show() {
        if (this.player) {
            this.player.style.display = 'block';
            window.setTimeout(function () {
                document.querySelectorAll('.wevideopopup')[0].classList.add("show");
            }, 50);
        }
    }
    hide() {
        if (this.player) {
            this.player.style.display = 'none';
        }
    }
    played() {
        if (this.data && this.data.key) {
            let now = new Date().getTime();
            let freq = this.data.frequency;
            let expiry_ts = now + (freq * 1000);
            let expiry_date = new Date(expiry_ts);
            let utc = expiry_date.toUTCString();
            let cook = 'wevp_exp_' + this.data.key + "=" + now + "; expires=" + utc;
            document.cookie = cook;
        }
    }
    canplay() {
        let viewed = this.getViewed();
        if (viewed) {
            let now = new Date().getTime();
            let ms = (this.data.frequency * 1000);
            let canplay = now - viewed > ms;
            if (!canplay) {
                return false;
            }
            return true;
        }
        return true;
    }
    getViewed() {
        if (this.data && this.data.key) {
            var match = document.cookie.match(new RegExp('(^| )wevp_exp_' + this.data.key + '=([^;]+)'));
            if (match) {
                let dt = +parseInt(match[2]) + this.data.frequency;
                return dt;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
}
