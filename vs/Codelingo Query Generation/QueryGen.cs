//------------------------------------------------------------------------------
// <copyright file="QueryGen.cs" company="Company">
//     Copyright (c) Company.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

using System;
using System.ComponentModel.Design;
using Microsoft.VisualStudio.Shell;
using EnvDTE;
using System.IO;
using System.Text;
using Newtonsoft.Json.Linq;


namespace Codelingo_Query_Generation
{
    /// <summary>
    /// Command handler
    /// </summary>
    internal sealed class QueryGen
    {
        /// <summary>
        /// Command ID.
        /// </summary>
        public const int CommandId = 0x0100;

        /// <summary>
        /// Command menu group (command set GUID).
        /// </summary>
        public static readonly Guid CommandSet = new Guid("6d1a6dfb-04e3-41db-a13c-4a4fb5d680d0");

        /// <summary>
        /// VS Package that provides this command, not null.
        /// </summary>
        private readonly Package package;

        /// <summary>
        /// Initializes a new instance of the <see cref="QueryGen"/> class.
        /// Adds our command handlers for menu (commands must exist in the command table file)
        /// </summary>
        /// <param name="package">Owner package, not null.</param>
        private QueryGen(Package package)
        {
            if (package == null)
            {
                throw new ArgumentNullException("package");
            }

            this.package = package;
            OleMenuCommandService commandService = this.ServiceProvider.GetService(typeof(IMenuCommandService)) as OleMenuCommandService;
            if (commandService != null)
            {
                var menuCommandID = new CommandID(CommandSet, CommandId);
                var menuItem = new MenuCommand(this.MenuItemCallback, menuCommandID);
                commandService.AddCommand(menuItem);
            }
        }

        /// <summary>
        /// Gets the instance of the command.
        /// </summary>
        public static QueryGen Instance
        {
            get;
            private set;
        }

        /// <summary>
        /// Gets the service provider from the owner package.
        /// </summary>
        private IServiceProvider ServiceProvider
        {
            get
            {
                return this.package;
            }
        }

        /// <summary>
        /// Initializes the singleton instance of the command.
        /// </summary>
        /// <param name="package">Owner package, not null.</param>
        public static void Initialize(Package package)
        {
            Instance = new QueryGen(package);
        }

        private string GetHomeDir()
        {
            string homePath = (Environment.OSVersion.Platform == PlatformID.Unix ||
                   Environment.OSVersion.Platform == PlatformID.MacOSX)
    ? Environment.GetEnvironmentVariable("HOME")
    : Environment.ExpandEnvironmentVariables("%HOMEDRIVE%%HOMEPATH%");
            string lingoHomePath = Path.Combine(homePath, ".codelingo","ide");
            if (!Directory.Exists(lingoHomePath)){
                Directory.CreateDirectory(lingoHomePath);
            }
            return lingoHomePath;
        }

        private string FmtArr(JToken arr)
        {
            string retstr = "";
            string tabs = "";
            foreach (var fact in arr){
                retstr += tabs + fact + ":\n";
                tabs += "  ";
            }
            return retstr;
        }
        /// <summary>
        /// This function is the callback used to execute the command when the menu item is clicked.
        /// See the constructor to see how the menu item is associated with this function using
        /// OleMenuCommandService service and MenuCommand class.
        /// </summary>
        /// <param name="sender">Event sender.</param>
        /// <param name="e">Event args.</param>
        public void MenuItemCallback(object sender, EventArgs e)
        {

            DTE dte = (DTE)ServiceProvider.GetService(typeof(DTE));

            if (dte.ActiveDocument != null)
            {
                var selection = (TextSelection)dte.ActiveDocument.Selection;
                int line = selection.ActivePoint.Line;
                int offsetA = selection.AnchorPoint.AbsoluteCharOffset;
                int offsetB = selection.ActivePoint.AbsoluteCharOffset;
                string path = Path.Combine(dte.ActiveDocument.Path, dte.ActiveDocument.Name);
                if (offsetA > offsetB)
                {
                    int temp = offsetA;
                    offsetA = offsetB;
                    offsetB = temp;
                }
                string text = selection.Text;
                string output = "";

                var proc = new System.Diagnostics.Process
                {
                    StartInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = "/C lingo query-from-offset " + path + " " + offsetA + " " + offsetB,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    }
                };
                proc.Start();

                while (!proc.StandardOutput.EndOfStream)
                {
                    output += proc.StandardOutput.ReadLine();
                }

                JToken json = JToken.Parse(output);
                output = "";
                     foreach (var arr in json)
                {
                    output += FmtArr(arr)+ "\n";
                }

                string ResultFilepath = Path.Combine(GetHomeDir(), "query_gen.txt");

                // Clear the existing file.
                File.WriteAllText(ResultFilepath, String.Empty);

                // Open the stream and write to it.
                using (FileStream fs = File.OpenWrite(ResultFilepath))
                {
                    Byte[] info =
                        new UTF8Encoding(true).GetBytes(output);
                    fs.Write(info, 0, info.Length);
                }
                proc = new System.Diagnostics.Process
                {
                    StartInfo = new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "devenv.exe",
                        Arguments = "/edit " + ResultFilepath,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        CreateNoWindow = true
                    }
                };
                proc.Start();
            }
        }
    }
}
