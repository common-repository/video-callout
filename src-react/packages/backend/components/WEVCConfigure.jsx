import { __ } from '@wordpress/i18n';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import React, { useState } from 'react';
// import { settings } from '@wordpress/icons';
import {
	Button,
	// RadioControl,
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
import WEVCRadioControl from './WEVCRadio';
import { Icon, reset } from '@wordpress/icons';

import SidebarCollapsible from './SidebarCollapsible';

// export default WEVCPanel = () => {
//export default function WEVCPanel( { settings } ) {
export default function WEVCConfigure(props) {
	// put defaults in props!
	// get set state locally
	const postType = useSelect(
		(select) => select('core/editor').getCurrentPostType(),
		[]
	);

	// Get the value of meta and a function for updating meta from useEntityProp.
	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	const meta_advanced_width    = 'width';
	const meta_advanced_height   = 'height';
	const meta_advanced_position = 'pin';
	const meta_advanced          = 'wevideopopup_advanced';
	const meta_class             = 'wevideopopup_class';


	// YUK! - functional component would alow us to squirrel this away better
	const getAdvanced = (key) => {
		try {
			let result = JSON.parse(meta[meta_advanced]);
			return result[key] || '';
		} catch {
			return '';
		}
	}
	// MORE YUK!
	const setAdvanced = function (key, value) {
		let advanced;
		if (!meta[meta_advanced]) {
			advanced = {};
		} else {
			try {
				advanced = JSON.parse(meta[meta_advanced]);
			} catch {
				advanced = {};
				return null;
			}
		}
		advanced[key] = value;
		setPostMeta(meta_advanced, JSON.stringify(advanced));
	};

	// Modified setAdvanced function which resets everything in meta_advance
	const resetAdvanced = function () {
		let advanced;
		if (!meta[meta_advanced]) {
			advanced = {};
		} else {
			try {
				advanced = JSON.parse(meta[meta_advanced]);
			} catch {
				advanced = {};
				return null;
			}
		}

		advanced[meta_advanced_width] = props.default_width;
		advanced[meta_advanced_height] = props.default_height;
		advanced[meta_advanced_position] = props.default_position;

		setPostMeta(meta_advanced, JSON.stringify(advanced));
	};

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
	const is_true = (val) => {
		return val === "1" || val === true || val === "true";
	}
	// state - either from meta or from props if not set
	const [selected_width, setSelected_width] = useState(
		(getAdvanced(meta_advanced_width) !== '') ? getAdvanced(meta_advanced_width) : props.default_width
	);
	const [selected_height, setSelected_height] = useState(
		(getAdvanced(meta_advanced_height) !== '') ? getAdvanced(meta_advanced_height) : props.default_height
	);
	const [selected_position, setSelected_position] = useState(
		(getAdvanced(meta_advanced_position) !== '') ? getAdvanced(meta_advanced_position) : props.default_position
	);
	const [selected_class, setSelected_class] = useState(
		(getPostMeta(meta_class) !== '') ? getPostMeta(meta_class) : props.default_class
	);


	const revert = () => {
		console.info("Revert");
		// trigger handlers with defaults
		setSelected_width(props.default_width);
		setSelected_height(props.default_height);
		setSelected_position(props.default_position);

		handle_class(props.default_class);

		resetAdvanced();
	}
	// convieneince method to check if the current settings are the defaults
	const isDefault = () => {
		return (
			(props.default_width == selected_width)
			&&
			(props.default_height == selected_height)
			&&
			(props.default_position == selected_position)
			&&
			(props.default_class == selected_class)
		)
	}
	const handle_width = (value) => {
		setSelected_width(value);
		setAdvanced(meta_advanced_width, parseInt(value));
	}
	const handle_height = (value) => {
		setSelected_height(value);
		setAdvanced(meta_advanced_height, parseInt(value));
	}
	const handle_position = (value) => {
		setSelected_position(value);
		setAdvanced(meta_advanced_position, value);
	}
	const handle_class = (value) => {
		setSelected_class(value);
		setPostMeta(meta_class, value);
	}

	return (
		<SidebarCollapsible
			title={__("Configure", "video-callout")}
			icon={"clock"}
		>
			{/* <Heading size={2}><Dashicon icon="admin-settings" /> Configure</Heading> */}
			<TextControl
				label={__('Width', 'video-callout')}
				value={selected_width}
				type="number"
				onChange={handle_width}
				help={__("Display width of video in pixels", 'video-callout')}
				name="wevideopopup_width"
			/>
			<TextControl
				label={__('Height', 'video-callout')}
				value={selected_height}
				type="number"
				onChange={handle_height}
				help={__("Display height of video in pixels", 'video-callout')}
				name="wevideopopup_height"
			/>
			<div className="wevp-pin">
				<WEVCRadioControl
					label={__("Position", 'video-callout')}
					help={__("Current position") + ': ' + getAdvanced('pin')}
					selected={selected_position}
					name="wevideopopup_pin"
					options={[
						{ label: 'top-left', value: 'top-left' },
						{ label: 'top-centre', value: 'top-centre' },
						{ label: 'top-right', value: 'top-right' },
						{ label: 'middle-left', value: 'middle-left' },
						{ label: 'middle-centre', value: 'middle-centre' },
						{ label: 'middle-right', value: 'middle-right' },
						{ label: 'bottom-left', value: 'bottom-left' },
						{ label: 'bottom-centre', value: 'bottom-centre' },
						{ label: 'bottom-right', value: 'bottom-right' },
					]}
					onChange={handle_position}
				/>
			</div>
			<TextControl
				name="wevideopopup_class"
				label={__('CSS class', 'video-callout')}
				value={selected_class}
				onChange={handle_class}
				help={__("Optional css classes to apply to callout.", 'video-callout')}
			/>
			{!isDefault() &&
				<Button
					isSmall
					variant="primary"
					icon={reset}
					onClick={revert}
				>
					{__('Revert configuration to defaults', 'video-callout')}
				</Button>
			}
		</SidebarCollapsible>
	);

}