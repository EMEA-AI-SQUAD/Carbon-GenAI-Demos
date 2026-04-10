# Remote SSH Setup Guide for VS Code

## Overview
This guide will help you set up VS Code's Remote - SSH extension to connect to your IBM Power RHEL server from your Windows laptop.

## Current Server Details
- **Hostname**: p1369-pvm1.p1369.cecc.ihost.com
- **IP Address**: 129.40.98.65
- **Username**: cecuser
- **Password**: lt107U%6UYz5w!E

## Step 1: Install Remote - SSH Extension

1. Open VS Code
2. Click on the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`)
3. Search for "Remote - SSH"
4. Install the extension published by Microsoft (ms-vscode-remote.remote-ssh)
5. You may also want to install:
   - "Remote - SSH: Editing Configuration Files" (ms-vscode-remote.remote-ssh-edit)
   - "Remote Explorer" (ms-vscode.remote-explorer)

## Step 2: SSH Config File (Already Created)

Your SSH config file has been created at: `C:\Users\029878866\.ssh\config`

It contains two connection profiles:
- **ibm-power-rhel**: Uses hostname (p1369-pvm1.p1369.cecc.ihost.com)
- **ibm-power-ip**: Uses IP address (129.40.98.65)

## Step 3: Connect to Remote Server

### Method 1: Using Command Palette
1. Press `F1` or `Ctrl+Shift+P` to open Command Palette
2. Type "Remote-SSH: Connect to Host..."
3. Select "ibm-power-rhel" from the list
4. When prompted, enter the password: `lt107U%6UYz5w!E`
5. VS Code will open a new window connected to the remote server

### Method 2: Using Remote Explorer
1. Click on the Remote Explorer icon in the left sidebar
2. In the "SSH Targets" section, you should see "ibm-power-rhel"
3. Click the folder icon next to it to connect
4. Enter password when prompted

### Method 3: Quick Connect
1. Look for the green button in the bottom-left corner of VS Code (looks like "><")
2. Click it and select "Connect to Host..."
3. Choose "ibm-power-rhel"
4. Enter password when prompted

## Step 4: First Connection Setup

On first connection, VS Code will:
1. Ask you to select the platform - choose "Linux"
2. Install VS Code Server on the remote machine (automatic)
3. This may take a few minutes

## Step 5: Working on Remote Server

Once connected:
- The green button in bottom-left will show "SSH: ibm-power-rhel"
- You can open folders on the remote server: File > Open Folder
- Terminal will open on the remote server
- All file operations happen on the remote server
- Extensions can be installed on the remote server

## Step 6: Opening Your Project

After connecting, open your project folder on the remote server:
1. File > Open Folder (or `Ctrl+K Ctrl+O`)
2. Navigate to your project directory (likely in `/home/cecuser/`)
3. Click OK

## Useful Tips

### Password-Free Login (Optional)
To avoid entering password each time:
```powershell
# Copy your public key to the remote server
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh cecuser@p1369-pvm1.p1369.cecc.ihost.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Reconnecting
- VS Code remembers recent connections
- Use `F1` > "Remote-SSH: Connect to Host..." > Select from recent

### Disconnecting
- Click the green button in bottom-left
- Select "Close Remote Connection"

### Multiple Windows
- You can have multiple VS Code windows connected to different remote servers
- Or multiple windows to the same server with different folders open

### Terminal Access
- Terminal > New Terminal (or `` Ctrl+` ``)
- Opens a terminal on the remote server as cecuser

## Troubleshooting

### Connection Timeout
- Check if server is accessible: `ping p1369-pvm1.p1369.cecc.ihost.com`
- Verify credentials are correct
- Check firewall settings

### "Could not establish connection"
- Try using the IP address profile instead: "ibm-power-ip"
- Restart VS Code
- Check SSH config file syntax

### Permission Denied
- Verify password is correct
- Check if cecuser account is active

### VS Code Server Installation Fails
- Ensure you have write permissions in `/home/cecuser/`
- Check disk space on remote server
- Try manual installation if needed

## For Future Reservations

When you get a new server reservation:
1. Edit `C:\Users\029878866\.ssh\config`
2. Update the HostName and/or create a new host entry
3. Update password in this document or your secure password manager
4. Reconnect using the updated profile

## Security Notes

- Keep your password secure
- Consider using SSH keys instead of passwords
- The SSH config file is stored locally and not synced
- VS Code Server runs under your user account (cecuser)

## Additional Resources

- [VS Code Remote SSH Documentation](https://code.visualstudio.com/docs/remote/ssh)
- [SSH Config File Format](https://www.ssh.com/academy/ssh/config)