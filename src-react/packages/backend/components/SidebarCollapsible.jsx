import { useState } from "@wordpress/element";
import PropTypes from "prop-types";
import {
	Dashicon,
} from '@wordpress/components';
/**
 * Sidebar Collapsible component
 *
 * @param {Object} props The properties for the component.
 *
 * @returns {wp.Element} The Collapsible component.
 */
const SidebarCollapsible = (props) => {
	const [isOpen, toggleOpen] = useState(false);

	const {
		icon,
	} = props;

	/**
	 * Toggles the SidebarCollapsible open and closed state.
	 *
	 * @returns {void}
	 */
	function handleClick() {
		toggleOpen(!isOpen);
	}

	return <div className={`wevc components-panel__body ${isOpen ? "is-opened" : ""}`}>
		<h2 className="components-panel__body-title">
			<button
				onClick={handleClick}
				className="components-button components-panel__body-toggle"
			>
				<span
					className="wevc-icon-span"
					style={{ fill: `${icon && icon.color || ""}` }}
				>
					{
						icon && <Dashicon
							icon={icon}
							style={{ marginRight: '5px' }}
						/>
					}
				</span>
				<span className="wevc-title-container">
					<div className="wevc-title">{props.title}</div>
				</span>
				{isOpen &&
					<span aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="components-panel__arrow" aria-hidden="true" focusable="false"><path d="M6.5 12.4L12 8l5.5 4.4-.9 1.2L12 10l-4.5 3.6-1-1.2z"></path></svg></span>
				}
				{!isOpen &&
					<span aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="components-panel__arrow" aria-hidden="true" focusable="false"><path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z"></path></svg></span>
				}
			</button>
		</h2>
		{isOpen && props.children}
	</div>;
};
/* eslint-enable complexity */

export default SidebarCollapsible;

SidebarCollapsible.propTypes = {
	title: PropTypes.string.isRequired,
	children: PropTypes.oneOfType([
		PropTypes.node,
		PropTypes.arrayOf(PropTypes.node),
	]).isRequired,
	icon: PropTypes.object,
};

SidebarCollapsible.defaultProps = {
	icon: null,
};
