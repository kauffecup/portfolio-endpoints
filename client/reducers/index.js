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

import moment       from 'moment';
import clone        from 'clone';
import assign       from 'object-assign';
import Constants    from '../constants/Constants';
import initialState from './initialState';

/**
 * Helper method to store the companies in the browser's local storage
 */
function _updateLocalStorage (companies) {
  localStorage.setItem(Constants.COMPANY_LOCAL_STORAGE, JSON.stringify(companies));
}

export default function reduce (state = initialState, action) {
  switch(action.type) {
    case Constants.ADD_COMPANY:
      var newCompanies = [action.company, ...state.companies.companies];
      _updateLocalStorage(newCompanies);
      return assign({}, state, {
        companies: assign({}, state.companies, {
          companies: newCompanies
        })
      });
      break;

    case Constants.REMOVE_COMPANY:
      var symbol = action.company.symbol || action.company;
      var stockDataMap = clone(state.stockData);
      delete stockDataMap[symbol];
      var sentimentDataMap = clone(state.sentimentHistory);
      delete sentimentDataMap[symbol];
      var newCompanies = state.companies.companies.filter(c => c !== action.company);
      _updateLocalStorage(newCompanies);
      return assign({}, state, {
        stockData: stockDataMap,
        sentimentHistory: sentimentDataMap,
        companies: assign({}, state.companies, {
          companies: newCompanies
        })
      });
      break;

    case Constants.EDIT_ENTER:
      return assign({}, state, {
        companies: assign({}, state.companies, {
          editing: true
        })
      });
      break;

    case Constants.EDIT_CANCEL:
      return assign({}, state, {
        companies: assign({}, state.companies, {
          editing: false
        })
      });
      break;

    case Constants.SELECT_COMPANY:
      return assign({}, state, {
        selectedCompany: action.symbol
      });
      break;

    case Constants.DESELECT_COMPANY:
      return assign({}, state, {
        selectedCompany: null
      });
      break;

    case Constants.STOCK_PRICE_DATA:
      return assign({}, state, {
        stockData: assign({}, state.stockData, action.data)
      })
      break;

    case Constants.SENTIMENT_HISTORY_LOADING:
      var newObj = {};
      newObj[action.symbol] = 'loading';
      return assign({}, state, {
        sentimentHistory: assign({}, state.sentimentHistory, newObj)
      });
      break;

    case Constants.SENTIMENT_HISTORY_DATA:
      var newObj = {};
      newObj[action.symbol] = action.data;
      return assign({}, state, {
        sentimentHistory: assign({}, state.sentimentHistory, newObj)
      });
      break;

    case Constants.COMPANIES_LOADING:
      return assign({}, state, {
        potentialCompanies: assign({}, state.potentialCompanies, {
          status: Constants.POTENTIAL_STATUS_LOADING
        })
      });
      break;

    case Constants.COMPANY_DATA:
      return assign({}, state, {
        potentialCompanies: assign({}, state.potentialCompanies, {
          status: Constants.POTENTIAL_STATUS_RECEIVED,
          companies: action.companies
        })
      });
      break;

    case Constants.CLEAR_POTENTIAL_COMPANIES:
      return assign({}, state, {
        potentialCompanies: assign({}, state.potentialCompanies, {
          status: Constants.POTENTIAL_STATUS_CLEAR,
          companies: []
        })
      });
      break;

    case Constants.STRING_DATA:
      return assign({}, state, {
        strings: action.strings
      });
      break;

    default:
      return state;
      break;
  }
}
