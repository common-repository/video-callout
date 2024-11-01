/**
 * This is an amanded copy of the RadioControl class since we dont want
 * our radios in a VStack - this is otherewise identical to the wordpress
 * default control
 *
 * External dependencies
 */
import classnames from 'classnames';
 // import type { ChangeEvent } from 'react';

 /**
  * WordPress dependencies
  */
import { useInstanceId } from '@wordpress/compose';

 /**
  * Internal dependencies
  */

import { BaseControl } from '@wordpress/components';
 /**
  * Render a user interface to select the user type using radio inputs.
  *
  * ```jsx
  * import WEVCRadioControl from './WEVCRadio';
  * import { useState } from '@wordpress/element';
  *
  * const MyRadioControl = () => {
  *   const [ option, setOption ] = useState( 'a' );
  *
  *   return (
  *     <WEVCRadioControl
  *       label="User type"
  *       help="The type of the current user"
  *       selected={ option }
  *       options={ [
  *         { label: 'Author', value: 'a' },
  *         { label: 'Editor', value: 'e' },
  *       ] }
  *       onChange={ ( value ) => setOption( value ) }
  *     />
  *   );
  * };
  * ```
  */
 export function WEVCRadioControl(
	 props
 ) {
	 const {
		 label,
		 className,
		 selected,
		 help,
		 onChange,
		 hideLabelFromVision,
		 options = [],
		 ...additionalProps
	 } = props;
	 const instanceId = useInstanceId( WEVCRadioControl );
	 const id = `inspector-radio-control-${ instanceId }`;
	 const onChangeValue = ( event ) =>
		 onChange( event.target.value );

	 if ( ! options?.length ) {
		 return null;
	 }

	 return (
		 <BaseControl
			 __nextHasNoMarginBottom
			 label={ label }
			 id={ id }
			 hideLabelFromVision={ hideLabelFromVision }
			 help={ help }
			 className={ classnames( className, 'components-radio-control' ) }
		 >
				 { options.map( ( option, index ) => (
					 <div
						 key={ `${ id }-${ index }` }
						 className="components-radio-control__option"
					 >
						 <input
							 id={ `${ id }-${ index }` }
							 className="components-radio-control__input"
							 type="radio"
							 name={ id }
							 value={ option.value }
							 onChange={ onChangeValue }
							 checked={ option.value === selected }
							 aria-describedby={
								 !! help ? `${ id }__help` : undefined
							 }
							 { ...additionalProps }
						 />
						 <label htmlFor={ `${ id }-${ index }` }>
							 { option.label }
						 </label>
					 </div>
				 ) ) }
		 </BaseControl>
	 );
 }

 export default WEVCRadioControl;