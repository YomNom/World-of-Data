let happiness_data, poverty_data, sharedData, happinessBarChart, povertyBarChart, scatterplot;

/**/
Promise.all([
  d3.csv('data/happiness-cantril-ladder.csv'),
  d3.csv('data/share-of-population-in-extreme-poverty-processed.csv')
]).then(([happiness_data, poverty_data]) => {
  console.log("Happiness:", happiness_data);
  console.log("Poverty:", poverty_data);

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

  const happinessColorScale = d3.scaleLinear()
    .domain([0, 10])
    .range(['#fff8c0', '#d89800']); // light yellow to dark yellow gradient

  const povertyColorScale = d3.scaleLinear()
    .domain([0, 100])
    .range(['#f8c0c0', '#d80000']); // light red to dark red gradient
  
  /* COMBINE SHARED RECORDS FOR BOTH DATASETS BASED ON ENTITY AND YEAR
     modified by me to find shared records between the two datasets based on Entity and Year */
  const povertyByKey = new Map( // Create a map for quick lookup of poverty records by Entity and Year
    poverty_data.map(d => [`${d.Entity}__${d.Year}`, d])
  );

  sharedData = happiness_data // Find records that have matching Entity and Year in both datasets
    .filter(d => povertyByKey.has(`${d.Entity}__${d.Year}`))
    .map(d => {
      const povertyRecord = povertyByKey.get(`${d.Entity}__${d.Year}`);
      return {
        Entity: d.Entity,
        Code: d.Code || povertyRecord.Code,
        Year: d.Year,
        'Share of population in poverty ($3 a day)': povertyRecord['Share of population in poverty ($3 a day)'],
        Population: povertyRecord.Population,
        'World region according to OWID': povertyRecord['World region according to OWID'],
        'Self-reported life satisfaction': d['Self-reported life satisfaction'],
      };
    });

  const sharedHappinessData = sharedData.map(d => ({
    Entity: d.Entity,
    Year: d.Year,
    'Self-reported life satisfaction': d['Self-reported life satisfaction']
  }));

  const sharedPovertyData = sharedData.map(d => ({
    Entity: d.Entity,
    Year: d.Year,
    Population: d.Population,
    'Share of population in poverty ($3 a day)': d['Share of population in poverty ($3 a day)']
  }));
  window.sharedData = sharedData;
  /////////////////////////////////////////////////////////////////////////////////////

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

  scatterplot = new ScatterPlot({
    parentElement: '#scatterplot',
    colorScale: d3.scaleOrdinal(d3.schemeCategory10) // Categorical color scale for regions
  }, sharedData);
  scatterplot.updateVis();
  /*
  // Extract unique entities (from happiness data as an example)
  const uniqueEntities = Array.from(new Set(happiness_data.map(d => d.Entity)));
  console.log("Unique Entities:", uniqueEntities);

  // Filtering example (e.g., filter for a specific entity)
  const filterByEntity = (entityName) => {
    return happiness_data.filter(d => d.Entity === entityName);
  };
  */
}).catch(error => {
  console.error('Error loading data:', error);
});

function selectVis(Show) {
  switch (Show) {
    case 'barchart':
      d3.select('#happiness-barchart').style('display', 'block');
      d3.select('#poverty-barchart').style('display', 'block');
      break;
    case 'scatterplot':
      console.log('Scatterplot selected - but not implemented yet!');
      break;
    default: // No selection or unrecognized selection
      console.warn('Unrecognized visualization selection:', Show);
  }
} 

