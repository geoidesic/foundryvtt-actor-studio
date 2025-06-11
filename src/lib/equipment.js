export const getSecondarGoldAward = (item) => {
  console.log('system.description.value', item.system.description.value);
  
  // Extract awards using a regular expression
  const awards = item.system.description.value.match(/\[\[\/award (\d+)GP\]\]/g);
  
  if (awards) {
    const extractedAwards = awards.map(award => parseInt(award.match(/(\d+)GP/)[1], 10));
    console.log('Extracted Awards:', extractedAwards);
    return awards[0]
  } else {
    console.log('No awards found.');
  }
}

