import { FilterInterface } from './FilterInterface.js';

/**
 * An example implementation of a custom filter dropdown
 * @implements FilterInterface
 */
export class NativeSelectFilter extends FilterInterface {

    constructor() {
        super();
    }

    /**
     * Save a reference to the callback passed by library code
     *
     * @param {Function} callback the callback function that accepts a single 'value' argument
     * @override
     */
    setSelectedCallback( callback ) {

        this.callback = callback;
    }

    /**
     * Set a specific value on the select dropdown
     *
     * @param {String} id the id of the option to set
     * @override
     */
    setValue( id ) {
        const select = this.container.querySelector( 'select' );

        if ( !select ) {
            return;
        }

        select.value = id;
    }

    /**
     * Callback for when the select dropdown changes its value
     */
    onSelect() {

        const select = this.container.querySelector( 'select' );

        if( select && select.getBoundingClientRect().width > this.container.getBoundingClientRect().width ) {
            this.container.classList.add( 'filter--overflow' );
        } else {
            this.container.classList.remove( 'filter--overflow' );
        }

        this.callback( select.value );
    }

    /**
     * The main render function that will be called to add the filter to the DOM
     *
     * @param  {String} title the title of the filter
     * @param  {Array.<Option>} options the set of options to render
     * @param  {String} defaultOptionValue the ID of the option that is currently selected
     * @override
     */
    render( title, options, defaultOptionValue ) {

        this.container.innerHTML = '';
        const elements = this.createSelectElement( title, options, defaultOptionValue );
        this.container.appendChild( elements.label );
        this.container.appendChild( elements.select );
        this.container.appendChild( elements.indicator );
        elements.select.onchange = this.onSelect.bind( this );

    }

    /**
     * Create a select element in memory
     *
     * @param  {String} name the title of the filter
     * @param  {Array.<Option>} options the set of options to render
     * @param  {String} defaultValue the ID of the option that is currently selected
     * @return {Object} object containing a select element, label and a indicator element which is colored depending on state
     */
    createSelectElement( name, options, defaultValue ) {

        const select = document.createElement( 'select' );
        const label = document.createElement( 'label' );
        const indicator = document.createElement( 'div' );

        select.id = name;
        label.for = name;
        label.innerText = name;
        select.classList.add( 'filter__select' );
        label.classList.add( 'filter__label' );
        indicator.classList.add( 'filter__indicator' );


        options.forEach( option => {
            const optionEl = this.createOptionElement( option );
            if ( option.value === defaultValue ) {
                optionEl.selected = 'true';
            }
            select.appendChild( optionEl );
        } );

        return { label, select, indicator };
    }

    /**
     * Create a select dropdown <option> element in memory
     *
     * @param  {Option} option the option to create
     * @return {HTMLElement} the <option> element
     */
    createOptionElement( option ) {

        const optionEl = document.createElement( 'option' );
        optionEl.value = option.value;
        optionEl.innerText = option.name;
        if( option.default ) {
            optionEl.selected = true;
        }

        return optionEl;
    }

    /**
     * Set the select into a loading state while it fetches data
     * @param {String} title title of the element
     */
    setLoadingState( title ) {
        this.render( title, [ { name: 'Loading', value: '-1' } ], '-1' );
        this.container.classList.remove( 'filter--disabled' );
        this.container.classList.add( 'filter--loading' );
    }

    /**
     * Get rid of the loading class
     *
     * @param {String} title title of the element
     */
    removeLoadingState( title ) {
        this.container.classList.remove( 'filter--loading' );
    }

    /**
     * make sure the user cannot interact with the filter
     *
     * @param {String} title title of the element
     */
    setDisabledState( title ) {
        this.render( title, [ { name: 'Disabled', value: 'disabled' } ], 'disabled' );
        this.container.classList.add( 'filter--disabled' );
        this.container.classList.remove( 'filter--loading' );
    }

    /**
     * Set the filter into a error state as something has gone wrong
     */
    setErrorState() {
        this.render( title, [ { name: 'Error', value: '-1' } ], '-1' );
    }

    /**
     * Set the container so it can be used to render the filter into later
     *
     * @param {HTMLElement} container the filter container
     */
    setContainer( container ) {
        this.container = container;
    }
}
