

// JSONP([uri], [data], [custom_method_name], [callback])

const jsonpPromise = ( url, params = {} ) => {
    return new Promise( ( resolve, reject ) => {

        JSONP( url, params, 'callback', data => {
            resolve( data );
        } );

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

//
// When we call initialise on a filter what we get back is a promise that will resolve when the filter has fetched its
// data and it has also updated all its dependencies.
// When this resolves we can say that the folter has reached a new state and we can tell the user
// However when we first initialise we want to manually call an init on each root filter, this means that the filter
// controller will think that thew filter has reached a new state more than once, when in reality the first state reached
// will be followed by another update.
// Inorder to get around this when we first initialise all filters we ;
//
// - keep the returned promises in an array
// - set the state to initialising
//
// we can then wait for all root filters to have updated deps and to prevent notifying the user after each filter has finished updating
// we just to a check agaist the init state. if it is initialising we dont callback on each tree update and delegate this to
// the .then() of the promise.all call
//


//https://www.skiddle.com/api/v1/venues/?latitude=53.4839&longitude=-2.2446&radius=5&eventcode=LIVE&description=1&api_key=7b8ab215e66d06e23c5f8b6a691de015
window.EVENTS = [
    {
        name: 'Venues',
        data: () => {
            //https://fzaek0p72h.execute-api.eu-west-2.amazonaws.com/prod/proxy?endpoint=https://www.skiddle.com/api/v1/venues/
            return 'https://app.ticketmaster.com/discovery/v2/venues.json?apikey=pCALrUaxEUvEdwf1iQ4BYged01Bn1ZJF';
        },
        middleWares: {
            beforeOptionUpdate: data => {

                return data.data._embedded.venues.map( venue => {
                    return {
                        extra: venue,
                        value: venue.id,
                        name: venue.name
                    }
                } )

            }
        }
    },
    {
        name: 'Events',
        dependsOn: [ 'Venues' ],
        data: () => {
            return 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=pCALrUaxEUvEdwf1iQ4BYged01Bn1ZJF&venueId={{Venues}}';
        },
        middleWares: {
            beforeOptionUpdate: data => {

                return data.data._embedded.events.map( event => {
                    return {
                        extra: event,
                        value: event.id,
                        name: event.name
                    }
                } )

            }
        }
    }
]

window.GHIBLI = [
    {
        name: 'Films',
        data: () => {
            return 'https://ghibliapi.herokuapp.com/films';
        },
        middleWares: {
            beforeOptionUpdate: data => {

                const options = data.data.map( film => {
                    return  {
                        extra: film,
                        name: film.title,
                        value: film.id
                    }
                } );

                return options;
            },
            decideDefault: () => '58611129-2dbc-4a81-a72f-77ddfc1b1b49'
        },
    },
    {
        name: 'Species',
        data: filmSelected => {

            const speciesPromises = filmSelected.getCurrentOption().extra.species.map( species => {
                return axios.get( species );
            } );

            return Promise.all( speciesPromises )
                    .then( data => {

                        return data.map( response => {
                            return {
                                extra: response.data,
                                name: response.data.name,
                                value: response.data.id
                            }
                        } );
                    } );

        },
        dependsOn: [ 'Films' ]
    },
    {
        name: 'People',
        data: speciesSelected => {

            const peoplePromises = speciesSelected.getCurrentOption().extra.people.map( person => {
                return axios.get( person );
            } );

            return Promise.all( peoplePromises )
                    .then( data => {

                        return data.map( response => {
                            return {
                                extra: response.data,
                                name: response.data.name,
                                value: response.data.id
                            }
                        } );
                    } );

        },
        dependsOn: [ 'Species' ]
    }
]

window.MUSIC = [
    {
        name: 'UK Top 10 Artist',
        data: () => {
            return jsonpPromise( 'http://api.musixmatch.com/ws/1.1/chart.artists.get', {
                page: 1,
                page_size: 10,
                country: 'gb',
                apikey: 'c27ca7729d50a9fb9654ac63781a6d65',
                format: 'jsonp'
            } )
        },
        middleWares: {
            beforeOptionUpdate: data => {
                console.log( data );
                return data.message.body.artist_list.map( artist => {
                    return {
                        extra: artist,
                        value: artist.artist.artist_id,
                        name: artist.artist.artist_name
                    }
                } )
            }
        }
    },
    {
        name: 'Albums',
        data: artistFilter => {
            return jsonpPromise( 'http://api.musixmatch.com/ws/1.1/artist.albums.get', {
                page: 1,
                page_size: 10,
                country: 'gb',
                apikey: 'c27ca7729d50a9fb9654ac63781a6d65',
                format: 'jsonp',
                artist_id: artistFilter.getCurrentOption().value
            } );
        },
        middleWares: {
            beforeOptionUpdate: data => {
                console.log( data );
                return data.message.body.album_list.map( album => {
                    return {
                        extra: album,
                        value: album.album.album_id,
                        name: album.album.album_name
                    }
                } )
            },
        },
        dependsOn: [ 'UK Top 10 Artist' ]
    },
    {
        name: 'Tracks',
        dependsOn: [ 'Albums' ],
        data: albumFilter => {
            return jsonpPromise( 'http://api.musixmatch.com/ws/1.1/album.tracks.get', {
                page: 1,
                page_size: 50,
                country: 'gb',
                apikey: 'c27ca7729d50a9fb9654ac63781a6d65',
                format: 'jsonp',
                album_id: albumFilter.getCurrentOption().value
            } );
        },
        middleWares: {
            beforeOptionUpdate: data => {
                return data.message.body.track_list.map( track => {
                    return {
                        extra: track,
                        value: track.track.track_id,
                        name: track.track.track_name
                    }
                } )
            }
        }
    }
]

document.addEventListener( 'DOMContentLoaded', () => {

    document.querySelectorAll( '.js-container' ).forEach( el => {
        new fylter.FilterSet( el,  {
            filters: window[ el.getAttribute( 'data-set' ) ],
            onUpdate: state => {
                console.log( 'new state', state );
            }
        } );
    } )


} );
