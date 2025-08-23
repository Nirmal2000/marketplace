// Type definitions for the dashboard components

/**
 * @typedef {Object} UsageMetric
 * @property {string} id - Unique identifier for the metric
 * @property {string} mcp_name - Name of the MCP
 * @property {number} installs - Number of installations
 * @property {number} runs - Number of runs/executions
 * @property {number} tokens_spent - Number of tokens consumed
 * @property {number} revenue - Revenue generated
 * @property {string} date - Date string in ISO format
 */

/**
 * @typedef {Object} DateRange
 * @property {Date} start - Start date of the range
 * @property {Date} end - End date of the range
 */

/**
 * @typedef {Object} SortConfig
 * @property {string} column - Column to sort by
 * @property {'asc'|'desc'} direction - Sort direction
 */

/**
 * @typedef {Object} MCPTool
 * @property {string} name - Name of the tool
 * @property {string} description - Description of the tool
 */

/**
 * @typedef {Object} MCP
 * @property {string} id - Unique identifier
 * @property {string} user_id - User who created the MCP
 * @property {string} name - MCP name
 * @property {string} repo - GitHub repository URL
 * @property {string} branch - Git branch
 * @property {string} build_command - Build command
 * @property {string} start_command - Start command
 * @property {string} root_dir - Root directory
 * @property {string} runtime - Runtime environment
 * @property {Array} env_vars - Environment variables
 * @property {string} plan - Pricing plan
 * @property {string} render_service_id - Render service ID
 * @property {string} deploy_id - Render deployment ID
 * @property {string} deploy_url - Deployment URL
 * @property {string} status - Deployment status
 * @property {Object} input_json - Original form input
 * @property {Object} output_json - Render API response
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {Array<MCPTool>} tools - MCP tools (populated from API)
 * @property {string} description - MCP description (from tools API)
 * @property {Object} environment_variables - Environment variables (from tools API)
 * @property {number} pricing - Pricing information
 */

/**
 * Deployment status constants
 */
export const DEPLOYMENT_STATUS = {
  // Loading states
  PENDING: 'pending',
  CREATED: 'created',
  QUEUED: 'queued',
  BUILD_IN_PROGRESS: 'build_in_progress',
  UPDATE_IN_PROGRESS: 'update_in_progress',
  PRE_DEPLOY_IN_PROGRESS: 'pre_deploy_in_progress',
  
  // Success state
  LIVE: 'live',
  
  // Error states
  BUILD_FAILED: 'build_failed',
  UPDATE_FAILED: 'update_failed',
  PRE_DEPLOY_FAILED: 'pre_deploy_failed',
  CANCELED: 'canceled',
  DEACTIVATED: 'deactivated'
};

/**
 * Check if deployment status is in loading state
 * @param {string} status - Deployment status
 * @returns {boolean} - True if status is loading
 */
export const isLoadingStatus = (status) => {
  return [
    DEPLOYMENT_STATUS.PENDING,
    DEPLOYMENT_STATUS.CREATED,
    DEPLOYMENT_STATUS.QUEUED,
    DEPLOYMENT_STATUS.BUILD_IN_PROGRESS,
    DEPLOYMENT_STATUS.UPDATE_IN_PROGRESS,
    DEPLOYMENT_STATUS.PRE_DEPLOY_IN_PROGRESS
  ].includes(status);
};

/**
 * Check if deployment status is an error state
 * @param {string} status - Deployment status
 * @returns {boolean} - True if status is error
 */
export const isErrorStatus = (status) => {
  return [
    DEPLOYMENT_STATUS.BUILD_FAILED,
    DEPLOYMENT_STATUS.UPDATE_FAILED,
    DEPLOYMENT_STATUS.PRE_DEPLOY_FAILED,
    DEPLOYMENT_STATUS.CANCELED,
    DEPLOYMENT_STATUS.DEACTIVATED
  ].includes(status);
};

// Export empty object for ES6 import compatibility
export {}