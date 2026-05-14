import { asc, getTableColumns } from 'drizzle-orm';
import express from 'express';
import { sports_categories } from '../db/schema/index.ts';
import { db } from '../db/index.ts';

const router = express.Router();

// Get all sports_categories in ascending order of name
router.get('/', async (req, res) => {
    try {
        const sportsCategoriesList = await db
            .select({
                ...getTableColumns(sports_categories),
            })
            .from(sports_categories)
            .orderBy(asc(sports_categories.name));

        res.status(200).json({
            data: sportsCategoriesList,
        });

    } catch (error) {
        console.error(`GET /sports_categories error: ${error}`);
        res.status(500).json({ error: 'Failed to get sports categories' });
    }
});

export default router;