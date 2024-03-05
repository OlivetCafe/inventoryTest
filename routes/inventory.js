import { Router, query } from 'express';
import pg from 'pg';
import dotenv from 'dotenv';

const router = Router();
dotenv.config();

const dbConfig = {
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
};

const pool = new pg.Pool(dbConfig);

router.get('/', async (req, res) => {
  let client;
  try {
    client = await pool.connect();

    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 100;
    const page = req.query.page && !isNaN(parseInt(req.query.page, 10)) ? parseInt(req.query.page, 10) : 1;
    const offset = (page - 1) * pageSize;
    const filterValue = req.query.filter ? `%${req.query.filter.toUpperCase()}%` : '';

    const whereClause = filterValue ? `AND (nombre_articulo || nombre_linea || ingrediente_activo) ILIKE '%${filterValue}%'` : '';

    const result = await client.query(
      `SELECT * 
      FROM existencia
      WHERE 1=1 ${whereClause}
      ORDER BY 
        nombre_linea,
        nombre_articulo
      OFFSET $1 LIMIT $2`,
      [offset, pageSize]
    );

    const nextPageUrl = result.length === pageSize ? `/inventarios?page=${page + 1}&filter=${req.query.filter}&pageSize=${pageSize}` : null;
    const prevPageUrl = page > 1 ? `/inventarios?page=${page - 1}&filter=${req.query.filter}&pageSize=${pageSize}` : null;

    res.render('index.ejs', {
      data: result.rows,
      pageSize,
      nextPageUrl,
      prevPageUrl,
      filterValue: req.query.filter,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  } finally {
    if (client) {
      client.release();
    }
  }
});

export default router;