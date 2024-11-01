
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { Fragment } from "@wordpress/element";

import {
	PluginSidebar,
	PluginSidebarMoreMenuItem,
} from "@wordpress/edit-post";

import {
	Dashicon,
} from '@wordpress/components';

import WEVCPanel from './components/WEVCPanel';

const WEVCIcon = () => (<Dashicon icon="format-video" />);

function WEVCregisterFills(  ) {
	const pluginTitle = __("Video Callout", 'video-callout');
	/**
		 * Renders the editor fills.
		 *
		 * @returns {Component} The editor fills component.
		 */
	const EditorFills = () => (
		<Fragment>
			<PluginSidebarMoreMenuItem
				target="wevp-sidebar"
				icon={<WEVCIcon/>}
			>
				{ pluginTitle }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name="wevp-sidebar"
				title={ pluginTitle }
			>
				<WEVCPanel/>
			</PluginSidebar>
		</Fragment>
	);

	registerPlugin( "wevp-videocallout", {
		render: EditorFills,
		icon: <WEVCIcon />,
	} );

}

WEVCregisterFills();