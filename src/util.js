import tmpl from 'blueimp-tmpl';

// tmpl
export const template = tmpl;

export function objToList(obj) {
  const list = [];
  for (let key of Object.keys(obj)) {
    list.push(obj[key]);
  }
  return list;
}
// 
export const listToTree = require('list-to-tree-lite');

const util = {};
util.template = template;
util.listToTree = listToTree;
export default util;