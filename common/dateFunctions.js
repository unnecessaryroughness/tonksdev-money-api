const dateFuncs = function() {
    'use strict';

    const getTodaysDateYMD = function() {
      let today = new Date();
      return today.getFullYear()+'-'+(('00'+(today.getMonth()+1)).slice(-2))+'-'+('00'+today.getDate()).slice(-2)
    }

    return {
      getTodaysDateYMD: getTodaysDateYMD
    }

}

module.exports = dateFuncs();
