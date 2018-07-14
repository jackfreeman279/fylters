describe( 'Disable Behaviour', function() {
    this.timeout( 10000 );

    it( 'Disables filter when parent is disabled', function( done ) {
        createInstance( configs.dummyDataConfig, function( instance, initialState ) {
            expect( initialState[ 4 ].value ).to.equal( undefined );
            expect( initialState[ 4 ].name ).to.equal( undefined );
            done();
        } );
    } );

    it( 'Disables filter when specified by middlewares', function( done ) {
        createInstance( configs.dummyDataConfig, function( instance, initialState ) {
            expect( initialState[ 1 ].value ).to.equal( undefined );
            expect( initialState[ 1 ].name ).to.equal( undefined );
            expect( initialState[ 0 ].value ).to.equal( '-1' );
            expect( initialState[ 0 ].name ).to.equal( 'All' );
            done();
        } );
    } );

    it( 'Disables filter an empty response is recieved', function( done ) {
        createInstance( configs.dummyDataConfigEmptyResponse, function( instance, initialState ) {
            expect( initialState[ 0 ].value ).to.equal( undefined );
            expect( initialState[ 0 ].name ).to.equal( undefined );
            expect( initialState[ 1 ].value ).to.equal( undefined );
            expect( initialState[ 1 ].name ).to.equal( undefined );
            done();
        } );
    } );
} );
