const formatChance = (chance: number): string =>
    chance.toFixed(6).replace(/\.?0+$/, '');

export default formatChance;
