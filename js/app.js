(function(){

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
      dataStoreItem.videoUrl = item.id.videoId;
      return dataStoreItem;
    });
    // is there a way we can call this within renderState instead?
    // we're doing it here as a callback to getData to make sure we have the data
    // before trying to render
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
        // was trying to figure out how to catch an error on an ajax request
        // I'd rather call the renderMessage function within renderState rather than here
        // however if there is an uncaught error code execution would stop and we
        // would never get there
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

  // when is it a good idea to pass in callbacks as parameters?
  // and why would you do that if they are available in scope?
  // here we're calling a lot of different functions conditionally
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
      var results = dataStore.items.map(function(item, index) {
        return (
          '<div class="video_item" data-id="' + index + '">\
            <img class="video_image" src="' + item.imageUrl + '" data-id="' + index + '"/>\
            <iframe class="video_iframe" src="https://www.youtube.com/embed/' + item.videoUrl + '" data-id="' + index + '"/>\
          </div>'
        );
      });
      $('.results').html(results);
    }
  };

  function renderMessage(dom, state) {
    state.message ? $(dom.message).show() : $(dom.message).hide();
    $(dom.message).html(state.message);
  };

  function clearInput(dom) {
    $(dom.searchInput).val('');
  }

  function renderState(dom, state) {
    renderMessage(dom, state);
    clearInput(dom);
    // displayResults(dom, dataStore);
  };

  //////////////////////////////////////////////////////////////////
  // EVENT LISTENERS
  //////////////////////////////////////////////////////////////////
  function listenForThumbnailClick(dom) {
    $(dom.results).on('click', '.video_image', function(event) {
      event.preventDefault();
      var dataId = $(event.target).attr('data-id');
      var src = $('iframe[data-id="' + dataId + '"]')[0].src;
      // if source attr doesn't have autoplay set we set it
      // otherwise we remove it
      if (src.indexOf('?autoplay=1') < 0) {
        $('iframe[data-id="' + dataId + '"]')[0].src += '?autoplay=1';
      } else {
        var newUrl = src.replace(/\?autoplay=1/i, '');
        $('iframe[data-id="' + dataId + '"]')[0].src = newUrl;
      }
    });
  };

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
    dom.videoImage = '.video_image';

    listenForFormSubmit(dom, state);
    listenForAjaxError();
    listenForThumbnailClick(dom);
  });

}());
