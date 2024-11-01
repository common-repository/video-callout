<?php

namespace WebEngineLimited;

/**
 * Plugin functions.
 */
class VideoCallout {

	/**
	 * Video type: YouTube.
	 */
	public const TYPE_YOUTUBE = 'youtube';
	/**
	 * Video type: GoogleDrive.
	 */
	public const TYPE_GOOGLE_DRIVE = 'googleDrive';
	/**
	 * Video type: Vimeo.
	 */
	public const TYPE_VIMEO = 'vimeo';
	/**
	 * Prefix for meta keys, field IDs etc.
	 */
	private $prefix = WEVP_PREFIX;

	public const ADVANCED_FIELDS = ['width', 'height', 'pin', 'modal'];
	/**
	 * Constructor.
	 */
	public function __construct() {
		// Inject video HTML into content.
		add_action('wp_footer', [$this, 'videoHtml']);

		// Inject sample video HTML into settings page.
		add_filter('we_video_popup_html', [$this, 'getVideoHtml'], 10, 2);

		// Hook in to add script and style only when needed.
		add_action('wp_enqueue_scripts', [$this, 'addScriptAndStyle'], 99);

		// Hook in to add script and style to admin pages.
		add_action('admin_enqueue_scripts', [$this, 'addAdminScriptAndStyle']);

		// Add snippet to footer to load the videos.
		// add_action('wp_footer', [$this, 'addScriptSnippet']);
	}
	public static function HasCallout() {
		$id = get_queried_object_id();
		if ($id) {
			$check = get_post_custom_values(WEVP_PREFIX . 'video_id', $id);
			return (bool) is_array($check) && $check[0];
		} else {
			return false;
		}
	}
	public static function LoadGlobals($defaults=false) {
		//::TODO:: move all data into one JSON field no need for files or duplicate fields??
		// however - this approach means we can centrally manage style and selectively override
		$upload_dir = wp_upload_dir(); // <- TODO - audit the need for this vs settings variables
		$upload_dir = $upload_dir['basedir'] . '/video-callout';
		// customer version
		$file = $upload_dir . '/global.json';
		if (!is_file($file)) {
			// fallback to the plugin supplied defaults
			$file = dirname(__DIR__) . '/assets/defaults.json';
		}
		// site options - override global settings
		$frequency_period = intval(get_option(WEVP_PREFIX . 'frequency_period', 0));
		$frequency_range = intval(get_option(WEVP_PREFIX . 'frequency_range', 0));
		$mute = (get_option(WEVP_PREFIX . 'mute', 'false') === '1') ? true : false;
		$autoplay = (get_option(WEVP_PREFIX . 'autoplay', 'false') === '1') ? true : false;
		$delay = intval(get_option(WEVP_PREFIX . 'delay', '0'));
		$extra_classes = get_option(WEVP_PREFIX . 'custom-class', '');
		$modal = get_option(WEVP_PREFIX . 'modal-window') ? true : false;
		// fixed site data
		$video_data = json_decode(file_get_contents($file), true);
		$video_data['site_url']  = get_site_url();
		$video_data['settings_url'] = menu_page_url('video-callout', false);
		$video_data['plugin_url'] = plugin_dir_url(dirname(__DIR__));
		$video_data['promo'] = '<div class="wevc_promo"><small>' . __('Video Callout - a free plugin by <a href="https://www.web-engineer.co.uk/video-callout">Web-Engineer</a>', 'video-callout') . '</small></div>';
		// post specific if available

		if (get_the_ID() > 0) {
			$id = get_the_ID();
			$custom = get_post_custom($id);
		} else {
			$id = get_queried_object_id();
			$custom = ($id ? get_post_custom($id) : false);
		}




		$video_id = '';
		$key = '';
		$video_type = '';

		// keep some site options/defaults for auto-filling any values on the frontend where the user can clear the input
		$video_data['globalSettings'] = [
			'delay' => $delay,
			'autoplay' => $autoplay,
			'frequency_period' => $frequency_period,
			'frequency_range' => $frequency_range,
			'mute' => $mute,
			'extra_classes' => $extra_classes,
			'modal' => $modal,
		];

		if (($custom) && (!$defaults)) {
			// override with any post specific data
			$video_id = isset($custom[WEVP_PREFIX . 'video_id']) ? $custom[WEVP_PREFIX . 'video_id'][0] : '';
			// Get time from url
			$url = $video_id;

			list($video_id, $video_type) = VideoCallout::ParseVideoInfo(
				isset($video_id)
					? $video_id
					: ''
			);
			$key = md5($video_id . $video_type);

			$video_type != self::TYPE_VIMEO ?: $url = str_replace('#','&?', $url);

			$parts = parse_url($url);
			if ( ($parts) && (array_key_exists('query',$parts)) ){ parse_str($parts['query'], $queryparams); }
			$video_data['starttime'] = isset($queryparams['t']) ? $queryparams['t'] : '0';

			$autoplay = isset($custom[WEVP_PREFIX . 'autoplay']) && ($custom[WEVP_PREFIX . 'autoplay'][0]) ? true : $autoplay;
			$delay = isset($custom[WEVP_PREFIX . 'delay']) ? intval($custom[WEVP_PREFIX . 'delay'][0]) : $delay;
			$frequency_period = isset($custom[WEVP_PREFIX . 'frequency_period']) ? intval($custom[WEVP_PREFIX . 'frequency_period'][0]) : $frequency_period;
			$frequency_range = isset($custom[WEVP_PREFIX . 'frequency_range']) ? intval($custom[WEVP_PREFIX . 'frequency_range'][0]) : $frequency_range;
			$mute = ((isset($custom[WEVP_PREFIX . 'mute'])) && ($custom[WEVP_PREFIX . 'mute'][0])) ? true : $mute;
			$extra_classes = isset($custom[WEVP_PREFIX . 'class']) ? $custom[WEVP_PREFIX . 'class'][0] : $extra_classes;
			$video_data['styles']['window']['z-index'] = get_option(WEVP_PREFIX . 'z-index',100000);

			if ((isset($custom[WEVP_PREFIX . 'advanced']))) {
				// no idea why this is an array!
				// Array ( [0] => {"width":"800","height":"","pin":"","modal":""} )
				$advanced = json_decode($custom[WEVP_PREFIX . 'advanced'][0], true);
				if (is_null($advanced)) {
					$advanced = [];
				}
				if (array_key_exists('pin', $advanced)) {
					$video_data['styles']['window']['position'] = $advanced['pin'];
				}
				if (array_key_exists('width', $advanced) && ($advanced['width'] > 0)) {
					$video_data['styles']['frame']['width'] = (int) $advanced['width'];
				} else {
					$video_data['styles']['frame']['width'] =  (int) get_option(WEVP_PREFIX . 'width', 800);
				}
				if (array_key_exists('height', $advanced) && ($advanced['height'] > 0)) {
					$video_data['styles']['frame']['height'] = (int) $advanced['height'];
				} else {
					$video_data['styles']['frame']['height'] =  (int) get_option(WEVP_PREFIX . 'height', 640);
				}
				if (array_key_exists('modal', $advanced) && is_bool($advanced['modal'])) {
					$video_data['styles']['window']['modal'] = (bool) $advanced['modal'];
				}

			}

		} else {
			// 803!!!
			// height: 683px; width: 840px;
			// some defaults from globals
			$video_data['styles']['frame']['width'] =  (int) get_option(WEVP_PREFIX . 'width', 800);
			$video_data['styles']['frame']['height'] =  (int) get_option(WEVP_PREFIX . 'height', 640);
			$video_data['styles']['frame']['pin'] =  (int) get_option(WEVP_PREFIX . 'pin', 'bottom_right');
			$video_data['styles']['frame']['custom-class'] =  (int) get_option(WEVP_PREFIX . 'custom-class', '');
		}
		$video_data['id']        = $video_id;
		$video_data['key']       = $key;
		$video_data['type']      = $video_type; //::TODO:: type youtube did not append string when appended here

		$video_data['autoplay']  = $autoplay;
		// TODO - move all global defaults to [globlSettings]
		$video_data['mute']      = $mute;
		$video_data['frequency_period'] = max(0, $frequency_period);
		$video_data['frequency_range'] = max(0, $frequency_range);

		//overload frequencty from above
		$frequency = (int)$video_data['frequency_range'];
		if ($frequency_period > 1) {
			$frequency *= 60;
		}
		if ($frequency_period > 2) {
			$frequency *= 60;
		}
		if ($frequency_period > 3) {
			$frequency *= 24;
		}
		$video_data['frequency'] = max(0, $frequency);
		$video_data['delay']     = (int) $delay;
		//$video_data['site_url']  = get_site_url();

		$video_data['modal'] = $modal;
		// feed above into our default data
		$video_data['styles']['window']['class'] = $extra_classes;

		return $video_data;
	}

	public static function GenerateInlineCode($with_defaults = false) {
		//if (VideoCallout::HasCallout()) {
			$video_data = VideoCallout::LoadGlobals();
			if ($video_data !== '') {
				?>
				<script>
				// superglobal our tools
				document.addEventListener('DOMContentLoaded', () => {
					<?php
					if($with_defaults) {
						$defaults = VideoCallout::LoadGlobals($defaults=true);
						?>
						window.WEVC_DEFAULTS = <?php echo wp_json_encode($defaults) ?>;
						<?php
					} else {
						if (VideoCallout::HasCallout()) {
						?>
						new WEVC_VideoCallout(<?php echo wp_json_encode($video_data); ?>);
						<?php
						}
					}
					?>
					if (typeof WEVC_VideoCallout === 'function') {
						window.WEVC_VideoCallout = WEVC_VideoCallout;
					}
				});
				</script>
				<?php
			}
		//}
	}
	/**
	 *  Injects video popup content into page.
	 * this is the funtion hooked into the footer html
	 */
	public function videoHtml() {
		// wp_footer
		VideoCallout::GenerateInlineCode();
	}


	/**
	 * Add the plugin script and style IF the current page
	 * has a video ID.
	 */
	public function addScriptAndStyle($force = false) {
		$post = get_post();
		if (($force) || ((is_a($post, 'WP_Post')) && (get_post_custom_values($this->prefix . 'video_id', $post->id)))) {
			$plugin_url = plugin_dir_url(__DIR__);
			$plugin_path = plugin_dir_path(__DIR__);
			// will leave minification to external forces
			wp_register_script('video-callout-script', "{$plugin_url}assets/frontend.js", ['wp-i18n']);
			wp_enqueue_script(
				'video-callout-script',
				"{$plugin_url}assets/frontend.js",
				[],
				filemtime("{$plugin_path}assets/frontend.js")
			);
			wp_enqueue_style(
				'video-callout-style',
				"{$plugin_url}assets/style.css",
				[],
				filemtime("{$plugin_path}assets/style.css")
			);
		}
	}

	/**
	 * @access public
	 *
	 * Add the plugin script and style to admin pages where applicable.
	 */
	public function addAdminScriptAndStyle($hook_suffix) {
		if ('settings_page_video-callout' == $hook_suffix) {
			$this->addScriptAndStyle(true);
		}
	}


	/**
	 * Get video ID and type from video ID input.
	 *
	 * @param  string $video_id Video ID input.
	 * @return array  (ID, type constant).
	 */
	public static function ParseVideoInfo($video_id) {
		// Timestamp not present in url here?

		// If just an ID assume YouTube.
		if (preg_match("/^[a-zA-Z0-9\-_]{11}$/", $video_id)) {
			return [$video_id, self::TYPE_YOUTUBE];
		}

		// YouTube URL?
		if (preg_match("/\byoutu(\.be|be\.com)\b.*(\/|\?v=)([a-zA-Z0-9\-_]{11})/", $video_id, $parts)) {
			return [$parts[3], self::TYPE_YOUTUBE];
		}

		//TO CHECK
		// GoogleDrive URL?
		if (preg_match("/\bdrive\.google\.com\b.*(\/)([a-zA-Z0-9\-_]{33})(\/)/", $video_id, $parts)) {
			return [$parts[2], self::TYPE_GOOGLE_DRIVE];
		}

		// Vimeo URL?
		if (preg_match("/\bvimeo\.com\b.*\/([0-9]+)([^0-9].*)?$/", $video_id, $parts)) {
			return [$parts[1], self::TYPE_VIMEO];
		}

		return [false, false];
	}

	/**
	 * @access private
	 *
	 * Get frequency (how long until show again) from attributes.
	 *
	 * @param  string  $frequency Frequency input.
	 * @return integer Frequency in seconds.
	 */
	public static function ParseFrequency($frequency) {
		// For admin preview - always play.
		$frequency = strtolower(trim($frequency));
		if ('always' === $frequency) {
			return 0;
		}
		if (preg_match("/^([1-9][0-9]*)\s+(day|week|month|hour|minute)s?$/", $frequency, $parts)) {
			switch (rtrim($parts[2], 's')) {
				case 'minute':
					$multiplier = 1;
					break;
				case 'hour':
					$multiplier = 60;
					break;
				case 'day':
					$multiplier = 24 * 60;
					break;
				case 'week':
					$multiplier = 7 * 24 * 60;
					break;
				case 'month': // -ish
					$multiplier = 30 * 24 * 60;
					break;
			}
			return 60 * intval($parts[1]) * $multiplier;
		}
		return -1;
	}

	/**
	 * @access private
	 *
	 * Get delay (how long until video appears) from attributes.
	 *
	 * @param  string  $delay Delay input.
	 * @return integer Delay in milliseconds.
	 */
	private function parseDelay($delay) {
		if (-1 == $delay) {
			return -1;
		}
		$delay = strtolower(trim($delay));
		$delay = trim(preg_replace("/\s*dseconds?/", '', $delay));
		return preg_match('/^[1-9][0-9]?$/', $delay)
			? ($delay)
			: 0;
	}
}
