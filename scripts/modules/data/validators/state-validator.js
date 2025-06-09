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
        const errors = [];
        const schema = STATE_SCHEMA;
        
        for (const [key, sectionSchema] of Object.entries(schema)) {
            if (sectionSchema.required && !state[key]) {
                errors.push(`Missing required section: ${key}`);
                continue;
            }
            
            const sectionErrors = this.validateSection(state[key], sectionSchema);
            errors.push(...sectionErrors.map(err => `${key}.${err}`));
        }
        
        return errors;
    }
    
    /**
     * Validate a section of the state
     * @param {*} data - The data to validate
     * @param {Object} schema - The schema to validate against
     * @returns {Array} Array of validation errors
     */
    static validateSection(data, schema) {
        if (!data) return ['Data is required'];
        
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
        else if (schema.type === 'object') {
            const objErrors = this.validateObject(data, schema);
            errors.push(...objErrors);
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
        if (schema.type && typeof value !== schema.type) {
            errors.push(`must be of type ${schema.type}`);
        }
        
        // Check enum values
        if (schema.enum && !schema.enum.includes(value)) {
            errors.push(`must be one of: ${schema.enum.join(', ')}`);
        }
        
        // Check format (e.g., date-time)
        if (schema.format === 'date-time' && isNaN(Date.parse(value))) {
            errors.push('must be a valid date-time string');
        }
        
        return errors;
    }
}
