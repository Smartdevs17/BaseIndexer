// src/lib/utils.ts
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { ExportOptions, ExportFormat } from './types';
import { format, format as formatDate } from 'date-fns';

// Format address for display (truncate middle)
export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format timestamp to human-readable date
export const formatTimestamp = (timestamp: number): string => {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
};

// Format timestamp to relative time (e.g. "2 mins ago")
export const formatRelativeTime = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  
  return formatTimestamp(timestamp);
};

// Format large numbers with commas
export const formatNumber = (num: number | string): string => {
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num;
  return parsedNum.toLocaleString();
};

// Format currency values (ETH)
export const formatEth = (value: string | number): string => {
  const parsedValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(parsedValue)) return '0 ETH';
  
  if (parsedValue < 0.00001) {
    return parsedValue.toExponential(4) + ' ETH';
  }
  
  if (parsedValue < 1) {
    return parsedValue.toFixed(6) + ' ETH';
  }
  
  return parsedValue.toFixed(4) + ' ETH';
};

// Simple search function for addresses, txs, blocks (for UI filtering)
export const searchData = <T extends { [key: string]: any }>(
  data: T[],
  searchTerm: string,
  fields: string[]
): T[] => {
  if (!searchTerm) return data;
  
  const term = searchTerm.toLowerCase();
  return data.filter(item => 
    fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

// Export data to different formats
export const exportData = ({ format, fileName, data }: ExportOptions): void => {
  const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HH-mm');
  const fullFileName = `${fileName}_${timestamp}`;
  
  switch (format) {
    case 'csv':
      exportToCsv(data, fullFileName);
      break;
    case 'xlsx':
      exportToXlsx(data, fullFileName);
      break;
    case 'json':
      exportToJson(data, fullFileName);
      break;
    default:
      console.error('Unsupported export format');
  }
};

// Export to CSV
const exportToCsv = (data: any[], fileName: string): void => {
  if (!data.length) return;
  
  // Get headers from first item
  const headers = Object.keys(data[0]);
  
  // Convert to CSV rows
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const cell = row[header]?.toString() || '';
        // Escape commas and quotes
        return cell.includes(',') || cell.includes('"') 
          ? `"${cell.replace(/"/g, '""')}"` 
          : cell;
      }).join(',')
    )
  ];
  
  const csvContent = csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}.csv`);
};

// Export to XLSX
const exportToXlsx = (data: any[], fileName: string): void => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Generate blob and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${fileName}.xlsx`);
};

// Export to JSON
const exportToJson = (data: any[], fileName: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  saveAs(blob, `${fileName}.json`);
};

// Clipboard functionality
export const copyToClipboard = (text: string): Promise<boolean> => {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
};

// Calculate transaction fee
export const calculateTxFee = (gasUsed: string, gasPrice: string): string => {
  const gasUsedNum = parseFloat(gasUsed.replace(/,/g, ''));
  const gasPriceNum = parseFloat(gasPrice.split(' ')[0]);
  const feeInGwei = gasUsedNum * gasPriceNum;
  const feeInEth = feeInGwei / 1000000000;
  return formatEth(feeInEth);
};

// Generate a deterministic color based on address (for visual representation)
export const getAddressColor = (address: string): string => {
  if (!address || address.length < 6) return '#6366f1'; // Default color
  
  // Take last 6 chars of address for hex color
  const colorHex = address.slice(-6);
  
  // Ensure decent contrast by adjusting lightness
  const r = parseInt(colorHex.slice(0, 2), 16);
  const g = parseInt(colorHex.slice(2, 4), 16);
  const b = parseInt(colorHex.slice(4, 6), 16);
  
  // Calculate perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // If too dark or too light, adjust
  if (brightness < 50) {
    return `#${colorHex}8a`; // Add some opacity to lighten
  } else if (brightness > 200) {
    return `#${colorHex}dd`; // Darken slightly
  }
  
  return `#${colorHex}`;
};

// Helper to truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format bytes to human-readable size
export const formatBytes = (bytes: string | number): string => {
  const parsedBytes = typeof bytes === 'string' ? 
    parseInt(bytes.replace(/[^\d]/g, '')) : bytes;
  
  if (isNaN(parsedBytes) || parsedBytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(parsedBytes) / Math.log(k));
  
  return parseFloat((parsedBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};