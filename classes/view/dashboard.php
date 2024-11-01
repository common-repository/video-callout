<?php
// Dashboard widget template.
// Data and view pulled together as no dependancy on the class and makes for easeir reading / editing
// Get up to three recently updated posts using a video popup.
// Also returns the total number of posts using one.
//
// ------------------------------------------------------------------------
// Data
// ------------------------------------------------------------------------
$posts = new \WP_Query([
	'post_type' => array('post', 'page', 'event'),
	'meta_key' => 'wevideopopup_video_id',
	'meta_value' => array(''),
    'meta_compare' => 'NOT IN',
	'posts_per_page' => 10,
	'orderby' => 'modified',
	'order' => 'DESC'
]);

// URL's.
# $settings_url = "/wp-admin/options-general.php?page=video-callout";
$settings_url = menu_page_url('video-callout', false);
$user_guide_url = self::GUIDE_URL;
$plugin_home_url = self::HOME;
// ------------------------------------------------------------------------
// Tempalte
// ------------------------------------------------------------------------
?>
<img style="float:right;width:70px;height:auto;margin:0 0 4px 0;" src="<?php echo plugin_dir_url(dirname(__DIR__)) . 'assets/image/vp-icon-colour.svg'; ?>">
<?php
if ($posts->have_posts()) {
	$num_video_posts = $posts->found_posts; // Total.

	?>
	<p><?php printf( esc_html( _n( 'You have %d callout on your site.', 'You have %d callouts on your site.', $num_video_posts, 'video-callout'  ) ), $num_video_posts ); ?></p>
	<p><?php esc_html_e('Most recent popups:', 'video-callout')?></p>
	<ul>
		<?php
		$today    = current_time('Y-m-d');
		$tomorrow = current_datetime()->modify('+1 day')->format('Y-m-d');
		$year     = current_time('Y');
		while ($posts->have_posts()) {
			$posts->the_post();

			$time = get_the_time('U');

			if (gmdate('Y-m-d', $time) === $today) {
				$relative = __('Today');
			} elseif (gmdate('Y-m-d', $time) === $tomorrow) {
				$relative = __('Tomorrow');
			} elseif (gmdate('Y', $time) !== $year) {
				/* translators: Date and time format for recent posts on the dashboard, from a different calendar year, see https://www.php.net/manual/datetime.format.php */
				$relative = date_i18n(__('M jS Y'), $time);
			} else {
				/* translators: Date and time format for recent posts on the dashboard, see https://www.php.net/manual/datetime.format.php */
				$relative = date_i18n(__('M jS'), $time);
			}

			// Use the post edit link for those who can edit, the permalink otherwise.
			$recent_post_link = current_user_can('edit_post', get_the_ID()) ? get_edit_post_link() : get_permalink();

			$draft_or_post_title = _draft_or_post_title();
			printf(
				'<li><span>%1$s</span> <a href="%2$s" aria-label="%3$s">%4$s</a></li>',
				/* translators: 1: Relative date, 2: Time. */
				sprintf(_x('%1$s, %2$s', 'dashboard'), $relative, get_the_time()),
				$recent_post_link,
				/* translators: %s: Post title. */
				esc_attr(sprintf(__('Edit &#8220;%s&#8221;'), $draft_or_post_title)),
				$draft_or_post_title
			);
		}
		?>
	</ul>
	<?php
} else {
	?>
	<p> <?php esc_html_e('There are no "video-popup\'s" currently in use.', 'video-callout')?></p>
	<?php
}
wp_reset_postdata();
?>
<hr style="clear:right;">
<a href="<?php echo esc_url($settings_url); ?>" title="<?php echo esc_attr(__('Settings', 'video-callout'))?>" class="button button-primary"><?php esc_html_e('Settings', 'video-callout')?></a>
<?php
