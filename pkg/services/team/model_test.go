package team

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestTeamConversion(t *testing.T) {
	src := Team{
		ID:      123,
		UID:     "abc",
		Name:    "TeamA",
		Email:   "team@a.org",
		OrgID:   11,
		Created: time.UnixMilli(946713600000).UTC(),  // 2000-01-01
		Updated: time.UnixMilli(1262332800000).UTC(), // 2010-01-01
	}

	dst := src.ToResource()

	require.Equal(t, src.Name, dst.Spec.Name)

	out, err := json.MarshalIndent(dst, "", "  ")
	require.NoError(t, err)
	//fmt.Printf("%s", string(out))
	require.JSONEq(t, `{
		"metadata": {
		  "createdBy": "",
		  "creationTimestamp": "2000-01-01T08:00:00Z",
		  "extraFields": null,
		  "finalizers": null,
		  "labels": null,
		  "resourceVersion": "",
		  "uid": "",
		  "updateTimestamp": "2010-01-01T08:00:00Z",
		  "updatedBy": ""
		},
		"spec": {
		  "email": "team@a.org",
		  "name": "TeamA"
		},
		"status": {
		  "additionalFields": null
		}
	  }`, string(out))
}
