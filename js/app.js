var dataStore = {
  items: null
};

var state = {
  searchTerm: null,
  message: null
};

////////////////////////////////////////////////////////////////////
// UPDATE DATA
////////////////////////////////////////////////////////////////////
function updateData(dataFromApi, dom, dataStore) {
  console.log('dataFromApi.items:', dataFromApi.items);
  dataStore.items = dataFromApi.items.map(function(item) {
    var dataStoreItem = {};
    dataStoreItem.imageUrl = item.snippet.thumbnails.high.url;
    return dataStoreItem;
  });
  displayResults(dom, dataStore);
};

////////////////////////////////////////////////////////////////////
// UPDATE STATE
////////////////////////////////////////////////////////////////////
function getData(dom, state, dataStore, updateData) {
  var settings = {
    url: 'https://www.googleapis.com/youtube/v3/search',
    data: {
      part: 'snippet',
      key: 'AIzaSyBxC_B-AwwOjxv-9VaGJUz5p6DJt7DnR_s',
      q: state.searchTerm
    },
    dataType: 'json',
    type: 'GET',
    success: function(dataFromApi) { updateData(dataFromApi, dom, dataStore) },
    error: function() {
      console.log('there was an error with your request');
      // still need to render this message
      // was trying to figure out how to catch an error on an ajax request
      // don't want to call renderMessage here bc we are alrady calling it
      updateMessage(state, 'There was an error with your request');
      renderMessage(dom, state);
    }
  };

  $.ajax(settings);
};

function updateSearchTerm(state, searchTerm) {
  state.searchTerm = searchTerm;
}

function updateMessage(state, message) {
  state.message = message;
};

// should I pass in callbacks as parameters here?
function validateInput(dom, state, dataStore) {
  var searchTerm = $(dom.searchInput).val().trim();
  if (searchTerm === '') {
    updateSearchTerm(state, searchTerm);
    updateMessage(state, 'Please enter a search term');
    dataStore.items = null;
  } else {
    updateSearchTerm(state, searchTerm);
    updateMessage(state, '');
    getData(dom, state, dataStore, updateData);
  }
};

function updateState(dom, state, dataStore) {
  validateInput(dom, state, dataStore);
  console.log('state:', state);
};

//////////////////////////////////////////////////////////////////
// RENDER STATE
//////////////////////////////////////////////////////////////////
function displayResults(dom, dataStore) {
  if (dataStore.items) {
    var results = dataStore.items.map(function(item) {
      return '<div><img src="' + item.imageUrl + '" /></div>'; 
    });
    $('.results').html(results);
  }
}

function renderMessage(dom, state) {
  state.message ? $(dom.message).show() : $(dom.message).hide();
  $(dom.message).html(state.message);
}

function renderState(dom, state) {
  renderMessage(dom, state);
  // displayResults(dom, dataStore);
};

//////////////////////////////////////////////////////////////////
// EVENT LISTENERS
//////////////////////////////////////////////////////////////////
function listenForFormSubmit(dom, state) {
  $(dom.button).click(function(event) {
    event.preventDefault();
    updateState(dom, state, dataStore);
    renderState(dom, state);
  });
};

// may remove if we don't need it
function listenForAjaxError() {
  $(document).ajaxError(function() {
    console.log('there was an error with your request');
  });
};

//////////////////////////////////////////////////////////////////
// WINDOW LOAD
//////////////////////////////////////////////////////////////////
$(function() {
  var dom = {};
  dom.message = '.message';
  dom.heading = '.heading';
  dom.searchInput = '.input-search';
  dom.button = '.button';
  dom.results = '.results';

  listenForFormSubmit(dom, state);
  listenForAjaxError();
});
