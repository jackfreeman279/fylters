describe( 'Initialisation Behaviour', function() {
    this.timeout( 10000 );
    it( 'Creates filters with the correct UI class', function( done ) {
        createInstance( configs.dummyDataConfig, function( instance, initialState ) {
            instance.getInstances().forEach( function( inst ) {
                expect( inst.getUiElement() instanceof TestFilter ).to.equal( true );
            } );

            done();

        } );
    } );

    it( 'Creates correct number of filters', function( done ) {
        createInstance( configs.dummyDataConfig, function( instance, initialState ) {
            expect( instance.getInstances().length ).to.equal( 5 );
            done();
        } );
    } );
} );
