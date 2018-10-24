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

On any change of source code, yarn will re-compile it and will serve updated version - no need to restart the container.

### building version for deployment

To produce static files to be served by a webserver in production environment:

`docker-compose exec scry-frontend yarn build`

Files in /build/ folder are ready to be deployed. On `dev.scry.info` they are served by nginx.

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
