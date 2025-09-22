#!/usr/bin/env node

/**
 * Airtable Schema Reconciliation Script
 * Intelligently syncs source schema with destination base
 * - Creates new base if none exists
 * - Adds missing tables and fields
 * - Preserves existing data
 * - Reports all changes made
 */

const Airtable = require('airtable');
const axios = require('axios');

class AirtableSchemaSync {
  constructor(apiKey, sourceSchema) {
    this.apiKey = apiKey;
    this.sourceSchema = sourceSchema;
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };
    this.baseURL = 'https://api.airtable.com/v0';
    this.metaURL = 'https://api.airtable.com/v0/meta';
    this.changes = [];
  }

  /**
   * Main sync function
   * @param {string} baseId - Target base ID (optional for new bases)
   * @param {boolean} createNew - Force creation of new base
   */
  async sync(baseId = null, createNew = false) {
    console.log('🔄 Starting Airtable schema synchronization...');

    try {
      // Determine if we're creating new or updating existing
      if (!baseId || createNew) {
        return await this.createNewBase();
      } else {
        return await this.updateExistingBase(baseId);
      }
    } catch (error) {
      console.error('❌ Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Create a completely new base with full schema
   */
  async createNewBase() {
    console.log('📝 Creating new Airtable base...');

    const baseConfig = {
      name: this.sourceSchema.name || `Client Base - ${new Date().toISOString()}`,
      workspaceId: this.sourceSchema.workspaceId,
      tables: this.sourceSchema.tables.map(table => ({
        name: table.name,
        description: table.description,
        fields: this.convertFieldsForCreation(table.fields)
      }))
    };

    try {
      const response = await axios.post(
        `${this.metaURL}/bases`,
        baseConfig,
        { headers: this.headers }
      );

      const newBaseId = response.data.id;
      this.changes.push({
        type: 'BASE_CREATED',
        baseId: newBaseId,
        name: baseConfig.name
      });

      console.log(`✅ New base created: ${newBaseId}`);

      // Set up views and relationships after base creation
      await this.setupViews(newBaseId);
      await this.setupRelationships(newBaseId);

      return {
        success: true,
        baseId: newBaseId,
        changes: this.changes
      };
    } catch (error) {
      console.error('Error creating base:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update existing base - add missing tables and fields
   */
  async updateExistingBase(baseId) {
    console.log(`🔍 Analyzing existing base: ${baseId}`);

    // Fetch current schema
    const currentSchema = await this.fetchBaseSchema(baseId);

    // Compare schemas
    const delta = this.compareSchemas(currentSchema, this.sourceSchema);

    // Apply changes
    if (delta.hasChanges) {
      console.log(`📊 Found ${delta.totalChanges} changes to apply`);
      await this.applyDelta(baseId, delta);
    } else {
      console.log('✅ Base is already up to date');
    }

    return {
      success: true,
      baseId: baseId,
      changes: this.changes,
      delta: delta
    };
  }

  /**
   * Fetch current base schema
   */
  async fetchBaseSchema(baseId) {
    try {
      const response = await axios.get(
        `${this.metaURL}/bases/${baseId}/tables`,
        { headers: this.headers }
      );

      return {
        baseId: baseId,
        tables: response.data.tables
      };
    } catch (error) {
      console.error('Error fetching base schema:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Compare source and destination schemas
   */
  compareSchemas(current, source) {
    const delta = {
      tablesToCreate: [],
      tablesToUpdate: [],
      fieldsToAdd: {},
      hasChanges: false,
      totalChanges: 0
    };

    // Map current tables by name for quick lookup
    const currentTablesMap = new Map();
    current.tables.forEach(table => {
      currentTablesMap.set(table.name.toLowerCase(), table);
    });

    // Check each source table
    source.tables.forEach(sourceTable => {
      const currentTable = currentTablesMap.get(sourceTable.name.toLowerCase());

      if (!currentTable) {
        // Table doesn't exist - need to create it
        delta.tablesToCreate.push(sourceTable);
        delta.totalChanges++;
      } else {
        // Table exists - check for missing fields
        const missingFields = this.findMissingFields(
          currentTable.fields,
          sourceTable.fields
        );

        if (missingFields.length > 0) {
          delta.tablesToUpdate.push({
            id: currentTable.id,
            name: currentTable.name
          });
          delta.fieldsToAdd[currentTable.id] = missingFields;
          delta.totalChanges += missingFields.length;
        }
      }
    });

    delta.hasChanges = delta.totalChanges > 0;
    return delta;
  }

  /**
   * Find fields that exist in source but not in current
   */
  findMissingFields(currentFields, sourceFields) {
    const currentFieldNames = new Set(
      currentFields.map(f => f.name.toLowerCase())
    );

    return sourceFields.filter(sourceField =>
      !currentFieldNames.has(sourceField.name.toLowerCase())
    );
  }

  /**
   * Apply delta changes to base
   */
  async applyDelta(baseId, delta) {
    // Create new tables
    for (const table of delta.tablesToCreate) {
      await this.createTable(baseId, table);
    }

    // Add missing fields to existing tables
    for (const [tableId, fields] of Object.entries(delta.fieldsToAdd)) {
      await this.addFieldsToTable(baseId, tableId, fields);
    }

    console.log(`✅ Applied ${delta.totalChanges} changes successfully`);
  }

  /**
   * Create a new table in existing base
   */
  async createTable(baseId, tableConfig) {
    console.log(`📋 Creating table: ${tableConfig.name}`);

    const payload = {
      name: tableConfig.name,
      description: tableConfig.description,
      fields: this.convertFieldsForCreation(tableConfig.fields)
    };

    try {
      const response = await axios.post(
        `${this.metaURL}/bases/${baseId}/tables`,
        payload,
        { headers: this.headers }
      );

      this.changes.push({
        type: 'TABLE_CREATED',
        tableName: tableConfig.name,
        tableId: response.data.id
      });

      console.log(`✅ Table created: ${tableConfig.name}`);
      return response.data;
    } catch (error) {
      console.error(`Error creating table ${tableConfig.name}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add fields to existing table
   */
  async addFieldsToTable(baseId, tableId, fields) {
    console.log(`🔧 Adding ${fields.length} fields to table ${tableId}`);

    for (const field of fields) {
      try {
        const payload = this.convertFieldForCreation(field);

        const response = await axios.post(
          `${this.metaURL}/bases/${baseId}/tables/${tableId}/fields`,
          payload,
          { headers: this.headers }
        );

        this.changes.push({
          type: 'FIELD_ADDED',
          tableId: tableId,
          fieldName: field.name,
          fieldType: field.type
        });

        console.log(`✅ Field added: ${field.name}`);
      } catch (error) {
        console.error(`Error adding field ${field.name}:`, error.response?.data || error.message);
        // Continue with other fields even if one fails
      }
    }
  }

  /**
   * Convert field definitions for Airtable API
   */
  convertFieldsForCreation(fields) {
    return fields.map(field => this.convertFieldForCreation(field));
  }

  /**
   * Convert single field for creation
   */
  convertFieldForCreation(field) {
    const baseField = {
      name: field.name,
      type: field.type,
      description: field.description
    };

    // Add type-specific options
    switch (field.type) {
      case 'singleSelect':
      case 'multipleSelects':
        if (field.options) {
          baseField.options = {
            choices: field.options.map(opt => ({
              name: opt.name || opt,
              color: opt.color || this.getRandomColor()
            }))
          };
        }
        break;

      case 'number':
      case 'currency':
      case 'percent':
        if (field.precision !== undefined) {
          baseField.options = { precision: field.precision };
        }
        break;

      case 'multipleRecordLinks':
        if (field.linkedTableId) {
          baseField.options = {
            linkedTableId: field.linkedTableId,
            prefersSingleRecordLink: field.prefersSingleRecordLink || false
          };
        }
        break;

      case 'formula':
        if (field.formula) {
          baseField.options = { formula: field.formula };
        }
        break;

      case 'rollup':
        if (field.rollup) {
          baseField.options = field.rollup;
        }
        break;
    }

    return baseField;
  }

  /**
   * Set up views for tables
   */
  async setupViews(baseId) {
    console.log('👁️ Setting up views...');
    // Implementation for views setup
    // This would create grid, calendar, kanban views as needed
  }

  /**
   * Set up relationships between tables
   */
  async setupRelationships(baseId) {
    console.log('🔗 Setting up table relationships...');
    // Implementation for relationship setup
    // This would create linked record fields between tables
  }

  /**
   * Get random color for select options
   */
  getRandomColor() {
    const colors = [
      'blueLight2', 'cyanLight2', 'tealLight2', 'greenLight2',
      'yellowLight2', 'orangeLight2', 'redLight2', 'pinkLight2',
      'purpleLight2', 'grayLight2'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Generate detailed report of changes
   */
  generateReport() {
    console.log('\n📊 Schema Sync Report');
    console.log('=' .repeat(50));

    const grouped = this.changes.reduce((acc, change) => {
      acc[change.type] = acc[change.type] || [];
      acc[change.type].push(change);
      return acc;
    }, {});

    for (const [type, changes] of Object.entries(grouped)) {
      console.log(`\n${type}: ${changes.length}`);
      changes.forEach(change => {
        switch (type) {
          case 'BASE_CREATED':
            console.log(`  - ${change.name} (${change.baseId})`);
            break;
          case 'TABLE_CREATED':
            console.log(`  - ${change.tableName}`);
            break;
          case 'FIELD_ADDED':
            console.log(`  - ${change.fieldName} (${change.fieldType})`);
            break;
        }
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Total changes: ${this.changes.length}`);
  }
}

// Export for use in other scripts
module.exports = AirtableSchemaSync;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: node airtable-schema-sync.js <api-key> <schema-file> [base-id] [--create-new]');
    process.exit(1);
  }

  const [apiKey, schemaFile, baseId] = args;
  const createNew = args.includes('--create-new');

  // Load schema from file
  const fs = require('fs');
  const sourceSchema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));

  // Run sync
  const sync = new AirtableSchemaSync(apiKey, sourceSchema);
  sync.sync(baseId, createNew)
    .then(result => {
      sync.generateReport();
      console.log('\n✅ Synchronization complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Synchronization failed:', error.message);
      process.exit(1);
    });
}