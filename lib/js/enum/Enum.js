
/**
 * @typedef {string} FilterState
 */

/**
 * Define possible states of the filter
 * @readonly
 * @enum {FilterState}
 */
export const FILTER_STATE = {
    /** Filter has not been constructed yet */
    BUILDING: 'filter/state/building',
    /** Filter has started the data fetch process */
    LOADING: 'filter/state/loading',
    /** Filter has encountered some sort of error */
    ERROR: 'filter/state/error',
    /** Filter is not currently perfroming any specific action and is ready for user inout */
    IDLE: 'filter/state/idle',
    /** Filter has been disabled and user input is not possible */
    DISABLED: 'filter/state/disabled'
};

/**
 * @typedef {string} FilterSetState
 */

/**
 * Define possible states of the filter set as a whole
 * @readonly
 * @enum {FilterSetState}
 */
export const FILTER_SET_STATE = {
    /** Filter set is in the process of building and populating initial data in filters */
    INITIALISING: 'filterset/state/init',
    /** Filter set is not currently perfroming any specific action and is ready for user inout */
    IDLE: 'filterset/state/idle',
    /** Filter set has encountereda problem and user input is not possible */
    ERROR: 'filterset/state/error'
}
