# Fylters [![Build Status](https://travis-ci.org/ammanvedi/fylters.svg?branch=master)](https://travis-ci.org/ammanvedi/fylters)
A browser framework for building interconnected filters. You can see it in action on the [example page](https://ammanvedi.github.io/fylters/)

<img style="width:100%" src="https://image.ibb.co/bEipZ8/Jul_14_2018_20_03_24.gif" ></img>

### Install

```bower install fylters --save```

### Usage

```html
<div id="container"></div>

<script>
	new fylter.FilterSet(
		document.getElementById( 'container' ),
		{
			filters: [...],
			onUpdate: newState => {
				console.log( newState );
			}
		} );
</script>

```
The full specification of the FilterSet config can be found in the [docs](https://ammanvedi.github.io/fylters/developer/global.html#FilterSetConfig__anchor)

The ```filters``` property of the configuration is where the magic happens. An array of objects is passed in, each defining a single filter. The full specification can be seen in the [docs](https://ammanvedi.github.io/fylters/developer/global.html#FilterConfig__anchor)

Here is an example config and explanation that will generate the following filter set

![Example Filter](https://media.giphy.com/media/B1Tnd4Ga0y4eqhWOMz/giphy.gif)

```javascript
[
    {
        name: 'Animals',
        // this is the data function we can return an array,
        // promise or url (string) to fetch. in this case we will
        // just return some static data
        data: () => {
            return [
                {
                    kind: 'Dogs'
                },
                {
                    kind: 'Cats'
                }
            ]
        },
        // middlewares allow us to intervene at key points during
        // the filters operation for a full list iof middlewares
        // see https://ammanvedi.github.io/fylters/developer/global.html#Middlewares__anchor
        middleWares: {
            // here we can take a look at which options
            // we are about to render and we can return the value
            // of a specific option to set it as a default
            decideDefault: options => {
                return options[ 0 ].value;
            },
            // this middleware function is called with the result
            // of our data function above, as you can see
            // our data function is returning data in a undesirable
            // format since we need an array of Options,
            //
            // See: https://ammanvedi.github.io/fylters/developer/global.html#Option__anchor
            //
            // Here we can take in that data and transform
            // it into the correct format, and in this case
            // we will also add a new 'All' option
            beforeOptionUpdate: data => {
                const animals = data.map( animal => {
                    return {
                        name: animal.kind,
                        value: animal.kind + 'Id',
                        // here we can optionally return some metadata
                        // for the option, and this will be available
                        // to us when the state updates.
                        extra: animal
                    }
                } );

                return [
                    {
                        name: 'All',
                        value: '-1' // remember values should always be strings !!
                    },
                    ...animals
                ]
            }
        }
    },
    {
        name: 'Species',
        // This is how you define a dependency in the
        // Fylter library, this means that whenever the
        // Animals filter is updated this filters data function
        // and middlewares will be invoked with the animal filter
        // as a parameter
        dependsOn: [ 'Animals' ],
        data: animalFilter => {
            var speciesData = {
                DogsId: [
                    {
                        name: 'Husky',
                        value: 0
                    },
                    {
                        name: 'German Shepard',
                        value: 1
                    }
                ],
                CatsId: [
                    {
                        name: 'Siamese',
                        value: 0
                    },
                    {
                        name: 'Tabby',
                        value: 1
                    }
                ]
            };
            // the data in this filter is based on the Animals
            // filter so lets pick some data based on its ID
            return speciesData[ animalFilter.getCurrentOption().value ];
        },
        middleWares: {
            decideDefault: options => {
                return options[ 0 ].value;
            },
            // This is the last type of middleware, it allows us
            // to return a boolean to decide when a filter should be
            // enabled, in this case when Animals is 'All' this
            // filter is disabled
            decideFilterEnabledState: animalFilter => {
                return animalFilter.getCurrentOption().value !== '-1';
            }
        }
    }
]


```

Each time your filter state changes the `onUpdate` function will be called with the new state of the filter as represented by an array of [filter state objects](https://ammanvedi.github.io/fylters/developer/global.html#CurrentFilterValue__anchor) you can then do with this information as you please.

### Custom FIlter UI

Fylter is not intended to offer a perfect solution for the UI of a filter, although a default filter (with styling) is provided, you may find that you want to use your own filters and still take advantage of the dependecy management provided by Fylter.

You can implement a custom filter by extending the `fylter.FilterInterface` class and then passing your class as the `uiClass` in your [filter config](https://ammanvedi.github.io/fylters/developer/global.html#FilterConfig__anchor)

You can see this implemented in the [NativeSelectFilter](https://github.com/ammanvedi/fylters/blob/master/lib/js/filter/NativeSelect.js) class which is based on a <select> element

### Data Fetch Layer

When you return a string from the [filter config](https://ammanvedi.github.io/fylters/developer/global.html#FilterConfig__anchor) data property this will be assumed to be a url and a network call will be made.

##### Inserted Values

If your filter is dependant on another filter you can directly use this filters value in the api url, for example in our animal example above, our 'Species' filter could reference the value of the 'Animals' filter as follows

```javascript
{
    data: () => {
        return 'http://someapi.com/path/{{Animals}}';
    }
}
```

if the value selected in the 'Animals' filter is 25 the url will be `http://someapi.com/path/25`

##### Custom Fetch Implementation

*But wait ! what if i want to use jsonP or some other type of non JSON based API* !

You can specify a custom fetching function through the [filter set config](https://ammanvedi.github.io/fylters/developer/global.html#FilterSetConfig__anchor) that is passed into the `fylter.FilterSet` constructor. This function takes a url and returns a promise that resolves with the fetched data.

If you need to do further processing see the [beforeOptionUpdate](https://ammanvedi.github.io/fylters/developer/global.html#Middlewares__anchor) middleware function.

### Licence

MIT
