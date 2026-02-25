class LineChart {
    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
        // Configuration object with defaults
        this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 840,
        containerHeight: _config.containerHeight || 400,
        contextHeight: 50,
        margin: _config.margin || {top: 40, right: 20, bottom: 100, left: 60},
        contextMargin: {top: 320, right: 10, bottom: 20, left: 45},
        }
        this.data = _data;
        this.initVis();
    }

      /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
    
    // Calculate context width based on context margins
    vis.contextWidth = vis.config.containerWidth - vis.config.contextMargin.left - vis.config.contextMargin.right;

    // Initialize scales and axes
    ///////// Focus ///////////
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
      .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(10)
      .tickFormat(d3.format('d'));

    vis.yAxis = d3.axisLeft(vis.yScale)
      .ticks(8);

    ////////// Context ///////////
    vis.xScaleContext = d3.scaleLinear()
        .range([0, vis.contextWidth]);
    vis.yScaleContext = d3.scaleLinear()
        .range([vis.config.contextHeight, 0]) 
        .nice();
    vis.xAxisContext = d3.axisBottom(vis.xScaleContext)
        .tickSizeOuter(0)
        .tickFormat(d3.format('d'));

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    vis.chart.append('defs').append('clipPath')
        .attr('id', 'clip')
      .append('rect')
        .attr('width', vis.width)
        .attr('height', vis.height);  
      
    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group 
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append Title
    vis.svg.append('text')
        .attr('x', vis.config.containerWidth / 2)
        .attr('y', 20)
        .attr('class', 'axis-title')
        .style('text-anchor', 'middle')
        .text('Average of Self-Satisfaction and Poverty Over Time');
    
    vis.tooltipTrackingArea = vis.chart.append('rect')
        .attr('width', vis.width)
        .attr('height', vis.height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all');

    // Empty tooltip group (hidden by default)
    vis.tooltip = vis.chart.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    vis.tooltip.append('circle')
        .attr('class', 'tooltip-happiness')
        .attr('r', 4)
        .attr('fill', '#d89800');

    vis.tooltip.append('circle')
        .attr('class', 'tooltip-poverty')
        .attr('r', 4)
        .attr('fill', '#d80000');

    vis.tooltip.append('text')
        .attr('class', 'tooltip-text-happiness');

    vis.tooltip.append('text')
        .attr('class', 'tooltip-text-poverty');

    // Append CONTEXT group with x- and y-axes
    vis.context = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.contextMargin.left},${vis.config.contextMargin.top})`);

    vis.xAxisContextG = vis.context.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.config.contextHeight})`);

    vis.brushG = vis.context.append('g')
        .attr('class', 'brush x-brush');


    // Initialize brush component
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.config.containerWidth, vis.config.contextHeight]])
        .on('brush', function({selection}) {
          if (selection) vis.brushed(selection);
        })
        .on('end', function({selection}) {
          if (!selection) vis.brushed(null);
        });
  }

  /* Prepare data and scales before we render it */
  updateVis() { 
    let vis = this;

    // Calculates averages for each year and stores them in a new array
    const yearlyData = d3.rollup(
      vis.data,
      group => ({
        Year: group[0].Year,
        'Share of population in poverty ($3 a day) (0-10)': d3.mean(group, d => d['Share of population in poverty ($3 a day)']),
        'Self-reported life satisfaction': d3.mean(group, d => d['Self-reported life satisfaction'])
      }),
      d => d.Year
    );
    vis.aggregatedData = Array.from(yearlyData.values()).sort((a, b) => a.Year - b.Year);
    console.log("Aggregated Data:", vis.aggregatedData);

    // Define line generators with .defined() to skip null values
    vis.povertyLine = d3.line()
        .defined(d => !isNaN(d['Share of population in poverty ($3 a day) (0-10)']) && d['Share of population in poverty ($3 a day) (0-10)'] != null)
        .x(d => vis.xScale(d.Year))
        .y(d => vis.yScale(d['Share of population in poverty ($3 a day) (0-10)']));

    vis.happinessLine = d3.line()
        .defined(d => !isNaN(d['Self-reported life satisfaction']) && d['Self-reported life satisfaction'] != null)
        .x(d => vis.xScale(d.Year))
        .y(d => vis.yScale(d['Self-reported life satisfaction']));

    /////////// CONTEXT ////////////
    vis.povertyContextLine = d3.line()
        .defined(d => !isNaN(d['Share of population in poverty ($3 a day) (0-10)']) && d['Share of population in poverty ($3 a day) (0-10)'] != null)
        .x(d => vis.xScaleContext(d.Year))
        .y(d => vis.yScaleContext(d['Share of population in poverty ($3 a day) (0-10)']));

    vis.happyContextLine = d3.line()
        .defined(d => !isNaN(d['Self-reported life satisfaction']) && d['Self-reported life satisfaction'] != null)
        .x(d => vis.xScaleContext(d.Year))
        .y(d => vis.yScaleContext(d['Self-reported life satisfaction']));

    // Set the scale input domains
    vis.xScale.domain([d3.min(vis.aggregatedData, d => d.Year), d3.max(vis.aggregatedData, d => d.Year)]);
    vis.yScale.domain([0, 10]); 

    /////////// CONTEXT ////////////
    vis.xScaleContext.domain(vis.xScale.domain()); 
    vis.yScaleContext.domain(vis.yScale.domain());

    // Initialize bisector function to find nearest data point for tooltip
    vis.bisectData = d3.bisector(d => d.Year).left; 

    vis.renderVis();
  }

  /* Bind data to visual elements */
  renderVis() {
    let vis = this;

    // Add poverty line
    let povertyPath = vis.chart.selectAll('.poverty-line').data([vis.aggregatedData]);
    povertyPath.enter()
        .append('path')
        .attr('class', 'poverty-line')
        .attr('stroke', '#d80000')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
      .merge(povertyPath)
        .attr('d', vis.povertyLine);

    // Add happiness line
    let happinessPath = vis.chart.selectAll('.happiness-line').data([vis.aggregatedData]);
    happinessPath.enter()
        .append('path')
        .attr('class', 'happiness-line')
        .attr('stroke', '#d89800')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
      .merge(happinessPath)
        .attr('d', vis.happinessLine);

    // Add context line for poverty
    let povertyContextPath = vis.context.selectAll('.poverty-context-line').data([vis.aggregatedData]);
    povertyContextPath.enter()
        .append('path')
        .attr('class', 'poverty-context-line')
        .attr('stroke', '#d80000')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
      .merge(povertyContextPath)
        .attr('d', vis.povertyContextLine);

    // Add context line for happiness
    let happinessContextPath = vis.context.selectAll('.happiness-context-line').data([vis.aggregatedData]);
    happinessContextPath.enter()
        .append('path')
        .attr('class', 'happiness-context-line')
        .attr('stroke', '#d89800')
        .attr('stroke-width', 1.5)
        .attr('fill', 'none')
      .merge(happinessContextPath)
        .attr('d', vis.happyContextLine);

    vis.tooltipTrackingArea
        .on('mouseenter', () => {
          vis.tooltip.style('display', 'block');
        })
        .on('mouseleave', () => {
          vis.tooltip.style('display', 'none');
        })
        .on('mousemove', function(event) {
          // Get date that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          const date = vis.xScale.invert(xPos);

          // Find nearest data point
          const index = vis.bisectData(vis.aggregatedData, date, 1);
          const a = vis.aggregatedData[index - 1];
          const b = vis.aggregatedData[index];
          const d = b && (date - a.Year > b.Year - date) ? b : a; 

          // Update tooltip circles and text
          vis.tooltip.select('.tooltip-happiness')
              .attr('transform', `translate(${vis.xScale(d.Year)},${vis.yScale(d['Self-reported life satisfaction'])})`);
          
          vis.tooltip.select('.tooltip-poverty')
              .attr('transform', `translate(${vis.xScale(d.Year)},${vis.yScale(d['Share of population in poverty ($3 a day) (0-10)'])})`);
          
          vis.tooltip.select('.tooltip-text-happiness')
              .attr('transform', `translate(${vis.xScale(d.Year)},${(vis.yScale(d['Self-reported life satisfaction']) - 15)})`)
              .text(`Happiness: ${d['Self-reported life satisfaction'].toFixed(2)}`);
          
          vis.tooltip.select('.tooltip-text-poverty')
              .attr('transform', `translate(${vis.xScale(d.Year)},${(vis.yScale(d['Share of population in poverty ($3 a day) (0-10)']) + 15)})`)
              .text(`Poverty: ${d['Share of population in poverty ($3 a day) (0-10)'].toFixed(2)}`);
        });
    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
    vis.xAxisContextG.call(vis.xAxisContext);

    // Update the brush and define a default position
    const defaultBrushSelection = [vis.xScale(2020), vis.xScaleContext.range()[1]];
    vis.brushG
        .call(vis.brush)
        .call(vis.brush.move, defaultBrushSelection);
  }
  /**
   * React to brush events
   */
  brushed(selection) {
    let vis = this;

    // Check if the brush is still active or if it has been removed
    if (selection) {
      // Convert given pixel coordinates (range: [x0,x1]) into a year range [y1, y2]
      const selectedDomain = selection.map(vis.xScaleContext.invert, vis.xScaleContext);

      // Update x-scale of the focus view accordingly
      vis.xScale.domain(selectedDomain);
    } else {
      // Reset x-scale of the focus view (full time period)
      vis.xScale.domain(vis.xScaleContext.domain());
    }

    // Redraw lines and update x-axis labels in focus view
    vis.chart.selectAll('.poverty-line').attr('d', vis.povertyLine);
    vis.chart.selectAll('.happiness-line').attr('d', vis.happinessLine);
    vis.xAxisG.call(vis.xAxis);
  }
}