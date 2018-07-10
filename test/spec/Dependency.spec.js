describe( 'Dependency Behaviour', function() {
    this.timeout( 10000 );

    it( 'Recursivley updates dependant filters', function( done ) {

        var didInit = false;
        var originalState = false;
        createInstance( configs.dummyDataConfig, function( instance, state, container ) {

            if ( !didInit ) {
                didInit = true;
                originalState = state;
                instance.getInstances()[ 0 ].uiElement.onValueChanged( '1' );
            } else {
                expect( state[ 1 ].value ).to.equal( '1-1' );
                expect( state[ 2 ].value ).to.equal( '-1' );
                done();
            }

        } );
    } );

    it( 'Sets loading state on dependant filters', function( done ) {

        var didInit = false;
        var originalState = false;
        createInstance( configs.dummyDataConfig, function( instance, state, container ) {

            if( !didInit ) {
                didInit = true;
                instance.getInstances()[ 0 ].uiElement.onValueChanged( '1' );
                expect( instance.getInstances()[ 1 ].uiElement.uiState ).to.equal( 'loading' );
                expect( instance.getInstances()[ 2 ].uiElement.uiState ).to.equal( 'loading' );
                expect( instance.getInstances()[ 3 ].uiElement.uiState ).to.equal( 'loading' );
                expect( instance.getInstances()[ 4 ].uiElement.uiState ).to.equal( 'loading' );
                done();
            }
        } );
    } );

    it( 'Fails when trying to create a cyclic dependency', function( done ) {

        try {
            createInstance( configs.dummyDataConfigCyclic, function( instance, state, container ) {} );
            expect( false ).to.equal( true );
            done();
        } catch ( error ) {
            expect( error.toString() ).to.equal( 'Error: Attempted to create a cyclic dependency, adding a child that is already the parent' );
            done();
        }

    } );


} );
