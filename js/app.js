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
    dataStore.items = dataFromApi.items.map(function(item) {
      var dataStoreItem = {};
      dataStoreItem.imageUrl = item.snippet.thumbnails.high.url;
      dataStoreItem.videoUrl = item.id.videoId;
      return dataStoreItem;
    });
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
      type: 'GET'
    };

    $.ajax(settings)
      .done(function(dataFromApi) {
        updateData(dataFromApi, dom, dataStore);
      })
      .fail(function() {
        // did not call update state here bc getData is called inside update state
        // we only want to update the message here
        updateMessage(state, 'There was an error with your request');
      })
      .always(function() {
        renderState(dom, state);
      });
  };

  function updateSearchTerm(dom, state) {
    state.searchTerm = $(dom.searchInput).val().trim();
  }

  function updateMessage(state, message) {
    state.message = message;
  };

  function validateInput(dom, state, dataStore) {
    return $(dom.searchInput).val().trim() === '' ? false : true;
  };

  function updateState(dom, state, dataStore) {
    updateSearchTerm(dom, state);
    if (validateInput(dom, state, dataStore)) {
      updateMessage(state, '');
      // getData will call renderState as it's callback
      getData(dom, state, dataStore, updateData);
    } else {
      updateMessage(state, 'Please enter a search term');
      dataStore.items = null;
      renderState(dom, state);
    }
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
      $(dom.results).html(results);
    } else {
      $(dom.results).html('');
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
    displayResults(dom, dataStore);
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
    listenForThumbnailClick(dom);
  });

}());
