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
import clone from 'clone';

import Company from '../components/Company';

class Companies extends Component {
  render() {
    const {dispatch, strings, companies} = this.props;
    return (
      <ul className="companies">{companies.map(c =>
        <Company key={c.symbol} {...c} strings={strings} />
      )}</ul>
    );
  }
}

Companies.propTypes = {
  strings: PropTypes.object.isRequired,
  companies: PropTypes.array.isRequired
}

/**
 * Here we're gonna select what state we want for this container.
 * We're gonna do a little bit of magic... we want both the strings
 * and the companies. But we're gonna add the stock data (which is
 * maintained in a separate state object) into our array of companies
 */
var select = state => {
  var myCompanies = [];
  state.companies.map(c => {
    let myC = clone(c);
    myC.data = state.stockData[c.symbol] || [];
    myCompanies.push(myC);
  });
  return {
    strings: state.strings,
    companies: myCompanies
  };
};

// Wrap the component to inject dispatch and state into it
export default connect(select)(Companies)
