export const getSecondaryGoldAward = (item) => {
  
  // Extract awards using a regular expression
  const awards = item.system?.description?.value?.match(/\[\[\/award (\d+)GP\]\]/g);
  
  if (awards) {
    const extractedAwards = awards.map(award => parseInt(award.match(/(\d+)GP/)[1], 10));
    const max = Math.max(...extractedAwards);
    const min = Math.min(...extractedAwards);

    return {max, min};
  } else {
    console.log('No awards found.');
  }
}

export default {
  getSecondaryGoldAward
};
