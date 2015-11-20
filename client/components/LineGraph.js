//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

import React, { Component, PropTypes } from 'react';
import dimple from 'dimple';

const DRAW_TIME = 400;

export default class LineGraph extends Component {
  render() {
    return <span className="graph" ref="_graph"></span>;
  }

  componentDidMount() {
    var svg = dimple.newSvg(this.refs._graph, '100%', '100%');
    this.lineChart = new dimple.chart(svg, this.props.data);
    this.lineChart.setBounds(30, 14, '100%,-40', '100%,-34');

    // intialize the axis
    this.x = this.lineChart.addTimeAxis('x', 'date', "%Y-%m-%d", '%b %d');
    this.y = this.lineChart.addMeasureAxis('y', 'last');
    this.y.ticks = 4;
    this.updateAxis();

    // initialize the series lines
    var lines = this.lineChart.addSeries('symbol', dimple.plot.line);
    lines.lineMarkers = true;

    // initialize the legend
    this.legend = this.lineChart.addLegend(60, 5, '100%,-50', 20, "right");

    // lessss go
    this.lineChart.draw(DRAW_TIME);
  }

  /** When our props change, update the graphs data and min/max axis stuff */
  componentDidUpdate() {
    this.lineChart.data = this.props.data;
    this.updateAxis();
    this.lineChart.draw(DRAW_TIME);
  }

  updateAxis() {
    var myNums = this.props.data.map(d => d.last);
    this.y.overrideMin = Math.min(...myNums);
    this.y.overrideMax = Math.max(...myNums);
  }
}

LineGraph.propTypes = {
  data: PropTypes.array.isRequired
}
