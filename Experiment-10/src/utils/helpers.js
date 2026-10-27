const calculateDiscount = (price, code) => {
  if (!code) return price;
  if (code === 'CAMPUS50') return price / 2;
  if (code === 'EARLYBIRD') {
    const result = price - 100;
    return result < 0 ? 0 : result;
  }
  return null;
};

module.exports = { calculateDiscount };
