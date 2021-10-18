const $ = (selector)=>{
    return document.querySelector(selector);
}

//Components of API URL
const baseURL= 'https://api.weatherbit.io/v2.0/';
const key= '&key=2383c2f3f93f44c5820ac91ca8992294';
let type = 'current?';
let freq = '&daily';
let units ='&units=m';
let city;
let apiURL;

let data;

const searchBtn = $('#search')
const unitBtn = $('#units')
const typeOfForecastBtn= $('#weekly')
const graphBtn= $('#graphs')


//connects to api and request data which is returned in json format 
const apiRequest = async(apiURL, buildPage)=>{
   await fetch(apiURL)
    .then(response =>response.json())
    .then((data)=> buildPage(data))
    //alerts user to invalid input and refreshes page
    .catch((error)=>{
        alert('ERROR '+error);
        location.reload();
    })
}

//removes graph canvas and generates new canvas with same id
const resetCanvas = ()=>{
    const chart = $('#myChart')
    chart.remove();
    const newChart = '<canvas id="myChart"><canvas>'
    $('.canvasDiv').innerHTML = newChart
}


//Generates HTML divs, populates with current day api data and inserts to existing div in HTML file
const insertToHTMLCurrent = (wd)=>{
    let time;
    let sun;

    //Clears the table and div element that contains api Data
    $('#weekTbl').innerHTML = '';
    $('#cityHeader').innerHTML = '';

    //if stmt to see if is day or night and change text accordingly
    if(wd.data[0].pod=='n'){
        time = 'Night-Time';
        sun = `<div id="sun">Sunrise (GMT): ${wd.data[0].sunrise}</div>`
        }
    else if(wd.data[0].pod=='d'){
        time = 'Day-Time';
        sun = `<div id="sun">Sunset (GMT): ${wd.data[0].sunset}</div>`}

    const html = `
        <div class ="imageDiv"><img src="images/icons/${wd.data[0].weather.icon}.png"></img></div>
        <div id="city">${wd.data[0].city_name}, ${wd.data[0].country_code}</div>
        <div id="temp">${wd.data[0].temp} °</div>
        <div id="descr">${wd.data[0].weather.description}</div>
        <div id="time">${time}</div>
    `
    const weatherDiv = $('.apiData');
    weatherDiv.innerHTML = html;
    weatherDiv.innerHTML += sun;
}

//function that generates a table with a weekly forecast
const insertToHTMLWeekly = (wd)=>{
    $('#weekTbl').innerHTML = '';
    $('.apiData').innerHTML = '';


//Creating new table body, headers and rows
    let tbody = document.createElement('tbody');
    $('#cityHeader').innerHTML = wd.city_name+', '+wd.country_code
    $('#weekTbl').appendChild(tbody);

    const options = { weekday: 'long'};
    //Generates new table rows and cells, populates with information from the api(7 days) and inserts to table in HTML
    for(j=0; j<5; j++){
        let tableRef = $('#weekTbl');
        let newRow = tableRef.insertRow(-1);
            for(let i=1; i<8; i++){
            // converts datetime data from YYYY-MM-DD to the name-day of the week
                let numDay = new Date(wd.data[i].datetime);
                let nameDay = new Intl.DateTimeFormat('en-US', options).format(numDay);

                let dataArr = [nameDay, wd.data[i].weather.description, wd.data[i].min_temp+'°- '+wd.data[i].max_temp
                +'°', wd.data[i].rh+'% Humidity', wd.data[i].pop+'% Chance Of Rain']

                let newText = document.createTextNode(dataArr[i,j]);
                let newCell = newRow.insertCell(-1);
                newCell.appendChild(newText);
            }
        }
}


//bar chart for temperature comparison
const temprChart = (wd)=>{
    const ctx = $('#myChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        //grabs temperataure data from api and applies it to the data in chart
        data: {
            labels: ['Actual', 'Feels Like'],
            datasets: [{
                label: 'Actual Temperature Vs Apparent Temperature',
                data: [wd.data[0].temp, wd.data[0].app_temp],
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)',],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',],
           }]
        },
    options: {
        responsive: true
    }
});
}

//pie chart for humidity %
const humidChart = (wd)=>{
    const ctx = $('#myChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: data,
        //grabs humidity data from api and applies it to the label and data set
        data: {
            labels: [
                wd.data[0].rh+'% Humidity'
              ],
            datasets: [{
                data: [wd.data[0].rh, 100-wd.data[0].rh],
                backgroundColor: [
                    'rgb(54, 162, 235)',
                    'rgb(142, 142, 142)'
                ],
            }]
        },
        options: {
            radius: '80%',
            responsive: true,
            plugins:{
                legend: {
                    labels: {
                        font: {
                            size: 18
                        }
                    }
                }
            }
            }
});  
}


//Changes the units of measurement 
unitBtn.addEventListener('click', ()=>{
    //Changes unit variable and Text of button appropriately 
     if(units=='&units=i'){
        unitBtn.innerText = 'Switch To Fahrenheit';
        units='&units=m';}
    else if(units=='&units=m'){
        unitBtn.innerText = 'Switch To Celsius';
        units='&units=i';}
})

//Changes between temperature and humidity graphs
graphBtn.addEventListener('click', ()=>{
    //resets canvas on each click
    resetCanvas();
    //sends apiRequest depending on type of graph selected
    if(graphBtn.innerText=='Change To Temperature Graph'){
        graphBtn.innerText = 'Change To Humidity Graph';
        apiRequest(apiURL, temprChart);
    }
    else if(graphBtn.innerText=='Change To Humidity Graph'){
        graphBtn.innerText = 'Change To Temperature Graph';
        apiRequest(apiURL, humidChart);
    }
})

//Button which returns generated HTML with weekly or current data depending on 'type' specified in URL
searchBtn.addEventListener('click', ()=>{
    resetCanvas();
    //sets city variable to value inputted by user in searchbox
    graphBtn.innerText = 'Change To Humidity Graph'
    let searchText = $('#location').value;
    city = 'city='+searchText;
    apiURL = baseURL+type+city+key+freq+units;
    typeOfForecastBtn.style.display='inline-block';
    unitBtn.style.display='inline-block';
    graphBtn.style.display='inline-block';
    //sends apiRequest depending on type of forecast
    if(type=='current?'){
        apiRequest(apiURL, insertToHTMLCurrent);
        apiRequest(apiURL, temprChart);
        graphBtn.display.style='inline-block';
    }
    else if(type=='forecast/daily?'){
       apiRequest(apiURL, insertToHTMLWeekly);
       graphBtn.display.style='none';
    }
})

//Changes between 7 day forecast and current day forecast
typeOfForecastBtn.addEventListener('click', ()=>{
    //hides or shows graph button on screen depending on type of forecast
    if(type=='current?'){
        typeOfForecastBtn.innerText = 'See The Current Day';
        type='forecast/daily?';
        freq='&days=8';
        graphBtn.style.display= 'none';
    }
    else if(type=='forecast/daily?'){
        typeOfForecastBtn.innerText = 'See The Next 7 Days';
        type='current?';
        freq='&daily';
        graphBtn.style.display= 'inline-block';
    }
})

