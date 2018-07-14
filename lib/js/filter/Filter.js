import { TreeNode } from '../tree/TreeNode.js';
import { NativeSelectFilter } from './NativeSelect.js';
import { FILTER_STATE } from '../enum/Enum.js';

/**
 * Middlewares to use when there is no middlewares provided in filter config
 * @typedef {Object} Middlewares
 * @property {Function} beforeOptionUpdate function called after the filter has successfully fetched data, passed teh data and should return a set of options to render
 * @property {Function} decideDefault function taht is passed tehset of options adn should return an id of an option to set as default
 * @property {Function} decideFilterEnabledState passed a filter that caused an update event and returns a boolean of wether the filter is enabled
 */

/**
 * Type that defines a single filter option, this should be the format returned by the beforeOptionUpdate function
 * @typedef {Object} Option
 * @property {String} name options display name
 * @property {String} value the value for the options
 * @property {Object} extra extra data attached to the options
 */

/**
 * Default filter config to use when no filter config passed
 * @typedef {Object} FilterConfig
 * @property {String} name the name of the filter
 * @property {Function} data a function that defines data grabbing behaviour, returns a string, Array.<Option> or a promise that resolves with a Array.<Option>
 * @property {FilterInterface} uiClass the class to use to render the filter, must extends the FilterInterface class
 * @property {String} wrapperClass class that gets applied around the whole filter
 * @property {Middlewares} middleWares set of middlewares to use in this filter
 * @property {Array.<String>} dependsOn the set of filters that will cause this one to update
 * @property {HTMLElement} wrapper the wrapper element where the filter should be appended, set by the filter set and shouldnt be overridden
 * @property {Function} dataFetchImplementation function that takes a url and resolves with fetched data
 * @property {Function} onOptionSelected callback to fire when the filter updates. This is set by the filter set and shouldnt be overridden
 */

/**
 * Object that represents a filters current state and selected option
 * @typedef {Object} CurrentFilterValue
 * @property {String} filterName the name of the filter
 * @property {String} [name] the name of the curretn option
 * @property {String} [value] the value of the current selcted option
 * @property {Object} [extra] extra data attached to the option
 * @property {FilterState} state the current state of the filter
 */

/**
 * FIlter class to handle interactions between the filter set and the ui element that is implmented
 * by the user or the default filter ui class
 *
 * @extends TreeNode
 */
export class Filter extends TreeNode {

    /**
     * Get the default set of middlewares for a filter
     *
     * @return {Middlewares} the middlewares to use of none already set in filter config
     * @static
     */
    static DEFAULT_MIDDLEWARES() {
        return {
            beforeOptionUpdate: options => options,
            decideDefault: options => options[ 0 ].value,
            decideFilterEnabledState: dependantUpdated => true
        }
    }

    /**
     * Get the default filter config
     *
     * @return {FilterConfig} the filter config
     * @static
     */
    static DEFAULT_CONFIG() {
        return {
            uiClass: NativeSelectFilter,
            wrapperClass: 'filter'
        }
    }

    /**
     * Render a warning into the console, automatically add this filters name
     * @param  {String} name    the name of the filter
     * @param  {String} message the warning message
     * @static
     */
    static warn ( name, message ) {
        console.warn( `Filter (${ name }): ${ message }` );
    }

    /**
     * Get a set of utility functions that can be used in middleware functions
     * @return {Object} set of utility functions
     * @static
     */
    static FILTER_UTIL_FUNCTIONS() {
        return {
            DISABLE_WHEN_VALUE: function ( value ) {

                return function ( dependantUpdated ) {
                    if ( dependantUpdated.getCurrentOption().value === value ) {
                        return false;
                    }
                    return true;
                }

            }
        }
    }

    /**
     * Constructor function for filter class creates filter and sets state to loading
     *
     * @param {FilterConfig} config configuration for this filter
     */
    constructor( config ) {
        super();

        this.setState( FILTER_STATE.BUILDING );
        this.config = {
            ...Filter.DEFAULT_CONFIG(),
            ...config
        };
        this.config.middleWares = {
            ...Filter.DEFAULT_MIDDLEWARES(),
            ...this.config.middleWares
        }
        this.uiElement = new this.config.uiClass();
        this.uiElement.setSelectedCallback( this.onSelect.bind( this ) );
        this.setupContainer();
        this.optionList = [];
        this.setState( FILTER_STATE.LOADING );
    }

    /**
     * Set the state of the filter
     *
     * @param {FilterState} state the filter state
     */
    setState( state ) {
        this.state = state;
    }

    /**
     * Creates the container that the ui element will render its contents into
     */
    setupContainer() {

        this.container = document.createElement( 'div' );
        this.config.wrapper.appendChild( this.container );
        this.container.classList.add( this.config.wrapperClass );
        this.uiElement.setContainer( this.container );
    }

    /**
     * Function only called for root filters, called once on the set up of the filter
     *
     * @return {Promise} promise that resolves when filter data has been fetched
     */
    init() {
        return this.getOptionsData()
            .then( () => {
                return this.config.onOptionSelected( this );
            } )

    }

    /**
     * Callback that is invoked by the uiClass when an item has been selected by the user
     *
     * @param  {string} id the id of the selected item
     * @return {Promise} promise that resolves when the filterset has finished its updates related to this change
     */
    onSelect( id ) {
        this.setCurrentId( id );
        return this.config.onOptionSelected( this );
    }

    /**
     * Get an object representing the current state of the filter
     *
     * @return {CurrentFilterValue} the current value of the filter
     */
    getCurrentOption() {

        const option = this._getOptionForValue( this.getCurrentId() );

        return {
            filterName: this.getName(),
            state: this.getState(),
            ...option
        }
    }

    /**
     * Given a value fetch an option from the list
     *
     * @param  {String} value the value of option to find
     * @return {Option|Object} the option or an empty object
     */
    _getOptionForValue( value ) {

        if ( value === false ) {
            return {};
        }

        const options = this.getOptionList();

        for( let x = 0; x < options.length; x++ ) {
            const option = options[ x ];

            if( option.value.toString() === value.toString() ) {
                return option;
            }
        }

        return {};
    }

    /**
     * When the config.data function returns a string this is used to make a network call. You can also use
     * format strings with parent filter values here
     *
     * @example <caption>Using format parameters in a data url</caption>
     * // The {{SomeFilter}} value will be replaced by the current value of that filter
     * // The filter used must be a parent of this filter
     * {
     *  dependsOn: [ 'SomeFilter' ]
     *  data: () => 'http://www.myapi.com/endpoint/{{someFilter}}/data'
     * }
     *
     * @param  {String} url url from the config.data function
     * @return {String} the url with any format strings evaluated
     */
    _buildAPIUrl( url ) {

        const parent = this.getParent();
        if ( !parent ) {
            return url;
        }

        const replace = `{{${ parent.getName() }}}`;

        return url.replace( replace, parent.getCurrentOption().value );
    }

    /**
     * The config.data function can return a array, promise or string, here we abstract out this behaviour so whatever
     * is specified in the config can be fetched as a promise that eventually resolves with data.
     *
     * @example <caption>Different ways of specifying the config data property</caption>
     *
     * {
     *  data: updatingFilter => 'http://www.myapi...',
     *  data: updatingFilter => [ { name, value }... ],
     *  data: updatingFilter => new Promise(...)
     * }
     *
     * @param  {Filter} initiatingFilter the filter that caused the update
     * @return {Promise} promise that resolves with data
     */
    _getDataPromise( initiatingFilter ) {

        const dataResult = this.config.data( initiatingFilter );

        switch( typeof dataResult ) {

            case 'string':
                return this.config.dataFetchImplementation( this._buildAPIUrl( dataResult ) )
                break;
            case 'object':
                if ( dataResult instanceof Array ) {
                    return Promise.resolve( dataResult );
                }

                if ( dataResult instanceof Promise ) {
                    return dataResult
                }

                Filter.warn( this.getName(), 'Filter data needs to be a api endpoint (string) an array or promise' );
                return Promise.resolve( [] );

        }

    }

    /**
     * main function to initilate the fetching of data for the filter
     *
     * @param  {Filter} [initiatingFilter] The filter that was updated to cause this filter to update
     * @return {Promise} Promise that resolves when the data fetch and render is complete
     */
    getOptionsData( initiatingFilter ) {

        // if the middleware tells us to disable or the parent is disabled then disable this
        if ( initiatingFilter && ( initiatingFilter.isDisabled() || !this.config.middleWares.decideFilterEnabledState( initiatingFilter ) ) ) {
            this.setCurrentId( false );
            this.setState( FILTER_STATE.DISABLED );
            return Promise.resolve();
        }

        this.setState( FILTER_STATE.LOADING );
        return this._getDataPromise( initiatingFilter )
                .then( data => {
                    return this.config.middleWares.beforeOptionUpdate( data );
                } )
                .then( options => {
                    this.setOptionList( options );
                    if ( options && options.length ) {
                        this.setCurrentId( this.config.middleWares.decideDefault( this.getOptionList() ) );
                        this.render();
                        this.setState( FILTER_STATE.IDLE );
                    } else {
                        this.setState( FILTER_STATE.DISABLED );
                    }

                } )
                .catch( error => {
                    Filter.warn( this.getName(), error.toString() );
                    this.setState( FILTER_STATE.ERROR );
                } );
    }

    /**
     * Get the name of this filter
     *
     * @return {String} the name of the filter
     */
    getName() {
        return this.config.name;
    }

    /**
     * get the names of the filters that this filter depends on
     *
     * @return {Array.<String>} the filter names
     */
    getDependencies() {
        return this.config.dependsOn || [];
    }

    /**
     * Determine if the filter is disabled
     *
     * @return {Boolean} wether this filter is currently disabled
     */
    isDisabled() {
        return this.getState() === FILTER_STATE.DISABLED;
    }

    /**
     * Function that is called when a filter that this instance is dependent on is updated. This is called by the
     * FilterSet code. Should not be invoked manually.
     *
     * @param  {Filter} filter filter causing the update
     * @return {Promise} promise that resolves when this filter is finished fetching data
     */
    dependencyDidUpdate( filter ) {

        if ( filter.getState() === FILTER_STATE.ERROR ) {
            this.setState( FILTER_STATE.ERROR );
            return Promise.reject( new Error( 'Filter cannot be updated when parent is in an error state' ) )
        }

        return this.getOptionsData( filter );
    }

    /**
     * Set the set of options that will be displayed by the filter
     *
     * @param {Array.<Option>} list list of options
     */
    setOptionList ( list ) {
        this.optionList = list;
    }

    /**
     * Get the current option set
     *
     * @return {Array.<Option>} current option set
     */
    getOptionList () {
        return this.optionList;
    }

    /**
     * This function will initiate the reset of this filter and also its dependants, this should
     * not be called manually and is only called by the FilterSet
     *
     * @returns {Promise} promise that resolves when this filter and its children has been reset
     */
    reset() {

        const defaultVal = this.config.middleWares.decideDefault( this.getOptionList() );
        this.uiElement.setValue( defaultVal );
        return this.onSelect( defaultVal );
    }

    /**
     * Set the ID (value) of the current option that is selected
     *
     * @param {String} id the id that has been selected
     */
    setCurrentId( id ) {
        this.currentId = id;
    }

    /**
     * Get the id of the currently selected option
     *
     * @return {String|boolean} the id
     */
    getCurrentId() {
        return this.currentId || false;
    }

    /**
     * Set the state of this filter and perform any associated actions
     *
     * @param {FilterState} state state to set
     */
    setState( state ) {
        this.state = state;

        switch( this.state ) {
            case FILTER_STATE.LOADING:
                this.uiElement.setLoadingState( this.getName() );
                break;
            case FILTER_STATE.ERROR:
                this.uiElement.removeLoadingState( this.getName() );
                this.uiElement.setErrorState( this.getName() );
                break;
            case FILTER_STATE.IDLE:
                this.uiElement.removeLoadingState( this.getName() );
                break;
            case FILTER_STATE.DISABLED:
                this.uiElement.setDisabledState( this.getName() );
                break;
        }
    }

    /**
     * Get the current state of the filter
     *
     * @return {FilterState} current state
     */
    getState() {
        return this.state;
    }

    /**
     * Tell the uiClass that it needs to render the filter into the page as all of the data needed is ready
     */
    render () {
        this.uiElement.render( this.getName(), this.getOptionList(), this.getCurrentId() );
    }

    /**
     * Return the uiElement that is used to manage the filter in the DOM
     * @return {FilterInterface} a class implementing the FilterInterface class
     */
    getUiElement() {
        return this.uiElement;
    }
}
