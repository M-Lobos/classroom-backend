# Back end set up

Visit this repo to know how to build the [base structure](https://github.com/M-Lobos/Basic-PERN-structure) for the back end used in this project

## Starting the project on Node.js
Start the Node.js project
```bash
npm init -y
```
Change the type from commonjs to module in the package.json file and install express

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
}
```
Install express and nodemon (as a dev dependency)

```bash
npm install express
npm install nodemon -D
```
Also create your .env file, your .template.env and your .gitignore

A good practice for your .gitignore is use the [template from github](https://github.com/github/gitignore/blob/main/Node.gitignore) for the .gitignore file on Node.js projects.

```bash
npm install express
npm install nodemon -D
```
Now we will work with typeScript so we shall install that dependency too as
```bash
npm install -D typescript tsx @types/node @types/express
```
To create a new typescript configuration, run:
```npx
npx tsc --init
```
Use the following configuration: 
```JSON
{
  "compilerOptions": {
    /* Language & runtime */
    "target": "ES2022",
    "lib": ["ES2022"],

    /* Node ESM */
    "module": "ES2022",
    "moduleResolution": "node",

    /* Project structure */
    "rootDir": "src",
    "outDir": "dist",

    /* Type safety */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    /* Interop & correctness */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,

    /* Build output */
    "sourceMap": true,

    /* Performance */
    "skipLibCheck": true,

    /* Environment types */
    "types": ["node"]
  },
  "include": ["src"]
}
```
As in the document related above, crate a src folder with the entry point app.ts file inside

```ts
import express from 'express';


const app = express();
const PORT = 8000;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Welcome, API running')
})

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});

```

In order to be able to run this Ts backend application, tsx is needed (the develoment package we just installed). To do so some package.json scripts are needed:
1. dev script: 
2 "build": "tsc" (compiles TS source file in to js for production)
3. "start": "node dist/server.js"(not watch over changes, but it just run the server to poroduction)

```bash
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "app.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "tsx watch ./src/app.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "express": "^5.2.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.9.1",
    "nodemon": "^3.1.14",
    "tsx": "^4.22.3",
    "typescript": "^6.0.3"
  }
}
```

Now... crate a new repository