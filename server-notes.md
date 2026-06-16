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
## Authentication with Better Auth
Better Auth is a framework-agnostic, universal authentication and authorization framework for TypeScript.

To better understanding about the schema look at the [core-schema](https://better-auth.com/docs/concepts/database#core-schema) section on Better Auth documentation. Here is where to find the details for tables as:
* User          -> Manages if user is teacher or student 
* Session       -> Tracks connection device
* Account       -> How does they log in (password? google?)
* Verification  -> Password resets and email links

Go to src/services/db/schema folder and create a new file called auth.ts:

```ts
import { pgTable, text, timestamp, boolean, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["student", "teacher", "admin"]);

const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
}

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    role: roleEnum("role").default("student").notNull(),
    imageCldPubId: text("image_cld_pub_id"),
    ...timestamps
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [
    index("session_user_id_idx").on(table.userId),
]);

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("account_user_id_idx").on(table.userId),
]);

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index("verification_identifier_idx").on(table.identifier),
]);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;
``` 
Now go to schemas/appEntities.ts and update the file by considering the classes and enrollments tables
```ts
import {
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    unique,
    varchar,
    index,
    primaryKey
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth.js";

export const classStatusEnum = pgEnum('class_status', ['active', 'inactive', 'archived']);

const timestamps = {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull()
}

export const departments = pgTable('departments', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 255 }),
    ...timestamps
});

export const subjects = pgTable('subjects', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    departmentId: integer('department_id').notNull().references(() => departments.id, { onDelete: 'restrict' }),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 255 }),
    ...timestamps
});

export const classes = pgTable('classes', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    teacherId: text('teacher_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
    inviteCode: text('invite_code').notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    bannerCldPubId: text('banner_cld_pub_id'),
    bannerUrl: text('banner_url'),
    description: text('description'),
    capacity: integer('capacity').default(50).notNull(),
    status: classStatusEnum('status').default('active').notNull(),
    schedules: jsonb('schedules').$type<any[]>().default([]).notNull(),
    ...timestamps
}, (table) => [
    index('classes_subject_id_idx').on(table.subjectId),
    index('classes_teacher_id_idx').on(table.teacherId),
]);

export const enrollments = pgTable('enrollments', {
    studentId: text('student_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    classId: integer('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
}, (table) => [
    primaryKey({ columns: [table.studentId, table.classId] }),
    unique('enrollments_student_id_class_id_unique').on(table.studentId, table.classId),
    index('enrollments_student_id_idx').on(table.studentId),
    index('enrollments_class_id_idx').on(table.classId),
]);

//relations

export const departmentRelations = relations(departments, ({ many }) => ({ subjects: many(subjects) }));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
    department: one(departments, {
        fields: [subjects.departmentId],
        references: [departments.id],
    }),
    classes: many(classes)
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
    subject: one(subjects, {
        fields: [classes.subjectId],
        references: [subjects.id],
    }),
    teacher: one(user, {
        fields: [classes.teacherId],
        references: [user.id],
    }),
    enrollments: many(enrollments)
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
    student: one(user, {
        fields: [enrollments.studentId],
        references: [user.id],
    }),
    class: one(classes, {
        fields: [enrollments.classId],
        references: [classes.id],
    }),
}));

/**
 * This uses type inference from database table schemas, the app types always be in sync with the DB
 * Basically autogen types based on the db schemas so there is no need to define types manually 
 */
export type Deparment = typeof departments.$inferSelect;
export type NewDeparment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

export type Class = typeof classes.$inferSelect;
export type NewClass = typeof classes.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
```

Do not forget the exports, so no go to the index.ts inside schema folder and export the auth.js from there as with appEntities.ts:
```ts
export * from './appEntities'
export * from './auth'
```

Now to generate the SQL for the latest schema created, run on terminal:
```bash
npm pwd #always check your working directory
npm cd server
npm run db:generate
```
You should see a summary in your terminal about the tables generated, and that the SQL migration file is ready in the drizzle folder. Then migrate them:

```bash
clear
npm run db:migrate
```
Done this, lets push it to github, open a new terminal and be sure to be on the server folder
```bash
pwd
cd server
git status
```
Should be on main... if so, create a new branch called feat/database-schemas-2 (if not, go to main, and creathe the branch)
```bash
git checkout -b feat/database-schemas-2
git add . 
git commit -m "ft: "
git push
```
## Security with Arcjet middleware
To ensure the app is secure, like production ready secure, thus security should be a core feature in any app. Consider that any route defined implies a "door" to enter the app, if not locked and secure, they are vulnerable to be breached. In order to address this issue, a security layer is needed (for both, front and back).

Arcjet is a security-as-code platform that allows to implement robust security and protection: 
* bot detection
* rate limiting
* email validation

With Arcjet, is just as simple as import the SKD and define the rules. Go to [Arcjet](https://arcjet.com/), create your account and in Personal, create a new site, name it, copy the arcjet_key and past it in your .envfile, also create a new envirorment variable called ARCJET = development (later on this will be switch it to production).

To install the Arcjet SDK select Manual Install and select the card Node.js + Express and follow the instrucctions 
(The second step is setting the env variable, already done)

```bash
pwd #always check where are you standing in your project
cd server 
npm i @arcjet/node @arcjet/inspect
```
In the 3rd step there is an example included so just copy this part of the example provided (the part with the rule definition)
```ts
const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      // Tracked by IP address by default, but this can be customized
      // See https://docs.arcjet.com/fingerprints
      //characteristics: ["ip.src"],
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});
```
Arcjet suggest you to place it at your index.ts (the app.ts in the current project), but in order to keep the app.ts file clean, place this in some other file inside config folder and import it, wouldn't be a bad idea.

Arcjet uses a token Bucket method as a rule to deal with the rate limit by default, this rule would be replaced by a sliding window method. 


**Securing end-points**

```ts
import arcjet, { shield, detectBot, slidingWindow, tokenBucket } from "@arcjet/node";
/* import { isSpoofedBot } from "@arcjet/inspect";*/

if (!process.env.ARCJET_KEY && process.env.ARCJET_ENV !== 'test') {
    throw new Error('ARCJECT_KEY is required');
}

const aj = arcjet({
    // variable rather than hard coding.
    key: process.env.ARCJET_KEY!,
    rules: [
        // Shield protects your app from common attacks e.g. SQL injection
        shield({ mode: "LIVE" }),
        // Create a bot detection rule
        detectBot({
            mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
            // Block all bots except the following
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
                // Uncomment to allow these other common bot categories
                // See the full list at https://arcjet.com/bot-list
                //"CATEGORY:MONITOR", // Uptime monitoring services
                "CATEGORY:PREVIEW"
            ],
        }),
        // Create a slidingWindow rate limit. Other algorithms are supported.
        slidingWindow({
            mode: 'LIVE',
            interval: '2s', //refills every 2 secs
            max: 5, //max of 5 requests per interval (2 secs)
        })
    ],
});

export default aj;
```
## authMiddleware
Now address the src directory again,  and create a new file express.d.ts whitin. This file will declare the user role for each request. It will be set by the authentication middleware later on. And also create another new file called type.d.ts where we will create the types for the users-role-

```bash
pwd
cd src
touch express.d.ts
touch type.d.ts
```

```ts
//express.d.ts file
declare global {
    namespace Express {
        interface Request {
            user?: {
                role?: "admin" | "teacher" | "student";
            }
        }
    }
}

export { };
```
```ts
//type.d.ts file
declare global {
    namespace Express {
        interface Request {
            user?: {
                role?: "admin" | "teacher" | "student";
            }
        }
    }
}

export { };
```


Now back craete a new folder inside src called, middleware, whitin create a new file called security.

```bash
pwd
mkdir middlewares
cd middelwares
touch security.ts
code security.ts
```
Create a new middleware called securityMiddleware 
```ts
import { Request, Response, NextFunction } from "express";
import aj from "../config/arcjet";
import { ArcjetNodeRequest, slidingWindow } from "@arcjet/node";


const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test') return next();

    try {
        const role: RateLimitRole = req.user?.role ?? 'guest'; //we set this rateLimitRole, to place ratelimit per rol

        let limit: number;
        let message: string;

        switch (role) {
            case 'admin':
                limit = 20;
                message = 'Admin request limit exceeded (20 per minute). Slow down';
                break;
            case 'teacher':
            case 'student':
                limit = 10;
                message = 'User request limit exceeded (10 per minute). Please wait';
                break;
            default:
                limit = 3;
                message = 'Guest request limit exceeded (3 per minute). Please sigh up for higher limits';
                break;
        }

        const client = aj.withRule(
            slidingWindow({
                mode: 'LIVE',
                interval: '60s',
                max: limit, // this way is dynamic depending on the user role.
            })
        )

        //now intercept the request.
        const ArcjetRequest: ArcjetNodeRequest = {
            headers: req.headers,
            method: req.method,
            url: req.originalUrl ?? req.url,
            socket: {
                remoteAddress: req.socket.remoteAddress ?? req.ip ?? '0.0.0.0' //0.0.0.0 is default
            },
        }

        //now with the client and the arcjetRequest, comes the decision from Arcjet based on the parameters defined above.
        const decision = await client.protect(ArcjetRequest);

        //clauses depending on the decision outcome
        if (decision.isDenied() && decision.reason.isBot()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Automated request are not allowed. '
            });
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Request blocked by security policy. '
            });
        }

        if (decision.isDenied() && decision.reason.isRateLimit()) {
            return res.status(403).json({
                error: 'To many requests',
                message //this message comes from the top, from RatelimitRate, dependint on wich role the user is authenticated with
            });
        }

        next()
    } catch (error) {
        console.error('Arcjet middleware error: ', error)
        res.status(500).json({ error: 'Internal server error', message: 'Something went wrong with security middleware' })
    }
}

export default securityMiddleware;
```
Now, invoke this middleware in the app.ts just below the json middleware, and before the routes.
```ts
import express from 'express';
import subjectRouter from './routes/subjects.routes'
import cors from 'cors'
import securityMiddleware from './middlewares/security'; // <- middleware imported

const app = express();
const PORT = process.env.PORT;

//cors middleware (mandar a una carpeta de middlewares)
if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is NOT set in the .env file');
}
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

//middleware for json forms and multiformat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(securityMiddleware);    // <- middleware added

app.use('/api/subjects', subjectRouter)

app.get('/', (req, res) => {
    res.send('Welcome, API running')
})

//mandar a services
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});

```
Push this implementation to a new branch on github
```bash
pwd 
cd server
git checkout #check the branch you are currently working
git checkout -b feat/security-with-arcjet
git add . 
git commit -m "ft: Security middleware from arcjet implemented"
git push --set-upstream origin feat/security-with-arcjet
``` 
## Displaying errors in the frontend side
This way, when users are being rate limited, they can know what is actually happening.

Go back to the client folfer project, and adress the data provider inside src

## Better auth 

Address the [better Auth](https://better-auth.com/docs/installation) installation page. 

```bash
pwd 
cd server
npm install better-auth
```
Follow the steps and copy the env variable, then create a new Better Auth instance, to do so, you may follow the suggestion made in the docs and create a new folder called utils and inside a new file called auth.ts

```bash
pwd 
cd src
mkdir utils
cd utils
touch auth.ts
code auth.ts
```
And start the instance as:
```ts
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    //...
});
```
Then, the next step is to configure the postgreSQL DB and the Drizzle ORM

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../services/db/index"; // your drizzle instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
});
```
Notice in this case the db tables have been already created, so the only authentications needed to set up are the email and password authentication methods whitin this file.

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../services/db/index"; // your drizzle instance

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    emailAndPassword:{
        enabled:true,
        
    }
});
```

In step 7 on docs says *"To handle API requests, you need to set up a route handler on your server."* Be sure to select propelly the express tab and read the disclamer, and copy the route.

Notice that the docs mention the use of {*any} as a wildcard, but if look out the [Express 5 docs](https://expressjs.com/en/guide/migrating-5/#reqparams) at the req.params, it says that the correct way is using `/*splat` (matching everypath without the rootpath) instead.

Set then the app.ts file as it follows:

```ts
import express from 'express';
import subjectRouter from './routes/subjects.routes'
import cors from 'cors'
import securityMiddleware from './middlewares/security';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth';

const app = express();
const PORT = process.env.PORT;

//cors middleware (mandar a una carpeta de middlewares)
if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is NOT set in the .env file');
}
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

app.all('/api/auth/*splat', toNodeHandler(auth));

//middleware for json forms and multiformat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(securityMiddleware);

app.use('/api/subjects', subjectRouter)

app.get('/', (req, res) => {
    res.send('Welcome, API running')
})

//mandar a services
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
```
At this point, the minimum setup for better auth is ready, but still missing the mention of the two custom field added to the user table (such as role and cloudinary ID). This way better auth will refer to auth.ts tables and add users. So go to auth.ts within the utils folder to configure it further.

Also, dont forget to import and define the schema from auth.ts from the schemas folder inside db folder. Otherwise it wont know these users actually exists.

```ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../services/db/index"; // your drizzle instance
import * as schema from "../services/db/schemas/auth"

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: [process.env.FRONTEND_URL!],
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: schema  // define the schema
    }),
    emailAndPassword: {
        enabled: true,

    },
    //CUSTOM FIELDS ADDED TO THE USER OBJECT
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: true,
                defaultValue: 'student',
                input: true,                //allows the role to be setted during registration
            },
            imageCldPubId: {
                type: 'string',
                required: false,            //Not necesary to put a image
                input: true,                //allows the role to be setted during registration
            }
        }
    }
});
```
What is the earning here. Saving the effor to writte JWT, handle token validations or handle sesions. Better auth do that.

Lets test it. Copy this json. 
```json
    {
        "name": "John Doe", // required
        "email": "john.doe@student.com", // required
        "password": "password1234", // required
        "rol": "student"
    }
```
Open Postman or any other APIclient you use. Now use this `localhost:3003/api/auth/sign-up/email` url with the POST method, select body, set it to raw and json, copy the json above and click on send. 

If everything its ok you should get an ok and status 200, with an response like this
```json
{
    "token": "<redacted-session-token>",
    "user": {
        "name": "John Doe",
        "email": "john.doe@student.com",
        "emailVerified": false,
        "image": null,
        "createdAt": "2026-06-12T01:23:15.676Z",
        "updatedAt": "2026-06-12T01:23:15.676Z",
        "role": "student",
        "id": "auH4uMKuoWfbNrlEYAvYgm5YqByZB1uQ"
    }
}
``` 

You can go to neonDB and confirme that, actually the Teacher Jhon Doe is now in the database

## Site 24/7, Application Performance Monitoring (APM)
Building an application is just half the job, users ussually "brake it" doing stuff you didn't plan, so monitoring in production is the other half:
* Performance Visibility
* Error tracking 
* Dependency Monitoring
* Resource usage
* Code-level insigth

Here is where APM come in, like 24/7, wich monitores:
* web services
* Servers
* cloud infrastructure
* APIs
* Applications 

(free trial of 30 days)

In the terminal type as comes for the package that will help to monitor the app's performance
```bash
pwd
cd server
npm install apminsight --save
```
Now in the root folder (server) create a new file called apminsightnode.json. Then go to your [24/7 panel](https://www.site24x7.com/app/client#/home/getting-started/add-options) and scroll down (left side) util the admin tab, click it, then go down again and click on to developer, then API key. Click show device key to get the API key. Copy the apy ken and place it whitin the json file you just created.

```json
{
    "licenseKey": "<your-licence-here>",
    "appName": "ClassRoom-backend",
    "port": 3005
}
```
Now address to the app.ts file, shut down the server (ctrl + c) and add as follow in the top lines of the file:
```ts
import AgentAPI from 'apminsight';      // <-- new import
AgentAPI.config();                      // <-- new instance from apm insgith package

import express from 'express';
import subjectRouter from './routes/subjects.routes'
import cors from 'cors'
import securityMiddleware from './middlewares/security';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth';

const app = express();
const PORT = process.env.PORT;

//cors middleware (mandar a una carpeta de middlewares)
if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL is NOT set in the .env file');
}

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}))

app.all('/api/auth/*splat', toNodeHandler(auth));

//middleware for json forms and multiformat
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(securityMiddleware);

app.use('/api/subjects', subjectRouter)

app.get('/', (req, res) => {
    res.send('Welcome, API running')
})

//mandar a services
app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});

```
Run the server again (npm run dev) you should note there is a new folder now, called apminsightdata, whitin there are other two folders; classRoom-backend (the name given to the project) and logs folder. 

lets push changes to github
```bash
git add . 
git commit -m "ft: apm services implemented with site24/7"
git push 
git status
```
Now, to be able to monitor the app, this should be shiped over to production (in other words, deploy it)

## Deploy service
Create an account on [Railway](https://railway.com) accept thir terms and conditions and link your repo with it, then select the repo where lives the project

Later on, enable RUM to monitoring the frontend as well 