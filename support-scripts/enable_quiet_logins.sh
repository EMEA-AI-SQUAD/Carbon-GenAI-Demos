#!/bin/bash
##############################################################################
# Script:    enable_quiet_logins.sh
# Purpose:   Enable quiet logins via SSH
# Copyright: 2020 IBM Corporation
##############################################################################

##############################################################################
# Setup
##############################################################################
id -u | grep -Eq "^0$"
if [[ $? != 0 ]] ; then
    sudo $0 $*
    exit $?
fi

exec 2> /tmp/enable_quiet_logins.out
set -x

##############################################################################
# Verify user wants to do this
##############################################################################
tty -s
if [[ $? == 0 ]] ; then
    ps -ef | grep -Eq "[c]ecc_setup_linux"
    if [[ $? != 0 ]] ; then
	echo
	echo "This script will modify the SSH and system configuration to remove the"
	echo "login warning banner and message of the day.  These are enabled by default"
	echo "for security reasons, but it may be desirable to disable them if using"
	echo "the system as part of a cluster or a build host as part of a continuous"
	echo "integration pipeline."
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
echo "Cleaning configuration..."

rm -f /etc/motd /etc/issue /etc/issue.net

echo "Configuration cleaned"
echo
exit 0
