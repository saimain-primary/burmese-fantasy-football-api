const { default: mongoose } = require("mongoose");
const {
    compareBoostedTotalPoint,
    compareAllSumPoint,
} = require("../helpers/sort");
const FixtureService = require("./FixtureService");
const PredictionService = require("./PredictionService");
const UserService = require("./user/UserService");
const PlayerService = require("./PlayerService");

module.exports.getList = async (req) => {
    const predictions = await PredictionService.getListCustom(req);
    const fixtureList = await FixtureService.getListCustom({
        fixture_week: req.query.fixture_week,
        league_id: req.query.league_id,
    });

    let predictionResultList = [];

    let fixtureIdList = [];

    predictions.map((p) => {
        if (!fixtureIdList.includes(p.fixture_id)) {
            fixtureIdList.push(p.fixture_id);
        }
    });

    let playerStatistics = await PlayerService.getPlayerStatistic({
        fixtures: fixtureIdList.join(","),
    });

    predictions.forEach(async (prediction) => {
        let fixtureObj = fixtureList.filter((f) => {
            return f.fixture.id === parseInt(prediction.fixture_id);
        });

        let fixturePlayers = playerStatistics.filter((ps) => {
            return ps.fixtureId == fixtureObj[0].fixture.id;
        });

        let playerOfTheMatchResult = fixturePlayers.sort(function (a, b) {
            return b.statistics[0].games.rating - a.statistics[0].games.rating;
        })[0]?.player;

        if (fixtureObj[0]) {
            let singlePredictionResult = {
                _id: prediction._id,
                user: prediction.user,
                user_id: prediction.user_id,
                week: prediction.week,
                points: [
                    {
                        teams: {
                            home_team: prediction.home_team,
                            away_team: prediction.away_team,
                        },
                        fixture_id: prediction.fixture_id,
                        predicts: {
                            home: prediction.home,
                            away: prediction.away,
                            boosted: prediction.boosted,
                            winner: prediction.winner,
                            player_of_the_match: prediction.player_of_the_match,
                        },
                        results: {
                            home: fixtureObj[0].goals.home
                                ? fixtureObj[0].goals.home.toString()
                                : 0,
                            away: fixtureObj[0].goals.away
                                ? fixtureObj[0].goals.away.toString()
                                : 0,
                            winner:
                                (fixtureObj[0].teams.home.winner &&
                                    fixtureObj[0].teams.home.id) ||
                                (fixtureObj[0].teams.away.winner &&
                                    fixtureObj[0].teams.away.id),
                            player_of_the_match: playerOfTheMatchResult,
                        },
                        score: fixtureObj[0].score,
                        win_lose_draw: 0,
                        goal_different: 0,
                        home_team: 0,
                        away_team: 0,
                        winner: 0,
                        player_of_the_match: 0,
                        underdog_bonus: 0,
                        total: 0,
                    },
                ],
            };

            if (fixtureObj[0].fixture.status.long === "Match Finished") {
                const fixtureHomeTeamResult = (
                    fixtureObj[0].goals.home +
                    fixtureObj[0].score.extratime.home
                ).toString();
                const fixtureAwayTeamResult = (
                    fixtureObj[0].goals.away +
                    fixtureObj[0].score.extratime.away
                ).toString();
                const winnerTeamResult =
                    (fixtureObj[0].teams.home.winner &&
                        fixtureObj[0].teams.home.id) ||
                    (fixtureObj[0].teams.away.winner &&
                        fixtureObj[0].teams.away.id);
                const predictHomeTeam = prediction.home;
                const predictAwayTeam = prediction.away;
                const isPredictionBoosted = prediction.boosted;
                const winnerTeamWhenTie = prediction.winner;
                const playerOfTheMatch = prediction.player_of_the_match;

                const fixturePredictions = predictions.filter((p) => {
                    return p.fixture_id == fixtureObj[0].fixture.id;
                });

                const predictionsStringArr = fixturePredictions.map((fp) => {
                    return fp.home + ":" + fp.away;
                });

                const reducedPredictions = predictionsStringArr.reduce(
                    (count, item) => (
                        (count[item] = count[item] + 1 || 1), count
                    ),
                    {}
                );

                const predictedResult = predictHomeTeam + ":" + predictAwayTeam;
                const finalResult =
                    fixtureHomeTeamResult + ":" + fixtureAwayTeamResult;

                let underdog_percentage = 100;
                if (predictedResult == finalResult) {
                    underdog_percentage = Math.round(
                        (reducedPredictions[predictedResult] /
                            fixturePredictions.length) *
                            100
                    );
                }

                let win_lose_draw_result = "";
                let win_lose_draw_predict = "";
                let goal_different_result =
                    parseInt(fixtureHomeTeamResult) -
                    parseInt(fixtureAwayTeamResult);
                let goal_different_predict =
                    parseInt(predictHomeTeam) - parseInt(predictAwayTeam);

                if (parseInt(predictHomeTeam) === parseInt(predictAwayTeam)) {
                    win_lose_draw_predict = "draw";
                } else if (
                    parseInt(predictHomeTeam) > parseInt(predictAwayTeam)
                ) {
                    win_lose_draw_predict = "home_team_win";
                } else if (
                    parseInt(predictHomeTeam) < parseInt(predictAwayTeam)
                ) {
                    win_lose_draw_predict = "away_team_win";
                }

                if (
                    parseInt(fixtureHomeTeamResult) ===
                    parseInt(fixtureAwayTeamResult)
                ) {
                    win_lose_draw_result = "draw";
                } else if (
                    parseInt(fixtureHomeTeamResult) >
                    parseInt(fixtureAwayTeamResult)
                ) {
                    win_lose_draw_result = "home_team_win";
                } else if (
                    parseInt(fixtureHomeTeamResult) <
                    parseInt(fixtureAwayTeamResult)
                ) {
                    win_lose_draw_result = "away_team_win";
                }

                if (win_lose_draw_predict === win_lose_draw_result) {
                    singlePredictionResult.points[0].win_lose_draw = 3;
                }

                if (goal_different_predict === goal_different_result) {
                    singlePredictionResult.points[0].goal_different = 1;
                }

                if (
                    parseInt(predictHomeTeam) ===
                    parseInt(fixtureHomeTeamResult)
                ) {
                    singlePredictionResult.points[0].home_team = 1;
                }

                if (
                    parseInt(predictAwayTeam) ===
                    parseInt(fixtureAwayTeamResult)
                ) {
                    singlePredictionResult.points[0].away_team = 1;
                }

                if (winnerTeamResult) {
                    if (winnerTeamWhenTie == winnerTeamResult) {
                        singlePredictionResult.points[0].winner = 3;
                    }
                }

                // const fixtureDetailResponse = await FixtureService.getDetail(fixtureObj[0].fixture.id);
                // console.log("🚀 ~ file: LeaderboardService.js:212 ~ predictions.forEach ~ fixtureDetail", fixtureDetailResponse)

                // if (true) {
                //   singlePredictionResult.points[0].underdog_bonus = 2;
                // }

                const values = Object.values(singlePredictionResult.points[0]);
                values.splice(0, 5);
                const sum = values.reduce((accumulator, value) => {
                    return accumulator + value;
                }, 0);

                singlePredictionResult.points[0].total = sum;

                if (isPredictionBoosted === true) {
                    singlePredictionResult.points[0].boosted_total = sum;
                    singlePredictionResult.points[0].boosted_total =
                        singlePredictionResult.points[0].boosted_total * 2;
                } else {
                    singlePredictionResult.points[0].boosted_total = sum;
                }

                if (playerOfTheMatchResult) {
                    if (playerOfTheMatch == playerOfTheMatchResult.id) {
                        singlePredictionResult.points[0].player_of_the_match = 2;
                        singlePredictionResult.points[0].total += 2;
                        singlePredictionResult.points[0].boosted_total += 2;
                    }
                }

                if (underdog_percentage < 10) {
                    singlePredictionResult.points[0].underdog_bonus = 2;
                    singlePredictionResult.points[0].total += 2;
                    singlePredictionResult.points[0].boosted_total += 2;
                }

                predictionResultList.push(singlePredictionResult);
            }
        }
    });

    let finalArr = [];

    predictionResultList.forEach((prediction) => {
        const findExistingIndex = finalArr.findIndex((p) => {
            if (p.user_id.equals(prediction.user_id)) {
                return true;
            }
            return false;
        });

        if (findExistingIndex !== -1) {
            finalArr[findExistingIndex].points.push(prediction.points[0]);
        } else {
            finalArr.push(prediction);
        }
    });

    let leaderboardListReturn = [];

    finalArr.forEach((fa) => {
        const leaderboardSum = Object.values(fa.points);
        const sum = leaderboardSum.reduce((accumulator, value) => {
            return accumulator + value.boosted_total;
        }, 0);

        leaderboardListReturn.push({ ...fa, sum: sum });
    });
    return new Promise(function (resolve, reject) {
        try {
            resolve(leaderboardListReturn.sort(compareAllSumPoint));
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
};

module.exports.getDetail = async (req) => {
    let returnData = {};
    const predictions = await PredictionService.getListByUserID(req);
    const allPredictions = await PredictionService.getAllList(req);
    console.log("🚀 ~ file: LeaderboardService.js:287 ~ module.exports.getDetail= ~ predictions", allPredictions.length);

    
    const fixtureList = await FixtureService.getListCustom({
        fixture_week: req.query.fixture_week,
        league_id: req.query.league_id,
    });

    let predictionResultList = {
        user: null,
        results: [],
    };

    if (predictions.length > 0) {
        predictionResultList.user = predictions[0].user;

        let fixtureIdList = [];

        predictions.map((p) => {
            if (!fixtureIdList.includes(p.fixture_id)) {
                fixtureIdList.push(p.fixture_id);
            }
        });

        let playerStatistics = await PlayerService.getPlayerStatistic({
            fixtures: fixtureIdList.join(","),
        });

        predictions.forEach(async (prediction) => {
            let fixtureObj = fixtureList.filter((f) => {
                return f.fixture.id === parseInt(prediction.fixture_id);
            });

            let fixturePlayers = playerStatistics.filter((ps) => {
                return ps.fixtureId == fixtureObj[0].fixture.id;
            });

            let playerOfTheMatchResult = fixturePlayers.sort(function (a, b) {
                return (
                    b.statistics[0].games.rating - a.statistics[0].games.rating
                );
            })[0]?.player;

            if (fixtureObj[0]) {
                let singlePredictionResult = {
                    _id: prediction._id,
                    week: prediction.week,
                    teams: {
                        home_team: fixtureObj[0].teams.home,
                        away_team: fixtureObj[0].teams.away,
                    },
                    fixture: fixtureObj[0].fixture,
                    predicts: {
                        home: prediction.home,
                        away: prediction.away,
                        boosted: prediction.boosted,
                    },
                    results: {
                        home: fixtureObj[0].goals.home
                            ? fixtureObj[0].goals.home.toString()
                            : 0,
                        away: fixtureObj[0].goals.away
                            ? fixtureObj[0].goals.away.toString()
                            : 0,
                    },
                    score: fixtureObj[0].score,
                    points: [
                        {
                            win_lose_draw: 0,
                            goal_different: 0,
                            home_team: 0,
                            away_team: 0,
                            winner: 0,
                            player_of_the_match: 0,
                            underdog_bonus: 0,
                            total: 0,
                        },
                    ],
                };

                if (fixtureObj[0].fixture.status.long === "Match Finished") {
                    const fixtureHomeTeamResult = (
                        fixtureObj[0].goals.home +
                        fixtureObj[0].score.extratime.home
                    ).toString();
                    const fixtureAwayTeamResult = (
                        fixtureObj[0].goals.away +
                        fixtureObj[0].score.extratime.away
                    ).toString();
                    const predictHomeTeam = prediction.home;
                    const predictAwayTeam = prediction.away;
                    const isPredictionBoosted = prediction.boosted;
                    const winnerTeamResult =
                        (fixtureObj[0].teams.home.winner &&
                            fixtureObj[0].teams.home.id) ||
                        (fixtureObj[0].teams.away.winner &&
                            fixtureObj[0].teams.away.id);
                    const winnerTeamWhenTie = prediction.winner;
                    const playerOfTheMatch = prediction.player_of_the_match;

                    const fixturePredictions = allPredictions.filter((p) => {
                        return p.fixture_id == fixtureObj[0].fixture.id;
                    });
                    console.log("🚀 ~ file: LeaderboardService.js:387 ~ fixturePredictions ~ fixturePredictions", fixturePredictions)

                    const predictionsStringArr = fixturePredictions.map(
                        (fp) => {
                            return fp.home + ":" + fp.away;
                        }
                    );

                    const reducedPredictions = predictionsStringArr.reduce(
                        (count, item) => (
                            (count[item] = count[item] + 1 || 1), count
                        ),
                        {}
                    );

                    const predictedResult =
                        predictHomeTeam + ":" + predictAwayTeam;
                    const finalResult =
                        fixtureHomeTeamResult + ":" + fixtureAwayTeamResult;

                    let underdog_percentage = 100;

                    if (predictedResult == finalResult) {
                        console.log(
                            "underdog bonus same all for " +
                                predictedResult +
                                " - " +
                                finalResult
                        );
                        underdog_percentage = Math.round(
                            (reducedPredictions[predictedResult] /
                                fixturePredictions.length) *
                                100
                        );
                        console.log("un", underdog_percentage);
                    }

                    let win_lose_draw_result = "";
                    let win_lose_draw_predict = "";
                    let goal_different_result =
                        parseInt(fixtureHomeTeamResult) -
                        parseInt(fixtureAwayTeamResult);
                    let goal_different_predict =
                        parseInt(predictHomeTeam) - parseInt(predictAwayTeam);

                    if (
                        parseInt(predictHomeTeam) === parseInt(predictAwayTeam)
                    ) {
                        win_lose_draw_predict = "draw";
                    } else if (
                        parseInt(predictHomeTeam) > parseInt(predictAwayTeam)
                    ) {
                        win_lose_draw_predict = "home_team_win";
                    } else if (
                        parseInt(predictHomeTeam) < parseInt(predictAwayTeam)
                    ) {
                        win_lose_draw_predict = "away_team_win";
                    }

                    if (
                        parseInt(fixtureHomeTeamResult) ===
                        parseInt(fixtureAwayTeamResult)
                    ) {
                        win_lose_draw_result = "draw";
                    } else if (
                        parseInt(fixtureHomeTeamResult) >
                        parseInt(fixtureAwayTeamResult)
                    ) {
                        win_lose_draw_result = "home_team_win";
                    } else if (
                        parseInt(fixtureHomeTeamResult) <
                        parseInt(fixtureAwayTeamResult)
                    ) {
                        win_lose_draw_result = "away_team_win";
                    }

                    if (win_lose_draw_predict === win_lose_draw_result) {
                        singlePredictionResult.points[0].win_lose_draw = 3;
                    }

                    if (goal_different_predict === goal_different_result) {
                        singlePredictionResult.points[0].goal_different = 1;
                    }

                    if (
                        parseInt(predictHomeTeam) ===
                        parseInt(fixtureHomeTeamResult)
                    ) {
                        singlePredictionResult.points[0].home_team = 1;
                    }

                    if (
                        parseInt(predictAwayTeam) ===
                        parseInt(fixtureAwayTeamResult)
                    ) {
                        singlePredictionResult.points[0].away_team = 1;
                    }

                    if (winnerTeamResult) {
                        if (winnerTeamWhenTie == winnerTeamResult) {
                            singlePredictionResult.points[0].winner = 3;
                        }
                    }

                    const values = Object.values(
                        singlePredictionResult.points[0]
                    );

                    const sum = values.reduce((accumulator, value) => {
                        return accumulator + value;
                    }, 0);

                    singlePredictionResult.points[0].total = sum;

                    if (isPredictionBoosted === true) {
                        singlePredictionResult.points[0].boosted_total = sum;
                        singlePredictionResult.points[0].boosted_total =
                            singlePredictionResult.points[0].boosted_total * 2;
                    } else {
                        singlePredictionResult.points[0].boosted_total = sum;
                    }

                    if (playerOfTheMatchResult) {
                        if (playerOfTheMatch == playerOfTheMatchResult.id) {
                            singlePredictionResult.points[0].player_of_the_match = 2;
                            singlePredictionResult.points[0].total += 2;
                            singlePredictionResult.points[0].boosted_total += 2;
                        }
                    }

                    if (underdog_percentage < 10) {
                        singlePredictionResult.points[0].underdog_bonus = 2;
                        singlePredictionResult.points[0].total += 2;
                        singlePredictionResult.points[0].boosted_total += 2;
                    }
                    predictionResultList.results.push(singlePredictionResult);
                }
            }
        });

        let finalArr = [];

        predictionResultList.results.forEach((prediction) => {
            finalArr.push(prediction);
        });

        let leaderboardListReturn = [];

        finalArr.forEach((fa) => {
            const leaderboardSum = Object.values(fa.points);
            const sum = leaderboardSum.reduce((accumulator, value) => {
                return accumulator + value.boosted_total;
            }, 0);

            leaderboardListReturn.push({ ...fa, sum: sum });
        });
    } else {
        const user = await UserService.getUserByID(req.params.id);
        predictionResultList.user = user;
        predictionResultList.results = null;
    }

    return new Promise(function (resolve, reject) {
        try {
            resolve(predictionResultList);
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
};

module.exports.getOverall = async (req) => {
    const predictions = await PredictionService.getListCustom(req);

    const fixtureList = await FixtureService.getListCustom({
        league_id: req.query.league_id,
    });

    let predictionResultList = [];

    let fixtureIdList = [];

    predictions.map((p) => {
        if (!fixtureIdList.includes(p.fixture_id)) {
            fixtureIdList.push(p.fixture_id);
        }
    });

    let playerStatistics = await PlayerService.getPlayerStatistic({
        fixtures: fixtureIdList.join(","),
    });

    predictions.forEach(async (prediction) => {
        let fixtureObj = fixtureList.filter((f) => {
            return f.fixture.id === parseInt(prediction.fixture_id);
        });

        let fixturePlayers = playerStatistics.filter((ps) => {
            return ps.fixtureId == fixtureObj[0].fixture.id;
        });

        let playerOfTheMatchResult = fixturePlayers.sort(function (a, b) {
            return b.statistics[0].games.rating - a.statistics[0].games.rating;
        })[0]?.player;

        if (fixtureObj[0]) {
            let singlePredictionResult = {
                _id: prediction._id,
                user: prediction.user,
                user_id: prediction.user_id,
                week: prediction.week,
                points: [
                    {
                        teams: {
                            home_team: prediction.home_team,
                            away_team: prediction.away_team,
                        },
                        fixture_id: prediction.fixture_id,
                        predicts: {
                            home: prediction.home,
                            away: prediction.away,
                            boosted: prediction.boosted,
                            winner: prediction.winner,
                            player_of_the_match: prediction.player_of_the_match,
                        },
                        results: {
                            home: fixtureObj[0].goals.home
                                ? fixtureObj[0].goals.home.toString()
                                : 0,
                            away: fixtureObj[0].goals.away
                                ? fixtureObj[0].goals.away.toString()
                                : 0,
                            winner:
                                (fixtureObj[0].teams.home.winner &&
                                    fixtureObj[0].teams.home.id) ||
                                (fixtureObj[0].teams.away.winner &&
                                    fixtureObj[0].teams.away.id),
                            player_of_the_match: playerOfTheMatchResult,
                        },
                        score: fixtureObj[0].score,
                        win_lose_draw: 0,
                        goal_different: 0,
                        home_team: 0,
                        away_team: 0,
                        winner: 0,
                        player_of_the_match: 0,
                        underdog_bonus: 0,
                        total: 0,
                    },
                ],
            };

            if (fixtureObj[0].fixture.status.long === "Match Finished") {
                const fixtureHomeTeamResult = (
                    fixtureObj[0].goals.home +
                    fixtureObj[0].score.extratime.home
                ).toString();
                const fixtureAwayTeamResult = (
                    fixtureObj[0].goals.away +
                    fixtureObj[0].score.extratime.away
                ).toString();
                const winnerTeamResult =
                    (fixtureObj[0].teams.home.winner &&
                        fixtureObj[0].teams.home.id) ||
                    (fixtureObj[0].teams.away.winner &&
                        fixtureObj[0].teams.away.id);
                const predictHomeTeam = prediction.home;
                const predictAwayTeam = prediction.away;
                const isPredictionBoosted = prediction.boosted;
                const winnerTeamWhenTie = prediction.winner;
                const playerOfTheMatch = prediction.player_of_the_match;

                const fixturePredictions = predictions.filter((p) => {
                    return p.fixture_id == fixtureObj[0].fixture.id;
                });

                const predictionsStringArr = fixturePredictions.map((fp) => {
                    return fp.home + ":" + fp.away;
                });

                const reducedPredictions = predictionsStringArr.reduce(
                    (count, item) => (
                        (count[item] = count[item] + 1 || 1), count
                    ),
                    {}
                );

                console.log("reduce", reducedPredictions);
                const predictedResult = predictHomeTeam + ":" + predictAwayTeam;
                const finalResult =
                    fixtureHomeTeamResult + ":" + fixtureAwayTeamResult;

                let underdog_percentage = 100;
                if (predictedResult == finalResult) {
                    underdog_percentage = Math.round(
                        (reducedPredictions[predictedResult] /
                            fixturePredictions.length) *
                            100
                    );
                }

                let win_lose_draw_result = "";
                let win_lose_draw_predict = "";
                let goal_different_result =
                    parseInt(fixtureHomeTeamResult) -
                    parseInt(fixtureAwayTeamResult);
                let goal_different_predict =
                    parseInt(predictHomeTeam) - parseInt(predictAwayTeam);

                if (parseInt(predictHomeTeam) === parseInt(predictAwayTeam)) {
                    win_lose_draw_predict = "draw";
                } else if (
                    parseInt(predictHomeTeam) > parseInt(predictAwayTeam)
                ) {
                    win_lose_draw_predict = "home_team_win";
                } else if (
                    parseInt(predictHomeTeam) < parseInt(predictAwayTeam)
                ) {
                    win_lose_draw_predict = "away_team_win";
                }

                if (
                    parseInt(fixtureHomeTeamResult) ===
                    parseInt(fixtureAwayTeamResult)
                ) {
                    win_lose_draw_result = "draw";
                } else if (
                    parseInt(fixtureHomeTeamResult) >
                    parseInt(fixtureAwayTeamResult)
                ) {
                    win_lose_draw_result = "home_team_win";
                } else if (
                    parseInt(fixtureHomeTeamResult) <
                    parseInt(fixtureAwayTeamResult)
                ) {
                    win_lose_draw_result = "away_team_win";
                }

                if (win_lose_draw_predict === win_lose_draw_result) {
                    singlePredictionResult.points[0].win_lose_draw = 3;
                }

                if (goal_different_predict === goal_different_result) {
                    singlePredictionResult.points[0].goal_different = 1;
                }

                if (
                    parseInt(predictHomeTeam) ===
                    parseInt(fixtureHomeTeamResult)
                ) {
                    singlePredictionResult.points[0].home_team = 1;
                }

                if (
                    parseInt(predictAwayTeam) ===
                    parseInt(fixtureAwayTeamResult)
                ) {
                    singlePredictionResult.points[0].away_team = 1;
                }

                if (winnerTeamResult) {
                    if (winnerTeamWhenTie == winnerTeamResult) {
                        singlePredictionResult.points[0].winner = 3;
                    }
                }

                // const fixtureDetailResponse = await FixtureService.getDetail(fixtureObj[0].fixture.id);
                // console.log("🚀 ~ file: LeaderboardService.js:212 ~ predictions.forEach ~ fixtureDetail", fixtureDetailResponse)

                // if (true) {
                //   singlePredictionResult.points[0].underdog_bonus = 2;
                // }

                const values = Object.values(singlePredictionResult.points[0]);
                values.splice(0, 5);
                const sum = values.reduce((accumulator, value) => {
                    return accumulator + value;
                }, 0);

                singlePredictionResult.points[0].total = sum;

                if (isPredictionBoosted === true) {
                    singlePredictionResult.points[0].boosted_total = sum;
                    singlePredictionResult.points[0].boosted_total =
                        singlePredictionResult.points[0].boosted_total * 2;
                } else {
                    singlePredictionResult.points[0].boosted_total = sum;
                }

                if (playerOfTheMatchResult) {
                    if (playerOfTheMatch == playerOfTheMatchResult.id) {
                        singlePredictionResult.points[0].player_of_the_match = 2;
                        singlePredictionResult.points[0].total += 2;
                        singlePredictionResult.points[0].boosted_total += 2;
                    }
                }

                if (underdog_percentage < 10) {
                    console.log("under dog");
                    singlePredictionResult.points[0].underdog_bonus = 2;
                    singlePredictionResult.points[0].total += 2;
                    singlePredictionResult.points[0].boosted_total += 2;
                } else {
                    console.log("no under dog");
                }

                predictionResultList.push(singlePredictionResult);
            }
        }
    });

    let finalArr = [];

    predictionResultList.forEach((prediction) => {
        const findExistingIndex = finalArr.findIndex((p) => {
            if (p.user_id.equals(prediction.user_id)) {
                return true;
            }
            return false;
        });

        if (findExistingIndex !== -1) {
            finalArr[findExistingIndex].points.push(prediction.points[0]);
        } else {
            finalArr.push(prediction);
        }
    });

    let leaderboardListReturn = [];

    finalArr.forEach((fa) => {
        const leaderboardSum = Object.values(fa.points);
        const sum = leaderboardSum.reduce((accumulator, value) => {
            return accumulator + value.boosted_total;
        }, 0);

        leaderboardListReturn.push({ ...fa, sum: sum });
    });
    return new Promise(function (resolve, reject) {
        try {
            resolve(leaderboardListReturn.sort(compareAllSumPoint).splice(20));
        } catch (error) {
            console.log("error", error);
            reject(error);
        }
    });
};
