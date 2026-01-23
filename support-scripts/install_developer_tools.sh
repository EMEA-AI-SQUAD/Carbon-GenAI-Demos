#!/bin/bash
##############################################################################
# Script:    install_developer_tools.sh
# Purpose:   Install Developer Tools Bundle
# Copyright: 2020 IBM Corporation
##############################################################################

id -u | grep -Eq "^0$"
if [[ $? != 0 ]] ; then
    sudo $0
    exit $?
fi

exec 2> /tmp/install_developer_tools.out
set -x

os=$(cat /etc/os-release)

echo "${os}" | grep -Ei "rhel|Redhat" 1>&2
if [[ $? == 0 ]] ; then
    echo "Installing Developer Tools for Redhat"
    yum -y group install "Development Tools" 1>&2
    [[ $? != 0 ]] && echo "Error: Problem installing developer tools" && exit 1
fi

echo "${os}" | grep -E "^ID=\"sles\"" 1>&2
if [[ $? == 0 ]] ; then
    echo "${os}" | grep -E "^VERSION_ID=.*12" 1>&2
    if [[ $? == 0 ]] ; then
	echo "Installing Developer Tools for Suse 12"
	zypper modifyrepo -d $(zypper lr | grep updates | awk '{print $3}')
	zypper remove -y --type pattern Basis-Devel 1>&2
	zypper install -y --type pattern Basis-Devel 1>&2
	[[ $? != 0 ]] && echo "Error: Problem installing developer tools" && exit 1
	rpm -qa | grep -E "^gcc" 1>&2
	[[ $? != 0 ]] && echo "Error: Problem installing developer tools, gcc not found afterwards" && exit 1
	zypper install -y rpm-devel libopenssl-devel pam-devel openldap2-client openldap2-devel 1>&2
	[[ $? != 0 ]] && echo "Error: Problem installing developer tools" && exit 1
    fi
    echo "${os}" | grep -E "^VERSION_ID=.*15" 1>&2
    if [[ $? == 0 ]] ; then
	echo "Installing Developer Tools for Suse 15"
	zypper install -y --type pattern devel_basis devel_kernel devel_yast 1>&2
	[[ $? != 0 ]] && echo "Error: Problem installing developer tools" && exit 1
	rpm -qa | grep -E "^gcc" 1>&2
	[[ $? != 0 ]] && echo "Error: Problem installing developer tools, gcc not found afterwards" && exit 1
	zypper install -y rpm-devel libopenssl-devel pam-devel openldap2-client openldap2-devel 1>&2
	[[ $? != 0 ]] && echo "Error: Problem installing developer tools" && exit 1
    fi
fi

echo "${os}" | grep -Ei "Ubuntu" 1>&2
if [[ $? == 0 ]] ; then
	echo "Installing Developer Tools for Ubuntu"
	DEBIAN_FRONTEND=noninteractive apt-get -y install build-essential 1>&2
	[[ $? != 0 ]] && echo "Error: Problem installing developer tools" && exit 1
fi

echo "Developer tools installed"
exit 0
