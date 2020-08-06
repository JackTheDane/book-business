/*
|--------------------------------------------------------------------------
| CUSTOM.JS
|--------------------------------------------------------------------------
|
| The main javascript file of the project
|
*/

/*
|--------------------------------------------------------------------------
| Routing
|--------------------------------------------------------------------------
*/

document.addEventListener('click', (e) => {

  if (e.target && e.target.classList.contains('doBooking')) {
    // let travel = ;
    // let history = JSON.parse(localStorage.getItem('history'));

    localStorage.flightSelected = e.target.getAttribute('data-json');

    // if(history)
    //   history.unshift(travel);
    // else
    //   history = [travel];

    // localStorage.setItem('history', JSON.stringify(history));
    route('book');

  } else if (e.target && e.target.classList.contains('backArrowIcon')) {
    route('book', true);

  } else if (e.target && e.target.classList.contains('cached')) {
    let searchObject = JSON.parse(e.target.getAttribute('data-json')).searchObject;

    ø('#search-bar__departure').dataset.airportId = searchObject.airportDeparture;
    ø('#search-bar__departure').value = jjAirports[searchObject.airportDeparture].city + ' (' + jjAirports[searchObject.airportDeparture].code + ')';
    ø('#search-bar__destination').dataset.airportId = searchObject.airportDestination;
    ø('#search-bar__destination').value = jjAirports[searchObject.airportDestination].city + ' (' + jjAirports[searchObject.airportDestination].code + ')';
    ø('#search-bar__passengers').value = searchObject.flightPassengers;
    ø('#search-bar__class').value = searchObject.flightClass;
    ø('#search-bar__radio-wrapper input[name = departureTime][value = ' + searchObject.timeDeparture + ']').checked = true;
    ø('#search-bar__radio-wrapper input[name = homeTime][value = ' + searchObject.timeHome + ']').checked = true;
    ø('#search-bar__return-select input[name = isReturn][value = ' + searchObject.isReturn + ']').checked = true;

    // Add outline to searchbar
    ø('#search-bar').classList.add('searchParametersChanged');

    // Toggle isReturn if needed
    toggleOneWay();

    // Scroll to it if needed
    scrollIntoViewIfNeeded(ø('#search-bar'));
  }
})

// Remove changed class again from search-bar
ø('#search-bar').addEventListener('animationend', function () {
  this.classList.remove('searchParametersChanged');
})

// Define the contentContainer element for later use
let contentContainer = ø('#content');

// Get history
let history = JSON.parse(localStorage.getItem('history'));
if (history && localStorage.user && JSON.parse(localStorage.user).isOnline) {
  let html = `
    <h3 class="text-white font-weight-light text-center mb-3">
      Previous flights
    </h3>
  `;
  history.forEach((item) => {
    html += getResultFromObject(item, true);
  });
  contentContainer.insertAdjacentHTML('beforeend', html);
}

// Keyframes used for the content animations
let translateDistance = '200px';
let animationDuration = 200;

let keyframes = {
  out: [
    { opacity: 1, transform: 'translateX(0)' },
    { opacity: 0, transform: 'translateX(-' + translateDistance + ')' }
  ],
  in: [
    { opacity: 0, transform: 'translateX(' + translateDistance + ')' },
    { opacity: 1, transform: 'translateX(0)' }
  ],
  backIn: [
    { opacity: 0, transform: 'translateX(-' + translateDistance + ')' },
    { opacity: 1, transform: 'translateX(0)' }
  ],
  backOut: [
    { opacity: 1, transform: 'translateX(0)' },
    { opacity: 0, transform: 'translateX(' + translateDistance + ')' }
  ],
}

let oldHTML = '';

// Routing function
function route(component, back) {
  // Save html
  if (!back)
    oldHTML = contentContainer.innerHTML;
  // Component path
  let componentPath = 'https://jackthedane.github.io/book-business/components/' + component + '.html';

  fetch(componentPath).then(response => {
    return response.text()
  }).then(resultsHTML => {
    console.log(oldHTML);

    if (back)
      resultsHTML = oldHTML;

    // Define the fadeOut animation
    var fadeOut = contentContainer.animate(keyframes.out, { fill: 'forwards', duration: animationDuration });
    if (back)
      fadeOut = contentContainer.animate(keyframes.backOut, { fill: 'forwards', duration: animationDuration });;

    // Trigger the animation with the onfinish event
    fadeOut.onfinish = () => {
      contentContainer.innerHTML = resultsHTML; // Update the HTML
      if (component == 'book')
        autoFillBookingForm();

      if (back)
        contentContainer.animate(keyframes.backIn, { fill: 'forwards', duration: animationDuration }) // Animate content in
      else
        contentContainer.animate(keyframes.in, { fill: 'forwards', duration: animationDuration }) // Animate content in

    }

  })
}

/*
|--------------------------------------------------------------------------
| Date Picker
|--------------------------------------------------------------------------
*/

// Initiate flatpickr on date fields
flatpickr('#search-bar__departure-date', {
  dateFormat: "d. F",
  minDate: "today",
  maxDate: new Date().fp_incr(365), // Sets the maxDate to be chosen 1 year in the future
  defaultDate: "today",

  // Makes sure that the return date is not lower than the departure date
  onClose: (selectedDates, dateStr, instance) => {
    let newDate = new Date(selectedDates);
    let defaultDate = new Date(selectedDates).fp_incr(4);

    flatpickr('#search-bar__home-date', {
      dateFormat: "d. F",
      minDate: "today",
      maxDate: new Date().fp_incr(365), // Sets the maxDate to be chosen 1 year in the future
      defaultDate: defaultDate,
      "locale": {
        "firstDayOfWeek": 1 // start week on Monday
      },
      minDate: newDate
    })
  }

})
flatpickr('#search-bar__home-date', {
  dateFormat: "d. F",
  minDate: "today",
  maxDate: new Date().fp_incr(365), // Sets the maxDate to be chosen 1 year in the future
  defaultDate: new Date().fp_incr(4),
  "locale": {
    "firstDayOfWeek": 1 // start week on Monday
  }
})

/*
|--------------------------------------------------------------------------
| Airport selector
|--------------------------------------------------------------------------
*/

// Set initial value for Departure airport
// Airport Code, city, country
// CPH, Copenhagen, Denmark
// BLL, Billund, Denmark
// OSL, Oslo, Norway
// STO, Stockholm, Sweden
// LON, London, United Kingdom
// BER, Berlin, Germany
// MAD, Madrid, Spain
// PAR, Paris, France
// ROM, Rome, Italy

let jjAirports = {
  "id_0": {
    "code": "CPH",
    "city": "Copenhagen",
    "country": "Denmark"
  },
  "id_1": {
    "code": "BLL",
    "city": "Billund",
    "country": "Denmark"
  },
  "id_2": {
    "code": "OSL",
    "city": "Oslo",
    "country": "Norway"
  },
  "id_3": {
    "code": "STO",
    "city": "Stockholm",
    "country": "Sweden"
  },
  "id_4": {
    "code": "LON",
    "city": "London",
    "country": "United Kingdom"
  },
  "id_5": {
    "code": "BER",
    "city": "Berlin",
    "country": "Germany"
  },
  "id_6": {
    "code": "MAD",
    "city": "Madrid",
    "country": "Spain"
  },
  "id_7": {
    "code": "PAR",
    "city": "Paris",
    "country": "France"
  },
  "id_8": {
    "code": "ROM",
    "city": "Rome",
    "country": "Italy"
  },
  "id_9": {
    "code": "AAR",
    "city": "Århus",
    "country": "Denmark"
  }
};

/*** Add Airports to ul airportlist ***/
let sAirportList = '';

// Loop through airports
for (var id in jjAirports) {
  if (jjAirports.hasOwnProperty(id)) {

    // Set the JSON object of the loop cycle
    const jAirport = jjAirports[id]

    // Add li with airport info to airport list
    sAirportList += '<li class="airport-list-item" data-city="' + jAirport.city + ' (' + jAirport.code + ')' + '" data-id="' + id + '"> ' + jAirport.city + ' (' + jAirport.code + '), ' + jAirport.country + ' </li>'

  }
}

let apList = ø('#search-bar__airport-list');

apList.innerHTML = sAirportList;

let airportsInList = ø('#search-bar__airport-list li');

// Variable for the last selected airport field in the search bar
let selectedAirportField = '';

let selectAirportActive = false;

function getAirports(element) {
  element.addEventListener('focus', () => {

    selectAirportActive = true;

    if (selectedAirportField != element) {
      element.setSelectionRange(0, element.value.length)
    }
    selectedAirportField = element;

    var viewportOffset = element.getBoundingClientRect();
    // these are relative to the viewport, i.e. the window
    var top = viewportOffset.top;
    var left = viewportOffset.left;
    var height = element.offsetHeight;
    var width = element.offsetWidth;

    apList.style.display = 'block';
    apList.style.top = top + height + 'px';
    apList.style.left = left + 'px';
    apList.style.width = width + 'px';

    filterAirportList(element);

    // Add hovered state to firstChild
    addHoveredToFirstListItem(airportsInList);

    // scrollList(element);

    // Hides the list on blur
    element.addEventListener('blur', () => {
      apList.style.display = '';

      // Reset selectedAirportField
      selectedAirportField = '';
      selectAirportActive = false;
    })

    // Filter airports in airport list
    element.addEventListener('keyup', e => {
      filterAirportList(element);

      // Checks that the key is not UP, DOWN or ENTER
      if (e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 13) {
        addHoveredToFirstListItem(airportsInList);
      }

    });
  });
}

// Add support for arrow keys
document.onkeydown = function (e) { // listen to keyboard events
  if (selectAirportActive) {
    // console.log('Keypress!');
    let hoveredLi = ø('#search-bar__airport-list li:not(.hidden).hovered')
    let visibleListItems = ø('#search-bar__airport-list li:not(.hidden)')

    // Checks that a hovered element exists and that there is more than one visisble list item
    if (hoveredLi.length !== 0) {
      switch (e.keyCode) {
        case 38: // if the UP key is pressed
          hoverPrevSibling(hoveredLi);
          break;
        case 40: // if the DOWN key is pressed
          hoverNextSibling(hoveredLi);
          break;
        case 13: // if the ENTER key is pressed
          e.preventDefault();
          addAirportToInput(hoveredLi);
          apList.style.display = '';

          // Reset selectedAirportField
          selectedAirportField = '';
          selectAirportActive = false;
          break;
      }
    } else {
      addHoveredToFirstListItem(airportsInList)
    }
  }
}

// Functions for finding and highlighting the next and previous siblings, that is visible
function hoverNextSibling(e) {
  let nextSibling = e.nextElementSibling;

  // If no sibling was found, nextElementSibling returns null. If so, stop the function
  if (nextSibling !== null) {
    // If sibling exists, but is hidden, redo function to find try next sibling
    if (nextSibling.classList.contains('hidden')) {
      hoverNextSibling(nextSibling)
    } else {
      // If sibling is not hidden, remove all other hidden-classes and add it to sibling element
      removeHoveredStateFromList(ø('#search-bar__airport-list li:not(.hidden)'))
      nextSibling.classList.add('hovered')
    }
  }
}

function hoverPrevSibling(e) {
  let previousSibling = e.previousElementSibling;

  // If no sibling was found, previousElementSibling returns null. If so, stop the function
  if (previousSibling !== null) {
    // If sibling exists, but is hidden, redo function to find try previous sibling
    if (previousSibling.classList.contains('hidden')) {
      hoverPrevSibling(previousSibling)
    } else {
      // If sibling is not hidden, remove all other hidden-classes and add it to sibling element
      removeHoveredStateFromList(ø('#search-bar__airport-list li:not(.hidden)'))
      previousSibling.classList.add('hovered')
    }
  }
}

function removeHoveredStateFromList(list) {
  list.forEach(listItem => {
    listItem.classList.remove('hovered');
  });
}

apList.addEventListener('mouseover', function (e) {
  if (e.target.parentNode === this) {
    removeHoveredStateFromList(airportsInList);

    e.target.classList.add('hovered');
  }
});

apList.addEventListener('mouseleave', function (e) {
  removeHoveredStateFromList(airportsInList);
  addHoveredToFirstListItem(airportsInList);
});

function filterAirportList(input) {
  airportsInList.forEach(airport => {

    // Value of each list items match with the input value. -1 means no match was found
    let fieldValueMatch = airport.innerHTML.toLowerCase().indexOf(input.value.toLowerCase());

    // If a match
    if (fieldValueMatch == -1) {
      airport.classList.add('hidden');
    } else {
      airport.classList.remove('hidden');
    }
  });
}

function addHoveredToFirstListItem(list) {
  list.forEach(listItem => {
    listItem.classList.remove('hovered');
  });

  let visibleListItems = ø('#search-bar__airport-list li:not(.hidden)')

  if (visibleListItems.length !== 0) {

    if (visibleListItems.length > 1) {
      visibleListItems[0].classList.add('hovered');
    } else {
      visibleListItems.classList.add('hovered');
    }
  }
}

// Add event listener for clicking on an airport in the airport list
document.addEventListener('mousedown', (e) => {
  if (e.target && e.target.classList.contains('airport-list-item')) {
    addAirportToInput(e.target);
  }
});

function addAirportToInput(airport) {
  selectedAirportField.dataset.airportId = airport.dataset.id;
  selectedAirportField.value = airport.dataset.city;
}

getAirports(ø('#search-bar__departure'));
getAirports(ø('#search-bar__destination'));

/*
|--------------------------------------------------------------------------
| Flight search function
|--------------------------------------------------------------------------
*/

let jFlightSearchParams = {}

function searchFlight() {
  let isReturn = (ø('#search-bar__return-select input:checked[name = isReturn]').value == 'true');

  minimizeSearchBar();

  jFlightSearchParams = {
    "airportDeparture": ø('#search-bar__departure').dataset.airportId,
    "airportDestination": ø('#search-bar__destination').dataset.airportId,
    "flightPassengers": ø('#search-bar__passengers').value,
    "flightClass": ø('#search-bar__class').value,
    "dateDeparture": ø('#search-bar__departure-date').value,
    "dateHome": ø('#search-bar__home-date').value,
    "timeDeparture": ø('#search-bar__radio-wrapper input:checked[name = departureTime]').value,
    "timeHome": ø('#search-bar__radio-wrapper input:checked[name = homeTime]').value,
    "isReturn": isReturn
  }

  ø('body').classList.remove('frontPage');

  contentContainer.innerHTML = generateResults(10, jFlightSearchParams, isReturn);

  return false;
}

/*
|--------------------------------------------------------------------------
| Search bar functionality
|--------------------------------------------------------------------------
*/

ø('#search-bar-wrapper').addEventListener('click', e => {
  if (ø('body').classList.contains('search-bar-minimized')) {
    minimizeSearchBar();
  }
})

function minimizeSearchBar() {
  ø('body').classList.toggle('search-bar-minimized');
}

ø('#search-bar__return-select input').forEach(e => {
  e.addEventListener('change', toggleOneWay)
});

function toggleOneWay() {

  let isReturn = ø('#search-bar__return-select input[name = isReturn]:checked').value == 'true';

  if (isReturn) {
    ø('#search-bar__home-date').classList.remove('d-none');
    ø('#search-bar__home-time').classList.remove('d-none');
  } else {
    ø('#search-bar__home-date').classList.add('d-none');
    ø('#search-bar__home-time').classList.add('d-none');
  }
}

/*
|--------------------------------------------------------------------------
| Sigin Functions
|--------------------------------------------------------------------------
*/

let userObj = JSON.parse(localStorage.getItem('user'));
if (userObj && userObj.isOnline) {
  changeButton(true)
}

function changeButton(toSignOut) {
  if (toSignOut) {
    ø('.signin__button').innerHTML = 'Sign out';
    ø('.signin__button').classList.add('out');
  } else {
    ø('.signin__button').innerHTML = 'Sign in';
    ø('.signin__button').classList.remove('out');
  }
}

ø('.signin__button').addEventListener('click', e => {
  if (e.target.classList.contains('out')) {
    changeButton(false);
    let userObj = JSON.parse(localStorage.getItem('user'));
    userObj.isOnline = false;
    localStorage.setItem('user', JSON.stringify(userObj));

    reloadPage();
  } else {
    ø('.signin__overlay').classList.add('active');
  }
})

ø('.doLogin').addEventListener('click', e => {
  let userEmail = ø('#loginEmail').value;
  let userObj = JSON.parse(localStorage.getItem('user'));

  if (userEmail.toLowerCase == userObj.email.toLowerCase) {
    ø('.signin__overlay').classList.remove('active');
    changeButton(true);
    let userObj = JSON.parse(localStorage.getItem('user'));
    userObj.isOnline = true;
    localStorage.setItem('user', JSON.stringify(userObj));
    ø('#loginEmail').value = '';
    ø('#loginEmail').classList.remove('is-invalid');

    reloadPage();
  } else {
    let box = ø('.signin__box');
    ø('#loginEmail').classList.add('is-invalid');
    // box.classList.add('animateError');
    // box.addEventListener('animationend', function () {
    //   this.classList.remove('animateError');
    // })
  }
})

ø('.signin__overlay').addEventListener('click', e => {
  if (e.target.classList.contains('signin__overlay'))
    ø('.signin__overlay').classList.remove('active');

})

/*
|--------------------------------------------------------------------------
| Save user info Function
|--------------------------------------------------------------------------
*/

function saveUserInfo(e) {

  e.preventDefault();
  let uesrObj = {
    isOnline: true
  };

  let isValid = true;
  for (let i = 0; i < e.target.length; i++) {
    let input = e.target[i];
    if (input.localName = 'input') {
      if (input.value) {
        let value = input.value;
        if (input.name == 'cardNumber')
          value = '**** **** **** ' + value.slice(-4);

        uesrObj[input.name] = value;
      } else {
        isValid = false;
        input.parentElement.classList.add('is-invalid');
        input.parentElement.classList.add('animateError');
        input.parentElement.addEventListener('animationend', function () {
          this.classList.remove('animateError');
        })
      }
    }
  }


  if (isValid) {

    // Check if the user has allowed for his/her info to be saved
    if (ø('#saveInfo').checked) {
      localStorage.setItem('user', JSON.stringify(uesrObj));

      changeButton(true);

      let travel = JSON.parse(localStorage.flightSelected);
      let history = JSON.parse(localStorage.getItem('history'));

      if (history)
        history.unshift(travel);
      else
        history = [travel];

      localStorage.setItem('history', JSON.stringify(history));
    }

    route('confirm');
  }
}

function autoFillBookingForm() {
  let userObj = JSON.parse(localStorage.getItem('user'));
  if (userObj && !userObj.isOnline)
    return false;
  for (let input in userObj) {
    if (userObj.hasOwnProperty(input)) {
      ø(`input[name="${input}"]`).value = userObj[input];
    }
  }
}

/*
|--------------------------------------------------------------------------
| Helper functions
|--------------------------------------------------------------------------
*/

function scrollIntoViewIfNeeded(target) {
  var rect = target.getBoundingClientRect();

  if (rect.top < 0) {
    window.scrollTo(0, 0);
  }
}

function reloadPage() {
  location.reload();
}

/*
|--------------------------------------------------------------------------
| Utility functions
|--------------------------------------------------------------------------
*/

// jQuery replacement function!
function ø(query) {
  let elmArray = document.querySelectorAll(query);
  return elmArray.length == 1 ? elmArray[0] : elmArray;
}
