<?php
/**
 * @package       Video Callout
 * @author        web-engineer
 *
 * @wordpress-plugin
 * Plugin Name: Video Callout
 * Plugin URI: https://www.web-engineer.co.uk/video-callout?ref=plugin-page
 * Description: A simple solution to creating "Video Callouts" to your users on any given post/page as an overlay or modal, allows precise control of the frequency, timing delay and how the video is dismissed.
 * Version: 1.2.2
 * Author: Web Engineer
 * Author URI: https://www.web-engineer.co.uk/
 * Requires at least: 5.8
 * Requires PHP: 7.2
 * Text Domain: video-callout
 * License: GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 *
 * @copyright Copyright (C) 2012-2022 Web Engine Limited.
 * @license http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License, version 3 or higher
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 *
 */

define('WEVP_PREFIX', 'wevideopopup_');

include 'classes/video-callout.php';

new WebEngineLimited\VideoCallout();
include 'classes/video-callout-meta.php';
include 'classes/video-callout-admin.php';

new WebEngineLimited\VideoCalloutAdmin();

// moved to admin-init since only admin requires *languge*
// if this changes then a generic init should be added here
// load_plugin_textdomain('video-callout', false, __DIR__ . '/languages/');
