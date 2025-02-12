import convert from "convert";

export function formatNum(str) {
    return parseNum(str).toLocaleString() || ''
}

export function parseNum(str) {
    str = str.replace(/,/g, '')
    return Number(str)
}

export function formatNumWithOptions(str, sigFig, fractionDigits) {
    let num = parseNum(str)
    let options = {}
    if (sigFig !== undefined && sigFig < 21 && sigFig > 0) {
      options.maximumSignificantDigits = new Number(sigFig)
    }
    if (fractionDigits !== undefined && fractionDigits >= 0 && fractionDigits <= 100) {
      options.maximumFractionDigits = new Number(fractionDigits)
    }
    // TODO locale from page language?
    return new Intl.NumberFormat("en-US", options).format(num)
}

let convertUnit = function(unit) {
    if (unit) {
      unit = unit.trim()
      // TODO handles things like '/sq km'
      /*if (unit.startsWith("/")) {
        unit = unit.substring(1)
      }*/
    }
    return unit
}

export function convertUnits(numStr, unitsFrom, unitsTo) {
    let ans = ''
    try {
        let converted = convert(parseNum(numStr), convertUnit(unitsFrom)).to(convertUnit(unitsTo))
        if (!isNaN(converted)) {
          ans = converted.toLocaleString()
        }
    } catch(e) {}
    return ans
}

export function formatUnit(unit) {
    if (unit) {
      if (unit.startsWith("sq")) {
        unit = "sq " + unit.substring(2)
      }
      if (unit.startsWith("/sq")) {
        unit = "/sq " + unit.substring(3)
      }
      if (!unit.startsWith("/")) {
        unit = " " + unit.trim()
      }
    }
    return unit
}

var log10 = Math.log(10);
export function getSignificantDigitCount(n) {
    n = Math.abs(n.replace(".", "")); //remove decimal and make positive
    if (n == 0) return 0;
    while (n != 0 && n % 10 == 0) n /= 10; //kill the 0s at the end of n

    return Math.floor(Math.log(n) / log10) + 1; //get number of digits
}