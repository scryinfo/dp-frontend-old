# Overview
The Proof Of Concept for some of the ideas put forth in the Scry.Info whitepaper is implemented in following three projects: 
- scry-server [scryInfo/scry](https://github.com/scryInfo/scry) 
- frontend [scryInfo/scry-frontend](https://github.com/scryInfo/scry-frontend)
- publishing backend [scryInfo/publisher-backend](https://github.com/scryInfo/publisher-backend)

# Running

## docker

### installation and development

Scry-server with all its dependencies must be up and running. Refer to the "scry" repo how to bring it up with Docker.

1. Install Docker: https://docs.docker.com/install/
2. Select desired environment by editing `src/Components/Remote.js`
3. Start the container:
```
docker-compose up -d
```
4. On the first run, installing the dependencies may take quite a while. Watch the container logs to know when the installation has finished and server has started:
```
docker-compose logs -f
```

Frontend listens by default on `http://localhost:3000/`

On any change of source code, yarn will re-compile it and will serve updated version - no need to restart the container.

### building version for deployment

To produce static files to be served by a webserver in production environment:

`docker-compose exec scry-frontend yarn build`

Files in /build/ folder are ready to be deployed. On `dev.scry.info` they are served by nginx.

#### Troubleshooting

The startup process has hanged for me because of some dependency resolving in yarn install needed interactive input. This is not visible, because the container doesn't get a full interactive tty when building, and **it seems like the process hangs.** In that case, stop the environment (docker-compose down), get an interactive shell inside the container, skipping the setup part, with `docker-compose run --rm scry-frontend /bin/sh`, and run the setup commands one by one:

```
yarn config set registry https://registry.npm.taobao.org
yarn
yarn start
```

If this works, exit, and start the container again with `docker-compose up --build` (or with -d for detached mode and check the logs with docker-compose logs).s

There might be some hiccups now after changing the repository to the Chinese one. If you get `npm ERR! Unexpected end of JSON input while parsing near '...gin-transform-literal'`, run `npm cache clean --force` locally and try again.


## install

```bash
yarn install
```
## select environment

Edit `src/Components/Remote.js`: `const dev = false;`

Dev goes to localhost, non-dev goes to dev.scry.info.

## run

```bash
yarn start
```

## create production build

```bash
yarn build
```

It creates /build folder that is ready to be deployed



## Dependencies
    node: 9.5.0,
    yarn: 1.5.1
