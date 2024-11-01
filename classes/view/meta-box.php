<?php

use WebEngineLimited\VideoCallout;
use WebEngineLimited\VideoCalloutAdmin;

/*
required vars -

NOTE - this script is included within the VideoCallout class
so *this* is an instance of VideoCallout

WEVP_PREFIX - prefix
$video_id
$autoplay - bool
$delay - 0
$frequency - string (1 month etc)
$aspect_ratio - 16:9
$class - string

Admin settings provide presentation settings some of which can also be overridden here
show those settings in an optionn part of the form
*/

$default_width = get_option(WEVP_PREFIX . 'width');
$default_height = get_option(WEVP_PREFIX . 'height');

$custom = get_post_custom($post->ID);
$hasmeta = isset($custom[WEVP_PREFIX . 'video_id']); // text inputs always post even if empty...
$video_id = $hasmeta ? $custom[WEVP_PREFIX . 'video_id'][0] : '';
$default_autoplay = (get_option(WEVP_PREFIX . 'autoplay') ? '1' : '');
$default_mute = (get_option(WEVP_PREFIX . 'mute') ? '1' : '');
// checkboxes dont have post data when not set so use video_id to determine post prescence
//if ($haspostdata) {
$autoplay = (
				(
					isset($custom[WEVP_PREFIX . 'autoplay'])
					&&
					($custom[WEVP_PREFIX . 'autoplay'][0])
				) ? true : ($hasmeta ? ' ' :  ($default_autoplay === '1' ? true : false))
			);
$mute = 	(
				(
					isset($custom[WEVP_PREFIX . 'mute'])
					&&
					($custom[WEVP_PREFIX . 'mute'][0])
				) ? true : ($hasmeta ? ' ' : ($default_mute === '1' ? true : false))
			);

$default_delay = get_option(WEVP_PREFIX . 'delay');
$delay = isset($custom[WEVP_PREFIX . 'delay']) ? max(0, intval($custom[WEVP_PREFIX . 'delay'][0])) : $default_delay;
$default_frequency_period = get_option(WEVP_PREFIX . 'frequency_period');
$default_frequency_range = get_option(WEVP_PREFIX . 'frequency_range');

$frequency_period = isset($custom[WEVP_PREFIX . 'frequency_period'])
	? esc_attr($custom[WEVP_PREFIX . 'frequency_period'][0])
	: $default_frequency_period;

$frequency_range = isset($custom[WEVP_PREFIX . 'frequency_range'])
	? esc_attr($custom[WEVP_PREFIX . 'frequency_range'][0])
	: $default_frequency_range;



//TODO
$class = isset($custom[WEVP_PREFIX . 'class']) ? $custom[WEVP_PREFIX . 'class'][0] : '';
$advanced = [];
if (isset($custom[WEVP_PREFIX . 'advanced'])) {
	// no idea why this is an array!
	// Array ( [0] => {"width":"800","height":"","pin":"","modal":""} )
	$advanced = json_decode($custom[WEVP_PREFIX . 'advanced'][0], true);
}
foreach (VideoCallout::ADVANCED_FIELDS as $prop) {
	if (!array_key_exists($prop, $advanced)) {
		$advanced[$prop] = '';
	}
}
//::TODO:: need to store the *defaults* differently for comparison
// this funciton now flattens the known data!
$defaults = VideoCallout::loadGlobals();

wp_nonce_field(WEVP_PREFIX . 'nonce', WEVP_PREFIX . 'nonce');
// push what is essentially a template out to a discrete file

$asset_path = plugin_dir_url(dirname(__DIR__)) . '/assets';
$settings_page =  menu_page_url('video-callout', false);
?>
<p class="post-attributes-label-wrapper">
	<div class="we-vc-meta_header">
		<p><?php esc_html_e('Defaults and general styling can be configured from the', 'video-callout')?> <a href="<?php echo esc_url($settings_page);?>"><?php esc_html_e('settings page', 'video-callout')?></a>.</p>
		<img src="<?php echo esc_url($asset_path);?>/image/vp-icon-colour.svg" width="70" alt="" />
	</div>
	<label class="we-vc-meta_urlLabel post-attributes-label"><?php esc_html_e('Video', 'video-callout')?>
		<div class="we-vc-meta_urlInput">
			<input placeholder="https://" class="widefat we-vc-inputValidated" type="url" name="<?php echo esc_attr(WEVP_PREFIX . 'video_id');?>" id="<?php echo esc_attr(WEVP_PREFIX . 'video_id');?>" value="<?php echo esc_attr($video_id);?>" />
			<a class="dashicons dashicons-no" alt="clear" id="we-vp-clear" style="display:none;position: absolute;top: 4px;right: 4px;"></a>
		</div>
	</label>
	<small class="post-attributes-help-text"><?php esc_html_e('YouTube or Vimeo URL.', 'video-callout')?></small>
</p>
<div id="we-vp-more" style="display:none">


<div id="wevideopopup-meta-box-playback" class="postbox closed">
<div class="postbox-header"><div class="handlediv" style="width:100%"><h2><span class="dashicons dashicons-clock"></span> <?php esc_html_e('Playback', 'video-callout')?></h2></div>
	<div class="handle-actions hide-if-no-js">
		<button type="button" class="handlediv" aria-expanded="false">
			<span class="screen-reader-text"><?php esc_html_e('Toggle panel: Video Callout playback', 'video-callout')?></span>
			<span class="toggle-indicator" aria-hidden="true"></span>
		</button>
	</div>
</div>
<div class="inside">



<p class="post-attributes-label-wrapper">
	<label class="post-attributes-label">
		<input
			type="checkbox"
			name="<?php echo esc_attr(WEVP_PREFIX . 'autoplay');?>"
			id="<?php echo esc_attr(WEVP_PREFIX . 'autoplay');?>"
			value="1"<?php echo ($autoplay ? ' checked' : ''); ?>
			data-wevc-default="<?php echo esc_attr($default_autoplay);?>"
		/> <?php esc_html_e('Autoplay', 'video-callout')?>
	</label>
</p>
<p class="post-attributes-label-wrapper">
	<label class="post-attributes-label"><?php esc_html_e('Delay', 'video-callout')?>
	<br>
	<input type="number" min="0" name="<?php echo esc_attr(WEVP_PREFIX . 'delay');?>" id="<?php echo esc_attr(WEVP_PREFIX . 'delay');?>" size="2" value="<?php echo esc_attr($delay)?>" data-wevc-default="<?php echo esc_attr($default_delay)?>"/>
	</label>
	<br>
	<small class="post-attributes-help-text"><?php esc_html_e('Number of milliseconds until video appears, 1000 = 1 second.', 'video-callout')?></small>
</p>





<p class="post-attributes-label-wrapper">
	<label class="post-attributes-label"><?php esc_html_e('Display frequency period', 'video-callout')?>
	<br>
	<select name="<?php echo WEVP_PREFIX; ?>frequency_period" id="<?php echo WEVP_PREFIX; ?>frequency_period" data-wevc-default="<?php echo esc_attr($default_frequency_period)?>">
	<option value="0" <?php selected($frequency_period, "0"); ?>><?php esc_html_e('Always show', 'video-callout'); ?></option>
	<option value="1" <?php selected($frequency_period, "1"); ?>><?php esc_html_e('second', 'video-callout'); ?></option>
	<option value="2" <?php selected($frequency_period, "2"); ?>><?php esc_html_e('minute', 'video-callout'); ?></option>
	<option value="3" <?php selected($frequency_period, "3"); ?>><?php esc_html_e('hour', 'video-callout'); ?></option>
	<option value="4" <?php selected($frequency_period, "4"); ?>><?php esc_html_e('day', 'video-callout'); ?></option>
	</select>
	</label>
	<br>
	<small class="post-attributes-help-text"><?php
	esc_html_e('Time period before redisplay', 'video-callout');
	?></small>
</p>

<p class="post-attributes-label-wrapper">
	<label class="post-attributes-label"><?php esc_html_e('Display frequency range', 'video-callout')?>
	<br>
	<input type="number" min="0" name="<?php
	echo WEVP_PREFIX;
	?>frequency_range" id="<?php
	echo WEVP_PREFIX;
	?>frequency_range" size="2" value="<?php
	echo esc_attr($frequency_range);
	?>" data-wevc-default="<?php
	echo esc_attr($default_frequency_range);
	?>" data-periods="<?php
	// bar seperated list of translated strings
	$attrs =
		__('How long before redisplay in seconds', 'video-callout') . '|' .
		__('How long before redisplay in minutes', 'video-callout') . '|' .
		__('How long before redisplay in hours', 'video-callout') . '|' .
		__('How long before redisplay in days', 'video-callout');
		echo esc_attr($attrs);
	?>"/>
	</label>
	<small class="post-attributes-help-text" id="<?php echo WEVP_PREFIX; ?>help_prefix_frequency_range">
	<br>
	<?php
	echo ' <span id="' . esc_attr(WEVP_PREFIX . 'help_suffix_frequency_range') .'"></span>';
	?></small>
</p>

<p class="post-attributes-label-wrapper">
	<label class="post-attributes-label">
		<input
			type="checkbox"
			name="<?php echo WEVP_PREFIX;?>mute"
			id="<?php echo WEVP_PREFIX;?>mute"
			value="1"<?php echo ($mute ? " checked" : ''); ?>
			data-wevc-default="<?php echo esc_attr($default_mute)?>"
		/>
		<?php esc_html_e('Mute', 'video-callout')?>
	</label>
</p>





</div>
</div>

<div id="wevideopopup-meta-box-advanced" class="postbox closed">
<div class="postbox-header"><div class="handlediv" style="width:100%"><h2><span class="dashicons dashicons-admin-settings"></span> <?php esc_html_e('Configure', 'video-callout')?></h2></div>
	<div class="handle-actions hide-if-no-js">
		<button type="button" class="handlediv" aria-expanded="false">
			<span class="screen-reader-text">Toggle panel: Video Callout advanced</span>
			<span class="toggle-indicator" aria-hidden="true"></span>
		</button>
	</div>
</div>
<div class="inside">

<p class="post-attributes-label-wrapper">
	<label class="post-attributes-label">Width
	<br>
	<input type="number" min="0" name="<?php echo WEVP_PREFIX; ?>width" id="<?php echo WEVP_PREFIX; ?>width" size="4" placeholder="<?php echo esc_attr($defaults['styles']['frame']['width']); ?>" value="<?php echo esc_attr($advanced['width']); ?>"  data-wevc-default="<?php echo esc_attr($default_width); ?>"/>
	</label>
	<br>
	<small class="post-attributes-help-text">Width of video in px.</small>
	<br>
	<label class="post-attributes-label">Height<br>
	<input type="number" min="0" name="<?php echo WEVP_PREFIX; ?>height" id="<?php echo WEVP_PREFIX; ?>height" size="4" placeholder="<?php echo esc_attr($defaults['styles']['frame']['height']); ?>" value="<?php echo esc_attr($advanced['height']); ?>"  data-wevc-default="<?php echo esc_attr($default_height); ?>"/>
	</label>
	<br>
	<small class="post-attributes-help-text">Height of video in px.</small>
</p>
<?php
VideoCalloutAdmin::render_settings_position_table($advanced['pin'], false, WEVP_PREFIX . 'pin');
?>
<p class="post-attributes-label-wrapper">
	<label class="post-attributes-label">CSS Class<br>
	<input class="widefat" type="text" name="<?php echo WEVP_PREFIX; ?>class" id="<?php echo WEVP_PREFIX; ?>class" value="<?php echo esc_attr($class); ?>" />
	</label><br>
	<small class="post-attributes-help-text">
	Optional css classes to apply to popup
	</small>
</p>
</div>
</div>
</div>
<script>
document.addEventListener('DOMContentLoaded', () => {
	WEVC_AdminPreview.makeMeta();
});
</script>