# How to Install the Correct Remote - SSH Extension

## Quick Identification Guide

When you search for "Remote - SSH" in the VS Code Extensions marketplace, look for these specific details:

### The CORRECT Extension:
- **Name**: Remote - SSH
- **Publisher**: Microsoft
- **Extension ID**: ms-vscode-remote.remote-ssh
- **Description**: "Open any folder on a remote machine using SSH and take advantage of VS Code's full feature set."
- **Icon**: Blue icon with a computer/monitor symbol
- **Verified Publisher**: ✓ Microsoft (blue checkmark)

### Step-by-Step Installation:

1. **Open Extensions View**:
   - Click the Extensions icon in the left sidebar (looks like 4 squares)
   - OR press `Ctrl+Shift+X`

2. **Search**:
   - Type exactly: `@id:ms-vscode-remote.remote-ssh`
   - This will show ONLY the correct extension

3. **Verify Before Installing**:
   - Publisher must say "Microsoft"
   - Should have millions of downloads
   - Should have a blue verified checkmark next to Microsoft

4. **Install**:
   - Click the green "Install" button
   - Wait for installation to complete (usually takes a few seconds)

## Alternative: Install via Command Line

You can also install it directly using VS Code's command line:

```powershell
code --install-extension ms-vscode-remote.remote-ssh
```

## What You'll See After Installation

After installing, you should see:
1. A new icon in the left sidebar (Remote Explorer - looks like a computer monitor)
2. A green button in the bottom-left corner of VS Code (looks like "><")
3. The extension listed in your installed extensions

## Optional But Recommended Extensions

After installing Remote - SSH, you may also want:

1. **Remote - SSH: Editing Configuration Files**
   - Extension ID: `ms-vscode-remote.remote-ssh-edit`
   - Helps edit SSH config files

2. **Remote Explorer**
   - Extension ID: `ms-vscode.remote-explorer`
   - Better UI for managing remote connections

## Verification

To verify the extension is installed correctly:
1. Press `F1` or `Ctrl+Shift+P`
2. Type "Remote-SSH"
3. You should see commands like:
   - Remote-SSH: Connect to Host...
   - Remote-SSH: Add New SSH Host...
   - Remote-SSH: Open Configuration File...

## Troubleshooting

### "Can't find the Microsoft extension"
- Use the exact search: `@id:ms-vscode-remote.remote-ssh`
- Make sure you're connected to the internet
- Restart VS Code and try again

### "Multiple extensions with similar names"
- Always check the publisher name (must be "Microsoft")
- Check the extension ID matches: `ms-vscode-remote.remote-ssh`
- Avoid extensions from other publishers

### "Extension won't install"
- Check if you have admin rights
- Try closing and reopening VS Code
- Check VS Code is up to date (Help > Check for Updates)

## Next Steps After Installation

Once installed:
1. Look for the green "><" button in bottom-left corner
2. Click it and select "Connect to Host..."
3. Choose "ibm-power-rhel" from the list
4. Enter password when prompted: `lt107U%6UYz5w!E`