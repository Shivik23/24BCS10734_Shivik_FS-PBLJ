@echo off
title Foodies Backend Server (Port 8080)
cd /d "%~dp0"

set "JAVA_HOME=C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.4\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo ===================================================
echo Starting Foodies Backend (Spring Boot on Port 8080)
echo ===================================================

attrib -r "%~dp0backend\target\classes\application.properties" 2>nul
call "C:\Program Files\JetBrains\IntelliJ IDEA 2026.1.4\plugins\maven\lib\maven3\bin\mvn.cmd" -f "%~dp0backend\pom.xml" spring-boot:run

