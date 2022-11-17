package main

import (
	"github.com/hashicorp/go-plugin"
	log "github.com/sirupsen/logrus"

	"github.com/brocaar/chirpstack-network-server/v3/adr"
)

// DefaultHandler implements the default ADR handler.
type SlowHandler struct{}

// ID returns the default ID.
func (h *SlowHandler) ID() (string, error) {
	return "scadra", nil
}

// Name returns the default name.
func (h *SlowHandler) Name() (string, error) {
	return "Slowly Correcting ADR Algorithm", nil
}

// Handle handles the ADR request.
func (h *SlowHandler) Handle(req adr.HandleRequest) (adr.HandleResponse, error) {
	// This defines the default response, which is equal to the current device
	// state.
	resp := adr.HandleResponse{
		DR:           req.DR,
		TxPowerIndex: req.TxPowerIndex,
		NbTrans:      req.NbTrans,
	}

	resp.TxPowerIndex = 0

	// If ADR is disabled, return with current values.
	if !req.ADR {
		return resp, nil
	}

	lostPackageCnt := h.getLostPackageCount(req)
	// If 5 or more packages are lost during the last received packages, we decrease the data-rate
	if lostPackageCnt >= 5 {
		resp.DR -= 1
	} else if len(req.UplinkHistory) == 20 && h.getLostPackageCount(req, 20) <= 2 {
		// If 2 or fewer packages are lost during the last 20 received packages, the dr might be able to be increased

		// We only want to increase the dr if none of the previously received packages
		// are within the installationMargin of the minimum required snr for the current dr
		// The installationMargin should prevent us from increasing the dr too much, such that packages are lost
		// when cars park in a spot.
		minSNR := h.getMinSNR(req)
		installationMargin := float32(10)
		// A margin of around 10 seems okay
		// This value has been chosen based on the loRaSNR values from sensors installed in a parking lot,
		// where a fluctuation of +- 10 can be seen (should be caused by cars parking and leaving).
		diffSNR := minSNR - req.RequiredSNRForDR - installationMargin

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

		if diffSNR > 0 {
			resp.DR += 1
		}
	}

	// If the data rate is increased or reduced to something outside the Min - Max range,
	// we set it to the respective limit
	if req.MaxDR < resp.DR {
		resp.DR = req.MaxDR
	}

	if req.MinDR > resp.DR {
		resp.DR = req.MinDR
	}

	return resp, nil
}

func (h *SlowHandler) getMinSNR(req adr.HandleRequest) float32 {
	var snrM float32 = 999
	for _, m := range req.UplinkHistory {
		if m.MaxSNR < snrM {
			snrM = m.MaxSNR
		}
	}
	return snrM
}

func (h *SlowHandler) getLostPackageCount(req adr.HandleRequest, lastXElement ...int) int {
	if len(req.UplinkHistory) < 2 {
		return 0
	}

	elements := req.UplinkHistory

	if len(lastXElement) > 0 {
		x := lastXElement[0]
		if x < len(elements) {
			elements = elements[len(elements)-x:]
		}
	}

	var lostPackets uint32
	var previousFCnt uint32

	for i, m := range elements {
		if i == 0 {
			previousFCnt = m.FCnt
			continue
		}

		lostPackets += m.FCnt - previousFCnt - 1 // there is always an expected difference of 1
		previousFCnt = m.FCnt
	}

	return int(lostPackets)
}

func main() {
	handler := &SlowHandler{}

	pluginMap := map[string]plugin.Plugin{
		"handler": &adr.HandlerPlugin{Impl: handler},
	}

	log.Info("Starting ADR plugin")
	plugin.Serve(&plugin.ServeConfig{
		HandshakeConfig: adr.HandshakeConfig,
		Plugins:         pluginMap,
	})
}
