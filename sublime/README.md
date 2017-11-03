#SublimeLingo
=========

Sublime Text 3 Plugin for CodeLingo

# Plugin only works with the Lingo binary, sign up for early access at [codelingo.io](http://codelingo.io)

LingoComplete is a plugin for [SublimeText](http://www.sublimetext.com/) that enables highlighting and dynamic autocomplete for [CodeLingo](http://codelingo.io) .lingo files.

Install
-------

Install the [CodeLingo client](https://github.com/codelingo/lingo) and make sure the binary is on your path, as per the instructions.
<!-- TODO:  add to package control https://trello.com/c/SCTHS3xW/638-add-sublimelingo-to-package-control -->
<!--  Install Sublime Package Control (if you haven't done so already) from http://wbond.net/sublime_packages/package_control. Be sure to restart ST to complete the installation.

Bring up the command palette (default ctrl+shift+p or cmd+shift+p) and start typing Package Control: Install Package then press return or click on that option to activate it. You will be presented with a new Quick Panel with the list of available packages. Type Lingo and press return or on its entry to install Lingo. If there is no entry for Lingo, you most likely already have it installed.
 -->
Clone this repo

`git clone https://github.com/codelingo/ideplugins`

and add the sublime plugin to your packages

`cp -R ideplugins/sublime/ ~/.config/sublime-text-3/Packages/Lingo`

Reset Completions
-------

You may wish to get new autocomplete data from the CodeLingo platform, in which case you need to delete the Lingo/lexicons/\<owner\>/\<name\> file from your plugin.
