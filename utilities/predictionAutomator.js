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

        //remove irrelevent fixutres from predictions array
        const filteredPredictions = predictions.filter(prediction => {
            return fixtures.includes(prediction.fixture)
        })

        // predictions from most likely to least likely
        filteredPredictions.sort((a, b) => (a.odds > b.odds) ? 1 : ((b.odds > a.odds) ? -1 : 0))

        let count = 10

        //print fixtures, result and rank
        filteredPredictions.forEach(prediction => {
            console.log(`${prediction.fixture}, ${prediction.result}, ${count}`)
            count -= 1;
        })          
        })
    }

    module.exports = { parseData }