module.exports.calculateAverage = (arr) => {
  return arr.reduce((r, c) => r + c.sum, 0) / arr.length;
};
