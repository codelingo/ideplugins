#Visual Studio CodeLingo extension
=========

# Plugin only works with the Lingo binary, sign up for early access at [codelingo.io](http://codelingo.io)

The CodeLingo extension adds support for writing and running CLQL in Visual Studio 2013 and later [Visual Studio 2013 and later](https://www.visualstudio.com/)

Install
-------

Install the [CodeLingo client](https://github.com/codelingo/lingo) and make sure the binary is on your path, as per instructions.

Install the extension by double clicking the CodeLingo.vsix and selecting the Visual Studio version to be installed.

Query Generation
-------

Select a section of source code and click Tools->CodeLingo->Generate Query. A CLQL snippet that matches the selected code element will be displayed in file named `query_gen.txt`. If multiple elements are selected, then multiple CLQL snippets will be displayed.

![Alt text](images/query_gen.png?raw=true "Generate Query")

The CLQL snippet can then be used to write a Tenet in a .lingo file

![Alt text](images/result.png?raw=true "Result")

Roadmap
-------

- [x] CLQL generation
- [ ] .lingo autocomplete
- [ ] CLQL search panel