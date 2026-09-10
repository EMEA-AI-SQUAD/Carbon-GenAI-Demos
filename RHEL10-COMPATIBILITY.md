# RHEL 10.2 Compatibility Analysis

> Status: **Analysis complete — not yet tested on live environment**  
> Analyst: Bob (from deploy script static review)  
> Live environment to test on: `pvm1-13218m1k.p1298.pok-systems.techzone.ibm.com` (expires 2026-09-05)

---

## Summary

The deployment script [`deployment/deploy-carbon-genai.sh`](deployment/deploy-carbon-genai.sh) was developed and validated on **RHEL 9.4 / ppc64le**. The new v2 TechZone platform provisions **RHEL 10.2** by default. This document records the known differences and the script changes required before the handoff test.

---

## Known RHEL 9 → RHEL 10 Changes (relevant to this script)

### 1. Node.js — `dnf module` stream system removed (CRITICAL)

**Script line 309:** `sudo dnf module enable -y nodejs:20`

RHEL 10 has replaced the DNF module stream system with **Application Streams** using standard package groups. The `dnf module` subcommand still exists but module streams like `nodejs:20` may not be available in the same form.

**What to check on the live environment:**
```bash
# Check what Node.js is available directly
dnf list available nodejs*
# Check if module streams still work
dnf module list nodejs
```

**Fallback options (in preference order for ppc64le):**
1. If `nodejs:20` stream exists → no script change needed
2. If `nodejs` package ≥ 18 is available directly → remove `dnf module enable` step, just `dnf install -y nodejs`
3. If only older Node available → install Node 20 from RHEL AppStream directly: `dnf install nodejs:20/common`

**Script fix if needed:** Update `install_dependencies()` function to detect RHEL version and adjust Node install path.

---

### 2. Python 3.12 — may already be default (LOW RISK)

**Script line 296:** installs `python3.12 python3.12-pip python3.12-devel`

RHEL 10 ships with Python 3.12 as the default (RHEL 9 shipped Python 3.9 as default, 3.12 available as additional). This means:
- `python3.12` package likely already installed — `dnf install -y python3.12` will be a no-op, which is fine
- `python3.12-pip` may be provided differently — check if it's still a separate package or if pip is bundled
- `python3` symlink may point to 3.12 by default

**What to check:**
```bash
python3 --version
python3.12 --version
dnf info python3.12-pip
```

---

### 3. `llvm-toolset` package name may differ (MEDIUM RISK)

**Script line 296:** installs `llvm-toolset`

RHEL 10 may ship LLVM as `llvm` / `llvm-devel` rather than the `llvm-toolset` metapackage. The `llvm-toolset` wrapper was a RHEL 8/9 convention.

**What to check:**
```bash
dnf search llvm-toolset
dnf search llvm
```

**Fix if needed:** Replace `llvm-toolset` with `llvm llvm-devel clang` in the packages list.

---

### 4. `gfortran` package name (LOW RISK)

**Script line 296:** installs `gfortran`

On RHEL 10, `gfortran` may be `gcc-gfortran`. Worth verifying.

```bash
dnf search gfortran
```

---

### 5. OpenBLAS wheel URL (MEDIUM RISK)

**Script line 674:** `pip install --prefer-binary torch openblas --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux`

This IBM developer wheel repository hosts ppc64le-specific pre-built wheels. Need to verify:
- The URL is still active
- Wheels are available for Python 3.12 on RHEL 10 ppc64le

**What to check on live environment:**
```bash
pip install --prefer-binary torch openblas --extra-index-url=https://wheels.developerfirst.ibm.com/ppc64le/linux --dry-run 2>&1 | head -30
```

---

### 6. `lsof` availability (LOW RISK)

**Script lines 572+:** uses `lsof -Pi :3001 -sTCP:LISTEN`

`lsof` is not always installed by default on minimal RHEL installs. Script should either install it explicitly or use `ss -tlnp | grep :3001` as a fallback.

**Fix:** Add `lsof` to the `packages` variable in `install_dependencies()`.

---

## Recommended Script Changes Before RHEL 10 Test

### Change 1 — Add `lsof` to base packages (definite fix)

In `install_dependencies()`, change:
```bash
local packages="python3.12 python3.12-pip python3.12-devel git gcc gcc-c++ make cmake automake llvm-toolset ninja-build gfortran curl-devel wget"
```
To:
```bash
local packages="python3.12 python3.12-pip python3.12-devel git gcc gcc-c++ make cmake automake llvm-toolset ninja-build gfortran curl-devel wget lsof"
```

### Change 2 — Node.js install: detect RHEL version and adjust (conditional fix)

Replace the current hardcoded `dnf module enable nodejs:20` block with a version-aware approach:

```bash
install_nodejs() {
    local rhel_version=$(rpm -q --qf '%{VERSION}' redhat-release 2>/dev/null | cut -d. -f1)
    print_info "Detected RHEL major version: $rhel_version"
    
    if [ "$rhel_version" -ge 10 ]; then
        # RHEL 10: try direct dnf install first (may already be >= 18)
        local node_pkg_version=$(dnf info nodejs 2>/dev/null | grep Version | head -1 | awk '{print $3}' | cut -d. -f1)
        if [ -n "$node_pkg_version" ] && [ "$node_pkg_version" -ge 18 ]; then
            run_command "sudo dnf install -y nodejs" "Node.js ${node_pkg_version} installed"
        else
            # Fall back to module stream (RHEL 10 still supports it for some packages)
            run_command "sudo dnf module enable -y nodejs:20 && sudo dnf install -y nodejs" "Node.js 20 installed via module stream"
        fi
    else
        # RHEL 9: use module stream (default stream is Node 16, too old)
        run_command "sudo dnf module enable -y nodejs:20" "Node.js 20 module enabled"
        run_command "sudo dnf install -y nodejs" "Node.js 20 installed"
    fi
}
```

### Change 3 — `llvm-toolset` fallback (conditional fix)

```bash
# Install llvm — package name varies between RHEL 9 (llvm-toolset) and RHEL 10 (llvm/clang)
if dnf info llvm-toolset >/dev/null 2>&1; then
    run_command "sudo dnf install -y llvm-toolset" "LLVM toolset installed"
else
    run_command "sudo dnf install -y llvm llvm-devel clang" "LLVM installed"
fi
```

---

## Test Procedure

Run on the live v2 environment `pvm1-13218m1k.p1298.pok-systems.techzone.ibm.com`:

```bash
# 1. SSH in
ssh -i <your-key> cecuser@pvm1-13218m1k.p1298.pok-systems.techzone.ibm.com

# 2. Quick pre-checks
cat /etc/redhat-release        # Confirm RHEL 10.2
uname -m                       # Confirm ppc64le
python3 --version              # Check default Python
dnf module list nodejs         # Check Node.js streams available
dnf info llvm-toolset          # Check LLVM package name

# 3. Run deployment
curl -o deploy.sh https://raw.githubusercontent.com/ibm-power-demos-with-bob/Carbon-GenAI-Demos/main/deployment/deploy-carbon-genai.sh
chmod +x deploy.sh
nohup ./deploy.sh > ~/deploy.log 2>&1 &
tail -f ~/deploy.log
```

---

*Analysis date: 2026-08-XX. To be updated after live test.*
