<?php

namespace WebEngineLimited;

/**
 * using a trait to splut out functionality for easoer editing
 */
trait VideoCalloutMeta {
	/**
	 * @access public
	 *
	 * Add the meta box to the editor.
	 * ADMIN FUNCTION! to move
	 */
	public function addMetaBox() {
		// old style non gutenberg meta-box
		add_meta_box(
			'wevideopopup-meta-box',
			__('Video Callout'),
			[$this, 'metaBoxRender'],
			'',
			'side',
			'low'
		);

		// $this->doAddMetaBox('page');
		// $this->doAddMetaBox('post');
	}
	/**
	 * just a utility function to save a for loop and duplication
	 * ADMIN FUNCTION! to move
	 */
	// private function doAddMetaBox($which) {
	// 	add_meta_box(
	// 		'wevideopopup-meta-box',
	// 		__('Video Callout'),
	// 		[$this, 'metaBoxRender'],
	// 		$which,
	// 		'side',
	// 		'low'
	// 	);
	// }
	/**
	 * @access public
	 *
	 * Render the meta box.
	 */
	public function metaBoxRender($post) {
		include __DIR__ . '/view/meta-box.php';
	}
	/**
	 * @access public
	 *
	 * Wrapper to either update or delete a post meta field,
	 * depending on whether or not the value is empty.
	 * ::KLUDGE::
	 * Doing this because udpate_post_meta seems ill-equipped to
	 * handle 'empty' values such as false or an empty string,
	 * but maybe I just don't know any better yet...
	 *
	 * @param integer $post_id    Current post's ID.
	 * @param string  $meta_key   Meta field name.
	 * @param mixed   $meta_value Meta field value.
	 */
	private function setPostMeta($post_id, $meta_key, $meta_value) {
		if (isset($meta_value)) {
			update_post_meta($post_id, $meta_key, $meta_value);
		} else {
			delete_post_meta($post_id, $meta_key);
		}
	}
	/**
	 * @access public
	 *
	 * Save input from the meta box when the post is saved.
	 * todo - check why here and not in admin!
	 */
	public function saveMetaBox($post_id) {
		// Ignore auto saving.
		if ((defined('DOING_AUTOSAVE')) && (DOING_AUTOSAVE)) {
			return;
		}

		// Check the nonce.
		if ((!isset($_POST[WEVP_PREFIX . 'nonce'])) || (!wp_verify_nonce($_POST[WEVP_PREFIX . 'nonce'], WEVP_PREFIX . 'nonce'))) {
			return;
		}

		// User must be able to edit this post.
		if (!current_user_can('edit_post', $post_id)) {
			return;
		}

		if (isset($_POST[WEVP_PREFIX . 'video_id'])) {
			$this->setPostMeta(
				$post_id,
				WEVP_PREFIX . 'video_id',
				esc_url_raw($_POST[WEVP_PREFIX . 'video_id'])
			);
			$this->setPostMeta(
				$post_id,
				WEVP_PREFIX . 'autoplay',
				((isset($_POST[WEVP_PREFIX . 'autoplay'])) && (!!$_POST[WEVP_PREFIX . 'autoplay']))
			);
			$this->setPostMeta(
				$post_id,
				WEVP_PREFIX . 'mute',
				((isset($_POST[WEVP_PREFIX . 'mute'])) && (!!$_POST[WEVP_PREFIX . 'mute']))
			);
			// assume advanced options may be in this data too...
			$advanced = [];
			foreach (VideoCallout::ADVANCED_FIELDS as $prop) {
				$advanced[$prop] = (isset($_POST[WEVP_PREFIX . '' . $prop])) ? sanitize_text_field($_POST[WEVP_PREFIX . '' . $prop]) : '';
			}
			// stash in a json encoded field - means we can compound as many fields as we like
			$this->setPostMeta($post_id, WEVP_PREFIX . 'advanced', json_encode($advanced));
			$this->setPostMeta(
				$post_id,
				WEVP_PREFIX . 'frequency_period',
				$this->esc_int($_POST[WEVP_PREFIX . 'frequency_period'])
			);
			//::TODO:: check if new value is default and remove postmeta if default is used
			// as implied - saves storing extra keys!

			$this->setPostMeta(
				$post_id,
				WEVP_PREFIX . 'frequency_range',
				isset($_POST[WEVP_PREFIX . 'frequency_range']) ? $this->esc_int($_POST[WEVP_PREFIX . 'frequency_range']) : 0
			);
			$this->setPostMeta(
				$post_id,
				WEVP_PREFIX . 'delay',
				$this->esc_int($_POST[WEVP_PREFIX . 'delay'])
			);

		}
		if (isset($_POST[WEVP_PREFIX . 'class'])) {
			$this->setPostMeta(
				$post_id,
				WEVP_PREFIX . 'class',
				sanitize_text_field($_POST[WEVP_PREFIX . 'class'])
			);
		}
	}
	/**
	 * will parse the provided string and escape it as an integer
	 * will fallback to 0 if invalid input/params
	 */
	public function esc_int($str, $fallback = 0) {
		if (is_numeric($str)) {
			return  (int) $str;
		} else if (is_numeric($fallback)) {
			return (int) $fallback;
		}
		 return 0;
	}
	public function notice_bad_frequency() {
		echo '<div class="notice notice-warning is-dismissible">' .
			  '<p>' .
			  __('Display frequency was not applied as this was not valid.', 'video-callout') .
			  '</p>' .
			  '</div>';
	}
	// gutenberg functions below
	public function gutenberg_block_editor_init() {
		wp_enqueue_script( 'webengine-vp' );
	}

	public function meta_init() {
		//guttenberg ajax suppoty
		//WEVP_PREFIX . 'advanced'
		$asset_file = include plugin_dir_path(__DIR__) . 'assets/pack/backend/index.asset.php';
		wp_register_script(
			'webengine-vp',
			plugins_url( 'index.js', plugin_dir_path(__DIR__) . 'assets/pack/backend/index.js'),
			$asset_file['dependencies'],
			$asset_file['version'],
			true
		);
		// meta for UI
		$this->register_post_meta(WEVP_PREFIX . 'video_id');
		//cant use boolean since unset != false
		$this->register_post_meta(WEVP_PREFIX . 'autoplay', 'string');
		$this->register_post_meta(WEVP_PREFIX . 'delay', 'number');
		$this->register_post_meta(WEVP_PREFIX . 'frequency', 'string');
		$this->register_post_meta(WEVP_PREFIX . 'frequency_range', 'number');
		$this->register_post_meta(WEVP_PREFIX . 'frequency_period', 'string');
		//cant use boolean since unset != false
		$this->register_post_meta(WEVP_PREFIX . 'mute', 'string');

		$this->register_post_meta(WEVP_PREFIX . 'advanced');
		$this->register_post_meta(WEVP_PREFIX . 'class');
	}
	private function register_post_meta($meta, $type = 'string') {
		register_post_meta(
			'',
			$meta,
			[
				'show_in_rest' => true,
				'single'       => true,
				'type'         => $type,
				'auth_callback' => function() {
					return current_user_can( 'edit_posts' );
				}
			]
		);
	}
}
