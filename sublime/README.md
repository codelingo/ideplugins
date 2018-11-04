# Sublime Plugin

A plugin for [Sublime Text 3](https://www.sublimetext.com/) that adds auto-complete, syntax highlighting, and query generation for CodeLingo's CLQL.


## Install / Upgrade

This plugin depends on the [Lingo client](https://github.com/codelingo/lingo), so make sure you have installed this somewhere in your PATH. If lingo is in your GOPATH make sure a copy exists in your PATH also.

<!-- TODO:  add to package control https://trello.com/c/SCTHS3xW/638-add-sublimelingo-to-package-control -->
<!--  Install Sublime Package Control (if you haven't done so already) from http://wbond.net/sublime_packages/package_control. Be sure to restart ST to complete the installation.

Bring up the command palette (default ctrl+shift+p or cmd+shift+p) and start typing Package Control: Install Package then press return or click on that option to activate it. You will be presented with a new Quick Panel with the list of available packages. Type Lingo and press return or on its entry to install Lingo. If there is no entry for Lingo, you most likely already have it installed.
 -->

To install or update this plugin:

1. Clone this repo:
   ```bash
   git clone https://github.com/codelingo/ideplugins
   ```
2. Remove any previous Lingo plugin version:
    ```bash
    ~/.config/sublime-text-3/Packages/Lingo
    ```
3. Add the Lingo plugin to your Sublime packages:
    ```bash
    cp -R ideplugins/sublime/ ~/.config/sublime-text-3/Packages/Lingo
    ```


## Query Generation

Select some code in a CodeLingo supported language and press any of the key combinations below. A text box should appear at the bottom of the page with generated queries.

Usage:

- Generate queries with facts only, ie. no properties: `alt+shift+q`.
- Generate queries with facts and all properties: `alt+shift+a`.
- Generate queries with facts and properties only on the last facts: `alt+shift+z`.

The debug terminal can be opened with `ctrl`+`` ` ``. There may be a short lag due to latency.

The hotkey can be changed in `Preferences > Package Settings > Lingo > Settings > User`.



## Reset Completions

You may wish to get new autocomplete data from the CodeLingo platform, in which case you need to delete the Lingo/lexicons/\<owner\>/\<name\> file from your plugin.
