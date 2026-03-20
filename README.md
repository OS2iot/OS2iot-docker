# OS2IoT-docker

This repository contains the Docker Compose file and configuration needed to run the OS2IoT project.

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
docker compose up --detach
```

### Quick Start with Task Runner (Recommended)

This project includes a [Taskfile](https://taskfile.dev/) to simplify common operations. Install go-task first:

```bash
# macOS
brew install go-task

# Linux (snap)
sudo snap install task --classic

# Other methods: https://taskfile.dev/installation/
```

**Full setup from scratch:**

```bash
# 1. Clone repos, fix line endings, and generate certificates
task setup

# 2. Build and start all services
docker compose up --build --detach

# 3. Wait for services to be healthy (check with: docker compose ps)
#    The backend may take a minute to initialize the database

# 4. Create default organization (required for frontend to work)
task setup:org

# 5. Open the frontend in browser
task open
```

**Default login credentials:**
- Email: `global-admin@os2iot.dk`
- Password: `hunter2`

**Available tasks:**

```bash
task setup              # Clone sibling repos, fix line endings, generate certs
task setup:check        # Verify setup status
task setup:org          # Create default organization (requires services running)
task setup:chirpstack   # Configure ChirpStack API key (for LoRaWAN integration)
task status             # Show status of all containers
task build              # Build all Docker images
task clean              # Remove containers, volumes, and images
task open               # Open frontend in browser
```

### ChirpStack Integration (Optional)

If you're using LoRaWAN features, you need to configure the ChirpStack API key:

```bash
# Run the setup task - it will guide you through the process
task setup:chirpstack
```

Or manually:
1. Open ChirpStack UI: `task open:chirpstack`
2. Login with `admin` / `admin`
3. Go to **API Keys** → Create a new API key
4. Add to `.env` file: `CHIRPSTACK_API_KEY=your-key-here`
5. Restart backend: `docker compose up -d os2iot-backend`

Without this configuration, you'll see `InvalidToken` errors in the backend logs - these can be ignored if you're not using LoRaWAN features.

## Configuration

Edit the files in the configuration folder to adjust settings for each requirement.

## Contents

- Postgres from the official image.
- Chirpstack using their Docker Compose

## Troubleshooting FAQ

### Docker File Sharing issues

Problem:

```
ERROR: for os2iot-backend  Cannot create container for service os2iot-backend: status code not OK but 500: {"Message":"Unhandled exception: Filesharing has been cancelled","StackTrace":"   at Docker.ApiServices.Mounting.FileSharing.<DoShareAsync>d__6.MoveNext() in C:\\workspaces\\stable-2.3.x\\src\\github.com\\docker\\pinata\\win\\src\\Docker.ApiServices\\Mounting\\FileSharing.cs:line 0\r\n--- End of stack trace from previous location where exception was thrown ---\r\n
at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at Docker.ApiServices.Mounting.FileSharing.<ShareAsync>d__4.MoveNext() in C:\\workspaces\\stable-2.3.x\\src\\github.com\\docker\\pinata\\win\\src\\Docker.ApiServices\\Mounting\\FileSharing.cs:line 47\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at Docker.HttpApi.Controllers.FilesharingController.<ShareDirectory>d__2.MoveNext() in C:\\workspaces\\stable-2.3.x\\src\\github.com\\docker\\pinata\\win\\src\\Docker.HttpApi\\Controllers\\FilesharingController.cs:line 21\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Threading.Tasks.TaskHelpersExtensions.<CastToObject>d__1`1.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Controllers.ApiControllerActionInvoker.<InvokeActionAsyncCore>d__1.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Controllers.ActionFilterResult.<ExecuteAsync>d__5.MoveNext()\r\n--- End of stack trace from previous location where exception was thrown ---\r\n   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()\r\n   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)\r\n   at System.Web.Http.Dispatcher.HttpControllerDispatcher.<SendAsync>d__15.MoveNext()"}
ERROR: Encountered errors while bringing up the project.
```

Cause:
Docker doesn't have access to mount the volumes.

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
docker compose down --volumes
dos2unix configuration/os2iot-postgresql/initdb/*  # Run from git bash on Windows
docker compose up

### error: Error: connect ETIMEDOUT xxx.xxx.xxx.xxx:xxxx at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)

Cause:
Docker is trying to connect to the wrong IP.

Solution:
1. Navigate to hosts file: C:\Windows\System32\drivers\etc
2. Open hosts file as administrator
3. Change related IP of host.docker.internal and gateway.docker.internal to your new IP (found in terminal using the ipconfig command: e.g. 192.168.0.1)
4. Save
5. Restart the application.

## Adding an ADR Algorithm
When the ADR Algorithm has been tested, and is ready for deployment, the ADR Algorithm has to be added to chirpstack. It is mandatory that the custom ADR module is written in JavaScript.

## Adding the Plugin to Chirpstack

### Docker

If the default `docker-compose.yml` file is used, the folder `./configuration/chirpstack` is already copied to `/etc/chirpstack` in the docker container.
Therefore a new folder can be added such as `./configuration/chirpstack/adr-modules` in which the js file can be added.
This makes the file available at `/etc/chirpstack/adr-modules/example-file.js` within the chirpstack container.

The last step is to specify the file as being an adr-plugin within the `chirpstack.toml` config file by adding `adr_plugins=["/etc/chirpstack/adr-modules/example-file.js"]` under `[network]`, like this:
```toml
[network]
    adr_plugins=["/etc/chirpstack/adr-modules/example-file.js"]
```

You should now be able to restart the chirpstack server and the new adr algorithm should be available in Chirpstack.

### Helm

See <https://github.com/OS2iot/OS2IoT-helm> for an example Helm setup.
