//var ReactDOM = require('react-dom');
import d3 from 'd3'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { fetchTopTrading } from '../actions'
import ReactDOM from 'react-dom';
var sprintf = require("../utils/sprintf");

require('../styles/d3Chart.less');
var d3Chart = {};

d3Chart.create = function(el, props, data, id) {
  var margin = {top: 20, right: 20, bottom: 300, left: 100};
  var width = 800 - margin.left - margin.right;
  var height = 1400 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width]);

  var y = d3.scale.linear()
     .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");
      //.ticks(10, "%");

var svg = d3.select(el).append('svg')
          .attr("id", id)
          .attr('class', 'd3')
          .attr('width', width)
          .attr('height', height)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);

  x.domain(data.map(function(d) { return d.country; }));
  y.domain([0, d3.max(data, function(d) { return d.su; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Sum");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.country); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.su); })
      .attr("height", function(d) { return height - y(d.su); });
}

class Chart extends Component {

  constructor(props) {
    super(props)
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleStoreChange = this.handleStoreChange.bind(this);
    this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
  }

  componentDidMount() {
      this.handleStoreChange(this.props);
  }

  componentWillUnmount () {
    d3.select(`#${this.props.chartid}`).remove();
    // clean up D3
  }
  handleStoreChange (props){
    var node = ReactDOM.findDOMNode(this);
    d3Chart.create(node, {}/*{
      width: this.props.width,
      height: this.props.height
    }*/, props.what, props.chartid);

    //this.renderDialogContent();
  }
  componentWillReceiveProps(newProps) {
    if((this.props.year !== newProps.year) || (this.props.month !== newProps.month)){
       //props = newProps || this.props;
       //var node = ReactDOM.findDOMNode(this);
       //d3.select(node).remove();
       d3.select(`#${this.props.chartid}`).remove();
       //ReactDOM.render(ChartFactory(newProps), node);
       this.handleStoreChange(newProps);
    }
  }

  render() {
    return (
      <div/>
    );
  }

};

Chart.propTypes = {
  year: React.PropTypes.string.isRequired,
  month: React.PropTypes.string.isRequired,
  what: React.PropTypes.array.isRequired,
  chartid: React.PropTypes.string.isRequired,
};

var ChartFactory = React.createFactory(Chart);

class Country extends Component {
    render(){
        return (
                <tr>
                    <td>{this.props.country.country}</td>
                    <td>{this.props.country.su}</td>
                </tr>
               );
         }
};

function loadData(props) {
  const { fulldate } = props;
  props.fetchTopTrading(`${fulldate}`);
}

export default class TopTradingPage extends Component {

  componentWillMount() {
    loadData(this.props);
  }

  componentWillReceiveProps(newprops) {
    if (this.props.fulldate !== newprops.fulldate) {
      loadData(newprops);
    }
  }
    render () {
        var importcountries=null;
        var importHead = null;
        if(this.props.toptrading && this.props.toptrading.topimports  && (this.props.toptrading.topimports.length > 0)){
            importcountries = this.props.toptrading.topimports.map(country =>
                <Country key={country.country} country={country}/>
            );
            importHead = (
              <span>
              <h2>Top Imports</h2>
              <Chart chartid="imports" what={this.props.toptrading.topimports} year={this.props.year} month={this.props.month} />
              </span>
            );
        } else {
          importHead = (
            <h2>Top Imports</h2>
          );
        }
        var exportcountries=null;
        var exportHead = null;
        if(this.props.toptrading && this.props.toptrading.topexports && (this.props.toptrading.topexports.length > 0)){
            exportcountries = this.props.toptrading.topexports.map(country =>
              <Country key={country.country} country={country}/>
            );
            exportHead = (
              <span>
              <h2>Top Exports</h2>
              <Chart chartid="exports" what={this.props.toptrading.topexports} year={this.props.year} month={this.props.month} />
              </span>
            );
        } else {
          exportHead = (
            <h2>Top Exports</h2>
          );
        }
        return (
            <div>
            {importHead}
            <table>
              <tbody>
                <tr>
                    <th>Country</th>
                    <th>Sum</th>
                </tr>
                {importcountries}
              </tbody>
            </table>
            {exportHead}
            <table>
              <tbody>
                <tr>
                    <th>Country</th>
                    <th>Sum</th>
                </tr>
                {exportcountries}
              </tbody>
            </table>
            </div>
        )

    }
}

TopTradingPage.propTypes = {
  fulldate: PropTypes.number.isRequired,
  year:  PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
  selectedtoptrading: PropTypes.string.isRequired,
  toptrading: PropTypes.shape({
      topimports: PropTypes.array.isRequired,
      topexports: PropTypes.array.isRequired,
  }),
  fetchTopTrading: PropTypes.func.isRequired,
}

//  selectedTopTrading: '201508',
//  topTradingByDate: {
function mapStateToProps(state, appProps) {
  const { year, month } = appProps.params; //tate.router.params
  //const year = appProps.params.year
  //const month = "8"
  const {
    selectedTopTrading,
    topTradingByDate
  } = state

  const fulldate = Number(sprintf("%d%02d", Number(year), Number(month)));
  //const fullDate = Number(`${year}${month}`);
  const items = (
    topTradingByDate[fulldate] ?
          {
            topimports: topTradingByDate[fulldate].items.topimports,
            topexports: topTradingByDate[fulldate].items.topexports
          }
    :
    {topimports: [], topexports: []}
  );

  return {
    fulldate,
    year,
    month,
    selectedtoptrading: selectedTopTrading,
    toptrading: items,
  }
}

var TopTradingPageFactory = React.createFactory(TopTradingPage);

export default connect(mapStateToProps, {
  fetchTopTrading
})(TopTradingPage)
