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
//  regionName: "eu868",
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

// Handle function for ADR request.
export function handle(req) {
  // This defines the default response, which is equal to the current device state.
  let resp = {
    dr: req.dr,
    txPowerIndex: 0,
    nbTrans: req.nbTrans,
  };

  // If ADR is disabled, return with current values.
  if (!req.adr) {
    return resp;
  }

  let lostPackageCnt = getLostPackageCount(req);
  // If 5 or more packages are lost during the last received packages, decrease the data-rate
  if (lostPackageCnt >= 5) {
    resp.dr -= 1;
  } else if (
    req.uplinkHistory.length >= 20 &&
    getLostPackageCount(req, 20) <= 2
  ) {
    // If 2 or fewer packages are lost during the last 20 received packages, the dr might be able to be increased

    // We only want to increase the dr if none of the previously received packages
    // are within the installationMargin of the minimum required snr for the current dr
    // The installationMargin should prevent us from increasing the dr too much, such that packages are lost
    // when cars park in a spot.
    let minSNR = getMinSNR(req);
    let installationMargin = 10;
    // A margin of around 10 seems okay
    // This value has been chosen based on the loRaSNR values from sensors installed in a parking lot,
    // where a fluctuation of +- 10 can be seen (should be caused by cars parking and leaving).
    let diffSNR = minSNR - req.requiredSnrForDr - installationMargin;

    // Examples:
    // minSNR = -5
    // requiredSNRforDR = -10
    // installationMargin = 10
    // diffSNR = -5 - -10 - 10 = -5
    // => Not safe to increase the dr

    // minSNR = 5
    // requiredSNRforDR = -10
    // installationMargin = 10
    // diffSNR = 5 - -10 - 10 = 5
    // => The dr should be safe to increase

    if (diffSNR > 0) {
      resp.dr += 1;
    }
  }

  // If the data rate is increased or reduced to something outside the Min - Max range,
  // set it to the respective limit
  if (req.maxDr < resp.dr) {
    resp.dr = req.maxDr;
  }

  if (req.minDr > resp.dr) {
    resp.dr = req.minDr;
  }

  return resp;
}

function getMinSNR(req) {
  let snrM = 999;

  for (const uh of req.uplinkHistory) {
    if (uh.maxSnr < snrM) {
      snrM = uh.maxSnr;
    }
  }
  return snrM;
}

// Function to get the count of lost packages from the request.
function getLostPackageCount(req, ...lastXElement) {
  if (req.uplinkHistory.length < 2) {
    return 0;
  }

  let elements = req.uplinkHistory;

  if (lastXElement.length > 0) {
    let x = lastXElement[0];
    if (x < elements.length) {
      elements = elements.slice(elements.length - x);
    }
  }

  let lostPackets = 0;
  let previousFCnt = 0;

  for (let i = 0; i < elements.length; i++) {
    const m = elements[i];

    if (i === 0) {
      previousFCnt = m.fCnt;
      continue;
    }

    lostPackets += m.fCnt - previousFCnt - 1; // there is always an expected difference of 1
    previousFCnt = m.fCnt;
  }

  return lostPackets;
}
