import { eq } from 'drizzle-orm';
import { db, pool } from './db/index.ts';
import { sports, sports_categories } from './db/schema/index.ts';

async function main() {
  try {
    console.log('Performing CRUD operations...');

    // CREATE: Insert a new sports category
    const [newCategory] = await db
      .insert(sports_categories)
      .values({ code: 'ball', name: 'Ball Sports', description: 'Sports involving balls' })
      .returning();

    if (!newCategory) {
      throw new Error('Failed to create category');
    }
    
    console.log('✅ CREATE: New category created:', newCategory);

    // CREATE: Insert a new sport
    const [newSport] = await db
      .insert(sports)
      .values({ 
        code: 'soccer', 
        name: 'Soccer', 
        description: 'The beautiful game',
        sports_category_id: newCategory.id 
      })
      .returning();

    if (!newSport) {
      throw new Error('Failed to create sport');
    }
    
    console.log('✅ CREATE: New sport created:', newSport);

    // READ: Select the sport
    const foundSport = await db.select().from(sports).where(eq(sports.id, newSport.id));
    console.log('✅ READ: Found sport:', foundSport[0]);

    // UPDATE: Change the sport's name
    const [updatedSport] = await db
      .update(sports)
      .set({ name: 'Football' })
      .where(eq(sports.id, newSport.id))
      .returning();
    
    if (!updatedSport) {
      throw new Error('Failed to update sport');
    }
    
    console.log('✅ UPDATE: Sport updated:', updatedSport);

    // DELETE: Remove the sport
    // await db.delete(sports).where(eq(sports.id, newSport.id));
    // console.log('✅ DELETE: Sport deleted.');

    // // DELETE: Remove the category
    // await db.delete(sports_categories).where(eq(sports_categories.id, newCategory.id));
    // console.log('✅ DELETE: Category deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    // Close the connection pool
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
