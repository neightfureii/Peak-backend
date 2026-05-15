import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import express from 'express';
import { sports, sports_categories } from '../db/schema/index.ts';
import { db } from '../db/index.ts';

const router = express.Router();

// Get all sports with filtering, search and pagination
router.get('/', async (req, res) => {
    try {
        const { search, sports_category, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100); // Max limit of 100 records per page

        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(sports.name, `%${search}%`),
                    ilike(sports.code, `%${search}%`),
                )
            )
        }

        if (sports_category) {
            filterConditions.push(
                ilike(sports_categories.name, `%${sports_category}%`)
            )
        }

        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(sports)
            .leftJoin(sports_categories, eq(sports.categoryId, sports_categories.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const sportsList = await db
            .select({
                ...getTableColumns(sports),
                sports_category: { ...getTableColumns(sports_categories) },
            })
            .from(sports)
            .leftJoin(sports_categories, eq(sports.categoryId, sports_categories.id))
            .where(whereClause)
            .orderBy(desc(sports.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: sportsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });

    } catch (error) {
        console.error(`GET /sports error: ${error}`);
        res.status(500).json({ error: 'Failed to get sports' });
    }
});

// Create new sport
router.post('/', async (req, res) => {
    try {
        const { name, code, categoryId, description, bannerUrl, bannerCldPubId } = req.body;

        const [createdSport] = await db
            .insert(sports)
            .values({ name, code, categoryId, description, bannerUrl, bannerCldPubId })
            .returning({ id: sports.id });

        if(!createdSport) throw new Error('Failed to create sport');

        res.status(201).json({ data: createdSport });
    } catch (e) {
        console.error(`POST /sports error: ${e}`);
        res.status(500).json({ error: e });
    }
});

// Get single sport by ID
router.get('/:id', async (req, res) => {
    const sportId = req.params.id;

    if(!sportId) return res.status(400).json({ error: 'No Sport Id found.' });

    const [sportDetails] = await db
        .select({
            ...getTableColumns(sports),
            sports_category: {
                ...getTableColumns(sports_categories),
            },
        })
        .from(sports)
        .leftJoin(sports_categories, eq(sports.categoryId, sports_categories.id))
        .where(eq(sports.id, sportId));

    if(!sportDetails) return res.status(404).json({ error: 'No Sport found.' });

    res.status(200).json({ data: sportDetails });
});

export default router;