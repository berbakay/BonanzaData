const fs = require('fs');
const { parseData } = require('./predictionAutomator');

const readFixture = () => {

    let fixturesArray = [];

    fs.readFile("fixtures.txt", 'utf8', (err, data) => {
        if (err) console.log(err);
        else {
            let splitFixtures = data.split('\n')
            
            //this is getting rid of the blank fixtures as txt files have blank lines which are split above
            let noSpaceFilter = splitFixtures.filter(fixture => fixture != " ");
            let noBlankFixtures = noSpaceFilter.filter(fixture => fixture != "");
    
            const teams = {
                'Brighton': 'Brighton and Hove Albion',
                'Newcastle': 'Newcastle United',
                'Norwich': 'Norwich City',
                'Tottenham': 'Tottenham Hotspur',
                'West Ham': 'West Ham United',
                'Wolves': 'Wolverhampton Wanderers',
                'Leeds': 'Leeds United',
                'Leicester': 'Leicester City',
                'Man City': 'Manchester City',
                'Man United': 'Manchester United'
            }
    
            //if fixtures contains any of the keys replace with full team name
            noBlankFixtures.forEach(fixture => {
                Object.keys(teams).forEach(team => {
                    if (fixture.includes(team)) {

                        let newFixture = fixture.replace(team, teams[team]);
                        
                        //handle dirty Leeds edge case
                        if (newFixture.includes('Leeds United United')) {
                            newFixture = newFixture.replace('Leeds United United', 'Leeds United');
                        };

                        noBlankFixtures[noBlankFixtures.indexOf(fixture)] = newFixture;
                        fixture = newFixture;
                    }
                })
            })
            
            noBlankFixtures.forEach((fixture, i) => {
                fixturesArray[i] = fixture;
            })

            parseData(noBlankFixtures);
        }
    })
}

module.exports = { readFixture }