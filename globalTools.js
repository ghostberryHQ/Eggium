module.exports = {
    convertXP: function (xp) {
        return { level: Math.floor(xp / 200) + 1, xp: xp % 200, totalXP: xp };
    }
};