import { Filter } from '../filter/Filter.js';
import { promiseRequest } from '../network/Request.js';
import { FILTER_SET_STATE, FILTER_STATE } from '../enum/Enum.js';

/**
 * The configuration needed to create a filterset
 * @typedef {Object} FilterSetConfig
 * @property {Array.<FilterConfig>} filters the set of filters to create
 * @property {Function} onUpdate function that is passed a single parameter Array.<C~CurrentFilterValue> when the filter reaches a new state
 * @property {Function} dataFetchImplementation the function that is used to fetch data, takes a URL and must return a promise in your implementation
 */

/**
 * Filter Set clas, this is the main class exported from the library
 */
export class FilterSet {

    /**
     * Get the default configuration for the filterSet
     *
     * @returns {FilterSetConfig} the default config
     */
    static DEFAULT_CONFIG() {
        return {
            filters: [],
            onUpdate: () => {},
            dataFetchImplementation: url => {
                return promiseRequest( url, 'GET' );
            }
        }
    }

    /**
     * Fetch a filter by providing its name
     *
     * @param  {String} name    name of the filter
     * @param  {Array.<Filter>} filters the set of filters
     * @return {Filter|null} the filter found or null
     */
    _getFilterByName( name, filters ) {
        for( let g = 0; g < filters.length; g++ ) {
            const filter = filters[ g ];
            if( filter.getName() === name ) {
                return filter;
            }
        }
    }

    /**
     * Filter dependencies are represented as a tree structure, every filter class extends TreeNode which provides the node behaviour
     * This function builds that tree.
     *
     * @param  {Array.<Filter>} filters the set of filters
     */
    _buildTree( filters ) {
        filters.forEach( filter => {
            const deps = filter.getDependencies();
            if ( deps.length === 0 ) {
                return;
            }

            deps.forEach( depName => {
                const depFilter = this._getFilterByName( depName, filters );
                depFilter.addChild( filter );
            } );
        } );
    }

    /**
     * We can immediatley determine which filters will be updated when a filter is changed by following its dependency tree
     * So here we do this and set these filters to loading state while we do any work needed to update them.
     *
     * This is done recursivley on children of a given filter
     *
     * @param {Filter} filter the filter whose children to set loading
     */
    _setAffectedFiltersLoading( filter ) {

        if ( !filter.hasChildren() ) {
            return;
        }

        for( let x = 0; x < filter.getChildren().length; x++ ) {
            const child = filter.getChildren()[ x ];
            child.setState( FILTER_STATE.LOADING );
            this._setAffectedFiltersLoading( child );
        }
    }

/**
 * Set all filters in the tree to a particular state
 *
 * @param {FilterState} state the state to set
 */
    _setAllFiltersToState( state ) {

        this.filters.forEach( filter => {
            filter.setState( state );
        } );
    };

    /**
     * Fetch all the children for a given set of filters
     *
     * @param  {Array.<Filter>} filters the filters
     * @return {Array.<Filter>} the resulting children
     */
    _getAllChildren( filters ) {
        return filters.reduce( ( array, filter ) => {
            return array.concat( filter.getChildren() );
        }, [] );
    }

    /**
     * This is the main update function that is called when a filter is updated, Ite evaluates each
     * level of the dependency tree in turn and returns a promise to resolve the next level the promise is
     * resolved when there are no more children to update
     *
     * @param  {Array.<Filter>} filters the filters which have children that need to be resolved
     * @return {Promise} promise that resolves when all updates are complete
     */
    _updateFilterTree( filters ) {

        const allChildren = this._getAllChildren( filters );

        if( allChildren.length === 0 ) {
            return Promise.resolve();
        }

        const treeLevelPromises = allChildren.map( filterChild => {
            return filterChild.dependencyDidUpdate( filterChild.getParent() );
        } );

        return Promise.all( treeLevelPromises )
            .then( () => {
                return this._updateFilterTree( allChildren );
            } )
            .catch( error => {
                this._catchGenericError( error );
            } );
    }

    /**
     * Something went wrong in the filters, show the error in the console and set the filter states to error. The update callback
     * will not have been called if an error was thrown so make sure this is invoked also
     *
     * @param  {Error} error the error thrown
     */
    _catchGenericError( error ) {
        console.warn( error );
        this._setAllFiltersToState( FILTER_STATE.ERROR );
        this.config.onUpdate( this._getFilterStates() );
    }

    /**
     * Function that begins the filter updating process
     *
     * @param  {Filter} filter The filter that was updated
     * @return {Promise} promise that resolves when the update is complete, state has been updated and user callback invoked
     */
    _onFilterUpdated( filter ) {
        this._setAffectedFiltersLoading( filter );
        return this._updateFilterTree( [ filter ] )
            .then( () => {
                // if the state is initialising
                if ( this.getState() !== FILTER_SET_STATE.INITIALISING && this.getState() !== FILTER_SET_STATE.RESETTING ) {
                    this.config.onUpdate( this._getFilterStates() );
                }
            } )
    }

    /**
     * takes in the configs and creates Filter class instances from these
     *
     * @param  {Array.<FilterConfig>} filterConfigs the configurations
     * @return {Array.<Filter>} the constructed instances
     */
    _buildFilterInstances( filterConfigs ) {

        return filterConfigs.map( config => {
            return new Filter( {
                ...config,
                wrapper: this.container,
                onOptionSelected: this._onFilterUpdated.bind( this ),
                dataFetchImplementation: this.config.dataFetchImplementation
            } );
        } );
    }

    /**
     * Function that is called only once when the filters are initialising. It will tell all the root filters
     * to fetch their data and render. The normal dependency behaviour will then handle the rest of the updates
     */
    _initialiseFilters () {
        const rootResolution = this.filters.map( filter => {
            if( filter.isRoot() ) {
                return filter.init();
            }
        } );

        Promise.all( rootResolution )
            .then( () => {
                this.setState( FILTER_SET_STATE.IDLE );
                this.config.onUpdate( this._getFilterStates() );
            } )
    }

    /**
     * Set the state of the filter set
     *
     * @param {FilterSetState} state state to set
     */
    setState( state ) {
        this.state = state;
    }

    /**
     * Get the current state of the filter
     *
     * @return {FilterSetState} th current state
     */
    getState() {
        return this.state;
    }

    /**
     * Get the state of each filter
     *
     * @return {Array.<CurrentFilterValue>} the curretn states
     */
    _getFilterStates() {
        return this.filters.map( filter => {
            return filter.getCurrentOption();
        } );
    }

    /**
     * Begin the process of resetting the filters to their original value
     *
     * @return {Promise} promise that resolves when the filter has been reset
     */
    reset() {
        this.setState( FILTER_SET_STATE.RESETTING );
        const resetPromises = this.filters.map( filter => {
            if ( filter.isRoot() ) {
                return filter.reset();
            }
        } );

        return Promise.all( resetPromises )
            .then( () => {
                this.setState( FILTER_SET_STATE.IDLE );
                this.config.onUpdate( this._getFilterStates() );
            } )
            .catch( error => {
                this._catchGenericError( error );
            } )
    }

    /**
     * Renders neccacary elements into the container
     */
    _render() {
        const button = document.createElement( 'button' );
        button.innerText = 'Reset';
        button.onclick = () => {
            this.reset();
        }
        button.classList.add( 'reset' );
        this.container.appendChild( button );
    }

    /**
     * Construct the filter set
     *
     * @param  {HTMLElement} container container where filters are to be rendered
     * @param  {FilterSetConfig} config the configuration
     */
    constructor( container, config ) {
        this.setState( FILTER_SET_STATE.INITIALISING );
        this.container = container;
        this.config = { ...FilterSet.DEFAULT_CONFIG(), ...config };
        this.filterTree = null;
        this.filters = this._buildFilterInstances( config.filters );
        this._buildTree( this.filters );
        this._initialiseFilters();
        this._render();

    }

    /**
     * Get the filter instances
     *
     * @return {Array.<Filter>} the filters
     */
    getInstances() {
        return this.filters;
    }
}
