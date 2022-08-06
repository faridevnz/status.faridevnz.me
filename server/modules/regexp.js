import { loggerInfo } from "../server.js";

export const match_groups = (string, REGEXP) => {
  let match;
  let result = [];
  while ((match = REGEXP.exec(string)) !== null) {
      if (match.index === REGEXP.lastIndex) {
        REGEXP.lastIndex++;
      }
      match.forEach((match, groupIndex) => {
        // skip all match and take only group
        if (groupIndex === 0) return;
        result.push(match);
      });
  }
  return result;
}