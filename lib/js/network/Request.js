import { parameterError } from '../util/parameterError.js';

/**
 * Very simple in-built data request functionality for filters. You can override this with your own data
 * fetching layer.
 *
 * @param {String} url The URL to call to fetch data
 * @param {String} method get
 * @return {Promise} promise that resolves with data or rejects with error
 */
export const promiseRequest = function( url = parameterError( 'Url must be provided to make request' ), method = 'GET' ) {

    return new Promise( ( resolve, reject ) => {

        var xhttp = new XMLHttpRequest();
        xhttp.addEventListener( 'load', evt => {

            console.log( xhttp.status );

            if ( xhttp.status < 400 && xhttp.status > 0 ) {
                try {
                    return resolve( {
                        data: JSON.parse( xhttp.responseText )
                    } )
                } catch ( e ) {
                    return reject( e );
                }
            }

            return reject( 'Non 200+ response from API' );

        } );

        xhttp.addEventListener( 'error', reject )
        xhttp.addEventListener( 'abort', reject )
        xhttp.open("GET", url, true);
        xhttp.send();

    } );
}
