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
import classNames from 'classnames';
import LineGraph  from './LineGraph';
import Avatar     from './Avatar';
import minusSvg   from '../svgs/minus.svg';

const DRAW_TIME = 400;

export default class Company extends Component {
  render() {
    const {symbol, description, data, strings, onClick, sentimentHistory, editing} = this.props;
    const myStockData = this.formatStockData();
    const sentimentLoading = sentimentHistory === 'loading';

    var series = 'symbol';
    var mySentimentData = [];
    if (!sentimentLoading) {
      mySentimentData = this.formatSentimentData();
    }

    const loading = !data.length || sentimentLoading;
    const change = data.length ? data[data.length - 1].change : null;
    const last = data.length ? data[data.length - 1].last : null;

    return (
      <div className="company">
        {editing ? <div className="remove"
          dangerouslySetInnerHTML={{__html: minusSvg}}
          onClick={this.props.onRemove}></div>
        : null}
        <Avatar symbol={symbol} description={description} change={change} last={last} loading={loading} onClick={onClick} />
        {data.length ? <LineGraph stockData={myStockData} sentimentData={mySentimentData} />
        : <span className="graph loading">{strings.loading}</span>}
      </div>
    );
  }

  formatStockData() {
    return this.props.data.map(d => ({
      symbol: this.props.symbol,
      date: d.date,
      last: d.last
    }));
  }

  formatSentimentData() {
    return this.props.sentimentHistory.map(d => ({
      mattDamon: 'Sentiment',
      date: d.date,
      sentiment: d.sentiment
    }));
  }
}

Company.propTypes = {
  symbol: PropTypes.string.isRequired,
  description: PropTypes.string,
  data: PropTypes.array.isRequired,
  strings: PropTypes.object.isRequired,
  editing: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  sentimentHistory: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]).isRequired
}
