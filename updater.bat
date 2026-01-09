
REM CHANGE THE DIRECTORY TO THE CHROME FOLDER
cd C:\Traceq-extensions-main\chrome

REM DOWNLOAD THE ZIP FILE INSIDE THE CHROME FOLDER
curl "https://extension-provider.onrender.com/traceq-chrome-extended.zip" -O "traceq-chrome-extended.zip" 

REM UNZIP THE FOLDER AND REPLACE THE EXISTING FOLDER CONTENT
tar -xf traceq-chrome-extended.zip -C "C:\Traceq-extensions-main\chrome\traceq-chrome-extended"

REM DELETE THE DOWNLOADED ZIP FILE
del traceq-chrome-extended.zip

PAUSE