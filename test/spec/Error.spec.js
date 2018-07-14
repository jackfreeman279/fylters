describe( 'Error Behaviour', function() {
    this.timeout( 10000 );

    it( 'All filters set to error state when network request fails', function( done ) {
        let init = false;

        createInstance( configs.dummyDataConfigFailData, function( instance, initialState ) {
            if ( !init ) {
                init = true;
                expect( initialState[ 0 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 1 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 2 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 3 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 4 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                done();
            }
        } );
    } );

    it( 'All filters set to error state when data middleware fails', function( done ) {

        let init = false;

        createInstance( configs.dummyDataConfigFailData, function( instance, initialState ) {
            if ( !init ) {
                init = true;
                expect( initialState[ 0 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 1 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 2 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 3 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 4 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                done();
            }
        } );
    } );

    it( 'All filters set to error state when default middleware fails', function( done ) {
        let init = false;

        createInstance( configs.dummyDataConfigFailData, function( instance, initialState ) {
            if ( !init ) {
                init = true;
                expect( initialState[ 0 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 1 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 2 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 3 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                expect( initialState[ 4 ].state ).to.equal( fylter.FILTER_STATE.ERROR );
                done();
            }
        } );
    } );


} );
