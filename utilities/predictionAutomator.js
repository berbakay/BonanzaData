    const axios = require('axios')
    const { config } = require('../config')

    const parseData = (fixtureArray) => {

        const API_KEY = config.api_key
        axios.get(`https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?regions=uk&apiKey=${API_KEY}`)
        .then(res => {        
            //log remaining requests - 500max per month
            console.log(`Requests Remaining: ${res.headers['x-requests-remaining']}\n`)
            
            //fixtures to rank
            const fixtures = fixtureArray;
            const jsonData = res.data
            const predictions = []
        
            jsonData.forEach(fixture => {
                const fixtureObj = {
                    homeTeam: "",
                    awayTeam: "",
                    homeOdds: 0,
                    awayOdds: 0,
                    drawOdds: 0
                }

                fixtureObj.homeTeam = fixture.home_team

                //log away team in fixture object
                fixtureObj.awayTeam = fixture.away_team
            
                //put odds in correct place in fixture obj
                fixture.bookmakers.forEach(site => {
                    if(site.markets[0].outcomes[0].name == fixtureObj.homeTeam) {
                        fixtureObj.homeOdds += site.markets[0].outcomes[0].price
                        fixtureObj.awayOdds += site.markets[0].outcomes[1].price
                    } else {
                        fixtureObj.homeOdds += site.markets[0].outcomes[1].price
                        fixtureObj.awayOdds += site.markets[0].outcomes[0].price
                    }
                    fixtureObj.drawOdds += site.markets[0].outcomes[2].price
                })

            //round odds
            fixtureObj.homeOdds = Math.round((fixtureObj.homeOdds / fixture.bookmakers.length) * 100) / 100
            fixtureObj.awayOdds = Math.round((fixtureObj.awayOdds / fixture.bookmakers.length) * 100) / 100
            fixtureObj.drawOdds = Math.round((fixtureObj.drawOdds / fixture.bookmakers.length) * 100) / 100

            //pick lowest odds which determines which result to back
            if(fixtureObj.homeOdds <= fixtureObj.awayOdds && fixtureObj.homeOdds <= fixtureObj.drawOdds) {
                predictions.push({
                    fixture: `${fixtureObj.homeTeam} v ${fixtureObj.awayTeam}`, 
                    result: 'H', 
                    odds: fixtureObj.homeOdds
                })
            } else if(fixtureObj.awayOdds < fixtureObj.homeOdds && fixtureObj.awayOdds <= fixtureObj.drawOdds) {
                predictions.push({
                    fixture: `${fixtureObj.homeTeam} v ${fixtureObj.awayTeam}`, 
                    result: 'A', 
                    odds: fixtureObj.awayOdds
                })
            } else if(fixtureObj.drawOdds < fixtureObj.homeOdds && fixtureObj.drawOdds < fixtureObj.awayOdds) {
                predictions.push({
                    fixture: `${fixtureObj.homeTeam} v ${fixtureObj.awayTeam}`, 
                    result: 'D', 
                    odds: fixtureObj.drawOdds
                })
            }
        });
        
        //uncomment these console logs if you want to debug why there might be some missing fixtures
        //console.log(predictions);
        //console.log(fixtures);
        
        //remove irrelevent fixutres from predictions array
        const filteredPredictions = predictions.filter(prediction => {
            return fixtures.includes(prediction.fixture)
        })

        // predictions from most likely to least likely
        filteredPredictions.sort((a, b) => (a.odds > b.odds) ? 1 : ((b.odds > a.odds) ? -1 : 0))

        //randomise odds that are close to eachother
        randomGroup = [];
        const randomPredictions = [];

        filteredPredictions.forEach( prediction => {
            /* if we haven't got anything in the array lets start a new one */
            if( randomGroup.length ==  0 )
                randomGroup.push( prediction )
            else
            {
                /* if the difference with the first one is less then or equal to 0.1 then add it to array */
                if( prediction.odds - randomGroup[0].odds <= 0.1 )
                    randomGroup.push( prediction )
                else
                {
                    /* if not pseudo randomly sort array and push to final array */
                    randomGroup.sort( () => Math.random() - 0.5 )
                    randomGroup.forEach( randomPrediction => {
                        randomPredictions.push(randomPrediction)
                    })
                    /* reset array and push this prediction to it */
                    randomGroup = []
                    randomGroup.push(prediction)
                }   
            }
        })

        // make sure to add the last set of fixtures
        randomGroup.sort( () => Math.random() - 0.5 )
        randomGroup.forEach( randomPrediction => {
            randomPredictions.push(randomPrediction)
        })

        let count = 10

        //print fixtures, result and rank
        randomPredictions.forEach(prediction => {
            console.log(`${prediction.fixture}, ${prediction.result}, ${count} (${prediction.odds})`)
            count -= 1;
        })          
        })
    }

    module.exports = { parseData }