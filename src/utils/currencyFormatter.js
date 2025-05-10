/**
 * Format a numeric value as a peso amount
 * @param {number} amount - The amount to format (in the smallest unit, like cents)
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} - Formatted amount without the currency symbol
 */
export const formatPeso = (amount, showDecimals = true) => {
  if (!amount && amount !== 0) return '0.00';
  
  // Convert to a number if it's not already one
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  
  // Convert from cents to whole units (e.g., from cents to dollars)
  const wholeUnits = numAmount / 100;
  
  // Format with or without decimals
  if (showDecimals) {
    return wholeUnits.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    return Math.round(wholeUnits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

/**
 * Format a number as a percentage
 * @param {number} value - The decimal value to format as percentage
 * @param {number} decimals - Number of decimal places to show
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (!value && value !== 0) return '0%';
  
  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Format a date as a string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format type: 'short', 'medium', or 'long'
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options = {
    short: { 
      month: 'numeric', 
      day: 'numeric', 
      year: '2-digit' 
    },
    medium: { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    },
    long: { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };
  
  return dateObj.toLocaleDateString('en-US', options[format] || options.medium);
}; 