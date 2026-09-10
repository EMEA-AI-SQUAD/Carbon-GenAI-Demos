# TechZone Bug Report — Draft Email

**To:** techzone.help@ibm.com  
**Subject:** Bug: MCP auto-reservation fails on "AI-Ready RHEL on IBM Power On-Premises" — `userVariables` not passed, `TZ-FS5200_` image not found  
**Platform ID:** `6a7aba1916c56f06e4b1e910`  
**Collection:** `6261d3584670d7001e3d483a`  

---

Hello TechZone support,

I'm reporting a reproducible failure when provisioning the **"AI-Ready RHEL on IBM Power On-Premises"** environment via the Bob TechZone MCP tool. Manual reservations via the UI succeed; automated reservations via the API fail consistently.

## Summary

When the TechZone API is used to create a reservation (via Bob's TechZone MCP), the request fails because the default `powervc_image_name` value (`TZ-FS5200_`) is not present in the Poughkeepsie PowerVC inventory. Manual UI reservations succeed because they explicitly pass `RHEL_10.2` as the image name via the `userVariables` field.

## Evidence

Four API-created reservations have failed with the same error across two separate testing sessions:

| Request ID | Date | Status | Notes |
|---|---|---|---|
| `6a9ab558f920404955f890a1` | Aug 2026 | Failed | MCP attempt 1 — `TZ-FS5200_` not found |
| `6a9ab864c1a0571dc9285fd4` | Aug 2026 | Failed | MCP attempt 2 — same error |
| `6aa2810c2304c2cc2ef9ce6d` | 10 Sep 2026 | Failed | MCP attempt 3 — `TZ-FS5200_` not found |
| `6aa284ee4220415df51ab728` | 10 Sep 2026 | Failed | MCP attempt 4 — same error |

Manual UI reservations have succeeded every time:

| Request ID | Date | Status | Notes |
|---|---|---|---|
| `6a9ac0a0692864ccdf51d47d` | Aug 2026 | Ready | Manual — `RHEL_10.2` passed explicitly |
| `6aa286be348b478a5b10ac00` | 10 Sep 2026 | Ready | Manual — `RHEL_10.2` passed explicitly |

## Root Cause (as diagnosed)

The difference is visible by comparing the raw API responses of a failed MCP request vs. a successful manual request for the same platform.

**MCP request — `userVariables` field:**
```json
"userVariables": []
```

**Manual UI request — `userVariables` field:**
```json
"userVariables": [
  { "name": "powervc_image_name",      "value": "RHEL_10.2"   },
  { "name": "powervc_host_group_name", "value": "power10"     },
  { "name": "cpu_count",               "value": 8             },
  { "name": "ram_gb",                  "value": 50            },
  { "name": "second_disk_size_gb",     "value": 0             },
  { "name": "powervc_processor_mode",  "value": "dedicated"   },
  { "name": "hmc_enable_access",       "value": false         },
  { "name": "vpn_ids_count",           "value": 0             }
]
```

When `userVariables` is empty, Terraform attempts to resolve the image via an internal alias `TZ-FS5200_`, which is not present in the Poughkeepsie PowerVC inventory. The reservation fails at `main.tf line 229`.

When the UI submits the reservation, it populates `powervc_image_name: RHEL_10.2` explicitly from the dropdown selection. This resolves correctly and provisioning succeeds.

The Bob TechZone MCP `techzone-create-request` tool has no parameter to pass `userVariables`, so this failure is currently unavoidable via the MCP path for this platform.

## Request

1. **Fix the default:** Set the platform default `powervc_image_name` to `RHEL_10.2` (or whichever image is current) so that API reservations that omit `userVariables` resolve a valid image rather than the unresolvable `TZ-FS5200_` alias.

2. **Or fix the alias:** Add `TZ-FS5200_` to the Poughkeepsie PowerVC inventory so the existing default resolves correctly.

3. **Add `userVariables` support to the MCP tool:** The `techzone-create-request` MCP tool should accept a `userVariables` parameter so that automated reservations can pass the same values the UI sends. This would make the MCP path equivalent to the UI path and remove this class of failure entirely.

## Additional context

- Platform: `6a7aba1916c56f06e4b1e910` ("AI-Ready RHEL on IBM Power On-Premises")
- Provisioner: `base-onpremise-powervc-vm`
- Datacenter: Poughkeepsie (`p1298`)
- The platform was migrated from v1 (`66479c385e3bbb001e089937`, now disabled)
- We are using this environment as part of a CE Marketplace recipe for IBM Power demos

Please let me know if you need further details or the full API error payload from the failed requests.

Kind regards,  
David Spurway  
EMEA AI on IBM Power Squad  
IBM Client Engineering

---

*Draft updated: 2026-09-10 — added Sep 2026 failure instances and API comparison evidence. Ready to send.*
