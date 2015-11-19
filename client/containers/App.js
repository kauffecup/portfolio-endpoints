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

import React, { Component, PropTypes } from 'react'
import { connect }       from 'react-redux'
import classNames        from 'classnames';
import Constants         from '../constants/Constants';

import Header from '../components/Header';

import {
  addCompany,
  removeCompany,
  toggleSelect,
  toggleCondensedCompanies,
  getStrings,
  setDate,
  closeArticleList,
  clearPotentialCompanies,
  searchCompany,
  getStockData,
  getTweets,
  closeTweets,
  getSelectedNews
} from '../actions/actions';

/**
 * The app entry point
 */
class StockInsights extends Component {
  /**
   * Currently the app consists of a header and a CompanyContainer
   */
  render() {
    // injected by connect call
    var {dispatch, strings} = this.props;

    return (
      <div className="stock-insights">
        <Header strings={strings} />
      </div>
    );
  }

  /**
   * When mounting/unmounting add/remove change listeners to stores
   */
  componentDidMount() {
    this.props.dispatch(getStrings(this.props.language));
    // if we already have companies, request the stock data to populate
    // our visualizations
    if (this.props.companies.companies.length) {
      var symbols = this.props.companies.companies.map(c => c.symbol)
      this.props.dispatch(getStockData(symbols));
    }
  }
};

StockInsights.propTypes = {
  strings: PropTypes.object.isRequired,
  companies: PropTypes.object.isRequired
}

var select = state => ({
  strings: state.strings,
  companies: state.companies
});

// Wrap the component to inject dispatch and state into it
export default connect(select)(StockInsights)
