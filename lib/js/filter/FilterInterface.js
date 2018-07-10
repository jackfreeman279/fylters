/**
 * Class representing the functions that must be implemented by a custom filter
 * @interface
 */
export class FilterInterface {

    constructor() {}

    /**
     * This function will be called with a callback function by fylter library code.
     * You can then store this callback reference and invoke it with the value of the option
     * that was seldcted when this happens in you rimplementation
     *
     * @param {Function} callback the callback function that accepts a single 'value' argument
     */
    setSelectedCallback( callback ) {
        console.warn( 'setSelectedCallback should be overridden by a implementing class' );
    }

    /**
     * Your custom implmentation should provide a way to set the value of a filter programatically given
     * an ID of an option
     *
     * @param {String} id the id of the option to set
     */
    setValue( id ) {
        console.warn( 'setValue should be overridden by a implementing class' );
    }

    /**
     * The main render function that will be called to add the filter to the DOM
     *
     * @param  {String} title the title of the filter
     * @param  {Array.<Option>} options the set of options to render
     * @param  {String} defaultOptionValue the ID of the option that is currently selected
     */
    render( title, options, defaultOptionValue ) {
        console.warn( 'render should be overridden by a implementing class' );
    }

    /**
     * Your custom implementation should provide a loading state for the filter this will be invoked when
     * the filter starts to fetch data
     *
     * @param {String} title the title of the filter
     */
    setLoadingState( title ) {
        console.warn( 'setLoading should be overridden by a implementing class' );
    }

    /**
     * Remove the loading state from tge filter called by library code when the data has been fetched
     *
     * @param {String} title the title of the filter
     */
    removeLoadingState( title ) {
        console.warn( 'removeLoading should be overridden by a implementing class' );
    }

    /**
     * Disable the filter so that the user cannot interact with it
     *
     * @param {String} title the title of the filter
     */
    setDisabledState( title ) {
        console.warn( 'setDisabledState should be overridden by a implementing class' );
    }

    /**
     * Something has gone wrong with the filter ! display an error state to the user
     */
    setErrorState() {
        console.warn( 'setErrorState should be overridden by a implementing class' );
    }

    /**
     * Allows you to keep a reference to the container element and when rendering your custom markup should go into this container
     * @param {HTMLElement} container the container where the filter should be rendered
     */
    setContainer( container ) {
        console.warn( 'setContainer should be overridden by a implementing class' );
    }

}
