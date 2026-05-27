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
            const deptPattern = `%${String(department).replace(/[\\%_]/g, '\\$&')}%`;;
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