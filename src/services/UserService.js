const UserModal = require('../models/User')

module.exports.getList = async (params) => {
    const page = params.query.page ? parseFloat(params.query.page) : 1;
    const perPage = params.query.perPage ? parseFloat(params.query.perPage) : 10;
    let filter = {};
    let where = {};

    if (params.query.search) {
        let data = {
          $or: [
            { name: { $regex: params.query.search, $options: "i" } },
            { phone: { $regex: params.query.search, $options: "i" } },
            { favoriteTeam: { $regex: params.query.search, $options: "i" } },
            { region: { $regex: params.query.search, $options: "i" } },
          ],
        };
    
        where = { ...where, ...data };
      }
    
  
    return new Promise(function (resolve, reject) {
      UserModal.aggregate([
        {
          $match: where,
          },
          {
            $facet: {
              total: [
                {
                  $count: "count",
                },
              ],
              data: [
                {
                  $addFields: {
                    _id: "$_id",
                  },
                },
              ],
            },
          },
          {
            $unwind: "$total",
          },
  
          {
            $project: {
              items: {
                $slice: [
                  "$data",
                  Number((Number(page) - 1) * Number(perPage)),
                  {
                    $ifNull: [Number(perPage), "$total.count"],
                  },
                ],
              },
              pages: {
                $literal: Number(page),
              },
              perPage: {
                $literal: Number(perPage),
              },
              hasNextPage: {
                $lt: [{ $multiply: [perPage, Number(page)] }, "$total.count"],
              },
              total: "$total.count",
            },
          },
      ])
        .then((result) => {
          resolve(result[0]);
        })
        .catch((e) => {
          reject(e);
        });
    });
}