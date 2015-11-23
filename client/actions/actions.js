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

import Constants from '../constants/Constants';
import {
  sentimentHistory,
  companyLookup,
  stockPrice,
  stockNews,
  tweets,
  strings
} from '../requester';

/** Clear potential companies */
export function clearPotentialCompanies() {
  return { type: Constants.CLEAR_POTENTIAL_COMPANIES };
}

/** Remove a company */
export function removeCompany(company) {
  return { type: Constants.REMOVE_COMPANY, company: company };
}

/** Search for companies */
export function searchCompany(companyName) {
  return dispatch => {
    dispatch({ type: Constants.COMPANIES_LOADING });
    companyLookup(companyName).then(companies => {
      dispatch({ type: Constants.COMPANY_DATA, companies: companies });
    });
  }
}

/** Toggle a company's selected-ness */
export function toggleSelect(symbol) {
  return (dispatch, getState) => {
    symbol = symbol.symbol || symbol._id || symbol;
    var { selectedCompany } = getState();
    if (selectedCompany === symbol) {
      dispatch({ type: Constants.DESELECT_COMPANY });
    } else {
      dispatch({ type: Constants.DESELECT_COMPANY, symbol: symbol });
    }
    // todo: sentiment history?
  }
}

/** Add a company */
export function addCompany(company) {
  return dispatch => {
    dispatch({ type: Constants.ADD_COMPANY, company: company });
    if (company.symbol) {
      dispatch({ type: Constants.STOCK_PRICE_LOADING, symbols: company.symbol });
      stockPrice(company.symbol).then(data => {
        dispatch({ type: Constants.STOCK_PRICE_DATA, data: data });
      });
    }
  }
}

/** Get the globalized strings */
export function getStrings(language) {
  return dispatch => {
    strings(language).then(strings => {
      dispatch({ type: Constants.STRING_DATA, strings: strings });
    });
  }
}

/** Get the stock data for a given array of companies */
export function getStockData(symbols) {
  return dispatch => {
    dispatch({ type: Constants.STOCK_PRICE_LOADING, symbols: symbols });
    stockPrice(symbols).then(data => {
      dispatch({ type: Constants.STOCK_PRICE_DATA, data: data });
    });
  }
}

/** Get the average sentiment history for a single company */
export function getSentimentHistory(symbol) {
  return dispatch => {
    dispatch({ type: Constants.SENTIMENT_HISTORY_LOADING, symbol: symbol});
    sentimentHistory(symbol).then(data => {
      dispatch({ type: Constants.SENTIMENT_HISTORY_DATA, data: data, symbol: symbol });
    });
  }
}

/** Get the most recent tweets about a symbol/entity combo */
export function getTweets(symbols, entity) {
  return (dispatch, getState) => {
    var { language } = getState();
    dispatch({ type: Constants.TWEETS_LOADING, symbols: symbols, entity: entity });
    tweets(symbols, entity, language).then(data => {
      dispatch({ type: Constants.TWEETS_DATA, data: data });
    });
  }
}
