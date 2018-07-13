/**
 * Throw an error when a parameter is wrongly missed out from the function call
 * @param  {String} message message to display in error
 * @throws {Error}
 */
export const parameterError = function( message ) {
    throw new Error( `Parameter Error ${ message }` );
};
