import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import express from 'express';
import { user } from '../db/schema/index.ts';
import { db } from '../db/index.ts';

const router = express.Router();

// Get all users with filtering, search and pagination
router.get('/', async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100); // Max limit of 100 records per page

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`),
                )
            )
        }

        const normalizedRole = typeof role === 'string' ? role.trim() : '';
        if (normalizedRole.length > 0) {
            filterConditions.push(
                ilike(user.role, `%${normalizedRole}%`)
            );
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(user)
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const usersList = await db
            .select({
                ...getTableColumns(user),
            })
            .from(user)
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: usersList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });

    } catch (error) {
        console.error(`GET /users error: ${error}`);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, role, image, imageCldPubId } = req.body;

        const [createdUser] = await db
            .insert(user)
            .values({ id: randomUUID(), name, email, emailVerified: false, role, image, imageCldPubId })
            .returning({ id: user.id });

        if(!createdUser) throw new Error('Failed to create user');

        res.status(201).json({ data: createdUser });
    } catch (e) {
        console.error(`POST /users error: ${e}`);
        res.status(500).json({ error: e });
    }
});

// Get single user by ID
router.get('/:id', async (req, res) => {
    const userId = req.params.id;

    if(!userId) return res.status(400).json({ error: 'No User Id found.' });

    const [userDetails] = await db
        .select({
            ...getTableColumns(user),
        })
        .from(user)
        .where(eq(user.id, userId));

    if(!userDetails) return res.status(404).json({ error: 'No User found.' });

    res.status(200).json({ data: userDetails });
});

export default router;