import express from 'express'
import * as Path from 'node:path'
import codingHabits from './routes/codingHabit.ts'
import connection from './db/connection.ts'

import waterRoutes from './routes/waterroutes.ts'
import knex from 'knex'
import habitRoutes from './routes/add-habit-routes.ts'

const server = express()

server.use(express.json())

server.use('/api/v1/watertracker', waterRoutes)
server.use('/api/v1/coding-habit', codingHabits)
server.use('/api/v1/habits', habitRoutes)


// Add Api routes here

server.post('/users', async (req, res) => {
  const { name, targetSleepHours, targetSleepMinutes } = req.body;

  if (!name || targetSleepHours == null || targetSleepMinutes == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const targetSleep = (targetSleepHours * 60) + targetSleepMinutes;

  try {
    const [userId] = await connection('users').insert({
      name,
      target_sleep: targetSleep,
    })

    res.status(201).json({ id: userId, name, targetSleep });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// POST /sleep-records
server.post('/sleep-records', async (req, res) => {
  const { userId, sleepDate, sleepStart, sleepEnd, rested } = req.body;

  if (!userId || !sleepDate || !sleepStart || !sleepEnd || rested == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await connection('sleep_records').insert({
      user_id: userId,
      sleep_date: sleepDate,
      sleep_start: sleepStart,
      sleep_end: sleepEnd,
      rested: true,
    });

    res.status(201).json({ message: 'Sleep record added' });
  } catch (error) {
    console.error('Error adding sleep record:', error)
    res.status(500).json({ message: 'Error adding sleep record', error });
  }
});

server.get('/check-schema', async (req, res) => {
  try {
    const columns = await connection('users')
    res.status(200).json(columns);
  } catch (error) {
    res.status(500).json({ message: 'Error checking schema', error });
  }
});

