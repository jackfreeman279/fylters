var createInstance = function( filters, callback ) {
    var container = document.createElement( 'div' );
    container.innerHTML = '';
    var inst = new fylter.FilterSet( container,  {
        filters: filters,
        onUpdate: state => {
            callback( inst, state, container );
        }
    } );
}

const disableWhenValue = function ( value ) {

    return function ( dependantUpdated ) {
        if ( dependantUpdated.getCurrentOption().value === value ) {
            return false;
        }
        return true;
    }

}

var getRandomTimeout = function( min, max ) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

var randomlyResolvingPromise = function( resolves, data ) {

    return new Promise( function( resolve, reject ) {

        setTimeout( function() {

            if( resolves ) {
                resolve( data );
            } else {
                reject();
            }

        }, getRandomTimeout( 1, 3 ) );

    } );

}

var COMP_RESPONSE = [
    {
        compName: 'Comp 1',
        value: '1'
    },
    {
        compName: 'Comp 2',
        value: '2'
    },
    {
        compName: 'Comp 3',
        value: '3'
    },
    {
        compName: 'Comp 4',
        value: '4'
    }
]

var GET_SEASON_RESPONSE = function( comp ) {
    return [
        {
            seasonName: '17/18',
            value: comp + '-1'
        },
        {
            seasonName: '16/17',
            value: comp + '-2'
        },
        {
            seasonName: '15/16',
            value: comp + '-3'
        }
    ]
}

var GET_TEAMS_RESPONSE = function( season ) {
    return [
        {
            teamName: 'FCB',
            value: season + '-1'
        },
        {
            teamName: 'MADRID',
            value: season + '-2'
        },
        {
            teamName: 'VALENCIA',
            value: season + '-3'
        }
    ]
}

var configs = {
    uiConfig: [
        {
            name: 'competition',
            data: () => {
                return randomlyResolvingPromise( true, COMP_RESPONSE );
            },
            middleWares: {
                beforeOptionUpdate: data => {

                    const options = data.map( comp => {
                        return {
                            name: comp.compName,
                            value: comp.value,
                            extra: comp
                        }
                    } );
                    return [
                        ...options,
                        {
                            name: 'All',
                            value: '-1'
                        }
                    ];
                },
                decideDefault: options => {
                    return '-1';
                }
            }
        },
        {
            name: 'season',
            data: filter => {
                return randomlyResolvingPromise( true, GET_SEASON_RESPONSE( filter.getCurrentOption().value ) );
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
                beforeOptionUpdate: apiData => {
                    //transform into option list
                    // add all options
                    const options = apiData.map( season => {
                        return {
                            name: season.seasonName,
                            value: season.value,
                            extra: season
                        }
                    } )
                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideDefault: options => {
                    return options[ 1 ].value;
                }
            },
            dependsOn: [ 'competition' ]
        },
        {
            name: 'teams',
            data: filter => {
                return randomlyResolvingPromise( true, GET_TEAMS_RESPONSE( filter.getCurrentOption().value ) );
            },
            dependsOn: [ 'season' ],
            middleWares: {
                beforeOptionUpdate: apiData => {
                    // transform into options list
                    // add all option
                    const options = apiData.map( team => {
                        return {
                            name: team.teamName,
                            value: team.value,
                            extra: team
                        }
                    } )

                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideDefault: options => '-1',
                decideFilterEnabledState: disableWhenValue( '-1' ),
            }
        },
        {
            name: 'Home/Away',
            data: () => {
                return [
                    {
                        name: 'Home',
                        value: 'Home'
                    },
                    {
                        name: 'Away',
                        value: 'Away'
                    }
                ]
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
            },
            dependsOn: [ 'teams' ]
        },
        {
            name: 'Win',
            data: () => {
                return [
                    {
                        name: 'HomeWin',
                        value: 'HomeWin'
                    },
                    {
                        name: 'AwayWin',
                        value: 'AwayWin'
                    }
                ]
            },
            dependsOn: [ 'Home/Away' ]
        }
    ],
    dummyDataConfig: [
        {
            uiClass: TestFilter,
            name: 'competition',
            data: () => {
                return randomlyResolvingPromise( true, COMP_RESPONSE );
            },
            middleWares: {
                beforeOptionUpdate: data => {

                    const options = data.map( comp => {
                        return {
                            name: comp.compName,
                            value: comp.value,
                            extra: comp
                        }
                    } );
                    return [
                        ...options,
                        {
                            name: 'All',
                            value: '-1'
                        }
                    ];
                },
                decideDefault: options => {
                    return '-1';
                }
            }
        },
        {
            uiClass: TestFilter,
            name: 'season',
            data: filter => {
                return randomlyResolvingPromise( true, GET_SEASON_RESPONSE( filter.getCurrentOption().value ) );
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
                beforeOptionUpdate: apiData => {
                    //transform into option list
                    // add all options
                    const options = apiData.map( season => {
                        return {
                            name: season.seasonName,
                            value: season.value,
                            extra: season
                        }
                    } )
                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideDefault: options => {
                    return options[ 1 ].value;
                }
            },
            dependsOn: [ 'competition' ]
        },
        {
            uiClass: TestFilter,
            name: 'teams',
            data: filter => {
                return randomlyResolvingPromise( true, GET_TEAMS_RESPONSE( filter.getCurrentOption().value ) );
            },
            dependsOn: [ 'season' ],
            middleWares: {
                beforeOptionUpdate: apiData => {
                    // transform into options list
                    // add all option
                    const options = apiData.map( team => {
                        return {
                            name: team.teamName,
                            value: team.value,
                            extra: team
                        }
                    } )

                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideDefault: options => '-1',
                decideFilterEnabledState: disableWhenValue( '-1' ),
            }
        },
        {
            uiClass: TestFilter,
            name: 'Home/Away',
            data: () => {
                return [
                    {
                        name: 'Home',
                        value: 'Home'
                    },
                    {
                        name: 'Away',
                        value: 'Away'
                    }
                ]
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
            },
            dependsOn: [ 'teams' ]
        },
        {
            name: 'Win',
            uiClass: TestFilter,
            data: () => {
                return [
                    {
                        name: 'HomeWin',
                        value: 'HomeWin'
                    },
                    {
                        name: 'AwayWin',
                        value: 'AwayWin'
                    }
                ]
            },
            dependsOn: [ 'Home/Away' ]
        }
    ],
    dummyDataConfigNonDisabled: [
        {
            uiClass: TestFilter,
            name: 'competition',
            data: () => {
                return randomlyResolvingPromise( true, COMP_RESPONSE );
            },
            middleWares: {
                beforeOptionUpdate: data => {

                    const options = data.map( comp => {
                        return {
                            name: comp.compName,
                            value: comp.value,
                            extra: comp
                        }
                    } );
                    return [
                        ...options,
                        {
                            name: 'All',
                            value: '-1'
                        }
                    ];
                },
                decideDefault: options => {
                    return '2';
                }
            }
        },
        {
            uiClass: TestFilter,
            name: 'season',
            data: filter => {
                return randomlyResolvingPromise( true, GET_SEASON_RESPONSE( filter.getCurrentOption().value ) );
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
                beforeOptionUpdate: apiData => {
                    //transform into option list
                    // add all options
                    const options = apiData.map( season => {
                        return {
                            name: season.seasonName,
                            value: season.value,
                            extra: season
                        }
                    } )
                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideDefault: options => {
                    return options[ 1 ].value;
                }
            },
            dependsOn: [ 'competition' ]
        },
        {
            uiClass: TestFilter,
            name: 'teams',
            data: filter => {
                return randomlyResolvingPromise( true, GET_TEAMS_RESPONSE( filter.getCurrentOption().value ) );
            },
            dependsOn: [ 'season' ],
            middleWares: {
                beforeOptionUpdate: apiData => {
                    // transform into options list
                    // add all option
                    const options = apiData.map( team => {
                        return {
                            name: team.teamName,
                            value: team.value,
                            extra: team
                        }
                    } )

                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideFilterEnabledState: disableWhenValue( '-1' ),
            }
        },
        {
            uiClass: TestFilter,
            name: 'Home/Away',
            data: () => {
                return [
                    {
                        name: 'Home',
                        value: 'Home'
                    },
                    {
                        name: 'Away',
                        value: 'Away'
                    }
                ]
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
            },
            dependsOn: [ 'teams' ]
        },
        {
            name: 'Win',
            uiClass: TestFilter,
            data: () => {
                return [
                    {
                        name: 'HomeWin',
                        value: 'HomeWin'
                    },
                    {
                        name: 'AwayWin',
                        value: 'AwayWin'
                    }
                ]
            },
            dependsOn: [ 'Home/Away' ]
        }
    ],
    dummyDataConfigCyclic: [
        {
            uiClass: TestFilter,
            name: 'competition',
            data: () => {
                return randomlyResolvingPromise( true, COMP_RESPONSE );
            },
            middleWares: {
                beforeOptionUpdate: data => {

                    const options = data.map( comp => {
                        return {
                            name: comp.compName,
                            value: comp.value,
                            extra: comp
                        }
                    } );
                    return [
                        ...options,
                        {
                            name: 'All',
                            value: '-1'
                        }
                    ];
                },
                decideDefault: options => {
                    return '2';
                }
            }
        },
        {
            uiClass: TestFilter,
            name: 'season',
            data: filter => {
                return randomlyResolvingPromise( true, GET_SEASON_RESPONSE( filter.getCurrentOption().value ) );
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
                beforeOptionUpdate: apiData => {
                    //transform into option list
                    // add all options
                    const options = apiData.map( season => {
                        return {
                            name: season.seasonName,
                            value: season.value,
                            extra: season
                        }
                    } )
                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideDefault: options => {
                    return options[ 1 ].value;
                }
            },
            dependsOn: [ 'teams' ]
        },
        {
            uiClass: TestFilter,
            name: 'teams',
            data: filter => {
                return randomlyResolvingPromise( true, GET_TEAMS_RESPONSE( filter.getCurrentOption().value ) );
            },
            dependsOn: [ 'season' ],
            middleWares: {
                beforeOptionUpdate: apiData => {
                    // transform into options list
                    // add all option
                    const options = apiData.map( team => {
                        return {
                            name: team.teamName,
                            value: team.value,
                            extra: team
                        }
                    } )

                    return [
                        {
                            name: 'All',
                            value: '-1'
                        },
                        ...options
                    ]
                },
                decideFilterEnabledState: disableWhenValue( '-1' ),
            }
        },
        {
            uiClass: TestFilter,
            name: 'Home/Away',
            data: () => {
                return [
                    {
                        name: 'Home',
                        value: 'Home'
                    },
                    {
                        name: 'Away',
                        value: 'Away'
                    }
                ]
            },
            middleWares: {
                decideFilterEnabledState: disableWhenValue( '-1' ),
            },
            dependsOn: [ 'teams' ]
        },
        {
            name: 'Win',
            uiClass: TestFilter,
            data: () => {
                return [
                    {
                        name: 'HomeWin',
                        value: 'HomeWin'
                    },
                    {
                        name: 'AwayWin',
                        value: 'AwayWin'
                    }
                ]
            },
            dependsOn: [ 'Home/Away' ]
        }
    ]
}
