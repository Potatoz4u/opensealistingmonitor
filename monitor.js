const { time } = require("console");

const axios = require("axios").default;


let initTS = Math.round((new Date()).getTime() / 1000);
let settings = { timeStamp: initTS, tokenId: '0', slug: ''}; // enter collection slug


async function getLatestListings(){

  let options = {
    method: 'GET',
    url: `https://api.opensea.io/api/v1/events?only_opensea=true&collection_slug=${settings.slug}&event_type=created&occurred_after=${settings.timeStamp}`,
    headers: {Accept: 'application/json', 'X-API-KEY': ''} // insert api key here
  };
  
  axios.request(options).then(function(response) {

    if (response.data.asset_events.length != 0) {

        for (i = response.data.asset_events.length - 1; i >= 0; i--) {
          
            if (response.data.asset_events[i].asset_bundle == null) {

                let scrapedToken = response.data.asset_events[i].asset.token_id;

                if (scrapedToken != settings.tokenId) {

                    settings.tokenId = scrapedToken;
                    settings.timeStamp = Math.round((new Date()).getTime() / 1000);

                    console.log(settings.timeStamp + ": Token #" + settings.tokenId + " Found for " + (response.data.asset_events[i].starting_price) / 1000000000000000000 + " ETH");

                } else {
                    console.log(settings.timeStamp + ": Duplicate Token Found");
                }
            } else { // bundles
                console.log(settings.timeStamp + ": Bundle Found! " + response.data.asset_events[i].asset_bundle.slug);
                settings.timeStamp = Math.round((new Date()).getTime() / 1000);

                for (j = response.data.asset_events[i].asset_bundle.assets.length - 1; j >= 0; j--) {

                  let scrapedToken = response.data.asset_events[i].asset_bundle.assets[j].token_id;

                  settings.tokenId = scrapedToken;
                  settings.timeStamp = Math.round((new Date()).getTime() / 1000);

                  console.log(settings.timeStamp + ": Token #" + settings.tokenId + " Found in Bundle for " + (((response.data.asset_events[i].starting_price) / 1000000000000000000)/response.data.asset_events[i].asset_bundle.assets.length) + " ETH");

                }  
            }
        }

    } else {
        console.log(settings.timeStamp + ": No New Listings Found! Retrying...");
    }

  }).catch(function(error) {

      console.error(error);

});

}

setInterval(getLatestListings, 2000); // change 2000 to desired refresh time in milliseconds
