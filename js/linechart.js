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
        colorScale: _config.colorScale,
        containerWidth: _config.containerWidth || 800,
        containerHeight: _config.containerHeight || 300,
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
      .tickFormat(d3.format('.1f'))
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
        .attr('x', vis.config.containerWidth / 2)
        .attr('y', 20)
        .attr('class', 'axis-title')
        .style('text-anchor', 'middle')
        .text('Comparison Over Time');
  }

  /* Prepare data and scales before we render it */
  updateVis() { 
    let vis = this;

    // Specify category- and value-accessor functions
    vis.categoryValue = d => d.Year;
    vis.value = d => d['Self-reported life satisfaction'];

    // Initialze Line
    

    // Set the scale input domains
    vis.yScale.domain(vis.data.map(vis.categoryValue));
    vis.xScale.domain([0, d3.max(vis.data, vis.value)]).nice();

    vis.renderVis();
  }

  /* Bind data to visual elements */
  renderVis() {
    let vis = this;
  }

}