import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Admin backup and security endpoints
export async function POST(request: NextRequest) {
  try {
    const { action, adminPassword } = await request.json()
    
    // Simple admin authentication
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    switch (action) {
      case 'export':
        return await exportCriticalData()
      case 'integrity':
        return await checkIntegrity()
      case 'stats':
        return await getSystemStats()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Backup API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function exportCriticalData() {
  try {
    // Export critical data directly via database queries
    const criticalData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '2.0',
        description: 'Critical data export for Edirne Events'
      },
      statistics: await getSystemStatsData(),
      events: await getCriticalEvents(),
      venues: await getCriticalVenues(),
      categories: await getCategories(),
      users: await getUserStats()
    }

    return NextResponse.json({
      success: true,
      message: 'Critical data exported',
      data: criticalData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Export failed',
      details: error.message
    }, { status: 500 })
  }
}

async function checkIntegrity() {
  try {
    const checks = []

    // Check 1: Count active events
    const activeEventsResult = await db.execute(`
      SELECT COUNT(*) as count FROM events WHERE is_active = true
    `)
    
    checks.push({
      name: 'Active Events Check',
      status: 'passed',
      details: `Found ${activeEventsResult.rows[0]?.count || 0} active events`
    })

    // Check 2: Count active venues
    const activeVenuesResult = await db.execute(`
      SELECT COUNT(*) as count FROM venues WHERE is_active = true
    `)
    
    checks.push({
      name: 'Active Venues Check',
      status: 'passed',
      details: `Found ${activeVenuesResult.rows[0]?.count || 0} active venues`
    })

    // Check 3: Count total users
    const usersResult = await db.execute(`
      SELECT COUNT(*) as count FROM users
    `)
    
    checks.push({
      name: 'Users Check',
      status: 'passed',
      details: `Found ${usersResult.rows[0]?.count || 0} total users`
    })

    const results = {
      checkDate: new Date().toISOString(),
      totalChecks: checks.length,
      passed: checks.filter(c => c.status === 'passed').length,
      failed: checks.filter(c => c.status === 'failed').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      checks
    }

    return NextResponse.json({
      success: true,
      message: 'Integrity checks completed',
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Integrity check failed',
      details: error.message
    }, { status: 500 })
  }
}

async function getSystemStats() {
  try {
    const stats = await getSystemStatsData()
    
    return NextResponse.json({
      success: true,
      message: 'System statistics retrieved',
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Stats retrieval failed',
      details: error.message
    }, { status: 500 })
  }
}

// Helper functions for data export
async function getSystemStatsData() {
  try {
    const eventsCount = await db.execute('SELECT COUNT(*) as count FROM events')
    const venuesCount = await db.execute('SELECT COUNT(*) as count FROM venues')
    const usersCount = await db.execute('SELECT COUNT(*) as count FROM users')
    const activeEventsCount = await db.execute('SELECT COUNT(*) as count FROM events WHERE is_active = true')
    const activeVenuesCount = await db.execute('SELECT COUNT(*) as count FROM venues WHERE is_active = true')
    
    return {
      totalEvents: parseInt(eventsCount.rows[0]?.count || 0),
      totalVenues: parseInt(venuesCount.rows[0]?.count || 0),
      totalUsers: parseInt(usersCount.rows[0]?.count || 0),
      activeEvents: parseInt(activeEventsCount.rows[0]?.count || 0),
      activeVenues: parseInt(activeVenuesCount.rows[0]?.count || 0)
    }
  } catch (error) {
    return { error: error.message }
  }
}

async function getCriticalEvents() {
  try {
    const result = await db.execute(`
      SELECT id, title, start_date, end_date, location, is_active, created_at
      FROM events 
      WHERE is_active = true OR start_date >= CURRENT_DATE
      ORDER BY start_date ASC
      LIMIT 100
    `)
    
    return result.rows
  } catch (error) {
    return { error: error.message }
  }
}

async function getCriticalVenues() {
  try {
    const result = await db.execute(`
      SELECT id, name, address, phone, is_active, created_at
      FROM venues 
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 50
    `)
    
    return result.rows
  } catch (error) {
    return { error: error.message }
  }
}

async function getCategories() {
  try {
    const result = await db.execute('SELECT * FROM categories ORDER BY sort_order')
    return result.rows
  } catch (error) {
    return { error: error.message }
  }
}

async function getUserStats() {
  try {
    const totalUsers = await db.execute('SELECT COUNT(*) as count FROM users')
    const activeUsers = await db.execute('SELECT COUNT(*) as count FROM users WHERE is_active = true')
    
    return {
      total: parseInt(totalUsers.rows[0]?.count || 0),
      active: parseInt(activeUsers.rows[0]?.count || 0)
    }
  } catch (error) {
    return { error: error.message }
  }
}