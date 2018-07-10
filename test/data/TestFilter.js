var TestFilter = function() {

    this.callback = false;
    this.uiValue = false;
    this.uiRenderData = {
        title: '',
        options: [],
        defaultOptionValue: false
    },
    this.uiState = 'idle';
    this.uiContainer = false;
};

TestFilter.prototype.setSelectedCallback = function( callback ) {
    this.callback = callback;
};

TestFilter.prototype.onValueChanged = function( id ) {
    this.setValue( id );
    this.callback( id );
};


TestFilter.prototype.setValue = function( id ) {
    this.uiValue = id;
};

TestFilter.prototype.render = function( title, options, defaultOptionValue ) {

    this.uiRenderData =  {
        title,
        options,
        defaultOptionValue
    }
};

TestFilter.prototype.setLoadingState = function() {
    this.uiState = 'loading';
};

TestFilter.prototype.removeLoadingState = function() {
    this.uiState = 'idle';
};

TestFilter.prototype.setDisabledState = function() {
    this.uiState = 'disabled';
};

TestFilter.prototype.isDisabled = function() {
    return this.uiState === 'disabled';
};

TestFilter.prototype.setErrorState = function() {
    this.uiState = 'error';
};

TestFilter.prototype.setContainer = function( container ) {
    this.uiContainer = container;
};
