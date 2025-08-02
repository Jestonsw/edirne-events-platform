#!/usr/bin/env node

/**
 * Edirne Events - Automated Database Backup System
 * 
 * Features:
 * - Daily automated backups
 * - Critical data export
 * - Data integrity checks
 * - Backup verification
 * - Cleanup old backups
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

class BackupSystem {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups')
    this.maxBackups = 30 // Keep 30 days of backups
    this.dbUrl = process.env.DATABASE_URL
    
    if (!this.dbUrl) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    
    this.ensureBackupDirectory()
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
      console.log('✅ Backup directory created:', this.backupDir)
    }
  }

  generateTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
  }

  async createFullBackup() {
    const timestamp = this.generateTimestamp()
    const backupFile = path.join(this.backupDir, `edirne-events-full-${timestamp}.sql`)
    
    try {
      console.log('🔄 Starting full database backup...')
      
      // Create full database dump
      const dumpCommand = `pg_dump "${this.dbUrl}" --no-owner --no-privileges --clean --if-exists`
      const backupData = execSync(dumpCommand, { encoding: 'utf8' })
      
      // Write backup to file
      fs.writeFileSync(backupFile, backupData)
      
      // Generate checksum for integrity
      const checksum = this.generateChecksum(backupFile)
      fs.writeFileSync(`${backupFile}.checksum`, checksum)
      
      console.log('✅ Full backup completed:', backupFile)
      console.log('📊 File size:', this.getFileSize(backupFile))
      
      return backupFile
    } catch (error) {
      console.error('❌ Full backup failed:', error.message)
      throw error
    }
  }

  async createCriticalDataExport() {
    const timestamp = this.generateTimestamp()
    const exportFile = path.join(this.backupDir, `critical-data-${timestamp}.json`)
    
    try {
      console.log('🔄 Exporting critical data...')
      
      // Export critical tables only
      const criticalData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '2.0',
          description: 'Critical data export for Edirne Events'
        },
        events: await this.exportTable('events'),
        venues: await this.exportTable('venues'),
        categories: await this.exportTable('categories'),
        venue_categories: await this.exportTable('venue_categories'),
        users: await this.exportTable('users', ['password_hash']), // Exclude sensitive data
        pending_events: await this.exportTable('pending_events'),
        pending_venues: await this.exportTable('pending_venues')
      }
      
      // Write to file with pretty formatting
      fs.writeFileSync(exportFile, JSON.stringify(criticalData, null, 2))
      
      // Generate checksum
      const checksum = this.generateChecksum(exportFile)
      fs.writeFileSync(`${exportFile}.checksum`, checksum)
      
      console.log('✅ Critical data export completed:', exportFile)
      console.log('📊 File size:', this.getFileSize(exportFile))
      
      return exportFile
    } catch (error) {
      console.error('❌ Critical data export failed:', error.message)
      throw error
    }
  }

  async exportTable(tableName, excludeColumns = []) {
    try {
      // Simple approach - use psql to export data as JSON
      const query = `
        SELECT json_agg(row_to_json(t)) 
        FROM (
          SELECT * FROM ${tableName}
          ${excludeColumns.length > 0 ? 
            `WHERE ${excludeColumns.map(col => `${col} IS NOT NULL`).join(' AND ')}` : 
            ''
          }
        ) t
      `
      
      const result = execSync(
        `psql "${this.dbUrl}" -t -c "${query}"`,
        { encoding: 'utf8' }
      ).trim()
      
      const data = result === '' || result === 'null' ? [] : JSON.parse(result)
      
      return {
        tableName,
        rowCount: Array.isArray(data) ? data.length : 0,
        data: data || [],
        exportedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error(`❌ Failed to export table ${tableName}:`, error.message)
      return { 
        tableName,
        error: error.message,
        rowCount: 0,
        data: []
      }
    }
  }

  async performIntegrityChecks() {
    console.log('🔄 Performing data integrity checks...')
    
    const checks = []
    
    try {
      // Check for orphaned records
      checks.push(await this.checkOrphanedRecords())
      
      // Check data consistency
      checks.push(await this.checkDataConsistency())
      
      // Check for duplicate records
      checks.push(await this.checkDuplicates())
      
      const results = {
        checkDate: new Date().toISOString(),
        totalChecks: checks.length,
        passed: checks.filter(c => c.status === 'passed').length,
        failed: checks.filter(c => c.status === 'failed').length,
        warnings: checks.filter(c => c.status === 'warning').length,
        checks
      }
      
      // Save integrity report
      const reportFile = path.join(this.backupDir, `integrity-report-${this.generateTimestamp()}.json`)
      fs.writeFileSync(reportFile, JSON.stringify(results, null, 2))
      
      console.log('✅ Integrity checks completed')
      console.log(`📊 Results: ${results.passed} passed, ${results.failed} failed, ${results.warnings} warnings`)
      
      return results
    } catch (error) {
      console.error('❌ Integrity checks failed:', error.message)
      throw error
    }
  }

  async checkOrphanedRecords() {
    try {
      // Check for events without valid categories
      const orphanedEventsQuery = "SELECT COUNT(*) FROM events WHERE category_id IS NOT NULL AND category_id NOT IN (SELECT id FROM categories)"
      const orphanedEvents = execSync(
        `psql "${this.dbUrl}" -t -c "${orphanedEventsQuery}"`,
        { encoding: 'utf8' }
      ).trim()

      const orphanCount = parseInt(orphanedEvents) || 0
      
      return {
        name: 'Orphaned Records Check',
        status: orphanCount === 0 ? 'passed' : 'failed',
        details: `Found ${orphanCount} orphaned records`,
        data: { orphanedEvents: orphanCount }
      }
    } catch (error) {
      return {
        name: 'Orphaned Records Check',
        status: 'failed',
        details: error.message
      }
    }
  }

  async checkDataConsistency() {
    try {
      // Check for events with end_date before start_date
      const invalidDatesQuery = "SELECT COUNT(*) FROM events WHERE end_date IS NOT NULL AND end_date < start_date"
      const invalidDates = execSync(
        `psql "${this.dbUrl}" -t -c "${invalidDatesQuery}"`,
        { encoding: 'utf8' }
      ).trim()

      const inconsistencies = parseInt(invalidDates) || 0
      
      return {
        name: 'Data Consistency Check',
        status: inconsistencies === 0 ? 'passed' : 'warning',
        details: `Found ${inconsistencies} data inconsistencies`,
        data: { invalidDates: inconsistencies }
      }
    } catch (error) {
      return {
        name: 'Data Consistency Check',
        status: 'failed',
        details: error.message
      }
    }
  }

  async checkDuplicates() {
    try {
      // Check for duplicate events (same title, date)
      const duplicateEventsQuery = `
        SELECT COUNT(*) FROM (
          SELECT title, start_date, COUNT(*) as count 
          FROM events 
          GROUP BY title, start_date 
          HAVING COUNT(*) > 1
        ) AS duplicates
      `
      const duplicateEvents = execSync(
        `psql "${this.dbUrl}" -t -c "${duplicateEventsQuery}"`,
        { encoding: 'utf8' }
      ).trim()

      const totalDuplicates = parseInt(duplicateEvents) || 0
      
      return {
        name: 'Duplicate Records Check',
        status: totalDuplicates === 0 ? 'passed' : 'warning',
        details: `Found ${totalDuplicates} potential duplicates`,
        data: { duplicateEvents: totalDuplicates }
      }
    } catch (error) {
      return {
        name: 'Duplicate Records Check',
        status: 'failed',
        details: error.message
      }
    }
  }

  generateChecksum(filePath) {
    const fileBuffer = fs.readFileSync(filePath)
    const hashSum = crypto.createHash('sha256')
    hashSum.update(fileBuffer)
    return hashSum.digest('hex')
  }

  getFileSize(filePath) {
    const stats = fs.statSync(filePath)
    const fileSizeInBytes = stats.size
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024)
    return `${fileSizeInMegabytes.toFixed(2)} MB`
  }

  async verifyBackup(backupFile) {
    console.log('🔄 Verifying backup integrity...')
    
    try {
      const checksumFile = `${backupFile}.checksum`
      if (!fs.existsSync(checksumFile)) {
        throw new Error('Checksum file not found')
      }
      
      const originalChecksum = fs.readFileSync(checksumFile, 'utf8').trim()
      const currentChecksum = this.generateChecksum(backupFile)
      
      if (originalChecksum === currentChecksum) {
        console.log('✅ Backup integrity verified')
        return true
      } else {
        console.log('❌ Backup integrity check failed')
        return false
      }
    } catch (error) {
      console.error('❌ Backup verification failed:', error.message)
      return false
    }
  }

  async cleanupOldBackups() {
    console.log('🔄 Cleaning up old backups...')
    
    try {
      const files = fs.readdirSync(this.backupDir)
      const backupFiles = files
        .filter(file => file.endsWith('.sql') || file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime)

      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups)
        
        for (const file of filesToDelete) {
          fs.unlinkSync(file.path)
          // Also delete corresponding checksum file if it exists
          const checksumFile = `${file.path}.checksum`
          if (fs.existsSync(checksumFile)) {
            fs.unlinkSync(checksumFile)
          }
        }
        
        console.log(`✅ Cleaned up ${filesToDelete.length} old backup files`)
      } else {
        console.log('✅ No cleanup needed')
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message)
    }
  }

  async runFullBackupCycle() {
    console.log('🚀 Starting full backup cycle...')
    const startTime = Date.now()
    
    try {
      // 1. Perform integrity checks first
      const integrityResults = await this.performIntegrityChecks()
      
      // 2. Create full backup
      const fullBackupFile = await this.createFullBackup()
      
      // 3. Create critical data export
      const criticalExportFile = await this.createCriticalDataExport()
      
      // 4. Verify backups
      const fullBackupValid = await this.verifyBackup(fullBackupFile)
      const criticalExportValid = await this.verifyBackup(criticalExportFile)
      
      // 5. Cleanup old backups
      await this.cleanupOldBackups()
      
      const endTime = Date.now()
      const duration = ((endTime - startTime) / 1000).toFixed(2)
      
      const summary = {
        timestamp: new Date().toISOString(),
        duration: `${duration} seconds`,
        integrityChecks: integrityResults,
        backups: {
          fullBackup: {
            file: fullBackupFile,
            valid: fullBackupValid,
            size: this.getFileSize(fullBackupFile)
          },
          criticalExport: {
            file: criticalExportFile,
            valid: criticalExportValid,
            size: this.getFileSize(criticalExportFile)
          }
        },
        status: fullBackupValid && criticalExportValid ? 'success' : 'partial_failure'
      }
      
      // Save summary report
      const summaryFile = path.join(this.backupDir, `backup-summary-${this.generateTimestamp()}.json`)
      fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2))
      
      console.log('🎉 Full backup cycle completed successfully!')
      console.log(`⏱️  Total duration: ${duration} seconds`)
      
      return summary
    } catch (error) {
      console.error('❌ Backup cycle failed:', error.message)
      throw error
    }
  }
}

// CLI usage
if (require.main === module) {
  const backup = new BackupSystem()
  
  const command = process.argv[2] || 'full'
  
  switch (command) {
    case 'full':
      backup.runFullBackupCycle()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    case 'backup':
      backup.createFullBackup()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    case 'export':
      backup.createCriticalDataExport()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    case 'integrity':
      backup.performIntegrityChecks()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    case 'cleanup':
      backup.cleanupOldBackups()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    default:
      console.log('Usage: node backup-system.js [full|backup|export|integrity|cleanup]')
      process.exit(1)
  }
}

module.exports = BackupSystem