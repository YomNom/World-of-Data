let happiness_data, poverty_data, sharedData;
let happinessBarChart, povertyBarChart, scatterplot, lineChart, happychoroplethMap, povertychoroplethMap;
let happinessColorScale, povertyColorScale;
let countryFilter = [];
/**/
Promise.all([
  d3.csv('data/happiness-cantril-ladder.csv'),
  d3.csv('data/share-of-population-in-extreme-poverty-processed.csv'),
  d3.json('data/countries-110m.json')
]).then(([happinessData, povertyData, geodata]) => {
  happiness_data = happinessData;
  poverty_data = povertyData;
  console.log("Happiness:", happiness_data);
  console.log("Poverty:", poverty_data);
  console.log("Countries:", geodata);

  // Convert string values to numbers
  happiness_data.forEach(d => {
    d.Year = +d.Year; 
    d['Self-reported life satisfaction'] = +d['Self-reported life satisfaction']; 
  });

  poverty_data.forEach(d => {
    d.Year = +d.Year;
    d.Population = +d.Population; 
    d['Share of population in poverty ($3 a day)'] = +d['Share of population in poverty ($3 a day)']; 
  });
  
  happinessColorScale = d3.scaleLinear()
    .domain([0, 10])
    .range(['#fff8c0', '#d89800']); // light yellow to dark yellow gradient

  povertyColorScale = d3.scaleLinear()
    .domain([0, 100])
    .range(['#f8c0c0', '#d80000']); // light red to dark red gradient


  geodata.objects.countries.geometries.forEach(d => {
    for (let i = 0; i < happiness_data.length; i++) {
      if (d.properties.name == happiness_data[i].Entity) {
        d.properties.happiness_stat = +happiness_data[i]['Self-reported life satisfaction'];
      }
    }
    for (let i = 0; i < poverty_data.length; i++) {
      if (d.properties.name == poverty_data[i].Entity) {
        d.properties.poverty_stat = +poverty_data[i]['Share of population in poverty ($3 a day)'];
      }
    }
  });
  /* COMBINE SHARED RECORDS FOR BOTH DATASETS BASED ON ENTITY AND YEAR */
  const povertyMap = new Map(poverty_data.map(d => [`${d.Entity}-${d.Year}`, d]));

  sharedData = happiness_data
    .filter(d => povertyMap.has(`${d.Entity}-${d.Year}`))
    .map(d => {
      const povertyRecord = povertyMap.get(`${d.Entity}-${d.Year}`);
      return {
        Entity: d.Entity,
        Year: d.Year,
        'Self-reported life satisfaction': d['Self-reported life satisfaction'],
        'Share of population in poverty ($3 a day)': povertyRecord['Share of population in poverty ($3 a day)'],
        Population: povertyRecord.Population
      };
    });

  console.log("Shared Data:", sharedData);
 
  /////////////////////////////////////////////////////////////////////////////////////

  geodata.objects.countries.geometries.forEach(d => {
    for (let i = 0; i < sharedData.length; i++) {
      if (d.properties.name == sharedData[i].Entity) {
        d.properties.poverty_stat = +sharedData[i]['Share of population in poverty ($3 a day)'];
        d.properties.happiness_stat = +sharedData[i]['Self-reported life satisfaction'];
      }
    }
  });

  happychoroplethMap = new ChoroplethMap({
    parentElement: '#happy-choropleth',
    colorScale: happinessColorScale,
  }, geodata);


  povertychoroplethMap = new PovertyChoroplethMap({
    parentElement: '#poverty-choropleth',
    colorScale: povertyColorScale,
  }, geodata);

  happinessBarChart = new Happiness_BarChart({
    parentElement: '#happiness-barchart', 
    colorScale: happinessColorScale
  }, happiness_data);
  happinessBarChart.updateVis();

  povertyBarChart = new Poverty_BarChart({
    parentElement: '#poverty-barchart', 
    colorScale: povertyColorScale
  }, poverty_data);
  povertyBarChart.updateVis();

  // Create line chart for time series comparison
  lineChart = new LineChart({
    parentElement: '#linechart'
  }, sharedData);
  lineChart.updateVis();
 
  scatterplot = new Scatterplot({
    parentElement: '#scatterplot',
    colorScale: povertyColorScale // Categorical color scale for regions
  }, poverty_data);

  scatterplot.data = [];
  scatterplot.setTitle('Select a country');
  scatterplot.updateVis();
}).catch(error => {
  console.error('Error loading data:', error);
});

function filterData() {
  if (countryFilter.length == 0) {
    scatterplot.data = [];
    scatterplot.setTitle('Select a country');
  } else {
    console.log("Filtering scatterplot data for countries:", countryFilter);
    scatterplot.data = poverty_data.filter(d => countryFilter.includes(d.Entity));
    const label = `Selected: ${countryFilter.join(', ')}`;
    scatterplot.setTitle(label);
  }
  scatterplot.updateVis();
}

// Function to handle visualization selection
// Ref: 
//  https://www.mattmorgante.com/technology/javascript-add-remove-html-elements
//  https://www.geeksforgeeks.org/javascript/remove-add-new-html-tags-using-javascript/ 
function selectVis(Show) {
  everythingInvisible(); // clear visuals
  countryFilter = []; // reset country filter when switching views
  d3.select('#poverty-barchart').selectAll('.bar').classed('active', false);
  scatterplot.data = [];
  scatterplot.setTitle('Select a country');
  scatterplot.updateVis();
  switch(Show) {
    case 'barchart':
      console.log("Selected Bar Chart");
      document.getElementById('barchart-container').style.display = 'flex';
      setTimeout(() => { // Updates asap but after the DOM has rendered to prevent bugs with choropleth maps
        happinessBarChart.updateVis();
        povertyBarChart.updateVis();
      }, 0);
      break;
    case 'linechart':
      console.log("Selected Line Chart");
      document.getElementById('linechart-container').style.display = 'flex'; 
      setTimeout(() => { // Stops choropleth from bugging out
        lineChart.updateVis();
      }, 0);
      break;
    case 'happiness-choropleth':
      console.log("Selected Happiness Choropleth Map");
      document.getElementById('choropleth-container').style.display = 'flex';
      document.getElementById('happy-choropleth-container').style.display = 'flex';
      document.getElementById('poverty-choropleth-container').style.display = 'none';
      setTimeout(() => { // Just keeps choropleth maps from breaking
        happychoroplethMap.updateVis();
      }, 0);
      break;
    case 'poverty-choropleth':
      console.log("Selected Poverty Choropleth Map");
      document.getElementById('choropleth-container').style.display = 'flex';
      document.getElementById('happy-choropleth-container').style.display = 'none';
      document.getElementById('poverty-choropleth-container').style.display = 'flex';
      setTimeout(() => { // Let the choropleths show their stuff
        povertychoroplethMap.updateVis();
      }, 0);
      break;
    default:
      console.log("Invalid selection");
  }
}

// renders all visualizations invisible
function everythingInvisible() {
  document.getElementById('barchart-container').style.display = 'none';
  document.getElementById('linechart-container').style.display = 'none';
  document.getElementById('choropleth-container').style.display = 'none';
}
