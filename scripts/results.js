/*
|--------------------------------------------------------------------------
| RESULTS.JS
|--------------------------------------------------------------------------
|
| This file contains the function used to gnerate the results
|
*/

let companies = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Swissair_Logo.svg/2000px-Swissair_Logo.svg.png",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Scandinavian_Airlines_logo.svg/2000px-Scandinavian_Airlines_logo.svg.png",
  "https://static.bornoe.org/blog/wp-content/uploads/2012/12/norwegianlogo.png"
];

let timeBounds = {
  early: {
    min: 3,
    max: 12
  },
  late: {
    min: 17,
    max: 22
  }
};

let priceRange = {
  min: 995,
  max: 9000
}

function getArrivalTime(time, duration){
  time = time.split(':');
  //console.log(time)
  let minutes = parseInt(time[0])*60+parseInt(time[1])+parseInt(duration.h)*60+parseInt(duration.m);
  //console.log(minutes)
  let hours = Math.floor(minutes/60);
  minutes = minutes-hours*60;
  if( minutes > 59 ){
    minutes = ("0" + (minutes - 59) ).slice(-2);
    hours++;
  }
  if( hours > 23 ){
    hours = ("0" + (hours - 23) ).slice(-2);
  }
  // console.log(hours)
  //console.log(minutes)
  return ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2);
}

function getRandomTime(time){
  let hour;
  let minutes = Math.floor(Math.random() * 59);

  switch(time) {
    case 'early':
      hour = Math.floor(Math.random() * (timeBounds.early.max-timeBounds.early.min+1) ) + timeBounds.early.min;
      break;
    case 'late':
      hour = Math.floor(Math.random() * (timeBounds.late.max-timeBounds.late.min+1) ) + timeBounds.late.min;
      break;
    default:
      hour = Math.floor(Math.random() * (timeBounds.late.max-timeBounds.early.min+1) ) + timeBounds.early.min;
  }

  return ("0" + hour).slice(-2) + ":" + ("0" + minutes).slice(-2);
}

function getTravelLength(){
  let hour = Math.floor(Math.random() * 3) + 1;
  let minutes = Math.floor(Math.random() * 59);
  return { h:hour, m:minutes };
}

function generateResults(count, searchObject, isReturn = true){
  // Convert stupid variabale names to non-stupid variable names to minimize nurcia.
  let airports = jjAirports;
  let html = '';

  for(let i = 0; i < count; i++){

    let resultObject = {
      outbound: {
        company: companies[Math.floor(Math.random() * companies.length)],
        departureTime: getRandomTime(searchObject.timeDeparture),
        airport: airports[searchObject.airportDeparture],
        length: getTravelLength()
      },
      inbound: {
        airport: airports[searchObject.airportDestination]
      },
      price: Math.floor(Math.random() * priceRange.max) + priceRange.min,
      searchObject: searchObject
    };
    
    resultObject.outbound.landingTime = getArrivalTime(resultObject.outbound.departureTime, resultObject.outbound.length);

    if( isReturn ){
      resultObject.inbound.company = companies[Math.floor(Math.random() * companies.length)];
      resultObject.inbound.departureTime = getRandomTime(searchObject.timeHome);
      resultObject.inbound.length = getTravelLength()
      resultObject.inbound.landingTime = getArrivalTime(resultObject.inbound.departureTime, resultObject.inbound.length);
    }
    
    html += getResultFromObject(resultObject, false);
  }

  return html;
}

function getResultFromObject(resultObject, rebook){
  let result =  `
    <div class="result-card card">
      <div class="card-body result-card__body">
        
        <div class="result-card__container--grow">
          <div class="result-card__row">
            
            <div style="background-image: url('${resultObject.outbound.company}')" class="result-card__image"></div>
            <div class="text-right result-card__part">
              <div class="lead">${resultObject.outbound.departureTime}</div>
              <small><span class="result-card__city">${resultObject.outbound.airport.city} </span>(${resultObject.outbound.airport.code})</small>
            </div>

            <div class="result-card__part result-card__part--center">
              <div>${resultObject.outbound.length.h}h ${resultObject.outbound.length.m}min</div>
              <div class="arrow d-md-block d-none">
                <div class="arrow__text">Direct</div>
                <span></span>
              </div>
            </div>

            <div class="result-card__part">
              <div class="lead">${resultObject.outbound.landingTime}</div>
              <small><span class="result-card__city">${resultObject.inbound.airport.city} </span>(${resultObject.inbound.airport.code})</small>
            </div>

          </div>`;

          if( resultObject.searchObject.isReturn ){
            result += `<div class="result-card__row">
            
            <div style="background-image: url('${resultObject.inbound.company}')" class="result-card__image"></div>
                <div class="text-right result-card__part">
                  <div class="lead">${resultObject.inbound.departureTime}</div>
                  <small><span class="result-card__city">${resultObject.inbound.airport.city} </span>(${resultObject.inbound.airport.code})</small>
                </div>

            <div class="result-card__part result-card__part--center">
              <div>${resultObject.inbound.length.h}h ${resultObject.inbound.length.m}min</div>
              <div class="arrow d-md-block d-none">
                <div class="arrow__text">Direct</div>
                <span></span>
              </div>
            </div>

            <div class="result-card__part">
              <div class="lead">${resultObject.inbound.landingTime}</div>
              <small><span class="result-card__city">${resultObject.outbound.airport.city} </span>(${resultObject.outbound.airport.code})</small>
            </div>

          </div>`;
          }

        result += `</div>
        
        ${ rebook ? '' : '<div class="result-card__price-container"><h3>' + resultObject.price + '<span> DKK</span></h3></div>'}

        <div class="result-card__button-container">
          <button class="round-button btn-primary round-button--small btn btn-lg ${ rebook ? 'cached' : 'doBooking' }" data-json='${JSON.stringify(resultObject)}'>
            <i class="material-icons md-48">${ rebook ? 'history' : 'arrow_forward' }</i>
            ${ rebook ? 'Rebook' : 'Book' }
          </button>
        </div>

      </div>
    </div>`;
  return result;
}