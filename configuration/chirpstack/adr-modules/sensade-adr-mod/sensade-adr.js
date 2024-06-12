// This must return the name of the ADR algorithm.
export function name() {
  return "Slowly Correcting ADR Algorithm";
}

// This must return the id of the ADR algorithm.
export function id() {
  return "scadra";
}

// This handles the ADR request.
//
// Input object example:
// {
//  regionConfigId: "eu868",
//  regionCommonName: "EU868",
//  devEui: "0102030405060708",
//  macVersion: "1.0.3",
//  regParamsRevision: "A",
//  adr: true,
//  dr: 1,
//  txPowerIndex: 0,
//  nbTrans: 1,
//  maxTxPowerIndex: 15,
//  requiredSnrForDr: -17.5,
//  installationMargin: 10,
//  minDr: 0,
//  maxDr: 5,
//  uplinkHistory: [
//    {
//      "fCnt": 10,
//      "maxSnr": 7.5,
//      "maxRssi": -110,
//      "txPowerIndex": 0,
//      "gatewayCount": 3
//    }
//  ]
// }
//
// This function must return an object, example:
// {
//  dr: 2,
//  txPowerIndex: 1,
//  nbTrans: 1
// }
export function handle(req) {
  var resp = req;

  resp.txPowerIndex = 0;

  if (!req.adr) {
    return {
      dr: resp.dr,
      txPowerIndex: resp.txPowerIndex,
      nbTrans: resp.nbTrans
    };
  }

  var lostPackageCntNew = getLostPackageCount(req.uplinkHistory, 20);

  if (lostPackageCntNew >= 5) {
    resp.dr -= 1;
  } else if (req.uplinkHistory.length >= 20 && getLostPackageCount(req.uplinkHistory, 20) <= 2) {
    var minSnr = getMinSnr(req.uplinkHistory);
    var installationMargin = 10;

    var diffSnr = minSnr - req.requiredSnrForDr - installationMargin;

    if (diffSnr > 0) {
      resp.dr += 1;
    }
  }

  if (req.maxDr < resp.dr) {
    resp.dr = req.maxDr;
  }

  if (req.minDr > resp.dr) {
    resp.dr = req.minDr;
  }

  return {
    dr: resp.dr,
    txPowerIndex: resp.txPowerIndex,
    nbTrans: resp.nbTrans
  };
}


function getLostPackageCount(uplinkHistory, lastXElements) {
  var len = uplinkHistory.length;

  if (len < lastXElements) {
    lastXElements = len;
  }

  var elements = uplinkHistory.slice(-lastXElements);

  var prevFcnt = elements[0].fCnt;
  var lostPackages = 0;

  for (var element of elements.slice(1)) {
    var curFcnt = element.fCnt;
    var diff = curFcnt - prevFcnt;

    lostPackages += diff - 1;
    prevFcnt = curFcnt;
  }

  return lostPackages;
}

function getMinSnr(uplinkHistory) {
  var snrM = 999;

  for (var element of uplinkHistory) {
    if (element.maxSnr < snrM) {
      snrM = element.maxSnr;
    }
  }
  return snrM;
}