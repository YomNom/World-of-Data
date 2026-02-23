// https://observablehq.com/@d3/histogram/2
class BarChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 710,
      containerHeight: _config.containerHeight || 200,
      margin: _config.margin || {top: 10, right: 5, bottom: 25, left: 30},
      reverseOrder: _config.reverseOrder || false,
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data
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
    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]) 

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);

    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(6); // Format y-axis ticks as millions

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
    
    // Axis titles
    vis.chart.append('text')
        .attr('x', vis.width / 2)
        .attr('y', vis.height + 35)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text('Self-reported life satisfaction (0-10)');
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;

    // 2. Define the accessor for the value we want to bin
    const xValue = d => d['Self-reported life satisfaction'];

    // 3. Setup the Histogram Binning logic
    const histogram = d3.bin()
        .value(xValue)
        .domain(d3.extent(vis.data, xValue))
        .thresholds(20); // Number of bins

    // Create the bins
    vis.bins = histogram(vis.data);

    // 4. Update Scale Domains
    vis.xScale.domain([
      d3.min(vis.bins, d => d.x0), 
      d3.max(vis.bins, d => d.x1)
    ]);
    vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add rectangles
    let bars = vis.chart.selectAll('.bar')
        .data(vis.bins)
      .join('rect');
    
    bars.style('opacity', 0.5)
      .transition().duration(1000)
        .style('opacity', 1)
        .attr('class', 'bar')
        .attr('x', d => vis.xScale(d.x0))
        .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0))
        .attr('height', d => vis.height - vis.yScale(d.length))
        .attr('y', d => vis.yScale(d.length))
    
    // Tooltip event listeners
    bars
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('opacity', 1)
            // Format number with million and thousand separator
            .html(`<div class="tooltip-label">Population</div>${d3.format(',')(d.population)}`);
        })
        .on('mousemove', (event) => {
          d3.select('#tooltip')
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('opacity', 0);
        });

    // Update axes
    vis.xAxisG
        .transition().duration(1000)
        .call(vis.xAxis);

    vis.yAxisG.call(vis.yAxis);
  }
}