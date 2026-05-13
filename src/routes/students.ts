import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import express from 'express';
import { students } from '../db/schema/app.ts';
import { db } from '../db/index.ts';
import { user } from '../db/schema/auth.ts';

const router = express.Router();

// Get all students with filtering, search and pagination
router.get('/', async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100); // Max limit of 100 records per page

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                )
            )
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(students)
            .leftJoin(user, eq(students.userId, user.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const studentsList = await db
            .select({
                ...getTableColumns(students),
                user: { ...getTableColumns(user) },
            })
            .from(students)
            .leftJoin(user, eq(students.userId, user.id))
            .where(whereClause)
            .orderBy(desc(students.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: studentsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });

    } catch (error) {
        console.error(`GET /students error: ${error}`);
        res.status(500).json({ error: 'Failed to get students' });
    }
});

export default router;