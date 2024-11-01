=== Video Callout ===
Contributors: web-engineer
Tags: popup, video, youtube, vimeo, google drive
Requires at least: 5.8
Tested up to: 6.6
Requires PHP: 7.4
License: GPLv3
License URI: https://www.gnu.org/licenses/gpl-3.0.html
Stable tag: 1.2.2

Add a video popup to your posts with an optional delay and display frequency. Fully customisable window with modal option.

== Description ==
Video Callout can display video popups on your posts and pages. Simply add a video from YouTube, Google Drive, or Vimeo via the WordPress editor and your site visitors will see the video popup in a modal when they visit your chosen page.

Featuring detailed customisation options, allowing you to configure the popup appearance and behaviour from the post editor or globally via your site's settings page.

Enter the video details into the *Video Callout* box on the page editor and further customisation options will be displayed.

https://youtu.be/dQIKNx1Qp00

== Settings ==
* *video* - (required) YouTube video URL or ID, Google Drive video URL, or Vimeo video URL.
* *autoplay* - Check this for the video to play automatically (note: autoplay videos will be muted as required by most modern browsers).
* *frequency* - How long after users see the video before it can be shown again. Select a period (seconds, hours, days) and a duration.
* *delay* - Delay in seconds until the video appears.
* *class* - Add extra CSS classes to the outer div for custom styling.
* *mute* - Turn off sound.
* *modal* - Will cover the page with a tinted overlay.

= Layout =

You can choose where on the page you want the callout to appear. Plus the size and all properties of the window, frame and close button.

The style and layout can be globally managed for the site with the option to set any overrides on a per page or post basis.

= Autoplay =

Autoplay is not supported by all browsers. If you use autoplay, mute should be turned on for autoplay to work in most cases in those browsers that support it.

*Only youtube and vimeo support autoplay*

== Dashboard widget ==
The handy dashboard widget neatly shows you how many video callouts you have on your website and lists the most recent ones you updated.

== Screenshots ==
1. Closeup of a video callout
2. Dedicated video-callout panel
3. Dashboard widget showing placements
4. Configuration and playback options
5. Example bottom-left placement
6. Example centre placement
7. Style can be set site wide

== Changelog ==
= 1.2.2 =
Fixed an 'undefined array key' warning that occurred on non callout pages with debug logging enabled.

= 1.2.1 =
* Wordpress 6.6 support
* Fixed deprecation warnings

= 1.2.0 =
* Added start time support. Video callouts can now play from the time found in the video address.
* Fixed google drive videos not working. Google drive links no longer support autoplay.

= 1.1.9 =
* Wordpress 6.5/6.5.2 support
* Fixed radio buttons displaying incorrectly in wordpress 6.5
* 'Revert to defaults' now works as intended and reverts to values from the plugin's setting page.

= 1.1.8 =
* Enabled Wordpress playground live preview for all users.
* Fixed a bug where global settings weren't saving in wordpress playground

= 1.1.5 / 1.1.7 =
* Added support for wordpress playground

= 1.1.4 / 1.1.3 =
* Metadata changes

= 1.1.2 =
* 13281 - Added blur option to the modal overlay
* Wordpress 6.4.3 tested

= 1.1.1 =
* Fixed saving on settings page

= 1.1.0 =
* 14729 bugfix - widget page compatibility
* WP 6.2.2 support

= 1.0.9 =
* 14010 bugfix - autoplay and mute broken on some players
* 13955 googledrive support added
* Preview minor bugfix in admin
* WP 6.2 support

= 1.0.8 =
* Minor bugfixes

= 1.0.7 =
* 13182 il8n - compound string handling
* 13129 / 12966 - z-index user configurable
* WP 6.1 support

= 1.0.6 =
* 13162 Minor translation fixes - simplified string handling
* 13162 Spelling and grammar updates
* 13157 Dashboard edge case closed

= 1.0.5 =
* 13162 translation updates US first

= 1.0.4 =
* rebuild language files
* 13157 dashbaord query fixed

= 1.0.3 =
* 13154 fixes pages without callouts triggerd console output
* 13127 translations updated
* 13156 global settings refinement
* 13119 fixes defaults inconsistent before first save

= 1.0.2 =
* Wordpress 6.1 tested
* Bug fixes and refinements

= 1.0.1 =
* Release refinements - stable tag fixed

= 1.0.0 =
* WP 6.0.2 tested
* Gutenberg support
* Many refinements

= 0.5.0 =
* WP 6.0 tested
* Added dashboard view
* many incremental improvements

= 0.1.0: First version =
