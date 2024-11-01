<?php

namespace WebEngineLimited;

use WebEngineLimited\VideoCallout;

/**
 * Plugin functions.
 */
class VideoCalloutAdmin {
	use VideoCalloutMeta;

	/**
	 * Plugin home page.
	 */
	public const HOME = 'https://www.web-engineer.co.uk';

	/**
	 * Plugin user guide URL.
	 */
	public const GUIDE_URL = '#TBD';
	public const PLUGIN_FILE = 'video-callout/video-callout.php';
	/**
	 * Minimum width of video, in pixels.
	 */
	public const MIN_WINDOW_DIMENSION = 120;

	/**
	 * Constructor.
	 * @access	public
	 */
	public function __construct() {
		// Add settings page to admin menu.
		if (is_admin()) {
			add_action('admin_menu', [$this, 'admin_menu']);
			// Setup admin elements.
			
			// Only want to run admin_init on the pages it needs to be ran on.
			// Before, got run on widgets page, which caused error message.
			global $pagenow;
			if( 
				($pagenow === 'post.php') || 
				($pagenow == 'options-general.php') || 
				($pagenow == 'options.php') || 
				($pagenow == 'dashboard.php') ||
				($pagenow == 'admin.php')
			) {
				add_action('admin_init', [$this, 'admin_init']);
			}
			// Add dashboard widget.
			add_action('wp_dashboard_setup', [$this, 'dashboard_widget']);
			add_filter('plugin_action_links_' . VideoCalloutAdmin::PLUGIN_FILE, [$this, 'plugin_action_links']);
			add_filter('plugin_row_meta', [$this, 'plugin_meta_links'], 10, 2);
			add_action('admin_enqueue_scripts', [$this, 'add_admin_scripts'], 10, 1);

		}
		add_action('init', [$this, 'init']);

	}
	public function init() {
		if ($this->is_gutenberg_editor()) {
			$this->meta_init();
		}
	}
	public function is_gutenberg_editor() {
		// Gutenberg plugin is installed and activated.
		$gutenberg = ! ( false === has_filter( 'replace_editor', 'gutenberg_init' ) );

		// Block editor since 5.0.
		$block_editor = version_compare( $GLOBALS['wp_version'], '5.0-beta', '>' );

		if ( ! $gutenberg && ! $block_editor ) {
			return false;
		}

		if ( $this->is_classic_editor_plugin_active() ) {
			$editor_option       = get_option( 'classic-editor-replace' );
			$block_editor_active = array( 'no-replace', 'block' );

			return in_array( $editor_option, $block_editor_active, true );
		}

		return true;
	}
	/**
	 * Check if Classic Editor plugin is active.
	 *
	 * @return bool
	 */
	public function is_classic_editor_plugin_active() {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			include_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		if ( is_plugin_active( 'classic-editor/classic-editor.php' ) ) {
			return true;
		}

		return false;
	}
	// public function checkPostData($post_id){

	// }
	public function add_admin_scripts($hook = '') {
		if ($hook === 'post-new.php' || $hook === 'post.php') {
			$this->admin_scripts($hook);
		}
	}
	/**
	 * Add the settings page to the admin menu.
	 * @access	public
	 */
	public function admin_menu() {
		add_options_page(__('Video Callout', 'video-callout'), __('Video Callout', 'video-callout'), 'manage_options', 'video-callout', [$this, 'settings_page']);
	}

	/**
	 * Add the dashboard widget.
	 * @access	public
	 */
	public function dashboard_widget() {
		wp_add_dashboard_widget('custom_help_widget', __('Video Callout', 'video-callout'), [$this, 'custom_dashboard']);
	}

	/**
	 * @access	public
	 * @static
	 * Render plugin dashboard widget.
	 */
	public function custom_dashboard() {
		/**
		 * Dashboard template.
		 */
		include __DIR__ . '/view/dashboard.php';
	}

	/**
	 * Admin page setup functions. Hooked into admin_init.
	 * @access	public
	 */
	public function admin_init() {
		$this->add_settings();
		global $pagenow;
		// instead define the metabox with
		// '__block_editor_compatible_meta_box' => false,
		// see - https://developer.wordpress.org/block-editor/how-to-guides/metabox/#step-1-register-meta-field
		// Save the meta box contents when the post is saved.
		add_action('save_post', [$this, 'saveMetaBox']);
		//::KLUDGE:: this is while "new way" is being worked on
		if (!$this->is_gutenberg_editor()) {
			//::TODO:: REMOVE true || above when gutenberg is working
			// ---
			// Add a "traditional" meta box to the page editor.
			add_action('add_meta_boxes', [$this, 'addMetaBox']);
		}
		if($this->is_gutenberg_editor()) {
			// guttenberg style!
			// $this->gutenberg_init();
			add_action( 'enqueue_block_editor_assets', [$this, 'gutenberg_block_editor_init']);
		}
	}

	/**
	 * Add and register settings.
	 * @access	public
	 */
	public function add_settings() {
		// settings groups
		// Playback
		// window
		// frame
		// closer
		add_settings_section(
			'we_video_popup_settings_section_playback', //id
			__('Playback', 'video-callout'), //title
			[$this, 'render_settings_section_playback'],
			'we_video_popup_settings_group' //page to show the settinsg
		);
		add_settings_section(
			'we_video_popup_settings_section_window', //id
			__('Window', 'video-callout'), //title
			[$this, 'render_settings_section_window'],
			'we_video_popup_settings_group' //page to show the settinsg
		);
		add_settings_section(
			'we_video_popup_settings_section_frame', //id
			__('Frame', 'video-callout'), //title
			[$this, 'render_settings_section_frame'],
			'we_video_popup_settings_group' //page to show the settinsg
		);
		add_settings_section(
			'we_video_popup_settings_section_closer', //id
			__('Closer', 'video-callout'), //title
			[$this, 'render_settings_section_closer'],
			'we_video_popup_settings_group' //page to show the settinsg
		);
		//---------------------------------------------------------------------------
		// Playback
		//---------------------------------------------------------------------------
		add_settings_field(
			'wevp_autoplay',
			__('Autoplay', 'video-callout'),
			[$this, 'render_settings_checkbox_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_playback',
			['field' => 'autoplay']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'autoplay',
			['default' => false, 'sanitize_callback' => [$this, 'sanitizeCheckbox']]
		);


		add_settings_field(
			'wevp_delay',
			__('Delay', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_playback',
			['field' => 'delay']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'delay',
			['default' => 3000, 'sanitize_callback' => [$this, 'sanitiseDelay']]
		);

		// add_settings_field(
		// 	'wevp_frequency',
		// 	__('Display frequency', 'video-callout'),
		// 	[$this, 'render_settings_text_field'],
		// 	'we_video_popup_settings_group',
		// 	'we_video_popup_settings_section_playback',
		// 	['field' => 'frequency']
		// );
		// register_setting(
		// 	'we_video_popup_settings_group',
		// 	WEVP_PREFIX . 'frequency',
		// 	['default' => "always", 'sanitize_callback' => [$this, 'sanitiseFrequency']]
		// );
		add_settings_field(
			'wevp_frequency_period',
			__('Display frequency period', 'video-callout'),
			[$this, 'render_settings_select_frequency_period'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_playback',
			['field' => 'frequency_period']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'frequency_period',
			['default' => "0"] // 0 = always
		);
		add_settings_field(
			'wevp_frequency_range',
			__('Redisplay duration', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_playback',
			['field' => 'frequency_range']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'frequency_range',
			['default' => "0", 'sanitize_callback' => 'absint']
		);
		add_settings_field(
			'wevp_mute',
			__('Mute', 'video-callout'),
			[$this, 'render_settings_checkbox_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_playback',
			['field' => 'mute']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'mute',
			['default' => false, 'sanitize_callback' => [$this, 'sanitizeCheckbox']]
		);
		//---------------------------------------------------------------------------
		// Window
		//---------------------------------------------------------------------------
		add_settings_field(
			'wevp_pin',
			__('Position', 'video-callout'),
			[$this, 'render_settings_position_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_window',
			[]
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'pin',
			['default' => 'bottom-right', 'sanitize_callback' => [$this, 'sanitizePin']]
		);

		add_settings_field(
			'wevp_modal_window',
			__('Modal window', 'video-callout'),
			[$this, 'render_settings_checkbox_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_window',
			['field' => 'modal-window']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'modal-window',
			['default' => false, 'sanitize_callback' => [$this, 'sanitizeCheckbox']]
		);

		add_settings_field(
			'wevp_modal_background',
			__('Modal Background', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_window',
			['field' => 'modal-background']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'modal-background',
			['default' => '#0006']
		);

		add_settings_field(
			'wevp_modal_has_blur',
			__('Show modal blur', 'video-callout'),
			[$this, 'render_settings_checkbox_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_window',
			['field' => 'modal-has-blur']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'modal-has-blur',
			['default' => false, 'sanitize_callback' => [$this, 'sanitizeCheckbox']]
		);

		add_settings_field(
			'wevp_modal_blur',
			__('Modal blur', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_window',
			['field' => 'modal-blur']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'modal-blur',
			['default' => 5, 'sanitize_callback' => 'absint']
		);

		add_settings_field(
			'wevp_custom_class',
			__('CSS Class', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_window',
			['field' => 'custom-class']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'custom-class'
		);
		add_settings_field(
			'wevp_z_index',
			__('Z-Index', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_window',
			['field' => 'z-index']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'z-index'
		);
		// add_settings_field(
		// 	'wevp_preview',
		// 	'Preview',
		// 	[$this, 'render_settings_preview'],
		// 	'we_video_popup_settings_group',
		// 	'we_video_popup_settings_section_window',
		// 	[]
		// );

		//---------------------------------------------------------------------------
		// Frame
		//---------------------------------------------------------------------------
		add_settings_field(
			'wevp_width',
			__('Default width', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'width']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'width',
			['default' => 640, 'sanitize_callback' => [$this, 'sanitiseMinDimension']]
		);
		add_settings_field(
			'wevp_height',
			__('Default height', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'height']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'height',
			['default' => 480, 'sanitize_callback' => [$this, 'sanitiseMinDimension']]
		);

		add_settings_field(
			'wevp_margin',
			__('Margin', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'margin']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'margin',
			['default' => 10, 'sanitize_callback' => 'absint']
		);

		add_settings_field(
			'wevp_padding',
			__('Padding', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'padding']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'padding',
			['default' => 10, 'sanitize_callback' => 'absint']
		);

		add_settings_field(
			'wevp_background',
			__('Background', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'background']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'background',
			['default' => '#FFF']
		);
		add_settings_field(
			'wevp_frame_has_shadow',
			__('Show shadow', 'video-callout'),
			[$this, 'render_settings_checkbox_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'frame-has-shadow']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'frame-has-shadow',
			['default' => true, 'sanitize_callback' => [$this, 'sanitizeCheckbox']]
		);
		add_settings_field(
			'wevp_shadow_colour',
			__('Shadow color', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'shadow-color']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'shadow-color',
			['default' => '#0006']
		);

		add_settings_field(
			'wevp_shadow_blur',
			__('Shadow blur', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'shadow-blur']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'shadow-blur',
			['default' => 10, 'sanitize_callback' => 'absint']
		);
		add_settings_field(
			'wevp_shadow_hoffset',
			__('Shadow h-offset', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'shadow-hoffset']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'shadow-hoffset',
			['default' => 0]
		);
		add_settings_field(
			'wevp_shadow_voffset',
			__('Shadow v-offset', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_frame',
			['field' => 'shadow-voffset']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'shadow-voffset',
			['default' => 0]
		);
		//---------------------------------------------------------------------------
		// Closer
		//---------------------------------------------------------------------------
		add_settings_field(
			'wevp_close_show',
			__('Show', 'video-callout'),
			[$this, 'render_settings_checkbox_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-show']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-show',
			['default' => true, 'sanitize_callback' => [$this, 'sanitizeCheckbox']]
		);
		add_settings_field(
			'wevp_close_btn_size',
			__('Overall size', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-btn-size']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-btn-size',
			['default' => 30, 'sanitize_callback' => 'absint']
		);

		add_settings_field(
			'wevp_close_btn_background',
			__('Background', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-btn-background']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-btn-background',
			['default' => '#C00']
		);

		add_settings_field(
			'wevp_close_btn_foreground',
			__('Icon color', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-btn-foreground']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-btn-foreground',
			['default' => '#FFF']
		);
		add_settings_field(
			'wevp_close_has_shadow',
			__('Show shadow', 'video-callout'),
			[$this, 'render_settings_checkbox_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-has-shadow']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-has-shadow',
			['default' => true, 'sanitize_callback' => [$this, 'sanitizeCheckbox']]
		);
		add_settings_field(
			'wevp_closer_shadow_blur',
			__('Shadow blur', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-shadow-blur']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-shadow-blur',
			['default' => 1, 'sanitize_callback' => 'absint']
		);
		add_settings_field(
			'wevp_closer_shadow_hoffset',
			__('Shadow h-offset', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-shadow-hoffset']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-shadow-hoffset',
			['default' => 0]
		);
		add_settings_field(
			'wevp_closer_shadow_voffset',
			__('Shadow v-offset', 'video-callout'),
			[$this, 'render_settings_number_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-shadow-voffset']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-shadow-voffset',
			['default' => 0]
		);
		add_settings_field(
			'wevp_closer_shadow_colour',
			__('Shadow color', 'video-callout'),
			[$this, 'render_settings_text_field'],
			'we_video_popup_settings_group',
			'we_video_popup_settings_section_closer',
			['field' => 'close-shadow-color']
		);
		register_setting(
			'we_video_popup_settings_group',
			WEVP_PREFIX . 'close-shadow-color',
			['default' => 'rgba(0,0,0,0.3)']
		);
	}

	/**
	 * Rendering callback for number-type fields.
	 * @access	public
	 * @param	$args	Field args. Will contain field name to determine which
	 * 					field to render, for field-specific HTML.
	 */
	public function render_settings_number_field($args) {
		$field = $args['field'];
		$attrs = '';
		switch ($field) {
			case 'delay':
				$ext = 'ms';
				$help_text = __('Time before the callout appears in milliseconds (ms), 1000ms = 1 second.', 'video-callout');
				break;
			case 'width':
				$ext = 'px';
				$help_text = __('Changes the default width of the callout container.', 'video-callout');
				break;
			case 'height':
				$ext = 'px';
				$help_text = __('Changes the default height of the callout container.', 'video-callout');
				break;
			case 'margin':
				$ext = 'px';
				$help_text = __('How far from the edges of the page the window will be placed.', 'video-callout');
				break;
			case 'padding':
				$ext = 'px';
				$help_text = __('Space between the outer edge of the callout and the video it contains.', 'video-callout');
				break;
			case 'shadow-blur':
				$ext = 'px';
				$help_text = __('How much to blur?', 'video-callout');
				break;
			case 'shadow-hoffset':
				$ext = 'px';
				$help_text = __('Horizontal offset.', 'video-callout');
				break;
			case 'shadow-voffset':
				$ext = 'px';
				$help_text = __('Vertical offset.', 'video-callout');
				break;
			case 'close-btn-size':
				$ext = 'px';
				$help_text = __('How large should the close button be?', 'video-callout');
				break;
			case 'close-shadow-blur':
				$ext = 'px';
				$help_text = __('How much to blur the shadow?', 'video-callout');
				break;
			case 'close-shadow-hoffset':
				$ext = 'px';
				$help_text = __('Horizontal offset.', 'video-callout');
				break;
			case 'close-shadow-voffset':
				$ext = 'px';
				$help_text = __('Vertical offset.', 'video-callout');
				break;
			case 'z-index':
				$ext = "";
				$attrs = ' placeholder="100000"';
				$help_text = __('If you want to change the stacking order you can change it here', 'video-callout');
				break;
			case 'modal-blur':
				$ext = 'px';
				$help_text = __('How much to blur?', 'video-callout');
				break;			

			default:
				$ext = '';
				$help_text = '';
		}
		$field = WEVP_PREFIX . $field;
		if (!empty($ext)) {
			?>
			<input type="number" name="<?php echo esc_attr($field); ?>" id="<?php echo esc_attr($field); ?>" value="<?php echo esc_attr(get_option($field)); ?>"<?php echo $attrs; ?>/><?php echo esc_html($ext); ?><br>
			<?php
		} else {
			?>
			<input type="number" name="<?php echo esc_attr($field); ?>" id="<?php echo esc_attr($field); ?>" value="<?php echo esc_attr(get_option($field)); ?>"<?php echo $attrs; ?>/>
			<?php
		}

		if (!empty($help_text)) {
			?>
			<small class="post-attributes-help-text">
			<?php
			// translation happened above
			echo esc_html($help_text);
			?>
			</small>
			<?php
		}
	}
	public function render_settings_select_frequency_period($args){
		$field = $args['field'];
		$field = WEVP_PREFIX . $field;
		?>
        <select name="<?php echo esc_attr($field); ?>" id="<?php echo esc_attr($field); ?>">
          <option value="0" <?php selected(get_option($field), "0"); ?>><?php esc_html_e('Always show', 'video-callout'); ?></option>
          <option value="1" <?php selected(get_option($field), "1"); ?>><?php esc_html_e('Seconds', 'video-callout'); ?></option>
          <option value="2" <?php selected(get_option($field), "2"); ?>><?php esc_html_e('Minutes', 'video-callout'); ?></option>
          <option value="3" <?php selected(get_option($field), "3"); ?>><?php esc_html_e('Hours', 'video-callout'); ?></option>
		  <option value="4" <?php selected(get_option($field), "4"); ?>><?php esc_html_e('Days', 'video-callout'); ?></option>
        </select>
		<br/>
		<small class="post-attributes-help-text">
		<?php
		esc_html_e('Time before the callout is shown again.', 'video-callout');
		?>
		</small>
		<?php
	}
	/**
	 * Rendering callback for textbox fields.
	 * @access	public
	 * @param	$args	Field args. Will contain field name to determine which
	 * 					field to render, for field-specific HTML.
	 */
	public function render_settings_text_field($args) {
		$field = $args['field'];
		$attrs = false; // set to true if color picker requried, else its data-frequency required or nohting!
		switch ($field) {
			case 'background':
				$attrs = true;
				$help_text = __('The background color of the callout and the padding around the video.', 'video-callout');
				break;
			case 'close-shadow-color':
				$attrs = true;
				$help_text = __('', 'video-callout');
				break;
			case 'shadow-color':
				$attrs = true;
				$help_text = __('The color of the shadow cast by the callout.', 'video-callout');
				break;
			case 'close-btn-background':
				$attrs = true;
				$help_text = __('Button background color.', 'video-callout');
				break;
			case 'close-btn-foreground':
				$attrs = true;
				$help_text = __('Button foreground color.', 'video-callout');
				break;
			case 'modal-background':
				$attrs = true;
				$help_text = __('The color of the overlay.', 'video-callout');
				break;
			case 'custom-class':
				$help_text = __('Optional CSS classes to apply to the callout (can be overridden on the page or post).', 'video-callout');
				break;
			case 'frequency_range':
				$help_text = '-'; // N/A in this case - todo - inline the output here may be clearer
				$attrs =
					__('How long before redisplay in seconds', 'video-callout') . '|' .
					__('How long before redisplay in minutes', 'video-callout') . '|' .
					__('How long before redisplay in hours', 'video-callout') . '|' .
					__('How long before redisplay in days', 'video-callout');
				break;
					default:
					$help_text = '';
			}
		?>
		<input type="text" name="<?php echo esc_attr(WEVP_PREFIX .$field); ?>" id="<?php echo esc_attr(WEVP_PREFIX .$field); ?>" <?php
		if($field === 'frequency_range') {
			//
			echo 'data-periods="' . esc_attr($attrs) . '"';
		} elseif(true === $attrs) {
			echo 'class="color-picker" data-alpha-enabled="true"';
		}
		echo 'value="'. esc_attr(get_option(WEVP_PREFIX . $field)) . '"';?>
		/>
		<?php
		if (!empty($help_text)) {
			?>
			<small class="post-attributes-help-text" id="<?php echo esc_attr(WEVP_PREFIX . 'help_prefix_' . $field); ?>">
			<?php
			if($field === 'frequency_range') {
				?><br><?php
			}
			if($field === 'frequency_range') {
				// no longer a "suffix" entire string will be placed here
				//wevideopopup_help_suffix_frequency_range
				echo '<span data-test id="' . esc_attr(WEVP_PREFIX . "help_suffix_" . $field) . '"></span>';
			} else {
				echo esc_html($help_text);
			}
			?>
			</small>
			<?php
		}

	}

	/**
	 * Rendering callback for checkbox fields.
	 * @access	public
	 * @param	$args	Field args. Will contain field name to determine which
	 * 					field to render, for field-specific HTML.
	 */
	public function render_settings_checkbox_field($args) {
		$field = $args['field'];
		switch ($field) {
			case 'modal-window':
				$help_text = __('When enabled the content of the page will be blocked by an overlay.', 'video-callout');
				break;
			case 'modal-has-blur':
				$help_text = __('When enabled the content of the page will be blurred', 'video-callout');
				break;
			default:
				$help_text = '';
		}
		$field = WEVP_PREFIX . $field;
		?>
		<input type="checkbox" name="<?php echo esc_attr($field); ?>" id="<?php echo esc_attr($field); ?>" <?php checked(get_option($field)); ?> />
		<?php
		if (!empty($help_text)) {
			?>
			<small class="post-attributes-help-text">
			<?php
			echo esc_html($help_text);
			?>
			</small>
			<?php
		}

		?>
		<?php
	}
	public function render_settings_position_field() {
		self::render_settings_position_table();
	}
	/**
	 * Rendering callback for position pin field group.
	 * @access	public
	 */
	public static function render_settings_position_table($value = '', $opt = true, $option = null) {
		//
		$default = '';
		if ($opt) {
			$value = get_option(WEVP_PREFIX . 'pin');
			$option = WEVP_PREFIX . 'pin';
		} else {
			// used in post - disable the global option
			$default = get_option(WEVP_PREFIX . 'pin');
		}
		// convert below to calls to render_settings_position_table_opt
		?>
		<table class="pin">
			<tr>
				<?php
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'top-left');
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'top-centre');
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'top-right');
				?>
			</tr>
			<tr>
				<?php
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'middle-left');
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'middle-centre');
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'middle-right');
				?>
			</tr>
			<tr>
				<?php
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'bottom-left');
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'bottom-centre');
				echo VideoCalloutAdmin::render_settings_position_table_option($option, $value, $default, 'bottom-right');
				?>
			</tr>
		</table>
		<?php
		if ($default !== '') {
			?>
			<small class="post-attributes-help-text">This sets the position on the screen where the popup will appear. The default position is shown in <span style="background: #8bc34a; color: white;padding: 2px 4px;border: 1px solid #999999;">green</span></small>
			<?php
		} else {
			?>
			<small class="post-attributes-help-text">This sets the position on the screen where the popup will appear.</small>
			<?php
		}
	}

	public static function render_settings_position_table_option($name, $value, $default, $option) {
		// show symbol instead to indicate a default option of $global === $value
		// if value is not set then use default instead
		// if this is the default add "default class to cell"
		$ins = $default === $option ? 'style="background: #8bc34a"' : '';
		$ret =  '<td ' . $ins . '><input type="radio" name="' . $name . '" value="' . $option . '"';
		$ret .= checked($value ? $value : $default, $option, false);
		$ret .= '/></td>';
		return $ret;
	}
	/**
	 * Rendering callback for preview 'field'. Adds HTML for launching
	 * video player preview with current settings from form.
	 * @access	public
	 */
	public function render_settings_preview() {
		// <a data-wevc-preview>preview <span class="dashicons dashicons-visibility"></span></a>
		?>
		<a class="we-vp-preview" data-wevc-preview><?php esc_html_e('Preview', 'video-callout'); ?><span class="dashicons dashicons-format-video" style="margin-top:4px"></span></a>
		<?php
	}
	/**
	 * Callback for rendering opening of settings section.
	 * @access  public
	 */
	public function render_settings_section_playback() {
		?>
		<p><?php esc_html_e('Default playback settings such as timing. Note for autoplay to work you will need to select the "mute" option too.', 'video-callout');?></p>
		<?php
	}
	/**
	 * Callback for rendering opening of settings section.
	 * @access  public
	 */
	public function render_settings_section_window() {
		?>
		<p><?php esc_html_e('Callout position and it\'s relation to the page.', 'video-callout');?></p>
		<?php
	}

	/**
	 * Callback for rendering opening of settings section.
	 * @access  public
	 */
	public function render_settings_section_frame() {
		?>
		<p><?php esc_html_e('The frame containing the video.', 'video-callout')?></p>
		<?php
	}
	/**
	 * Callback for rendering opening of settings section.
	 * @access  public
	 */
	public function render_settings_section_closer() {
		?>
		<p><?php esc_html_e('The optional button attached to the top right of the callout for closing the window.  When not enabled clicking outside the Video Callout window will dismiss it.', 'video-callout')?></p>
		<?php
	}
	public function admin_scripts($hook = '') {
		add_action('admin_footer', [$this, 'videoSettings']);

		$plugin_url = plugin_dir_url(__DIR__);
		$plugin_path = plugin_dir_path(__DIR__);
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

		wp_register_style(
			'video-callout-settings',
			plugin_dir_url(__DIR__) . '/assets/settings.css',
			[],
			filemtime(plugin_dir_path(__DIR__) . '/assets/settings.css')
		);
		wp_enqueue_style('video-callout-settings');
		// add_action( 'admin_footer', [$this, 'footerAdminCode']); // For back-end
	}
	public function videoSettings() {
		VideoCallout::GenerateInlineCode(true);
	}
	/**
	 * Crete the plugin settings page.
	 * @access  public
	 */
	public function settings_page() {
		// Colour picker script.
		wp_register_script(
			'wp-color-picker-alpha',
			plugin_dir_url(__DIR__) . '/lib/js/wp-color-picker-alpha.js',
			['wp-color-picker']
		);
		wp_add_inline_script(
			'wp-color-picker-alpha',
			'jQuery( function() { jQuery( ".color-picker" ).wpColorPicker(); } );'
		);
		wp_enqueue_script('wp-color-picker-alpha');

		// // Settings page/preview script.
		// wp_register_script(
		// 	'video-callout-settings',
		// 	plugin_dir_url(__DIR__) . '/assets/settings.js',
		// 	['jquery'],
		// 	filemtime(plugin_dir_path(__DIR__) . '/assets/settings.js')
		// );
		// wp_enqueue_script('video-callout-settings');

		// Settings page/preview styles.

		$this->admin_scripts();
		// ::KLUDGE::
		// Currently regenerating the cached CSS from settings whenever
		// this page is rendered with itself as the referrer, suggesting
		// that the form was submitted. Ideally there's a hook to
		// update after all options on the form have been updated, but
		// I haven't found it (and don't want to update once for each
		// updated option using the individual option hooks).
		if ((isset($_REQUEST['settings-updated'])) && ($_REQUEST['page'] === "video-callout") ) {
			$this->update_global_settings();
		}
		
		// Page HTML.
		?>

			<p class="wevp-banner">
			<img class="we-vp-branding" src="<?php echo plugin_dir_url(__DIR__) . 'assets/image/vp-icon-colour.svg'; ?>" width="170" />
				<a href="<?php echo esc_url(self::HOME); ?>"><img src="<?php echo plugin_dir_url(__DIR__) . 'assets/image/we-logo.svg'; ?>" alt="Web-Engineer" style="width:220px" /></a><br>
				<?php
					echo wp_kses(
						sprintf(__('A Web-Engineer plugin. <a href="%s">Visit our site</a> for information on our range of services.', 'video-callout'), esc_url(self::HOME)),
						['a' => ['href' => [] ]]
					);
				?>
			</p>
			<div class="wrap we-vc-admin">

			<h1><?php esc_html_e('Video Callout', 'video-callout'); ?></h1>
			<?php settings_errors('we_video_popup_settings_save'); ?>

			<p><?php esc_html_e('Adjust the general appearance and defaults here. Other settings can be configured on each post and page when you add a video callout.', 'video-callout')?>
			<p><?php esc_html_e('Callouts are created from the Video Callout widget to the right of the post or page editor.', 'video-callout')?>
			<p><?php
			echo wp_kses(
				sprintf(__('For more information about this plugin see our  <a href="https://www.web-engineer.co.uk/video-callout">getting started guide.</a>', 'video-callout'), esc_url(self::HOME)),
				['a' => ['href' => [] ]]
			);
			?>
			<form action="options.php" method="post" class="we-vpop">
				<?php
				settings_fields('we_video_popup_settings_group');
				do_settings_sections('we_video_popup_settings_group');
				$this->render_settings_preview();
				submit_button();

				?>
			<script>
			document.addEventListener('DOMContentLoaded', () => {
				WEVC_AdminPreview.make();
			});
			</script>
			</form>
			<hr>
		</div>
		<?php
	}

	/**
	 * Sanitizing callback for the location pin field group.
	 * @access	public
	 * @param	string	$input	Field input.
	 * @return	string			Field input if valid, or default value.
	 */
	public function sanitizePin($input) {
		$input = sanitize_key($input);
		return preg_match("/^(top|middle|bottom)\-(left|centre|right)$/", $input)
			? $input
			: 'bottom-right';
	}

	/**
	 * Sanitizing callback for the video width field.
	 * @access	public
	 * @param	string	$input	Field input.
	 * @return	integer			Integer not less than the allowed minimum.
	 */
	public function sanitiseMinDimension($value) {
		return max(self::MIN_WINDOW_DIMENSION, intval($value));
	}
	public function sanitiseDelay($value) {
		return max(0, intval($value));
	}
	public function sanitiseFrequency($value) {
		if (-1 === VideoCallout::parseFrequency($value)) {
			$was = get_option(WEVP_PREFIX . 'frequency');
			$value = $was !== '' ? $was : 'always';
			add_settings_error("wevp_frequency", "frequency_error", __("Invalid frequency", 'video-callout'), "error");
		}
		return $value;
	}

	/**
	 * Sanitizing callback for checkbox fields.
	 * @access	public
	 * @param	mixed			Field input.
	 * @return	boolean			True if checkbox is checked.
	 */
	public function sanitizeCheckbox($input) {
		return (isset($input) ? true : false);
	}
	public function update_global_settings() {
		$defaults = json_decode(file_get_contents(dirname(__DIR__) . '/assets/defaults.json'), true);
		// apply new values then store in custoemr copy
		$defaults['styles']['window']['position']          = get_option(WEVP_PREFIX . 'pin', 'bottom-right');
		$defaults['styles']['window']['modal']             = (bool) get_option(WEVP_PREFIX . 'modal-window', false);
		$defaults['styles']['window']['showblur']          = (bool) get_option(WEVP_PREFIX . 'modal-has-blur', false);
		$defaults['styles']['window']['blur']              = (int)  get_option(WEVP_PREFIX . 'modal-blur', 5);
		$defaults['styles']['window']['background']        = get_option(WEVP_PREFIX . 'modal-background', 'rgba(0,0,0,0.3)');
		$defaults['styles']['window']['class']             = get_option(WEVP_PREFIX . 'custom-class', '');

		$defaults['styles']['frame']['width']              = (int) get_option(WEVP_PREFIX . 'width', 640);
		$defaults['styles']['frame']['height']             = (int) get_option(WEVP_PREFIX . 'height', 480);
		$defaults['styles']['frame']['margin']             = (int) get_option(WEVP_PREFIX . 'margin', 10);
		$defaults['styles']['frame']['padding']            = (int) get_option(WEVP_PREFIX . 'padding', 10);
		$defaults['styles']['frame']['background']         = get_option(WEVP_PREFIX . 'background', 'rgba(255,255,255,0.9)');
		$defaults['styles']['frame']['shadow']['show']     = get_option(WEVP_PREFIX . 'frame-has-shadow', true);
		$defaults['styles']['frame']['shadow']['hoffset']  = (int) get_option(WEVP_PREFIX . 'shadow-hoffset', 0);
		$defaults['styles']['frame']['shadow']['voffset']  = (int) get_option(WEVP_PREFIX . 'shadow-voffset', 0);
		$defaults['styles']['frame']['shadow']['blur']     = (int) get_option(WEVP_PREFIX . 'shadow-blur', '10');
		$defaults['styles']['frame']['shadow']['color']    = get_option(WEVP_PREFIX . 'shadow-color', 'rgba(0,0,0,0.6)');

		$defaults['styles']['closer']['size']              = (int) get_option(WEVP_PREFIX . 'close-btn-size', 30);
		$defaults['styles']['closer']['background']        = get_option(WEVP_PREFIX . 'close-btn-background', '#c00');
		$defaults['styles']['closer']['color']             = get_option(WEVP_PREFIX . 'close-btn-foreground', '#fff');
		$defaults['styles']['closer']['show']              = get_option(WEVP_PREFIX . 'close-show', true);
		$defaults['styles']['closer']['shadow']['show']    = get_option(WEVP_PREFIX . 'close-has-shadow', true);
		$defaults['styles']['closer']['shadow']['hoffset'] = (int) get_option(WEVP_PREFIX . 'close-shadow-hoffset', 0);
		$defaults['styles']['closer']['shadow']['voffset'] = (int) get_option(WEVP_PREFIX . 'close-shadow-voffset', 0);
		$defaults['styles']['closer']['shadow']['blur']    = (int) get_option(WEVP_PREFIX . 'close-shadow-blur', 0);
		$defaults['styles']['closer']['shadow']['color']   = get_option(WEVP_PREFIX . 'close-shadow-color', '#fff');

		$upload_dir = wp_upload_dir();
		$upload_dir = $upload_dir['basedir'] . '/video-callout';
		if (!is_dir($upload_dir)) {
			//TODO assert this is created and can be written to
			mkdir($upload_dir, 0755);
		}
		// Write CSS to file.
		$file = $upload_dir . '/global.json';
		file_put_contents($file, json_encode($defaults));
	}

	/**
	 * Add plugin_action_links
	 */
	public function plugin_action_links($links) {
		return array_merge(
			array(
				'<a href="' . admin_url('options-general.php?page=video-callout') . '" title="' . __('Video Callout Settings', 'video-callout') . '">' . __('Settings', 'video-callout') . '</a>'
			),
			$links
		);

		return $links;
	}

	/**
	 * Add plugin_row_meta links
	 */
	public function plugin_meta_links($links, $file) {
		if ($file == VideoCalloutAdmin::PLUGIN_FILE) {
			return array_merge(
				$links,
				array(
					'<a target="_blank" href="https://wordpress.org/support/plugin/video-callout">' . esc_html('Get Support', 'video-callout') . '</a>',
					'<a target="_blank" href="https://wordpress.org/support/plugin/video-callout/reviews/">' . esc_html('Leave a Review', 'video-callout') . '</a>',
					'<a target="_blank" href="https://www.web-engineer.co.uk/video-callout?ref=plugin-page">' . esc_html('More about this plugin', 'video-callout') . '</a>'
				)
			);
		}
		return $links;
	}
}
