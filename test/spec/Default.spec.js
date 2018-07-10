describe( 'Default Behaviour', function() {
    this.timeout( 10000 );

    it( 'Sets default as specified by user', function( done ) {
        createInstance( configs.dummyDataConfig, function( instance, initialState ) {
            expect( initialState[ 0 ].value ).to.equal( '-1' );
            expect( initialState[ 0 ].name ).to.equal( 'All' );
            done();
        } );
    } );

    it( 'Defaults to first item', function( done ) {
        createInstance( configs.dummyDataConfigNonDisabled, function( instance, initialState ) {
            expect( initialState[ 2 ].value ).to.equal( '-1' );
            expect( initialState[ 2 ].name ).to.equal( 'All' );
            done();
        } );
    } );
} );
