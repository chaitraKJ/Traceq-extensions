
rem CHANGE THE DIRECTORY TO THE CHROME FOLDER
cd C:\Traceq-extensions\chrome

rem DOWNLOAD THE ZIP FILE INSIDE THE CHROME FOLDER
curl "https://extension-provider.onrender.com/traceq-chrome-extended.zip" -o "traceq-chrome-extended.zip"

rem RENAME FOLDER - TRACEQ-CHROME-EXTENDED
rename traceq-chrome-extended traceq-chrome-extended-old

rem CREATE FOLDER - TRACEQ-CHROME-EXTENDED
mkdir "traceq-chrome-extended"

rem UNZIP THE FOLDER AND REPLACE THE EXISTING FOLDER CONTENT
tar -xf traceq-chrome-extended.zip -C "traceq-chrome-extended"

rem DELETE THE DOWNLOADED ZIP FILE AND BACKUP FILE
del traceq-chrome-extended.zip
rmdir -R traceq-chrome-extended-old /S /Q

PAUSE