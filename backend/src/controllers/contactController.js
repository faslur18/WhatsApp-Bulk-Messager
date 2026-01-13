import Contact from '../models/Contact.js';
import csv from 'csv-parser';
import ExcelJS from 'exceljs';
import fs from 'fs';
import { Readable } from 'stream';

/**
 * Get all contacts with pagination and filtering
 */
export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', tags = '' } = req.query;
    
    const query = { isActive: true };
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Add tags filter
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }
    
    const contacts = await Contact.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const count = await Contact.countDocuments(query);
    
    res.json({
      success: true,
      data: contacts,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message,
    });
  }
};

/**
 * Get a single contact by ID
 */
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    
    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact',
      error: error.message,
    });
  }
};

/**
 * Create a new contact
 */
export const createContact = async (req, res) => {
  try {
    const { name, phoneNumber, tags } = req.body;
    
    // Sanitize phone number
    const sanitizedPhone = Contact.sanitizePhoneNumber(phoneNumber);
    
    // Check if contact already exists
    const existingContact = await Contact.findOne({ phoneNumber: sanitizedPhone });
    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Contact with this phone number already exists',
      });
    }
    
    const contact = await Contact.create({
      name,
      phoneNumber: sanitizedPhone,
      tags: tags || [],
    });
    
    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating contact',
      error: error.message,
    });
  }
};

/**
 * Update a contact
 */
export const updateContact = async (req, res) => {
  try {
    const { name, phoneNumber, tags } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = Contact.sanitizePhoneNumber(phoneNumber);
    if (tags) updateData.tags = tags;
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    
    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact',
      error: error.message,
    });
  }
};

/**
 * Delete a contact (soft delete)
 */
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact',
      error: error.message,
    });
  }
};

/**
 * Upload contacts from CSV/Excel file
 */
export const uploadContacts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }
    
    const contacts = [];
    const errors = [];
    const duplicates = [];
    
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if (fileExtension === 'csv') {
      // Parse CSV
      const results = [];
      
      const stream = Readable.from(req.file.buffer.toString());
      
      await new Promise((resolve, reject) => {
        stream
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
      
      for (const row of results) {
        const name = row.name || row.Name || row.NAME;
        const phone = row.phone || row.phoneNumber || row.Phone || row.PhoneNumber;
        
        if (!name || !phone) {
          errors.push({ row, reason: 'Missing name or phone number' });
          continue;
        }
        
        const sanitizedPhone = Contact.sanitizePhoneNumber(phone);
        
        // Check for duplicates
        const existing = await Contact.findOne({ phoneNumber: sanitizedPhone });
        if (existing) {
          duplicates.push({ name, phoneNumber: sanitizedPhone });
          continue;
        }
        
        contacts.push({ name, phoneNumber: sanitizedPhone });
      }
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parse Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.worksheets[0];
      
      const data = [];
      if (worksheet) {
        // Get headers
        const headers = {};
        const firstRow = worksheet.getRow(1);
        firstRow.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value ? cell.value.toString() : '';
        });

        // Get data
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              const val = cell.value;
              // Handle rich text or hyperlinks if present, otherwise use value
              rowData[header] = (val && typeof val === 'object' && val.text) ? val.text : val;
            }
          });
          data.push(rowData);
        });
      }
      
      for (const row of data) {
        const name = row.name || row.Name || row.NAME;
        const phone = row.phone || row.phoneNumber || row.Phone || row.PhoneNumber;
        
        if (!name || !phone) {
          errors.push({ row, reason: 'Missing name or phone number' });
          continue;
        }
        
        const sanitizedPhone = Contact.sanitizePhoneNumber(phone.toString());
        
        // Check for duplicates
        const existing = await Contact.findOne({ phoneNumber: sanitizedPhone });
        if (existing) {
          duplicates.push({ name, phoneNumber: sanitizedPhone });
          continue;
        }
        
        contacts.push({ name, phoneNumber: sanitizedPhone });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only CSV and Excel files are supported',
      });
    }
    
    // Bulk insert contacts
    let insertedContacts = [];
    if (contacts.length > 0) {
      insertedContacts = await Contact.insertMany(contacts);
    }
    
    res.json({
      success: true,
      message: `Successfully uploaded ${insertedContacts.length} contacts`,
      data: {
        inserted: insertedContacts.length,
        duplicates: duplicates.length,
        errors: errors.length,
        duplicatesList: duplicates.slice(0, 10), // Show first 10
        errorsList: errors.slice(0, 10), // Show first 10
      },
    });
  } catch (error) {
    console.error('Error uploading contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading contacts',
      error: error.message,
    });
  }
};

/**
 * Add tags to contacts
 */
export const tagContacts = async (req, res) => {
  try {
    const { contactIds, tags } = req.body;
    
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Contact IDs are required',
      });
    }
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tags are required',
      });
    }
    
    const result = await Contact.updateMany(
      { _id: { $in: contactIds } },
      { $addToSet: { tags: { $each: tags } } }
    );
    
    res.json({
      success: true,
      message: `Tagged ${result.modifiedCount} contacts`,
      data: result,
    });
  } catch (error) {
    console.error('Error tagging contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error tagging contacts',
      error: error.message,
    });
  }
};

/**
 * Get all unique tags
 */
export const getTags = async (req, res) => {
  try {
    const tags = await Contact.distinct('tags');
    
    res.json({
      success: true,
      data: tags.filter(tag => tag), // Remove empty strings
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tags',
      error: error.message,
    });
  }
};
