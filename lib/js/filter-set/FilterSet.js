import { Filter } from '../filter/Filter.js';
import { promiseRequest } from '../network/Request.js';
import { FILTER_SET_STATE, FILTER_STATE } from '../enum/Enum.js';

export class FilterSet {

    static DEFAULT_CONFIG() {
        return {
            dataFetchImplementation: url => {
                return promiseRequest( url, 'GET' );
            }
        }
    }

    _getFilterByName( name, filters ) {
        for( let g = 0; g < filters.length; g++ ) {
            const filter = filters[ g ];
            if( filter.getName() === name ) {
                return filter;
            }
        }
    }

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

    _setAffectedFiltersLoading( filter,  ) {

        if ( !filter.hasChildren() ) {
            return;
        }

        for( let x = 0; x < filter.getChildren().length; x++ ) {
            const child = filter.getChildren()[ x ];
            child.setState( FILTER_STATE.LOADING );
            this._setAffectedFiltersLoading( child );
        }
    }

    _getAllChildren( filters ) {
        return filters.reduce( ( array, filter ) => {
            return array.concat( filter.getChildren() );
        }, [] );
    }

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
    }

    _onFilterUpdated( filter ) {
        this._setAffectedFiltersLoading( filter );
        return this._updateFilterTree( [ filter ] )
            .then( () => {
                if ( this.getState() !== FILTER_SET_STATE.INITIALISING ) {
                    this.config.onUpdate( this._getFilterStates() );
                }
            } )
    }

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
            .catch( err => {
                console.log( 'problem initialising filters', err );
            } )
    }

    setState( state ) {
        this.state = state;
    }

    getState() {
        return this.state;
    }

    _getFilterStates() {
        return this.filters.map( filter => {
            return filter.getCurrentOption();
        } );
    }

    reset() {
        this.setState( FILTER_SET_STATE.INITIALISING );
        const resetPromises = this.filters.map( filter => {
            if ( filter.isRoot() ) {
                return filter.reset();
            }
        } );

        return Promise.all( resetPromises )
            .then( () => {
                this.setState( FILTER_SET_STATE.IDLE );
                this.config.onUpdate( this._getFilterStates() );
            } );
    }

    _render() {
        const button = document.createElement( 'button' );
        button.innerText = 'Reset';
        button.onclick = () => {
            this.reset();
        }
        button.classList.add( 'reset' );
        this.container.appendChild( button );
    }

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

    getInstances() {
        return this.filters;
    }
}
