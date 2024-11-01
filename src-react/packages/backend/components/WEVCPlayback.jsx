import { __, sprintf, _n } from '@wordpress/i18n';
import { useEntityProp } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import React, { useState } from 'react';
import { more } from '@wordpress/icons';
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

import { Icon, reset } from '@wordpress/icons';

import SidebarCollapsible from './SidebarCollapsible';

export default function WEVCPlayback(props) {
	// put defaults in props!
	// get set state locally
	const postType = useSelect(
		(select) => select('core/editor').getCurrentPostType(),
		[]
	);

	// Get the value of meta and a function for updating meta from useEntityProp.
	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');
	const meta_autoplay = 'wevideopopup_autoplay';
	const meta_delay = 'wevideopopup_delay';
	const meta_mute = 'wevideopopup_mute';

	const meta_frequency_period = 'wevideopopup_frequency_period';
	const meta_frequency_range = 'wevideopopup_frequency_range';


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
	const [selected_autoplay, setSelected_autoplay] = useState(
		(getPostMeta(meta_autoplay) !== '') ? (is_true(getPostMeta(meta_autoplay)) ? true : false) : props.default_autoplay
	);
	const [selected_delay, setSelected_delay] = useState(
		(getPostMeta(meta_delay) !== '') ? getPostMeta(meta_delay) : props.default_delay
	);
	const [selected_frequency_period, setSelected_frequency_period] = useState(
		(getPostMeta(meta_frequency_period) !== '') ? getPostMeta(meta_frequency_period) : props.default_frequency_period
	);
	const [selected_frequency_range, setSelected_frequency_range] = useState(
		(getPostMeta(meta_frequency_range) !== '') ? getPostMeta(meta_frequency_range) : props.default_frequency_range
	);
	const [selected_mute, setSelected_mute] = useState(
		(getPostMeta(meta_mute) !== '') ? (is_true(getPostMeta(meta_mute)) ? true : false) : props.default_mute
	);


	const revert = () => {
		// trigger handlers with defaults
		setSelected_autoplay(props.default_autoplay);
		setSelected_mute(props.default_mute);
		setSelected_delay(props.default_delay);
		setSelected_frequency_period(props.default_frequency_period);
		setSelected_frequency_range(props.default_frequency_range);

		// This works... but might need to tidy up
		setMeta({
			...meta,
			[meta_autoplay]: props.default_autoplay ? "1" : "0",
			[meta_mute]: props.default_mute ? "1" : "0",
			[meta_delay]: props.default_delay,
			[meta_frequency_period]: String(props.default_frequency_period),
			[meta_frequency_range]: props.default_frequency_range,
		});
	}
	// convieneince method to check if the current settings are the defaults
	const isDefault = () => {
		return (
			(props.default_autoplay == selected_autoplay)
			&&
			(
				props.default_delay == selected_delay
			)
			&&
			(((selected_frequency_period == props.default_frequency_period) && (selected_frequency_period == 0))
				||
				(selected_frequency_range == props.default_frequency_range
				&&
				selected_frequency_period == props.default_frequency_period)
			)
			&&
			// mute
			(props.default_mute == selected_mute)
		)
	}
	const handle_autoplay = (show) => {
		setSelected_autoplay(show);
		let val = show ? "1" : "0"; // converting to a string
		setPostMeta(meta_autoplay, val);
	}
	const handle_mute = (show) => {
		setSelected_mute(show);
		let val = show ? "1" : "0"; // converting to a string
		setPostMeta(meta_mute, val);
	}
	const handle_delay = (value) => {
		setSelected_delay(value);
		setPostMeta(meta_delay, value);
	}
	const handle_period = (value) => {
		setSelected_frequency_period(value);
		setPostMeta(meta_frequency_period, value);
		if (value === '0') {
			handle_range(0);
		}
	}
	const handle_range = (value) => {
		setSelected_frequency_range(value);
		setPostMeta(meta_frequency_range, value);
	}
	/**
	 * TODO - update this function so it does not require compound strings!
	 * @param {} p
	 * @returns
	 */
	const getFrequencyHelperText = (p) => {
		// nest switches for plural and non-plural - then we have translation strings for every language
		let str = '';
		if (selected_frequency_period == 0) {
			str = __('Always show', 'video-callout');
		} else {
			let is_default = ((selected_frequency_period == props.default_frequency_period) && (selected_frequency_period == 0)) ||
				(selected_frequency_range == props.default_frequency_range && selected_frequency_period == props.default_frequency_period);
			let range = parseInt(selected_frequency_range);

			if (selected_frequency_range > 0) {
				// wait for
				// xxx
				// before redisplay
				// (default) ?
				if (is_default) {
					switch (parseInt(p)) {
						case 1 :
							return sprintf( _n( 'Wait for %d second before redisplay (default)', 'Wait for %d seconds before redisplay (default)', range, 'video-callout' ), range);
						case 2 :
							return sprintf( _n( 'Wait for %d minute before redisplay (default)', 'Wait for %d minutes before redisplay (default)', range, 'video-callout' ), range);
						case 3 :
							return sprintf( _n( 'Wait for %d hour before redisplay (default)', 'Wait for %d hours before redisplay (default)', range, 'video-callout' ), range);
						case 4 :
							return sprintf( _n( 'Wait for %d day before redisplay (default)', 'Wait for %d days before redisplay (default)', range, 'video-callout' ), range);
					}

				} else {
					switch (parseInt(p)) {
						case 1 :
							return sprintf( _n( 'Wait for %d second before redisplay', 'Wait for %d seconds before redisplay', range, 'video-callout' ), range);
						case 2 :
							return sprintf( _n( 'Wait for %d minute before redisplay', 'Wait for %d minutes before redisplay', range, 'video-callout' ), range);
						case 3 :
							return sprintf( _n( 'Wait for %d hour before redisplay', 'Wait for %d hours before redisplay', range, 'video-callout' ), range);
						case 4 :
							return sprintf( _n( 'Wait for %d day before redisplay', 'Wait for %d days before redisplay', range, 'video-callout' ), range);
					}

				}

			} else {
				//how many
				switch (parseInt(p)) {
					case 1 :
						return __( 'How many seconds before redisplay', 'video-callout' );
					case 2 :
						return __( 'How many minutes before redisplay', 'video-callout' );
					case 3 :
						return __( 'How many hours before redisplay', 'video-callout' );
					case 4 :
						return __( 'How many days before redisplay', 'video-callout' );
				}
			}

		}

		return str;
	}
	const getFrequencyOptions = (r) => {
		if (r > 1) return	[
			{
				label: __("Always show", 'video-callout'),
				value: 0
			},
			{
				label: __("Seconds", 'video-callout'),
				value: 1
			},
			{
				label: __("Minutes", 'video-callout'),
				value: 2
			},
			{
				label: __("Hours", 'video-callout'),
				value: 3
			},
			{
				label: __("Days", 'video-callout'),
				value: 4
			}
		];
		return[
			{
				label: __("Always show", 'video-callout'),
				value: 0
			},
			{
				label: __("Second", 'video-callout'),
				value: 1
			},
			{
				label: __("Minute", 'video-callout'),
				value: 2
			},
			{
				label: __("Hour", 'video-callout'),
				value: 3
			},
			{
				label: __("Day", 'video-callout'),
				value: 4
			}
		]
	}
	return (
		<SidebarCollapsible
			icon={"admin-settings"}
			title={__("Playback", "video-callout")}>
			<ToggleControl
				name="wevideopopup_autoplay"
				label={__("Autoplay", 'video-callout')}
				help={
					(selected_autoplay
						? __('Will attempt to autoplay on load. Video must be muted for autoplay to work in some browsers.', 'video-callout') + " Google drive videos cannot be autoplayed."
						: __('Autoplay off', 'video-callout')) + (
						(selected_autoplay === props.default_autoplay) ? ' (' + __('default', 'video-callout') + ')' : ''
					)
				}
				checked={selected_autoplay}
				onChange={handle_autoplay} />
			<TextControl
				name="wevideopopup_delay"
				label={__('Delay', 'video-callout')}
				value={selected_delay}
				type="number"
				onChange={handle_delay}
				className={
					(
						getPostMeta(meta_delay) == ''
						||
						props.default_delay === selected_delay
					) ? 'wevc-default' : 'wevc-non-default'
				}
				help={__("Number of milliseconds until video appears, 1000 = 1 second", 'video-callout') +
					(
						(props.default_delay === selected_delay)
							? ' (' + __('default', 'video-callout') + ')' : ''
					)
				}
			/>


			<>
				{(!selected_frequency_period || selected_frequency_period == 0 || selected_frequency_period < 1) &&
					<>
					<SelectControl
					label={__('Frequency', 'video-callout')}
					onChange={handle_period}
					value={selected_frequency_period}
					options={getFrequencyOptions(selected_frequency_range)}
					className={
						(
							(selected_frequency_period == '')
							||
							(props.default_frequency_period == selected_frequency_period)
						) ? 'wevc-default' : 'wevc-non-default'
					}
					help={getFrequencyHelperText(selected_frequency_period)}
					/>

				</>
				}
				{selected_frequency_period > 0 &&
					<>
						<SelectControl
						label={__('Frequency', 'video-callout')}
						onChange={handle_period}
						value={selected_frequency_period}
						options={getFrequencyOptions(selected_frequency_range)}
						className={
							(
								(selected_frequency_period == '')
								||
								(props.default_frequency_period == selected_frequency_period)
							) ? 'wevc-default' : 'wevc-non-default'
						}
						/>

						<TextControl
						// max={2147483647}
						// min={0}
						// value={range}
						type="number"
						value={Math.min(Math.max(0,parseInt(selected_frequency_range)),2147483647) || 0}
						onChange={handle_range}
						help={getFrequencyHelperText(selected_frequency_period)}
						className={
							(
								(selected_frequency_range == '')
								||
								(props.default_frequency_range == selected_frequency_range)
							) ? 'wevc-default' : 'wevc-non-default'
						}
						/>
					</>
				}
			</>


			<ToggleControl
				label={__("Mute", 'video-callout')}
				help={
					(selected_mute
						? 'Audio off'
						: 'Audio on') + (
						(selected_mute === props.default_mute) ? ' (' + __('default', 'video-callout') + ')' : ''
					)
				}
				name="wevideopopup_mute"
				checked={selected_mute}
				onChange={handle_mute} />
				{/* onChange={(show) => setPostMeta(meta_mute, show ? "1" : "0")} /> */}
			{!isDefault() &&
				<Button
					isSmall
					variant="primary"
					icon={reset}
					onClick={revert}
				>
					{__('Revert playback to defaults', 'video-callout')}
				</Button>
			}
		</SidebarCollapsible>
	);

}