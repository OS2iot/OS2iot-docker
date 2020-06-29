# OS2IoT-docker

This repository contains the docker-compose file and configuration needed to run the OS2IoT project.

## Usage

```
docker-compose up
```


## Configuration

Edit the files in the configuration folder to adjust settings for each requirement.

## Contents
 - Postgres from the official image.
 - Chirpstack using their docker-compose

## Troubleshooting

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


