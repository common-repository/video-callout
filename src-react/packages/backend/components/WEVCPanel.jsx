import { __ } from '@wordpress/i18n';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import React,{useEffect} from 'react';
import {
	BaseControl,
	Button,
	RadioControl,
	TextControl,
	// NumberControl,
	ToggleControl,
	Dashicon,
	Card,
	// CardHeader,
	CardBody,
	// CardFooter,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	RangeControl,
	SelectControl
} from '@wordpress/components';

import {Icon, reset} from '@wordpress/icons';

// import SidebarCollapsible from './SidebarCollapsible';
import WEVCPlayback from './WEVCPlayback';
import WEVCConfigure from './WEVCConfigure';

// export default WEVCPanel = () => {
//export default function WEVCPanel( { settings } ) {
export default function WEVCPanel() {

	// useEffect(async()=>{
	// 	// probalby simpler to embed this project into the compoennt!
	// 	window.WEVC_VideoCallout && window.WEVC_VideoCallout.GetAdminPreview();

	//   },[]);

	const postType = useSelect(
		(select) => select('core/editor').getCurrentPostType(),
		[]
	);

	// Get the value of meta and a function for updating meta from useEntityProp.
	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	// Define which post meta key to read from/save to.
	const meta_video_id = 'wevideopopup_video_id';

	const meta_autoplay = 'wevideopopup_autoplay';
	const meta_delay = 'wevideopopup_delay';
	const meta_mute = 'wevideopopup_mute';
	const meta_class = 'wevideopopup_class';
	const meta_advanced_position = 'pin';

	const defaults = window.WEVC_DEFAULTS;

	const meta_advanced          = 'wevideopopup_advanced';
	// YUK! - functional component would alow us to squirrel this away better
	const getAdvanced = (key) => {
		try {
			let result = JSON.parse(meta[meta_advanced]);
			return result[key] || '';
		} catch {
			return '';
		}
	}
	// used in translations
	/**
	 * A helper function for getting post meta by key.
	 *
	 * @param {string} key - The meta key to read.
	 * @return {*} - Meta value.
	 */
	const getPostMeta = (key) => meta[key] || '';

	/**
	 * A helper function for updating post meta that accepts a meta key and meta
	 * value rather than entirely new meta object.
	 *
	 * Important! Don't forget to register_post_meta (see ../index.php).
	 *
	 * @param {string} key   - The meta key to update.
	 * @param {*}      value - The meta value to update.
	 */
	const setPostMeta = (key, value) =>
		setMeta({
			...meta,
			[key]: value,
		});

	const showPreview = function() {
		if (window.WEVC_VideoCallout) {
			let width = parseInt(getAdvanced('width'));
			if(! width > 0) {
				width = window.WEVC_DEFAULTS.styles.frame.width;
			}
			let height = parseInt(getAdvanced('height'));
			if(! height > 0) {
				height = window.WEVC_DEFAULTS.styles.frame.height;
			}
			// Start time
			let videoid = getPostMeta(meta_video_id);
			if (getVideoInfo(videoid)['type']=='vimeo'){
				videoid = videoid.replace("#",'&');
			}
			const urlParams = new URLSearchParams(videoid);
			//console.info('preview', width, height);
			// TODO - get these values - either from options
			// or compute from the form
			let payload = defaults;
			// ::TODO:: parse the video id??
			payload.autoplay = (getPostMeta(meta_autoplay) !== '') ? (is_true(getPostMeta(meta_autoplay)) ? true : false) : WEVC_DEFAULTS.globalSettings.mute;
			payload.mute =  (getPostMeta(meta_mute) !== '') ? (is_true(getPostMeta(meta_mute)) ? true : false) : WEVC_DEFAULTS.globalSettings.mute;
			payload.frequency_period = 0;
			payload.frequency_range = 0;
			payload.frequency = 0;
			payload.delay = 0;
			payload.starttime = urlParams.get('t') ? urlParams.get('t') : 0 ;
			payload.extra_classes = (getPostMeta(meta_class) !== '') ? getPostMeta(meta_class) : WEVC_DEFAULTS.styles.window.class
			payload.styles.window.position = (getAdvanced(meta_advanced_position) !== '') ? getAdvanced(meta_advanced_position) : WEVC_DEFAULTS.styles.window.position;
			if (width > 0) {
				payload.styles.frame.width = width;
			}
			if (height > 0) {
				payload.styles.frame.height = height;
			}
			let videoInfo = getVideoInfo(getPostMeta(meta_video_id));
			if (videoInfo) {
				payload.type = videoInfo.type;
				payload.id = videoInfo.id;
			}
			window.WEVC_VideoCallout.GetAdminPreview(payload);
		}
	}


	//
	// const handleFrequencyChange = (e)

	const getVideoInfo = (url) => {
		let test;
		if (test = /\byoutu(\.be|be\.com)\b.*(\/|\?v=)(?<id>[a-zA-Z0-9\-_]{11})/.exec(url)) {
			return {
				id: test.groups.id,
				type: 'youtube'
			};
		} else if (test = /\bdrive\.google\.com\b.*(\/)(?<id>[a-zA-Z0-9\-_]{33})(\/)/.exec(url)) {
			return {
				id: test.groups.id,
				type: 'googleDrive'
			}
		} else if (test = /\bvimeo\.com\b.*\/(?<id>[0-9]+)([^0-9].*)?$/.exec(url)) {
			return {
				id: test.groups.id,
				type: 'vimeo'
			}
		}
		return null;
	}
	const is_true = (val) => {
		return val === "1" || val === true || val === "true";
	}
	return (

		<>
			<Card>
				<CardBody>
					<div className="we-vc-meta_header">
						<p>{__('Defaults and general styling can be configured from the', 'video-callout')} <a href={defaults.settings_url ? defaults.settings_url : ''}>{__('settings page', 'video-callout')}</a>.</p>
						{/* <img src="image/vp-icon-colour.svg" width="70" alt="" /> */}
					</div>
					<BaseControl
                        id="wevideopopup_video_id"
                        label={__('Video address', "video-callout")}
                        help={__("YouTube, Google Drive, or Vimeo URL.", "video-callout")}
                    >
                        <div className="wevideopopup_video_idInput">
                            <input id="wevideopopup_video_id" name="wevideopopup_video_id" type="url" onChange={(e) => setPostMeta(meta_video_id, e.target.value)} value={getPostMeta(meta_video_id)} />
                            <button disabled={!getPostMeta(meta_video_id)} title="Clear" onClick={() => setPostMeta(meta_video_id, '')}><span className="dashicons dashicons-trash"></span></button>
                        </div>
                    </BaseControl>

				</CardBody>
			</Card>
			{getPostMeta(meta_video_id) !== '' &&
				<>
					<WEVCPlayback
						default_autoplay          = {WEVC_DEFAULTS.globalSettings.autoplay}
						default_delay             = {WEVC_DEFAULTS.globalSettings.delay}
						default_frequency_period  = {WEVC_DEFAULTS.globalSettings.frequency_period}
						default_frequency_range   = {WEVC_DEFAULTS.globalSettings.frequency_range}
						default_mute              = {WEVC_DEFAULTS.globalSettings.mute}
					/>

					<WEVCConfigure
						default_width    = {WEVC_DEFAULTS.styles.frame.width}
						default_height   = {WEVC_DEFAULTS.styles.frame.height}
						default_position = {WEVC_DEFAULTS.styles.window.position}
						default_class    = {WEVC_DEFAULTS.styles.window.class}
					/>
					<a className="we-vp-preview-panel-button" data-wevc-preview onClick={showPreview}>
						<Dashicon icon="format-video"/> {__('Preview', 'video-callout')}
					</a>
				</>
			}
		</>
	);
}


