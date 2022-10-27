module.exports.compareBoostedTotalPoint = (a, b) => {
  if (a.points.boosted_total < b.points.boosted_total) {
    return 1;
  }
  if (a.points.boosted_total > b.points.boosted_total) {
    return -1;
  }

  return 0;
};
