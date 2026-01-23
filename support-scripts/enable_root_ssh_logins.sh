#!/bin/bash
##############################################################################
# Script:    enable_root_ssh_logins.sh
# Purpose:   Enable root logins via SSH
# Copyright: 2020 IBM Corporation
##############################################################################

##############################################################################
# Setup
##############################################################################
id -u | grep -Eq "^0$"
if [[ $? != 0 ]] ; then
    sudo $0
    exit $?
fi

exec 2> /tmp/enable_root_ssh_logins.out
set -x

##############################################################################
# Verify user wants to do this
##############################################################################
tty -s
if [[ $? == 0 ]] ; then
    ps -ef | grep -Eq "[c]ecc_setup_linux"
    if [[ $? != 0 ]] ; then
	echo
	echo "This script will modify the SSH configuration to permit root logins."
	echo "These are disabled by default for security reasons, but sometimes need"
	echo "to be allowed for certain clustered applications."
	echo
	printf "Are you sure you want to continue (y/n)? "
	typeset -l answer
	read answer
	if [[ ${answer} != "y" ]] ; then
	    echo
	    echo "Processing aborted."
	    echo
	    exit 1
	fi
    fi
fi

##############################################################################
# Adjust configuration and restart
##############################################################################
echo
echo "Adjusting SSH configuration."

cp /etc/ssh/sshd_config /etc/ssh/modify.sshd_config
grep -Ev "^PermitRootLogin" /etc/ssh/modify.sshd_config > /etc/ssh/sshd_config
echo "PermitRootLogin yes" >> /etc/ssh/sshd_config

systemctl restart sshd
if [[ $? != 0 ]] ; then
    echo
    echo "An error occurred trying to restart sshd with the new configuration."
    echo
    echo "Attempting to revert change."
    echo
    cp /etc/ssh/modify.sshd_config /etc/ssh/sshd_config
    systemctl restart sshd
    if [[ $? != 0 ]] ; then
	echo "An error occurred trying to restart sshd with the old configuration."
	echo "This should never happen. Please open a support ticket immediately."
	echo
    else
	echo "SSH configuration reverted."
	echo "You may want to try again. If problem making the change persists"
	echo "please open a support ticket."
	echo
    fi
    exit 1
fi

echo "SSH configuration change activated successfully."
echo
exit 0
