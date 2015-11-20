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
import { connect } from 'react-redux';
import Constants   from '../constants/Constants';
// fellow containers
import Companies from './Companies';
// dumb components
import Header from '../components/Header';
// actions
import {
  getStrings,
  getStockData
} from '../actions/actions';

/**
 * The app entry point
 */
class StockInsights extends Component {
  render() {
    // injected by connect call
    const {dispatch, strings} = this.props;

    return (
      <div className="stock-insights">
        <Header strings={strings} />
        <Companies />
      </div>
    );
  }

  /**
   * When we mount, load the strings and load our company data
   */
  componentDidMount() {
    this.props.dispatch(getStrings(this.props.language));
    // if we already have companies, request the stock data and
    // sentiment history to populate our visualizations
    const { dispatch } = this.props;
    if (this.props.companies.length) {
      const symbols = this.props.companies.map(c => c.symbol)
      dispatch(getStockData(symbols));
    }
  }
};

StockInsights.propTypes = {
  strings: PropTypes.object.isRequired,
  companies: PropTypes.array.isRequired
}

var select = state => ({
  strings: state.strings,
  companies: state.companies
});

// Wrap the component to inject dispatch and state into it
export default connect(select)(StockInsights)
