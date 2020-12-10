# OS2IoT-docker

This repository contains the docker-compose file and configuration needed to run the OS2IoT project.

Documentation is available at: https://os2iot.readthedocs.io/en/latest/

## Usage

Currently (for development) we mount the source-code into the front-end and back-end containers, so it's required that you clone them into the same parent directory as this project:

```
OS2IoT
├── OS2IoT-backend (https://github.com/OS2iot/OS2IoT-backend)
├── OS2IoT-docker (https://github.com/OS2iot/OS2IoT-docker)
├── OS2IoT-frontend (https://github.com/OS2iot/OS2IoT-frontend)
```

From the `OS2IoT-docker` folder in a suitable terminal use:

```
docker-compose up
```

## Configuration

Edit the files in the configuration folder to adjust settings for each requirement.

## Contents

- Postgres from the official image.
- Chirpstack using their docker-compose

## Troubleshooting FAQ

### Docker File Sharing issues

Problem:

```
ERROR: for os2iot-backend  Cannot create container for service os2iot-backend: status code not OK but 500: {"Message":"Unhandled exception: Filesharing has been cancelled","StackTrace":"   at Docker.ApiServices.Mounting.FileSharing.<DoShareAsync>d__6.MoveNext() in C:\\workspaces\\stable-2.3.x\\src\\github.com\\docker\\pinata\\win\\src\\Docker.ApiServices\\Mounting\\FileSharing.cs:line 0\r\n--- End of stack trace from previous location where exception was thrown ---\r\n
at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at Docker.ApiServices.Mounting.FileSharing.<ShareAsync>d__4.MoveNext() in C:\\workspaces\\stable-2.3.x\\src\\github.com\\docker\\pinata\\win\\src\\Docker.ApiServices\\Mounting\\FileSharing.cs:line 47\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at Docker.HttpApi.Controllers.FilesharingController.<ShareDirectory>d__2.MoveNext() in C:\\workspaces\\stable-2.3.x\\src\\github.com\\docker\\pinata\\win\\src\\Docker.HttpApi\\Controllers\\FilesharingController.cs:line 21\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Threading.Tasks.TaskHelpersExtensions.<CastToObject>d__1`1.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Controllers.ApiControllerActionInvoker.<InvokeActionAsyncCore>d__1.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Controllers.ActionFilterResult.<ExecuteAsync>d__5.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Dispatcher.HttpControllerDispatcher.<SendAsync>d__15.MoveNext()"}
ERROR: Encountered errors while bringing up the project.
```

Cause:
Docker doesn't have acceess to mount the volumes.

Solution:
On Windows: Go to Docker Desktop (tray icon) -> Settings -> Resources -> File Sharing -> Add the directory which is the parent directory of "OS2IoT-docker" or a parent of that. -> Apply & Restart

### error: database "os2iot-e2e" does not exist

```
[ExceptionHandler] Unable
to connect to the database. Retrying (1)...
error: database "os2iot-e2e" does not exist
    at Parser.parseErrorMessage
```

Cause:
Database has not been setup correctly on local machine.

Solution:
docker-compose down --volumes
dos2unix configuration/os2iot-postgresql/initdb/\* <-- Skal køres fra git bash
docker-compose up

### error: Error: connect ETIMEDOUT xxx.xxx.xxx.xxx:xxxx at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)

Cause:
Docker is trying to connect to the wrong ip.

Solution:
1. Navigate to hosts file: C:\Windows\System32\drivers\etc
2. Open hosts file as administrator
3. Change related ip of host.docker.internal and gateway.docker.internal to your new ip (found in terminal using the ipconfig command: e.g. 192.168.0.1)
4. save
5. restart the application.
