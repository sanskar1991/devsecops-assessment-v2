import { Router } from 'express';
import { Item } from '../models/Item.js';

const router = Router();

// Create
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });
    const doc = await Item.create({ name, description });
    res.status(201).json(doc);
  } catch (err) { next(err); }
});

// Read all
router.get('/', async (_req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) { next(err); }
});

// Read one
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Item.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json(doc);
  } catch (err) { next(err); }
});

// Update
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    const doc = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name }), ...(description && { description }) } },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json(doc);
  } catch (err) { next(err); }
});

// Delete
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Item.findByIdAndDelete(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
