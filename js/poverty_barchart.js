class Poverty_BarChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 2800,
      margin: _config.margin || {top: 40, right: 5, bottom: 25, left: 180},
      reverseOrder: _config.reverseOrder || false,
      tooltipPadding: _config.tooltipPadding || 15
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

    // Initialize scales and axes
    vis.xScale = d3.scaleLinear()
      .range([0, vis.width]);

    vis.yScale = d3.scaleBand()
      .range([0, vis.height])
      .paddingInner(0.2);

    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(6)
        .tickSizeOuter(0);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSizeOuter(0);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group 
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // Append Title
    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', vis.config.containerWidth / 2)
        .attr('y', 20)
        .style('text-anchor', 'middle')
        .text('Share of Population in Poverty ($3 a day)');
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;

    // Reverse column order depending on user selection
    if (vis.config.reverseOrder) {
      vis.data.reverse();
    }

    // Specify category- and value-accessor functions
    vis.categoryValue = d => d.Entity;
    vis.value = d => d['Share of population in poverty ($3 a day)'];

    // Set the scale input domains
    vis.yScale.domain(vis.data.map(vis.categoryValue));
    vis.xScale.domain([0, d3.max(vis.data, vis.value)]).nice();

    vis.xAxis.tickFormat(d => `${d3.format('.0f')(d)}%`);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add rectangles
    let bars = vis.chart.selectAll('.bar')
        .data(vis.data, vis.categoryValue)
      .join('rect')
        .style('opacity', 1)
        .attr('fill', d => vis.config.colorScale(vis.value(d)))
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('width', d => vis.xScale(vis.value(d)))
        .attr('height', vis.yScale.bandwidth())
        .attr('y', d => vis.yScale(vis.categoryValue(d)));
    
    // Tooltip event listeners
    bars
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('opacity', 1)
            // Display poverty score
            .html(`<div class="tooltip-label">${d.Entity}</div><div>Poverty Level: ${d['Share of population in poverty ($3 a day)'].toFixed(2)}%</div>`);
        })
        .on('mousemove', (event) => {
          d3.select('#tooltip')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none').style('opacity', 0);
        })
        .on('click', function(event, d) {
          const isActive = countryFilter.includes(d.Entity);
          if (isActive) {
            countryFilter = [];
            vis.chart.selectAll('.bar').classed('active', false);
          } else {
            countryFilter = [d.Entity]; // Single selection
            vis.chart.selectAll('.bar').classed('active', false);
            d3.select(this).classed('active', true);
          }
          filterData(); // Call global function to update scatter plot
        });

    // Update axes
    vis.xAxisG
        .transition().duration(1000)
        .call(vis.xAxis);

    vis.yAxisG.call(vis.yAxis);
  }
}