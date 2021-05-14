    const axios = require('axios')
    const { config } = require('./config')

    const parseData = () => {

        const teams = {
            0: 'Arsenal',
            1: 'Aston Villa',
            2: 'Brighton and Hove Albion',
            3: 'Burnley',
            4: 'Chelsea',
            5: 'Crystal Palace',
            6: 'Everton',
            7: 'Fulham',
            8: 'Leeds United',
            9: 'Leicester City',
            10: 'Liverpool',
            11: 'Manchester City',
            12: 'Manchester United',
            13: 'Newcastle United',
            14: 'Sheffield United',
            15: 'Southampton',
            16: 'Tottenham Hotspur',
            17: 'West Bromwich Albion',
            18: 'West Ham United',
            19: 'Wolverhampton Wanderers'
        }

        const API_KEY = config.api_key
        axios.get(`https://api.the-odds-api.com/v3/odds/?apiKey=${API_KEY}&sport=soccer_epl&region=uk`)
        .then(res => {        
            //log remaining requests - 500max per month
            console.log(`Requests Remaining: ${res.headers['x-requests-remaining']}\n`)
            
            //fixtures to rank
            const fixtures = [`${teams[13]} v ${teams[11]}`, `${teams[3]} v ${teams[8]}`, `${teams[15]} v ${teams[7]}`, `${teams[2]} v ${teams[18]}`, `${teams[5]} v ${teams[1]}`, `${teams[16]} v ${teams[19]}`, `${teams[17]} v ${teams[10]}`, `${teams[6]} v ${teams[14]}`]
            const jsonData = res.data.data
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
                fixture.teams.forEach(team => {
                    if (team !== fixtureObj.homeTeam) {
                        fixtureObj.awayTeam = team
                    }
            })
            
            //put odds in correct place in fixture obj
            fixture.sites.forEach(site => {
                if(fixture.teams[0] == fixtureObj.homeTeam) {
                    fixtureObj.homeOdds += site.odds.h2h[0]
                    fixtureObj.awayOdds += site.odds.h2h[1]
                } else {
                    fixtureObj.homeOdds += site.odds.h2h[1]
                    fixtureObj.awayOdds += site.odds.h2h[0]
                }
                fixtureObj.drawOdds += site.odds.h2h[2]
            })

            //round odds
            fixtureObj.homeOdds = Math.round((fixtureObj.homeOdds / fixture.sites.length) * 100) / 100
            fixtureObj.awayOdds = Math.round((fixtureObj.awayOdds / fixture.sites.length) * 100) / 100
            fixtureObj.drawOdds = Math.round((fixtureObj.drawOdds / fixture.sites.length) * 100) / 100

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

        //remove irrelevent fixutres fro predictions array
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


    parseData()

    module.exports = { parseData }