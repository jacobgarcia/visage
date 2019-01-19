# Visual Search

[![Dependency Status][daviddm-img]][daviddm-url]

## Usage

Run **development server**

```bash
npm start # or npm run start:nodemon
```

Create **production bundle**, splits JS and CSS files and creates manifest, map files, PWA icons and Service Worker, all saved in `/dist`

```bash
npm run build:prod
```

Run a **Docker** container with pm2

```bash
npm run serve:docker
```

Run a regular pm2 process

```bash
npm run serve
```

Run with docker-compose

```bash
docker-compose up
```

[daviddm-img]: https://david-dm.org/nuremx/react-boilerplate.svg
[daviddm-url]: https://david-dm.org/nuremx/react-boilerplate
