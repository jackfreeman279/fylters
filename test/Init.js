mocha.setup( { ui: 'bdd'} );
expect = chai.expect;
mocha.checkLeaks();
mocha.globals(['jQuery', 'LiveReload']);
