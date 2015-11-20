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

import express      from 'express';
import path         from 'path';
import Promise      from 'bluebird';
import gaas         from 'gaas';
import locale       from 'locale';
import moment       from 'moment';
import vcapServices from './vcapServices';

var router = express.Router();
var gaasClient = gaas.getClient({credentials: vcapServices.globalization.credentials});
var gaasStock = Promise.promisifyAll(gaasClient.project('stockinsights'));
var request = Promise.promisifyAll(require('request'));

var supportedLocales = new locale.Locales([
  'en', 'zh-Hant', 'zh-Hans', 'fr', 'de', 'it', 'ja', 'pt-br', 'es'
]);

/* GET strings. */
var stringCache = {};
router.get('/strings', (req, res) => {
  // if a language is specified in the request, prioritize that
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  // first we check our cache - if there return immediately
  if (stringCache[langCode]) {
    res.json(stringCache[langCode]);
  // otherwise we're gonna go off to the globalization service
  // once we get the new data object, we hold on to it for quicker
  // second requests
  } else {
    gaasStock.getResourceDataAsync({
      languageID: langCode
    }).then(([{data}, body]) => {
      stringCache[langCode] = data;
      res.json(data);
    }).catch(e => {
      res.status(500);
      res.json(e);
    });
  }
});

/* Company Lookup. query takes company */
router.get('/companylookup', (req, res) => {
  const company = req.query.company;
  const {client_id, client_secret, url} = vcapServices.companyLookup.credentials;
  return _doGet(url + '/markets/find', {client_id: client_id, name: company}, res);
});

/* Stock News. query takes symbol */
router.get('/stocknews', (req, res) => {
  // if a language is specified in the request, prioritize that
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  const symbol = req.query.symbol;
  const {client_id, client_secret, url} = vcapServices.stockNews.credentials;
  return _doGet(url + '/news/find', {client_id: client_id, symbol: symbol, language: langCode}, res);
});

/* Stock Price. query takes symbols */
router.get('/stockprice', (req, res) => {
  const symbols = req.query.symbols;

  const {client_id: client_id1, client_secret: client_secret1, url: url1} = vcapServices.stockPrice.credentials;
  const {client_id: client_id2, client_secret: client_secret2, url: url2} = vcapServices.stockHistory.credentials;

  const pricePromise   = request.getAsync({url: url1 + '/markets/quote',   qs: {client_id: client_id1, symbols: symbols}, json: true});
  const historyPromise = request.getAsync({url: url2 + '/markets/history', qs: {client_id: client_id2, symbols: symbols}, json: true});

  Promise.join(pricePromise, historyPromise, ([pR, pB], [hR, hB]) => {
    // build a map of symbol -> price objects
    var priceMap = {};
    for (var price of pB) {
      priceMap[price.symbol] = price;
    }

    // if all of the current change values are falsy, we'll want to use yesterday's
    var usePreviousChangeValues = pB.every(p => !p.change);

    // iterate over the history map and convert to expected data type
    // additionallyalally, add today's price values to the array in one nice
    // happy array family
    for (var symbol in hB) {
      var price = priceMap[symbol];
      hB[symbol] = hB[symbol].map(h => ({
        change: h.close - h.open,
        symbol: symbol,
        last: h.close,
        date: h.date,
        week_52_high: price.week_52_high,
        week_52_low: price.week_52_low
      }));
      var d = new Date();
      var previousSymbol = hB[symbol][hB[symbol].length-1];
      hB[symbol].push({
        change: usePreviousChangeValues ? previousSymbol.change : price.change,
        symbol: symbol,
        last: price.last,
        date: '' + d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate(),
        week_52_high: price.week_52_high,
        week_52_low: price.week_52_low
      });
    }
    res.json(hB);
  }).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e);
  });
});

/* Get tweets and sentiment about an entity and topic */
router.get('/tweets', (req, res) => {
  // if a language is specified in the request, prioritize that
  const locales = new locale.Locales(req.headers['accept-language']);
  const langCode = req.query.language || locales.best(supportedLocales).code;
  // proceed with business as usual
  const symbols = req.query.symbol || req.query.symbols;
  const entity = req.query.entity;

  // issue requests for the tweets and the sentiment
  const {client_id: client_id1, client_secret: client_secret1, url: url1} = vcapServices.stockTweets.credentials;
  const {client_id: client_id2, client_secret: client_secret2, url: url2} = vcapServices.stockSentiment.credentials;
  const tweetProm = request.getAsync({url: url1 + '/twitter/find',   qs: {client_id: client_id1, symbol: symbols, entity: entity, language: langCode}, json: true});
  const sentProm  = request.getAsync({url: url2 + '/sentiment/find', qs: {client_id: client_id2, symbol: symbols, entity: entity}, json: true});

  // only return one object
  Promise.join(tweetProm, sentProm, ([tR, tB], [sR, sB]) => {
    res.json({
      tweets: tB,
      sentiment: sB
    });
  }).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e);
  });
});

/* For a given symbol get the average sentiment for each day for the last 30d. */
router.get('/sentiment-history', (req, res) => {
  const symbols = req.query.symbol || req.query.symbols;
  const {client_id, client_secret, url} = vcapServices.stockNews.credentials;

  // step 1: populate our start and end times for the last 30 days
  var thirtyDays = [];
  var start = moment().startOf('day').subtract(30, 'day').unix()*1000
  for (var i = 30; i >= 0; i--) {
    thirtyDays.push({
      start: moment().startOf('day').subtract(i, 'day').unix()*1000,
      end: moment().startOf('day').subtract(i-1, 'day').unix()*1000 - 1
    });
  }

  // step 2: make our request for the top 100 entities for each of those days
  Promise.map(thirtyDays, se =>
    request.getAsync({url: url + '/news/find', json: true, qs: {
      symbol: symbols,
      start: se.start,
      end: se.end,
      alimit: 0,
      elimit: 100,
      client_id: client_id
    }})
  // step 3: average the sentiment over all of our entities and format them
  // into an object with the sentiment and date
  ).map(([response, {entities}], i) => {
    var r = entities.reduce((prev, cur) => ({
      count: prev.count + cur.count,
      sentiment: prev.sentiment + (cur.count * cur.averageSentiment)
    }), {count: 0, sentiment: 0});
    return {
      sentiment: r.sentiment / r.count,
      date: moment(thirtyDays[i].start).format('YYYY-MM-DD')
    };
  // step 4: return either the array of fun objects or an error to the client
  }).then(a => res.json(a)).catch(e => {
    console.error(e);
    res.status(500);
    res.json(e)
  });
});

/* Helper GET method for companylookup and stockprice similarities */
function _doGet(url, qs, res) {
  return request.getAsync({url: url, qs: qs, json: true}).then(([response, body]) => {
    body.httpCode && res.status(parseInt(body.httpCode));
    res.json(body);
  }).catch(e => {
    res.status(500);
    res.json(e);
  });
}

export default router;
