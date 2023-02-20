const LeaderboardService = require("../../services/LeaderboardService");

module.exports.getList = async (req, res) => {
    let response = {};
    try {
        await LeaderboardService.getList(req)
            .then((result) => {
                response.code = 200;
                response.message = "Successfully get leaderboard list";
                response.developer_message = "";
                response.results = result;
            })
            .catch((e) => {
                response.code = 401;
                response.message = e.message;
                response.developer_message =
                    "Something went wrong in getting leaderboard";
                response.results = e;
            });
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.message = error;
        response.developer_message =
            "Something went wrong in getting leaderboard";
        response.results = {};
        return res.status(200).json(response);
    }
};

module.exports.getDetail = async (req, res) => {
    let response = {};
    try {
        await LeaderboardService.getDetail(req)
            .then((result) => {
                response.code = 200;
                response.message = "Successfully get leaderboard detail";
                response.developer_message = "";
                response.results = result;
            })
            .catch((e) => {
                response.code = 401;
                response.message = e.message;
                response.developer_message =
                    "Something went wrong in getting leaderboard detail";
                response.results = e;
            });
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.message = error;
        response.developer_message =
            "Something went wrong in getting leaderboard detail";
        response.results = {};
        return res.status(200).json(response);
    }
};

module.exports.getOverallLeader = async (req, res) => {
    let response = {};
    try {
        await LeaderboardService.getOverall(req)
            .then((result) => {
                response.code = 200;
                response.message = "Successfully get leaderboard detail";
                response.developer_message = "";
                response.results = result;
            })
            .catch((e) => {
                response.code = 401;
                response.message = e.message;
                response.developer_message =
                    "Something went wrong in getting leaderboard detail";
                response.results = e;
            });
        return res.status(200).json(response);
    } catch (error) {
        response.code = 401;
        response.message = error;
        response.developer_message =
            "Something went wrong in getting leaderboard detail";
        response.results = {};
        return res.status(200).json(response);
    }
};
