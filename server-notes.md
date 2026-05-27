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
  "main": "app.s",
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

Now... crate a new repository and push it



## Persistance
Go to Drizzle's docs.

```bash
npm i drizzle-orm pg dotenv
npm i -D drizzle-kit tsx @types/pg
```
Inside the .env place the URL from Neon DB you have created 

Go to Neon Docs (check from the 4th point)
```bash
npm install drizzle-orm @neondatabase/serverless 
npm install -D drizzle-kit
```
Create a new folder called config, inside a drizzle.config.ts file as follows:
```tsx

import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the .env file');
}

export default defineConfig({
    schema: '../../src/services/db/schemas/index.ts', // Your schema file path
    out: './drizzle', // Your migrations folder
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
```
Once done, create a folder services, inside a db folder, inside schemas folder and a index.ts file. now inside schemas folder create another index.ts and appEntities.ts. Inside this last, define the schemas for departments and subjets as follows:

```ts
import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const timpeStamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
}

export const departments = pgTable('departments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }),
    ...timpeStamps
});

export const subjects = pgTable('subjects', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => departments.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    ...timpeStamps
});

export const departmentRelation = relations(departments, ({ many }) => ({ subjects: many(subjects) }));

export const subjectsRelation = relations(subjects, ({ one, many }) => ({
    deparment: one(departments, {
        fields: [subjects.departmentId],
        references: [departments.id]
    })
}));

/**
 * This uses type inference from database table schemas, the app types always be in sync with the DB
 * Basically autogen types based on the db schemas so there is no need to define types manually 
 */
export type Deparment = typeof departments.$inferSelect;
export type NewDeparment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;
```
To start the migration crate a script in the package.json
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
    "start": "node dist/app.js",
    "db:generate": "drizzle-kit generate --config=src/config/drizzle.config.ts",
    "db:migrate": "drizzle-kit migrate --config=src/config/drizzle.config.ts",
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "@neondatabase/serverless": "^1.1.0",
    "dotenv": "^17.4.2",
    "drizzle-orm": "^0.45.2",
    "express": "^5.2.1",
    "pg": "^8.21.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^25.9.1",
    "@types/pg": "^8.20.0",
    "drizzle-kit": "^0.31.10",
    "nodemon": "^3.1.14",
    "tsx": "^4.22.3",
    "typescript": "^6.0.3"
  }
}
```
Open up the index.ts inside the schema folder and add inside:
```tsx
export * from './appEntities'
```
Now run `npm run db:generate` in your terminal, this should create the migration file. 
```bash
npm run db:generate
```
For run the SQL migration within neon NEON DB:
```bash
npm run db:migrate
```
## Insert some data via Neon DB

INSERT INTO departments (code, name, description)
VALUES ('ECE', 'Electronics and Communications', 'Circuits, signal proscessing and telecom');

INSERT INTO subjects (department_id, code, name, description)
VALUES 
  (1, 'CS201', 'Data Structures', 'Algorithms, lists and more')
  (1, 'ECE203', 'Signals', 'Analysis of EC signals');

## Routing

As in the mentioned last project, create a routes folder inside src, and then a file called subjects.routes.ts within. 

Define pagination and filters comming from the front. Notice the use of `or`, `and`, and `ilike` operators from `Drizzle ORM` to craete the `whereclause`

Use the `sql` operator from `Drizzle ORM`, wich allows you to run navite SQL queries. For the leftJoin to work, also import the `eq` operator from `Drizzle ORM`

```ts
import express from 'express';
import { departments, subjects } from '../services/db/schemas';
import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { db } from '../services/db';

const router = express.Router();

//GET ALL ROUTES
router.get("/", async (req, res) => {
    try {

        //here the props for the front for filtering where be processed. Drestructure them from query
        const { search, department, page = 1, limit = 10 } = req.query;

        const curretPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);
        // How many records to skip to get to the next page
        const offset = (curretPage - 1) * limitPerPage;

        //array to store the filtering conditions, empty by default.
        const filterConditions = [];

        // If a search query exists, filte by name OR subject code
        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`),
                )
            );
        }

        //same as above for departments
        if (department) {
            //to avoid SQL inyection
            const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`;
            filterConditions.push(ilike(departments.name, deptPattern));
        }

        //combine filters using AND if any exisits => whereClause
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id)) //returns all from the left table matching the rows from the right one
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        //Query the data
        const subjectlist = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        //return res
        res.status(200).json({
            data: subjectlist,
            pagination: {
                page: curretPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })

    } catch (error) {
        console.error(`GET /subjects error: ${error}`)
        res.status(500).json({
            error: 'Fail to get subjects'
        })
    }
})

export default router

```
later on, this will be modularized in two separated responsabilities, as controllers and routes. For now, lets deal with cors in order to conect the front end with the backend. 

```bash
npm i cors
npm i --save-dev @types/cors
```

Done that, in the `.env` file define a FRONTEND_URL variable
```txt
PORT = 3000
DATABASE_URL=postgresql://neondb_owner:************npg_jHDmEP4Mx7QA@ep************-winter-mountain-ap58llao-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

FRONTEND_URL='http://localhost:5173'
```

Initialize `cors` in the `app.ts` file
```ts
import express from 'express';
import subjectRouter from './routes/subjects.routes'
import cors from 'cors'

const app = express();
const PORT = process.env.PORT;

//cors middleware (mandar a una carpeta de middlewares)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

//middleware for json forms and multiformat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/subjects', subjectRouter)

app.get('/', (req, res) => {
    res.send('Welcome, API running')
})

//mandar a services
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
```

