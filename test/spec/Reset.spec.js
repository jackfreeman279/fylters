describe( 'Reset Behaviour', function() {
    this.timeout( 10000 );

    it( 'Returns filter to original state', function( done ) {

        var didInit = false;
        var originalState = false;
        createInstance( configs.dummyDataConfig, function( instance, state, container ) {

            if ( !didInit ) {
                didInit = true;
                originalState = state;
                instance.getInstances()[ 0 ].uiElement.onValueChanged( '2' );
            } else if ( state[ 0 ].value === '2' ) {
                instance.reset();
            } else {
                expect( JSON.stringify( state ) ).to.equal( JSON.stringify( originalState ) );
                done();
            }

        } );
    } );
} );
