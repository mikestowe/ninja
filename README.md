## Ninja

...
--------

###Prerequisites

To run the Ninja Application you will need the following:

-   Be able to access the Motorola internal network, using the blue port or VPN
-   The latest stable version of Chrome
-   Ninja can be run in either a Chrome unpackaged application or packaged application (.crx). Instructions below

###Setup and Run Ninja as an unpackaged application

If you're already familiar with using Git, GitHub, and how to configure a local web server,

1.  Download Ninja Local Cloud:
    Win: get Ninja Local Cloud.exe from \\ninjateam.am.mot.com\users\jmayhew\Ninja Local Cloud,
    Mac: get Ninja Local Cloud.app from smb://ninjateam.am.mot.com/users/jmayhew/Ninja Local Cloud
2.  Launch Ninja Local Cloud.  On Mac, click Allow when asked to accept incoming network connection.
3.  Click Copy button to copy the Ninja Local Cloud URL.
4.  Launch your cloned master branch.
5.  You should get the Cloud Service Dialog.
6.  Paste in the Ninja Local Cloud URL that you copied in step 3.
7.  Click the TEST button.  It should still show Disconnected.
8.  In the Ninja Local Cloud app, click on Advanced button, you should see an error that it ignores the url where you run Ninja.  If you don't any text when clicking Test, there's no connection established between Ninja and Ninja Local Cloud, you probably did not click Allow the incoming connection, or check your network connection, try public network instead of DSA, disconnect from VPN, etc.
9.  Copy the URL in the error text, this is also the URL of where you run your Ninja build, something like http://localhost:9080 on Windows or http://yourmachinename.am.mot.com on Mac
10. On Windows:
    Click Start menu icon and type regedit
    Browse to HKEY_CURRENT_USER/Software/Motorola Mobility/Ninja Local Cloud/Options
    Right click and select New > String value
    Type 'Local Ninja Origin' no quotes
    Double click on Local Ninja Origin and paste in the URL copied in step 10 in the Value data field.
    Close Registry Editor.

11. On Mac:
    Launch Finder.
    Double click on <yourusername>/Library/Preferences/com.MotorolaMobility.Ninja-Local-Cloud.plist
    Click on Add Child
    Type  'Local Ninja Origin' no quotes
    For value, paste in the URL copied in step 10.
    Save (File > Save or Cmd S)
    Close Property List Editor
12. Quit Ninja Local Cloud
13. Launch Ninja Local Cloud
14. In Ninja, click Test again, you should see the green text that said "Connected to Ninja Local Cloud".
15. Ninja is opened with no document.  You should be able to do File > New File and select Basic HTML, give it a name and click browse to the directory.  By default, files will be saved in Ninja Projects folder in user documents.  As long as Ninja Local Cloud is running, you will not see the Cloud Service Dialog next time you launch.


###Setup and Run Ninja as a packaged application

