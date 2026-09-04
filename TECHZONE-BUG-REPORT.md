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

Two API-created reservations failed with the same error:

| Request ID | Status | Notes |
|---|---|---|
| `6a9ab558f920404955f890a1` | Failed | MCP attempt 1 — `TZ-FS5200_` not found |
| `6a9ab864c1a0571dc9285fd4` | Failed | MCP attempt 2 — same error |

One manual UI reservation succeeded:

| Request ID | Status | Notes |
|---|---|---|
| `6a9ac0a0692864ccdf51d47d` | Ready | Manual — `RHEL_10.2` passed explicitly; FQDN `pvm1-13218m1k.p1298.pok-systems.techzone.ibm.com` |

## Root Cause (as diagnosed)

The Bob TechZone MCP creates reservations without passing `userVariables`. The platform's default `powervc_image_name` resolves to an alias `TZ-FS5200_` which is not present in the Poughkeepsie PowerVC inventory. The reservation therefore fails at the image lookup stage.

When reserving via the TechZone UI, the form presents a dropdown for "RHEL Version" and the user selects `RHEL_10.2`. This value is passed explicitly in `userVariables.powervc_image_name`, which resolves correctly.

## Request

1. **Either** add `TZ-FS5200_` to the Poughkeepsie PowerVC inventory so the default alias resolves, **or** set the platform default `powervc_image_name` to `RHEL_10.2` so that API reservations that omit `userVariables` still succeed.

2. Optionally, document the required `userVariables` for this platform in the API/MCP documentation so integrations can pass them explicitly.

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

*Draft prepared: 2026-08-XX. Send once confirmed with team.*
