/**
 * State Validation
 */
import { STATE_SCHEMA } from '../schemas/state-schema.js';

export class StateValidator {
    /**
     * Validate the entire state against the schema
     * @param {Object} state - The state to validate
     * @returns {Array} Array of validation errors, empty if valid
     */
    static validateState(state) {
        if (!state) {
            return ['State is required'];
        }

        const errors = [];
        const schema = STATE_SCHEMA;
        
        // Check for required top-level sections
        for (const [key, sectionSchema] of Object.entries(schema)) {
            // Handle nested objects like guildLogs
            if (sectionSchema.type === 'object') {
                if (!state[key]) {
                    if (sectionSchema.required) {
                        errors.push(`Missing required section: ${key}`);
                    }
                    continue;
                }
                
                // Validate object properties
                for (const [prop, propSchema] of Object.entries(sectionSchema.properties || {})) {
                    if (propSchema.required && !state[key][prop]) {
                        errors.push(`${key}.${prop} is required`);
                        continue;
                    }
                    
                    const propErrors = this.validateSection(state[key][prop], propSchema);
                    errors.push(...propErrors.map(err => `${key}.${prop}.${err}`));
                }
            } 
            // Handle arrays
            else if (sectionSchema.type === 'array') {
                if (!Array.isArray(state[key])) {
                    errors.push(`${key} must be an array`);
                    continue;
                }
                
                // Validate each item in the array
                state[key].forEach((item, index) => {
                    const itemErrors = this.validateObject(item, sectionSchema.items);
                    errors.push(...itemErrors.map(err => `${key}[${index}].${err}`));
                });
            }
        }
        
        return errors.filter(Boolean);
    }
    
    /**
     * Validate a section of the state
     * @param {*} data - The data to validate
     * @param {Object} schema - The schema to validate against
     * @returns {Array} Array of validation errors
     */
    static validateSection(data, schema) {
        if (!schema) return [];
        
        const errors = [];
        
        // Handle array types
        if (schema.type === 'array') {
            if (!Array.isArray(data)) {
                return ['Must be an array'];
            }
            
            if (schema.items) {
                data.forEach((item, index) => {
                    const itemErrors = this.validateObject(item, schema.items);
                    errors.push(...itemErrors.map(err => `[${index}].${err}`));
                });
            }
        } 
        // Handle object types
        else if (schema.type === 'object' && schema.properties) {
            const objErrors = this.validateObject(data, schema);
            errors.push(...objErrors);
        }
        // Handle primitive types
        else {
            const valueErrors = this.validateValue(data, schema);
            errors.push(...valueErrors);
        }
        
        return errors;
    }
    
    /**
     * Validate an object against a schema
     * @param {Object} obj - The object to validate
     * @param {Object} schema - The schema to validate against
     * @returns {Array} Array of validation errors
     */
    static validateObject(obj, schema) {
        if (typeof obj !== 'object' || obj === null) {
            return ['Must be an object'];
        }
        
        const errors = [];
        
        // Check required fields
        if (schema.required) {
            for (const field of schema.required) {
                if (obj[field] === undefined) {
                    errors.push(`${field} is required`);
                }
            }
        }
        
        // Validate each field
        for (const [field, fieldSchema] of Object.entries(schema.properties || {})) {
            const value = obj[field];
            const fieldErrors = this.validateValue(value, fieldSchema);
            
            if (fieldErrors.length > 0) {
                errors.push(`${field}: ${fieldErrors.join(', ')}`);
            }
        }
        
        return errors;
    }
    
    /**
     * Validate a single value against a schema
     * @param {*} value - The value to validate
     * @param {Object} schema - The schema to validate against
     * @returns {Array} Array of validation errors
     */
    static validateValue(value, schema) {
        const errors = [];
        
        // Handle null/undefined
        if (value === undefined || value === null) {
            if (schema.required) {
                errors.push('is required');
            }
            return errors;
        }
        
        // Check type
        if (schema.type) {
            const type = schema.type;
            let isValid = false;
            
            switch (type) {
                case 'string':
                    isValid = typeof value === 'string';
                    break;
                case 'number':
                    isValid = typeof value === 'number' && !isNaN(value);
                    if (isValid && 'minimum' in schema && value < schema.minimum) {
                        errors.push(`must be at least ${schema.minimum}`);
                    }
                    if (isValid && 'maximum' in schema && value > schema.maximum) {
                        errors.push(`must be at most ${schema.maximum}`);
                    }
                    break;
                case 'boolean':
                    isValid = typeof value === 'boolean';
                    break;
                case 'array':
                    isValid = Array.isArray(value);
                    break;
                case 'object':
                    isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
                    break;
                default:
                    isValid = typeof value === type;
            }
            
            if (!isValid) {
                errors.push(`must be of type ${type}`);
            }
        }
        
        // Check enum values
        if (schema.enum && !schema.enum.includes(value)) {
            errors.push(`must be one of: ${schema.enum.join(', ')}`);
        }
        
        // Check format (e.g., date-time, date)
        if (schema.format) {
            if (schema.format === 'date-time' && isNaN(Date.parse(value))) {
                errors.push('must be a valid ISO date-time string');
            } else if (schema.format === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                errors.push('must be a valid date string in YYYY-MM-DD format');
            }
        }
        
        // Check default value
        if (schema.default !== undefined && value === undefined) {
            // No need to add an error, just note that we'd use the default
        }
        
        return errors;
    }
}
